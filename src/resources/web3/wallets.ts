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
   * The blockchain network this wallet connection is primarily on.
   */
  blockchainNetwork:
    | 'Ethereum'
    | 'Solana'
    | 'Polygon'
    | 'Binance Smart Chain'
    | 'Avalanche'
    | 'Arbitrum'
    | 'Optimism';

  /**
   * Timestamp of the last successful synchronization with the wallet.
   */
  lastSynced: string;

  /**
   * Indicates if read-only access to wallet data (balances, NFTs) is granted.
   */
  readAccessGranted: boolean;

  /**
   * Current status of the wallet connection.
   */
  status: 'connected' | 'disconnected' | 'reconnect_required' | 'revoked';

  /**
   * The primary public address of the connected wallet.
   */
  walletAddress: string;

  /**
   * Name of the wallet provider (e.g., MetaMask, Ledger, Phantom).
   */
  walletProvider: string;

  /**
   * Indicates if write access (e.g., to initiate transactions) is granted.
   */
  writeAccessGranted: boolean;

  /**
   * The technical method used for connecting the wallet.
   */
  connectionType?: 'direct' | 'walletconnect' | 'oauth' | 'api_key' | null;
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
     * Ticker symbol of the cryptocurrency.
     */
    assetSymbol: string;

    /**
     * Current balance of the asset in the wallet.
     */
    balance: number;

    /**
     * Estimated USD value of the balance.
     */
    usdValue: number | null;

    /**
     * The blockchain network of the asset.
     */
    blockchainNetwork?:
      | 'Ethereum'
      | 'Solana'
      | 'Polygon'
      | 'Binance Smart Chain'
      | 'Avalanche'
      | 'Arbitrum'
      | 'Optimism'
      | null;

    /**
     * The contract address for ERC-20 tokens, if applicable.
     */
    contractAddress?: string | null;
  }
}

export interface WalletConnectParams {
  /**
   * The blockchain network the wallet is on.
   */
  blockchainNetwork:
    | 'Ethereum'
    | 'Solana'
    | 'Polygon'
    | 'Binance Smart Chain'
    | 'Avalanche'
    | 'Arbitrum'
    | 'Optimism';

  /**
   * A cryptographic signature proving ownership of the wallet address (e.g., EIP-191
   * signature).
   */
  signedMessage: string;

  /**
   * The public address of the wallet to connect.
   */
  walletAddress: string;

  /**
   * The provider/type of the wallet.
   */
  walletProvider: 'MetaMask' | 'Phantom' | 'Ledger' | 'TrustWallet' | 'CoinbaseWallet' | 'Other';

  /**
   * If true, requests write access to initiate transactions (requires additional
   * user confirmation).
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
