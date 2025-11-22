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
  WalletListResponse,
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
  retrieveNFTs(options?: RequestOptions): APIPromise<Web3RetrieveNFTsResponse> {
    return this._client.get('/web3/nfts', options);
  }
}

export type Web3RetrieveNFTsResponse = Array<Web3RetrieveNFTsResponse.Web3RetrieveNFTsResponseItem>;

export namespace Web3RetrieveNFTsResponse {
  export interface Web3RetrieveNFTsResponseItem {
    /**
     * Unique identifier for the NFT (often a combination of contract and token ID).
     */
    id: string;

    /**
     * The blockchain network on which the NFT exists.
     */
    blockchainNetwork: 'Ethereum' | 'Solana' | 'Polygon' | 'other';

    /**
     * Name of the NFT collection.
     */
    collectionName: string;

    /**
     * The smart contract address of the NFT collection.
     */
    contractAddress: string;

    /**
     * URL to the NFT's image.
     */
    imageUrl: string;

    /**
     * Name of the specific NFT.
     */
    name: string;

    /**
     * The blockchain address of the current owner.
     */
    ownerAddress: string;

    /**
     * The unique token ID within the collection.
     */
    tokenId: string;

    /**
     * List of traits and attributes of the NFT.
     */
    attributes?: Array<Web3RetrieveNFTsResponseItem.Attribute> | null;

    /**
     * Description of the NFT.
     */
    description?: string | null;

    /**
     * AI-estimated current market value of the NFT in USD.
     */
    estimatedValueUSD?: number | null;

    /**
     * Last known sale price of this specific NFT in USD.
     */
    lastSalePriceUSD?: number | null;
  }

  export namespace Web3RetrieveNFTsResponseItem {
    export interface Attribute {
      trait_type?: string;

      value?: string;
    }
  }
}

Web3.Wallets = Wallets;
Web3.Transactions = Transactions;

export declare namespace Web3 {
  export { type Web3RetrieveNFTsResponse as Web3RetrieveNFTsResponse };

  export {
    Wallets as Wallets,
    type CryptoWalletConnection as CryptoWalletConnection,
    type WalletListResponse as WalletListResponse,
    type WalletRetrieveBalancesResponse as WalletRetrieveBalancesResponse,
    type WalletConnectParams as WalletConnectParams,
  };

  export {
    Transactions as Transactions,
    type TransactionInitiateTransferResponse as TransactionInitiateTransferResponse,
    type TransactionInitiateTransferParams as TransactionInitiateTransferParams,
  };
}
