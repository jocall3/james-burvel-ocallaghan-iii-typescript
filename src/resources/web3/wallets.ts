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
   * Unique identifier for the wallet connection within .
   */
  id: string;

  /**
   * The primary blockchain network associated with the wallet.
   */
  blockchainNetwork:
    | 'Ethereum'
    | 'Solana'
    | 'Polygon'
    | 'BinanceSmartChain'
    | 'Avalanche'
    | 'Arbitrum'
    | 'Optimism'
    | 'Bitcoin'
    | 'other';

  /**
   * Timestamp of the last successful synchronization with the blockchain.
   */
  lastSynced: string | null;

  /**
   * Indicates if read access (balances, NFTs) has been granted.
   */
  readAccessGranted: boolean;

  /**
   * Current connection status of the wallet.
   */
  status: 'connected' | 'disconnected' | 'error' | 'pending_verification';

  /**
   * The public address of the cryptocurrency wallet.
   */
  walletAddress: string;

  /**
   * The provider or type of the connected wallet.
   */
  walletProvider: 'MetaMask' | 'Phantom' | 'Ledger' | 'Trezor' | 'CoinbaseWallet' | 'WalletConnect' | 'other';

  /**
   * Indicates if write access (transactions) has been granted and is active.
   */
  writeAccessGranted: boolean;

  /**
   * A user-defined alias for the wallet.
   */
  alias?: string | null;
}

export type WalletListResponse = Array<CryptoWalletConnection>;

export type WalletRetrieveBalancesResponse =
  Array<WalletRetrieveBalancesResponse.WalletRetrieveBalancesResponseItem>;

export namespace WalletRetrieveBalancesResponse {
  export interface WalletRetrieveBalancesResponseItem {
    /**
     * Full name of the cryptocurrency asset.
     */
    assetName: string;

    /**
     * Ticker symbol of the cryptocurrency asset.
     */
    assetSymbol: string;

    /**
     * Current balance of the asset in the wallet.
     */
    balance: number;

    /**
     * Estimated USD value of the asset balance.
     */
    usdValue: number;

    /**
     * The blockchain network this asset belongs to.
     */
    blockchainNetwork?:
      | 'Ethereum'
      | 'Solana'
      | 'Polygon'
      | 'BinanceSmartChain'
      | 'Avalanche'
      | 'Arbitrum'
      | 'Optimism'
      | 'Bitcoin'
      | 'other';

    /**
     * The smart contract address for ERC-20 tokens or similar.
     */
    contractAddress?: string | null;

    /**
     * Timestamp when the balance was last updated/synced.
     */
    lastUpdated?: string;
  }
}

export interface WalletConnectParams {
  /**
   * The primary blockchain network for this wallet.
   */
  blockchainNetwork:
    | 'Ethereum'
    | 'Solana'
    | 'Polygon'
    | 'BinanceSmartChain'
    | 'Avalanche'
    | 'Arbitrum'
    | 'Optimism'
    | 'Bitcoin'
    | 'other';

  /**
   * A cryptographic signature from the wallet, proving ownership or consent to
   * connect.
   */
  signedMessage: string;

  /**
   * The public address of the cryptocurrency wallet.
   */
  walletAddress: string;

  /**
   * The provider or type of the wallet being connected.
   */
  walletProvider: 'MetaMask' | 'Phantom' | 'Ledger' | 'Trezor' | 'CoinbaseWallet' | 'WalletConnect' | 'other';

  /**
   * Optional: The original message that was signed, if provided by the client.
   */
  messageToSign?: string | null;

  /**
   * Request for read access to wallet balances and NFTs.
   */
  readAccess?: boolean;

  /**
   * Request for write access to initiate transactions (requires further security
   * layers).
   */
  writeAccess?: boolean;
}

export declare namespace Wallets {
  export {
    type CryptoWalletConnection as CryptoWalletConnection,
    type WalletListResponse as WalletListResponse,
    type WalletRetrieveBalancesResponse as WalletRetrieveBalancesResponse,
    type WalletConnectParams as WalletConnectParams,
  };
}
