export const BILLING_DATA_LOAD = "BILLING_DATA_LOAD";
export const BILLING_DATA_LOAD_SUCCESS = "BILLING_DATA_LOAD_SUCCESS";
export const BILLING_DATA_LOAD_FAILURE = "BILLING_DATA_LOAD_FAILURE";

export const UPDATE_BILLING_CONTACT = "UPDATE_BILLING_CONTACT";
export const UPDATE_BILLING_CONTACT_SUCCESS = "UPDATE_BILLING_CONTACT_SUCCESS";
export const UPDATE_BILLING_CONTACT_FAILURE = "UPDATE_BILLING_CONTACT_FAILURE";

export const ADD_PAYMENT_METHOD = "ADD_PAYMENT_METHOD";
export const ADD_PAYMENT_METHOD_SUCCESS = "ADD_PAYMENT_METHOD_SUCCESS";
export const ADD_PAYMENT_METHOD_FAILURE = "ADD_PAYMENT_METHOD_FAILURE";

export const REMOVE_PAYMENT_METHOD = "REMOVE_PAYMENT_METHOD";
export const REMOVE_PAYMENT_METHOD_SUCCESS = "REMOVE_PAYMENT_METHOD_SUCCESS";
export const REMOVE_PAYMENT_METHOD_FAILURE = "REMOVE_PAYMENT_METHOD_FAILURE";

export const SET_DEFAULT_PAYMENT_METHOD = "SET_DEFAULT_PAYMENT_METHOD";
export const SET_DEFAULT_PAYMENT_METHOD_SUCCESS = "SET_DEFAULT_PAYMENT_METHOD_SUCCESS";
export const SET_DEFAULT_PAYMENT_METHOD_FAILURE = "SET_DEFAULT_PAYMENT_METHOD_FAILURE";

export const REQUEST_PLAN_CHANGE = "REQUEST_PLAN_CHANGE";
export const REQUEST_PLAN_CHANGE_SUCCESS = "REQUEST_PLAN_CHANGE_SUCCESS";
export const REQUEST_PLAN_CHANGE_FAILURE = "REQUEST_PLAN_CHANGE_FAILURE";

export const APPLY_PROMO_CODE = "APPLY_PROMO_CODE";
export const APPLY_PROMO_CODE_SUCCESS = "APPLY_PROMO_CODE_SUCCESS";
export const APPLY_PROMO_CODE_FAILURE = "APPLY_PROMO_CODE_FAILURE";

export const FETCH_INVOICES = "FETCH_INVOICES";
export const FETCH_INVOICES_SUCCESS = "FETCH_INVOICES_SUCCESS";
export const FETCH_INVOICES_FAILURE = "FETCH_INVOICES_FAILURE";

export const FETCH_USAGE_RECORDS = "FETCH_USAGE_RECORDS";
export const FETCH_USAGE_RECORDS_SUCCESS = "FETCH_USAGE_RECORDS_SUCCESS";
export const FETCH_USAGE_RECORDS_FAILURE = "FETCH_USAGE_RECORDS_FAILURE";

export const GEMINI_ANALYZE_USAGE = "GEMINI_ANALYZE_USAGE";
export const GEMINI_ANALYZE_USAGE_SUCCESS = "GEMINI_ANALYZE_USAGE_SUCCESS";
export const GEMINI_ANALYZE_USAGE_FAILURE = "GEMINI_ANALYZE_USAGE_FAILURE";

export const GEMINI_RECOMMEND_PLAN = "GEMINI_RECOMMEND_PLAN";
export const GEMINI_RECOMMEND_PLAN_SUCCESS = "GEMINI_RECOMMEND_PLAN_SUCCESS";
export const GEMINI_RECOMMEND_PLAN_FAILURE = "GEMINI_RECOMMEND_PLAN_FAILURE";

export const GEMINI_PREDICT_CHURN = "GEMINI_PREDICT_CHURN";
export const GEMINI_PREDICT_CHURN_SUCCESS = "GEMINI_PREDICT_CHURN_SUCCESS";
export const GEMINI_PREDICT_CHURN_FAILURE = "GEMINI_PREDICT_CHURN_FAILURE";

export const UPDATE_BILLING_PREFERENCES = "UPDATE_BILLING_PREFERENCES";
export const UPDATE_BILLING_PREFERENCES_SUCCESS = "UPDATE_BILLING_PREFERENCES_SUCCESS";
export const UPDATE_BILLING_PREFERENCES_FAILURE = "UPDATE_BILLING_PREFERENCES_FAILURE";

/**
 * Represents a generic action that can be dispatched within the Gemini-infused system.
 * Gemini conceptually manages and interprets these actions to drive state changes.
 */
type GeminiAction = {
  type: string;
  payload?: any;
  error?: boolean;
  meta?: {
    geminiDecisionId?: string;
    timestamp?: string;
  };
};

/**
 * A dispatcher function, conceptualized as an internal Gemini mechanism
 * for propagating state changes or system events. Gemini itself might
 * call this to update the application's view of its internal state.
 */
type GeminiDispatcher = (action: GeminiAction) => void;

/**
 * Defines various credit and debit card networks supported by the billing system.
 * Gemini can intelligently infer network from card numbers and apply specific
 * processing rules based on this categorization.
 */
export enum CardNetwork {
  Visa = "VISA",
  Mastercard = "MC",
  AmericanExpress = "AMEX",
  Discover = "DISC",
  UnionPay = "UNIONPAY",
  JCB = "JCB",
  Unknown = "UNKNOWN",
}

/**
 * Represents the type of payment method.
 * Gemini can categorize and prioritize payment methods based on type, e.g.,
 * preferring direct debit for large transactions or cards for recurring micro-payments.
 */
export enum PaymentMethodType {
  CreditCard = "CREDIT_CARD",
  DebitCard = "DEBIT_CARD",
  BankAccount = "BANK_ACCOUNT",
  PayPal = "PAYPAL",
  CryptoWallet = "CRYPTO_WALLET",
  Other = "OTHER",
}

/**
 * Defines possible states for a payment method.
 * Gemini monitors these states to ensure seamless billing operations.
 */
export enum PaymentMethodStatus {
  Active = "ACTIVE",
  Expired = "EXPIRED",
  Invalid = "INVALID",
  PendingVerification = "PENDING_VERIFICATION",
  Removed = "REMOVED",
}

/**
 * Represents a contact person for billing-related communications.
 * Gemini can prioritize contacts based on their role or primary status
 * when sending notifications or seeking approvals.
 */
export interface BillingContact {
  id: string; // Unique identifier for the contact
  name: string;
  email: string;
  role: "Primary" | "Technical" | "Financial" | "Administrative" | "Other";
  isPrimary: boolean; // Indicates if this is the main billing contact
  path: string | null; // A conceptual path for internal routing within Gemini's system
  notificationPreferences: {
    invoiceDue: boolean;
    paymentConfirmation: boolean;
    usageAlerts: boolean;
    marketing: boolean;
  };
  geminiPersonaTag?: string; // Gemini's classification of this contact's communication style
}

/**
 * Represents a detailed invoice item.
 * Gemini can analyze these items for cost optimization suggestions or anomaly detection.
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  line_item_id: string;
  period_start_date?: string;
  period_end_date?: string;
  tax_rate?: number;
  discount_applied?: number;
}

/**
 * Represents a full invoice.
 * Gemini uses this data for financial reconciliation, reporting, and predictive analytics.
 */
export interface InvoiceDetail {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  total_amount: number;
  currency: string;
  status: "Paid" | "Due" | "Overdue" | "Void";
  items: Array<InvoiceItem>;
  payment_method_id?: string;
  pdf_url?: string;
  gemini_anomaly_score?: number; // Gemini's assessment of unusual patterns in this invoice
}

