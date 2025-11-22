// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource accounts', () => {
  // Prism tests are disabled
  test.skip('linkNewInstitution: only required params', async () => {
    const responsePromise = client.accounts.linkNewInstitution({
      countryCode: 'US',
      institutionName: 'Bank of America',
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
  test.skip('linkNewInstitution: required and optional params', async () => {
    const response = await client.accounts.linkNewInstitution({
      countryCode: 'US',
      institutionName: 'Bank of America',
      provider: 'plaid',
    });
  });

  // Prism tests are disabled
  test.skip('listLinkedAccounts', async () => {
    const responsePromise = client.accounts.listLinkedAccounts();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('retrieveAccountDetails', async () => {
    const responsePromise = client.accounts.retrieveAccountDetails('acc_chase_checking_4567');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('retrieveAccountStatements: required and optional params', async () => {
    const response = await client.accounts.retrieveAccountStatements('acc_chase_checking_4567', {
      month: 7,
      year: 2024,
      format: 'pdf',
    });
  });
});
