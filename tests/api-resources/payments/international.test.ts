// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource international', () => {
  // Prism tests are disabled
  test.skip('initiate: only required params', async () => {
    const responsePromise = client.payments.international.initiate({
      amount: 5000,
      beneficiary: {
        address: 'Hauptstrasse 1, 10115 Berlin, Germany',
        bankName: 'Deutsche Bank',
        name: 'Maria Schmidt',
      },
      purpose: 'Vendor payment for Q2 services.',
      sourceAccountId: 'acc_chase_checking_4567',
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
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
  test.skip('initiate: required and optional params', async () => {
    const response = await client.payments.international.initiate({
      amount: 5000,
      beneficiary: {
        address: 'Hauptstrasse 1, 10115 Berlin, Germany',
        bankName: 'Deutsche Bank',
        name: 'Maria Schmidt',
        accountNumber: 'accountNumber',
        iban: 'DE89370400440532013000',
        routingNumber: 'routingNumber',
        swiftBic: 'DEUTDEFF',
      },
      purpose: 'Vendor payment for Q2 services.',
      sourceAccountId: 'acc_chase_checking_4567',
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      fxRateLock: true,
      fxRateProvider: 'proprietary_ai',
      reference: 'reference',
    });
  });

  // Prism tests are disabled
  test.skip('retrieveStatus', async () => {
    const responsePromise = client.payments.international.retrieveStatus('int_pmt_xyz7890');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
