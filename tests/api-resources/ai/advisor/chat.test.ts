// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource chat', () => {
  // Prism tests are disabled
  test.skip('retrieveHistory', async () => {
    const responsePromise = client.ai.advisor.chat.retrieveHistory();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('retrieveHistory: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.ai.advisor.chat.retrieveHistory(
        { limit: 50, offset: 0, sessionId: 'session-quantum-xyz-789-alpha' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(JamesBurvelOcallaghanIii.NotFoundError);
  });

  // Prism tests are disabled
  test.skip('sendMessage: only required params', async () => {
    const responsePromise = client.ai.advisor.chat.sendMessage({
      message:
        'Can you analyze my recent spending patterns and suggest areas for saving, focusing on my dining expenses?',
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
  test.skip('sendMessage: required and optional params', async () => {
    const response = await client.ai.advisor.chat.sendMessage({
      message:
        'Can you analyze my recent spending patterns and suggest areas for saving, focusing on my dining expenses?',
      functionResponse: {
        name: 'send_money',
        response: { status: 'success', transactionId: 'pmt_654321', amountSent: 50, recipient: 'Alex' },
      },
      sessionId: 'session-quantum-xyz-789-alpha',
    });
  });
});
