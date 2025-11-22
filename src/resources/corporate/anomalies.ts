// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

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
    anomalyID: string,
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
  id: string;

  /**
   * AI's confidence score (0-1) in the anomaly detection.
   */
  aiConfidenceScore: number;

  /**
   * A concise summary of the anomaly.
   */
  description: string;

  /**
   * The ID of the specific entity (e.g., transaction ID, user ID) related to the
   * anomaly.
   */
  entityId: string;

  /**
   * The type of financial entity or activity the anomaly relates to.
   */
  entityType:
    | 'PaymentOrder'
    | 'Transaction'
    | 'Counterparty'
    | 'CorporateCard'
    | 'Invoice'
    | 'User'
    | 'Account';

  /**
   * AI-calculated risk score (0-100) for the anomaly.
   */
  riskScore: number;

  /**
   * AI-assessed severity level of the anomaly.
   */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Current review status of the anomaly.
   */
  status: 'New' | 'Under Review' | 'Escalated' | 'Dismissed' | 'Resolved';

  /**
   * Timestamp when the anomaly was detected.
   */
  timestamp: string;

  /**
   * Detailed description of the anomaly, including contributing factors.
   */
  details?: string | null;

  /**
   * AI-recommended immediate action to address the anomaly.
   */
  recommendedAction?: string | null;

  /**
   * List of IDs of other transactions potentially related to this anomaly.
   */
  relatedTransactions?: Array<string> | null;

  /**
   * Notes provided by an analyst or the AI upon resolving or dismissing the anomaly.
   */
  resolutionNotes?: string | null;
}

export interface AnomalyListResponse {
  data?: Array<FinancialAnomaly>;

  /**
   * The maximum number of items returned per page.
   */
  limit?: number;

  /**
   * The starting index of the list for pagination.
   */
  offset?: number;

  /**
   * The total number of available items.
   */
  total?: number;
}

export interface AnomalyListParams {
  /**
   * Filter results up to this date (inclusive, YYYY-MM-DD).
   */
  endDate?: string;

  /**
   * Filter anomalies by the type of financial entity they are related to.
   */
  entityType?: 'PaymentOrder' | 'Transaction' | 'Counterparty' | 'CorporateCard' | 'Invoice';

  /**
   * Maximum number of items to return.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;

  /**
   * Filter anomalies by their AI-assessed severity level.
   */
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';

  /**
   * Filter results from this date (inclusive, YYYY-MM-DD).
   */
  startDate?: string;

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
  resolutionNotes?: string | null;
}

export declare namespace Anomalies {
  export {
    type FinancialAnomaly as FinancialAnomaly,
    type AnomalyListResponse as AnomalyListResponse,
    type AnomalyListParams as AnomalyListParams,
    type AnomalyUpdateStatusParams as AnomalyUpdateStatusParams,
  };
}
