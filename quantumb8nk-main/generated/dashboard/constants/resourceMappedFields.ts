// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

// This file serves as the comprehensive, commercial-grade configuration hub for ZenithFlow AI.
// It is designed to be production-ready, integrating AI capabilities and a multitude of external services.
// All sensitive credentials and secrets are retrieved directly from environment variables via process.env.
// This configuration enables robust scalability, rich functionality, and seamless integration for a top-tier enterprise application.

import { ResourcesEnum } from "./types/resources";

// --- Original Resource Field Mappings Type Definition ---
type ResourceMappedFields = {
  [key in ResourcesEnum]: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
};

// --- AI Service Configuration Type Definition ---
type GeminiAIConfig = {
  enabled: boolean;
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxOutputTokens: number;
  safetySettings: {
    harassment: string; // E.g., BLOCK_NONE, BLOCK_SOME, BLOCK_FEW, BLOCK_MOST
    hateSpeech: string;
    sexuallyExplicit: string;
    dangerousContent: string;
  };
};

// --- External Service Integrations Configuration Type Definition ---
type ExternalServiceConfig = {
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  twilio: {
    enabled: boolean;
    accountSid: string;
    authToken: string;
    messagingServiceSid: string;
  };
  sendgrid: {
    enabled: boolean;
    apiKey: string;
    senderEmail: string;
  };
  awsS3: {
    enabled: boolean;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
  googleCloudStorage: {
    enabled: boolean;
    projectId: string;
    keyFilename: string; // Path to service account key file
    bucketName: string;
  };
  azureBlobStorage: {
    enabled: boolean;
    accountName: string;
    accountKey: string;
    containerName: string;
  };
  firebase: {
    enabled: boolean;
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
    databaseURL?: string;
  };
  auth0: {
    enabled: boolean;
    domain: string;
    clientId: string;
    clientSecret: string;
    audience: string;
  };
  okta: {
    enabled: boolean;
    orgUrl: string;
    clientId: string;
    clientSecret: string;
    issuer: string;
  };
  segment: {
    enabled: boolean;
    writeKey: string;
  };
  mixpanel: {
    enabled: boolean;
    projectToken: string;
  };
  amplitude: {
    enabled: boolean;
    apiKey: string;
  };
  intercom: {
    enabled: boolean;
    appId: string;
    apiKey: string;
  };
  zendesk: {
    enabled: boolean;
    subdomain: string;
    apiToken: string;
    email: string;
  };
  salesforce: {
    enabled: boolean;
    consumerKey: string;
    consumerSecret: string;
    username: string;
    password: string;
    token: string;
  };
  hubspot: {
    enabled: boolean;
    apiKey: string;
    portalId?: string;
  };
  slack: {
    enabled: boolean;
    botToken: string;
    signingSecret: string;
    appToken: string;
  };
  discord: {
    enabled: boolean;
    botToken: string;
    clientId: string;
    clientSecret: string;
  };
  github: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accessToken: string;
  };
  gitlab: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    privateToken: string;
  };
  jira: {
    enabled: boolean;
    baseUrl: string;
    email: string;
    apiToken: string;
  };
  asana: {
    enabled: boolean;
    accessToken: string;
  };
  trello: {
    enabled: boolean;
    apiKey: string;
    apiToken: string;
  };
  zoom: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string;
    jwtToken: string;
  };
  calendly: {
    enabled: boolean;
    accessToken: string;
  };
  docusign: {
    enabled: boolean;
    integratorKey: string;
    userId: string;
    privateKey: string;
  };
  hellosign: {
    enabled: boolean;
    apiKey: string;
  };
  shopify: {
    enabled: boolean;
    shopName: string;
    apiKey: string;
    password: string; // Admin API access token
  };
  woocommerce: {
    enabled: boolean;
    consumerKey: string;
    consumerSecret: string;
    storeUrl: string;
  };
  googleMaps: {
    enabled: boolean;
    apiKey: string;
  };
  mapbox: {
    enabled: boolean;
    accessToken: string;
  };
  openWeather: {
    enabled: boolean;
    apiKey: string;
  };
  newsApi: {
    enabled: boolean;
    apiKey: string;
  };
  clearbit: {
    enabled: boolean;
    apiKey: string;
  };
  fullContact: {
    enabled: boolean;
    apiKey: string;
  };
  algolia: {
    enabled: boolean;
    appId: string;
    apiKey: string; // Search-only API Key
    adminApiKey: string;
  };
  elasticsearch: {
    enabled: boolean;
    cloudId?: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
  redis: {
    enabled: boolean;
    host: string;
    port: number;
    password?: string;
  };
  kafka: {
    enabled: boolean;
    brokers: string[];
    username?: string;
    password?: string;
  };
  rabbitmq: {
    enabled: boolean;
    url: string;
  };
  datadog: {
    enabled: boolean;
    apiKey: string;
    applicationKey: string;
  };
  newRelic: {
    enabled: boolean;
    licenseKey: string;
    appId: string;
  };
  sentry: {
    enabled: boolean;
    dsn: string;
    environment: string;
  };
  pagerDuty: {
    enabled: boolean;
    apiKey: string;
    fromEmail: string;
  };
  awsLambda: {
    enabled: boolean;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  googleCloudFunctions: {
    enabled: boolean;
    projectId: string;
    keyFilename: string; // Service account key path
    region: string;
  };
  azureFunctions: {
    enabled: boolean;
    appId: string;
    apiKey: string;
  };
  vercel: {
    enabled: boolean;
    accessToken: string;
    teamId?: string;
  };
  netlify: {
    enabled: boolean;
    accessToken: string;
  };
  digitalOcean: {
    enabled: boolean;
    accessToken: string;
  };
  linode: {
    enabled: boolean;
    accessToken: string;
  };
  cloudflare: {
    enabled: boolean;
    apiKey: string;
    email: string;
    zoneId: string;
  };
  fastly: {
    enabled: boolean;
    apiKey: string;
    serviceId: string;
  };
  mailchimp: {
    enabled: boolean;
    apiKey: string;
    serverPrefix: string;
  };
  constantContact: {
    enabled: boolean;
    apiKey: string;
    accessToken: string;
  };
  activeCampaign: {
    enabled: boolean;
    apiUrl: string;
    apiKey: string;
  };
  typeform: {
    enabled: boolean;
    accessToken: string;
  };
  surveyMonkey: {
    enabled: boolean;
    accessToken: string;
    clientId: string;
    clientSecret: string;
  };
  googleAnalytics: {
    enabled: boolean;
    trackingId: string; // GA4 Measurement ID G-XXXXXXXXX
  };
  fivetran: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string;
  };
  airbyte: {
    enabled: boolean;
    baseUrl: string;
    username: string;
    password: string;
  };
  snowflake: {
    enabled: boolean;
    account: string;
    username: string;
    password: string;
    role: string;
    warehouse: string;
    database: string;
    schema: string;
  };
  bigQuery: {
    enabled: boolean;
    projectId: string;
    keyFilename: string; // Service account key path
  };
  postgres: {
    enabled: boolean;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
  };
  mysql: {
    enabled: boolean;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  mongodb: {
    enabled: boolean;
    uri: string;
  };
  dynamoDb: {
    enabled: boolean;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  redisCloud: {
    enabled: boolean;
    host: string;
    port: number;
    password: string;
  };
  supabase: {
    enabled: boolean;
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  appwrite: {
    enabled: boolean;
    endpoint: string;
    projectId: string;
    apiKey: string;
  };
  plaid: {
    enabled: boolean;
    clientId: string;
    secret: string;
    env: string; // development, sandbox, production
  };
  yodlee: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string;
    env: string; // sandbox, production
  };
  finicity: {
    enabled: boolean;
    partnerId: string;
    partnerSecret: string;
    appKey: string;
    env: string; // sandbox, production
  };
  wise: { // Formerly TransferWise
    enabled: boolean;
    apiKey: string;
    profileId: string;
  };
  adyen: {
    enabled: boolean;
    merchantAccount: string;
    apiKey: string;
    clientKey: string;
    webhookSecret: string;
    env: string; // test, live
  };
  braintree: {
    enabled: boolean;
    merchantId: string;
    publicKey: string;
    privateKey: string;
    env: string; // sandbox, production
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    env: string; // sandbox, live
  };
  square: {
    enabled: boolean;
    accessToken: string;
    locationId: string;
    env: string; // sandbox, production
  };
  quickbooks: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    realmId: string;
    env: string; // sandbox, production
  };
  xero: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    tenantId: string;
  };
  freshbooks: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accountId: string;
  };
  gusto: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accessToken: string;
  };
  rippling: {
    enabled: boolean;
    apiKey: string;
  };
  workday: {
    enabled: boolean;
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
  mondayCom: {
    enabled: boolean;
    apiKey: string;
  };
  airtable: {
    enabled: boolean;
    apiKey: string;
    baseId: string;
  };
  notion: {
    enabled: boolean;
    apiKey: string;
    databaseId: string;
  };
  loom: {
    enabled: boolean;
    apiKey: string;
  };
  miro: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accessToken: string;
  };
  figma: {
    enabled: boolean;
    accessToken: string;
    fileKey: string;
  };
  adobeCreativeCloud: { // Placeholder for general Adobe integration
    enabled: boolean;
    clientId: string;
    clientSecret: string;
  };
  canva: {
    enabled: boolean;
    apiKey: string;
  };
  hubspotMarketing: { // Specific to marketing features if separate from CRM
    enabled: boolean;
    apiKey: string;
  };
  googleAds: {
    enabled: boolean;
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    customerId: string;
  };
  facebookAds: {
    enabled: boolean;
    accessToken: string;
    appId: string;
    appSecret: string;
    adAccountId: string;
  };
  twitterAds: {
    enabled: boolean;
    consumerKey: string;
    consumerSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    accountId: string;
  };
  linkedinAds: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    accountId: string;
  };
  pinterestAds: {
    enabled: boolean;
    accessToken: string;
    adAccountId: string;
  };
  googleRecaptcha: {
    enabled: boolean;
    siteKey: string; // For frontend
    secretKey: string; // For backend validation
  };
  akamai: {
    enabled: boolean;
    accessToken: string;
    clientToken: string;
    clientSecret: string;
  };
  datadogLogs: { // Separate for logs management
    enabled: boolean;
    apiKey: string;
    site: string; // us, eu, us5, ap1
  };
  pagerDutyEvents: { // Separate for event API if needed
    enabled: boolean;
    routingKey: string;
  };
  newRelicInsights: { // Specific for New Relic Insights
    enabled: boolean;
    queryKey: string;
    insertKey: string;
    accountId: string;
  };
  twilioVerify: { // For 2FA
    enabled: boolean;
    serviceSid: string;
    authToken: string;
  };
  auth0Management: { // For managing users via Auth0 Management API
    enabled: boolean;
    domain: string;
    clientId: string;
    clientSecret: string;
    audience: string;
  };
  stripeConnect: { // If specific Connect platform features are used
    enabled: boolean;
    clientId: string;
    secretKey: string;
    webhookSecret: string;
  };
  googleCloudVision: { // For AI vision capabilities
    enabled: boolean;
    projectId: string;
    keyFilename: string;
  };
  awsRekognition: { // For AI vision capabilities
    enabled: boolean;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  azureCognitiveServices: { // General placeholder for Azure AI
    enabled: boolean;
    endpoint: string;
    apiKey: string;
  };
  segmentIo: { // Renamed from Segment to avoid conflict if other Segment products exist
    enabled: boolean;
    writeKey: string;
  };
  pendo: {
    enabled: boolean;
    apiKey: string;
  };
  optimizely: {
    enabled: boolean;
    sdkKey: string;
  };
  launchDarkly: {
    enabled: boolean;
    sdkKey: string;
    clientSideId: string;
  };
};

