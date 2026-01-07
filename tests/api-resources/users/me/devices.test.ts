// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource devices', () => {
  test('list', async () => {
    const responsePromise = client.users.me.devices.list();
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
      client.users.me.devices.list(
        {
          limit: {},
          offset: {},
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(JamesBurvelOcallaghanIii.NotFoundError);
  });

  test('deregister', async () => {
    const responsePromise = client.users.me.devices.deregister('dev_mobile_ios_aabbcc');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('register: only required params', async () => {
    const responsePromise = client.users.me.devices.register({
      deviceType: 'mobile',
      model: 'Samsung Galaxy S24 Ultra',
      os: 'Android 14',
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
    const response = await client.users.me.devices.register({
      deviceType: 'mobile',
      model: 'Samsung Galaxy S24 Ultra',
      os: 'Android 14',
      biometricSignature: 'base64encoded_android_biometric_proof',
      deviceName: "Alex's Work Phone",
      pushToken: 'ExponentPushToken[yzzzyzzzyzzzyzzz]',
    });
  });
});
