import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- Existing Interfaces and Mock Data (start) ---
interface Sdk {
    id: string;
    language: string;
    version: string;
    docsUrl: string;
    description: string;
    platform: 'frontend' | 'backend' | 'mobile' | 'universal';
    dependencies: string[];
    lastUpdated: string;
    avgDownloadTimeMs: number;
    maintainer: string;
    license: 'MIT' | 'Apache 2.0' | 'GPL 3.0' | 'Proprietary';
    stars: number;
    forks: number;
    issues: number;
    contributors: string[];
    releaseNotesUrl: string;
    setupGuideUrl: string;
    installationCmd: string;
    packageName: string;
    usageExamples: { title: string; snippet: string; }[];
    supportedFrameworks: string[];
}

const MOCK_SDKS: Sdk[] = [
    {
        id: 'ts',
        language: 'TypeScript',
        version: '3.5.1',
        docsUrl: '/docs/ts',
        description: 'The official TypeScript SDK for integrating with DemoBank APIs.',
        platform: 'universal',
        dependencies: ['axios', 'rxjs'],
        lastUpdated: '2023-11-15',
        avgDownloadTimeMs: 1200,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 1234,
        forks: 567,
        issues: 23,
        contributors: ['alice', 'bob', 'charlie'],
        releaseNotesUrl: '/release-notes/ts-3.5.1',
        setupGuideUrl: '/guides/ts-setup',
        installationCmd: 'npm install @demobank/ts-sdk',
        packageName: '@demobank/ts-sdk',
        usageExamples: [
            { title: 'Create Payment', snippet: `import { PaymentService } from '@demobank/ts-sdk';\nconst service = new PaymentService(apiKey);\nawait service.createPayment({ amount: 100, currency: 'USD' });` },
            { title: 'Fetch Account', snippet: `import { AccountService } from '@demobank/ts-sdk';\nconst service = new AccountService(apiKey);\nawait service.getAccount('acc_123');` },
        ],
        supportedFrameworks: ['Node.js', 'React', 'Angular', 'Vue'],
    },
    {
        id: 'py',
        language: 'Python',
        version: '2.8.0',
        docsUrl: '/docs/py',
        description: 'A comprehensive Python SDK for backend and data processing tasks.',
        platform: 'backend',
        dependencies: ['requests', 'dataclasses_json'],
        lastUpdated: '2023-11-10',
        avgDownloadTimeMs: 900,
        maintainer: 'DemoBank Dev Team',
        license: 'Apache 2.0',
        stars: 2100,
        forks: 890,
        issues: 15,
        contributors: ['diana', 'eve'],
        releaseNotesUrl: '/release-notes/py-2.8.0',
        setupGuideUrl: '/guides/py-setup',
        installationCmd: 'pip install demobank-python-sdk',
        packageName: 'demobank-python-sdk',
        usageExamples: [
            { title: 'Create Customer', snippet: `from demobank import CustomerService\nservice = CustomerService(api_key)\nservice.create_customer(name="John Doe")` },
            { title: 'List Transactions', snippet: `from demobank import TransactionService\nservice = TransactionService(api_key)\ntransactions = service.list_transactions(limit=10)` },
        ],
        supportedFrameworks: ['Django', 'Flask', 'FastAPI'],
    },
    {
        id: 'go',
        language: 'Go',
        version: '1.12.3',
        docsUrl: '/docs/go',
        description: 'High-performance Go SDK for microservices and critical backend systems.',
        platform: 'backend',
        dependencies: ['go-resty/resty', 'jsoniter'],
        lastUpdated: '2023-10-28',
        avgDownloadTimeMs: 700,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 980,
        forks: 340,
        issues: 8,
        contributors: ['frank', 'grace'],
        releaseNotesUrl: '/release-notes/go-1.12.3',
        setupGuideUrl: '/guides/go-setup',
        installationCmd: 'go get github.com/demobank/go-sdk',
        packageName: 'github.com/demobank/go-sdk',
        usageExamples: [
            { title: 'Initiate Transfer', snippet: `package main\nimport "github.com/demobank/go-sdk"\nfunc main() {\n  client := demobank.NewClient("YOUR_API_KEY")\n  client.Transfers.Create(transferRequest)\n}` },
            { title: 'Get Balance', snippet: `package main\nimport "github.com/demobank/go-sdk"\nfunc main() {\n  client := demobank.NewClient("YOUR_API_KEY")\n  balance, _ := client.Accounts.GetBalance("acc_abc")\n}` },
        ],
        supportedFrameworks: ['Gin', 'Echo', 'Gorilla/Mux'],
    },
    {
        id: 'rb',
        language: 'Ruby',
        version: '2.2.0',
        docsUrl: '/docs/rb',
        description: 'Ruby SDK for web applications built with Rails or Sinatra.',
        platform: 'backend',
        dependencies: ['httparty', 'json'],
        lastUpdated: '2023-09-20',
        avgDownloadTimeMs: 1100,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 750,
        forks: 210,
        issues: 12,
        contributors: ['heidi', 'ivan'],
        releaseNotesUrl: '/release-notes/rb-2.2.0',
        setupGuideUrl: '/guides/rb-setup',
        installationCmd: 'gem install demobank-ruby',
        packageName: 'demobank-ruby',
        usageExamples: [
            { title: 'Refund Transaction', snippet: `require 'demobank'\nclient = Demobank::Client.new(api_key: 'YOUR_API_KEY')\nclient.transactions.refund(transaction_id: 'txn_xyz')` },
            { title: 'Verify Webhook', snippet: `require 'demobank'\nverified = Demobank::Webhook.verify(payload: body, signature: headers['Demobank-Signature'])` },
        ],
        supportedFrameworks: ['Rails', 'Sinatra'],
    },
    {
        id: 'java',
        language: 'Java',
        version: '1.0.0',
        docsUrl: '/docs/java',
        description: 'Enterprise-grade Java SDK for robust backend services.',
        platform: 'backend',
        dependencies: ['okhttp', 'jackson'],
        lastUpdated: '2023-11-20',
        avgDownloadTimeMs: 1500,
        maintainer: 'DemoBank Dev Team',
        license: 'Apache 2.0',
        stars: 1500,
        forks: 600,
        issues: 10,
        contributors: ['john', 'doe'],
        releaseNotesUrl: '/release-notes/java-1.0.0',
        setupGuideUrl: '/guides/java-setup',
        installationCmd: 'Maven: <dependency><groupId>com.demobank</groupId><artifactId>demobank-java-sdk</artifactId><version>1.0.0</version></dependency>',
        packageName: 'demobank-java-sdk',
        usageExamples: [
            { title: 'Create Customer', snippet: `import com.demobank.client.DemobankClient;\nDemobankClient client = new DemobankClient("YOUR_API_KEY");\nclient.customers().create(new CustomerCreateRequest("John Doe"));` },
            { title: 'Process Payment', snippet: `import com.demobank.client.DemobankClient;\nDemobankClient client = new DemobankClient("YOUR_API_KEY");\nclient.payments().process(new PaymentProcessRequest(100.0, "USD"));` },
        ],
        supportedFrameworks: ['Spring Boot', 'Quarkus', 'Micronaut'],
    },
    {
        id: 'csharp',
        language: 'C#',
        version: '4.0.0',
        docsUrl: '/docs/csharp',
        description: '.NET SDK for building scalable applications with C#.',
        platform: 'backend',
        dependencies: ['Newtonsoft.Json', 'Microsoft.Net.Http'],
        lastUpdated: '2023-11-01',
        avgDownloadTimeMs: 1300,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 800,
        forks: 300,
        issues: 7,
        contributors: ['susan', 'mike'],
        releaseNotesUrl: '/release-notes/csharp-4.0.0',
        setupGuideUrl: '/guides/csharp-setup',
        installationCmd: 'dotnet add package Demobank.Sdk',
        packageName: 'Demobank.Sdk',
        usageExamples: [
            { title: 'Create Invoice', snippet: `using Demobank.Sdk;\nvar client = new DemobankClient("YOUR_API_KEY");\nawait client.Invoices.CreateAsync(new InvoiceCreateModel { Amount = 50.0m });` },
            { title: 'Get Transaction History', snippet: `using Demobank.Sdk;\nvar client = new DemobankClient("YOUR_API_KEY");\nvar history = await client.Transactions.GetHistoryAsync();` },
        ],
        supportedFrameworks: ['.NET Core', 'ASP.NET'],
    },
    {
        id: 'php',
        language: 'PHP',
        version: '1.5.0',
        docsUrl: '/docs/php',
        description: 'A robust PHP SDK for integrating with DemoBank services.',
        platform: 'backend',
        dependencies: ['guzzlehttp/guzzle'],
        lastUpdated: '2023-10-10',
        avgDownloadTimeMs: 1000,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 600,
        forks: 250,
        issues: 5,
        contributors: ['pete', 'lisa'],
        releaseNotesUrl: '/release-notes/php-1.5.0',
        setupGuideUrl: '/guides/php-setup',
        installationCmd: 'composer require demobank/php-sdk',
        packageName: 'demobank/php-sdk',
        usageExamples: [
            { title: 'Perform Checkout', snippet: `use Demobank\\Sdk\\Client;\n$client = new Client('YOUR_API_KEY');\n$checkout = $client->checkout->create(['amount' => 200]);` },
            { title: 'Retrieve Webhook Event', snippet: `use Demobank\\Sdk\\Webhook;\n$event = Webhook::constructEvent($payload, $signature);` },
        ],
        supportedFrameworks: ['Laravel', 'Symfony', 'WordPress'],
    },
    {
        id: 'swift',
        language: 'Swift',
        version: '2.0.0',
        docsUrl: '/docs/swift',
        description: 'Native iOS SDK for building DemoBank integrations on Apple platforms.',
        platform: 'mobile',
        dependencies: [], // Native usually means fewer external dependencies for core SDK functionality
        lastUpdated: '2023-11-25',
        avgDownloadTimeMs: 1800,
        maintainer: 'DemoBank Mobile Team',
        license: 'Proprietary',
        stars: 400,
        forks: 100,
        issues: 3,
        contributors: ['emma', 'liam'],
        releaseNotesUrl: '/release-notes/swift-2.0.0',
        setupGuideUrl: '/guides/swift-setup',
        installationCmd: 'Podfile: pod \'DemobankSwiftSDK\'',
        packageName: 'DemobankSwiftSDK',
        usageExamples: [
            { title: 'Initialize SDK', snippet: `import DemobankSwiftSDK\nDemobankClient.shared.configure(apiKey: "YOUR_API_KEY")` },
            { title: 'Make Payment', snippet: `DemobankClient.shared.payments.create(amount: 50.0, currency: "USD") { result in ... }` },
        ],
        supportedFrameworks: ['iOS', 'macOS'],
    },
    {
        id: 'kotlin',
        language: 'Kotlin',
        version: '1.2.0',
        docsUrl: '/docs/kotlin',
        description: 'Native Android SDK for integrating DemoBank services into Kotlin/Java apps.',
        platform: 'mobile',
        dependencies: ['com.squareup.okhttp3:okhttp', 'com.google.code.gson:gson'],
        lastUpdated: '2023-11-22',
        avgDownloadTimeMs: 1700,
        maintainer: 'DemoBank Mobile Team',
        license: 'Apache 2.0',
        stars: 350,
        forks: 90,
        issues: 4,
        contributors: ['olivia', 'noah'],
        releaseNotesUrl: '/release-notes/kotlin-1.2.0',
        setupGuideUrl: '/guides/kotlin-setup',
        installationCmd: 'Gradle: implementation \'com.demobank:android-sdk:1.2.0\'',
        packageName: 'com.demobank:android-sdk',
        usageExamples: [
            { title: 'Configure SDK', snippet: `import com.demobank.android.DemobankSDK\nDemobankSDK.initialize(applicationContext, "YOUR_API_KEY")` },
            { title: 'Process Transaction', snippet: `DemobankSDK.transactionService.process(TransactionRequest(100.0, "USD")) { result -> ... }` },
        ],
        supportedFrameworks: ['Android'],
    },
    {
        id: 'node',
        language: 'Node.js',
        version: '4.1.0',
        docsUrl: '/docs/node',
        description: 'Official Node.js SDK for server-side JavaScript applications.',
        platform: 'backend',
        dependencies: ['axios', 'dotenv'],
        lastUpdated: '2023-11-18',
        avgDownloadTimeMs: 1100,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 1800,
        forks: 700,
        issues: 20,
        contributors: ['sam', 'taylor'],
        releaseNotesUrl: '/release-notes/node-4.1.0',
        setupGuideUrl: '/guides/node-setup',
        installationCmd: 'npm install @demobank/node-sdk',
        packageName: '@demobank/node-sdk',
        usageExamples: [
            { title: 'Create Charge', snippet: `const { Demobank } = require('@demobank/node-sdk');\nconst demobank = new Demobank('YOUR_API_KEY');\nawait demobank.charges.create({ amount: 2000, currency: 'usd' });` },
            { title: 'Retrieve Customer', snippet: `const { Demobank } = require('@demobank/node-sdk');\nconst demobank = new Demobank('YOUR_API_KEY');\nawait demobank.customers.retrieve('cus_abc');` },
        ],
        supportedFrameworks: ['Express', 'NestJS', 'Koa'],
    },
    {
        id: 'rust',
        language: 'Rust',
        version: '0.9.0',
        docsUrl: '/docs/rust',
        description: 'Experimental Rust SDK for high-performance and safe integrations.',
        platform: 'backend',
        dependencies: ['reqwest', 'serde', 'tokio'],
        lastUpdated: '2023-11-05',
        avgDownloadTimeMs: 1400,
        maintainer: 'DemoBank Labs',
        license: 'MIT',
        stars: 250,
        forks: 80,
        issues: 6,
        contributors: ['zoe', 'xander'],
        releaseNotesUrl: '/release-notes/rust-0.9.0',
        setupGuideUrl: '/guides/rust-setup',
        installationCmd: 'Cargo.toml: demobank_sdk = "0.9.0"',
        packageName: 'demobank_sdk',
        usageExamples: [
            { title: 'Initialize Client', snippet: `use demobank_sdk::Client;\nlet client = Client::new("YOUR_API_KEY");` },
            { title: 'Fetch Product', snippet: `let product = client.products().get("prod_123").await?;` },
        ],
        supportedFrameworks: ['Actix-web', 'Rocket'],
    },
    {
        id: 'dart',
        language: 'Dart',
        version: '1.1.0',
        docsUrl: '/docs/dart',
        description: 'Flutter-compatible Dart SDK for cross-platform mobile and web applications.',
        platform: 'universal',
        dependencies: ['http', 'json_annotation'],
        lastUpdated: '2023-10-15',
        avgDownloadTimeMs: 1600,
        maintainer: 'DemoBank Mobile Team',
        license: 'MIT',
        stars: 300,
        forks: 70,
        issues: 2,
        contributors: ['yara', 'victor'],
        releaseNotesUrl: '/release-notes/dart-1.1.0',
        setupGuideUrl: '/guides/dart-setup',
        installationCmd: 'pubspec.yaml: demobank_sdk: ^1.1.0',
        packageName: 'demobank_sdk',
        usageExamples: [
            { title: 'Create Order', snippet: `import 'package:demobank_sdk/demobank_sdk.dart';\nfinal client = DemobankClient('YOUR_API_KEY');\nawait client.orders.create(OrderRequest(amount: 150.0, currency: 'EUR'));` },
            { title: 'List Accounts', snippet: `final accounts = await client.accounts.list();` },
        ],
        supportedFrameworks: ['Flutter', 'AngularDart'],
    }
];
// --- Existing Interfaces and Mock Data (end) ---

// --- NEW GLOBAL UTILITIES AND CONSTANTS (start) ---
/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Indicates if the API call was successful.
 * @property {string} message - A human-readable message about the operation.
 * @property {any} data - The data returned by the API, if successful.
 * @property {string} [errorCode] - An error code, if the call failed.
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errorCode?: string;
}

