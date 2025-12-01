// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as AssetsAPI from './assets';
import { AssetSearchParams, AssetSearchResponse, Assets } from './assets';
import * as PortfoliosAPI from './portfolios';
import {
  InvestmentPortfolio,
  PortfolioCreateParams,
  PortfolioListParams,
  PortfolioListResponse,
  PortfolioRebalanceParams,
  PortfolioRebalanceResponse,
  PortfolioUpdateParams,
  Portfolios,
} from './portfolios';

export class Investments extends APIResource {
  portfolios: PortfoliosAPI.Portfolios = new PortfoliosAPI.Portfolios(this._client);
  assets: AssetsAPI.Assets = new AssetsAPI.Assets(this._client);
}

Investments.Portfolios = Portfolios;
Investments.Assets = Assets;

export declare namespace Investments {
  export {
    Portfolios as Portfolios,
    type InvestmentPortfolio as InvestmentPortfolio,
    type PortfolioListResponse as PortfolioListResponse,
    type PortfolioRebalanceResponse as PortfolioRebalanceResponse,
    type PortfolioCreateParams as PortfolioCreateParams,
    type PortfolioUpdateParams as PortfolioUpdateParams,
    type PortfolioListParams as PortfolioListParams,
    type PortfolioRebalanceParams as PortfolioRebalanceParams,
  };

  export {
    Assets as Assets,
    type AssetSearchResponse as AssetSearchResponse,
    type AssetSearchParams as AssetSearchParams,
  };
}
