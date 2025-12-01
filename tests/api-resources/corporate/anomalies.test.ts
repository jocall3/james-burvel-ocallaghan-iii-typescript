// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource anomalies', () => {
  test('list', async () => {
    const responsePromise = client.corporate.anomalies.list();
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
      client.corporate.anomalies.list(
        {
          endDate: '2024-12-31',
          entityType: 'Transaction',
          limit: {},
          offset: {},
          severity: 'Critical',
          startDate: '2024-01-01',
          status: 'New',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(JamesBurvelOcallaghanIii.NotFoundError);
  });

  test('updateStatus: only required params', async () => {
    const responsePromise = client.corporate.anomalies.updateStatus('anom_risk-2024-07-21-D1E2F3', {
      status: 'Resolved',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('updateStatus: required and optional params', async () => {
    const response = await client.corporate.anomalies.updateStatus('anom_risk-2024-07-21-D1E2F3', {
      status: 'Resolved',
      resolutionNotes: 'Confirmed legitimate transaction after contacting vendor. Marked as resolved.',
    });
  });
});
