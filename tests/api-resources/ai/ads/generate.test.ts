// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'citibankdemobusinessinc-james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource generate', () => {
  test('advanced: only required params', async () => {
    const responsePromise = client.ai.ads.generate.advanced({
      lengthSeconds: 15,
      prompt:
        "A captivating ad featuring a young entrepreneur using 's AI tools to grow their startup. Focus on innovation and ease of use.",
      style: 'Cinematic',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('advanced: required and optional params', async () => {
    const response = await client.ai.ads.generate.advanced({
      lengthSeconds: 15,
      prompt:
        "A captivating ad featuring a young entrepreneur using 's AI tools to grow their startup. Focus on innovation and ease of use.",
      style: 'Cinematic',
      aspectRatio: '16:9',
      audienceTarget: 'corporate',
      backgroundMusicGenre: 'corporate',
      brandAssets: ['https://demobank.com/assets/corporate_logo.png'],
      brandColors: ['#0000FF', '#FFD700'],
      callToAction: {
        displayTimeSeconds: 5,
        text: 'Learn more at DemoBank.com/business',
        url: 'https://demobank.com/business',
      },
      keywords: ['innovation', 'fintech', 'startup'],
      voiceoverStyle: 'male_professional',
      voiceoverText: ': Your business, powered by intelligent finance.',
    });
  });

  test('standard: only required params', async () => {
    const responsePromise = client.ai.ads.generate.standard({
      lengthSeconds: 15,
      prompt:
        "A captivating ad featuring a young entrepreneur using 's AI tools to grow their startup. Focus on innovation and ease of use.",
      style: 'Cinematic',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('standard: required and optional params', async () => {
    const response = await client.ai.ads.generate.standard({
      lengthSeconds: 15,
      prompt:
        "A captivating ad featuring a young entrepreneur using 's AI tools to grow their startup. Focus on innovation and ease of use.",
      style: 'Cinematic',
      aspectRatio: '16:9',
      brandColors: ['#0000FF', '#FFD700'],
      keywords: ['innovation', 'fintech', 'startup'],
    });
  });
});
