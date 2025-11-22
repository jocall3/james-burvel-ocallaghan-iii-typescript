// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource simulate', () => {
  // Prism tests are disabled
  test.skip('runAdvanced: only required params', async () => {
    const responsePromise = client.ai.oracle.simulate.runAdvanced({
      prompt:
        'Evaluate the long-term impact of a sudden job loss combined with a variable market downturn, analyzing worst-case and best-case recovery scenarios over a decade.',
      scenarios: [
        {
          events: [
            {
              details: { durationMonths: 'bar', severanceAmount: 'bar', unemploymentBenefits: 'bar' },
              type: 'job_loss',
            },
            { details: { impactPercentage: 'bar', recoveryYears: 'bar' }, type: 'market_downturn' },
          ],
          name: 'Job Loss & Mild Market Recovery',
        },
      ],
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
  test.skip('runAdvanced: required and optional params', async () => {
    const response = await client.ai.oracle.simulate.runAdvanced({
      prompt:
        'Evaluate the long-term impact of a sudden job loss combined with a variable market downturn, analyzing worst-case and best-case recovery scenarios over a decade.',
      scenarios: [
        {
          events: [
            {
              details: { durationMonths: 'bar', severanceAmount: 'bar', unemploymentBenefits: 'bar' },
              type: 'job_loss',
              startMonth: 1,
            },
            {
              details: { impactPercentage: 'bar', recoveryYears: 'bar' },
              type: 'market_downturn',
              startMonth: 1,
            },
          ],
          name: 'Job Loss & Mild Market Recovery',
          durationYears: 10,
          sensitivityAnalysisParams: [{ max: 0.07, min: 0.03, paramName: 'marketRecoveryRate', step: 0.01 }],
        },
      ],
      durationYears: 10,
      initialState: { monthlyIncomeOverride: 8000, netWorthOverride: 500000 },
      sensitivityAnalysisParams: [{ max: 0.07, min: 0.03, paramName: 'marketRecoveryRate', step: 0.01 }],
    });
  });

  // Prism tests are disabled
  test.skip('runStandard: only required params', async () => {
    const responsePromise = client.ai.oracle.simulate.runStandard({
      prompt:
        'What if I invest an additional $1,000 per month into my aggressive growth portfolio for the next 5 years?',
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
  test.skip('runStandard: required and optional params', async () => {
    const response = await client.ai.oracle.simulate.runStandard({
      prompt:
        'What if I invest an additional $1,000 per month into my aggressive growth portfolio for the next 5 years?',
      parameters: { durationYears: 'bar', monthlyInvestmentAmount: 'bar', riskTolerance: 'bar' },
    });
  });
});
