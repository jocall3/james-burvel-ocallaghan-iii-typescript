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
   * The base currency of the portfolio.
   */
  currency: string;

  /**
   * Timestamp when the portfolio data was last synced/updated.
   */
  lastUpdated: string;

  /**
   * Name of the portfolio.
   */
  name: string;

  /**
   * User-defined or AI-assessed risk tolerance for this portfolio.
   */
  riskTolerance: 'conservative' | 'balanced' | 'medium' | 'aggressive' | 'speculative';

  /**
   * Current total market value of the portfolio.
   */
  totalValue: number;

  /**
   * Type or strategy of the investment portfolio.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'retirement' | 'crypto' | 'custom';

  /**
   * AI-generated insights and recommendations related to portfolio performance.
   */
  aiPerformanceInsights?: Array<InsightsAPI.AIInsight> | null;

  /**
   * Frequency at which the AI is configured to suggest or perform rebalancing.
   */
  aiRebalancingFrequency?: 'never' | 'monthly' | 'quarterly' | 'annually' | null;

  /**
   * Detailed list of assets held within the portfolio.
   */
  holdings?: Array<InvestmentPortfolio.Holding> | null;

  /**
   * Gain or loss for the current trading day.
   */
  todayGainLoss?: number | null;

  /**
   * Total unrealized gain or loss for the portfolio.
   */
  unrealizedGainLoss?: number | null;
}

export namespace InvestmentPortfolio {
  export interface Holding {
    /**
     * Average cost per unit of the asset.
     */
    averageCost: number;

    /**
     * Current market price per unit.
     */
    currentPrice: number;

    /**
     * Current total market value of this holding.
     */
    marketValue: number;

    /**
     * Full name of the asset.
     */
    name: string;

    /**
     * Number of units held.
     */
    quantity: number;

    /**
     * Ticker symbol or identifier of the asset.
     */
    symbol: string;

    /**
     * ESG (Environmental, Social, Governance) score of the holding, if available.
     */
    esgScore?: number | null;

    /**
     * Unrealized gain or loss for this specific holding.
     */
    gainLoss?: number | null;

    /**
     * Percentage of the total portfolio value represented by this holding.
     */
    percentageOfPortfolio?: number;
  }
}

export type PortfolioListResponse = Array<InvestmentPortfolio>;

export interface PortfolioRebalanceResponse {
  /**
   * The ID of the portfolio being rebalanced.
   */
  portfolioId: string;

  /**
   * Unique ID for the rebalancing operation.
   */
  rebalanceId: string;

  /**
   * Current status of the rebalancing operation.
   */
  status: 'analyzing' | 'proposed' | 'pending_confirmation' | 'executing' | 'completed' | 'failed';

  /**
   * A descriptive message about the current status.
   */
  statusMessage: string;

  /**
   * Timestamp when the proposed trades will expire if not confirmed.
   */
  confirmationExpiresAt?: string | null;

  /**
   * Indicates if user confirmation is pending for proposed trades.
   */
  confirmationRequired?: boolean;

  /**
   * AI's estimated impact of the rebalancing on portfolio metrics.
   */
  estimatedImpact?: string | null;

  /**
   * A list of proposed trades, if status is 'proposed' or 'pending_confirmation'.
   */
  proposedTrades?: Array<PortfolioRebalanceResponse.ProposedTrade> | null;
}

export namespace PortfolioRebalanceResponse {
  export interface ProposedTrade {
    /**
     * Action to perform (buy/sell).
     */
    action?: 'buy' | 'sell';

    /**
     * Symbol of the asset to trade.
     */
    assetSymbol?: string;

    /**
     * Estimated price per unit.
     */
    estimatedPrice?: number;

    /**
     * Quantity of shares/units.
     */
    quantity?: number;
  }
}

export interface PortfolioCreateParams {
  /**
   * The base currency of the portfolio.
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
  riskTolerance: 'conservative' | 'balanced' | 'medium' | 'aggressive' | 'speculative';

  /**
   * Type or strategy of the investment portfolio.
   */
  type: 'equities' | 'bonds' | 'diversified' | 'retirement' | 'crypto' | 'custom';

  /**
   * If true, AI will automatically suggest and allocate assets based on risk
   * tolerance.
   */
  aiAutoAllocate?: boolean;

  /**
   * Optional: The ID of a linked bank account to draw initial investment from.
   */
  linkedAccountId?: string | null;
}

export interface PortfolioUpdateParams {
  /**
   * Updated frequency for AI-driven rebalancing.
   */
  aiRebalancingFrequency?: 'never' | 'monthly' | 'quarterly' | 'annually';

  /**
   * Updated name of the portfolio.
   */
  name?: string;

  /**
   * Updated risk tolerance for this portfolio.
   */
  riskTolerance?: 'conservative' | 'balanced' | 'medium' | 'aggressive' | 'speculative';
}

export interface PortfolioRebalanceParams {
  /**
   * The desired risk tolerance for the portfolio after rebalancing.
   */
  targetRiskTolerance: 'conservative' | 'balanced' | 'medium' | 'aggressive' | 'speculative';

  /**
   * If true, explicit user confirmation is required before trades are executed.
   */
  confirmationRequired?: boolean;

  /**
   * If true, the AI will only propose trades without executing them.
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
    type PortfolioRebalanceParams as PortfolioRebalanceParams,
  };
}
