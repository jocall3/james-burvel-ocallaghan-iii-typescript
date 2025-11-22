// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource pitch', () => {
  // Prism tests are disabled
  test.skip('retrieveDetails', async () => {
    const responsePromise = client.ai.incubator.pitch.retrieveDetails('pitch_qw_synergychain-xyz');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('submit: only required params', async () => {
    const responsePromise = client.ai.incubator.pitch.submit({
      businessPlan:
        'Quantum-AI powered financial advisor platform leveraging neural networks for predictive analytics and hyper-personalized advice...',
      financialProjections: {},
      foundingTeam: [{}, {}],
      marketOpportunity:
        'The booming digital finance market coupled with demand for truly personalized, AI-driven financial guidance presents a multi-billion dollar opportunity. Our unique quantum-AI approach provides unparalleled accuracy and foresight.',
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
  test.skip('submit: required and optional params', async () => {
    const response = await client.ai.incubator.pitch.submit({
      businessPlan:
        'Quantum-AI powered financial advisor platform leveraging neural networks for predictive analytics and hyper-personalized advice...',
      financialProjections: {
        profitabilityEstimate: 'Achieve profitability within 18 months.',
        projectionYears: 3,
        revenueForecast: [500000, 2000000, 6000000],
        seedRoundAmount: 2500000,
        valuationPreMoney: 10000000,
      },
      foundingTeam: [
        {
          experience: '15+ years in AI/ML, PhD in Quantum Computing, ex-Google Brain',
          name: 'Dr. Eleanor Vance',
          role: 'CEO & Lead AI Scientist',
        },
        {
          experience: '20+ years in Fintech, ex-Goldman Sachs',
          name: 'Marcus Thorne',
          role: 'COO & Finance Expert',
        },
      ],
      marketOpportunity:
        'The booming digital finance market coupled with demand for truly personalized, AI-driven financial guidance presents a multi-billion dollar opportunity. Our unique quantum-AI approach provides unparalleled accuracy and foresight.',
    });
  });

  // Prism tests are disabled
  test.skip('submitFeedback', async () => {
    const responsePromise = client.ai.incubator.pitch.submitFeedback('pitch_qw_synergychain-xyz', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
