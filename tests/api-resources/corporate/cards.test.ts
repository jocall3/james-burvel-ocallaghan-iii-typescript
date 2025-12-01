// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'citibankdemobusinessinc-james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource cards', () => {
  test('list', async () => {
    const responsePromise = client.corporate.cards.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.corporate.cards.list({ limit: {}, offset: {} }, { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(JamesBurvelOcallaghanIii.NotFoundError);
  });

  test('createVirtual: only required params', async () => {
    const responsePromise = client.corporate.cards.createVirtual({
      controls: {},
      expirationDate: '2025-12-31',
      holderName: 'Marketing Campaign Q4',
      purpose: 'Online advertising for Q4 campaigns',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('createVirtual: required and optional params', async () => {
    const response = await client.corporate.cards.createVirtual({
      controls: {
        atmWithdrawals: false,
        contactlessPayments: false,
        dailyLimit: 500,
        internationalTransactions: false,
        merchantCategoryRestrictions: ['Advertising'],
        monthlyLimit: 1000,
        onlineTransactions: true,
        singleTransactionLimit: 200,
        vendorRestrictions: ['Facebook Ads', 'Google Ads'],
      },
      expirationDate: '2025-12-31',
      holderName: 'Marketing Campaign Q4',
      purpose: 'Online advertising for Q4 campaigns',
      associatedEmployeeId: 'emp_marketing_01',
      spendingPolicyId: 'policy_marketing_fixed',
    });
  });

  test('freeze: only required params', async () => {
    const responsePromise = client.corporate.cards.freeze('corp_card_xyz987654', { freeze: true });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('freeze: required and optional params', async () => {
    const response = await client.corporate.cards.freeze('corp_card_xyz987654', { freeze: true });
  });

  test('listTransactions', async () => {
    const responsePromise = client.corporate.cards.listTransactions('corp_card_xyz987654');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('listTransactions: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.corporate.cards.listTransactions(
        'corp_card_xyz987654',
        { endDate: '2024-12-31', limit: {}, offset: {}, startDate: '2024-01-01' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(JamesBurvelOcallaghanIii.NotFoundError);
  });

  test('updateControls', async () => {
    const responsePromise = client.corporate.cards.updateControls('corp_card_xyz987654', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
