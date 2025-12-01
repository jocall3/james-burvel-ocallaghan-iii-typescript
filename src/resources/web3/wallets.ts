// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Wallets extends APIResource {
  /**
   * Retrieves a list of all securely linked cryptocurrency wallets (e.g., MetaMask,
   * Ledger integration), showing their addresses, associated networks, and
   * verification status.
   *
   * @example
   * ```ts
   * const wallets = await client.web3.wallets.list();
   * ```
   */
  list(
    query: WalletListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<WalletListResponse> {
    return this._client.get('/web3/wallets', { query, ...options });
  }

  /**
   * Initiates the process to securely connect a new cryptocurrency wallet to the
   * user's profile, typically involving a signed message or OAuth flow from the
   * wallet provider.
   *
   * @example
   * ```ts
   * const cryptoWalletConnection =
   *   await client.web3.wallets.connect({
   *     blockchainNetwork: 'Ethereum',
   *     signedMessage:
   *       '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
   *     walletAddress: '0x123abc456def7890...',
   *     walletProvider: 'MetaMask',
   *   });
   * ```
   */
  connect(body: WalletConnectParams, options?: RequestOptions): APIPromise<CryptoWalletConnection> {
    return this._client.post('/web3/wallets', { body, ...options });
  }

  /**
   * Retrieves the current balances of all recognized crypto assets within a specific
   * connected wallet.
   *
   * @example
   * ```ts
   * const response = await client.web3.wallets.retrieveBalances(
   *   'wallet_conn_eth_0xabc123',
   * );
   * ```
   */
  retrieveBalances(
    walletID: unknown,
    query: WalletRetrieveBalancesParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<WalletRetrieveBalancesResponse> {
    return this._client.get(path`/web3/wallets/${walletID}/balances`, { query, ...options });
  }
}

export interface CryptoWalletConnection {
  /**
   * Unique identifier for this wallet connection.
   */
  id: unknown;

  /**
   * The blockchain network this wallet is primarily connected to (e.g., Ethereum,
   * Solana, Polygon).
   */
  blockchainNetwork: unknown;

  /**
   * Timestamp when the wallet's data was last synchronized.
   */
  lastSynced: unknown;

  /**
   * Indicates if read access (balances, NFTs) is granted.
   */
  readAccessGranted: unknown;

  /**
   * Current status of the wallet connection.
   */
  status: 'connected' | 'disconnected' | 'pending_verification' | 'error';

  /**
   * Public address of the connected cryptocurrency wallet.
   */
  walletAddress: unknown;

  /**
   * Name of the wallet provider (e.g., MetaMask, Ledger, Phantom).
   */
  walletProvider: unknown;

  /**
   * Indicates if write access (transactions) is granted. Requires higher
   * permission/security.
   */
  writeAccessGranted: unknown;
}

export interface WalletListResponse {
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

  data?: Array<CryptoWalletConnection>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface WalletRetrieveBalancesResponse {
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

  data?: Array<WalletRetrieveBalancesResponse.Data>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export namespace WalletRetrieveBalancesResponse {
  export interface Data {
    /**
     * Full name of the crypto asset.
     */
    assetName: unknown;

    /**
     * Symbol of the crypto asset (e.g., ETH, BTC, USDC).
     */
    assetSymbol: unknown;

    /**
     * Current balance of the asset in the wallet.
     */
    balance: unknown;

    /**
     * Current USD value of the asset balance.
     */
    usdValue: unknown;

    /**
     * The contract address for ERC-20 tokens or similar.
     */
    contractAddress?: unknown;

    /**
     * The blockchain network the asset resides on (if different from wallet's
     * primary).
     */
    network?: unknown;
  }
}

export interface WalletListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export interface WalletConnectParams {
  /**
   * The blockchain network for this wallet (e.g., Ethereum, Solana).
   */
  blockchainNetwork: unknown;

  /**
   * A message cryptographically signed by the wallet owner to prove
   * ownership/intent.
   */
  signedMessage: unknown;

  /**
   * The public address of the cryptocurrency wallet.
   */
  walletAddress: unknown;

  /**
   * The name of the wallet provider (e.g., MetaMask, Phantom).
   */
  walletProvider: unknown;

  /**
   * If true, requests write access to initiate transactions from this wallet.
   */
  requestWriteAccess?: unknown;
}

export interface WalletRetrieveBalancesParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export declare namespace Wallets {
  export {
    type CryptoWalletConnection as CryptoWalletConnection,
    type WalletListResponse as WalletListResponse,
    type WalletRetrieveBalancesResponse as WalletRetrieveBalancesResponse,
    type WalletListParams as WalletListParams,
    type WalletConnectParams as WalletConnectParams,
    type WalletRetrieveBalancesParams as WalletRetrieveBalancesParams,
  };
}
