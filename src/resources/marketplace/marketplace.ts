// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ProductsAPI from './products';
import {
  ProductClaimOfferParams,
  ProductClaimOfferResponse,
  ProductListParams,
  ProductListResponse,
  ProductSimulatePurchaseParams,
  ProductSimulatePurchaseResponse,
  Products,
} from './products';

export class Marketplace extends APIResource {
  products: ProductsAPI.Products = new ProductsAPI.Products(this._client);
}

Marketplace.Products = Products;

export declare namespace Marketplace {
  export {
    Products as Products,
    type ProductListResponse as ProductListResponse,
    type ProductClaimOfferResponse as ProductClaimOfferResponse,
    type ProductSimulatePurchaseResponse as ProductSimulatePurchaseResponse,
    type ProductListParams as ProductListParams,
    type ProductClaimOfferParams as ProductClaimOfferParams,
    type ProductSimulatePurchaseParams as ProductSimulatePurchaseParams,
  };
}
