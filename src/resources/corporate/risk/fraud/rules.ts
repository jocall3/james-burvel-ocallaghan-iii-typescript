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
   * The action to be taken when the rule is triggered.
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
   * A JSON object defining the specific conditions that trigger the rule.
   */
  criteria: { [key: string]: unknown };

  /**
   * Detailed description of what the rule detects.
   */
  description: string;

  /**
   * Timestamp when the rule was last modified.
   */
  lastUpdated: string;

  /**
   * Human-readable name of the rule.
   */
  name: string;

  /**
   * Default severity level assigned to anomalies detected by this rule.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Current status of the rule.
   */
  status: 'active' | 'inactive' | 'draft';
}

export namespace FraudRule {
  /**
   * The action to be taken when the rule is triggered.
   */
  export interface Action {
    details?: string;

    type?: 'flag' | 'alert' | 'block' | 'auto_review';
  }
}

export type RuleListResponse = Array<FraudRule>;

export interface RuleCreateParams {
  /**
   * Action to take when the rule is triggered.
   */
  action: RuleCreateParams.Action;

  /**
   * JSON object defining the conditions to trigger the rule.
   */
  criteria: { [key: string]: unknown };

  /**
   * Description of what the rule will detect.
   */
  description: string;

  /**
   * Name of the new fraud detection rule.
   */
  name: string;

  /**
   * Default severity for anomalies detected by this rule.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Initial status of the rule.
   */
  status: 'active' | 'inactive' | 'draft';
}

export namespace RuleCreateParams {
  /**
   * Action to take when the rule is triggered.
   */
  export interface Action {
    details?: string;

    type?: 'flag' | 'alert' | 'block' | 'auto_review';
  }
}

export interface RuleUpdateParams {
  /**
   * Updated action to take when the rule is triggered.
   */
  action?: RuleUpdateParams.Action;

  /**
   * Updated JSON object defining the trigger conditions.
   */
  criteria?: { [key: string]: unknown };

  /**
   * Updated description.
   */
  description?: string;

  /**
   * Updated name of the rule.
   */
  name?: string;

  /**
   * Updated default severity level.
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
    details?: string;

    type?: 'flag' | 'alert' | 'block' | 'auto_review';
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