/**
 * Custom hook for debouncing a value.
 * @template T
 * @param {T} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {T} The debounced value.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Global application constants.
 */
export const APP_CONSTANTS = {
    DEFAULT_API_KEY: 'sk-demobank-mock-key-12345',
    AI_MODEL: 'gemini-pro-1.5', // Upgraded AI model for more complex tasks
    DEFAULT_PROMPT_TEMPLATES: [
        'create a new payment order for $100',
        'refund transaction TXN_ABC_XYZ',
        'fetch customer details for user ID 123',
        'list all recent invoices',
        'update webhook endpoint URL',
        'verify a webhook signature',
        'capture a pre-authorized payment',
        'generate a report for last month\'s transactions',
        'create a subscription for a premium plan',
        'cancel subscription SUB_ID_987'
    ],
    MAX_PROMPT_HISTORY: 20,
    MAX_CODE_SNIPPET_LENGTH: 5000,
    SUPPORTED_AI_LANGUAGES: ['TypeScript', 'Python', 'Go', 'Ruby', 'Java', 'C#', 'PHP', 'Node.js', 'Rust', 'Dart'],
    SDK_PLATFORMS: ['frontend', 'backend', 'mobile', 'universal'],
    SDK_LICENSES: ['MIT', 'Apache 2.0', 'GPL 3.0', 'Proprietary'],
    DEFAULT_THEME: 'dark', // Example theme
};

/**
 * A mock API client for SDK-related operations.
 * Simulates network delays.
 */
export const mockApiClient = {
    /**
     * Fetches a list of all available SDKs.
     * @returns {Promise<ApiResponse<Sdk[]>>}
     */
    fetchSdks: async (): Promise<ApiResponse<Sdk[]>> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Successfully fetched SDKs.',
                    data: MOCK_SDKS,
                });
            }, 500);
        });
    },

    /**
     * Fetches details for a specific SDK by ID.
     * @param {string} sdkId - The ID of the SDK.
     * @returns {Promise<ApiResponse<Sdk | null>>}
     */
    fetchSdkDetails: async (sdkId: string): Promise<ApiResponse<Sdk | null>> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const sdk = MOCK_SDKS.find(s => s.id === sdkId);
                if (sdk) {
                    resolve({
                        success: true,
                        message: `Successfully fetched SDK ${sdkId}.`,
                        data: sdk,
                    });
                } else {
                    resolve({
                        success: false,
                        message: `SDK ${sdkId} not found.`,
                        data: null,
                        errorCode: 'SDK_NOT_FOUND',
                    });
                }
            }, 300);
        });
    },

    /**
     * Simulates downloading an SDK.
     * @param {string} sdkId - The ID of the SDK to download.
     * @returns {Promise<ApiResponse<any>>}
     */
    downloadSdk: async (sdkId: string): Promise<ApiResponse<any>> => {
        return new Promise(resolve => {
            const sdk = MOCK_SDKS.find(s => s.id === sdkId);
            if (!sdk) {
                resolve({ success: false, message: `SDK ${sdkId} not found.`, data: null, errorCode: 'SDK_NOT_FOUND' });
                return;
            }
            setTimeout(() => {
                // Simulate download process
                console.log(`Downloading SDK: ${sdk.language} v${sdk.version}...`);
                resolve({
                    success: true,
                    message: `Successfully initiated download for ${sdk.language} SDK.`,
                    data: { sdkId, downloadUrl: `/cdn/sdk/${sdkId}-${sdk.version}.zip` }
                });
            }, sdk.avgDownloadTimeMs || 1000); // Use avgDownloadTimeMs or default
        });
    },

    /**
     * Submits a support ticket.
     * @param {object} ticketDetails - Details for the support ticket.
     * @returns {Promise<ApiResponse<any>>}
     */
    submitSupportTicket: async (ticketDetails: { subject: string; message: string; sdkId?: string }): Promise<ApiResponse<any>> => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Support ticket submitted:', ticketDetails);
                resolve({
                    success: true,
                    message: 'Your support ticket has been submitted successfully. We will get back to you shortly.',
                    data: { ticketId: `TICKET_${Date.now()}` }
                });
            }, 1500);
        });
    },

    /**
     * Fetches mock API endpoint details for exploration.
     * @returns {Promise<ApiResponse<ApiEndpoint[]>>}
     */
    fetchApiEndpoints: async (): Promise<ApiResponse<ApiEndpoint[]>> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Successfully fetched API endpoints.',
                    data: MOCK_API_ENDPOINTS
                });
            }, 400);
        });
    },

    /**
     * Executes a mock API request.
     * @param {ApiRequestPayload} request - The API request payload.
     * @returns {Promise<ApiResponse<any>>}
     */
    executeApiRequest: async (request: ApiRequestPayload): Promise<ApiResponse<any>> => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Executing mock API request:', request);
                // Simulate various responses
                if (request.url.includes('/error')) {
                    resolve({ success: false, message: 'Simulated API error.', data: null, errorCode: 'MOCK_API_ERROR' });
                } else if (request.url.includes('/payments') && request.method === 'POST') {
                    resolve({
                        success: true,
                        message: 'Payment created successfully (mock).',
                        data: {
                            id: `pay_${Date.now()}`,
                            amount: JSON.parse(request.body || '{}').amount || 100,
                            currency: JSON.parse(request.body || '{}').currency || 'USD',
                            status: 'succeeded',
                            createdAt: new Date().toISOString()
                        }
                    });
                } else if (request.url.includes('/customers')) {
                    resolve({
                        success: true,
                        message: 'Customer details (mock).',
                        data: {
                            id: `cus_${Date.now()}`,
                            name: 'Mock Customer',
                            email: 'mock@example.com'
                        }
                    });
                } else {
                    resolve({
                        success: true,
                        message: 'Generic mock API response.',
                        data: {
                            status: 'success',
                            requestedUrl: request.url,
                            method: request.method,
                            params: request.params,
                            body: request.body ? JSON.parse(request.body) : null,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            }, 800);
        });
    },

    /**
     * Fetches mock documentation content.
     * @param {string} path - The documentation path.
     * @returns {Promise<ApiResponse<string>>}
     */
    fetchDocumentationContent: async (path: string): Promise<ApiResponse<string>> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const contentMap: { [key: string]: string } = {
                    '/docs/ts': `# TypeScript SDK Documentation\n\nThis is the *full* documentation for the TypeScript SDK.\n\n## Installation\n\n\`\`\`bash\nnpm install @demobank/ts-sdk\n\`\`\`\n\n## Usage\n\n\`\`\`typescript\nimport { DemobankClient } from '@demobank/ts-sdk';\nconst client = new DemobankClient({ apiKey: 'YOUR_API_KEY' });\nconst payment = await client.payments.create({ amount: 100, currency: 'USD' });\nconsole.log(payment);\n\`\`\`\n\n### Payments\n\nMethods for handling payment operations.\n\n### Accounts\n\nManage customer accounts.\n\n### Webhooks\n\nSetup and verification.\n\n## Advanced Topics\n\nLearn about custom configurations, error handling, and security best practices.\n\n`,
                    '/docs/py': `# Python SDK Documentation\n\nWelcome to the Python SDK docs!.\n\n## Getting Started\n\n\`\`\`bash\npip install demobank-python-sdk\n\`\`\`\n\n## Examples\n\n\`\`\`python\nfrom demobank import Client\nclient = Client(api_key='YOUR_API_KEY')\ncustomer = client.customers.create(name='Jane Doe')\nprint(customer)\n\`\`\`\n`,
                    '/docs/go': `# Go SDK Documentation\n\nComprehensive guide for Go developers.\n\n## Quick Start\n\n\`\`\`go\npackage main\nimport "github.com/demobank/go-sdk"\nfunc main() {\n  client := demobank.NewClient("YOUR_API_KEY")\n  // ... further usage\n}\n\`\`\`\n`,
                    '/docs/rb': `# Ruby SDK Documentation\n\nIntegrate DemoBank with your Ruby applications.\n\n## Setup\n\n\`\`\`ruby\ngem install demobank-ruby\n\`\`\`\n`,
                    '/docs/java': `# Java SDK Documentation\n\nDocumentation for the DemoBank Java SDK.\n`,
                    '/docs/csharp': `# C# SDK Documentation\n\nDocumentation for the DemoBank C# (.NET) SDK.\n`,
                    '/docs/php': `# PHP SDK Documentation\n\nDocumentation for the DemoBank PHP SDK.\n`,
                    '/docs/swift': `# Swift SDK Documentation\n\nDocumentation for the DemoBank Swift (iOS) SDK.\n`,
                    '/docs/kotlin': `# Kotlin SDK Documentation\n\nDocumentation for the DemoBank Kotlin (Android) SDK.\n`,
                    '/docs/node': `# Node.js SDK Documentation\n\nDocumentation for the DemoBank Node.js SDK.\n`,
                    '/docs/rust': `# Rust SDK Documentation\n\nDocumentation for the DemoBank Rust SDK.\n`,
                    '/docs/dart': `# Dart SDK Documentation\n\nDocumentation for the DemoBank Dart SDK.\n`,
                    '/docs/introduction': `# Introduction\n\nWelcome to the DemoBank Developer Portal. Here you can find all the resources to integrate with our powerful financial APIs.`,
                    '/docs/authentication': `# Authentication\n\nAll API requests require authentication. We support API Key authentication via ` + "`Authorization: Bearer YOUR_API_KEY`" + ` header.\n\nYour API keys can be managed in the settings section.`,
                    '/docs/webhooks': `# Webhooks\n\nWebhooks allow you to receive real-time notifications for events happening in your DemoBank account.`,
                    '/docs/error_codes': `# Error Codes\n\nList of common error codes and their meanings.`,
                };
                const content = contentMap[path] || `# Documentation Not Found\n\nSorry, the document at \`${path}\` could not be found.`;
                resolve({ success: true, message: 'Content loaded.', data: content });
            }, 600);
        });
    },

    /**
     * Searches documentation.
     * @param {string} query - The search query.
     * @returns {Promise<ApiResponse<DocSearchResult[]>>}
     */
    searchDocumentation: async (query: string): Promise<ApiResponse<DocSearchResult[]>> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const lowerQuery = query.toLowerCase();
                const results = Object.entries(MOCK_DOCS_STRUCTURE)
                    .flatMap(([category, items]) => items.map(item => ({ category, ...item })))
                    .filter(doc =>
                        doc.title.toLowerCase().includes(lowerQuery) ||
                        doc.description.toLowerCase().includes(lowerQuery)
                    )
                    .map(doc => ({
                        title: doc.title,
                        path: doc.path,
                        snippet: doc.description.length > 100 ? doc.description.substring(0, 97) + '...' : doc.description,
                        relevance: 0.8 // Mock relevance
                    }));
                resolve({ success: true, message: `Found ${results.length} results.`, data: results });
            }, 700);
        });
    }
};

/**
 * Utility for rendering Markdown.
 * (Placeholder, would typically be a library like `marked` or `react-markdown`)
 * @param {string} markdown - The markdown string to render.
 * @returns {string} HTML string.
 */
