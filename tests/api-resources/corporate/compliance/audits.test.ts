// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource audits', () => {
  test('request: only required params', async () => {
    const responsePromise = client.corporate.compliance.audits.request({
      auditScope: 'all_transactions',
      endDate: '2024-06-30',
      regulatoryFrameworks: ['AML', 'PCI-DSS'],
      startDate: '2024-01-01',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('request: required and optional params', async () => {
    const response = await client.corporate.compliance.audits.request({
      auditScope: 'all_transactions',
      endDate: '2024-06-30',
      regulatoryFrameworks: ['AML', 'PCI-DSS'],
      startDate: '2024-01-01',
      additionalContext: {},
    });
  });

  test('retrieveReport', async () => {
    const responsePromise = client.corporate.compliance.audits.retrieveReport('audit_corp_xyz789');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
