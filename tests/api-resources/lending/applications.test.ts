// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'citibankdemobusinessinc-james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource applications', () => {
  test('retrieve', async () => {
    const responsePromise = client.lending.applications.retrieve('loan_app_creditflow-123');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('submit: only required params', async () => {
    const responsePromise = client.lending.applications.submit({
      loanAmount: 10000,
      loanPurpose: 'home_improvement',
      repaymentTermMonths: 36,
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('submit: required and optional params', async () => {
    const response = await client.lending.applications.submit({
      loanAmount: 10000,
      loanPurpose: 'home_improvement',
      repaymentTermMonths: 36,
      additionalNotes: 'Funds needed to replace a broken HVAC system.',
      coApplicant: { email: 'jane.doe@example.com', income: 75000, name: 'Jane Doe' },
    });
  });
});