export const renderMarkdownToHtml = (markdown: string): string => {
    // This is a highly simplified mock. In a real app, use a robust markdown parser.
    let html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>') // Inline code
        .replace(/```([a-zA-Z]*)\n([\s\S]*?)\n```/gim, (match, lang, code) => {
            const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<pre><code class="language-${lang || 'plaintext'}">${escapedCode}</code></pre>`;
        })
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/<li>(.*)<\/li>/gim, '<ul><li>$1</li></ul>')
        .replace(/\n/gim, '<br/>'); // Simple line breaks

    // Clean up extra <br/> inside code blocks (a common issue with simple regex parsers)
    html = html.replace(/<pre><code.*?>(.*?)<\/code><\/pre>/gs, (match, codeContent) => {
        return match.replace(/<br\/>/g, '\n');
    });

    return html;
};

/**
 * Custom hook to manage toast notifications.
 * @returns {object} - Functions for adding, dismissing toasts, and the list of toasts.
 */
export const useToastNotifications = () => {
    const [toasts, setToasts] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; duration?: number }[]>([]);

    const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 5000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(toast => toast.id !== id));
            }, duration);
        }
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return { toasts, addToast, dismissToast };
};

/**
 * ToastNotification component.
 * @param {object} props - Component props.
 * @param {string} props.id - Unique ID of the toast.
 * @param {string} props.message - The message to display.
 * @param {'info' | 'success' | 'warning' | 'error'} props.type - The type of toast.
 * @param {function(string): void} props.onDismiss - Callback to dismiss the toast.
 */
export const ToastNotification: React.FC<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; onDismiss: (id: string) => void }> = ({ id, message, type, onDismiss }) => {
    const typeClasses = {
        info: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600',
    };
    return (
        <div className={`p-4 rounded-lg shadow-lg text-white flex items-center justify-between transition-opacity duration-300 ${typeClasses[type]}`}>
            <span>{message}</span>
            <button onClick={() => onDismiss(id)} className="ml-4 text-white opacity-75 hover:opacity-100">&times;</button>
        </div>
    );
};

/**
 * NotificationStack component to display all active toasts.
 * @param {object} props - Component props.
 * @param {any[]} props.toasts - Array of toast objects.
 * @param {function(string): void} props.onDismiss - Callback to dismiss a toast.
 */
export const NotificationStack: React.FC<{ toasts: any[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 w-72">
            {toasts.map(toast => (
                <ToastNotification key={toast.id} {...toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

// --- NEW GLOBAL UTILITIES AND CONSTANTS (end) ---

// --- NEW INTERFACES AND MOCK DATA FOR EXPANSION (start) ---
/**
 * Represents a historical download entry.
 * @interface DownloadHistoryEntry
 * @property {string} sdkId - The ID of the downloaded SDK.
 * @property {string} sdkVersion - The version of the downloaded SDK.
 * @property {string} timestamp - ISO string of when the download occurred.
 * @property {string} downloadUrl - The URL from which it was downloaded.
 * @property {string} os - Operating system of the downloader.
 * @property {string} browser - Browser used for download.
 * @property {string} ipAddress - IP address (mocked/anonymized).
 */
export interface DownloadHistoryEntry {
    sdkId: string;
    sdkVersion: string;
    timestamp: string;
    downloadUrl: string;
    os: string;
    browser: string;
    ipAddress: string;
}

const MOCK_DOWNLOAD_HISTORY: DownloadHistoryEntry[] = [
    { sdkId: 'ts', sdkVersion: '3.5.1', timestamp: '2023-11-20T10:00:00Z', downloadUrl: '/cdn/sdk/ts-3.5.1.zip', os: 'macOS', browser: 'Chrome', ipAddress: '192.168.1.10' },
    { sdkId: 'py', sdkVersion: '2.8.0', timestamp: '2023-11-19T14:30:00Z', downloadUrl: '/cdn/sdk/py-2.8.0.zip', os: 'Windows', browser: 'Edge', ipAddress: '192.168.1.11' },
    { sdkId: 'go', sdkVersion: '1.12.3', timestamp: '2023-11-18T09:15:00Z', downloadUrl: '/cdn/sdk/go-1.12.3.zip', os: 'Linux', browser: 'Firefox', ipAddress: '192.168.1.12' },
    { sdkId: 'ts', sdkVersion: '3.5.1', timestamp: '2023-11-17T11:00:00Z', downloadUrl: '/cdn/sdk/ts-3.5.1.zip', os: 'macOS', browser: 'Safari', ipAddress: '192.168.1.13' },
    { sdkId: 'java', sdkVersion: '1.0.0', timestamp: '2023-11-21T16:00:00Z', downloadUrl: '/cdn/sdk/java-1.0.0.zip', os: 'Windows', browser: 'Chrome', ipAddress: '192.168.1.14' },
    { sdkId: 'csharp', sdkVersion: '4.0.0', timestamp: '2023-11-15T10:00:00Z', downloadUrl: '/cdn/sdk/csharp-4.0.0.zip', os: 'Windows', browser: 'Edge', ipAddress: '192.168.1.15' },
    { sdkId: 'node', sdkVersion: '4.1.0', timestamp: '2023-11-19T11:00:00Z', downloadUrl: '/cdn/sdk/node-4.1.0.zip', os: 'macOS', browser: 'Chrome', ipAddress: '192.168.1.16' },
    { sdkId: 'py', sdkVersion: '2.8.0', timestamp: '2023-11-22T13:00:00Z', downloadUrl: '/cdn/sdk/py-2.8.0.zip', os: 'Linux', browser: 'Chrome', ipAddress: '192.168.1.17' },
    { sdkId: 'swift', sdkVersion: '2.0.0', timestamp: '2023-11-26T08:00:00Z', downloadUrl: '/cdn/sdk/swift-2.0.0.zip', os: 'iOS', browser: 'Safari', ipAddress: '192.168.1.18' },
    { sdkId: 'kotlin', sdkVersion: '1.2.0', timestamp: '2023-11-23T09:00:00Z', downloadUrl: '/cdn/sdk/kotlin-1.2.0.zip', os: 'Android', browser: 'Chrome', ipAddress: '192.168.1.19' },
    { sdkId: 'dart', sdkVersion: '1.1.0', timestamp: '2023-11-16T12:00:00Z', downloadUrl: '/cdn/sdk/dart-1.1.0.zip', os: 'macOS', browser: 'Chrome', ipAddress: '192.168.1.20' },
    { sdkId: 'ts', sdkVersion: '3.5.1', timestamp: '2023-11-28T15:00:00Z', downloadUrl: '/cdn/sdk/ts-3.5.1.zip', os: 'Windows', browser: 'Firefox', ipAddress: '192.168.1.21' },
    { sdkId: 'node', sdkVersion: '4.1.0', timestamp: '2023-11-27T17:00:00Z', downloadUrl: '/cdn/sdk/node-4.1.0.zip', os: 'Linux', browser: 'Edge', ipAddress: '192.168.1.22' },
];

/**
 * Represents a saved AI prompt snippet.
 * @interface SavedPrompt
 * @property {string} id - Unique ID for the prompt.
 * @property {string} prompt - The user's input prompt.
 * @property {string} generatedCode - The code generated by AI.
 * @property {string} sdkId - The ID of the SDK for which code was generated.
 * @property {string} language - The language of the generated code.
 * @property {string} timestamp - ISO string of when it was saved.
 * @property {string[]} tags - Optional tags for organization.
 */
export interface SavedPrompt {
    id: string;
    prompt: string;
    generatedCode: string;
    sdkId: string;
    language: string;
    timestamp: string;
    tags: string[];
}

/**
 * Interface for AI Configuration settings.
 * @interface AiConfig
 * @property {string} model - The AI model to use.
 * @property {number} temperature - Controls randomness (0-1).
 * @property {number} maxTokens - Maximum tokens to generate.
 * @property {string} defaultPersona - Persona for the AI (e.g., 'expert-developer', 'friendly-assistant').
 * @property {boolean} enableContextualLearning - Whether AI should learn from previous generations.
 * @property {string[]} preferredLanguages - List of preferred languages for generation.
}
*/
export interface AiConfig {
    model: string;
    temperature: number;
    maxTokens: number;
    defaultPersona: string;
    enableContextualLearning: boolean;
    preferredLanguages: string[];
}

/**
 * Interface for API endpoint details for the API Explorer.
 * @interface ApiEndpoint
 * @property {string} id - Unique ID.
 * @property {string} path - The API path (e.g., /v1/payments).
 * @property {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @property {string} description - Description of the endpoint.
 * @property {object} requestSchema - JSON schema for the request body/params.
 * @property {object} responseSchema - JSON schema for the response body.
 * @property {string[]} tags - Categorization tags (e.g., 'payments', 'customers').
 * @property {string} exampleRequest - A JSON string for an example request body.
 * @property {string} exampleResponse - A JSON string for an example successful response.
 */
export interface ApiEndpoint {
    id: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description: string;
    requestSchema?: object;
    responseSchema?: object;
    tags: string[];
    exampleRequest?: string;
    exampleResponse?: string;
    queryParams?: { name: string; type: string; description: string; required?: boolean; }[];
    pathParams?: { name: string; type: string; description: string; }[];
}

const MOCK_API_ENDPOINTS: ApiEndpoint[] = [
    {
        id: 'get-payments', path: '/v1/payments', method: 'GET', description: 'Retrieve a list of all payments.', tags: ['payments', 'read'],
        responseSchema: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
        queryParams: [{ name: 'limit', type: 'integer', description: 'Number of payments to retrieve.' }, { name: 'status', type: 'string', description: 'Filter by payment status.' }],
        exampleResponse: JSON.stringify([{ id: 'pay_xyz', amount: 100, currency: 'USD', status: 'succeeded' }])
    },
    {
        id: 'create-payment', path: '/v1/payments', method: 'POST', description: 'Create a new payment.', tags: ['payments', 'write'],
        requestSchema: { type: 'object', properties: { amount: { type: 'number' }, currency: { type: 'string' }, customerId: { type: 'string' } } },
        responseSchema: { $ref: '#/components/schemas/Payment' },
        exampleRequest: JSON.stringify({ amount: 1000, currency: 'USD', customerId: 'cus_123' }, null, 2),
        exampleResponse: JSON.stringify({ id: 'pay_abc', amount: 1000, currency: 'USD', status: 'pending' })
    },
    {
        id: 'get-payment-by-id', path: '/v1/payments/{paymentId}', method: 'GET', description: 'Retrieve details for a specific payment.', tags: ['payments', 'read'],
        pathParams: [{ name: 'paymentId', type: 'string', description: 'The ID of the payment.' }],
        responseSchema: { $ref: '#/components/schemas/Payment' },
        exampleResponse: JSON.stringify({ id: 'pay_xyz', amount: 100, currency: 'USD', status: 'succeeded' })
    },
    {
        id: 'refund-payment', path: '/v1/payments/{paymentId}/refund', method: 'POST', description: 'Initiate a refund for a payment.', tags: ['payments', 'write'],
        pathParams: [{ name: 'paymentId', type: 'string', description: 'The ID of the payment to refund.' }],
        requestSchema: { type: 'object', properties: { amount: { type: 'number', description: 'Amount to refund. Optional, refunds full amount if not provided.' } } },
        responseSchema: { $ref: '#/components/schemas/Refund' },
        exampleRequest: JSON.stringify({ amount: 500 }, null, 2),
        exampleResponse: JSON.stringify({ id: 'ref_123', paymentId: 'pay_xyz', amount: 500, status: 'initiated' })
    },
    {
        id: 'list-customers', path: '/v1/customers', method: 'GET', description: 'List all customer accounts.', tags: ['customers', 'read'],
        responseSchema: { type: 'array', items: { $ref: '#/components/schemas/Customer' } },
        exampleResponse: JSON.stringify([{ id: 'cus_1', name: 'Alice', email: 'alice@example.com' }])
    },
    {
        id: 'create-customer', path: '/v1/customers', method: 'POST', description: 'Create a new customer account.', tags: ['customers', 'write'],
        requestSchema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' } } },
        responseSchema: { $ref: '#/components/schemas/Customer' },
        exampleRequest: JSON.stringify({ name: 'Bob Smith', email: 'bob@example.com' }, null, 2),
        exampleResponse: JSON.stringify({ id: 'cus_2', name: 'Bob Smith', email: 'bob@example.com' })
    },
    {
        id: 'update-customer', path: '/v1/customers/{customerId}', method: 'PUT', description: 'Update an existing customer account.', tags: ['customers', 'write'],
        pathParams: [{ name: 'customerId', type: 'string', description: 'The ID of the customer.' }],
        requestSchema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' } } },
        responseSchema: { $ref: '#/components/schemas/Customer' },
        exampleRequest: JSON.stringify({ name: 'Bob Johnson' }, null, 2),
        exampleResponse: JSON.stringify({ id: 'cus_2', name: 'Bob Johnson', email: 'bob@example.com' })
    },
    {
        id: 'delete-customer', path: '/v1/customers/{customerId}', method: 'DELETE', description: 'Delete a customer account.', tags: ['customers', 'write'],
        pathParams: [{ name: 'customerId', type: 'string', description: 'The ID of the customer.' }],
        responseSchema: { type: 'object', properties: { message: { type: 'string' } } },
        exampleResponse: JSON.stringify({ message: 'Customer deleted successfully.' })
    },
    {
        id: 'list-webhooks', path: '/v1/webhooks', method: 'GET', description: 'List all configured webhooks.', tags: ['webhooks', 'read'],
        responseSchema: { type: 'array', items: { $ref: '#/components/schemas/Webhook' } },
        exampleResponse: JSON.stringify([{ id: 'wh_1', url: 'https://example.com/webhook', events: ['payment.succeeded'] }])
    },
    {
        id: 'create-webhook', path: '/v1/webhooks', method: 'POST', description: 'Create a new webhook endpoint.', tags: ['webhooks', 'write'],
        requestSchema: { type: 'object', properties: { url: { type: 'string' }, events: { type: 'array', items: { type: 'string' } } } },
        responseSchema: { $ref: '#/components/schemas/Webhook' },
        exampleRequest: JSON.stringify({ url: 'https://my-app.com/demobank-webhook', events: ['charge.succeeded', 'customer.created'] }, null, 2),
        exampleResponse: JSON.stringify({ id: 'wh_2', url: 'https://my-app.com/demobank-webhook', events: ['charge.succeeded', 'customer.created'], secret: 'whsec_randomstring' })
    },
    {
        id: 'test-endpoint', path: '/v1/test/error', method: 'GET', description: 'Endpoint to simulate an API error.', tags: ['testing'],
        exampleResponse: JSON.stringify({ error: 'This is a simulated error.' })
    }
];

/**
 * Interface for API Request Payload in the Explorer.
 * @interface ApiRequestPayload
 * @property {string} url - The full URL of the request.
 * @property {string} method - HTTP method.
 * @property {object} headers - Request headers.
 * @property {object} [params] - Query parameters.
 * @property {string} [body] - Raw request body (JSON string).
 */
export interface ApiRequestPayload {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers: { [key: string]: string };
    params?: { [key: string]: string };
    body?: string;
}

/**
 * Interface for a documentation node in the sidebar navigation.
 * @interface DocNode
 * @property {string} title - Display title for the document.
 * @property {string} path - The internal path to the document content.
 * @property {string} description - A brief description.
 * @property {DocNode[]} [children] - Nested documentation nodes.
 */
export interface DocNode {
    title: string;
    path: string;
    description: string;
    children?: DocNode[];
}

const MOCK_DOCS_STRUCTURE: { [key: string]: DocNode[] } = {
    'Getting Started': [
        { title: 'Introduction', path: '/docs/introduction', description: 'Welcome to the DemoBank Developer Portal.' },
        { title: 'Authentication', path: '/docs/authentication', description: 'How to authenticate your API requests.' },
        { title: 'Error Codes', path: '/docs/error_codes', description: 'Understanding common API error responses.' },
    ],
    'SDKs': MOCK_SDKS.map(sdk => ({
        title: `${sdk.language} SDK v${sdk.version}`,
        path: sdk.docsUrl,
        description: `Reference documentation for the ${sdk.language} SDK.`,
        children: [
            { title: 'Installation', path: `${sdk.docsUrl}#installation`, description: `How to install the ${sdk.language} SDK.` },
            { title: 'Payments API', path: `${sdk.docsUrl}#payments-api`, description: `Using the ${sdk.language} SDK for payment operations.` },
            { title: 'Customers API', path: `${sdk.docsUrl}#customers-api`, description: `Managing customers with the ${sdk.language} SDK.` },
        ]
    })),
    'API Reference': [
        { title: 'Payments API', path: '/api-ref/payments', description: 'Full API reference for payment related endpoints.' },
        { title: 'Customers API', path: '/api-ref/customers', description: 'Full API reference for customer related endpoints.' },
        { title: 'Webhooks', path: '/docs/webhooks', description: 'Guide to setting up and using webhooks.' },
    ],
    'Guides': [
        { title: 'Quickstart Guide', path: '/guides/quickstart', description: 'Your first API call.' },
        { title: 'Implementing Webhooks', path: '/guides/implementing-webhooks', description: 'Detailed steps for integrating webhooks.' },
        { title: 'Advanced Error Handling', path: '/guides/advanced-errors', description: 'Strategies for robust error management.' },
    ]
};

/**
 * Interface for a documentation search result.
 * @interface DocSearchResult
 * @property {string} title - The title of the document.
 * @property {string} path - The path to the document.
 * @property {string} snippet - A short contextual snippet from the document.
 * @property {number} relevance - A score indicating search relevance.
 */
export interface DocSearchResult {
    title: string;
    path: string;
    snippet: string;
    relevance: number;
}

/**
 * Interface for a community forum thread.
 * @interface ForumThread
 * @property {string} id - Unique ID.
 * @property {string} title - Title of the thread.
 * @property {string} author - Author's username.
 * @property {string} lastActivity - ISO string of last activity.
 * @property {number} replies - Number of replies.
 * @property {string[]} tags - Tags for categorization.
 * @property {string} content - Initial post content.
 * @property {ForumComment[]} comments - List of comments.
 */
export interface ForumThread {
    id: string;
    title: string;
    author: string;
    lastActivity: string;
    replies: number;
    tags: string[];
    content: string;
    comments: ForumComment[];
}

/**
 * Interface for a comment within a forum thread.
 * @interface ForumComment
 * @property {string} id - Unique ID.
 * @property {string} author - Author's username.
 * @property {string} timestamp - ISO string of comment creation.
 * @property {string} content - The comment content.
 */
export interface ForumComment {
    id: string;
    author: string;
    timestamp: string;
    content: string;
}

const MOCK_FORUM_THREADS: ForumThread[] = [
    {
        id: 'ft_1', title: 'Python SDK v2.8.0 not installing on M1 Mac', author: 'devuser1', lastActivity: '2023-11-28T14:30:00Z', replies: 5, tags: ['python', 'installation', 'bug'],
        content: 'I\'m having trouble installing the Python SDK on my M1 Mac. `pip install demobank-python-sdk` throws a compilation error. Any ideas?',
        comments: [
            { id: 'fc_1_1', author: 'helperbot', timestamp: '2023-11-28T14:35:00Z', content: 'Please ensure you have Rosetta 2 installed and are using a compatible Python version (e.g., via `conda` or `pyenv`).' },
            { id: 'fc_1_2', author: 'devuser1', timestamp: '2023-11-28T14:40:00Z', content: 'Ah, I was using the native Python. Switched to `pyenv` with `3.9` and it worked! Thanks!' }
        ]
    },
    {
        id: 'ft_2', title: 'Best practices for handling webhooks in Node.js', author: 'webdev_pro', lastActivity: '2023-11-27T10:00:00Z', replies: 12, tags: ['node.js', 'webhooks', 'best-practices'],
        content: 'Looking for advice on how to securely and reliably handle DemoBank webhooks in a Node.js Express application. What are your recommended patterns?',
        comments: []
    },
    {
        id: 'ft_3', title: 'TypeScript SDK: How to handle concurrent requests?', author: 'ts_master', lastActivity: '2023-11-26T18:00:00Z', replies: 8, tags: ['typescript', 'concurrency', 'performance'],
        content: 'When making many API calls with the TypeScript SDK, I\'m seeing some rate limiting. What\'s the best way to manage concurrency and exponential backoff?',
        comments: []
    },
    {
        id: 'ft_4', title: 'Feature Request: Go SDK support for gRPC', author: 'gopher_dev', lastActivity: '2023-11-25T11:00:00Z', replies: 3, tags: ['go', 'feature-request', 'grpc'],
        content: 'Would love to see gRPC support added to the Go SDK for better performance and type safety in microservice architectures.',
        comments: []
    },
    {
        id: 'ft_5', title: 'Payment processing failed with error code P_007', author: 'newbie_dev', lastActivity: '2023-11-24T09:00:00Z', replies: 2, tags: ['payments', 'error-code', 'support'],
        content: 'My payment processing is failing with error code `P_007`. The docs say "Insufficient Funds". What steps should I take to debug this?',
        comments: []
    },
];

