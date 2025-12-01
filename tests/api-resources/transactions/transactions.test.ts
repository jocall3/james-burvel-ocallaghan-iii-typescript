// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import JamesBurvelOcallaghanIii from 'james-burvel-ocallaghan-iii';

const client = new JamesBurvelOcallaghanIii({
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource transactions', () => {
  test('retrieve', async () => {
    const responsePromise = client.transactions.retrieve('txn_quantum-2024-07-21-A7B8C9');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('list', async () => {
    const responsePromise = client.transactions.list();
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
      client.transactions.list(
        {
          category: 'Groceries',
          endDate: '2024-12-31',
          limit: {},
          maxAmount: 100,
          minAmount: 20,
          offset: {},
          searchQuery: 'Starbucks',
          startDate: '2024-01-01',
          type: 'expense',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(JamesBurvelOcallaghanIii.NotFoundError);
  });

  test('categorize: only required params', async () => {
    const responsePromise = client.transactions.categorize('txn_quantum-2024-07-21-A7B8C9', {
      category: 'Home > Groceries',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('categorize: required and optional params', async () => {
    const response = await client.transactions.categorize('txn_quantum-2024-07-21-A7B8C9', {
      category: 'Home > Groceries',
      applyToFuture: true,
      notes: 'Bulk purchase for party',
    });
  });

  test('dispute: only required params', async () => {
    const responsePromise = client.transactions.dispute('txn_quantum-2024-07-21-A7B8C9', {
      details:
        'I did not authorize this purchase. My card may have been compromised and I was traveling internationally on this date.',
      reason: 'unauthorized',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('dispute: required and optional params', async () => {
    const response = await client.transactions.dispute('txn_quantum-2024-07-21-A7B8C9', {
      details:
        'I did not authorize this purchase. My card may have been compromised and I was traveling internationally on this date.',
      reason: 'unauthorized',
      supportingDocuments: ['https://demobank.com/uploads/flight_ticket.png'],
    });
  });

  test('updateNotes: only required params', async () => {
    const responsePromise = client.transactions.updateNotes('txn_quantum-2024-07-21-A7B8C9', {
      notes: 'This was a special coffee for a client meeting.',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('updateNotes: required and optional params', async () => {
    const response = await client.transactions.updateNotes('txn_quantum-2024-07-21-A7B8C9', {
      notes: 'This was a special coffee for a client meeting.',
    });
  });
});