// --- Main Application Configuration Type ---
type AppConfig = {
  appName: string;
  version: string;
  environment: "development" | "staging" | "production";
  debugMode: boolean;
  featureFlags: {
    onboardingV2: boolean;
    geminiEnhancedSearch: boolean;
    multiCurrencySupport: boolean;
    newDashboardLayout: boolean;
    aiPoweredAutomation: boolean;
    realtimeDataStreaming: boolean;
    advancedReporting: boolean;
    blockchainIntegration: boolean;
    // Add more feature flags for a multi-million dollar app
  };
  security: {
    jwtSecret: string;
    cookieSecret: string;
    encryptionKey: string;
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    cspDirectives: {
      defaultSrc: string[];
      scriptSrc: string[];
      styleSrc: string[];
      imgSrc: string[];
      connectSrc: string[];
      // ... more CSP directives
    };
  };
  // Nest the original resource mappings under a dedicated section
  resourceMappings: ResourceMappedFields;
  // Integrate AI and External Services
  ai: {
    gemini: GeminiAIConfig;
    // Potentially other AI services (e.g., custom ML models, other LLMs)
  };
  externalServices: ExternalServiceConfig;
  // Add other global settings needed for a multi-million dollar app
  branding: {
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  analytics: {
    serverSideTrackingEnabled: boolean;
    clientSideTrackingEnabled: boolean;
    eventQueueSize: number;
    flushIntervalMs: number;
  };
  paymentGateways: {
    default: "stripe" | "adyen" | "braintree" | "paypal" | "square";
  };
  customerSupport: {
    defaultChannel: "intercom" | "zendesk" | "email";
    supportEmail: string;
    statusPageUrl: string;
    faqUrl: string;
  };
  emailService: {
    defaultProvider: "sendgrid" | "mailchimp";
    marketingEmailListId: string;
    transactionalEmailTemplateIds: {
      welcome: string;
      passwordReset: string;
      invoicePaid: string;
      criticalAlert: string;
    };
  };
  fileStorage: {
    defaultProvider: "awsS3" | "googleCloudStorage" | "azureBlobStorage";
    maxUploadSizeMb: number;
    allowedFileTypes: string[];
    virusScanningEnabled: boolean;
  };
  developerSettings: {
    apiDocsUrl: string;
    webhookRetryPolicy: {
      maxAttempts: number;
      initialDelayMs: number;
      maxDelayMs: number;
    };
    sandboxModeEnabled: boolean;
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
    cdnUrl: string; // for locale files
  };
  compliance: {
    gdprEnabled: boolean;
    ccpaEnabled: boolean;
    iso27001ComplianceEnabled: boolean;
    auditLogRetentionDays: number;
    pciComplianceEnabled: boolean;
  };
  blockchain: { // Specific section for blockchain integration
    enabled: boolean;
    network: "ethereum_mainnet" | "polygon_mainnet" | "binance_smart_chain";
    rpcUrl: string;
    contractAddresses: {
      token: string;
      nft: string;
    };
  };
  telemetry: {
    enabled: boolean;
    exporterEndpoint: string; // e.g., for OpenTelemetry collector
    samplingRate: number; // 0.0 to 1.0
  };
  dataRetention: {
    transactionLogDays: number;
    auditLogDays: number;
    userDataArchiveDays: number;
  };
};

// --- The actual application configuration instance ---
const APP_CONFIG: AppConfig = {
  appName: "ZenithFlow AI", // A name worthy of millions
  version: "1.0.0-commercial-release",
  environment: "production", // Ready to ship!
  debugMode: false, // Absolutely not in production
  featureFlags: {
    onboardingV2: true,
    geminiEnhancedSearch: true,
    multiCurrencySupport: true,
    newDashboardLayout: true,
    aiPoweredAutomation: true,
    realtimeDataStreaming: true,
    advancedReporting: true,
    blockchainIntegration: false, // Start disabled, enable upon full rollout
  },
  security: {
    jwtSecret: process.env.JWT_SECRET as string,
    cookieSecret: process.env.COOKIE_SECRET as string,
    encryptionKey: process.env.ENCRYPTION_KEY as string,
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    },
    cspDirectives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", "*.zenithflow.ai", "https://*.googleapis.com", "https://*.gstatic.com", "https://*.stripe.com", "https://*.segment.com", "https://*.mixpanel.com", "https://*.amplitude.com", "https://*.intercomcdn.com", "https://*.zendesk.com", "https://*.mapbox.com", "https://*.algolia.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "*.zenithflow.ai", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "*.zenithflow.ai", "https://*.stripe.com", "https://*.googleusercontent.com", "https://*.gravatar.com", "https://*.intercomcdn.com"],
      connectSrc: ["'self'", "*.zenithflow.ai", "https://*.googleapis.com", "https://*.stripe.com", "https://*.twilio.com", "https://*.sendgrid.net", "https://*.auth0.com", "https://*.okta.com", "https://*.segment.com", "https://*.mixpanel.com", "https://*.amplitude.com", "https://*.intercom.io", "https://*.zendesk.com", "https://*.salesforce.com", "https://*.hubspot.com", "https://*.slack.com", "https://*.discordapp.com", "https://*.github.com", "https://*.gitlab.com", "https://*.jira.com", "https://*.asana.com", "https://*.trello.com", "https://*.zoom.us", "https://*.calendly.com", "https://*.docusign.net", "https://*.hellosign.com", "https://*.shopify.com", "https://*.woocommerce.com", "https://*.mapbox.com", "https://*.openweathermap.org", "https://*.newsapi.org", "https://*.clearbit.com", "https://*.fullcontact.com", "https://*.algolia.net", "https://*.elastic.co", "https://*.redislabs.com", "https://*.datadoghq.com", "https://*.newrelic.com", "https://*.sentry.io", "https://*.pagerduty.com", "https://*.vercel.com", "https://*.netlify.com", "https://*.digitalocean.com", "https://*.linode.com", "https://*.cloudflare.com", "https://*.fastly.com", "https://*.mailchimp.com", "https://*.constantcontact.com", "https://*.activehosted.com", "https://*.typeform.com", "https://*.surveymonkey.com", "https://*.google-analytics.com", "https://*.fivetran.com", "https://*.airbyte.io", "https://*.snowflakecomputing.com", "https://*.supabase.co", "https://*.appwrite.io", "https://*.plaid.com", "https://*.yodlee.com", "https://*.finicity.com", "https://*.wise.com", "https://*.adyen.com", "https://*.braintreegateway.com", "https://*.paypal.com", "https://*.squareup.com", "https://*.intuit.com", "https://*.xero.com", "https://*.freshbooks.com", "https://*.gusto.com", "https://*.rippling.com", "https://*.workday.com", "https://*.monday.com", "https://*.airtable.com", "https://*.notion.so", "https://*.loom.com", "https://*.miro.com", "https://*.figma.com", "https://*.adobe.io", "https://*.canva.com", "https://*.googleadservices.com", "https://*.facebook.com", "https://*.twitter.com", "https://*.linkedin.com", "https://*.pinterest.com", "https://*.recaptcha.net", "https://*.akamai.net", "https://*.pendo.io", "https://*.optimizely.com", "https://*.launchdarkly.com"],
      // Add more directives as needed for comprehensive security
    },
  },
  resourceMappings: {
    account_ach_setting: [],
    account_capability: [],
    account_group: [],
    ach_setting: [],
    api_key: [],
    audit_record: [],
    balances_feed_connection_currency: [],
    balances_feed_currency_total: [],
    bulk_error: [],
    bulk_import: [],
    bulk_request: [],
    bulk_result: [],
    case: [],
    categorization_metadata_key: [],
    categorization_metadata_value: [],
    compliance_rule: [],
    connection: [],
    connection_bulk_import: [],
    connection_endpoint: [],
    counterparty: [],
    custom_processing_window: [],
    data_ingestion_bulk_import: [],
    data_ingestion_bulk_result: [],
    decision: [],
    destination: [],
    endpoint: [],
    event: [],
    expected_payment: [
      { id: "amount_lower_bound", required: true, label: "Amount Lower Bound" },
      { id: "amount_upper_bound", required: true, label: "Amount Upper Bound" },
      { id: "direction", required: true, label: "Direction" },
      { id: "counterparty_id", required: false, label: "Counterparty" },
      { id: "date_lower_bound", required: false, label: "Date Lower Bound" },
      { id: "date_upper_bound", required: false, label: "Date Upper Bound" },
      { id: "description", required: false, label: "Description" },
      {
        id: "remittance_information",
        required: false,
        label: "Remittance Information",
      },
      {
        id: "statement_descriptor",
        required: false,
        label: "Statement Descriptor",
      },
      { id: "type", required: false, label: "Type" },
    ],
    export: [],
    external_account: [],
    external_event: [],
    group: [],
    incoming_payment_detail: [],
    internal_account: [],
    internal_account_balance_recon: [],
    invoice: [],
    invoice_line_item: [],
    ledger: [],
    ledgerable_event: [],
    ledger_account: [],
    ledger_account_category: [],
    ledger_account_category_child: [],
    ledger_account_settlement: [],
    ledger_entry: [],
    ledger_event_handler: [],
    ledger_transaction: [],
    ledger_transaction_template: [],
    line_item: [],
    organization: [],
    organization_customization: [],
    organization_user: [],
    paper_item: [],
    partner: [],
    partner_contact: [],
    partner_search: [],
    payment_order: [],
    penny_test: [],
    permission_set: [],
    pipeline_invocation: [],
    proposed_change: [],
    publishable_key: [],
    quote: [],
    reconciliation_rule: [],
    reconciliation_rule_preview_line_item: [],
    reconciliation_rule_preview_transaction: [],
    report: [],
    request_log: [],
    return: [],
    reversal: [],
    role: [],
    rule: [],
    step_invocation: [],
    sweep_rule: [],
    transaction: [
      { id: "amount", required: true, label: "Amount" },
      { id: "as_of_date", required: true, label: "As Of Date" },
      { id: "direction", required: true, label: "Direction" },
      { id: "posted", required: true, label: "Posted" },
      { id: "type", required: false, label: "Type" },
      { id: "vendor_description", required: false, label: "Vendor Description" },
    ],
    transaction_categorization_rule: [],
    transaction_line_item: [],
    transfer: [],
    user: [],
    vendor_subscription: [],
    virtual_account: [],
    virtual_account_setting: [],
    webhook_delivery_attempt: [],
    webhook_endpoint: [],
  },
  ai: {
    gemini: {
      enabled: true,
      apiKey: process.env.GEMINI_API_KEY as string,
      defaultModel: "gemini-1.5-flash-latest", // Use latest robust model
      temperature: 0.7,
      maxOutputTokens: 8192, // Increased for richer outputs
      safetySettings: {
        harassment: "BLOCK_NONE",
        hateSpeech: "BLOCK_NONE",
        sexuallyExplicit: "BLOCK_NONE",
        dangerousContent: "BLOCK_NONE",
      },
    },
  },
  externalServices: {
    stripe: {
      enabled: true,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY as string,
      secretKey: process.env.STRIPE_SECRET_KEY as string,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
    },
    twilio: {
      enabled: true,
      accountSid: process.env.TWILIO_ACCOUNT_SID as string,
      authToken: process.env.TWILIO_AUTH_TOKEN as string,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID as string,
    },
    sendgrid: {
      enabled: true,
      apiKey: process.env.SENDGRID_API_KEY as string,
      senderEmail: "noreply@zenithflow.ai",
    },
    awsS3: {
      enabled: true,
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
      region: "us-east-1",
      bucketName: "zenithflow-production-files",
    },
    googleCloudStorage: {
      enabled: true,
      projectId: process.env.GCS_PROJECT_ID as string,
      keyFilename: process.env.GCS_KEY_FILENAME as string, // Should be path to .json file
      bucketName: "zenithflow-gcs-prod-bucket",
    },
    azureBlobStorage: {
      enabled: true,
      accountName: process.env.AZURE_BLOB_ACCOUNT_NAME as string,
      accountKey: process.env.AZURE_BLOB_ACCOUNT_KEY as string,
      containerName: "production-uploads",
    },
    firebase: {
      enabled: true,
      apiKey: process.env.FIREBASE_API_KEY as string,
      authDomain: "zenithflow-prod.firebaseapp.com",
      projectId: "zenithflow-prod",
      storageBucket: "zenithflow-prod.appspot.com",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID as string,
      appId: process.env.FIREBASE_APP_ID as string,
      databaseURL: "https://zenithflow-prod.firebaseio.com",
      measurementId: process.env.FIREBASE_MEASUREMENT_ID as string,
    },
    auth0: {
      enabled: true,
      domain: process.env.AUTH0_DOMAIN as string,
      clientId: process.env.AUTH0_CLIENT_ID as string,
      clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
      audience: "https://api.zenithflow.ai/",
    },
    okta: {
      enabled: true,
      orgUrl: process.env.OKTA_ORG_URL as string,
      clientId: process.env.OKTA_CLIENT_ID as string,
      clientSecret: process.env.OKTA_CLIENT_SECRET as string,
      issuer: process.env.OKTA_ISSUER as string,
    },
    segment: {
      enabled: true,
      writeKey: process.env.SEGMENT_WRITE_KEY as string,
    },
    mixpanel: {
      enabled: true,
      projectToken: process.env.MIXPANEL_PROJECT_TOKEN as string,
    },
    amplitude: {
      enabled: true,
      apiKey: process.env.AMPLITUDE_API_KEY as string,
    },
    intercom: {
      enabled: true,
      appId: process.env.INTERCOM_APP_ID as string,
      apiKey: process.env.INTERCOM_API_KEY as string,
    },
    zendesk: {
      enabled: true,
      subdomain: "zenithflow",
      apiToken: process.env.ZENDESK_API_TOKEN as string,
      email: process.env.ZENDESK_EMAIL as string,
    },
    salesforce: {
      enabled: true,
      consumerKey: process.env.SALESFORCE_CONSUMER_KEY as string,
      consumerSecret: process.env.SALESFORCE_CONSUMER_SECRET as string,
      username: process.env.SALESFORCE_USERNAME as string,
      password: process.env.SALESFORCE_PASSWORD as string,
      token: process.env.SALESFORCE_SECURITY_TOKEN as string,
    },
    hubspot: {
      enabled: true,
      apiKey: process.env.HUBSPOT_API_KEY as string,
      portalId: process.env.HUBSPOT_PORTAL_ID as string,
    },
    slack: {
      enabled: true,
      botToken: process.env.SLACK_BOT_TOKEN as string,
      signingSecret: process.env.SLACK_SIGNING_SECRET as string,
      appToken: process.env.SLACK_APP_TOKEN as string,
    },
    discord: {
      enabled: true,
      botToken: process.env.DISCORD_BOT_TOKEN as string,
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      accessToken: process.env.GITHUB_ACCESS_TOKEN as string,
    },
    gitlab: {
      enabled: true,
      appId: process.env.GITLAB_APP_ID as string,
      appSecret: process.env.GITLAB_APP_SECRET as string,
      privateToken: process.env.GITLAB_PRIVATE_TOKEN as string,
    },
    jira: {
      enabled: true,
      baseUrl: "https://zenithflow.atlassian.net",
      email: process.env.JIRA_EMAIL as string,
      apiToken: process.env.JIRA_API_TOKEN as string,
    },
    asana: {
      enabled: true,
      accessToken: process.env.ASANA_ACCESS_TOKEN as string,
    },
    trello: {
      enabled: true,
      apiKey: process.env.TRELLO_API_KEY as string,
      apiToken: process.env.TRELLO_API_TOKEN as string,
    },
    zoom: {
      enabled: true,
      apiKey: process.env.ZOOM_API_KEY as string,
      apiSecret: process.env.ZOOM_API_SECRET as string,
      jwtToken: process.env.ZOOM_JWT_TOKEN as string,
    },
    calendly: {
      enabled: true,
      accessToken: process.env.CALENDLY_ACCESS_TOKEN as string,
    },
    docusign: {
      enabled: true,
      integratorKey: process.env.DOCUSIGN_INTEGRATOR_KEY as string,
      userId: process.env.DOCUSIGN_USER_ID as string,
      privateKey: process.env.DOCUSIGN_PRIVATE_KEY as string,
    },
    hellosign: {
      enabled: true,
      apiKey: process.env.HELLOSIGN_API_KEY as string,
    },
    shopify: {
      enabled: true,
      shopName: "zenithflow-store",
      apiKey: process.env.SHOPIFY_API_KEY as string,
      password: process.env.SHOPIFY_PASSWORD as string,
    },
    woocommerce: {
      enabled: true,
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY as string,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET as string,
      storeUrl: "https://shop.zenithflow.ai",
    },
    googleMaps: {
      enabled: true,
      apiKey: process.env.GOOGLE_MAPS_API_KEY as string,
    },
    mapbox: {
      enabled: true,
      accessToken: process.env.MAPBOX_ACCESS_TOKEN as string,
    },
    openWeather: {
      enabled: true,
      apiKey: process.env.OPENWEATHER_API_KEY as string,
    },
    newsApi: {
      enabled: true,
      apiKey: process.env.NEWSAPI_API_KEY as string,
    },
    clearbit: {
      enabled: true,
      apiKey: process.env.CLEARBIT_API_KEY as string,
    },
    fullContact: {
      enabled: true,
      apiKey: process.env.FULLCONTACT_API_KEY as string,
    },
    algolia: {
      enabled: true,
      appId: process.env.ALGOLIA_APP_ID as string,
      apiKey: process.env.ALGOLIA_API_KEY as string,
      adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY as string,
    },
    elasticsearch: {
      enabled: true,
      cloudId: process.env.ELASTICSEARCH_CLOUD_ID as string,
      apiKey: process.env.ELASTICSEARCH_API_KEY as string,
      username: process.env.ELASTICSEARCH_USERNAME as string,
      password: process.env.ELASTICSEARCH_PASSWORD as string,
    },
    redis: {
      enabled: true,
      host: process.env.REDIS_HOST as string,
      port: parseInt(process.env.REDIS_PORT as string || "6379", 10),
      password: process.env.REDIS_PASSWORD as string,
    },
    kafka: {
      enabled: true,
      brokers: (process.env.KAFKA_BROKERS as string)?.split(',') || [],
      username: process.env.KAFKA_USERNAME as string,
      password: process.env.KAFKA_PASSWORD as string,
    },
    rabbitmq: {
      enabled: true,
      url: process.env.RABBITMQ_URL as string,
    },
    datadog: {
      enabled: true,
      apiKey: process.env.DATADOG_API_KEY as string,
      applicationKey: process.env.DATADOG_APP_KEY as string,
    },
    newRelic: {
      enabled: true,
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY as string,
      appId: process.env.NEW_RELIC_APP_ID as string,
    },
    sentry: {
      enabled: true,
      dsn: process.env.SENTRY_DSN as string,
      environment: "production",
    },
    pagerDuty: {
      enabled: true,
      apiKey: process.env.PAGERDUTY_API_KEY as string,
      fromEmail: "ops@zenithflow.ai",
    },
    awsLambda: {
      enabled: true,
      accessKeyId: process.env.AWS_LAMBDA_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_LAMBDA_SECRET_ACCESS_KEY as string,
      region: "us-east-1",
    },
    googleCloudFunctions: {
      enabled: true,
      projectId: process.env.GCP_PROJECT_ID as string,
      keyFilename: process.env.GCS_KEY_FILENAME as string,
      region: "us-central1",
    },
    azureFunctions: {
      enabled: true,
      appId: process.env.AZURE_FUNCTION_APP_ID as string,
      apiKey: process.env.AZURE_FUNCTION_API_KEY as string,
    },
    vercel: {
      enabled: true,
      accessToken: process.env.VERCEL_ACCESS_TOKEN as string,
      teamId: process.env.VERCEL_TEAM_ID as string,
    },
    netlify: {
      enabled: true,
      accessToken: process.env.NETLIFY_ACCESS_TOKEN as string,
    },
    digitalOcean: {
      enabled: true,
      accessToken: process.env.DIGITALOCEAN_ACCESS_TOKEN as string,
    },
    linode: {
      enabled: true,
      accessToken: process.env.LINODE_ACCESS_TOKEN as string,
    },
    cloudflare: {
      enabled: true,
      apiKey: process.env.CLOUDFLARE_API_KEY as string,
      email: process.env.CLOUDFLARE_EMAIL as string,
      zoneId: process.env.CLOUDFLARE_ZONE_ID as string,
    },
    fastly: {
      enabled: true,
      apiKey: process.env.FASTLY_API_KEY as string,
      serviceId: process.env.FASTLY_SERVICE_ID as string,
    },
    mailchimp: {
      enabled: true,
      apiKey: process.env.MAILCHIMP_API_KEY as string,
      serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX as string,
    },
    constantContact: {
      enabled: true,
      apiKey: process.env.CONSTANTCONTACT_API_KEY as string,
      accessToken: process.env.CONSTANTCONTACT_ACCESS_TOKEN as string,
    },
    activeCampaign: {
      enabled: true,
      apiUrl: process.env.ACTIVECAMPAIGN_API_URL as string,
      apiKey: process.env.ACTIVECAMPAIGN_API_KEY as string,
    },
    typeform: {
      enabled: true,
      accessToken: process.env.TYPEFORM_ACCESS_TOKEN as string,
    },
    surveyMonkey: {
      enabled: true,
      accessToken: process.env.SURVEYMONKEY_ACCESS_TOKEN as string,
      clientId: process.env.SURVEYMONKEY_CLIENT_ID as string,
      clientSecret: process.env.SURVEYMONKEY_CLIENT_SECRET as string,
    },
    googleAnalytics: {
      enabled: true,
      trackingId: process.env.GA_TRACKING_ID as string,
    },
    fivetran: {
      enabled: true,
      apiKey: process.env.FIVETRAN_API_KEY as string,
      apiSecret: process.env.FIVETRAN_API_SECRET as string,
    },
    airbyte: {
      enabled: true,
      baseUrl: process.env.AIRBYTE_BASE_URL as string,
      username: process.env.AIRBYTE_USERNAME as string,
      password: process.env.AIRBYTE_PASSWORD as string,
    },
    snowflake: {
      enabled: true,
      account: process.env.SNOWFLAKE_ACCOUNT as string,
      username: process.env.SNOWFLAKE_USERNAME as string,
      password: process.env.SNOWFLAKE_PASSWORD as string,
      role: process.env.SNOWFLAKE_ROLE as string,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE as string,
      database: process.env.SNOWFLAKE_DATABASE as string,
      schema: process.env.SNOWFLAKE_SCHEMA as string,
    },
    bigQuery: {
      enabled: true,
      projectId: process.env.GCP_PROJECT_ID as string,
      keyFilename: process.env.GCS_KEY_FILENAME as string,
    },
    postgres: {
      enabled: true,
      host: process.env.PG_HOST as string,
      port: parseInt(process.env.PG_PORT as string || "5432", 10),
      user: process.env.PG_USER as string,
      password: process.env.PG_PASSWORD as string,
      database: process.env.PG_DATABASE as string,
      ssl: process.env.PG_SSL === 'true',
    },
    mysql: {
      enabled: true,
      host: process.env.MYSQL_HOST as string,
      port: parseInt(process.env.MYSQL_PORT as string || "3306", 10),
      user: process.env.MYSQL_USER as string,
      password: process.env.MYSQL_PASSWORD as string,
      database: process.env.MYSQL_DATABASE as string,
    },
    mongodb: {
      enabled: true,
      uri: process.env.MONGODB_URI as string,
    },
    dynamoDb: {
      enabled: true,
      accessKeyId: process.env.AWS_DYNAMODB_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY as string,
      region: "us-east-1",
    },
    redisCloud: {
      enabled: true,
      host: process.env.REDISCLOUD_HOST as string,
      port: parseInt(process.env.REDISCLOUD_PORT as string || "12345", 10),
      password: process.env.REDISCLOUD_PASSWORD as string,
    },
    supabase: {
      enabled: true,
      url: process.env.SUPABASE_URL as string,
      anonKey: process.env.SUPABASE_ANON_KEY as string,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    },
    appwrite: {
      enabled: true,
      endpoint: process.env.APPWRITE_ENDPOINT as string,
      projectId: process.env.APPWRITE_PROJECT_ID as string,
      apiKey: process.env.APPWRITE_API_KEY as string,
    },
    plaid: {
      enabled: true,
      clientId: process.env.PLAID_CLIENT_ID as string,
      secret: process.env.PLAID_SECRET as string,
      env: "production",
    },
    yodlee: {
      enabled: true,
      apiKey: process.env.YODLEE_API_KEY as string,
      apiSecret: process.env.YODLEE_API_SECRET as string,
      env: "production",
    },
    finicity: {
      enabled: true,
      partnerId: process.env.FINICITY_PARTNER_ID as string,
      partnerSecret: process.env.FINICITY_PARTNER_SECRET as string,
      appKey: process.env.FINICITY_APP_KEY as string,
      env: "production",
    },
    wise: {
      enabled: true,
      apiKey: process.env.WISE_API_KEY as string,
      profileId: process.env.WISE_PROFILE_ID as string,
    },
    adyen: {
      enabled: true,
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT as string,
      apiKey: process.env.ADYEN_API_KEY as string,
      clientKey: process.env.ADYEN_CLIENT_KEY as string,
      webhookSecret: process.env.ADYEN_WEBHOOK_SECRET as string,
      env: "live",
    },
    braintree: {
      enabled: true,
      merchantId: process.env.BRAINTREE_MERCHANT_ID as string,
      publicKey: process.env.BRAINTREE_PUBLIC_KEY as string,
      privateKey: process.env.BRAINTREE_PRIVATE_KEY as string,
      env: "production",
    },
    paypal: {
      enabled: true,
      clientId: process.env.PAYPAL_CLIENT_ID as string,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET as string,
      env: "live",
    },
    square: {
      enabled: true,
      accessToken: process.env.SQUARE_ACCESS_TOKEN as string,
      locationId: process.env.SQUARE_LOCATION_ID as string,
      env: "production",
    },
    quickbooks: {
      enabled: true,
      clientId: process.env.QUICKBOOKS_CLIENT_ID as string,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET as string,
      realmId: process.env.QUICKBOOKS_REALM_ID as string,
      env: "production",
    },
    xero: {
      enabled: true,
      clientId: process.env.XERO_CLIENT_ID as string,
      clientSecret: process.env.XERO_CLIENT_SECRET as string,
      tenantId: process.env.XERO_TENANT_ID as string,
    },
    freshbooks: {
      enabled: true,
      clientId: process.env.FRESHBOOKS_CLIENT_ID as string,
      clientSecret: process.env.FRESHBOOKS_CLIENT_SECRET as string,
      accountId: process.env.FRESHBOOKS_ACCOUNT_ID as string,
    },
    gusto: {
      enabled: true,
      clientId: process.env.GUSTO_CLIENT_ID as string,
      clientSecret: process.env.GUSTO_CLIENT_SECRET as string,
      accessToken: process.env.GUSTO_ACCESS_TOKEN as string,
    },
    rippling: {
      enabled: true,
      apiKey: process.env.RIPPLING_API_KEY as string,
    },
    workday: {
      enabled: true,
      tenantId: process.env.WORKDAY_TENANT_ID as string,
      clientId: process.env.WORKDAY_CLIENT_ID as string,
      clientSecret: process.env.WORKDAY_CLIENT_SECRET as string,
    },
    mondayCom: {
      enabled: true,
      apiKey: process.env.MONDAYCOM_API_KEY as string,
    },
    airtable: {
      enabled: true,
      apiKey: process.env.AIRTABLE_API_KEY as string,
      baseId: process.env.AIRTABLE_BASE_ID as string,
    },
    notion: {
      enabled: true,
      apiKey: process.env.NOTION_API_KEY as string,
      databaseId: process.env.NOTION_DATABASE_ID as string,
    },
    loom: {
      enabled: true,
      apiKey: process.env.LOOM_API_KEY as string,
    },
    miro: {
      enabled: true,
      clientId: process.env.MIRO_CLIENT_ID as string,
      clientSecret: process.env.MIRO_CLIENT_SECRET as string,
      accessToken: process.env.MIRO_ACCESS_TOKEN as string,
    },
    figma: {
      enabled: true,
      accessToken: process.env.FIGMA_ACCESS_TOKEN as string,
      fileKey: process.env.FIGMA_FILE_KEY as string,
    },
    adobeCreativeCloud: {
      enabled: true,
      clientId: process.env.ADOBE_CLIENT_ID as string,
      clientSecret: process.env.ADOBE_CLIENT_SECRET as string,
    },
    canva: {
      enabled: true,
      apiKey: process.env.CANVA_API_KEY as string,
    },
    hubspotMarketing: {
      enabled: true,
      apiKey: process.env.HUBSPOT_MARKETING_API_KEY as string,
    },
    googleAds: {
      enabled: true,
      developerToken: process.env.GOOGLEADS_DEVELOPER_TOKEN as string,
      clientId: process.env.GOOGLEADS_CLIENT_ID as string,
      clientSecret: process.env.GOOGLEADS_CLIENT_SECRET as string,
      refreshToken: process.env.GOOGLEADS_REFRESH_TOKEN as string,
      customerId: process.env.GOOGLEADS_CUSTOMER_ID as string,
    },
    facebookAds: {
      enabled: true,
      accessToken: process.env.FACEBOOK_ADS_ACCESS_TOKEN as string,
      appId: process.env.FACEBOOK_ADS_APP_ID as string,
      appSecret: process.env.FACEBOOK_ADS_APP_SECRET as string,
      adAccountId: process.env.FACEBOOK_ADS_ACCOUNT_ID as string,
    },
    twitterAds: {
      enabled: true,
      consumerKey: process.env.TWITTER_ADS_CONSUMER_KEY as string,
      consumerSecret: process.env.TWITTER_ADS_CONSUMER_SECRET as string,
      accessToken: process.env.TWITTER_ADS_ACCESS_TOKEN as string,
      accessTokenSecret: process.env.TWITTER_ADS_ACCESS_TOKEN_SECRET as string,
      accountId: process.env.TWITTER_ADS_ACCOUNT_ID as string,
    },
    linkedinAds: {
      enabled: true,
      clientId: process.env.LINKEDIN_ADS_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_ADS_CLIENT_SECRET as string,
      accessToken: process.env.LINKEDIN_ADS_ACCESS_TOKEN as string,
      accountId: process.env.LINKEDIN_ADS_ACCOUNT_ID as string,
    },
    pinterestAds: {
      enabled: true,
      accessToken: process.env.PINTEREST_ADS_ACCESS_TOKEN as string,
      adAccountId: process.env.PINTEREST_ADS_ACCOUNT_ID as string,
    },
    googleRecaptcha: {
      enabled: true,
      siteKey: process.env.GOOGLE_RECAPTCHA_SITE_KEY as string,
      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY as string,
    },
    akamai: {
      enabled: true,
      accessToken: process.env.AKAMAI_ACCESS_TOKEN as string,
      clientToken: process.env.AKAMAI_CLIENT_TOKEN as string,
      clientSecret: process.env.AKAMAI_CLIENT_SECRET as string,
    },
    datadogLogs: {
      enabled: true,
      apiKey: process.env.DATADOG_LOGS_API_KEY as string,
      site: process.env.DATADOG_LOGS_SITE as string,
    },
    pagerDutyEvents: {
      enabled: true,
      routingKey: process.env.PAGERDUTY_EVENTS_ROUTING_KEY as string,
    },
    newRelicInsights: {
      enabled: true,
      queryKey: process.env.NEW_RELIC_INSIGHTS_QUERY_KEY as string,
      insertKey: process.env.NEW_RELIC_INSIGHTS_INSERT_KEY as string,
      accountId: process.env.NEW_RELIC_ACCOUNT_ID as string,
    },
    twilioVerify: {
      enabled: true,
      serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID as string,
      authToken: process.env.TWILIO_AUTH_TOKEN as string,
    },
    auth0Management: {
      enabled: true,
      domain: process.env.AUTH0_DOMAIN as string,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID as string,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET as string,
      audience: process.env.AUTH0_MANAGEMENT_AUDIENCE as string,
    },
    stripeConnect: {
      enabled: true,
      clientId: process.env.STRIPE_CONNECT_CLIENT_ID as string,
      secretKey: process.env.STRIPE_SECRET_KEY as string,
      webhookSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET as string,
    },
    googleCloudVision: {
      enabled: true,
      projectId: process.env.GCP_PROJECT_ID as string,
      keyFilename: process.env.GCS_KEY_FILENAME as string,
    },
    awsRekognition: {
      enabled: true,
      accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY as string,
      region: "us-east-1",
    },
    azureCognitiveServices: {
      enabled: true,
      endpoint: process.env.AZURE_COGNITIVE_SERVICES_ENDPOINT as string,
      apiKey: process.env.AZURE_COGNITIVE_SERVICES_API_KEY as string,
    },
    segmentIo: {
      enabled: true,
      writeKey: process.env.SEGMENTIO_WRITE_KEY as string,
    },
    pendo: {
      enabled: true,
      apiKey: process.env.PENDO_API_KEY as string,
    },
    optimizely: {
      enabled: true,
      sdkKey: process.env.OPTIMIZELY_SDK_KEY as string,
    },
    launchDarkly: {
      enabled: true,
      sdkKey: process.env.LAUNCHDARKLY_SDK_KEY as string,
      clientSideId: process.env.LAUNCHDARKLY_CLIENT_SIDE_ID as string,
    },
  },
  branding: {
    logoUrl: "https://cdn.zenithflow.ai/assets/logo.svg",
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    fontFamily: "'Inter', sans-serif",
  },
  analytics: {
    serverSideTrackingEnabled: true,
    clientSideTrackingEnabled: true,
    eventQueueSize: 100,
    flushIntervalMs: 5000,
  },
  paymentGateways: {
    default: "stripe",
  },
  customerSupport: {
    defaultChannel: "intercom",
    supportEmail: "support@zenithflow.ai",
    statusPageUrl: "https://status.zenithflow.ai",
    faqUrl: "https://support.zenithflow.ai/faq",
  },
  emailService: {
    defaultProvider: "sendgrid",
    marketingEmailListId: "zenithflow-main-marketing-list",
    transactionalEmailTemplateIds: {
      welcome: "tpl-welcome-email-v2",
      passwordReset: "tpl-password-reset-v2",
      invoicePaid: "tpl-invoice-paid",
      criticalAlert: "tpl-critical-system-alert",
    },
  },
  fileStorage: {
    defaultProvider: "awsS3",
    maxUploadSizeMb: 1024, // 1GB limit for enterprise
    allowedFileTypes: ["image/*", "application/pdf", "text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "application/x-zip-compressed", "video/*"],
    virusScanningEnabled: true,
  },
  developerSettings: {
    apiDocsUrl: "https://docs.zenithflow.ai/api",
    webhookRetryPolicy: {
      maxAttempts: 7, // More robust retries
      initialDelayMs: 1000, // 1 second
      maxDelayMs: 600000, // 10 minutes
    },
    sandboxModeEnabled: false, // Disabled in production
  },
  localization: {
    defaultLanguage: "en-US",
    supportedLanguages: ["en-US", "es-ES", "fr-FR", "de-DE", "ja-JP", "zh-CN", "pt-BR"],
    cdnUrl: "https://cdn.zenithflow.ai/locales",
  },
  compliance: {
    gdprEnabled: true,
    ccpaEnabled: true,
    iso27001ComplianceEnabled: true,
    auditLogRetentionDays: 365 * 10, // 10 years for long-term compliance
    pciComplianceEnabled: true,
  },
  blockchain: {
    enabled: false,
    network: "ethereum_mainnet",
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL as string,
    contractAddresses: {
      token: process.env.BLOCKCHAIN_TOKEN_CONTRACT as string,
      nft: process.env.BLOCKCHAIN_NFT_CONTRACT as string,
    },
  },
  telemetry: {
    enabled: true,
    exporterEndpoint: process.env.TELEMETRY_EXPORTER_ENDPOINT as string,
    samplingRate: 0.1, // Sample 10% of traces/metrics
  },
  dataRetention: {
    transactionLogDays: 365 * 5, // 5 years
    auditLogDays: 365 * 10, // 10 years
    userDataArchiveDays: 365 * 1, // 1 year before anonymization/deletion post-deactivation
  },
};

export default APP_CONFIG;