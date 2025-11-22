// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource generate', () => {
  // Prism tests are disabled
  test.skip('advanced: only required params', async () => {
    const responsePromise = client.ai.ads.generate.advanced({
      aspectRatio: '16:9',
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

  // Prism tests are disabled
  test.skip('advanced: required and optional params', async () => {
    const response = await client.ai.ads.generate.advanced({
      aspectRatio: '16:9',
      lengthSeconds: 15,
      prompt:
        "A captivating ad featuring a young entrepreneur using 's AI tools to grow their startup. Focus on innovation and ease of use.",
      style: 'Cinematic',
      audienceTarget: 'corporate',
      backgroundMusicVolume: 0.5,
      brandAssets: ['https://example.com'],
      brandColors: ['#0000FF', '#FFD700'],
      callToAction: {
        text: 'Learn more at DemoBank.com/business',
        url: 'https://demobank.com/business',
        displayTimeSeconds: 5,
      },
      musicGenre: 'uplifting_corporate',
      voiceoverStyle: 'male_professional',
      voiceoverText: ': Your business, powered by intelligent finance.',
    });
  });

  // Prism tests are disabled
  test.skip('standard: only required params', async () => {
    const responsePromise = client.ai.ads.generate.standard({
      aspectRatio: '16:9',
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

  // Prism tests are disabled
  test.skip('standard: required and optional params', async () => {
    const response = await client.ai.ads.generate.standard({
      aspectRatio: '16:9',
      lengthSeconds: 15,
      prompt:
        "A captivating ad featuring a young entrepreneur using 's AI tools to grow their startup. Focus on innovation and ease of use.",
      style: 'Cinematic',
      brandColors: ['#0000FF', '#FFD700'],
      musicGenre: 'uplifting_corporate',
    });
  });
});
