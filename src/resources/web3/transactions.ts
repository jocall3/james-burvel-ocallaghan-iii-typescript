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
  status: 'pending_signature' | 'broadcasting' | 'pending_confirmation' | 'completed' | 'failed';

  /**
   * Unique identifier for the initiated crypto transfer.
   */
  transferId: string;

  /**
   * The transaction hash on the blockchain, once broadcasted.
   */
  blockchainTxnHash?: string | null;

  /**
   * If failed, the reason for the failure.
   */
  failedReason?: string | null;

  /**
   * A descriptive message regarding the current status or next steps.
   */
  message?: string | null;
}

export interface TransactionInitiateTransferParams {
  /**
   * The amount of cryptocurrency to transfer.
   */
  amount: number;

  /**
   * The symbol of the cryptocurrency to transfer (e.g., ETH, USDC).
   */
  assetSymbol: string;

  /**
   * The blockchain network on which the transfer will occur.
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
   * The recipient's blockchain address.
   */
  recipientAddress: string;

  /**
   * The ID of the connected wallet from which to transfer.
   */
  sourceWalletId: string;

  /**
   * Optional: Maximum gas units to consume for the transaction.
   */
  gasLimit?: number | null;

  /**
   * Optional: Desired gas price in Gwei for Ethereum-based transactions.
   */
  gasPriceGwei?: number | null;

  /**
   * Optional: A short memo or note for the transaction (supported by some chains).
   */
  memo?: string | null;
}

export declare namespace Transactions {
  export {
    type TransactionInitiateTransferResponse as TransactionInitiateTransferResponse,
    type TransactionInitiateTransferParams as TransactionInitiateTransferParams,
  };
}
