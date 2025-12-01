// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource corporate', () => {
  test('performSanctionScreening: only required params', async () => {
    const responsePromise = client.corporate.performSanctionScreening({
      country: 'US',
      entityType: 'individual',
      name: 'John Doe',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('performSanctionScreening: required and optional params', async () => {
    const response = await client.corporate.performSanctionScreening({
      country: 'US',
      entityType: 'individual',
      name: 'John Doe',
      address: { city: 'Anytown', country: 'USA', state: 'CA', street: '123 Main St', zip: '90210' },
      dateOfBirth: '1970-01-01',
      identificationNumber: 'identificationNumber',
    });
  });
});
