// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as InsightsAPI from '../transactions/insights';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Portfolios extends APIResource {
  /**
   * Creates a new investment portfolio, with options for initial asset allocation.
   *
   * @example
   * ```ts
   * const investmentPortfolio =
   *   await client.investments.portfolios.create({
   *     currency: 'USD',
   *     initialInvestment: 10000,
   *     name: 'My First Growth Portfolio',
   *     riskTolerance: 'medium',
   *     type: 'diversified',
   *     aiAutoAllocate: true,
   *     linkedAccountId: 'acc_chase_checking_4567',
   *   });
   * ```
   */
  create(body: PortfolioCreateParams, options?: RequestOptions): APIPromise<InvestmentPortfolio> {
    return this._client.post('/investments/portfolios', { body, ...options });
  }

  /**
   * Retrieves detailed information for a specific investment portfolio, including
   * holdings, performance, and AI insights.
   *
   * @example
   * ```ts
   * const investmentPortfolio =
   *   await client.investments.portfolios.retrieve(
   *     'portfolio_equity_growth',
   *   );
   * ```
   */
  retrieve(portfolioID: unknown, options?: RequestOptions): APIPromise<InvestmentPortfolio> {
    return this._client.get(path`/investments/portfolios/${portfolioID}`, options);
  }

  /**
   * Updates high-level details of an investment portfolio, such as name or risk
   * tolerance.
   *
   * @example
   * ```ts
   * const investmentPortfolio =
   *   await client.investments.portfolios.update(
   *     'portfolio_equity_growth',
   *     {
   *       aiRebalancingFrequency: 'quarterly',
   *       riskTolerance: 'medium',
   *     },
   *   );
   * ```
   */
  update(
    portfolioID: unknown,
    body: PortfolioUpdateParams,
    options?: RequestOptions,
  ): APIPromise<InvestmentPortfolio> {
    return this._client.put(path`/investments/portfolios/${portfolioID}`, { body, ...options });
  }

  /**
   * Retrieves a summary of all investment portfolios linked to the user's account.
   *
   * @example
   * ```ts
   * const portfolios =
   *   await client.investments.portfolios.list();
   * ```
   */
  list(
    query: PortfolioListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PortfolioListResponse> {
    return this._client.get('/investments/portfolios', { query, ...options });
  }

  /**
   * Triggers an AI-driven rebalancing process for a specific investment portfolio
   * based on a target risk tolerance or strategy.
   *
   * @example
   * ```ts
   * const response =
   *   await client.investments.portfolios.rebalance(
   *     'portfolio_equity_growth',
   *     {
   *       targetRiskTolerance: 'medium',
   *       confirmationRequired: true,
   *       dryRun: true,
   *     },
   *   );
   * ```
   */
  rebalance(
    portfolioID: unknown,
    body: PortfolioRebalanceParams,
    options?: RequestOptions,
  ): APIPromise<PortfolioRebalanceResponse> {
    return this._client.post(path`/investments/portfolios/${portfolioID}/rebalance`, { body, ...options });
  }
}

export interface InvestmentPortfolio {
  /**
   * Unique identifier for the investment portfolio.
   */
  id: unknown;

  /**
   * ISO 4217 currency code of the portfolio.
   */
  currency: unknown;

  /**
   * Timestamp when the portfolio data was last updated.
   */
  lastUpdated: unknown;

  /**
   * Name of the portfolio.
   */
  name: unknown;

  /**
   * User's stated or AI-assessed risk tolerance for this portfolio.
   */
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive';

  /**
   * Daily gain or loss on the portfolio.
   */
  todayGainLoss: unknown;

  /**
   * Current total market value of the portfolio.
   */
  totalValue: unknown;

  /**
   * General type or strategy of the portfolio.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'crypto' | 'retirement' | 'other';

  /**
   * Total unrealized gain or loss on the portfolio.
   */
  unrealizedGainLoss: unknown;

  /**
   * AI-driven insights into portfolio performance and market outlook.
   */
  aiPerformanceInsights?: Array<InsightsAPI.AIInsight> | null;

  /**
   * Frequency at which AI-driven rebalancing is set to occur.
   */
  aiRebalancingFrequency?: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'never' | null;

