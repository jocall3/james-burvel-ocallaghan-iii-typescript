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
   * Current status of the crypto transfer.
   */
  status: 'pending_signature' | 'broadcasting' | 'confirmed' | 'failed';

  /**
   * Unique identifier for the initiated crypto transfer.
   */
  transferId: string;

  /**
   * The transaction hash on the blockchain once broadcasted.
   */
  blockchainTxnHash?: string | null;

  /**
   * Timestamp when the status was last updated.
   */
  lastUpdated?: string;

  /**
   * A descriptive message about the current status or required action.
   */
  message?: string | null;
}

export interface TransactionInitiateTransferParams {
  /**
   * The amount of crypto asset to transfer.
   */
  amount: number;

  /**
   * The ticker symbol of the crypto asset (e.g., ETH, USDC).
   */
  assetSymbol: string;

  /**
   * The blockchain network on which to execute the transfer.
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
   * The public blockchain address of the recipient.
   */
  recipientAddress: string;

  /**
   * The ID of the connected wallet from which to send funds.
   */
  sourceWalletId: string;

  /**
   * Optional: Desired gas price in Gwei for Ethereum-based transactions.
   */
  gasPriceGwei?: number | null;

  /**
   * Optional: A short memo or note to include with the transaction (if supported by
   * network).
   */
  memo?: string | null;
}

export declare namespace Transactions {
  export {
    type TransactionInitiateTransferResponse as TransactionInitiateTransferResponse,
    type TransactionInitiateTransferParams as TransactionInitiateTransferParams,
  };
}