/**
 * Represents a detailed subscription plan.
 * Gemini can analyze plan features against usage patterns to recommend upgrades or downgrades.
 */
export interface SubscriptionPlan {
  plan_id: string;
  plan_name: string;
  description: string;
  price_model: "Flat" | "Tiered" | "Usage-based" | "Freemium";
  base_price: number;
  currency: string;
  features: Array<string>;
  renewal_period: "Monthly" | "Annually" | "Quarterly";
  trial_days?: number;
  can_self_serve_change: boolean;
  gemini_recommended_usage_tiers?: {
    tier_name: string;
    min_usage: number;
    max_usage: number | null;
  }[]; // Gemini's insights into optimal usage tiers for this plan
}

/**
 * Represents granular usage data.
 * Gemini aggregates and analyzes these records for billing, forecasting, and anomaly detection.
 */
export interface UsageRecord {
  record_id: string;
  metric_name: string;
  usage_value: number;
  unit_of_measure: string;
  timestamp: string;
  associated_resource_id?: string;
  gemini_anomaly_flag?: boolean; // True if Gemini detects unusual usage for this record
}

/**
 * Represents a generic payment method.
 * Gemini orchestrates the lifecycle of these methods, including validation,
 * tokenization, and secure storage.
 */
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  status: PaymentMethodStatus;
  is_default: boolean;
  created_at: string;
  last_used_at?: string;
  details: {
    // Specific details for each type, e.g., last4 for card, bank name for bank account
    [key: string]: any;
  };
  gemini_risk_score?: number; // Gemini's assessment of the risk associated with this payment method
}

/**
 * Represents detailed subscription settings managed by Gemini.
 * This includes current plans, future charges, billing contacts, and historical data.
 * Gemini continuously monitors these settings for optimization and alerts.
 */
export interface OrdwaySubscriptionSettings {
  plan_id: string;
  is_active_subscription: boolean;
  next_charge_date: string | null;
  billing_contacts: Array<BillingContact>;
  self_serve_plan_id: string; // ID of the plan currently set for self-service changes
  invoices: Array<InvoiceDetail>;
  current_plan_details?: SubscriptionPlan;
  payment_method_id?: string; // Default payment method for this subscription
  renewal_terms?: {
    auto_renew: boolean;
    renewal_period: "Monthly" | "Annually";
    notice_period_days: number;
  };
  cancellation_date?: string | null;
  gemini_churn_prediction?: {
    risk_score: number; // 0-100, higher means higher risk
    reasons: string[];
    mitigation_suggestions: string[];
  }; // Gemini's prediction on churn
  gemini_cost_optimization_suggestions?: string[]; // Gemini's suggestions to reduce billing costs
}

/**
 * Aggregated billing data managed and enriched by Gemini.
 * This interface provides a holistic view, including payment methods,
 * subscription details, usage statistics, and AI-driven insights.
 */
export interface BillingData {
  user_id: string;
  billing_settings?: {
    last4: string; // Last 4 digits of the primary card
    network: CardNetwork;
    expiry: string; // Expiry date of the primary card (MM/YY)
  };
  payment_methods?: Array<PaymentMethod>;
  ordway_subscription_settings?: OrdwaySubscriptionSettings;
  can_view_billing_usage?: boolean; // User permission to view detailed usage
  gemini_billing_insights?: {
    last_analysis_date: string;
    overall_sentiment: "Positive" | "Neutral" | "Negative"; // Gemini's sentiment on billing health
    key_highlights: string[];
    actionable_recommendations: Array<{
      recommendation_id: string;
      description: string;
      priority: "High" | "Medium" | "Low";
      impact_estimate: string;
      gemini_confidence_score: number; // Gemini's confidence in this recommendation
    }>;
  };
  recent_usage_summary?: {
    period: string;
    total_cost: number;
    currency: string;
    top_metrics: Array<{ metric: string; value: number }>;
    gemini_usage_pattern_detected?: string; // E.g., "bursty," "steady growth," "seasonal peak"
  };
  billing_address?: BillingAddress;
  tax_information?: {
    vat_number?: string;
    tax_exempt?: boolean;
    country_code?: string;
  };
}

/**
 * Represents a billing address. Gemini can validate and geocode addresses.
 */
export interface BillingAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  gemini_validation_status?: "Valid" | "Invalid" | "PartiallyValid";
  gemini_validation_message?: string;
}

/**
 * Represents a structure for pagination requests.
 * Gemini can use this to optimize data retrieval from backend systems.
 */
