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
   * Currency of the portfolio (ISO 4217 code).
   */
  currency: string;

  /**
   * Timestamp when the portfolio data was last updated.
   */
  lastUpdated: string;

  /**
   * User-defined name of the portfolio.
   */
  name: string;

  /**
   * User's stated or AI-assessed risk tolerance for this portfolio.
   */
  riskTolerance: 'low' | 'medium' | 'aggressive' | 'very_aggressive';

  /**
   * Gain or loss for the current trading day.
   */
  todayGainLoss: number;

  /**
   * Current total market value of the portfolio.
   */
  totalValue: number;

  /**
   * Type of investment portfolio.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'crypto' | 'retirement' | 'other';

  /**
   * Total unrealized gain or loss on the portfolio.
   */
  unrealizedGainLoss: number;

  /**
   * AI-generated insights into portfolio performance and market outlook.
   */
  aiPerformanceInsights?: Array<InsightsAPI.AIInsight> | null;

  /**
   * Frequency at which AI should suggest or perform rebalancing.
   */
  aiRebalancingFrequency?: 'never' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | null;

  /**
   * Detailed list of assets currently held in the portfolio.
   */
  holdings?: Array<InvestmentPortfolio.Holding> | null;
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
     * Environmental, Social, and Governance (ESG) score for the asset.
     */
    esgScore?: number | null;

    /**
     * Unrealized gain/loss for this specific holding.
     */
    gainLoss?: number | null;
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
  status: 'analyzing' | 'proposed' | 'pending_confirmation' | 'executing' | 'completed' | 'failed';

  /**
   * Timestamp when the proposed rebalance expires if not confirmed.
   */
  confirmationExpiresAt?: string | null;

  /**
   * Indicates if user confirmation is required before execution.
   */
  confirmationRequired?: boolean | null;

  /**
   * AI's estimated impact of the rebalancing on portfolio metrics.
   */
  estimatedImpact?: string | null;

  /**
   * Timestamp of the last status update.
   */
  lastUpdated?: string;

  /**
   * List of proposed buy/sell trades if status is 'proposed'.
   */
  proposedTrades?: Array<PortfolioRebalanceResponse.ProposedTrade> | null;

  /**
   * A descriptive message about the current status.
   */
  statusMessage?: string | null;
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
   * Currency of the portfolio (ISO 4217 code).
   */
  currency: string;

  /**
   * Initial amount to invest in this portfolio.
   */
  initialInvestment: number;

  /**
   * Name for the new investment portfolio.
   */
  name: string;

  /**
   * Desired risk tolerance for this portfolio.
   */
  riskTolerance: 'low' | 'medium' | 'aggressive' | 'very_aggressive';

  /**
   * Type of investment portfolio to create.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'crypto' | 'retirement' | 'other';

  /**
   * If true, AI will automatically suggest and allocate initial assets based on risk
   * tolerance.
   */
  aiAutoAllocate?: boolean;

  /**
   * Optional: The account from which initial investment funds should be drawn.
   */
  linkedAccountId?: string | null;
}

export interface PortfolioUpdateParams {
  /**
   * Updated frequency for AI-driven rebalancing recommendations.
   */
  aiRebalancingFrequency?: 'never' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | null;

  /**
   * Updated name of the portfolio.
   */
  name?: string;

  /**
   * Updated risk tolerance for the portfolio. May trigger rebalancing suggestions.
   */
  riskTolerance?: 'low' | 'medium' | 'aggressive' | 'very_aggressive';
}

export interface PortfolioRebalanceParams {
  /**
   * The desired risk tolerance to rebalance the portfolio to.
   */
  targetRiskTolerance: 'low' | 'medium' | 'aggressive' | 'very_aggressive';

  /**
   * If true, user confirmation is required before executing trades. Only applicable
   * if dryRun is false.
   */
  confirmationRequired?: boolean;

  /**
   * If true, the AI will only propose trades without executing them. Default is
   * false.
   */
  dryRun?: boolean;

  /**
   * Optional: Specific target asset allocation percentages if not relying solely on
   * AI risk tolerance.
   */
  targetAssetAllocation?: Array<PortfolioRebalanceParams.TargetAssetAllocation> | null;
}

export namespace PortfolioRebalanceParams {
  export interface TargetAssetAllocation {
    assetClass?: string;

    percentage?: number;
  }
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
