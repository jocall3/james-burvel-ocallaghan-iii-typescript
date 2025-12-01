// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource fx', () => {
  test('convert: only required params', async () => {
    const responsePromise = client.payments.fx.convert({
      sourceAccountId: 'acc_chase_checking_4567',
      sourceAmount: 1000,
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

  test('convert: required and optional params', async () => {
    const response = await client.payments.fx.convert({
      sourceAccountId: 'acc_chase_checking_4567',
      sourceAmount: 1000,
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      fxRateLock: true,
      targetAccountId: 'acc_euro_savings_9876',
    });
  });

  test('retrieveRates: only required params', async () => {
    const responsePromise = client.payments.fx.retrieveRates({ baseCurrency: 'USD', targetCurrency: 'EUR' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('retrieveRates: required and optional params', async () => {
    const response = await client.payments.fx.retrieveRates({
      baseCurrency: 'USD',
      targetCurrency: 'EUR',
      forecastDays: 7,
    });
  });
});
