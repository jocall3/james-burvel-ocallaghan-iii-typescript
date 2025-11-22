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
   * const investmentPortfolios =
   *   await client.investments.portfolios.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<PortfolioListResponse> {
    return this._client.get('/investments/portfolios', options);
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
   *       confirmationRequired: true,
   *       dryRun: true,
   *       targetRiskTolerance: 'medium',
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
   * Base currency of the portfolio.
   */
  currency: string;

  /**
   * Timestamp when the portfolio data was last synced/updated.
   */
  lastUpdated: string;

  /**
   * User-friendly name of the portfolio.
   */
  name: string;

  /**
   * User's stated or AI-derived risk tolerance for this portfolio.
   */
  riskTolerance: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';

  /**
   * Current total market value of the portfolio.
   */
  totalValue: number;

  /**
   * Primary asset type or strategy of the portfolio.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'crypto' | 'reit' | 'commodities' | 'other';

  /**
   * AI-driven insights into portfolio performance and market outlook.
   */
  aiPerformanceInsights?: Array<InsightsAPI.AIInsight> | null;

  /**
   * Frequency at which the AI is configured to suggest or perform rebalancing for
   * this portfolio.
   */
  aiRebalancingFrequency?: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'manual' | null;

  /**
   * Detailed breakdown of assets held within the portfolio.
   */
  holdings?: Array<InvestmentPortfolio.Holding> | null;

  /**
   * Today's gain or loss for the portfolio.
   */
  todayGainLoss?: number;

  /**
   * Total unrealized gain or loss for the portfolio.
   */
  unrealizedGainLoss?: number;
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
     * Total market value of this holding.
     */
    marketValue: number;

    /**
     * Full name of the asset.
     */
    name: string;

    /**
     * Percentage this holding represents of the total portfolio value.
     */
    percentageOfPortfolio: number;

    /**
     * Number of units held.
     */
    quantity: number;

    /**
     * Ticker symbol of the asset.
     */
    symbol: string;

    /**
     * ESG (Environmental, Social, Governance) score for the asset.
     */
    esgScore?: number | null;

    /**
     * Total gain or loss for this holding.
     */
    gainLoss?: number;
  }
}

export type PortfolioListResponse = Array<InvestmentPortfolio>;

export interface PortfolioRebalanceResponse {
  /**
   * The ID of the portfolio being rebalanced.
   */
  portfolioId: string;

  /**
   * Unique identifier for the rebalancing operation.
   */
  rebalanceId: string;

  /**
   * Current status of the rebalancing operation.
   */
  status: 'analyzing' | 'pending_confirmation' | 'executing' | 'completed' | 'failed' | 'cancelled';

  /**
   * A descriptive message about the current status.
   */
  statusMessage: string;

  /**
   * Timestamp when pending confirmation will expire.
   */
  confirmationExpiresAt?: string | null;

  /**
   * Indicates if user confirmation is needed to proceed with trades.
   */
  confirmationRequired?: boolean;

  /**
   * AI's estimated impact of the rebalancing on portfolio metrics.
   */
  estimatedImpact?: string | null;

  /**
   * Details of proposed trades if status is 'pending_confirmation' or 'executing'.
   */
  proposedTrades?: Array<PortfolioRebalanceResponse.ProposedTrade> | null;
}

export namespace PortfolioRebalanceResponse {
  export interface ProposedTrade {
    action?: 'buy' | 'sell';

    estimatedCostRevenue?: number;

    quantity?: number;

    symbol?: string;
  }
}

export interface PortfolioCreateParams {
  /**
   * Base currency of the portfolio.
   */
  currency: string;

  /**
   * Initial amount to invest in the portfolio.
   */
  initialInvestment: number;

  /**
   * Name for the new investment portfolio.
   */
  name: string;

  /**
   * User's risk tolerance for this portfolio.
   */
  riskTolerance: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';

  /**
   * Primary asset type or strategy of the portfolio.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'crypto' | 'reit' | 'commodities' | 'other';

  /**
   * If true, AI will automatically suggest and execute initial asset allocation
   * based on risk tolerance.
   */
  aiAutoAllocate?: boolean;

  /**
   * Optional: The account from which initial funds should be drawn.
   */
  linkedAccountId?: string | null;
}

export interface PortfolioUpdateParams {
  /**
   * Updated frequency for AI-driven portfolio rebalancing.
   */
  aiRebalancingFrequency?: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'manual';

  /**
   * New name for the investment portfolio.
   */
  name?: string;

  /**
   * Updated risk tolerance for this portfolio.
   */
  riskTolerance?: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';

  /**
   * Optional: Target asset allocation percentages for rebalancing.
   */
  targetAllocation?: PortfolioUpdateParams.TargetAllocation | null;
}

export namespace PortfolioUpdateParams {
  /**
   * Optional: Target asset allocation percentages for rebalancing.
   */
  export interface TargetAllocation {
    bonds?: number;

    cash?: number;

    equities?: number;
  }
}

export interface PortfolioRebalanceParams {
  /**
   * If true, user confirmation is required before executing trades (even if dryRun
   * is false).
   */
  confirmationRequired?: boolean;

  /**
   * If true, the AI will only propose trades without executing them.
   */
  dryRun?: boolean;

  /**
   * Optional: The desired risk tolerance for the rebalancing. If not provided, uses
   * portfolio's current risk tolerance.
   */
  targetRiskTolerance?: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive' | null;
}

export declare namespace Portfolios {
  export {
    type InvestmentPortfolio as InvestmentPortfolio,
    type PortfolioListResponse as PortfolioListResponse,
    type PortfolioRebalanceResponse as PortfolioRebalanceResponse,
    type PortfolioCreateParams as PortfolioCreateParams,
    type PortfolioUpdateParams as PortfolioUpdateParams,
    type PortfolioRebalanceParams as PortfolioRebalanceParams,
  };
}
