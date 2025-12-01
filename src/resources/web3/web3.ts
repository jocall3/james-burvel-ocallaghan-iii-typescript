// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TransactionsAPI from './transactions';
import {
  TransactionInitiateTransferParams,
  TransactionInitiateTransferResponse,
  Transactions,
} from './transactions';
import * as WalletsAPI from './wallets';
import {
  CryptoWalletConnection,
  WalletConnectParams,
  WalletListParams,
  WalletListResponse,
  WalletRetrieveBalancesParams,
  WalletRetrieveBalancesResponse,
  Wallets,
} from './wallets';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Web3 extends APIResource {
  wallets: WalletsAPI.Wallets = new WalletsAPI.Wallets(this._client);
  transactions: TransactionsAPI.Transactions = new TransactionsAPI.Transactions(this._client);

  /**
   * Fetches a comprehensive list of Non-Fungible Tokens (NFTs) owned by the user
   * across all connected wallets and supported blockchain networks, including
   * metadata and market values.
   *
   * @example
   * ```ts
   * const response = await client.web3.retrieveNFTs();
   * ```
   */
  retrieveNFTs(
    query: Web3RetrieveNFTsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Web3RetrieveNFTsResponse> {
    return this._client.get('/web3/nfts', { query, ...options });
  }
}

export interface Web3RetrieveNFTsResponse {
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

  data?: Array<Web3RetrieveNFTsResponse.Data>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export namespace Web3RetrieveNFTsResponse {
  export interface Data {
    /**
     * Unique identifier for the NFT within the system.
     */
    id: unknown;

    /**
     * Blockchain network on which the NFT exists.
     */
    blockchainNetwork: unknown;

    /**
     * Name of the NFT collection.
     */
    collectionName: unknown;

    /**
     * Blockchain contract address of the NFT collection.
     */
    contractAddress: unknown;

    /**
     * URL to the NFT's image.
     */
    imageUrl: unknown;

    /**
     * Name of the specific NFT.
     */
    name: unknown;

    /**
     * Blockchain address of the current owner.
     */
    ownerAddress: unknown;

    /**
     * Unique ID of the token within its contract.
     */
    tokenId: unknown;

    /**
     * Key-value attributes of the NFT (e.g., rarity traits).
     */
    attributes?: Array<Data.Attribute> | null;

    /**
     * Description of the NFT.
     */
    description?: unknown;

    /**
     * AI-estimated current market value in USD.
     */
    estimatedValueUSD?: unknown;

    /**
     * Last known sale price in USD.
     */
    lastSalePriceUSD?: unknown;
  }

  export namespace Data {
    export interface Attribute {
      trait_type?: unknown;

      value?: unknown;
    }
  }
}

export interface Web3RetrieveNFTsParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

Web3.Wallets = Wallets;
Web3.Transactions = Transactions;

export declare namespace Web3 {
  export {
    type Web3RetrieveNFTsResponse as Web3RetrieveNFTsResponse,
    type Web3RetrieveNFTsParams as Web3RetrieveNFTsParams,
  };

  export {
    Wallets as Wallets,
    type CryptoWalletConnection as CryptoWalletConnection,
    type WalletListResponse as WalletListResponse,
    type WalletRetrieveBalancesResponse as WalletRetrieveBalancesResponse,
    type WalletListParams as WalletListParams,
    type WalletConnectParams as WalletConnectParams,
    type WalletRetrieveBalancesParams as WalletRetrieveBalancesParams,
  };

  export {
    Transactions as Transactions,
    type TransactionInitiateTransferResponse as TransactionInitiateTransferResponse,
    type TransactionInitiateTransferParams as TransactionInitiateTransferParams,
  };
}
