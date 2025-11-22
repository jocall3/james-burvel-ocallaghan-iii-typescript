// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ProductsAPI from './products';
import { ProductListParams, ProductListResponse, Products } from './products';

export class Marketplace extends APIResource {
  products: ProductsAPI.Products = new ProductsAPI.Products(this._client);
}

Marketplace.Products = Products;

export declare namespace Marketplace {
  export {
    Products as Products,
    type ProductListResponse as ProductListResponse,
    type ProductListParams as ProductListParams,
  };
}