/**
 * Interface for an FAQ item.
 * @interface FaqItem
 * @property {string} id - Unique ID.
 * @property {string} question - The FAQ question.
 * @property {string} answer - The detailed answer.
 * @property {string[]} tags - Tags for filtering.
 */
export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    tags: string[];
}

const MOCK_FAQS: FaqItem[] = [
    {
        id: 'faq_1', question: 'How do I get my API key?', tags: ['authentication', 'setup'],
        answer: 'You can generate and manage your API keys from the Developer Settings page in your dashboard. Remember to keep your keys secure and never expose them in client-side code.'
    },
    {
        id: 'faq_2', question: 'What is the rate limit for API calls?', tags: ['api', 'limits', 'performance'],
        answer: 'Our standard rate limit is 100 requests per second per API key. Higher limits can be requested for enterprise plans. Implement exponential backoff for retries to handle transient errors gracefully.'
    },
    {
        id: 'faq_3', question: 'How do I test webhook endpoints locally?', tags: ['webhooks', 'testing'],
        answer: 'You can use tools like `ngrok` or `localtunnel` to expose your local development server to the internet, allowing DemoBank to send webhook events to it. Alternatively, some SDKs provide local testing utilities.'
    },
    {
        id: 'faq_4', question: 'Which SDK should I use?', tags: ['sdk', 'choosing'],
        answer: 'Choose the SDK that best matches your application\'s primary programming language. We offer SDKs for Python, Node.js, Java, Go, Ruby, C#, and TypeScript for various platforms (backend, frontend, mobile).'
    },
    {
        id: 'faq_5', question: 'Can I contribute to the SDKs?', tags: ['community', 'contributing'],
        answer: 'Absolutely! Most of our SDKs are open-source on GitHub. We welcome contributions, bug reports, and feature requests. Check the `CONTRIBUTING.md` file in each SDK repository for guidelines.'
    },
];

/**
 * Interface for user preferences.
 * @interface UserPreferences
 * @property {string} theme - 'light' or 'dark'.
 * @property {boolean} receiveMarketingEmails - Opt-in for marketing emails.
 * @property {boolean} receiveSdkUpdateNotifications - Opt-in for SDK update emails.
 * @property {boolean} enableAiAssistedCoding - Feature toggle for AI.
 * @property {AiConfig} aiConfig - Specific AI configuration.
 * @property {string[]} favoriteSdks - List of favorite SDK IDs.
 */
export interface UserPreferences {
    theme: 'light' | 'dark';
    receiveMarketingEmails: boolean;
    receiveSdkUpdateNotifications: boolean;
    enableAiAssistedCoding: boolean;
    aiConfig: AiConfig;
    favoriteSdks: string[];
}

const DEFAULT_USER_PREFERENCES: UserPreferences = {
    theme: APP_CONSTANTS.DEFAULT_THEME,
    receiveMarketingEmails: true,
    receiveSdkUpdateNotifications: true,
    enableAiAssistedCoding: true,
    aiConfig: {
        model: APP_CONSTANTS.AI_MODEL,
        temperature: 0.7,
        maxTokens: 500,
        defaultPersona: 'expert-developer',
        enableContextualLearning: false,
        preferredLanguages: ['TypeScript', 'Python'],
    },
    favoriteSdks: ['ts', 'py'],
};

/**
 * Interface for a Project Workspace concept (for advanced AI features).
 * @interface ProjectWorkspace
 * @property {string} id - Unique ID.
 * @property {string} name - Name of the project.
 * @property {string} language - Primary language of the project.
 * @property {string} framework - Framework used (e.g., 'Express', 'Django').
 * @property {string[]} installedSdks - List of SDK IDs installed in this project.
 * @property {string} codebaseSnippet - A large code snippet representing the project context.
 * @property {string[]} relevantFiles - List of simulated files in the project.
 */
export interface ProjectWorkspace {
    id: string;
    name: string;
    language: string;
    framework: string;
    installedSdks: string[];
    codebaseSnippet: string;
    relevantFiles: { name: string; content: string }[];
}

const MOCK_PROJECT_WORKSPACES: ProjectWorkspace[] = [
    {
        id: 'proj_1', name: 'E-commerce Backend', language: 'Node.js', framework: 'Express', installedSdks: ['node', 'ts'],
        codebaseSnippet: `
        // src/app.ts
        import express from 'express';
        import { Demobank } from '@demobank/node-sdk';
        const app = express();
        const demobank = new Demobank(process.env.DEMOBANK_API_KEY);

        app.post('/api/payments/create', async (req, res) => {
            try {
                const { amount, currency, customerId } = req.body;
                const payment = await demobank.payments.create({ amount, currency, customerId });
                res.status(201).json(payment);
            } catch (error) {
                console.error('Payment creation failed:', error);
                res.status(500).json({ error: 'Failed to create payment' });
            }
        });

        app.listen(3000, () => console.log('Server running on port 3000'));
        `,
        relevantFiles: [
            { name: 'src/app.ts', content: `import express from 'express';\n// ... more app logic` },
            { name: 'src/services/paymentService.ts', content: `// Payment service abstraction` },
        ]
    },
    {
        id: 'proj_2', name: 'Customer Portal', language: 'Python', framework: 'Django', installedSdks: ['py'],
        codebaseSnippet: `
        # customers/views.py
        from django.shortcuts import render
        from demobank import CustomerService

        def customer_detail(request, customer_id):
            service = CustomerService(api_key=settings.DEMOBANK_API_KEY)
            customer = service.get_customer(customer_id)
            return render(request, 'customer_detail.html', {'customer': customer})
        `,
        relevantFiles: [
            { name: 'customers/views.py', content: `# Django views` },
            { name: 'customers/models.py', content: `# Django models` },
        ]
    }
];

// --- NEW INTERFACES AND MOCK DATA FOR EXPANSION (end) ---

// --- SUB-COMPONENTS FOR SDK MANAGEMENT (start) ---
/**
 * @typedef {Object} SdkFilterOptions
 * @property {string} language - Filter by language.
 * @property {string} platform - Filter by platform.
 * @property {string} searchTerm - Search by description or name.
 * @property {string} license - Filter by license type.
 */
export interface SdkFilterOptions {
    language: string;
    platform: string;
    searchTerm: string;
    license: string;
}

/**
 * @typedef {Object} SdkSortOptions
 * @property {'name' | 'version' | 'stars' | 'lastUpdated' | 'none'} sortBy - Field to sort by.
 * @property {'asc' | 'desc'} sortOrder - Sort order.
 */
export interface SdkSortOptions {
    sortBy: 'name' | 'version' | 'stars' | 'lastUpdated' | 'none';
    sortOrder: 'asc' | 'desc';
}

/**
 * Filter and sort controls for the SDK list.
 * @param {object} props - Component props.
 * @param {SdkFilterOptions} props.filters - Current filter settings.
 * @param {function(SdkFilterOptions): void} props.onFiltersChange - Callback for filter changes.
 * @param {SdkSortOptions} props.sort - Current sort settings.
 * @param {function(SdkSortOptions): void} props.onSortChange - Callback for sort changes.
 */
