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
   * const fraudRules =
   *   await client.corporate.risk.fraud.rules.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<RuleListResponse> {
    return this._client.get('/corporate/risk/fraud/rules', options);
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
   * The automated action to take when this rule is triggered.
   */
  action: FraudRule.Action;

  /**
   * Timestamp when the rule was created.
   */
  createdAt: string;

  /**
   * Identifier of the user or system that created the rule.
   */
  createdBy: string;

  /**
   * The conditions that trigger this fraud rule.
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
   * The default severity assigned to anomalies detected by this rule.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Current status of the rule.
   */
  status: 'active' | 'inactive' | 'draft';

  /**
   * Indicates if AI continuously learns and refines this rule.
   */
  aiLearningEnabled?: boolean;

  /**
   * Processing priority of the rule (higher is more urgent).
   */
  priority?: number;
}

export namespace FraudRule {
  /**
   * The automated action to take when this rule is triggered.
   */
  export interface Action {
    /**
     * Detailed description of the action.
     */
    details: string;

    /**
     * The type of action to take (e.g., flag for review, block transaction).
     */
    type: 'flag' | 'alert' | 'block' | 'auto_review' | 'mfa_challenge';

    /**
     * Channels to send alerts/notifications to.
     */
    targetChannels?: Array<'email' | 'sms' | 'push' | 'in_app' | 'dashboard' | 'api_webhook'> | null;
  }

  /**
   * The conditions that trigger this fraud rule.
   */
  export interface Criteria {
    /**
     * Number of days an account must be inactive to trigger the rule.
     */
    accountInactivityDays?: number | null;

    /**
     * Transaction origin countries to match (ISO 3166-1 alpha-2).
     */
    countryOfOrigin?: Array<string> | null;

    /**
     * Minimum geographic distance from user's usual activity to trigger.
     */
    geographicDistanceKm?: number | null;

    /**
     * Keywords or phrases in transaction description to flag.
     */
    keywordsInDescription?: Array<string> | null;

    /**
     * If transaction is far from last login within this many days.
     */
    lastLoginDays?: number | null;

    /**
     * True if no travel notification was filed for geographic mismatch.
     */
    noTravelNotification?: boolean | null;

    /**
     * Minimum number of payments within a timeframe to trigger.
     */
    paymentCountMin?: number | null;

    /**
     * Recipient countries by risk level to match.
     */
    recipientCountryRiskLevel?: Array<'Low' | 'Medium' | 'High' | 'Very High'> | null;

    /**
     * True if the recipient is a new beneficiary.
     */
    recipientNew?: boolean | null;

    /**
     * Timeframe in hours for payment count criteria.
     */
    timeframeHours?: number | null;

    /**
     * Maximum transaction amount to trigger the rule.
     */
    transactionAmountMax?: number | null;

    /**
     * Minimum transaction amount to trigger the rule.
     */
    transactionAmountMin?: number | null;

    /**
     * Type of transaction to monitor.
     */
    transactionType?: 'debit' | 'credit' | 'all' | null;
  }
}

export type RuleListResponse = Array<FraudRule>;

export interface RuleCreateParams {
  /**
   * The automated action to take when this rule is triggered.
   */
  action: RuleCreateParams.Action;

  /**
   * The conditions that trigger this fraud rule.
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
   * The default severity assigned to anomalies detected by this rule.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Initial status of the rule.
   */
  status: 'active' | 'inactive' | 'draft';

  /**
   * If true, AI continuously learns and refines this rule.
   */
  aiLearningEnabled?: boolean;

  /**
   * Processing priority of the rule (higher is more urgent).
   */
  priority?: number;
}

export namespace RuleCreateParams {
  /**
   * The automated action to take when this rule is triggered.
   */
  export interface Action {
    /**
     * Detailed description of the action.
     */
    details: string;

    /**
     * The type of action to take (e.g., flag for review, block transaction).
     */
    type: 'flag' | 'alert' | 'block' | 'auto_review' | 'mfa_challenge';

    /**
     * Channels to send alerts/notifications to.
     */
    targetChannels?: Array<'email' | 'sms' | 'push' | 'in_app' | 'dashboard' | 'api_webhook'> | null;
  }

  /**
   * The conditions that trigger this fraud rule.
   */
  export interface Criteria {
    /**
     * Number of days an account must be inactive to trigger the rule.
     */
    accountInactivityDays?: number | null;

    /**
     * Transaction origin countries to match (ISO 3166-1 alpha-2).
     */
    countryOfOrigin?: Array<string> | null;

