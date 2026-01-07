// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource transactions', () => {
  test('listPendingTransactions', async () => {
    const responsePromise = client.accounts.transactions.listPendingTransactions('acc_chase_checking_4567');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('listPendingTransactions: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.accounts.transactions.listPendingTransactions(
        'acc_chase_checking_4567',
        {
          limit: {},
          offset: {},
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(JamesBurvelOcallaghanIii.NotFoundError);
  });
});