export interface Pagination {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/**
 * Action type for updating billing contacts.
 */
export interface UpdateBillingContactAction {
  type: typeof UPDATE_BILLING_CONTACT;
  billingContacts: Array<BillingContact>;
}

/**
 * Action type for successfully updating billing contacts.
 */
export interface UpdateBillingContactSuccessAction {
  type: typeof UPDATE_BILLING_CONTACT_SUCCESS;
  payload: Array<BillingContact>;
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for failed billing contact update.
 */
export interface UpdateBillingContactFailureAction {
  type: typeof UPDATE_BILLING_CONTACT_FAILURE;
  payload: {
    message: string;
  };
  error: true;
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for loading billing data.
 */
export interface LoadBillingDataAction {
  type: typeof BILLING_DATA_LOAD;
  userId: string;
}

/**
 * Action type for successful billing data load.
 */
export interface LoadBillingDataSuccessAction {
  type: typeof BILLING_DATA_LOAD_SUCCESS;
  payload: BillingData;
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for failed billing data load.
 */
export interface LoadBillingDataFailureAction {
  type: typeof BILLING_DATA_LOAD_FAILURE;
  payload: {
    message: string;
  };
  error: true;
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for adding a payment method.
 */
export interface AddPaymentMethodAction {
  type: typeof ADD_PAYMENT_METHOD;
  userId: string;
  paymentDetails: PaymentMethod;
}

/**
 * Action type for successful addition of a payment method.
 */
export interface AddPaymentMethodSuccessAction {
  type: typeof ADD_PAYMENT_METHOD_SUCCESS;
  payload: PaymentMethod;
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for failed addition of a payment method.
 */
export interface AddPaymentMethodFailureAction {
  type: typeof ADD_PAYMENT_METHOD_FAILURE;
  payload: {
    message: string;
  };
  error: true;
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for setting default payment method.
 */
export interface SetDefaultPaymentMethodAction {
  type: typeof SET_DEFAULT_PAYMENT_METHOD;
  userId: string;
  paymentMethodId: string;
}

/**
 * Action type for successful setting of default payment method.
 */
export interface SetDefaultPaymentMethodSuccessAction {
  type: typeof SET_DEFAULT_PAYMENT_METHOD_SUCCESS;
  payload: {
    paymentMethodId: string;
  };
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for failed setting of default payment method.
 */
export interface SetDefaultPaymentMethodFailureAction {
  type: typeof SET_DEFAULT_PAYMENT_METHOD_FAILURE;
  payload: {
    message: string;
  };
  error: true;
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for requesting a plan change.
 */
export interface RequestPlanChangeAction {
  type: typeof REQUEST_PLAN_CHANGE;
  userId: string;
  newPlanId: string;
  currentPlanId: string;
}

/**
 * Action type for successful plan change request.
 */
export interface RequestPlanChangeSuccessAction {
  type: typeof REQUEST_PLAN_CHANGE_SUCCESS;
  payload: {
    newPlanId: string;
    currentPlanId: string;
    estimatedCostImpact: string;
  };
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Action type for failed plan change request.
 */
export interface RequestPlanChangeFailureAction {
  type: typeof REQUEST_PLAN_CHANGE_FAILURE;
  payload: {
    message: string;
  };
  error: true;
  meta: {
    geminiDecisionId: string;
    timestamp: string;
  };
}

/**
 * Represents the total set of possible actions that Gemini might dispatch
 * related to billing.
 */
export type BillingActionTypes =
  | UpdateBillingContactAction
  | UpdateBillingContactSuccessAction
  | UpdateBillingContactFailureAction
  | LoadBillingDataAction
  | LoadBillingDataSuccessAction
  | LoadBillingDataFailureAction
  | AddPaymentMethodAction
  | AddPaymentMethodSuccessAction
  | AddPaymentMethodFailureAction
  | SetDefaultPaymentMethodAction
  | SetDefaultPaymentMethodSuccessAction
  | SetDefaultPaymentMethodFailureAction
  | RequestPlanChangeAction
  | RequestPlanChangeSuccessAction
  | RequestPlanChangeFailureAction;

/**
 * Gemini's internal conceptual logging and audit trail mechanism.
 * All significant decisions and operations are logged here.
 */
interface GeminiAuditLogEntry {
  geminiDecisionId: string;
  timestamp: string;
  eventType: string; // E.g., "USER_ACTION", "AI_PREDICTION", "SYSTEM_ERROR"
  description: string;
  context: Record<string, any>;
  outcome: "Success" | "Failure" | "Pending";
  riskScore?: number; // Gemini's assessment of operational risk for this event
}

/**
 * Global array to conceptually store Gemini's audit trail.
 * In a real system, this would be persisted and monitored.
 */
export const geminiAuditTrail: Array<GeminiAuditLogEntry> = [];

/**
 * Generates a unique ID for Gemini's internal decision-making process.
 * This ID links actions, outcomes, and audit logs.
 */
function generateGeminiDecisionId(): string {
  return `GEMINI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Helper function to simulate a Gemini AI processing delay and outcome.
 * This function encapsulates the "black box" nature of Gemini's complex operations.
 * @param successRate The probability of the operation succeeding (0-1).
 * @param delay The simulated processing time in milliseconds.
 * @param successPayload Data to return on success.
 * @param failureMessage Message to return on failure.
 */
async function simulateGeminiAIProcessing<T>(
  successRate: number,
  delay: number,
  successPayload: T,
  failureMessage: string,
): Promise<{ success: boolean; data?: T; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < successRate) {
        resolve({ success: true, data: successPayload });
      } else {
        resolve({ success: false, error: failureMessage });
      }
    }, delay);
  });
}

/**
 * Creates an action to update billing contacts. This is a simple action creator
 * that forms part of the Gemini dispatchable actions.
 * @param billingContacts An array of `BillingContact` objects.
 */
export function updateBillingContact(
  billingContacts: Array<BillingContact>,
): UpdateBillingContactAction {
  return {
    type: UPDATE_BILLING_CONTACT,
    billingContacts,
  };
}

/**
 * Represents a thunk-like function signature for Gemini-orchestrated dispatches.
 * Gemini conceptually manages the asynchronous flow and the final dispatch.
 */
export type UpdateBillingContactDispatchFn = (
  dispatch: GeminiDispatcher,
) => Promise<void>;

/**
 * This function is fully "Gemini-infused," meaning its logic is conceptualized as being
 * orchestrated and executed by Gemini. It removes traditional dependencies like network
 * request libraries, state management dispatchers, and external error providers.
 * Instead, it simulates Gemini's internal process for handling a request to update billing contacts.
 *
 * Gemini's AI core first validates the input, then conceptually interacts with a "Billing System Adapter,"
 * and finally determines the outcome and dispatches relevant actions. It also generates an audit trail.
 *
 * @param contacts The array of `BillingContact` objects to be updated.
 * @param dispatchError A function (conceptualized as managed by Gemini) to dispatch error messages.
 * @returns A function that takes a GeminiDispatcher and executes the conceptual update process.
 */
export function updateBillingContactsGemini(
  contacts: Array<BillingContact>,
  dispatchError: (message: string) => void,
) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: "Attempting to update billing contacts.",
      context: { contactsCount: contacts?.length },
      outcome: "Pending",
    });

    try {
      // Step 1: Gemini's initial validation and reasoning.
      // Gemini's internal decision-making process assesses the input `contacts`.
      // It uses sophisticated pattern recognition and data validation algorithms.
      if (!contacts || contacts.length === 0) {
        const errorMessage = "Gemini determined: contacts array is empty or invalid for update.";
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "AI_VALIDATION_FAILURE",
          description: errorMessage,
          context: { input: contacts },
          outcome: "Failure",
        });
        dispatchError(errorMessage);
        dispatch({
          type: UPDATE_BILLING_CONTACT_FAILURE,
          payload: { message: errorMessage },
          error: true,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
        return;
      }

      // Simulate Gemini's deeper processing:
      // - Contact email format validation
      // - Cross-referencing against existing user data (conceptual)
      // - Identifying primary contact conflicts
      const validationPromises = contacts.map(async (contact) => {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
        if (!isValidEmail) {
          return {
            id: contact.id,
            valid: false,
            reason: "Invalid email format detected by Gemini.",
          };
        }
        // Simulate Gemini checking for existing contacts or potential duplicates
        const existingContactCheck = await simulateGeminiAIProcessing(
          0.98,
          50,
          true,
          "Gemini detected potential duplicate contact.",
        );
        if (!existingContactCheck.success) {
          return {
            id: contact.id,
            valid: false,
            reason: existingContactCheck.error,
          };
        }
        return { id: contact.id, valid: true };
      });

      const validationResults = await Promise.all(validationPromises);
      const invalidContacts = validationResults.filter((res) => !res.valid);

      if (invalidContacts.length > 0) {
        const errorMessages = invalidContacts
          .map((c) => `Contact ID ${c.id}: ${c.reason}`)
          .join("; ");
        const errorMessage = `Gemini identified issues with some contacts: ${errorMessages}`;
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "AI_VALIDATION_FAILURE",
          description: errorMessage,
          context: { invalidContacts },
          outcome: "Failure",
        });
        dispatchError(errorMessage);
        dispatch({
          type: UPDATE_BILLING_CONTACT_FAILURE,
          payload: { message: errorMessage },
          error: true,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
        return;
      }

      // Step 2: Gemini orchestrates the actual update.
      // This is where Gemini would conceptually call an external "tool" or an internal
      // module responsible for persisting the billing contact changes in the backend system.
      // Gemini performs risk assessment before committing changes.
      const geminiProcessedResult = await simulateGeminiAIProcessing(
        0.95, // 95% success rate for a standard update, Gemini aims for high reliability
        500, // Simulate Gemini's processing time for complex operations
        contacts,
        "Gemini encountered a core system error while attempting to persist contact changes.",
      );

      if (geminiProcessedResult.success && geminiProcessedResult.data) {
        // If Gemini reports success, it conceptually triggers an action
        // that updates the application's state, all within the Gemini paradigm.
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "SYSTEM_UPDATE_SUCCESS",
          description: "Billing contacts successfully updated.",
          context: { updatedContacts: geminiProcessedResult.data.map((c) => c.id) },
          outcome: "Success",
        });
        dispatch({
          type: UPDATE_BILLING_CONTACT_SUCCESS,
          payload: geminiProcessedResult.data,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      } else {
        // If Gemini reports an error, it uses the provided error dispatcher
        // to communicate the issue, again, as part of its overarching control.
        const errorMessage =
          geminiProcessedResult.error ||
          "Gemini encountered an unknown issue while attempting to update billing contacts.";
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "SYSTEM_UPDATE_FAILURE",
          description: errorMessage,
          context: { originalContacts: contacts.map((c) => c.id) },
          outcome: "Failure",
        });
        dispatchError(errorMessage);
        dispatch({
          type: UPDATE_BILLING_CONTACT_FAILURE,
          payload: { message: errorMessage },
          error: true,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      }
    } catch (conceptualError: any) {
      // This catch block handles any unexpected failures in Gemini's conceptual processing itself.
      const errorMessage =
        conceptualError instanceof Error
          ? conceptualError.message
          : String(conceptualError);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "GEMINI_CORE_FAILURE",
        description: `Gemini's core processing encountered an unexpected conceptual error: ${errorMessage}`,
        context: { errorDetails: conceptualError },
        outcome: "Failure",
      });
      dispatchError(
        `Gemini's core processing encountered an unexpected conceptual error: ${errorMessage}`,
      );
      dispatch({
        type: UPDATE_BILLING_CONTACT_FAILURE,
        payload: {
          message: `Gemini's core processing encountered an unexpected error: ${errorMessage}`,
        },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates a request to Gemini to load all comprehensive billing data for a user.
 * Gemini intelligently aggregates data from various sources, performs real-time
 * AI analysis, generates insights, and formats it for presentation.
 *
 * @param userId The ID of the user for whom to load billing data.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function loadBillingDataGemini(userId: string) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `Initiating billing data load for user ${userId}.`,
      context: { userId },
      outcome: "Pending",
    });

