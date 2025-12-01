// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource rules', () => {
  test('create: only required params', async () => {
    const responsePromise = client.corporate.risk.fraud.rules.create({
      action: {
        details: 'Hold payment, notify sender for additional verification, and escalate to compliance.',
        type: 'auto_review',
      },
      criteria: {},
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

  test('create: required and optional params', async () => {
    const response = await client.corporate.risk.fraud.rules.create({
      action: {
        details: 'Hold payment, notify sender for additional verification, and escalate to compliance.',
        type: 'auto_review',
        targetTeam: 'Fraud Prevention Team',
      },
      criteria: {
        accountInactivityDays: 90,
        countryOfOrigin: ['US', 'CA'],
        geographicDistanceKm: 5000,
        lastLoginDays: 7,
        noTravelNotification: true,
        paymentCountMin: 3,
        recipientCountryRiskLevel: ['High', 'Very High'],
        recipientNew: true,
        timeframeHours: 24,
        transactionAmountMin: 5000,
        transactionType: 'debit',
      },
      description:
        'Detects multiple international payments to new beneficiaries in high-risk countries within a short timeframe.',
      name: 'Suspicious International Payment Pattern',
      severity: 'Critical',
      status: 'active',
    });
  });

  test('update', async () => {
    const responsePromise = client.corporate.risk.fraud.rules.update('fraud_rule_high_value_inactive', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('list', async () => {
    const responsePromise = client.corporate.risk.fraud.rules.list();
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
      client.corporate.risk.fraud.rules.list({ limit: 1, offset: 0 }, { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(JamesBurvelOcallaghanIii.NotFoundError);
  });

  test('delete', async () => {
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
