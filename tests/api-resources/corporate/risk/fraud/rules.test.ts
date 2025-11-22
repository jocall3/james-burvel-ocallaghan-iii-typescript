// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource rules', () => {
  // Prism tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.corporate.risk.fraud.rules.create({
      action: {},
      criteria: {
        paymentCountMin: 'bar',
        timeframeHours: 'bar',
        recipientNew: 'bar',
        recipientCountryRiskLevel: 'bar',
      },
      description:
        'Detects multiple international payments to new beneficiaries in high-risk countries within a short timeframe.',
      name: 'Suspicious International Payment Pattern',
      severity: 'Critical',
      status: 'active',
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
  test.skip('create: required and optional params', async () => {
    const response = await client.corporate.risk.fraud.rules.create({
      action: {
        details: 'Hold payment, notify sender for additional verification, and escalate to compliance.',
        type: 'auto_review',
      },
      criteria: {
        paymentCountMin: 'bar',
        timeframeHours: 'bar',
        recipientNew: 'bar',
        recipientCountryRiskLevel: 'bar',
      },
      description:
        'Detects multiple international payments to new beneficiaries in high-risk countries within a short timeframe.',
      name: 'Suspicious International Payment Pattern',
      severity: 'Critical',
      status: 'active',
    });
  });

  // Prism tests are disabled
  test.skip('update', async () => {
    const responsePromise = client.corporate.risk.fraud.rules.update('fraud_rule_high_value_inactive', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.corporate.risk.fraud.rules.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('delete', async () => {
    const responsePromise = client.corporate.risk.fraud.rules.delete('fraud_rule_high_value_inactive');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
