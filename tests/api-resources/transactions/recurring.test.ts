// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource recurring', () => {
  // Prism tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.transactions.recurring.create({
      amount: 55.5,
      category: 'Health & Fitness',
      currency: 'USD',
      description: 'New Gym Membership',
      frequency: 'monthly',
      linkedAccountId: 'acc_chase_checking_4567',
      startDate: '2024-09-01',
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
  test.skip('create: required and optional params', async () => {
    const response = await client.transactions.recurring.create({
      amount: 55.5,
      category: 'Health & Fitness',
      currency: 'USD',
      description: 'New Gym Membership',
      frequency: 'monthly',
      linkedAccountId: 'acc_chase_checking_4567',
      startDate: '2024-09-01',
      status: 'active',
    });
  });

  // Prism tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.transactions.recurring.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
