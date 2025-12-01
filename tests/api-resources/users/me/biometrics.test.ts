// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'citibankdemobusinessinc-james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource biometrics', () => {
  test('deregister', async () => {
    const responsePromise = client.users.me.biometrics.deregister();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('enroll: only required params', async () => {
    const responsePromise = client.users.me.biometrics.enroll({
      biometricSignature: 'base64encoded_facial_template_for_enrollment',
      biometricType: 'facial_recognition',
      deviceId: 'dev_mobile_ios_aabbcc',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('enroll: required and optional params', async () => {
    const response = await client.users.me.biometrics.enroll({
      biometricSignature: 'base64encoded_facial_template_for_enrollment',
      biometricType: 'facial_recognition',
      deviceId: 'dev_mobile_ios_aabbcc',
      deviceName: 'My Primary iPhone',
    });
  });

  test('status', async () => {
    const responsePromise = client.users.me.biometrics.status();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('verify: only required params', async () => {
    const responsePromise = client.users.me.biometrics.verify({
      biometricSignature: 'base64encoded_one_time_fingerprint_proof',
      biometricType: 'fingerprint',
      deviceId: 'dev_mobile_android_ddeeff',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('verify: required and optional params', async () => {
    const response = await client.users.me.biometrics.verify({
      biometricSignature: 'base64encoded_one_time_fingerprint_proof',
      biometricType: 'fingerprint',
      deviceId: 'dev_mobile_android_ddeeff',
    });
  });
});
