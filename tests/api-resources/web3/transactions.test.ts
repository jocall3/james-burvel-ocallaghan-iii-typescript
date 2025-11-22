// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource transactions', () => {
  // Prism tests are disabled
  test.skip('initiateTransfer: only required params', async () => {
    const responsePromise = client.web3.transactions.initiateTransfer({
      amount: 0.1,
      assetSymbol: 'ETH',
      blockchainNetwork: 'Ethereum',
      recipientAddress: '0xdef4567890abcdef1234567890abcdef1234567890',
      sourceWalletId: 'wallet_conn_eth_0xabc123',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('initiateTransfer: required and optional params', async () => {
    const response = await client.web3.transactions.initiateTransfer({
      amount: 0.1,
      assetSymbol: 'ETH',
      blockchainNetwork: 'Ethereum',
      recipientAddress: '0xdef4567890abcdef1234567890abcdef1234567890',
      sourceWalletId: 'wallet_conn_eth_0xabc123',
      gasLimit: 21000,
      gasPriceGwei: 50,
      memo: 'Payment for services',
    });
  });
});
