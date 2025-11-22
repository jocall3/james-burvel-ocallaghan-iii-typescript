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
   * const cryptoWalletConnections =
   *   await client.web3.wallets.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<WalletListResponse> {
    return this._client.get('/web3/wallets', options);
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
  retrieveBalances(walletID: string, options?: RequestOptions): APIPromise<WalletRetrieveBalancesResponse> {
    return this._client.get(path`/web3/wallets/${walletID}/balances`, options);
  }
}

export interface CryptoWalletConnection {
  /**
   * Unique identifier for this wallet connection.
   */
  id: string;

  /**
   * The primary blockchain network this wallet is connected to.
   */
  blockchainNetwork:
    | 'Ethereum'
    | 'Solana'
    | 'Polygon'
    | 'BinanceSmartChain'
    | 'Arbitrum'
    | 'Optimism'
    | 'other';

  /**
   * Timestamp of the last successful synchronization of wallet data.
   */
  lastSynced: string;

  /**
   * Indicates if has permission to read balances and transaction history.
   */
  readAccessGranted: boolean;

  /**
   * Current status of the wallet connection.
   */
  status: 'connected' | 'disconnected' | 'verification_pending' | 'error';

  /**
   * The public address of the connected cryptocurrency wallet.
   */
  walletAddress: string;

  /**
   * The name of the wallet provider (e.g., MetaMask, Ledger, Phantom).
   */
  walletProvider: string;

  /**
   * Indicates if has permission to initiate transactions requiring user
   * confirmation.
   */
  writeAccessGranted: boolean;
}

export type WalletListResponse = Array<CryptoWalletConnection>;

export type WalletRetrieveBalancesResponse =
  Array<WalletRetrieveBalancesResponse.WalletRetrieveBalancesResponseItem>;

export namespace WalletRetrieveBalancesResponse {
  export interface WalletRetrieveBalancesResponseItem {
    /**
     * Full name of the cryptocurrency.
     */
    assetName: string;

    /**
     * Ticker symbol of the cryptocurrency (e.g., ETH, BTC, USDC).
     */
    assetSymbol: string;

    /**
     * The current balance of the asset in the wallet.
     */
    balance: number;

    /**
     * The equivalent value of the balance in USD.
     */
    usdValue: number;

    /**
     * The blockchain network where this asset resides.
     */
    blockchainNetwork?:
      | 'Ethereum'
      | 'Solana'
      | 'Polygon'
      | 'BinanceSmartChain'
      | 'Arbitrum'
      | 'Optimism'
      | 'other';

    /**
     * The contract address for ERC-20 tokens (if applicable).
     */
    contractAddress?: string | null;
  }
}

export interface WalletConnectParams {
  /**
   * The primary blockchain network of the wallet.
   */
  blockchainNetwork:
    | 'Ethereum'
    | 'Solana'
    | 'Polygon'
    | 'BinanceSmartChain'
    | 'Arbitrum'
    | 'Optimism'
    | 'other';

  /**
   * A message signed by the wallet to prove ownership (e.g., EIP-191).
   */
  signedMessage: string;

  /**
   * The public address of the cryptocurrency wallet.
   */
  walletAddress: string;

  /**
   * The name of the wallet provider.
   */
  walletProvider: string;

  /**
   * Set to true if write access (transaction initiation) is desired (requires
   * further permissions).
   */
  grantWriteAccess?: boolean;
}

export declare namespace Wallets {
  export {
    type CryptoWalletConnection as CryptoWalletConnection,
    type WalletListResponse as WalletListResponse,
    type WalletRetrieveBalancesResponse as WalletRetrieveBalancesResponse,
    type WalletConnectParams as WalletConnectParams,
  };
}
