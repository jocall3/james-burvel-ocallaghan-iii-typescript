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
   * Unique identifier for the fraud rule.
   */
  id: string;

  action: FraudRule.Action;

  /**
   * Timestamp when the rule was created.
   */
  createdAt: string;

  /**
   * Identifier of the creator (user or system).
   */
  createdBy: string;

  /**
   * A dynamic object defining the conditions that trigger the rule.
   */
  criteria: unknown;

  /**
   * Detailed description of what the rule detects.
   */
  description: string;

  /**
   * Timestamp when the rule was last updated.
   */
  lastUpdated: string;

  /**
   * A descriptive name for the rule.
   */
  name: string;

  /**
   * Severity level associated with a detected anomaly by this rule.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Current status of the rule.
   */
  status: 'active' | 'inactive' | 'draft';

  /**
   * Priority level for rule evaluation (lower number means higher priority).
   */
  priority?: number;
}

export namespace FraudRule {
  export interface Action {
    /**
     * Further details about the action.
     */
    details: string;

    /**
     * The automated action to take when the rule is triggered.
     */
    type: 'flag' | 'alert' | 'block' | 'auto_review' | 'mfa_challenge';
  }
}

export type RuleListResponse = Array<FraudRule>;

export interface RuleCreateParams {
  action: RuleCreateParams.Action;

  /**
   * The dynamic object defining the conditions that trigger the rule.
   */
  criteria: unknown;

  /**
   * Detailed description of what the rule should detect.
   */
  description: string;

  /**
   * A descriptive name for the new rule.
   */
  name: string;

  /**
   * Severity level for anomalies detected by this rule.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Initial status of the rule.
   */
  status: 'active' | 'inactive' | 'draft';

  /**
   * Optional: Priority level for rule evaluation.
   */
  priority?: number | null;
}

export namespace RuleCreateParams {
  export interface Action {
    /**
     * Further details about the action.
     */
    details: string;

    /**
     * The automated action to take when the rule is triggered.
     */
    type: 'flag' | 'alert' | 'block' | 'auto_review' | 'mfa_challenge';
  }
}

export interface RuleUpdateParams {
  action?: RuleUpdateParams.Action;

  /**
   * The updated dynamic object defining the conditions.
   */
  criteria?: { [key: string]: unknown };

  /**
   * Updated description of the rule.
   */
  description?: string;

  /**
   * Updated name for the fraud rule.
   */
  name?: string;

  /**
   * Updated priority level for rule evaluation.
   */
  priority?: number | null;

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
  export interface Action {
    details?: string;

    type?: 'flag' | 'alert' | 'block' | 'auto_review' | 'mfa_challenge';

    [k: string]: unknown;
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