export const SdkFilterAndSort: React.FC<{
    filters: SdkFilterOptions;
    onFiltersChange: (filters: SdkFilterOptions) => void;
    sort: SdkSortOptions;
    onSortChange: (sort: SdkSortOptions) => void;
}> = ({ filters, onFiltersChange, sort, onSortChange }) => {
    const handleFilterChange = (key: keyof SdkFilterOptions, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const handleSortChange = (key: SdkSortOptions['sortBy']) => {
        const newOrder = sort.sortBy === key && sort.sortOrder === 'asc' ? 'desc' : 'asc';
        onSortChange({ sortBy: key, sortOrder: newOrder });
    };

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800 rounded-lg mb-6">
            <input
                type="text"
                placeholder="Search SDKs..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="flex-grow bg-gray-700/50 p-2 rounded text-white placeholder-gray-400 max-w-xs"
            />
            <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="bg-gray-700/50 p-2 rounded text-white max-w-xs"
            >
                <option value="">All Languages</option>
                {Array.from(new Set(MOCK_SDKS.map(sdk => sdk.language))).sort().map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>
            <select
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="bg-gray-700/50 p-2 rounded text-white max-w-xs"
            >
                <option value="">All Platforms</option>
                {APP_CONSTANTS.SDK_PLATFORMS.map(platform => (
                    <option key={platform} value={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</option>
                ))}
            </select>
            <select
                value={filters.license}
                onChange={(e) => handleFilterChange('license', e.target.value)}
                className="bg-gray-700/50 p-2 rounded text-white max-w-xs"
            >
                <option value="">All Licenses</option>
                {APP_CONSTANTS.SDK_LICENSES.map(license => (
                    <option key={license} value={license}>{license}</option>
                ))}
            </select>

            <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">Sort by:</span>
                <button
                    onClick={() => handleSortChange('name')}
                    className={`py-1 px-3 rounded text-sm ${sort.sortBy === 'name' ? 'bg-cyan-700' : 'bg-gray-600/50'} text-white`}
                >
                    Name {sort.sortBy === 'name' && (sort.sortOrder === 'asc' ? '▲' : '▼')}
                </button>
                <button
                    onClick={() => handleSortChange('lastUpdated')}
                    className={`py-1 px-3 rounded text-sm ${sort.sortBy === 'lastUpdated' ? 'bg-cyan-700' : 'bg-gray-600/50'} text-white`}
                >
                    Last Updated {sort.sortBy === 'lastUpdated' && (sort.sortOrder === 'asc' ? '▲' : '▼')}
                </button>
                <button
                    onClick={() => handleSortChange('stars')}
                    className={`py-1 px-3 rounded text-sm ${sort.sortBy === 'stars' ? 'bg-cyan-700' : 'bg-gray-600/50'} text-white`}
                >
                    Stars {sort.sortBy === 'stars' && (sort.sortOrder === 'asc' ? '▲' : '▼')}
                </button>
            </div>
        </div>
    );
};

/**
 * Displays recent SDK downloads from history.
 * @param {object} props - Component props.
 * @param {DownloadHistoryEntry[]} props.history - Array of download history entries.
 */
export const SdkDownloadHistory: React.FC<{ history: DownloadHistoryEntry[] }> = ({ history }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(history.length / itemsPerPage);

    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return history.slice(startIndex, startIndex + itemsPerPage);
    }, [history, currentPage, itemsPerPage]);

    return (
        <Card title="Recent Download History" className="flex-1 min-w-[300px]">
            {history.length === 0 ? (
                <p className="text-gray-400">No recent downloads found.</p>
            ) : (
                <>
                    <ul className="space-y-3">
                        {paginatedHistory.map((entry, index) => (
                            <li key={index} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-800/50 rounded">
                                <div className="flex-grow">
                                    <p className="font-semibold text-white">{MOCK_SDKS.find(s => s.id === entry.sdkId)?.language || entry.sdkId} v{entry.sdkVersion}</p>
                                    <p className="text-xs text-gray-400">
                                        Downloaded on {new Date(entry.timestamp).toLocaleString()}
                                        <span className="hidden md:inline"> &bull; {entry.os} ({entry.browser})</span>
                                    </p>
                                </div>
                                <a href={entry.downloadUrl} className="text-cyan-500 hover:underline text-sm mt-2 md:mt-0 md:ml-4" download>
                                    Redownload
                                </a>
                            </li>
                        ))}
                    </ul>
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-700/50 text-white rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-cyan-600' : 'bg-gray-700/50'} text-white`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-gray-700/50 text-white rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};

/**
 * Detailed view of a single SDK.
 * @param {object} props - Component props.
 * @param {Sdk} props.sdk - The SDK object to display.
 * @param {function(): void} props.onClose - Callback to close the detail view.
 * @param {function(Sdk): void} props.onDownload - Callback when download is initiated.
 * @param {function(Sdk): void} props.onSelectForAi - Callback when SDK is selected for AI.
 */
export const SdkDetailView: React.FC<{ sdk: Sdk; onClose: () => void; onDownload: (sdk: Sdk) => void; onSelectForAi: (sdk: Sdk) => void }> = ({ sdk, onClose, onDownload, onSelectForAi }) => {
    return (
        <Card title={`${sdk.language} SDK v${sdk.version} Details`} className="relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
            <div className="space-y-4 text-gray-300">
                <p><strong>Description:</strong> {sdk.description}</p>
                <p><strong>Platform:</strong> {sdk.platform}</p>
                <p><strong>Last Updated:</strong> {new Date(sdk.lastUpdated).toLocaleDateString()}</p>
                <p><strong>Maintainer:</strong> {sdk.maintainer}</p>
                <p><strong>License:</strong> {sdk.license}</p>
                <p><strong>GitHub Stats:</strong> ⭐ {sdk.stars} | 🍴 {sdk.forks} | 🐛 {sdk.issues}</p>
                <p><strong>Installation:</strong> <code className="bg-gray-700 p-1 rounded text-cyan-300 text-sm">{sdk.installationCmd}</code></p>

                <div>
                    <h4 className="font-semibold text-white mt-4 mb-2">Usage Examples:</h4>
                    {sdk.usageExamples.length > 0 ? (
                        <div className="space-y-3">
                            {sdk.usageExamples.map((example, i) => (
                                <div key={i} className="bg-gray-900/50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-200 mb-1">{example.title}</p>
                                    <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono max-h-40 overflow-auto">{example.snippet}</pre>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">No usage examples available.</p>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                    <button onClick={() => onDownload(sdk)} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">Download SDK</button>
                    <button onClick={() => onSelectForAi(sdk)} className="flex-1 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">AI Code Gen</button>
                    <a href={sdk.docsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">View Docs</a>
                    <a href={sdk.releaseNotesUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">Release Notes</a>
                </div>
            </div>
        </Card>
    );
};

// --- SUB-COMPONENTS FOR SDK MANAGEMENT (end) ---

// --- SUB-COMPONENTS FOR AI CODELAB (start) ---

/**
 * Displays AI configuration settings.
 * @param {object} props - Component props.
 * @param {AiConfig} props.aiConfig - Current AI configuration.
 * @param {function(AiConfig): void} props.onConfigChange - Callback for config changes.
 */
export const AiSettingsPanel: React.FC<{ aiConfig: AiConfig; onConfigChange: (config: AiConfig) => void }> = ({ aiConfig, onConfigChange }) => {
    const handleChange = useCallback((key: keyof AiConfig, value: any) => {
        onConfigChange({ ...aiConfig, [key]: value });
    }, [aiConfig, onConfigChange]);

    return (
        <Card title="AI Generator Settings">
            <div className="space-y-4 text-gray-300">
                <div>
                    <label className="block text-sm font-medium mb-1">AI Model:</label>
                    <select
                        value={aiConfig.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white"
                    >
                        <option value="gemini-pro-1.5">Gemini 1.5 Pro</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="code-bison">Code-Bison</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Temperature (Randomness): <span className="text-cyan-400">{aiConfig.temperature.toFixed(1)}</span></label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={aiConfig.temperature}
                        onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower values mean more deterministic output, higher values mean more creative/random output.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Max Output Tokens: <span className="text-cyan-400">{aiConfig.maxTokens}</span></label>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        step="50"
                        value={aiConfig.maxTokens}
                        onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Controls the maximum length of the generated code snippet.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">AI Persona:</label>
                    <select
                        value={aiConfig.defaultPersona}
                        onChange={(e) => handleChange('defaultPersona', e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white"
                    >
                        <option value="expert-developer">Expert Developer</option>
                        <option value="friendly-assistant">Friendly Assistant</option>
                        <option value="concise-coder">Concise Coder</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Sets the tone and style of the AI's response.</p>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="enableContextualLearning"
                        checked={aiConfig.enableContextualLearning}
                        onChange={(e) => handleChange('enableContextualLearning', e.target.checked)}
                        className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="enableContextualLearning" className="ml-2 text-sm font-medium">Enable Contextual Learning (beta)</label>
                    <p className="text-xs text-gray-500 ml-2">(AI learns from your previous prompts/code in current session)</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Preferred Languages (for suggestions):</label>
                    <div className="flex flex-wrap gap-2">
                        {APP_CONSTANTS.SUPPORTED_AI_LANGUAGES.map(lang => (
                            <label key={lang} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={aiConfig.preferredLanguages.includes(lang)}
                                    onChange={(e) => {
                                        const newPreferred = e.target.checked
                                            ? [...aiConfig.preferredLanguages, lang]
                                            : aiConfig.preferredLanguages.filter(l => l !== lang);
                                        handleChange('preferredLanguages', newPreferred);
                                    }}
                                    className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                />
                                <span className="ml-1 text-sm">{lang}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/**
 * Manages and displays a list of saved AI prompts/snippets.
 * @param {object} props - Component props.
 * @param {SavedPrompt[]} props.savedPrompts - Array of saved prompts.
 * @param {function(SavedPrompt): void} props.onSelectPrompt - Callback when a prompt is selected for reuse.
 * @param {function(string): void} props.onDeletePrompt - Callback to delete a prompt.
 */
export const PromptLibrary: React.FC<{
    savedPrompts: SavedPrompt[];
    onSelectPrompt: (prompt: SavedPrompt) => void;
    onDeletePrompt: (id: string) => void;
}> = ({ savedPrompts, onSelectPrompt, onDeletePrompt }) => {
    const [filterTag, setFilterTag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPrompts = useMemo(() => {
        return savedPrompts.filter(p =>
            (filterTag === '' || p.tags.includes(filterTag)) &&
            (searchTerm === '' || p.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || p.generatedCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [savedPrompts, filterTag, searchTerm]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        savedPrompts.forEach(p => p.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [savedPrompts]);

    return (
        <Card title="Saved Code Snippets">
            <div className="mb-4 flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search saved prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-700/50 p-2 rounded text-white placeholder-gray-400 max-w-sm"
                />
                <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="bg-gray-700/50 p-2 rounded text-white"
                >
                    <option value="">All Tags</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>
            {filteredPrompts.length === 0 ? (
                <p className="text-gray-400">No saved snippets matching criteria.</p>
            ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {filteredPrompts.map(prompt => (
                        <div key={prompt.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-semibold text-white">{prompt.prompt}</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onSelectPrompt(prompt)}
                                        className="py-1 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs"
                                        title="Use this prompt/code"
                                    >
                                        Use
                                    </button>
                                    <button
                                        onClick={() => onDeletePrompt(prompt.id)}
                                        className="py-1 px-3 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs"
                                        title="Delete snippet"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">
                                {prompt.language} SDK ({prompt.sdkId}) - Saved: {new Date(prompt.timestamp).toLocaleDateString()}
                            </p>
                            <pre className="bg-gray-900/50 p-3 rounded text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-32 overflow-auto">
                                {prompt.generatedCode}
                            </pre>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                {prompt.tags.map(tag => (
                                    <span key={tag} className="bg-gray-700 px-2 py-1 rounded-full text-gray-300">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

/**
 * Provides an interface for the AI to review code snippets or suggest refactoring.
 * @param {object} props - Component props.
 * @param {Sdk | null} props.selectedSdk - The currently selected SDK.
 * @param {AiConfig} props.aiConfig - Current AI configuration.
 */
export const CodeReviewAssistant: React.FC<{ selectedSdk: Sdk | null; aiConfig: AiConfig }> = ({ selectedSdk, aiConfig }) => {
    const [codeToReview, setCodeToReview] = useState('');
    const [reviewResult, setReviewResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToastNotifications();

    const handleReview = async () => {
        if (!codeToReview.trim()) {
            addToast('Please enter code to review.', 'warning');
            return;
        }
        setIsLoading(true);
        setReviewResult('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const reviewPrompt = `As an expert developer and security analyst, review the following code snippet written in ${selectedSdk?.language || 'a generic language'}.
            Provide constructive feedback focusing on:
            1. Potential bugs or edge cases.
            2. Security vulnerabilities.
            3. Performance improvements.
            4. Code style and readability (adhering to typical ${selectedSdk?.language || 'general'} conventions).
            5. Best practices for integrating with Demobank SDK (if applicable, assume it's used).
            6. Suggest refactorings or alternative approaches.
            
            Code to review:\n\`\`\`${selectedSdk?.language.toLowerCase() || ''}\n${codeToReview}\n\`\`\`\n\nProvide your review in a structured, concise format, highlighting key actionable points.`;

            const response = await ai.models.generateContent({
                model: aiConfig.model,
                contents: reviewPrompt,
                generationConfig: { temperature: aiConfig.temperature, maxOutputTokens: aiConfig.maxTokens }
            });
            setReviewResult(response.text.trim());
            addToast('Code review generated successfully!', 'success');
        } catch (error) {
            console.error('Code review error:', error);
            setReviewResult("Error: Could not perform code review. Please check your API key and try again.");
            addToast('Failed to generate code review.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI Code Review & Refactoring Assistant">
            <p className="text-gray-400 mb-4">Paste your code below to get AI-powered review and suggestions for improvements. Specify the SDK language if applicable.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Code to Review:</label>
                    <textarea
                        value={codeToReview}
                        onChange={(e) => setCodeToReview(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-xs h-60"
                        placeholder={`Paste your ${selectedSdk?.language || 'code'} here...`}
                    />
                    <button
                        onClick={handleReview}
                        disabled={isLoading || !codeToReview.trim()}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50"
                    >
                        {isLoading ? 'Reviewing...' : 'Get Code Review'}
                    </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg max-h-80 overflow-auto">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Review Results:</label>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                        {isLoading ? 'Reviewing code...' : (reviewResult || 'Your code review results will appear here.')}
                    </pre>
                </div>
            </div>
        </Card>
    );
};

/**
 * Generates test cases for a given code snippet using AI.
 * @param {object} props - Component props.
 * @param {Sdk | null} props.selectedSdk - The currently selected SDK.
 * @param {AiConfig} props.aiConfig - Current AI configuration.
 */
export const TestCaseGenerator: React.FC<{ selectedSdk: Sdk | null; aiConfig: AiConfig }> = ({ selectedSdk, aiConfig }) => {
    const [functionCode, setFunctionCode] = useState('');
    const [generatedTests, setGeneratedTests] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToastNotifications();

    const handleGenerateTests = async () => {
        if (!functionCode.trim()) {
            addToast('Please enter a function to generate tests for.', 'warning');
            return;
        }
        setIsLoading(true);
        setGeneratedTests('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const testPrompt = `Generate unit tests for the following ${selectedSdk?.language || 'generic'} function/code snippet using common testing frameworks for ${selectedSdk?.language || 'that language'} (e.g., Jest/Mocha for JS, Pytest for Python, Go testing for Go).
            Focus on positive cases, edge cases, and error handling.
            
            Function/Code:\n\`\`\`${selectedSdk?.language.toLowerCase() || ''}\n${functionCode}\n\`\`\`\n\nProvide the generated tests in a clear, executable format.`;

            const response = await ai.models.generateContent({
                model: aiConfig.model,
                contents: testPrompt,
                generationConfig: { temperature: aiConfig.temperature, maxOutputTokens: aiConfig.maxTokens }
            });
            setGeneratedTests(response.text.trim());
            addToast('Test cases generated successfully!', 'success');
        } catch (error) {
            console.error('Test generation error:', error);
            setGeneratedTests("Error: Could not generate test cases. Please check your API key and try again.");
            addToast('Failed to generate test cases.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI Test Case Generator">
            <p className="text-gray-400 mb-4">Provide a function or code snippet, and AI will generate relevant unit tests for it.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Function/Code to Test:</label>
                    <textarea
                        value={functionCode}
                        onChange={(e) => setFunctionCode(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-xs h-60"
                        placeholder={`Paste your ${selectedSdk?.language || 'function'} here...`}
                    />
                    <button
                        onClick={handleGenerateTests}
                        disabled={isLoading || !functionCode.trim()}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50"
                    >
                        {isLoading ? 'Generating Tests...' : 'Generate Tests'}
                    </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg max-h-80 overflow-auto">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Generated Test Cases:</label>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                        {isLoading ? 'Generating tests...' : (generatedTests || 'Generated test cases will appear here.')}
                    </pre>
                </div>
            </div>
        </Card>
    );
};

/**
 * Generates deployment scripts for applications using the SDK.
 * @param {object} props - Component props.
 * @param {Sdk | null} props.selectedSdk - The currently selected SDK.
 * @param {AiConfig} props.aiConfig - Current AI configuration.
 */
export const DeploymentScriptGenerator: React.FC<{ selectedSdk: Sdk | null; aiConfig: AiConfig }> = ({ selectedSdk, aiConfig }) => {
    const [projectDescription, setProjectDescription] = useState('');
    const [deploymentTarget, setDeploymentTarget] = useState('Docker');
    const [generatedScript, setGeneratedScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToastNotifications();

    const deploymentTargets = ['Docker', 'Kubernetes (K8s)', 'AWS Lambda', 'Azure Functions', 'Google Cloud Run', 'Heroku', 'Netlify'];

    const handleGenerateScript = async () => {
        if (!projectDescription.trim()) {
            addToast('Please provide a project description.', 'warning');
            return;
        }
        setIsLoading(true);
        setGeneratedScript('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const scriptPrompt = `Generate a deployment script for an application that uses the Demobank SDK (specifically the ${selectedSdk?.language || 'relevant'} SDK if specified).
            The application is described as: "${projectDescription}".
            The target deployment environment is: "${deploymentTarget}".
            
            Provide a detailed script (e.g., Dockerfile, Kubernetes YAML, CI/CD config snippet) that includes:
            1. Setup of the environment.
            2. Installation of dependencies, including the Demobank SDK.
            3. Building the application.
            4. Deployment configuration.
            5. Any necessary environment variables or secrets management (placeholder).
            
            Assume standard project structure for a ${selectedSdk?.language || 'generic'} application.`;

            const response = await ai.models.generateContent({
                model: aiConfig.model,
                contents: scriptPrompt,
                generationConfig: { temperature: aiConfig.temperature, maxOutputTokens: aiConfig.maxTokens }
            });
            setGeneratedScript(response.text.trim());
            addToast('Deployment script generated successfully!', 'success');
        } catch (error) {
            console.error('Deployment script generation error:', error);
            setGeneratedScript("Error: Could not generate deployment script. Please check your API key and try again.");
            addToast('Failed to generate deployment script.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI Deployment Script Generator">
            <p className="text-gray-400 mb-4">Generate deployment configurations and scripts for your application integrated with DemoBank SDKs.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Project Description:</label>
                    <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-xs h-40"
                        placeholder="e.g., 'A Node.js Express API that processes payments via Demobank, deployed on Docker.'"
                    />
                    <label className="block text-sm font-medium text-gray-300">Deployment Target:</label>
                    <select
                        value={deploymentTarget}
                        onChange={(e) => setDeploymentTarget(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white"
                    >
                        {deploymentTargets.map(target => (
                            <option key={target} value={target}>{target}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleGenerateScript}
                        disabled={isLoading || !projectDescription.trim()}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50"
                    >
                        {isLoading ? 'Generating Script...' : 'Generate Deployment Script'}
                    </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg max-h-80 overflow-auto">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Generated Script:</label>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                        {isLoading ? 'Generating deployment script...' : (generatedScript || 'Generated deployment script will appear here.')}
                    </pre>
                </div>
            </div>
        </Card>
    );
};

/**
 * Allows switching between different AI tools.
 * @param {object} props - Component props.
 * @param {string} props.currentTool - The currently active AI tool.
 * @param {function(string): void} props.onSelectTool - Callback to select a new tool.
 */
export const AiToolSelector: React.FC<{ currentTool: string; onSelectTool: (tool: string) => void }> = ({ currentTool, onSelectTool }) => {
    const tools = [
        { id: 'code-gen', name: 'Code Generator' },
        { id: 'code-review', name: 'Code Review' },
        { id: 'test-gen', name: 'Test Generator' },
        { id: 'deploy-script', name: 'Deploy Script' },
        { id: 'prompt-library', name: 'Prompt Library' },
        { id: 'settings', name: 'AI Settings' },
    ];

    return (
        <div className="mb-6 border-b border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool.id)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-200
                                ${currentTool === tool.id
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`
                        }
                    >
                        {tool.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};

// --- SUB-COMPONENTS FOR AI CODELAB (end) ---

// --- SUB-COMPONENTS FOR DOCUMENTATION (start) ---
/**
 * Displays an interactive navigation tree for documentation.
 * @param {object} props - Component props.
 * @param {object} props.docsStructure - The documentation structure object.
 * @param {string | null} props.activePath - The currently active documentation path.
 * @param {function(string): void} props.onSelectPath - Callback when a document is selected.
 */
export const DocNavigationTree: React.FC<{ docsStructure: { [key: string]: DocNode[] }; activePath: string | null; onSelectPath: (path: string) => void }> = ({ docsStructure, activePath, onSelectPath }) => {
    const renderNode = (node: DocNode) => (
        <li key={node.path} className="mb-1">
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onSelectPath(node.path); }}
                className={`block py-1 px-3 rounded-md transition-colors duration-200 text-sm
                            ${activePath === node.path
                        ? 'bg-cyan-800 text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
                }
                title={node.description}
            >
                {node.title}
            </a>
            {node.children && node.children.length > 0 && (
                <ul className="ml-4 mt-1 border-l border-gray-700">
                    {node.children.map(child => renderNode(child))}
                </ul>
            )}
        </li>
    );

    return (
        <Card className="max-w-xs flex-shrink-0" title="Documentation Topics">
            <nav className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {Object.entries(docsStructure).map(([category, nodes]) => (
                    <div key={category}>
                        <h3 className="text-gray-200 font-semibold mb-2">{category}</h3>
                        <ul className="space-y-1">
                            {nodes.map(node => renderNode(node))}
                        </ul>
                    </div>
                ))}
            </nav>
        </Card>
    );
};

/**
 * Displays documentation content, potentially rendered from Markdown.
 * @param {object} props - Component props.
 * @param {string} props.content - The raw documentation content (e.g., Markdown).
 * @param {string} props.title - The title of the document.
 * @param {boolean} props.isLoading - Whether content is currently loading.
 */
export const DocContentDisplay: React.FC<{ content: string; title: string; isLoading: boolean }> = ({ content, title, isLoading }) => {
    const renderedHtml = useMemo(() => renderMarkdownToHtml(content), [content]);

    return (
        <Card title={isLoading ? `Loading: ${title}...` : title} className="flex-grow max-w-full">
            <div className="prose prose-invert max-w-none text-gray-300 space-y-4" style={{ color: 'inherit' }}>
                {isLoading ? (
                    <p className="text-gray-400">Loading documentation content...</p>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                )}
            </div>
        </Card>
    );
};

/**
 * Search interface for documentation.
 * @param {object} props - Component props.
 * @param {function(string): void} props.onSearch - Callback for search query submission.
 * @param {DocSearchResult[]} props.searchResults - Array of search results.
 * @param {boolean} props.isLoading - Whether search is in progress.
 * @param {function(string): void} props.onSelectResult - Callback when a search result is selected.
 */
export const DocSearch: React.FC<{
    onSearch: (query: string) => void;
    searchResults: DocSearchResult[];
    isLoading: boolean;
    onSelectResult: (path: string) => void;
}> = ({ onSearch, searchResults, isLoading, onSelectResult }) => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (debouncedQuery.trim()) {
            onSearch(debouncedQuery);
        }
    }, [debouncedQuery, onSearch]);

    return (
        <Card title="Search Documentation" className="mb-6">
            <input
                type="text"
                placeholder="Search articles, guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-700/50 p-2 rounded text-white placeholder-gray-400"
            />
            {isLoading && query.trim() && <p className="text-gray-400 mt-2">Searching...</p>}
            {query.trim() && !isLoading && searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                    {searchResults.map(result => (
                        <div key={result.path} className="bg-gray-800/50 p-3 rounded cursor-pointer hover:bg-gray-700" onClick={() => onSelectResult(result.path)}>
                            <h4 className="text-white font-semibold">{result.title}</h4>
                            <p className="text-sm text-gray-400">{result.snippet}</p>
                            <span className="text-xs text-cyan-500">{result.path}</span>
                        </div>
                    ))}
                </div>
            )}
            {query.trim() && !isLoading && searchResults.length === 0 && (
                <p className="text-gray-400 mt-2">No results found for "{query}".</p>
            )}
        </Card>
    );
};

// --- SUB-COMPONENTS FOR DOCUMENTATION (end) ---

// --- SUB-COMPONENTS FOR API EXPLORER (start) ---
/**
 * Interface for API Request History.
 * @interface ApiRequestHistoryEntry
 * @property {string} id - Unique ID.
 * @property {ApiRequestPayload} request - The request payload.
 * @property {ApiResponse<any>} response - The response received.
 * @property {string} timestamp - ISO string of when the request was made.
 */
export interface ApiRequestHistoryEntry {
    id: string;
    request: ApiRequestPayload;
    response: ApiResponse<any>;
    timestamp: string;
}

/**
 * Selector for API Endpoints.
 * @param {object} props - Component props.
 * @param {ApiEndpoint[]} props.endpoints - List of available API endpoints.
 * @param {ApiEndpoint | null} props.selectedEndpoint - The currently selected endpoint.
 * @param {function(ApiEndpoint): void} props.onSelectEndpoint - Callback when an endpoint is selected.
 */
export const ApiEndpointSelector: React.FC<{ endpoints: ApiEndpoint[]; selectedEndpoint: ApiEndpoint | null; onSelectEndpoint: (endpoint: ApiEndpoint) => void }> = ({ endpoints, selectedEndpoint, onSelectEndpoint }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('');

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        endpoints.forEach(ep => ep.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [endpoints]);

    const filteredEndpoints = useMemo(() => {
        return endpoints.filter(ep =>
            (searchTerm === '' || ep.path.toLowerCase().includes(searchTerm.toLowerCase()) || ep.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterTag === '' || ep.tags.includes(filterTag))
        );
    }, [endpoints, searchTerm, filterTag]);

    return (
        <Card title="API Endpoints" className="flex-1 min-w-[300px]">
            <input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700/50 p-2 rounded text-white placeholder-gray-400 mb-3"
            />
            <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full bg-gray-700/50 p-2 rounded text-white mb-4"
            >
                <option value="">All Categories</option>
                {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                ))}
            </select>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {filteredEndpoints.map(endpoint => (
                    <div
                        key={endpoint.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors duration-200
                                    ${selectedEndpoint?.id === endpoint.id ? 'bg-cyan-800' : 'bg-gray-800 hover:bg-gray-700'}`}
                        onClick={() => onSelectEndpoint(endpoint)}
                    >
                        <span className={`px-2 py-1 mr-2 rounded text-xs font-semibold ${
                            endpoint.method === 'GET' ? 'bg-blue-600' :
                            endpoint.method === 'POST' ? 'bg-green-600' :
                            endpoint.method === 'PUT' ? 'bg-yellow-600' :
                            endpoint.method === 'DELETE' ? 'bg-red-600' : 'bg-purple-600'
                        }`}>
                            {endpoint.method}
                        </span>
                        <code className="text-white text-sm">{endpoint.path}</code>
                        <p className="text-gray-400 text-xs mt-1">{endpoint.description}</p>
                    </div>
                ))}
            </div>
            {filteredEndpoints.length === 0 && <p className="text-gray-400">No endpoints found.</p>}
        </Card>
    );
};

/**
 * Editor for constructing API requests.
 * @param {object} props - Component props.
 * @param {ApiEndpoint | null} props.endpoint - The selected API endpoint.
 * @param {function(ApiRequestPayload): void} props.onRequestExecute - Callback to execute the request.
 * @param {boolean} props.isLoading - Whether a request is currently executing.
 */
export const ApiRequestEditor: React.FC<{ endpoint: ApiEndpoint | null; onRequestExecute: (request: ApiRequestPayload) => void; isLoading: boolean }> = ({ endpoint, onRequestExecute, isLoading }) => {
    const [path, setPath] = useState('');
    const [queryParams, setQueryParams] = useState<{ [key: string]: string }>({});
    const [requestBody, setRequestBody] = useState<string>('');
    const [headers, setHeaders] = useState<{ [key: string]: string }>({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${APP_CONSTANTS.DEFAULT_API_KEY}` });
    const { addToast } = useToastNotifications();

    useEffect(() => {
        if (endpoint) {
            let initialPath = endpoint.path;
            const initialQueryParams: { [key: string]: string } = {};

            // Populate path params
            endpoint.pathParams?.forEach(p => {
                initialPath = initialPath.replace(`{${p.name}}`, `{${p.name}}`); // Keep placeholders for user input
            });

            // Populate query params with defaults or empty
            endpoint.queryParams?.forEach(p => {
                initialQueryParams[p.name] = '';
            });

            setPath(initialPath);
            setQueryParams(initialQueryParams);
            setRequestBody(endpoint.exampleRequest || (endpoint.method !== 'GET' ? JSON.stringify({}, null, 2) : ''));
        }
    }, [endpoint]);

    const handleExecute = () => {
        if (!endpoint) {
            addToast('Please select an API endpoint first.', 'warning');
            return;
        }

        let currentPath = path;
        let missingPathParams = false;
        endpoint.pathParams?.forEach(p => {
            if (currentPath.includes(`{${p.name}}`)) {
                addToast(`Path parameter '${p.name}' is required.`, 'error');
                missingPathParams = true;
            }
        });
        if (missingPathParams) return;

        const queryString = new URLSearchParams(queryParams).toString();
        const fullUrl = `${window.location.origin}/api${currentPath}${queryString ? `?${queryString}` : ''}`; // Prefix with /api for proxying

        let parsedBody = '';
        if (requestBody && endpoint.method !== 'GET' && endpoint.method !== 'DELETE') {
            try {
                parsedBody = JSON.stringify(JSON.parse(requestBody), null, 2);
            } catch (e) {
                addToast('Invalid JSON in request body.', 'error');
                return;
            }
        }

        onRequestExecute({
            url: fullUrl,
            method: endpoint.method,
            headers,
            params: queryParams,
            body: parsedBody
        });
    };

    if (!endpoint) {
        return <Card title="API Request Editor" className="flex-grow"><p className="text-gray-400">Select an endpoint to configure your request.</p></Card>;
    }

    return (
        <Card title={`Configure Request: ${endpoint.method} ${endpoint.path}`} className="flex-grow">
            <div className="space-y-4 text-gray-300">
                <div>
                    <label className="block text-sm font-medium mb-1">Method:</label>
                    <input type="text" value={endpoint.method} readOnly className="w-full bg-gray-700/50 p-2 rounded text-white font-bold" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Path:</label>
                    <input
                        type="text"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white"
                        placeholder={endpoint.path}
                    />
                    {endpoint.pathParams && endpoint.pathParams.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Replace <code>{'{paramName}'}</code> with actual values for path parameters.</p>
                    )}
                </div>

                {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Query Parameters:</label>
                        {endpoint.queryParams.map(param => (
                            <div key={param.name} className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-mono text-cyan-400 w-24">{param.name}{param.required ? '*' : ''}:</span>
                                <input
                                    type="text"
                                    value={queryParams[param.name] || ''}
                                    onChange={(e) => setQueryParams({ ...queryParams, [param.name]: e.target.value })}
                                    className="flex-grow bg-gray-700/50 p-2 rounded text-white text-sm"
                                    placeholder={param.description}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Headers:</label>
                    {Object.entries(headers).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={key}
                                readOnly={key === 'Content-Type' || key === 'Authorization'}
                                className="w-1/3 bg-gray-700/50 p-2 rounded text-white text-sm"
                            />
                            <input
                                type="text"
                                value={key === 'Authorization' ? '****************' : value}
                                onChange={(e) => setHeaders({ ...headers, [key]: e.target.value })}
                                className="flex-grow bg-gray-700/50 p-2 rounded text-white text-sm"
                            />
                        </div>
                    ))}
                    {/* Add button to add more headers if needed */}
                </div>

                {endpoint.method !== 'GET' && endpoint.method !== 'DELETE' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Request Body (JSON):</label>
                        <textarea
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            className="w-full bg-gray-900/50 p-2 rounded text-white font-mono text-xs h-40 resize-y"
                            placeholder="Enter JSON request body..."
                        />
                        {endpoint.requestSchema && (
                            <p className="text-xs text-gray-500 mt-1">Schema available. Ensure your JSON matches: <a href="#" onClick={(e) => { e.preventDefault(); addToast('Schema display not implemented', 'info'); }} className="text-cyan-500">View Schema</a></p>
                        )}
                    </div>
                )}

                <button
                    onClick={handleExecute}
                    disabled={isLoading}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 mt-4"
                >
                    {isLoading ? 'Sending Request...' : 'Send Request'}
                </button>
            </div>
        </Card>
    );
};

/**
 * Displays API response and details.
 * @param {object} props - Component props.
 * @param {ApiResponse<any> | null} props.response - The API response object.
 * @param {boolean} props.isLoading - Whether a request is currently executing.
 */
export const ApiResponseViewer: React.FC<{ response: ApiResponse<any> | null; isLoading: boolean }> = ({ response, isLoading }) => {
    return (
        <Card title="API Response" className="flex-grow">
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Status:</label>
                <p className={`font-semibold ${response?.success ? 'text-green-500' : 'text-red-500'}`}>
                    {isLoading ? 'Loading...' : (response ? (response.success ? 'Success' : 'Error') : 'N/A')}
                </p>

                <label className="block text-sm font-medium text-gray-300">Message:</label>
                <p className="text-gray-400 text-sm">{response?.message || 'No response yet.'}</p>

                {response?.errorCode && (
                    <>
                        <label className="block text-sm font-medium text-gray-300">Error Code:</label>
                        <p className="text-red-400 text-sm font-mono">{response.errorCode}</p>
                    </>
                )}

                <label className="block text-sm font-medium text-gray-300">Response Body:</label>
                <div className="bg-gray-900/50 p-4 rounded-lg max-h-96 overflow-auto">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                        {isLoading ? 'Waiting for response...' : (response?.data ? JSON.stringify(response.data, null, 2) : 'No data.')}
                    </pre>
                </div>
            </div>
        </Card>
    );
};

/**
 * Displays a history of API requests made in the explorer.
 * @param {object} props - Component props.
 * @param {ApiRequestHistoryEntry[]} props.history - Array of API request history entries.
 * @param {function(ApiRequestPayload): void} props.onReplayRequest - Callback to replay a request.
 * @param {function(string): void} props.onDeleteHistoryEntry - Callback to delete a history entry.
 */
export const ApiRequestHistory: React.FC<{
    history: ApiRequestHistoryEntry[];
    onReplayRequest: (request: ApiRequestPayload) => void;
    onDeleteHistoryEntry: (id: string) => void;
}> = ({ history, onReplayRequest, onDeleteHistoryEntry }) => {
    return (
        <Card title="Request History" className="flex-1 min-w-[300px]">
            {history.length === 0 ? (
                <p className="text-gray-400">No requests in history.</p>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {history.map(entry => (
                        <div key={entry.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-white">
                                    <span className={`px-2 py-1 mr-2 rounded text-xs font-semibold ${
                                        entry.request.method === 'GET' ? 'bg-blue-600' :
                                        entry.request.method === 'POST' ? 'bg-green-600' :
                                        entry.request.method === 'PUT' ? 'bg-yellow-600' :
                                        entry.request.method === 'DELETE' ? 'bg-red-600' : 'bg-purple-600'
                                    }`}>
                                        {entry.request.method}
                                    </span>
                                    <code className="text-sm">{new URL(entry.request.url).pathname.replace('/api', '')}</code>
                                </h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onReplayRequest(entry.request)}
                                        className="py-1 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs"
                                        title="Replay this request"
                                    >
                                        Replay
                                    </button>
                                    <button
                                        onClick={() => onDeleteHistoryEntry(entry.id)}
                                        className="py-1 px-3 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs"
                                        title="Delete from history"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mb-1">
                                {new Date(entry.timestamp).toLocaleString()} &bull;
                                Status: <span className={entry.response.success ? 'text-green-400' : 'text-red-400'}>{entry.response.success ? 'Success' : 'Error'}</span>
                            </p>
                            <details className="text-gray-500 text-sm cursor-pointer">
                                <summary className="hover:text-gray-300">View Details</summary>
                                <pre className="bg-gray-900/50 p-2 rounded text-xs text-gray-400 whitespace-pre-wrap font-mono mt-2">
                                    Request: {JSON.stringify(entry.request.body ? JSON.parse(entry.request.body) : entry.request.params, null, 2)}
                                    <br />
                                    Response: {JSON.stringify(entry.response.data, null, 2)}
                                </pre>
                            </details>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};
// --- SUB-COMPONENTS FOR API EXPLORER (end) ---

// --- SUB-COMPONENTS FOR COMMUNITY & SUPPORT (start) ---
/**
 * Displays a list of forum threads.
 * @param {object} props - Component props.
 * @param {ForumThread[]} props.threads - Array of forum threads.
 * @param {function(ForumThread): void} props.onViewThread - Callback to view a specific thread.
 */
export const ForumThreadList: React.FC<{ threads: ForumThread[]; onViewThread: (thread: ForumThread) => void }> = ({ threads, onViewThread }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('');

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        threads.forEach(thread => thread.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [threads]);

    const filteredThreads = useMemo(() => {
        return threads.filter(thread =>
            (searchTerm === '' || thread.title.toLowerCase().includes(searchTerm.toLowerCase()) || thread.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterTag === '' || thread.tags.includes(filterTag))
        );
    }, [threads, searchTerm, filterTag]);

    return (
        <Card title="Community Forum" className="flex-1 min-w-[400px]">
            <div className="flex flex-wrap gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search forum..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-700/50 p-2 rounded text-white placeholder-gray-400 max-w-sm"
                />
                <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="bg-gray-700/50 p-2 rounded text-white"
                >
                    <option value="">All Topics</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
                <button className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">New Thread</button>
            </div>
            {filteredThreads.length === 0 ? (
                <p className="text-gray-400">No forum threads matching criteria.</p>
            ) : (
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                    {filteredThreads.map(thread => (
                        <div
                            key={thread.id}
                            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700"
                            onClick={() => onViewThread(thread)}
                        >
                            <h4 className="text-xl font-semibold text-white mb-1">{thread.title}</h4>
                            <p className="text-sm text-gray-400 mb-2">
                                By {thread.author} &bull; Last activity: {new Date(thread.lastActivity).toLocaleString()} &bull; {thread.replies} replies
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {thread.tags.map(tag => (
                                    <span key={tag} className="bg-gray-700 px-2 py-1 rounded-full text-gray-300">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

/**
 * Displays a specific forum thread with its comments.
 * @param {object} props - Component props.
 * @param {ForumThread} props.thread - The forum thread to display.
 * @param {function(): void} props.onBack - Callback to return to the thread list.
 */
export const ForumThreadViewer: React.FC<{ thread: ForumThread; onBack: () => void }> = ({ thread, onBack }) => {
    const [newComment, setNewComment] = useState('');
    const { addToast } = useToastNotifications();

    const handlePostComment = () => {
        if (newComment.trim()) {
            addToast('Comment posted (mock)!', 'success');
            console.log('New comment:', newComment);
            setNewComment('');
            // In a real app, you would dispatch an action or make an API call to add the comment
        } else {
            addToast('Comment cannot be empty.', 'warning');
        }
    };

    return (
        <Card title={thread.title} className="relative flex-grow">
            <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-white px-3 py-1 bg-gray-700/50 rounded-lg text-sm">&lt; Back to Forum</button>
            <div className="mt-8 mb-6 border-b border-gray-700 pb-4">
                <p className="text-sm text-gray-400 mb-2">
                    By <span className="text-cyan-400">{thread.author}</span> on {new Date(thread.lastActivity).toLocaleString()}
                </p>
                <p className="text-gray-300 leading-relaxed">{thread.content}</p>
                <div className="flex flex-wrap gap-2 text-xs mt-4">
                    {thread.tags.map(tag => (
                        <span key={tag} className="bg-gray-700 px-2 py-1 rounded-full text-gray-300">#{tag}</span>
                    ))}
                </div>
            </div>

            <h5 className="text-xl font-semibold text-white mb-4">Replies ({thread.comments.length})</h5>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-6">
                {thread.comments.length === 0 ? (
                    <p className="text-gray-400">No replies yet. Be the first!</p>
                ) : (
                    thread.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">
                                <span className="font-semibold text-cyan-400">{comment.author}</span> on {new Date(comment.timestamp).toLocaleString()}
                            </p>
                            <p className="text-gray-300">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 border-t border-gray-700 pt-6">
                <h5 className="text-lg font-semibold text-white mb-3">Post a Reply</h5>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-gray-700/50 p-3 rounded text-white h-24 resize-y mb-3"
                    placeholder="Type your reply here..."
                />
                <button
                    onClick={handlePostComment}
                    className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
                >
                    Post Comment
                </button>
            </div>
        </Card>
    );
};

/**
 * Displays a list of Frequently Asked Questions in an accordion style.
 * @param {object} props - Component props.
 * @param {FaqItem[]} props.faqs - Array of FAQ items.
 */
export const FaqAccordion: React.FC<{ faqs: FaqItem[] }> = ({ faqs }) => {
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq =>
            searchTerm === '' ||
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [faqs, searchTerm]);

    const toggleFaq = (id: string) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

    return (
        <Card title="Frequently Asked Questions" className="flex-1 min-w-[300px]">
            <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700/50 p-2 rounded text-white placeholder-gray-400 mb-4"
            />
            {filteredFaqs.length === 0 ? (
                <p className="text-gray-400">No FAQs matching your search.</p>
            ) : (
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                    {filteredFaqs.map(faq => (
                        <div key={faq.id} className="bg-gray-800/50 rounded-lg border border-gray-700">
                            <button
                                className="w-full text-left p-4 flex justify-between items-center text-white text-lg font-semibold"
                                onClick={() => toggleFaq(faq.id)}
                            >
                                {faq.question}
                                <span>{openFaqId === faq.id ? '−' : '+'}</span>
                            </button>
                            {openFaqId === faq.id && (
                                <div className="p-4 pt-0 text-gray-300 text-sm border-t border-gray-700">
                                    {faq.answer}
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                        {faq.tags.map(tag => (
                                            <span key={tag} className="bg-gray-700 px-2 py-1 rounded-full text-gray-400">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

/**
 * Form for submitting a support ticket.
 * @param {object} props - Component props.
 * @param {function(object): Promise<ApiResponse<any>>} props.onSubmitTicket - Callback to submit the ticket.
 */
export const SupportTicketForm: React.FC<{ onSubmitTicket: (ticketDetails: { subject: string; message: string; sdkId?: string }) => Promise<ApiResponse<any>> }> = ({ onSubmitTicket }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedSdkId, setSelectedSdkId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToastNotifications();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            addToast('Subject and message cannot be empty.', 'error');
            return;
        }

        setIsSubmitting(true);
        const result = await onSubmitTicket({ subject, message, sdkId: selectedSdkId || undefined });
        setIsSubmitting(false);

        if (result.success) {
            addToast(result.message, 'success');
            setSubject('');
            setMessage('');
            setSelectedSdkId('');
        } else {
            addToast(result.message, 'error');
        }
    };

    return (
        <Card title="Submit a Support Ticket">
            <p className="text-gray-400 mb-4">If you can't find your answer in the FAQ or forum, please submit a direct support ticket.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject:</label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white"
                        placeholder="e.g., Issue with Python SDK installation"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message:</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white h-32 resize-y"
                        placeholder="Describe your issue in detail, including steps to reproduce, error messages, and SDK versions."
                        required
                    />
                </div>
                <div>
                    <label htmlFor="sdkId" className="block text-sm font-medium text-gray-300 mb-1">Related SDK (Optional):</label>
                    <select
                        id="sdkId"
                        value={selectedSdkId}
                        onChange={(e) => setSelectedSdkId(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white"
                    >
                        <option value="">-- Select an SDK --</option>
                        {MOCK_SDKS.map(sdk => (
                            <option key={sdk.id} value={sdk.id}>{sdk.language} v{sdk.version}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
            </form>
        </Card>
    );
};
// --- SUB-COMPONENTS FOR COMMUNITY & SUPPORT (end) ---

// --- SUB-COMPONENTS FOR USER SETTINGS (start) ---
/**
 * Component for managing general user preferences.
 * @param {object} props - Component props.
 * @param {UserPreferences} props.preferences - Current user preferences.
 * @param {function(UserPreferences): void} props.onPreferencesChange - Callback for preference changes.
 */
export const GeneralSettings: React.FC<{ preferences: UserPreferences; onPreferencesChange: (prefs: UserPreferences) => void }> = ({ preferences, onPreferencesChange }) => {
    const handleChange = useCallback((key: keyof UserPreferences, value: any) => {
        onPreferencesChange({ ...preferences, [key]: value });
    }, [preferences, onPreferencesChange]);

    return (
        <Card title="General Preferences">
            <div className="space-y-4 text-gray-300">
                <div>
                    <label className="block text-sm font-medium mb-1">Theme:</label>
                    <select
                        value={preferences.theme}
                        onChange={(e) => handleChange('theme', e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white"
                    >
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode (not implemented)</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="marketingEmails"
                        checked={preferences.receiveMarketingEmails}
                        onChange={(e) => handleChange('receiveMarketingEmails', e.target.checked)}
                        className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="marketingEmails" className="ml-2 text-sm font-medium">Receive Marketing Emails</label>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="sdkUpdateNotifications"
                        checked={preferences.receiveSdkUpdateNotifications}
                        onChange={(e) => handleChange('receiveSdkUpdateNotifications', e.target.checked)}
                        className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="sdkUpdateNotifications" className="ml-2 text-sm font-medium">Receive SDK Update Notifications</label>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Favorite SDKs:</label>
                    <div className="flex flex-wrap gap-2">
                        {MOCK_SDKS.map(sdk => (
                            <label key={sdk.id} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={preferences.favoriteSdks.includes(sdk.id)}
                                    onChange={(e) => {
                                        const newFavorites = e.target.checked
                                            ? [...preferences.favoriteSdks, sdk.id]
                                            : preferences.favoriteSdks.filter(id => id !== sdk.id);
                                        handleChange('favoriteSdks', newFavorites);
                                    }}
                                    className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                />
                                <span className="ml-1 text-sm">{sdk.language}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/**
 * Component for managing API key settings.
 * @param {object} props - Component props.
 * @param {string} props.currentApiKey - The current API key.
 * @param {function(string): void} props.onApiKeyChange - Callback to update the API key.
 */
export const ApiKeySettings: React.FC<{ currentApiKey: string; onApiKeyChange: (key: string) => void }> = ({ currentApiKey, onApiKeyChange }) => {
    const [apiKey, setApiKey] = useState(currentApiKey);
    const [isRevealed, setIsRevealed] = useState(false);
    const { addToast } = useToastNotifications();

    const handleSave = () => {
        onApiKeyChange(apiKey);
        addToast('API Key updated successfully!', 'success');
    };

    const handleGenerateNew = () => {
        const newKey = `sk-demobank-new-${Math.random().toString(36).substring(2, 15)}`;
        setApiKey(newKey);
        onApiKeyChange(newKey);
        addToast('New API Key generated!', 'info');
    };

    return (
        <Card title="API Key Management">
            <div className="space-y-4 text-gray-300">
                <div>
                    <label className="block text-sm font-medium mb-1">Your API Key:</label>
                    <div className="flex items-center gap-2">
                        <input
                            type={isRevealed ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="flex-grow bg-gray-700/50 p-2 rounded text-white font-mono"
                        />
                        <button
                            onClick={() => setIsRevealed(!isRevealed)}
                            className="py-2 px-3 bg-gray-600/50 hover:bg-gray-600 rounded text-sm text-white"
                        >
                            {isRevealed ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Keep your API key secure. Do not expose it publicly.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50"
                        disabled={apiKey === currentApiKey}
                    >
                        Save API Key
                    </button>
                    <button
                        onClick={handleGenerateNew}
                        className="flex-1 py-2 bg-red-700 hover:bg-red-800 rounded disabled:opacity-50"
                    >
                        Generate New Key
                    </button>
                </div>
            </div>
        </Card>
    );
};

// --- SUB-COMPONENTS FOR USER SETTINGS (end) ---

// --- MAIN APP VIEW / NAVIGATION (start) ---
type DashboardView = 'overview' | 'ai-lab' | 'documentation' | 'api-explorer' | 'community' | 'settings';

/**
 * Main SDK Downloads View component.
 * Expands significantly to include multiple sub-sections and advanced features.
 */
const SdkDownloadsView: React.FC = () => {
    // --- Global State Management ---
    const [currentView, setCurrentView] = useState<DashboardView>('overview');
    const [prompt, setPrompt] = useState('create a new payment order for $100');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSdk, setSelectedSdk] = useState<Sdk | null>(null);
    const [showSdkDetail, setShowSdkDetail] = useState<Sdk | null>(null); // For detailed SDK view
    const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryEntry[]>(MOCK_DOWNLOAD_HISTORY);
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
    const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
    const [currentApiKey, setCurrentApiKey] = useState(APP_CONSTANTS.DEFAULT_API_KEY);
    const { toasts, addToast, dismissToast } = useToastNotifications();

    // --- AI Lab Specific States ---
    const [aiCurrentTool, setAiCurrentTool] = useState('code-gen');

    // --- Documentation Specific States ---
    const [activeDocPath, setActiveDocPath] = useState<string | null>('/docs/introduction');
    const [docContent, setDocContent] = useState<string>('');
    const [isDocLoading, setIsDocLoading] = useState(false);
    const [docSearchResults, setDocSearchResults] = useState<DocSearchResult[]>([]);

    // --- API Explorer Specific States ---
    const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
    const [selectedApiEndpoint, setSelectedApiEndpoint] = useState<ApiEndpoint | null>(null);
    const [apiRequestHistory, setApiRequestHistory] = useState<ApiRequestHistoryEntry[]>([]);
    const [apiResponse, setApiResponse] = useState<ApiResponse<any> | null>(null);
    const [isApiRequestLoading, setIsApiRequestLoading] = useState(false);

    // --- Community Specific States ---
    const [forumThreads, setForumThreads] = useState<ForumThread[]>(MOCK_FORUM_THREADS);
    const [selectedForumThread, setSelectedForumThread] = useState<ForumThread | null>(null);

    // --- SDK Filtering and Sorting State ---
    const [sdkFilters, setSdkFilters] = useState<SdkFilterOptions>({
        language: '',
        platform: '',
        searchTerm: '',
        license: '',
    });
    const [sdkSort, setSdkSort] = useState<SdkSortOptions>({
        sortBy: 'lastUpdated',
        sortOrder: 'desc',
    });

    const filteredAndSortedSdks = useMemo(() => {
        let filtered = MOCK_SDKS.filter(sdk =>
            (sdkFilters.language === '' || sdk.language === sdkFilters.language) &&
            (sdkFilters.platform === '' || sdk.platform === sdkFilters.platform) &&
            (sdkFilters.license === '' || sdk.license === sdkFilters.license) &&
            (sdkFilters.searchTerm === '' ||
                sdk.language.toLowerCase().includes(sdkFilters.searchTerm.toLowerCase()) ||
                sdk.description.toLowerCase().includes(sdkFilters.searchTerm.toLowerCase()) ||
                sdk.packageName.toLowerCase().includes(sdkFilters.searchTerm.toLowerCase()))
        );

        if (sdkSort.sortBy !== 'none') {
            filtered.sort((a, b) => {
                let valA: any, valB: any;
                if (sdkSort.sortBy === 'name') {
                    valA = a.language.toLowerCase();
                    valB = b.language.toLowerCase();
                } else if (sdkSort.sortBy === 'version') {
                    valA = a.version.split('.').map(Number); // Simple version comparison
                    valB = b.version.split('.').map(Number);
                    for (let i = 0; i < Math.min(valA.length, valB.length); i++) {
                        if (valA[i] !== valB[i]) return (valA[i] - valB[i]) * (sdkSort.sortOrder === 'asc' ? 1 : -1);
                    }
                    return (valA.length - valB.length) * (sdkSort.sortOrder === 'asc' ? 1 : -1);
                } else if (sdkSort.sortBy === 'stars') {
                    valA = a.stars;
                    valB = b.stars;
                } else if (sdkSort.sortBy === 'lastUpdated') {
                    valA = new Date(a.lastUpdated).getTime();
                    valB = new Date(b.lastUpdated).getTime();
                } else {
                    return 0;
                }

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return valA.localeCompare(valB) * (sdkSort.sortOrder === 'asc' ? 1 : -1);
                } else {
                    return (valA - valB) * (sdkSort.sortOrder === 'asc' ? 1 : -1);
                }
            });
        }
        return filtered;
    }, [MOCK_SDKS, sdkFilters, sdkSort]);

    // --- Effects & Handlers ---

    // Initial load for API endpoints for Explorer
    useEffect(() => {
        const fetchEndpoints = async () => {
            const response = await mockApiClient.fetchApiEndpoints();
            if (response.success && response.data) {
                setApiEndpoints(response.data);
            }
        };
        fetchEndpoints();
    }, []);

    // Effect to handle theme changes
    useEffect(() => {
        document.documentElement.className = userPreferences.theme === 'dark' ? 'dark' : '';
        // In a real app, you might apply more specific classes or CSS variables
    }, [userPreferences.theme]);

    /**
     * Handles AI code generation.
     * @async
     */
    const handleGenerate = async () => {
        if (!selectedSdk) {
            addToast('Please select an SDK first.', 'error');
            return;
        }
        setIsLoading(true);
        setGeneratedCode('');
        try {
            const ai = new GoogleGenAI({ apiKey: currentApiKey });
            const fullPrompt = `As an expert ${userPreferences.aiConfig.defaultPersona} for Demobank integrations, generate a code snippet in ${selectedSdk.language} using the 'demobank' SDK to accomplish the following task: "${prompt}".
            Consider the following context and SDK version:
            - SDK Language: ${selectedSdk.language}
            - SDK Version: ${selectedSdk.version}
            - SDK Description: ${selectedSdk.description}
            - Installation Command: \`${selectedSdk.installationCmd}\`
            - Package Name: \`${selectedSdk.packageName}\`
            - Key dependencies: ${selectedSdk.dependencies.join(', ') || 'None'}
            - Supported frameworks: ${selectedSdk.supportedFrameworks.join(', ') || 'N/A'}

            Provide a complete, runnable code example if possible, including imports and basic error handling.
            Ensure the code is idiomatic for ${selectedSdk.language}.
            Output should be only the code block, no extra conversational text outside of comments in the code.`;

            const response = await ai.models.generateContent({
                model: userPreferences.aiConfig.model,
                contents: fullPrompt,
                generationConfig: {
                    temperature: userPreferences.aiConfig.temperature,
                    maxOutputTokens: userPreferences.aiConfig.maxTokens
                }
            });

            const rawText = response.text || '';
            const cleanedCode = rawText.replace(/```[a-zA-Z]*\n|```/g, '').trim();
            setGeneratedCode(cleanedCode);
            addToast('Code snippet generated successfully!', 'success');
        } catch (error) {
            console.error('AI generation error:', error);
            setGeneratedCode("Error: Could not generate code snippet. Please check your API key and try again.");
            addToast('Failed to generate code snippet. Check your API key and prompt.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Saves the current prompt and generated code to the prompt library.
     */
    const handleSavePrompt = () => {
        if (!selectedSdk || !prompt.trim() || !generatedCode.trim()) {
            addToast('Cannot save empty or incomplete snippet.', 'warning');
            return;
        }
        const newPrompt: SavedPrompt = {
            id: `saved_${Date.now()}`,
            prompt: prompt,
            generatedCode: generatedCode,
            sdkId: selectedSdk.id,
            language: selectedSdk.language,
            timestamp: new Date().toISOString(),
            tags: ['custom', selectedSdk.language.toLowerCase()] // Auto-tagging
        };
        setSavedPrompts(prev => {
            const updated = [newPrompt, ...prev];
            return updated.slice(0, APP_CONSTANTS.MAX_PROMPT_HISTORY); // Keep history limited
        });
        addToast('Code snippet saved to library!', 'success');
    };

    /**
     * Loads a saved prompt into the generator.
     * @param {SavedPrompt} saved - The saved prompt to load.
     */
    const handleLoadSavedPrompt = (saved: SavedPrompt) => {
        setPrompt(saved.prompt);
        setGeneratedCode(saved.generatedCode);
        const sdk = MOCK_SDKS.find(s => s.id === saved.sdkId);
        if (sdk) {
            setSelectedSdk(sdk);
        } else {
            addToast(`SDK "${saved.sdkId}" not found for this snippet.`, 'warning');
        }
        addToast(`Loaded prompt: "${saved.prompt.substring(0, 30)}..."`, 'info');
        setAiCurrentTool('code-gen'); // Switch to code gen tab
    };

    /**
     * Deletes a saved prompt from the library.
     * @param {string} id - The ID of the prompt to delete.
     */
    const handleDeleteSavedPrompt = (id: string) => {
        setSavedPrompts(prev => prev.filter(p => p.id !== id));
        addToast('Code snippet deleted.', 'info');
    };

    /**
     * Handles SDK download action.
     * @param {Sdk} sdk - The SDK to download.
     * @async
     */
    const handleSdkDownload = async (sdk: Sdk) => {
        addToast(`Attempting to download ${sdk.language} SDK...`, 'info', 3000);
        const result = await mockApiClient.downloadSdk(sdk.id);
        if (result.success && result.data) {
            addToast(`Download initiated for ${sdk.language} SDK v${sdk.version}!`, 'success');
            const newHistoryEntry: DownloadHistoryEntry = {
                sdkId: sdk.id,
                sdkVersion: sdk.version,
                timestamp: new Date().toISOString(),
                downloadUrl: result.data.downloadUrl,
                os: navigator.platform,
                browser: navigator.userAgent,
                ipAddress: '192.168.1.XX' // Mocked IP
            };
            setDownloadHistory(prev => [newHistoryEntry, ...prev]);
        } else {
            addToast(`Failed to download ${sdk.language} SDK: ${result.message}`, 'error');
        }
    };

    /**
     * Handles API request execution in the explorer.
     * @param {ApiRequestPayload} request - The request payload.
     * @async
     */
    const handleApiRequestExecute = async (request: ApiRequestPayload) => {
        setIsApiRequestLoading(true);
        setApiResponse(null);
        addToast(`Executing ${request.method} request to ${new URL(request.url).pathname.replace('/api', '')}...`, 'info', 3000);
        try {
            const result = await mockApiClient.executeApiRequest(request);
            setApiResponse(result);
            setApiRequestHistory(prev => [{ id: `hist_${Date.now()}`, request, response: result, timestamp: new Date().toISOString() }, ...prev].slice(0, 20)); // Limit history
            if (result.success) {
                addToast('API request executed successfully.', 'success');
            } else {
                addToast(`API request failed: ${result.message}`, 'error');
            }
        } catch (error: any) {
            console.error('API request execution error:', error);
            setApiResponse({ success: false, message: error.message || 'Network error.', data: null, errorCode: 'NETWORK_ERROR' });
            addToast(`API request failed: ${error.message || 'Network error.'}`, 'error');
        } finally {
            setIsApiRequestLoading(false);
        }
    };

    /**
     * Handles selection of a documentation path.
     * @param {string} path - The path to the documentation.
     * @async
     */
    const handleSelectDocPath = async (path: string) => {
        setIsDocLoading(true);
        setActiveDocPath(path);
        setDocSearchResults([]); // Clear search results when navigating
        try {
            const response = await mockApiClient.fetchDocumentationContent(path);
            if (response.success && response.data) {
                setDocContent(response.data);
            } else {
                setDocContent(`# Error Loading Document\n\n${response.message}`);
                addToast(response.message, 'error');
            }
        } catch (error: any) {
            setDocContent(`# Error Loading Document\n\n${error.message || 'Unknown error.'}`);
            addToast('Failed to fetch documentation content.', 'error');
        } finally {
            setIsDocLoading(false);
        }
    };

    /**
     * Handles documentation search.
     * @param {string} query - The search query.
     * @async
     */
    const handleDocSearch = async (query: string) => {
        setIsDocLoading(true);
        try {
            const response = await mockApiClient.searchDocumentation(query);
            if (response.success && response.data) {
                setDocSearchResults(response.data);
            } else {
                addToast(response.message, 'error');
            }
        } catch (error: any) {
            addToast('Failed to perform documentation search.', 'error');
        } finally {
            setIsDocLoading(false);
        }
    };

    // Initialize default doc content on first render
    useEffect(() => {
        if (activeDocPath && !docContent && !isDocLoading) {
            handleSelectDocPath(activeDocPath);
        }
    }, [activeDocPath, docContent, isDocLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="space-y-6 min-h-screen pb-12">
            <h1 className="text-4xl font-bold text-white tracking-wider">Developer Dashboard</h1>

            {/* Main Navigation Tabs */}
            <div className="border-b border-gray-700 mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'overview', name: 'SDK Overview' },
                        { id: 'ai-lab', name: 'AI Code Lab' },
                        { id: 'documentation', name: 'Documentation' },
                        { id: 'api-explorer', name: 'API Explorer' },
                        { id: 'community', name: 'Community & Support' },
                        { id: 'settings', name: 'Settings' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentView(tab.id as DashboardView)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg focus:outline-none transition-colors duration-200
                                        ${currentView === tab.id
                                    ? 'border-cyan-500 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`
                            }
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* --- SDK Overview View --- */}
            {currentView === 'overview' && (
                <>
                    <h2 className="text-3xl font-bold text-white tracking-wider mb-6">SDK Downloads & Discovery</h2>
                    <SdkFilterAndSort
                        filters={sdkFilters}
                        onFiltersChange={setSdkFilters}
                        sort={sdkSort}
                        onSortChange={setSdkSort}
                    />
                    <Card title="Available SDKs">
                        <p className="text-gray-400 mb-6">Integrate Demo Bank into your application with our official SDKs.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAndSortedSdks.map(sdk => (
                                <Card key={sdk.id} variant="interactive" className="text-center group flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{sdk.language}</h3>
                                        <p className="text-sm text-gray-400">v{sdk.version}</p>
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-3">{sdk.description}</p>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <button onClick={() => handleSdkDownload(sdk)} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">Download</button>
                                        <button onClick={() => setSelectedSdk(sdk)} className="w-full py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">AI Code Gen</button>
                                        <button onClick={() => setShowSdkDetail(sdk)} className="w-full py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg text-sm">Details</button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        {filteredAndSortedSdks.length === 0 && (
                            <p className="text-gray-400 text-center py-8">No SDKs match your current filters and search term.</p>
                        )}
                    </Card>

                    {showSdkDetail && (
                        <SdkDetailView
                            sdk={showSdkDetail}
                            onClose={() => setShowSdkDetail(null)}
                            onDownload={handleSdkDownload}
                            onSelectForAi={(sdk) => { setSelectedSdk(sdk); setCurrentView('ai-lab'); setAiCurrentTool('code-gen'); setShowSdkDetail(null); }}
                        />
                    )}

                    <div className="flex flex-wrap gap-6">
                        <SdkDownloadHistory history={downloadHistory} />
                        {/* Could add another analytics card here for more code */}
                        <Card title="SDK Quick Stats" className="flex-1 min-w-[300px]">
                            <p className="text-gray-400 mb-4">Overall SDK usage and popularity trends.</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Total SDKs</p>
                                    <p className="text-white text-xl font-bold">{MOCK_SDKS.length}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Most Popular</p>
                                    <p className="text-white text-xl font-bold">{MOCK_SDKS.reduce((prev, current) => (prev.stars > current.stars ? prev : current)).language}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Avg. Daily Downloads</p>
                                    <p className="text-white text-xl font-bold">~{Math.round(MOCK_DOWNLOAD_HISTORY.length / 30)}</p> {/* Mock for 30 days */}
                                </div>
                                <div>
                                    <p className="text-gray-500">Avg. Download Speed</p>
                                    <p className="text-white text-xl font-bold">~{(MOCK_SDKS.reduce((acc, sdk) => acc + sdk.avgDownloadTimeMs, 0) / MOCK_SDKS.length / 1000).toFixed(1)}s</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {/* --- AI Code Lab View --- */}
            {currentView === 'ai-lab' && (
                <>
                    <h2 className="text-3xl font-bold text-white tracking-wider mb-6">AI Code Lab</h2>

                    <AiToolSelector currentTool={aiCurrentTool} onSelectTool={setAiCurrentTool} />

                    {/* AI Code Generator (original functionality, expanded) */}
                    {aiCurrentTool === 'code-gen' && (
                        <Card title={`AI Code Generator for ${selectedSdk?.language || 'Any SDK'}`}>
                            {selectedSdk && (
                                <button onClick={() => setSelectedSdk(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" title="Clear selected SDK">&times;</button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300">Selected SDK:</label>
                                    <div className="relative">
                                        <select
                                            value={selectedSdk?.id || ''}
                                            onChange={e => setSelectedSdk(MOCK_SDKS.find(s => s.id === e.target.value) || null)}
                                            className="w-full bg-gray-700/50 p-2 rounded text-white appearance-none pr-8"
                                        >
                                            <option value="" disabled>-- Select an SDK --</option>
                                            {MOCK_SDKS.map(sdk => (
                                                <option key={sdk.id} value={sdk.id}>{sdk.language} v{sdk.version}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                    <label className="text-sm font-medium text-gray-300">Describe what you want to do:</label>
                                    <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                    <div className="flex gap-2">
                                        <button onClick={handleGenerate} disabled={isLoading || !selectedSdk || !prompt.trim()} className="flex-grow py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                                            {isLoading ? 'Generating...' : 'Generate Code'}
                                        </button>
                                        <button onClick={handleSavePrompt} disabled={!generatedCode.trim()} className="py-2 px-4 bg-gray-600/50 hover:bg-gray-600 rounded text-white disabled:opacity-50" title="Save this snippet">
                                            Save
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-lg max-h-60 overflow-auto">
                                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                                        {isLoading ? 'Generating...' : (generatedCode || 'Generated code will appear here.')}
                                    </pre>
                                </div>
                            </div>
                        </Card>
                    )}

                    {aiCurrentTool === 'code-review' && <CodeReviewAssistant selectedSdk={selectedSdk} aiConfig={userPreferences.aiConfig} />}
                    {aiCurrentTool === 'test-gen' && <TestCaseGenerator selectedSdk={selectedSdk} aiConfig={userPreferences.aiConfig} />}
                    {aiCurrentTool === 'deploy-script' && <DeploymentScriptGenerator selectedSdk={selectedSdk} aiConfig={userPreferences.aiConfig} />}
                    {aiCurrentTool === 'prompt-library' && <PromptLibrary savedPrompts={savedPrompts} onSelectPrompt={handleLoadSavedPrompt} onDeletePrompt={handleDeleteSavedPrompt} />}
                    {aiCurrentTool === 'settings' && (
                        <AiSettingsPanel
                            aiConfig={userPreferences.aiConfig}
                            onConfigChange={(newConfig) => setUserPreferences(prev => ({ ...prev, aiConfig: newConfig }))}
                        />
                    )}
                </>
            )}

            {/* --- Documentation View --- */}
            {currentView === 'documentation' && (
                <>
                    <h2 className="text-3xl font-bold text-white tracking-wider mb-6">Documentation Hub</h2>
                    <DocSearch onSearch={handleDocSearch} searchResults={docSearchResults} isLoading={isDocLoading} onSelectResult={handleSelectDocPath} />
                    <div className="flex flex-col lg:flex-row gap-6">
                        <DocNavigationTree docsStructure={MOCK_DOCS_STRUCTURE} activePath={activeDocPath} onSelectPath={handleSelectDocPath} />
                        <DocContentDisplay content={docContent} title={activeDocPath || 'Documentation'} isLoading={isDocLoading} />
                    </div>
                </>
            )}

            {/* --- API Explorer View --- */}
            {currentView === 'api-explorer' && (
                <>
                    <h2 className="text-3xl font-bold text-white tracking-wider mb-6">API Explorer & Tester</h2>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <ApiEndpointSelector endpoints={apiEndpoints} selectedEndpoint={selectedApiEndpoint} onSelectEndpoint={setSelectedApiEndpoint} />
                        <div className="flex flex-col flex-grow gap-6">
                            <ApiRequestEditor endpoint={selectedApiEndpoint} onRequestExecute={handleApiRequestExecute} isLoading={isApiRequestLoading} />
                            <ApiResponseViewer response={apiResponse} isLoading={isApiRequestLoading} />
                        </div>
                        <ApiRequestHistory history={apiRequestHistory} onReplayRequest={handleApiRequestExecute} onDeleteHistoryEntry={(id) => setApiRequestHistory(prev => prev.filter(entry => entry.id !== id))} />
                    </div>
                </>
            )}

            {/* --- Community & Support View --- */}
            {currentView === 'community' && (
                <>
                    <h2 className="text-3xl font-bold text-white tracking-wider mb-6">Community & Support</h2>
                    {selectedForumThread ? (
                        <ForumThreadViewer thread={selectedForumThread} onBack={() => setSelectedForumThread(null)} />
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            <ForumThreadList threads={forumThreads} onViewThread={setSelectedForumThread} />
                            <div className="flex flex-col gap-6 flex-1 min-w-[300px]">
                                <FaqAccordion faqs={MOCK_FAQS} />
                                <SupportTicketForm onSubmitTicket={mockApiClient.submitSupportTicket} />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* --- Settings View --- */}
            {currentView === 'settings' && (
                <>
                    <h2 className="text-3xl font-bold text-white tracking-wider mb-6">User Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GeneralSettings preferences={userPreferences} onPreferencesChange={setUserPreferences} />
                        <ApiKeySettings currentApiKey={currentApiKey} onApiKeyChange={setCurrentApiKey} />
                        <AiSettingsPanel // AI settings can also be accessed from here
                            aiConfig={userPreferences.aiConfig}
                            onConfigChange={(newConfig) => setUserPreferences(prev => ({ ...prev, aiConfig: newConfig }))}
                        />
                        {/* Could add a 'Billing & Plans' or 'Integrations' settings card here */}
                        <Card title="Account & Profile">
                            <p className="text-gray-400 mb-4">Manage your personal account details.</p>
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300">Username:</label>
                                <input type="text" value="developer_user" readOnly className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                <label className="block text-sm font-medium text-gray-300">Email:</label>
                                <input type="email" value="developer@demobank.com" readOnly className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                <button className="w-full py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">Update Profile</button>
                                <button className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm mt-4">Delete Account</button>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {/* Global Notifications */}
            <NotificationStack toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
};

export default SdkDownloadsView;