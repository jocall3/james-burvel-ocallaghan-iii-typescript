// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Transactions extends APIResource {
  /**
   * Prepares and initiates a cryptocurrency transfer from a connected wallet to a
   * specified recipient address. Requires user confirmation (e.g., via wallet
   * signature).
   *
   * @example
   * ```ts
   * const response =
   *   await client.web3.transactions.initiateTransfer({
   *     amount: 0.1,
   *     assetSymbol: 'ETH',
   *     blockchainNetwork: 'Ethereum',
   *     recipientAddress:
   *       '0xdef4567890abcdef1234567890abcdef1234567890',
   *     sourceWalletId: 'wallet_conn_eth_0xabc123',
   *     gasPriceGwei: 50,
   *     memo: 'Payment for services',
   *   });
   * ```
   */
  initiateTransfer(
    body: TransactionInitiateTransferParams,
    options?: RequestOptions,
  ): APIPromise<TransactionInitiateTransferResponse> {
    return this._client.post('/web3/transactions/initiate', { body, ...options });
  }
}

export interface TransactionInitiateTransferResponse {
  /**
   * Current status of the cryptocurrency transfer.
   */
  status: 'pending_signature' | 'pending_broadcast' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

  /**
   * Unique identifier for the initiated transfer.
   */
  transferId: string;

  /**
   * The transaction hash on the blockchain (if available).
   */
  blockchainTxnHash?: string | null;

  /**
   * Timestamp when the transfer was completed (if successful).
   */
  completedAt?: string | null;

  /**
   * A descriptive message regarding the transfer status or next steps.
   */
  message?: string | null;
}

export interface TransactionInitiateTransferParams {
  /**
   * The amount of cryptocurrency to transfer.
   */
  amount: number;

  /**
   * The ticker symbol of the asset to transfer (e.g., ETH, BTC, USDC).
   */
  assetSymbol: string;

  /**
   * The blockchain network on which the transaction will occur.
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
   * The recipient's cryptocurrency address.
   */
  recipientAddress: string;

  /**
   * The ID of the connected wallet from which to transfer.
   */
  sourceWalletId: string;

  /**
   * Optional: Gas price in Gwei for Ethereum-based transactions.
   */
  gasPriceGwei?: number | null;

  /**
   * Optional: A memo or note for the transaction (supported by some
   * networks/assets).
   */
  memo?: string | null;
}

export declare namespace Transactions {
  export {
    type TransactionInitiateTransferResponse as TransactionInitiateTransferResponse,
    type TransactionInitiateTransferParams as TransactionInitiateTransferParams,
  };
}
