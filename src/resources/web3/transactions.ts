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
   * Current status of the transfer.
   */
  status: 'pending_signature' | 'pending_blockchain_confirmation' | 'completed' | 'failed' | 'cancelled';

  /**
   * Unique identifier for this cryptocurrency transfer operation.
   */
  transferId: string;

  /**
   * The blockchain transaction hash, if available and confirmed.
   */
  blockchainTxnHash?: string | null;

  /**
   * A descriptive message about the transfer status.
   */
  message?: string | null;
}

export interface TransactionInitiateTransferParams {
  /**
   * The amount of cryptocurrency to transfer.
   */
  amount: number;

  /**
   * Symbol of the crypto asset to transfer (e.g., ETH, USDC).
   */
  assetSymbol: string;

  /**
   * The blockchain network for the transfer.
   */
  blockchainNetwork: string;

  /**
   * The recipient's blockchain address.
   */
  recipientAddress: string;

  /**
   * ID of the connected wallet from which to send funds.
   */
  sourceWalletId: string;

  /**
   * Optional: Gas price in Gwei for Ethereum-based transactions.
   */
  gasPriceGwei?: number | null;

  /**
   * Optional: A short memo or note for the transaction.
   */
  memo?: string | null;
}

export declare namespace Transactions {
  export {
    type TransactionInitiateTransferResponse as TransactionInitiateTransferResponse,
    type TransactionInitiateTransferParams as TransactionInitiateTransferParams,
  };
}
