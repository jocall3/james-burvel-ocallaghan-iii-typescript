// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'citibankdemobusinessinc-james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource kyc', () => {
  test('retrieveStatus', async () => {
    const responsePromise = client.identity.kyc.retrieveStatus();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('submit: only required params', async () => {
    const responsePromise = client.identity.kyc.submit({
      countryOfIssue: 'US',
      documentNumber: 'ABC12345',
      documentType: 'drivers_license',
      expirationDate: '2030-01-01',
      issueDate: '2020-01-01',
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
    const response = await client.identity.kyc.submit({
      countryOfIssue: 'US',
      documentNumber: 'ABC12345',
      documentType: 'drivers_license',
      expirationDate: '2030-01-01',
      issueDate: '2020-01-01',
      additionalDocuments: [{}],
      documentBackImage: 'base64encoded_image_of_drivers_license_back',
      documentFrontImage: 'base64encoded_image_of_drivers_license_front',
    });
  });
});
