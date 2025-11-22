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
  retrieve(portfolioID: string, options?: RequestOptions): APIPromise<InvestmentPortfolio> {
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
    portfolioID: string,
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
    portfolioID: string,
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
  id: string;

  /**
   * ISO 4217 currency code of the portfolio.
   */
  currency: string;

  /**
   * Timestamp when the portfolio data was last updated.
   */
  lastUpdated: string;

  /**
   * Name of the portfolio.
   */
  name: string;

  /**
   * User's stated or AI-assessed risk tolerance for this portfolio.
   */
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive';

  /**
   * Daily gain or loss on the portfolio.
   */
  todayGainLoss: number;

  /**
   * Current total market value of the portfolio.
   */
  totalValue: number;

  /**
   * General type or strategy of the portfolio.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'crypto' | 'retirement' | 'other';

  /**
   * Total unrealized gain or loss on the portfolio.
   */
  unrealizedGainLoss: number;

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
    averageCost: number;

    /**
     * Current market price per unit.
     */
    currentPrice: number;

    /**
     * Total market value of the holding.
     */
    marketValue: number;

    /**
     * Full name of the investment asset.
     */
    name: string;

    /**
     * Percentage of the total portfolio value this holding represents.
     */
    percentageOfPortfolio: number;

    /**
     * Number of units held.
     */
    quantity: number;

    /**
     * Stock ticker or asset symbol.
     */
    symbol: string;

    /**
     * Overall ESG (Environmental, Social, Governance) score of the asset (0-10).
     */
    esgScore?: number | null;
  }
}

export interface PortfolioListResponse {
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

  data?: Array<InvestmentPortfolio>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface PortfolioRebalanceResponse {
  /**
   * ID of the portfolio being rebalanced.
   */
  portfolioId: string;

  /**
   * Unique identifier for the rebalancing operation.
   */
  rebalanceId: string;

  /**
   * Current status of the rebalancing operation.
   */
  status: 'analyzing' | 'pending_confirmation' | 'executing_trades' | 'completed' | 'failed';

  /**
   * A descriptive message about the current rebalance status.
   */
  statusMessage: string;

  /**
   * Timestamp when the rebalance confirmation expires, if `confirmationRequired` is
   * true.
   */
  confirmationExpiresAt?: string | null;

  /**
   * Indicates if user confirmation is required to proceed with trades.
   */
  confirmationRequired?: boolean | null;

  /**
   * AI-estimated impact of the rebalance on the portfolio.
   */
  estimatedImpact?: string | null;

  /**
   * List of proposed trades if `dryRun` was true and status is
   * `pending_confirmation`.
   */
  proposedTrades?: Array<PortfolioRebalanceResponse.ProposedTrade> | null;
}

export namespace PortfolioRebalanceResponse {
  export interface ProposedTrade {
    action?: 'buy' | 'sell';

    estimatedPrice?: number;

    quantity?: number;

    symbol?: string;
  }
}

export interface PortfolioCreateParams {
  /**
   * ISO 4217 currency code of the portfolio.
   */
  currency: string;

  /**
   * Initial amount to invest into the portfolio.
   */
  initialInvestment: number;

  /**
   * Name for the new investment portfolio.
   */
  name: string;

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
  aiAutoAllocate?: boolean;

  /**
   * Optional: ID of a linked account to fund the initial investment.
   */
  linkedAccountId?: string | null;
}

export interface PortfolioUpdateParams {
  /**
   * Updated frequency for AI-driven rebalancing.
   */
  aiRebalancingFrequency?: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'never' | null;

  /**
   * Updated name of the portfolio.
   */
  name?: string;

  /**
   * Updated risk tolerance for this portfolio. May trigger rebalancing.
   */
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive';
}

export interface PortfolioListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
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
  confirmationRequired?: boolean;

  /**
   * If true, only simulate the rebalance without executing trades. Returns proposed
   * trades.
   */
  dryRun?: boolean;
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
