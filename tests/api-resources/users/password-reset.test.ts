// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'citibankdemobusinessinc-james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource passwordReset', () => {
  test('confirm: only required params', async () => {
    const responsePromise = client.users.passwordReset.confirm({
      identifier: 'reset.user@example.com',
      newPassword: 'MyNewStrongPassword@789',
      verificationCode: '654321',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('confirm: required and optional params', async () => {
    const response = await client.users.passwordReset.confirm({
      identifier: 'reset.user@example.com',
      newPassword: 'MyNewStrongPassword@789',
      verificationCode: '654321',
    });
  });

  test('initiate: only required params', async () => {
    const responsePromise = client.users.passwordReset.initiate({ identifier: 'reset.user@example.com' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('initiate: required and optional params', async () => {
    const response = await client.users.passwordReset.initiate({ identifier: 'reset.user@example.com' });
  });
});
