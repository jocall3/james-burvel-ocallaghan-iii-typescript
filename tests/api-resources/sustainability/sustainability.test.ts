// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'citibankdemobusinessinc-james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource sustainability', () => {
  test('purchaseCarbonOffsets: only required params', async () => {
    const responsePromise = client.sustainability.purchaseCarbonOffsets({
      amountKgCO2e: 500,
      offsetProject: 'Verified Carbon Standard Project X',
      paymentAccountId: 'acc_chase_checking_4567',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('purchaseCarbonOffsets: required and optional params', async () => {
    const response = await client.sustainability.purchaseCarbonOffsets({
      amountKgCO2e: 500,
      offsetProject: 'Verified Carbon Standard Project X',
      paymentAccountId: 'acc_chase_checking_4567',
    });
  });

  test('retrieveCarbonFootprint', async () => {
    const responsePromise = client.sustainability.retrieveCarbonFootprint();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
