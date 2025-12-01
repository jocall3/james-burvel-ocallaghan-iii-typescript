// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'citibankdemobusinessinc-james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource users', () => {
  test('login: only required params', async () => {
    const responsePromise = client.users.login({
      email: 'quantum.visionary@demobank.com',
      password: 'YourSecurePassword123',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('login: required and optional params', async () => {
    const response = await client.users.login({
      email: 'quantum.visionary@demobank.com',
      password: 'YourSecurePassword123',
      mfaCode: '123456',
    });
  });

  test('register: only required params', async () => {
    const responsePromise = client.users.register({
      email: 'alice.w@example.com',
      name: 'Alice Wonderland',
      password: 'SecureP@ssw0rd2024!',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('register: required and optional params', async () => {
    const response = await client.users.register({
      email: 'alice.w@example.com',
      name: 'Alice Wonderland',
      password: 'SecureP@ssw0rd2024!',
      address: { city: 'Anytown', country: 'USA', state: 'CA', street: '123 Main St', zip: '90210' },
      dateOfBirth: '1990-05-10',
      phone: '+1-555-987-6543',
    });
  });
});