  /**
   * List of individual assets held in the portfolio.
   */
  holdings?: Array<InvestmentPortfolio.Holding>;
}

export namespace InvestmentPortfolio {
  export interface Holding {
    /**
     * Average cost per unit.
     */
    averageCost: unknown;

    /**
     * Current market price per unit.
     */
    currentPrice: unknown;

    /**
     * Total market value of the holding.
     */
    marketValue: unknown;

    /**
     * Full name of the investment asset.
     */
    name: unknown;

    /**
     * Percentage of the total portfolio value this holding represents.
     */
    percentageOfPortfolio: unknown;

    /**
     * Number of units held.
     */
    quantity: unknown;

    /**
     * Stock ticker or asset symbol.
     */
    symbol: unknown;

    /**
     * Overall ESG (Environmental, Social, Governance) score of the asset (0-10).
     */
    esgScore?: unknown;
  }
}

export interface PortfolioListResponse {
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

  data?: Array<InvestmentPortfolio>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface PortfolioRebalanceResponse {
  /**
   * ID of the portfolio being rebalanced.
   */
  portfolioId: unknown;

  /**
   * Unique identifier for the rebalancing operation.
   */
  rebalanceId: unknown;

  /**
   * Current status of the rebalancing operation.
   */
  status: 'analyzing' | 'pending_confirmation' | 'executing_trades' | 'completed' | 'failed';

  /**
   * A descriptive message about the current rebalance status.
   */
  statusMessage: unknown;

  /**
   * Timestamp when the rebalance confirmation expires, if `confirmationRequired` is
   * true.
   */
  confirmationExpiresAt?: unknown;

  /**
   * Indicates if user confirmation is required to proceed with trades.
   */
  confirmationRequired?: unknown;

  /**
   * AI-estimated impact of the rebalance on the portfolio.
   */
  estimatedImpact?: unknown;

  /**
   * List of proposed trades if `dryRun` was true and status is
   * `pending_confirmation`.
   */
  proposedTrades?: Array<PortfolioRebalanceResponse.ProposedTrade> | null;
}

export namespace PortfolioRebalanceResponse {
  export interface ProposedTrade {
    action?: 'buy' | 'sell';

    estimatedPrice?: unknown;

    quantity?: unknown;

    symbol?: unknown;
  }
}

export interface PortfolioCreateParams {
  /**
   * ISO 4217 currency code of the portfolio.
   */
  currency: unknown;

  /**
   * Initial amount to invest into the portfolio.
   */
  initialInvestment: unknown;

  /**
   * Name for the new investment portfolio.
   */
  name: unknown;

  /**
   * Desired risk tolerance for this portfolio.
   */
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive';

  /**
   * General type or strategy of the portfolio.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'crypto' | 'retirement' | 'other';

  /**
   * If true, AI will automatically allocate initial investment based on risk
   * tolerance.
   */
  aiAutoAllocate?: unknown;

  /**
   * Optional: ID of a linked account to fund the initial investment.
   */
  linkedAccountId?: unknown;
}

export interface PortfolioUpdateParams {
  /**
   * Updated frequency for AI-driven rebalancing.
   */
  aiRebalancingFrequency?: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'never' | null;

  /**
   * Updated name of the portfolio.
   */
  name?: unknown;

  /**
   * Updated risk tolerance for this portfolio. May trigger rebalancing.
   */
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive';
}

export interface PortfolioListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export interface PortfolioRebalanceParams {
  /**
   * The desired risk tolerance for rebalancing the portfolio.
   */
  targetRiskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive';

  /**
   * If true, user confirmation is required before executing actual trades after a
   * dry run.
   */
  confirmationRequired?: unknown;

  /**
   * If true, only simulate the rebalance without executing trades. Returns proposed
   * trades.
   */
  dryRun?: unknown;
}

export declare namespace Portfolios {
  export {
    type InvestmentPortfolio as InvestmentPortfolio,
    type PortfolioListResponse as PortfolioListResponse,
    type PortfolioRebalanceResponse as PortfolioRebalanceResponse,
    type PortfolioCreateParams as PortfolioCreateParams,
    type PortfolioUpdateParams as PortfolioUpdateParams,
    type PortfolioListParams as PortfolioListParams,
    type PortfolioRebalanceParams as PortfolioRebalanceParams,
  };
}