    /**
     * Minimum geographic distance from user's usual activity to trigger.
     */
    geographicDistanceKm?: number | null;

    /**
     * Keywords or phrases in transaction description to flag.
     */
    keywordsInDescription?: Array<string> | null;

    /**
     * If transaction is far from last login within this many days.
     */
    lastLoginDays?: number | null;

    /**
     * True if no travel notification was filed for geographic mismatch.
     */
    noTravelNotification?: boolean | null;

    /**
     * Minimum number of payments within a timeframe to trigger.
     */
    paymentCountMin?: number | null;

    /**
     * Recipient countries by risk level to match.
     */
    recipientCountryRiskLevel?: Array<'Low' | 'Medium' | 'High' | 'Very High'> | null;

    /**
     * True if the recipient is a new beneficiary.
     */
    recipientNew?: boolean | null;

    /**
     * Timeframe in hours for payment count criteria.
     */
    timeframeHours?: number | null;

    /**
     * Maximum transaction amount to trigger the rule.
     */
    transactionAmountMax?: number | null;

    /**
     * Minimum transaction amount to trigger the rule.
     */
    transactionAmountMin?: number | null;

    /**
     * Type of transaction to monitor.
     */
    transactionType?: 'debit' | 'credit' | 'all' | null;
  }
}

export interface RuleUpdateParams {
  /**
   * Updated automated action to take when this rule is triggered. All fields are
   * optional for partial updates.
   */
  action?: RuleUpdateParams.Action;

  /**
   * Update AI learning status for this rule.
   */
  aiLearningEnabled?: boolean;

  /**
   * Updated conditions that trigger this fraud rule. All fields are optional for
   * partial updates.
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
   * Updated processing priority of the rule.
   */
  priority?: number;

  /**
   * Updated default severity assigned to anomalies.
   */
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Updated status of the rule.
   */
  status?: 'active' | 'inactive' | 'draft';
}

export namespace RuleUpdateParams {
  /**
   * Updated automated action to take when this rule is triggered. All fields are
   * optional for partial updates.
   */
  export interface Action {
    /**
     * Detailed description of the action.
     */
    details: string;

    /**
     * The type of action to take (e.g., flag for review, block transaction).
     */
    type: 'flag' | 'alert' | 'block' | 'auto_review' | 'mfa_challenge';

    /**
     * Channels to send alerts/notifications to.
     */
    targetChannels?: Array<'email' | 'sms' | 'push' | 'in_app' | 'dashboard' | 'api_webhook'> | null;
  }

  /**
   * Updated conditions that trigger this fraud rule. All fields are optional for
   * partial updates.
   */
  export interface Criteria {
    /**
     * Number of days an account must be inactive to trigger the rule.
     */
    accountInactivityDays?: number | null;

    /**
     * Transaction origin countries to match (ISO 3166-1 alpha-2).
     */
    countryOfOrigin?: Array<string> | null;

    /**
     * Minimum geographic distance from user's usual activity to trigger.
     */
    geographicDistanceKm?: number | null;

    /**
     * Keywords or phrases in transaction description to flag.
     */
    keywordsInDescription?: Array<string> | null;

    /**
     * If transaction is far from last login within this many days.
     */
    lastLoginDays?: number | null;

    /**
     * True if no travel notification was filed for geographic mismatch.
     */
    noTravelNotification?: boolean | null;

    /**
     * Minimum number of payments within a timeframe to trigger.
     */
    paymentCountMin?: number | null;

    /**
     * Recipient countries by risk level to match.
     */
    recipientCountryRiskLevel?: Array<'Low' | 'Medium' | 'High' | 'Very High'> | null;

    /**
     * True if the recipient is a new beneficiary.
     */
    recipientNew?: boolean | null;

    /**
     * Timeframe in hours for payment count criteria.
     */
    timeframeHours?: number | null;

    /**
     * Maximum transaction amount to trigger the rule.
     */
    transactionAmountMax?: number | null;

    /**
     * Minimum transaction amount to trigger the rule.
     */
    transactionAmountMin?: number | null;

    /**
     * Type of transaction to monitor.
     */
    transactionType?: 'debit' | 'credit' | 'all' | null;
  }
}

export declare namespace Rules {
  export {
    type FraudRule as FraudRule,
    type RuleListResponse as RuleListResponse,
    type RuleCreateParams as RuleCreateParams,
    type RuleUpdateParams as RuleUpdateParams,
  };
}
