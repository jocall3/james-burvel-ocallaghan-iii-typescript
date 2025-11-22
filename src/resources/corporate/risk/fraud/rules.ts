// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../../core/resource';
import { APIPromise } from '../../../../core/api-promise';
import { buildHeaders } from '../../../../internal/headers';
import { RequestOptions } from '../../../../internal/request-options';
import { path } from '../../../../internal/utils/path';

export class Rules extends APIResource {
  /**
   * Creates a new custom AI-powered fraud detection rule, allowing organizations to
   * define specific criteria, risk scores, and automated responses to evolving
   * threat landscapes.
   *
   * @example
   * ```ts
   * const fraudRule =
   *   await client.corporate.risk.fraud.rules.create({
   *     action: {
   *       type: 'auto_review',
   *       details:
   *         'Hold payment, notify sender for additional verification, and escalate to compliance.',
   *     },
   *     criteria: {
   *       paymentCountMin: 3,
   *       timeframeHours: 24,
   *       recipientNew: true,
   *       recipientCountryRiskLevel: ['High', 'Very High'],
   *     },
   *     description:
   *       'Detects multiple international payments to new beneficiaries in high-risk countries within a short timeframe.',
   *     name: 'Suspicious International Payment Pattern',
   *     severity: 'Critical',
   *     status: 'active',
   *   });
   * ```
   */
  create(body: RuleCreateParams, options?: RequestOptions): APIPromise<FraudRule> {
    return this._client.post('/corporate/risk/fraud/rules', { body, ...options });
  }

  /**
   * Updates an existing custom AI-powered fraud detection rule, modifying its
   * criteria, actions, or status.
   *
   * @example
   * ```ts
   * const fraudRule =
   *   await client.corporate.risk.fraud.rules.update(
   *     'fraud_rule_high_value_inactive',
   *     {
   *       action: {
   *         type: 'flag',
   *         details:
   *           'Flag for manual review only, do not block.',
   *       },
   *       criteria: {
   *         transactionAmountMin: 7500,
   *         accountInactivityDays: 60,
   *       },
   *       status: 'inactive',
   *     },
   *   );
   * ```
   */
  update(ruleID: string, body: RuleUpdateParams, options?: RequestOptions): APIPromise<FraudRule> {
    return this._client.put(path`/corporate/risk/fraud/rules/${ruleID}`, { body, ...options });
  }