    dispatch({
      type: BILLING_DATA_LOAD,
      userId,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Step 1: Gemini's data orchestration and retrieval.
      // Gemini conceptually interfaces with multiple backend systems (billing, usage, CRM).
      // It manages data consistency, latency, and partial failures.
      const rawBillingDataPromise = simulateGeminiAIProcessing(
        0.98,
        300,
        {
          last4: "4242",
          network: CardNetwork.Visa,
          expiry: "12/25",
        },
        "Failed to retrieve core billing settings.",
      );
      const paymentMethodsPromise = simulateGeminiAIProcessing(
        0.98,
        250,
        [
          {
            id: "pm_card_abc123",
            type: PaymentMethodType.CreditCard,
            status: PaymentMethodStatus.Active,
            is_default: true,
            created_at: new Date().toISOString(),
            details: {
              last4: "4242",
              brand: CardNetwork.Visa,
              expiry: "12/25",
            },
            gemini_risk_score: 10,
          },
          {
            id: "pm_bank_xyz789",
            type: PaymentMethodType.BankAccount,
            status: PaymentMethodStatus.PendingVerification,
            is_default: false,
            created_at: new Date().toISOString(),
            details: {
              bank_name: "Example Bank",
              account_last4: "7890",
            },
            gemini_risk_score: 5,
          },
        ],
        "Failed to retrieve payment methods.",
      );
      const subscriptionSettingsPromise = simulateGeminiAIProcessing(
        0.97,
        400,
        {
          plan_id: "premium_monthly",
          is_active_subscription: true,
          next_charge_date: "2024-07-15",
          billing_contacts: [
            {
              id: "contact_1",
              name: "Alice Smith",
              email: "alice.smith@example.com",
              role: "Primary",
              isPrimary: true,
              path: "/org/contacts/alice",
              notificationPreferences: {
                invoiceDue: true,
                paymentConfirmation: true,
                usageAlerts: false,
                marketing: false,
              },
            },
          ],
          self_serve_plan_id: "premium_monthly",
          invoices: [
            {
              id: "inv_001",
              invoice_number: "INV-2024-001",
              date: "2024-06-01",
              due_date: "2024-06-15",
              total_amount: 99.99,
              currency: "USD",
              status: "Paid",
              items: [
                {
                  description: "Premium Monthly Subscription",
                  quantity: 1,
                  unit_price: 99.99,
                  total_amount: 99.99,
                  currency: "USD",
                  line_item_id: "li_plan",
                },
              ],
            },
          ],
          current_plan_details: {
            plan_id: "premium_monthly",
            plan_name: "Premium Monthly",
            description: "Advanced features with monthly billing.",
            price_model: "Flat",
            base_price: 99.99,
            currency: "USD",
            features: ["Feature A", "Feature B", "24/7 Support"],
            renewal_period: "Monthly",
            can_self_serve_change: true,
          },
          renewal_terms: {
            auto_renew: true,
            renewal_period: "Monthly",
            notice_period_days: 7,
          },
        },
        "Failed to retrieve subscription settings.",
      );
      const usageStatsPromise = simulateGeminiAIProcessing(
        0.96,
        350,
        {
          period: "current_month",
          total_cost: 75.50,
          currency: "USD",
          top_metrics: [
            { metric: "API Calls", value: 15000 },
            { metric: "Data Storage (GB)", value: 50 },
          ],
        },
        "Failed to retrieve usage statistics.",
      );
      const billingAddressPromise = simulateGeminiAIProcessing(
        0.99,
        100,
        {
          address_line1: "123 Gemini Way",
          city: "AI City",
          state_province: "CA",
          postal_code: "90210",
          country: "USA",
          gemini_validation_status: "Valid",
        },
        "Failed to retrieve billing address.",
      );
      const taxInfoPromise = simulateGeminiAIProcessing(
        0.99,
        80,
        {
          vat_number: "US123456789",
          tax_exempt: false,
          country_code: "US",
        },
        "Failed to retrieve tax information.",
      );

      const [
        rawBillingData,
        paymentMethods,
        subscriptionSettings,
        usageStats,
        billingAddress,
        taxInfo,
      ] = await Promise.all([
        rawBillingDataPromise,
        paymentMethodsPromise,
        subscriptionSettingsPromise,
        usageStatsPromise,
        billingAddressPromise,
        taxInfoPromise,
      ]);

      // Step 2: Gemini's AI analysis and insight generation.
      // After gathering raw data, Gemini applies its advanced analytical models
      // to predict churn, suggest optimizations, and detect anomalies.
      const churnPredictionPromise = simulateGeminiAIProcessing(
        0.9,
        600,
        {
          risk_score: 15,
          reasons: ["Low feature engagement", "Competitive pricing pressure"],
          mitigation_suggestions: ["Offer personalized onboarding session"],
        },
        "Gemini failed to generate churn prediction.",
      );
      const costOptimizationPromise = simulateGeminiAIProcessing(
        0.85,
        700,
        ["Consider upgrading to annual plan for 10% savings.", "Review API usage spikes."],
        "Gemini failed to generate cost optimization suggestions.",
      );
      const usagePatternDetectionPromise = simulateGeminiAIProcessing(
        0.95,
        500,
        "Steady growth with increasing API usage.",
        "Gemini failed to detect usage patterns.",
      );

      const [churnPrediction, costOptimization, usagePattern] = await Promise.all([
        churnPredictionPromise,
        costOptimizationPromise,
        usagePatternDetectionPromise,
      ]);

      if (!rawBillingData.success || !subscriptionSettings.success) {
        throw new Error(
          rawBillingData.error ||
          subscriptionSettings.error ||
          "Gemini failed to load essential billing components.",
        );
      }

      const finalBillingData: BillingData = {
        user_id: userId,
        billing_settings: rawBillingData.data,
        payment_methods: paymentMethods.data,
        ordway_subscription_settings: {
          ...(subscriptionSettings.data as OrdwaySubscriptionSettings),
          gemini_churn_prediction: churnPrediction.success
            ? churnPrediction.data
            : undefined,
          gemini_cost_optimization_suggestions: costOptimization.success
            ? costOptimization.data
            : undefined,
        },
        can_view_billing_usage: true, // Assuming default permission
        gemini_billing_insights: {
          last_analysis_date: new Date().toISOString(),
          overall_sentiment:
            (churnPrediction.data?.risk_score || 0) > 30 ? "Negative" : "Positive",
          key_highlights: [
            "Subscription active",
            `Next charge on ${subscriptionSettings.data?.next_charge_date}`,
            ...(costOptimization.data || []),
          ],
          actionable_recommendations: [
            ...(churnPrediction.data?.mitigation_suggestions || []).map((s, i) => ({
              recommendation_id: `churn_rec_${i}`,
              description: s,
              priority: "High" as "High",
              impact_estimate: "High",
              gemini_confidence_score: 0.9,
            })),
            ...(costOptimization.data || []).map((s, i) => ({
              recommendation_id: `cost_rec_${i}`,
              description: s,
              priority: "Medium" as "Medium",
              impact_estimate: "Medium",
              gemini_confidence_score: 0.85,
            })),
          ],
        },
        recent_usage_summary: usageStats.success
          ? {
            ...usageStats.data,
            gemini_usage_pattern_detected: usagePattern.data,
          }
          : undefined,
        billing_address: billingAddress.data,
        tax_information: taxInfo.data,
      };

      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "DATA_LOAD_SUCCESS",
        description: `Billing data successfully loaded and analyzed for user ${userId}.`,
        context: { userId, insightsGenerated: true },
        outcome: "Success",
      });
      dispatch({
        type: BILLING_DATA_LOAD_SUCCESS,
        payload: finalBillingData,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "DATA_LOAD_FAILURE",
        description: `Failed to load billing data for user ${userId}: ${errorMessage}`,
        context: { userId, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: BILLING_DATA_LOAD_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates a request to Gemini to add a new payment method for a user.
 * Gemini handles the secure processing, validation, tokenization (conceptual),
 * and storage of the new payment method.
 *
 * @param userId The ID of the user.
 * @param paymentDetails The details of the payment method to add.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function addPaymentMethodGemini(userId: string, paymentDetails: PaymentMethod) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `Attempting to add new payment method for user ${userId}.`,
      context: { userId, paymentType: paymentDetails.type },
      outcome: "Pending",
    });

    dispatch({
      type: ADD_PAYMENT_METHOD,
      userId,
      paymentDetails,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Step 1: Gemini's enhanced security and validation.
      // Gemini uses advanced heuristics to assess the legitimacy and completeness of payment details.
      // It would conceptually interact with a "Payment Gateway Adapter" for tokenization.
      if (!paymentDetails.type || !paymentDetails.details) {
        throw new Error("Gemini determined: Payment method type or details are missing.");
      }
      if (
        paymentDetails.type === PaymentMethodType.CreditCard &&
        (!paymentDetails.details.last4 || !paymentDetails.details.expiry)
      ) {
        throw new Error("Gemini determined: Missing essential credit card details.");
      }

      // Simulate Gemini's tokenization and external validation (e.g., PCI compliance checks)
      const tokenizationResult = await simulateGeminiAIProcessing(
        0.99,
        400,
        {
          ...paymentDetails,
          id: `pm_${paymentDetails.type.toLowerCase()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          status: PaymentMethodStatus.Active,
          created_at: new Date().toISOString(),
          gemini_risk_score: 5, // Gemini assesses a low initial risk score
        },
        "Gemini failed during payment method tokenization or external validation.",
      );

      if (!tokenizationResult.success || !tokenizationResult.data) {
        throw new Error(
          tokenizationResult.error ||
          "Gemini failed to securely process the payment method.",
        );
      }

      // Step 2: Gemini updates the internal billing profile.
      // Gemini orchestrates the update to the user's billing data, ensuring consistency.
      const updateBillingProfileResult = await simulateGeminiAIProcessing(
        0.95,
        300,
        tokenizationResult.data,
        "Gemini encountered an error updating the user's billing profile with the new payment method.",
      );

      if (updateBillingProfileResult.success && updateBillingProfileResult.data) {
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "PAYMENT_METHOD_ADD_SUCCESS",
          description: `Payment method ${updateBillingProfileResult.data.id} successfully added for user ${userId}.`,
          context: {
            userId,
            paymentMethodId: updateBillingProfileResult.data.id,
          },
          outcome: "Success",
        });
        dispatch({
          type: ADD_PAYMENT_METHOD_SUCCESS,
          payload: updateBillingProfileResult.data,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      } else {
        throw new Error(
          updateBillingProfileResult.error || "Gemini failed to finalize payment method addition.",
        );
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "PAYMENT_METHOD_ADD_FAILURE",
        description: `Failed to add payment method for user ${userId}: ${errorMessage}`,
        context: { userId, error: errorMessage, paymentType: paymentDetails.type },
        outcome: "Failure",
      });
      dispatch({
        type: ADD_PAYMENT_METHOD_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates a request to Gemini to set a specified payment method as default for a user.
 * Gemini validates the request and ensures the payment method is active before setting it as default.
 *
 * @param userId The ID of the user.
 * @param paymentMethodId The ID of the payment method to set as default.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function setDefaultPaymentMethodGemini(userId: string, paymentMethodId: string) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `Attempting to set default payment method ${paymentMethodId} for user ${userId}.`,
      context: { userId, paymentMethodId },
      outcome: "Pending",
    });

    dispatch({
      type: SET_DEFAULT_PAYMENT_METHOD,
      userId,
      paymentMethodId,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Step 1: Gemini's intelligent validation.
      // Gemini checks if the payment method exists and is in an 'Active' state.
      const validationResult = await simulateGeminiAIProcessing(
        0.98,
        150,
        true,
        "Gemini determined: Payment method not found or is inactive.",
      );

      if (!validationResult.success) {
        throw new Error(
          validationResult.error || "Gemini failed to validate the payment method.",
        );
      }

      // Step 2: Gemini orchestrates the update to set the default.
      const updateResult = await simulateGeminiAIProcessing(
        0.95,
        250,
        { paymentMethodId },
        "Gemini encountered an error while updating the default payment method.",
      );

      if (updateResult.success && updateResult.data) {
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "DEFAULT_PAYMENT_METHOD_SET_SUCCESS",
          description: `Default payment method successfully set to ${paymentMethodId} for user ${userId}.`,
          context: { userId, paymentMethodId: updateResult.data.paymentMethodId },
          outcome: "Success",
        });
        dispatch({
          type: SET_DEFAULT_PAYMENT_METHOD_SUCCESS,
          payload: updateResult.data,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      } else {
        throw new Error(
          updateResult.error ||
          "Gemini failed to finalize setting the default payment method.",
        );
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "DEFAULT_PAYMENT_METHOD_SET_FAILURE",
        description: `Failed to set default payment method ${paymentMethodId} for user ${userId}: ${errorMessage}`,
        context: { userId, paymentMethodId, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: SET_DEFAULT_PAYMENT_METHOD_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates a request for Gemini to manage a subscription plan change.
 * Gemini performs an impact analysis, simulates potential costs, and orchestrates
 * the complex backend operations required for a plan migration.
 *
 * @param userId The ID of the user.
 * @param newPlanId The ID of the desired new subscription plan.
 * @param currentPlanId The ID of the user's current subscription plan.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function requestSubscriptionPlanChangeGemini(
  userId: string,
  newPlanId: string,
  currentPlanId: string,
) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `User ${userId} requesting subscription plan change from ${currentPlanId} to ${newPlanId}.`,
      context: { userId, currentPlanId, newPlanId },
      outcome: "Pending",
    });

    dispatch({
      type: REQUEST_PLAN_CHANGE,
      userId,
      newPlanId,
      currentPlanId,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Step 1: Gemini's predictive analytics for plan change impact.
      // Gemini models the user's past usage against the new plan's pricing structure
      // to provide an estimated cost impact and potential benefits.
      const impactAnalysisResult = await simulateGeminiAIProcessing(
        0.98,
        800,
        {
          estimatedCostImpact: "Monthly cost will increase by $20, but unlocks 2x API capacity.",
          migrationRisks: [],
          recommendedMigrationSteps: ["Review new terms & conditions"],
        },
        "Gemini failed to perform comprehensive impact analysis for plan change.",
      );

      if (!impactAnalysisResult.success || !impactAnalysisResult.data) {
        throw new Error(
          impactAnalysisResult.error || "Gemini could not complete plan change analysis.",
        );
      }

      // Step 2: Gemini orchestrates the actual plan migration in the backend.
      // This might involve prorating current billing cycle, updating subscription records,
      // and activating new features.
      const migrationResult = await simulateGeminiAIProcessing(
        0.9, // Lower success rate due to complexity of plan migration
        1200,
        { newPlanId, currentPlanId, estimatedCostImpact: impactAnalysisResult.data.estimatedCostImpact },
        "Gemini encountered a critical error during subscription migration.",
      );

      if (migrationResult.success && migrationResult.data) {
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "PLAN_CHANGE_SUCCESS",
          description: `Subscription plan for user ${userId} successfully changed to ${newPlanId}.`,
          context: { userId, ...migrationResult.data },
          outcome: "Success",
        });
        dispatch({
          type: REQUEST_PLAN_CHANGE_SUCCESS,
          payload: migrationResult.data,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      } else {
        throw new Error(
          migrationResult.error || "Gemini failed to finalize the subscription plan change.",
        );
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "PLAN_CHANGE_FAILURE",
        description: `Failed to change plan for user ${userId} to ${newPlanId}: ${errorMessage}`,
        context: { userId, currentPlanId, newPlanId, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: REQUEST_PLAN_CHANGE_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates a request for Gemini to apply a promotional code to a user's account.
 * Gemini validates the promo code against active campaigns, checks eligibility,
 * and calculates the discount before applying.
 *
 * @param userId The ID of the user.
 * @param promoCode The promotional code to apply.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function applyPromoCodeGemini(userId: string, promoCode: string) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `User ${userId} attempting to apply promo code: ${promoCode}.`,
      context: { userId, promoCode },
      outcome: "Pending",
    });

    dispatch({
      type: APPLY_PROMO_CODE,
      userId,
      promoCode,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Step 1: Gemini's smart validation of the promo code.
      // Gemini would check:
      // - If the code exists and is active.
      // - If the user is eligible (e.g., not already used, subscription type).
      // - The discount type and value.
      const validationResult = await simulateGeminiAIProcessing(
        0.9,
        300,
        {
          isValid: true,
          discountAmount: 25.0,
          discountType: "Percentage",
          validUntil: "2025-12-31",
        },
        "Gemini determined: Invalid, expired, or ineligible promo code.",
      );

      if (!validationResult.success || !validationResult.data?.isValid) {
        throw new Error(
          validationResult.error || "Gemini failed to validate the promo code.",
        );
      }

      // Step 2: Gemini orchestrates the application of the discount.
      // This might involve creating a credit, adjusting the next invoice, or updating the subscription price.
      const applicationResult = await simulateGeminiAIProcessing(
        0.95,
        500,
        {
          promoCode,
          discountApplied: validationResult.data.discountAmount,
          newNextChargeAmount: 74.99, // Example: 99.99 - 25.00
        },
        "Gemini encountered an error applying the promo code to the account.",
      );

      if (applicationResult.success && applicationResult.data) {
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "PROMO_CODE_APPLY_SUCCESS",
          description: `Promo code ${promoCode} successfully applied for user ${userId}.`,
          context: { userId, ...applicationResult.data },
          outcome: "Success",
        });
        dispatch({
          type: APPLY_PROMO_CODE_SUCCESS,
          payload: applicationResult.data,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      } else {
        throw new Error(
          applicationResult.error || "Gemini failed to finalize promo code application.",
        );
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "PROMO_CODE_APPLY_FAILURE",
        description: `Failed to apply promo code ${promoCode} for user ${userId}: ${errorMessage}`,
        context: { userId, promoCode, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: APPLY_PROMO_CODE_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates a request for Gemini to fetch and optionally analyze a user's invoices.
 * Gemini can enrich invoices with payment statuses, due date reminders, and anomaly flags.
 *
 * @param userId The ID of the user.
 * @param pagination Optional pagination parameters.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function fetchInvoicesGemini(userId: string, pagination?: Pagination) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `User ${userId} requesting invoices with pagination: ${JSON.stringify(pagination)}.`,
      context: { userId, pagination },
      outcome: "Pending",
    });

    dispatch({
      type: FETCH_INVOICES,
      userId,
      pagination,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Simulate Gemini fetching raw invoice data from a billing system.
      const rawInvoicesResult = await simulateGeminiAIProcessing(
        0.98,
        400,
        [
          {
            id: "inv_001",
            invoice_number: "INV-2024-001",
            date: "2024-06-01",
            due_date: "2024-06-15",
            total_amount: 99.99,
            currency: "USD",
            status: "Paid",
            items: [], // Simplified for this simulation
          },
          {
            id: "inv_002",
            invoice_number: "INV-2024-002",
            date: "2024-07-01",
            due_date: "2024-07-15",
            total_amount: 105.50,
            currency: "USD",
            status: "Due",
            items: [],
          },
        ],
        "Gemini failed to retrieve raw invoice data.",
      );

      if (!rawInvoicesResult.success || !rawInvoicesResult.data) {
        throw new Error(
          rawInvoicesResult.error || "Gemini could not fetch invoice data.",
        );
      }

      // Gemini performs AI enrichment on invoices, e.g., detecting unusual amounts or late payments.
      const enrichedInvoices = rawInvoicesResult.data.map((invoice) => ({
        ...invoice,
        gemini_anomaly_score:
          invoice.total_amount > 100 && invoice.status === "Due" ? 0.7 : 0.1, // Example anomaly
        gemini_insight:
          invoice.status === "Due" && new Date(invoice.due_date) < new Date()
            ? "Overdue: Action required."
            : undefined,
      }));

      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "INVOICE_FETCH_SUCCESS",
        description: `Invoices successfully fetched and enriched for user ${userId}.`,
        context: { userId, invoiceCount: enrichedInvoices.length },
        outcome: "Success",
      });
      dispatch({
        type: FETCH_INVOICES_SUCCESS,
        payload: { invoices: enrichedInvoices, totalCount: enrichedInvoices.length },
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "INVOICE_FETCH_FAILURE",
        description: `Failed to fetch invoices for user ${userId}: ${errorMessage}`,
        context: { userId, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: FETCH_INVOICES_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates a request for Gemini to fetch and analyze detailed usage records for a user.
 * Gemini can identify usage patterns, flag anomalies, and correlate usage with costs.
 *
 * @param userId The ID of the user.
 * @param period The reporting period (e.g., "current_month", "last_30_days").
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function fetchUsageRecordsGemini(userId: string, period: string) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `User ${userId} requesting usage records for period: ${period}.`,
      context: { userId, period },
      outcome: "Pending",
    });

    dispatch({
      type: FETCH_USAGE_RECORDS,
      userId,
      period,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Simulate Gemini fetching raw usage data from a dedicated usage metering system.
      const rawUsageRecordsResult = await simulateGeminiAIProcessing(
        0.97,
        500,
        [
          {
            record_id: "ur_001",
            metric_name: "API Calls",
            usage_value: 12000,
            unit_of_measure: "calls",
            timestamp: "2024-06-05T10:00:00Z",
            associated_resource_id: "res_abc",
          },
          {
            record_id: "ur_002",
            metric_name: "Data Storage",
            usage_value: 45.5,
            unit_of_measure: "GB",
            timestamp: "2024-06-05T11:00:00Z",
            associated_resource_id: "res_xyz",
          },
          {
            record_id: "ur_003",
            metric_name: "API Calls",
            usage_value: 1500,
            unit_of_measure: "calls",
            timestamp: "2024-06-05T12:00:00Z",
            associated_resource_id: "res_abc",
          }, // This could be flagged as an anomaly by Gemini if normal usage is much higher/lower
        ],
        "Gemini failed to retrieve raw usage records.",
      );

      if (!rawUsageRecordsResult.success || !rawUsageRecordsResult.data) {
        throw new Error(
          rawUsageRecordsResult.error || "Gemini could not fetch usage data.",
        );
      }

      // Gemini performs AI analysis on usage patterns to detect anomalies.
      const enrichedUsageRecords = rawUsageRecordsResult.data.map((record) => ({
        ...record,
        gemini_anomaly_flag: record.metric_name === "API Calls" && record.usage_value < 2000, // Example anomaly detection
      }));

      // Gemini also provides an overall usage pattern summary.
      const usagePatternSummaryResult = await simulateGeminiAIProcessing(
        0.9,
        300,
        "Consistent API usage with occasional data storage spikes.",
        "Gemini failed to summarize usage patterns.",
      );

      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "USAGE_FETCH_SUCCESS",
        description: `Usage records successfully fetched and analyzed for user ${userId}.`,
        context: { userId, recordCount: enrichedUsageRecords.length, period },
        outcome: "Success",
      });
      dispatch({
        type: FETCH_USAGE_RECORDS_SUCCESS,
        payload: {
          records: enrichedUsageRecords,
          gemini_usage_summary: usagePatternSummaryResult.data,
        },
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "USAGE_FETCH_FAILURE",
        description: `Failed to fetch usage records for user ${userId}: ${errorMessage}`,
        context: { userId, period, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: FETCH_USAGE_RECORDS_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates Gemini's advanced churn prediction for a given user.
 * Gemini analyzes historical data, usage patterns, support interactions,
 * and external market factors to predict the likelihood of churn.
 *
 * @param userId The ID of the user for whom to predict churn.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function predictChurnRiskGemini(userId: string) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "AI_PREDICTION_REQUEST",
      description: `Requesting churn prediction for user ${userId}.`,
      context: { userId },
      outcome: "Pending",
    });

    dispatch({
      type: GEMINI_PREDICT_CHURN,
      userId,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Gemini's deep learning models process vast amounts of user data.
      // This is a complex, multi-modal analysis.
      const churnResult = await simulateGeminiAIProcessing(
        0.9,
        1500, // Long delay for complex AI computation
        {
          risk_score: Math.floor(Math.random() * 60) + 10, // Simulate a dynamic risk score (10-70)
          reasons: [
            "Decreased login activity in last 30 days.",
            "Recent view of competitor pricing pages (inferred).",
            "Low engagement with newly released features.",
          ],
          mitigation_suggestions: [
            "Proactive outreach from account manager.",
            "Offer personalized discount for next billing cycle.",
            "Schedule a product training session.",
          ],
          predicted_churn_date_range: "Next 3-6 months",
        },
        "Gemini's churn prediction model encountered an error.",
      );

      if (churnResult.success && churnResult.data) {
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "AI_PREDICTION_SUCCESS",
          description: `Churn prediction successfully generated for user ${userId}.`,
          context: { userId, riskScore: churnResult.data.risk_score },
          outcome: "Success",
          riskScore: churnResult.data.risk_score,
        });
        dispatch({
          type: GEMINI_PREDICT_CHURN_SUCCESS,
          payload: { userId, prediction: churnResult.data },
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      } else {
        throw new Error(churnResult.error || "Gemini failed to predict churn.");
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "AI_PREDICTION_FAILURE",
        description: `Failed to generate churn prediction for user ${userId}: ${errorMessage}`,
        context: { userId, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: GEMINI_PREDICT_CHURN_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates Gemini's recommendation engine to suggest cost-saving measures for a user.
 * Gemini analyzes a user's current subscription, usage patterns, and available plans
 * to provide tailored advice on how to optimize their billing costs.
 *
 * @param userId The ID of the user for whom to recommend cost savings.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function recommendCostSavingMeasuresGemini(userId: string) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "AI_RECOMMENDATION_REQUEST",
      description: `Requesting cost-saving recommendations for user ${userId}.`,
      context: { userId },
      outcome: "Pending",
    });

    dispatch({
      type: GEMINI_RECOMMEND_PLAN, // Reusing action type for plan recommendations
      userId,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Gemini's sophisticated algorithms analyze usage logs and billing history.
      // It compares current costs against optimal scenarios and alternative plans.
      const recommendationResult = await simulateGeminiAIProcessing(
        0.92,
        1000, // Simulate detailed analysis time
        {
          recommendations: [
            {
              id: "rec_001",
              type: "Plan Upgrade",
              description:
                "Based on current usage, upgrading to the 'Enterprise Annual' plan could save you 15% annually compared to your current monthly 'Pro' plan.",
              estimated_savings_annual: 500,
              plan_id: "enterprise_annual",
              confidence_score: 0.95,
            },
            {
              id: "rec_002",
              type: "Resource Optimization",
              description:
                "Gemini detected unused storage capacity. Consider archiving older data to reduce storage costs by an estimated 5-10%.",
              estimated_savings_monthly: 20,
              actionable_steps: ["Identify and archive inactive datasets."],
              confidence_score: 0.88,
            },
          ],
          last_analyzed: new Date().toISOString(),
        },
        "Gemini failed to generate cost-saving recommendations.",
      );

      if (recommendationResult.success && recommendationResult.data) {
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "AI_RECOMMENDATION_SUCCESS",
          description: `Cost-saving recommendations generated for user ${userId}.`,
          context: {
            userId,
            recommendationCount: recommendationResult.data.recommendations.length,
          },
          outcome: "Success",
        });
        dispatch({
          type: GEMINI_RECOMMEND_PLAN_SUCCESS,
          payload: { userId, recommendations: recommendationResult.data.recommendations },
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      } else {
        throw new Error(
          recommendationResult.error ||
          "Gemini failed to provide cost-saving recommendations.",
        );
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "AI_RECOMMENDATION_FAILURE",
        description: `Failed to generate cost-saving recommendations for user ${userId}: ${errorMessage}`,
        context: { userId, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: GEMINI_RECOMMEND_PLAN_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates Gemini's process to validate a billing address.
 * Gemini leverages external geocoding and address validation services (conceptually)
 * to ensure the address is correct and compliant.
 *
 * @param address The billing address to validate.
 * @returns A Promise resolving with the validated address and Gemini's status.
 */
export async function validateBillingAddressGemini(
  address: BillingAddress,
): Promise<BillingAddress> {
  const geminiDecisionId = generateGeminiDecisionId();
  geminiAuditTrail.push({
    geminiDecisionId,
    timestamp: new Date().toISOString(),
    eventType: "ADDRESS_VALIDATION_REQUEST",
    description: "Requesting Gemini to validate a billing address.",
    context: { originalAddress: address },
    outcome: "Pending",
  });

  try {
    // Simulate Gemini calling an external address validation tool.
    // Gemini handles API calls, error retries, and data parsing.
    const validationResult = await simulateGeminiAIProcessing(
      0.9,
      400,
      {
        validated: true,
        standardizedAddress: {
          ...address,
          address_line1: address.address_line1.trim(),
          city: address.city.trim(),
          state_province: address.state_province.trim().toUpperCase(),
          postal_code: address.postal_code.trim(),
        },
        validationMessage: "Address successfully validated and standardized.",
      },
      "Gemini could not validate the address or found discrepancies.",
    );

    if (validationResult.success && validationResult.data?.validated) {
      const validatedAddress: BillingAddress = {
        ...(validationResult.data.standardizedAddress as BillingAddress),
        gemini_validation_status: "Valid",
        gemini_validation_message: validationResult.data.validationMessage,
      };
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "ADDRESS_VALIDATION_SUCCESS",
        description: "Billing address validated by Gemini.",
        context: { validatedAddress },
        outcome: "Success",
      });
      return validatedAddress;
    } else {
      const errorMessage =
        validationResult.error || "Address validation failed due to an unknown Gemini issue.";
      const invalidAddress: BillingAddress = {
        ...address,
        gemini_validation_status: "Invalid",
        gemini_validation_message: errorMessage,
      };
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "ADDRESS_VALIDATION_FAILURE",
        description: `Billing address validation failed: ${errorMessage}`,
        context: { originalAddress: address, error: errorMessage },
        outcome: "Failure",
      });
      throw new Error(errorMessage); // Or return the address with failure status
    }
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "ADDRESS_VALIDATION_FAILURE",
      description: `Gemini's core address validation process encountered an unexpected error: ${errorMessage}`,
      context: { originalAddress: address, error: errorMessage },
      outcome: "Failure",
    });
    const failedAddress: BillingAddress = {
      ...address,
      gemini_validation_status: "Invalid",
      gemini_validation_message: `Unexpected error during Gemini validation: ${errorMessage}`,
    };
    return failedAddress; // Return with error status, or rethrow
  }
}

/**
 * Initiates Gemini's process to remove a payment method for a user.
 * Gemini ensures proper authorization, handles backend deletion, and updates
 * the user's billing profile. If the removed method was default, Gemini
 * attempts to select a new default.
 *
 * @param userId The ID of the user.
 * @param paymentMethodId The ID of the payment method to remove.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function removePaymentMethodGemini(userId: string, paymentMethodId: string) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `Requesting Gemini to remove payment method ${paymentMethodId} for user ${userId}.`,
      context: { userId, paymentMethodId },
      outcome: "Pending",
    });

    dispatch({
      type: REMOVE_PAYMENT_METHOD,
      userId,
      paymentMethodId,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Step 1: Gemini's pre-removal checks.
      // - Is this the only payment method? (prevent leaving user with no payment)
      // - Is there an active subscription tied to this? (warn or block if necessary)
      const preCheckResult = await simulateGeminiAIProcessing(
        0.98,
        200,
        {
          canRemove: true,
          wasDefault: true,
          message: "Payment method found and eligible for removal.",
        },
        "Gemini identified issues preventing payment method removal (e.g., last active method, active subscriptions).",
      );

      if (!preCheckResult.success || !preCheckResult.data?.canRemove) {
        throw new Error(
          preCheckResult.error || "Gemini blocked removal due to critical dependencies.",
        );
      }

      // Step 2: Gemini orchestrates the actual deletion in the backend system.
      const deletionResult = await simulateGeminiAIProcessing(
        0.95,
        500,
        { paymentMethodId, wasDefault: preCheckResult.data.wasDefault },
        "Gemini encountered an error deleting the payment method from the backend.",
      );

      if (!deletionResult.success || !deletionResult.data) {
        throw new Error(
          deletionResult.error || "Gemini failed to delete payment method.",
        );
      }

      // Step 3: Gemini handles post-removal logic, e.g., setting a new default if needed.
      if (deletionResult.data.wasDefault) {
        const newDefaultSelection = await simulateGeminiAIProcessing(
          0.8,
          300,
          "pm_card_newdefault",
          "Gemini failed to automatically select a new default payment method.",
        );
        if (newDefaultSelection.success && newDefaultSelection.data) {
          geminiAuditTrail.push({
            geminiDecisionId,
            timestamp: new Date().toISOString(),
            eventType: "AUTO_DEFAULT_PAYMENT_METHOD_SET",
            description: `Gemini automatically set ${newDefaultSelection.data} as new default after removal.`,
            context: { userId, newDefaultPaymentMethodId: newDefaultSelection.data },
            outcome: "Success",
          });
          // Dispatch action for new default if needed for UI update
          dispatch({
            type: SET_DEFAULT_PAYMENT_METHOD_SUCCESS,
            payload: { paymentMethodId: newDefaultSelection.data },
            meta: {
              geminiDecisionId: generateGeminiDecisionId(),
              timestamp: new Date().toISOString(),
              reason: "Auto-set after old default removed",
            },
          });
        } else {
          geminiAuditTrail.push({
            geminiDecisionId,
            timestamp: new Date().toISOString(),
            eventType: "AUTO_DEFAULT_PAYMENT_METHOD_FAILURE",
            description: `Gemini failed to auto-select new default payment method after ${paymentMethodId} removal: ${newDefaultSelection.error}`,
            context: { userId, removedPaymentMethodId: paymentMethodId },
            outcome: "Failure",
          });
          // Potentially dispatch a warning to user
        }
      }

      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "PAYMENT_METHOD_REMOVE_SUCCESS",
        description: `Payment method ${paymentMethodId} successfully removed for user ${userId}.`,
        context: { userId, removedPaymentMethodId: paymentMethodId },
        outcome: "Success",
      });
      dispatch({
        type: REMOVE_PAYMENT_METHOD_SUCCESS,
        payload: { paymentMethodId: deletionResult.data.paymentMethodId },
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "PAYMENT_METHOD_REMOVE_FAILURE",
        description: `Failed to remove payment method ${paymentMethodId} for user ${userId}: ${errorMessage}`,
        context: { userId, paymentMethodId, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: REMOVE_PAYMENT_METHOD_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}

/**
 * Initiates Gemini's process to update a user's billing preferences.
 * Gemini validates the preferences and ensures they are applied consistently
 * across all relevant billing and notification systems.
 *
 * @param userId The ID of the user.
 * @param preferences The updated billing preferences.
 * @returns A thunk-like function for GeminiDispatcher.
 */
export function updateBillingPreferencesGemini(
  userId: string,
  preferences: BillingContact["notificationPreferences"],
) {
  return async (dispatch: GeminiDispatcher) => {
    const geminiDecisionId = generateGeminiDecisionId();
    geminiAuditTrail.push({
      geminiDecisionId,
      timestamp: new Date().toISOString(),
      eventType: "USER_ACTION",
      description: `User ${userId} attempting to update billing preferences.`,
      context: { userId, newPreferences: preferences },
      outcome: "Pending",
    });

    dispatch({
      type: UPDATE_BILLING_PREFERENCES,
      userId,
      preferences,
      meta: { geminiDecisionId, timestamp: new Date().toISOString() },
    });

    try {
      // Step 1: Gemini's validation of preference consistency.
      // Gemini ensures that preferences are logically sound (e.g., can't unsubscribe from all critical alerts).
      if (preferences.invoiceDue === false && preferences.paymentConfirmation === false) {
        throw new Error("Gemini requires at least one critical billing notification to be enabled.");
      }

      // Step 2: Gemini orchestrates the update across various notification and CRM systems.
      const updateResult = await simulateGeminiAIProcessing(
        0.97,
        400,
        { userId, updatedPreferences: preferences },
        "Gemini encountered an error while updating billing preferences in core systems.",
      );

      if (updateResult.success && updateResult.data) {
        geminiAuditTrail.push({
          geminiDecisionId,
          timestamp: new Date().toISOString(),
          eventType: "BILLING_PREFERENCES_UPDATE_SUCCESS",
          description: `Billing preferences for user ${userId} successfully updated.`,
          context: { userId, updatedPreferences: updateResult.data.updatedPreferences },
          outcome: "Success",
        });
        dispatch({
          type: UPDATE_BILLING_PREFERENCES_SUCCESS,
          payload: updateResult.data,
          meta: { geminiDecisionId, timestamp: new Date().toISOString() },
        });
      } else {
        throw new Error(
          updateResult.error || "Gemini failed to finalize billing preference update.",
        );
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      geminiAuditTrail.push({
        geminiDecisionId,
        timestamp: new Date().toISOString(),
        eventType: "BILLING_PREFERENCES_UPDATE_FAILURE",
        description: `Failed to update billing preferences for user ${userId}: ${errorMessage}`,
        context: { userId, preferences, error: errorMessage },
        outcome: "Failure",
      });
      dispatch({
        type: UPDATE_BILLING_PREFERENCES_FAILURE,
        payload: { message: errorMessage },
        error: true,
        meta: { geminiDecisionId, timestamp: new Date().toISOString() },
      });
    }
  };
}