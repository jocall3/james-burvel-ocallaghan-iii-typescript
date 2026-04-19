// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Advanced access to compliance cases, AI-powered financial anomaly detection, real-time risk assessments, and automated sanction screening for enterprise clients.
 */
export class Anomalies extends APIResource {
  /**
   * Retrieves a comprehensive list of AI-detected financial anomalies across
   * transactions, payments, and corporate cards that require immediate review and
   * potential action to mitigate risk and ensure compliance.
   *
   * @example
   * ```ts
   * const anomalies = await client.corporate.anomalies.list();
   * ```
   */
  list(
    query: AnomalyListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<AnomalyListResponse> {
    return this._client.get('/corporate/anomalies', { query, ...options });
  }

  /**
   * Updates the review status of a specific financial anomaly, allowing compliance
   * officers to mark it as dismissed, resolved, or escalate for further
   * investigation after thorough AI-assisted and human review.
   *
   * @example
   * ```ts
   * const financialAnomaly =
   *   await client.corporate.anomalies.updateStatus(
   *     'anom_risk-2024-07-21-D1E2F3',
   *     {
   *       status: 'Resolved',
   *       resolutionNotes:
   *         'Confirmed legitimate transaction after contacting vendor. Marked as resolved.',
   *     },
   *   );
   * ```
   */
  updateStatus(
    anomalyID: unknown,
    body: AnomalyUpdateStatusParams,
    options?: RequestOptions,
  ): APIPromise<FinancialAnomaly> {
    return this._client.put(path`/corporate/anomalies/${anomalyID}/status`, { body, ...options });
  }
}

export interface FinancialAnomaly {
  /**
   * Unique identifier for the detected anomaly.
   */
  id: unknown;

  /**
   * AI's confidence in its detection of the anomaly (0-1).
   */
  aiConfidenceScore: unknown;

  /**
   * A brief summary of the anomaly.
   */
  description: unknown;

  /**
   * The ID of the specific entity (e.g., transaction, user, card) the anomaly is
   * linked to.
   */
  entityId: unknown;

  /**
   * The type of financial entity related to the anomaly.
   */
  entityType: 'PaymentOrder' | 'Transaction' | 'Counterparty' | 'CorporateCard' | 'User' | 'Invoice';

  /**
   * AI-recommended immediate action to address the anomaly.
   */
  recommendedAction: unknown;

  /**
   * AI-assigned risk score (0-100), higher is more risky.
   */
  riskScore: unknown;

  /**
   * AI-assessed severity of the anomaly.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Current review status of the anomaly.
   */
  status: 'New' | 'Under Review' | 'Escalated' | 'Dismissed' | 'Resolved';

  /**
   * Timestamp when the anomaly was detected.
   */
  timestamp: unknown;

  /**
   * Detailed context and reasoning behind the anomaly detection.
   */
  details?: unknown;

  /**
   * List of IDs of other transactions or entities related to this anomaly.
   */
  relatedTransactions?: Array<unknown> | null;

  /**
   * Notes recorded during the resolution or dismissal of the anomaly.
   */
  resolutionNotes?: unknown;
}

export interface AnomalyListResponse {
  /**
   * The maximum number of items returned in the current page.
   */
  limit: unknown;

  /**
   * The number of items skipped before the current page.
   */
  offset: unknown;

  /**
   * The total number of items available across all pages.
   */
  total: unknown;

  data?: Array<FinancialAnomaly>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface AnomalyListParams {
  /**
   * End date for filtering results (inclusive, YYYY-MM-DD).
   */
  endDate?: unknown;

  /**
   * Filter anomalies by the type of financial entity they are related to.
   */
  entityType?: 'PaymentOrder' | 'Transaction' | 'Counterparty' | 'CorporateCard' | 'Invoice';

  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;

  /**
   * Filter anomalies by their AI-assessed severity level.
   */
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Start date for filtering results (inclusive, YYYY-MM-DD).
   */
  startDate?: unknown;

  /**
   * Filter anomalies by their current review status.
   */
  status?: 'New' | 'Under Review' | 'Escalated' | 'Dismissed' | 'Resolved';
}

export interface AnomalyUpdateStatusParams {
  /**
   * The new status for the financial anomaly.
   */
  status: 'Dismissed' | 'Resolved' | 'Under Review' | 'Escalated';

  /**
   * Optional notes regarding the resolution or dismissal of the anomaly.
   */
  resolutionNotes?: unknown;
}

export declare namespace Anomalies {
  export {
    type FinancialAnomaly as FinancialAnomaly,
    type AnomalyListResponse as AnomalyListResponse,
    type AnomalyListParams as AnomalyListParams,
    type AnomalyUpdateStatusParams as AnomalyUpdateStatusParams,
  };
}