  /**
   * Retrieves a list of AI-powered fraud detection rules currently active for the
   * organization, including their parameters, thresholds, and associated actions
   * (e.g., flag, block, alert).
   *
   * @example
   * ```ts
   * const rules =
   *   await client.corporate.risk.fraud.rules.list();
   * ```
   */
  list(
    query: RuleListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<RuleListResponse> {
    return this._client.get('/corporate/risk/fraud/rules', { query, ...options });
  }

  /**
   * Deletes a specific custom AI-powered fraud detection rule.
   *
   * @example
   * ```ts
   * await client.corporate.risk.fraud.rules.delete(
   *   'fraud_rule_high_value_inactive',
   * );
   * ```
   */
  delete(ruleID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/corporate/risk/fraud/rules/${ruleID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface FraudRule {
  /**
   * Unique identifier for the fraud detection rule.
   */
  id: string;

  /**
   * Action to take when a fraud rule is triggered.
   */
  action: FraudRule.Action;

  /**
   * Timestamp when the rule was created.
   */
  createdAt: string;

  /**
   * Identifier of who created the rule (e.g., user ID, 'system:ai-risk-engine').
   */
  createdBy: string;

  /**
   * Criteria that define when a fraud rule should trigger.
   */
  criteria: FraudRule.Criteria;

  /**
   * Detailed description of what the rule detects.
   */
  description: string;

  /**
   * Timestamp when the rule was last updated.
   */
  lastUpdated: string;

  /**
   * Name of the fraud rule.
   */
  name: string;

  /**
   * Severity level when this rule is triggered.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Current status of the rule.
   */
  status: 'active' | 'inactive' | 'draft';
}

export namespace FraudRule {
  /**
   * Action to take when a fraud rule is triggered.
   */
  export interface Action {
    /**
     * Details or instructions for the action.
     */
    details: string;

    /**
     * Type of action to perform.
     */
    type: 'block' | 'alert' | 'auto_review' | 'manual_review' | 'request_mfa';

    /**
     * The team or department to notify for alerts/reviews.
     */
    targetTeam?: string | null;
  }

  /**
   * Criteria that define when a fraud rule should trigger.
   */
  export interface Criteria {
    /**
     * Number of days an account must be inactive for the rule to apply.
     */
    accountInactivityDays?: number | null;

    /**
     * List of ISO 2-letter country codes for transaction origin.
     */
    countryOfOrigin?: Array<string> | null;

    /**
     * Minimum geographic distance (in km) from recent activity for anomaly.
     */
    geographicDistanceKm?: number | null;

    /**
     * Number of days since last user login for anomaly detection.
     */
    lastLoginDays?: number | null;

    /**
     * If true, rule applies only if no prior travel notification was made.
     */
    noTravelNotification?: boolean | null;

    /**
     * Minimum number of payments in a timeframe.
     */
    paymentCountMin?: number | null;

    /**
     * List of risk levels for recipient countries.
     */
    recipientCountryRiskLevel?: Array<'Low' | 'Medium' | 'High' | 'Very High'> | null;

    /**
     * If true, recipient must be a new payee.
     */
    recipientNew?: boolean | null;

    /**
     * Timeframe in hours for payment count or other event aggregations.
     */
    timeframeHours?: number | null;

    /**
     * Minimum transaction amount to consider.
     */
    transactionAmountMin?: number | null;

    /**
     * Specific transaction type (e.g., debit, credit).
     */
    transactionType?: 'debit' | 'credit' | null;
  }
}

export interface RuleListResponse {
  /**
   * The maximum number of items returned in the current page.
   */
  limit: number;

  /**
   * The number of items skipped before the current page.
   */
  offset: number;

  /**
   * The total number of items available across all pages.
   */
  total: number;

  data?: Array<FraudRule>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface RuleCreateParams {
  /**
   * Action to take when a fraud rule is triggered.
   */
  action: RuleCreateParams.Action;

  /**
   * Criteria that define when a fraud rule should trigger.
   */
  criteria: RuleCreateParams.Criteria;

  /**
   * Detailed description of what the rule detects.
   */
  description: string;

  /**
   * Name of the new fraud rule.
   */
  name: string;

  /**
   * Severity level when this rule is triggered.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Initial status of the rule.
   */
  status: 'active' | 'inactive' | 'draft';
}

export namespace RuleCreateParams {
  /**
   * Action to take when a fraud rule is triggered.
   */
  export interface Action {
    /**
     * Details or instructions for the action.
     */
    details: string;

    /**
     * Type of action to perform.
     */
    type: 'block' | 'alert' | 'auto_review' | 'manual_review' | 'request_mfa';

    /**
     * The team or department to notify for alerts/reviews.
     */
    targetTeam?: string | null;
  }

  /**
   * Criteria that define when a fraud rule should trigger.
   */
  export interface Criteria {
    /**
     * Number of days an account must be inactive for the rule to apply.
     */
    accountInactivityDays?: number | null;

    /**
     * List of ISO 2-letter country codes for transaction origin.
     */
    countryOfOrigin?: Array<string> | null;

    /**
     * Minimum geographic distance (in km) from recent activity for anomaly.
     */
    geographicDistanceKm?: number | null;

    /**
     * Number of days since last user login for anomaly detection.
     */
    lastLoginDays?: number | null;

    /**
     * If true, rule applies only if no prior travel notification was made.
     */
    noTravelNotification?: boolean | null;

    /**
     * Minimum number of payments in a timeframe.
     */
    paymentCountMin?: number | null;

    /**
     * List of risk levels for recipient countries.
     */
    recipientCountryRiskLevel?: Array<'Low' | 'Medium' | 'High' | 'Very High'> | null;

    /**
     * If true, recipient must be a new payee.
     */
    recipientNew?: boolean | null;

    /**
     * Timeframe in hours for payment count or other event aggregations.
     */
    timeframeHours?: number | null;

    /**
     * Minimum transaction amount to consider.
     */
    transactionAmountMin?: number | null;

    /**
     * Specific transaction type (e.g., debit, credit).
     */
    transactionType?: 'debit' | 'credit' | null;
  }
}

export interface RuleUpdateParams {
  /**
   * Updated action to take when the rule is triggered.
   */
  action?: RuleUpdateParams.Action;

  /**
   * Updated criteria for the rule.
   */
  criteria?: RuleUpdateParams.Criteria;

  /**
   * Updated description of what the rule detects.
   */
  description?: string;

  /**
   * Updated name of the fraud rule.
   */
  name?: string;

  /**
   * Updated severity level.
   */
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Updated status of the rule.
   */
  status?: 'active' | 'inactive' | 'draft';
}

export namespace RuleUpdateParams {
  /**
   * Updated action to take when the rule is triggered.
   */
  export interface Action {
    /**
     * Details or instructions for the action.
     */
    details: string;

    /**
     * Type of action to perform.
     */
    type: 'block' | 'alert' | 'auto_review' | 'manual_review' | 'request_mfa';

    /**
     * The team or department to notify for alerts/reviews.
     */
    targetTeam?: string | null;
  }

  /**
   * Updated criteria for the rule.
   */
  export interface Criteria {
    /**
     * Number of days an account must be inactive for the rule to apply.
     */
    accountInactivityDays?: number | null;

    /**
     * List of ISO 2-letter country codes for transaction origin.
     */
    countryOfOrigin?: Array<string> | null;

    /**
     * Minimum geographic distance (in km) from recent activity for anomaly.
     */
    geographicDistanceKm?: number | null;

    /**
     * Number of days since last user login for anomaly detection.
     */
    lastLoginDays?: number | null;

    /**
     * If true, rule applies only if no prior travel notification was made.
     */
    noTravelNotification?: boolean | null;

    /**
     * Minimum number of payments in a timeframe.
     */
    paymentCountMin?: number | null;

    /**
     * List of risk levels for recipient countries.
     */
    recipientCountryRiskLevel?: Array<'Low' | 'Medium' | 'High' | 'Very High'> | null;

    /**
     * If true, recipient must be a new payee.
     */
    recipientNew?: boolean | null;

    /**
     * Timeframe in hours for payment count or other event aggregations.
     */
    timeframeHours?: number | null;

    /**
     * Minimum transaction amount to consider.
     */
    transactionAmountMin?: number | null;

    /**
     * Specific transaction type (e.g., debit, credit).
     */
    transactionType?: 'debit' | 'credit' | null;
  }
}

export interface RuleListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export declare namespace Rules {
  export {
    type FraudRule as FraudRule,
    type RuleListResponse as RuleListResponse,
    type RuleCreateParams as RuleCreateParams,
    type RuleUpdateParams as RuleUpdateParams,
    type RuleListParams as RuleListParams,
  };
}
