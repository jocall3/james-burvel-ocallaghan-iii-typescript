require('dotenv').config();

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebhookClient } = require('dialogflow-fulfillment');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const pino = require('pino-http')();
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Official Gemini library

// --- Core Configuration and Environment Variables ---
const config = {
    port: process.env.PORT || 4000,
    env: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/gemini_app_db',
    jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey_please_change_in_prod',
    geminiApiKey: process.env.GEMINI_API_KEY,
    googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    externalServices: {
        openAIApiKey: process.env.OPENAI_API_KEY,
        huggingFaceApiKey: process.env.HUGGING_FACE_API_KEY,
        awsComprehendAccessKeyId: process.env.AWS_COMPREHEND_ACCESS_KEY_ID,
        awsComprehendSecretAccessKey: process.env.AWS_COMPREHEND_SECRET_ACCESS_KEY,
        azureCognitiveServicesKey: process.env.AZURE_COGNITIVE_SERVICES_KEY,
        ibmWatsonApiKey: process.env.IBM_WATSON_API_KEY,
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
        awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        awsRegion: process.env.AWS_REGION,
        awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
        googleCloudStorageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
        azureStorageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
        azureStorageAccountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
        cloudflareApiKey: process.env.CLOUDFLARE_API_KEY,
        cloudflareEmail: process.env.CLOUDFLARE_EMAIL,
        stripeSecretKey: process.env.STRIPE_SECRET_KEY,
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        paypalClientId: process.env.PAYPAL_CLIENT_ID,
        paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
        squareAccessToken: process.env.SQUARE_ACCESS_TOKEN,
        adyenApiKey: process.env.ADYEN_API_KEY,
        plaidClientId: process.env.PLAID_CLIENT_ID,
        plaidSecret: process.env.PLAID_SECRET,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
        sendgridApiKey: process.env.SENDGRID_API_KEY,
        mailgunApiKey: process.env.MAILGUN_API_KEY,
        mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
        pusherAppId: process.env.PUSHER_APP_ID,
        pusherKey: process.env.PUSHER_KEY,
        pusherSecret: process.env.PUSHER_SECRET,
        salesforceClientId: process.env.SALESFORCE_CLIENT_ID,
        salesforceClientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        hubspotApiKey: process.env.HUBSPOT_API_KEY,
        intercomApiKey: process.env.INTERCOM_API_KEY,
        zendeskApiKey: process.env.ZENDESK_API_KEY,
        activeCampaignApiKey: process.env.ACTIVE_CAMPAIGN_API_KEY,
        googleAnalyticsTrackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
        mixpanelProjectToken: process.env.MIXPANEL_PROJECT_TOKEN,
        segmentWriteKey: process.env.SEGMENT_WRITE_KEY,
        datadogApiKey: process.env.DATADOG_API_KEY,
        sentryDsn: process.env.SENTRY_DSN,
        newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY,
        slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
        githubClientId: process.env.GITHUB_CLIENT_ID,
        githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
        jiraApiKey: process.env.JIRA_API_KEY,
        trelloApiKey: process.env.TRELLO_API_KEY,
        zoomApiKey: process.env.ZOOM_API_KEY,
        zoomApiSecret: process.env.ZOOM_API_SECRET,
        microsoftGraphClientId: process.env.MICROSOFT_GRAPH_CLIENT_ID,
        microsoftGraphClientSecret: process.env.MICROSOFT_GRAPH_CLIENT_SECRET,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
        fivetranApiKey: process.env.FIVETRAN_API_KEY,
        stitchDataApiKey: process.env.STITCH_DATA_API_KEY,
        auth0ClientId: process.env.AUTH0_CLIENT_ID,
        auth0ClientSecret: process.env.AUTH0_CLIENT_SECRET,
        oktaClientId: process.env.OKTA_CLIENT_ID,
        oktaClientSecret: process.env.OKTA_CLIENT_SECRET,
        contentfulAccessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        sanityProjectId: process.env.SANITY_PROJECT_ID,
        sanityDataset: process.env.SANITY_DATASET,
        strapiApiKey: process.env.STRAPI_API_KEY,
        pagerdutyApiKey: process.env.PAGERDUTY_API_KEY,
        victorOpsApiKey: process.env.VICTOR_OPS_API_KEY,
        brazeApiKey: process.env.BRAZE_API_KEY,
        clevertapAccountId: process.env.CLEVERTAP_ACCOUNT_ID,
        clevertapPasscode: process.env.CLEVERTAP_PASSCODE,
        algoliaAppId: process.env.ALGOLIA_APP_ID,
        algoliaApiKey: process.env.ALGOLIA_API_KEY,
        elasticsearchUrl: process.env.ELASTICSEARCH_URL,
        fastlyApiKey: process.env.FASTLY_API_KEY,
        serviceA_ApiKey: process.env.SERVICE_A_API_KEY,
        serviceB_ClientSecret: process.env.SERVICE_B_CLIENT_SECRET,
        serviceC_Endpoint: process.env.SERVICE_C_ENDPOINT,
        serviceD_AuthToken: process.env.SERVICE_D_AUTH_TOKEN,
        serviceE_AppId: process.env.SERVICE_E_APP_ID,
        serviceF_ApiSecret: process.env.SERVICE_F_API_SECRET,
        serviceG_WebhookSecret: process.env.SERVICE_G_WEBHOOK_SECRET,
        serviceH_LicenseKey: process.env.SERVICE_H_LICENSE_KEY,
        serviceI_CredentialsFile: process.env.SERVICE_I_CREDENTIALS_FILE,
        serviceJ_BearerToken: process.env.SERVICE_J_BEARER_TOKEN,
        serviceK_ConnectionUrl: process.env.SERVICE_K_CONNECTION_URL,
        serviceL_Id: process.env.SERVICE_L_ID,
        serviceM_Key: process.env.SERVICE_M_KEY,
        serviceN_Secret: process.env.SERVICE_N_SECRET,
        serviceO_Token: process.env.SERVICE_O_TOKEN,
        serviceP_ClientKey: process.env.SERVICE_P_CLIENT_KEY,
        serviceQ_ServerKey: process.env.SERVICE_Q_SERVER_KEY,
        serviceR_GatewayUrl: process.env.SERVICE_R_GATEWAY_URL,
        serviceS_ApiId: process.env.SERVICE_S_API_ID,
        serviceT_SharedSecret: process.env.SERVICE_T_SHARED_SECRET,
        serviceU_AccessCode: process.env.SERVICE_U_ACCESS_CODE,
        serviceV_AccountSid: process.env.SERVICE_V_ACCOUNT_SID,
        serviceW_ApiKey: process.env.SERVICE_W_API_KEY,
        serviceX_TenantId: process.env.SERVICE_X_TENANT_ID,
        serviceY_Domain: process.env.SERVICE_Y_DOMAIN,
        serviceZ_ProjectId: process.env.SERVICE_Z_PROJECT_ID,
        serviceAA_AuthToken: process.env.SERVICE_AA_AUTH_TOKEN,
        serviceBB_ClientId: process.env.SERVICE_BB_CLIENT_ID,
        serviceCC_ClientSecret: process.env.SERVICE_CC_CLIENT_SECRET,
        serviceDD_ApiKey: process.env.SERVICE_DD_API_KEY,
        serviceEE_WebhookSecret: process.env.SERVICE_EE_WEBHOOK_SECRET,
        serviceFF_AccessKey: process.env.SERVICE_FF_ACCESS_KEY,
        serviceGG_SecretKey: process.env.SERVICE_GG_SECRET_KEY,
        serviceHH_Endpoint: process.env.SERVICE_HH_ENDPOINT,
        serviceII_UserId: process.env.SERVICE_II_USER_ID,
        serviceJJ_Password: process.env.SERVICE_JJ_PASSWORD,
        serviceKK_AppSecret: process.env.SERVICE_KK_APP_SECRET,
        serviceLL_AppId: process.env.SERVICE_LL_APP_ID,
        serviceMM_AccessToken: process.env.SERVICE_MM_ACCESS_TOKEN,
        serviceNN_RefreshToken: process.env.SERVICE_NN_REFRESH_TOKEN,
        serviceOO_PrivateKey: process.env.SERVICE_OO_PRIVATE_KEY,
        servicePP_PublicKey: process.env.SERVICE_PP_PUBLIC_KEY,
        serviceQQ_SigningSecret: process.env.SERVICE_QQ_SIGNING_SECRET,
        serviceRR_AuthHeader: process.env.SERVICE_RR_AUTH_HEADER,
        serviceSS_Certificate: process.env.SERVICE_SS_CERTIFICATE,
        serviceTT_ConsumerKey: process.env.SERVICE_TT_CONSUMER_KEY,
        serviceUU_ConsumerSecret: process.env.SERVICE_UU_CONSUMER_SECRET,
        serviceVV_ApiBaseUrl: process.env.SERVICE_VV_API_BASE_URL,
        serviceWW_OrgId: process.env.SERVICE_WW_ORG_ID,
        serviceXX_SiteId: process.env.SERVICE_XX_SITE_ID,
        serviceYY_Region: process.env.SERVICE_YY_REGION,
        serviceZZ_Environment: process.env.SERVICE_ZZ_ENVIRONMENT,
        service1_ApiKey: process.env.SERVICE_1_API_KEY,
        service2_SecretKey: process.env.SERVICE_2_SECRET_KEY,
        service3_ClientId: process.env.SERVICE_3_CLIENT_ID,
        service4_ClientSecret: process.env.SERVICE_4_CLIENT_SECRET,
        service5_AuthToken: process.env.SERVICE_5_AUTH_TOKEN,
        service6_WebhookSecret: process.env.SERVICE_6_WEBHOOK_SECRET,
        service7_AccessToken: process.env.SERVICE_7_ACCESS_TOKEN,
        service8_RefreshToken: process.env.SERVICE_8_REFRESH_TOKEN,
        service9_AppId: process.env.SERVICE_9_APP_ID,
        service10_TenantId: process.env.SERVICE_10_TENANT_ID,
        service11_AccountSid: process.env.SERVICE_11_ACCOUNT_SID,
        service12_AuthToken: process.env.SERVICE_12_AUTH_TOKEN,
        service13_ProjectKey: process.env.SERVICE_13_PROJECT_KEY,
        service14_Dataset: process.env.SERVICE_14_DATASET,
        service15_PrivateKey: process.env.SERVICE_15_PRIVATE_KEY,
        service16_PublicKey: process.env.SERVICE_16_PUBLIC_KEY,
        service17_BucketName: process.env.SERVICE_17_BUCKET_NAME,
        service18_StorageKey: process.env.SERVICE_18_STORAGE_KEY,
        service19_ConnectionUrl: process.env.SERVICE_19_CONNECTION_URL,
        service20_Host: process.env.SERVICE_20_HOST,
        service21_Port: process.env.SERVICE_21_PORT,
        service22_Username: process.env.SERVICE_22_USERNAME,
        service23_Password: process.env.SERVICE_23_PASSWORD,
        service24_Database: process.env.SERVICE_24_DATABASE,
        service25_Table: process.env.SERVICE_25_TABLE,
    },
};

// --- Logger Setup ---
const logger = winston.createLogger({
    level: config.env === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    ({ level, message, timestamp, stack }) =>
                        `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`
                )
            ),
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'exceptions.log' }),
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'rejections.log' }),
    ],
});

// --- Database Connection ---
const connectDb = async () => {
    try {
        await mongoose.connect(config.databaseUrl);
        logger.info('MongoDB Connected Successfully');
    } catch (err) {
        logger.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

// --- Models ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'premium'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    externalServiceTokens: [{
        serviceName: String,
        accessToken: String,
        refreshToken: String,
        expiresAt: Date,
        meta: mongoose.Schema.Types.Mixed,
    }],
    geminiConversationHistory: [{
        role: String,
        content: String,
        timestamp: { type: Date, default: Date.now },
    }],
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // In production, use a strong hashing library like bcrypt
    // const bcrypt = require('bcryptjs');
    // const salt = await bcrypt.genSalt(10);
    // this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    // In production, use bcrypt.compare
    return candidatePassword === this.password;
};

const User = mongoose.model('User', userSchema);

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    settings: mongoose.Schema.Types.Mixed,
});
const Project = mongoose.model('Project', ProjectSchema);

const IntegrationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    serviceName: { type: String, required: true },
    config: { type: mongoose.Schema.Types.Mixed, required: true },
    isEnabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const Integration = mongoose.model('Integration', IntegrationSchema);


// --- Gemini AI Service Integration ---
class GeminiService {
    constructor(apiKey, projectId) {
        if (!apiKey) {
            logger.error('Gemini API Key is not configured. AI functionalities will be limited.');
            this.isEnabled = false;
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            this.isEnabled = true;
            logger.info('GeminiService initialized.');
        }
        this.projectId = projectId;
    }

    async generateText(prompt, userId, conversationHistory = []) {
        if (!this.isEnabled) {
            return { error: 'Gemini service not available due to missing API key.' };
        }
        logger.debug(`GeminiService: Generating text for user ${userId} with prompt: "${prompt}"`);

        try {
            const chat = this.model.startChat({
                history: conversationHistory.map(entry => ({
                    role: entry.role === 'user' ? 'user' : 'model', // Gemini expects 'model' for AI responses
                    parts: [{ text: entry.content }]
                })),
                generationConfig: {
                    maxOutputTokens: 2048,
                },
            });

            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();

            const user = await User.findById(userId);
            if (user) {
                user.geminiConversationHistory.push({ role: 'user', content: prompt });
                user.geminiConversationHistory.push({ role: 'gemini', content: text });
                if (user.geminiConversationHistory.length > 50) {
                    user.geminiConversationHistory = user.geminiConversationHistory.slice(-50);
                }
                await user.save();
            }

            return { text: text };

        } catch (error) {
            logger.error('Error calling Gemini API:', error);
            return { error: 'Failed to get a response from Gemini AI. Please try again later.' };
        }
    }

    async analyzeDocument(documentContent) {
        if (!this.isEnabled) {
            return { error: 'Gemini service not available due to missing API key.' };
        }
        logger.debug('GeminiService: Analyzing document content...');
        try {
            const result = await this.model.generateContent(`Summarize and extract key entities from the following document:\n\n${documentContent}`);
            const response = await result.response;
            const text = response.text();
            // Simple mock for entities; real extraction would be more complex
            const entities = text.match(/\b[A-Z][a-z0-9]+\b/g) || []; // Basic capitalization heuristic
            return { summary: text, entities: [...new Set(entities)] };
        } catch (error) {
            logger.error('Error analyzing document with Gemini:', error);
            return { error: 'Failed to analyze document with Gemini AI.' };
        }
    }
}
const geminiService = new GeminiService(config.geminiApiKey, config.googleCloudProjectId);


// --- External Services Wrapper ---
class ExternalServiceManager {
    constructor(config) {
        this.config = config.externalServices;
        this.services = {};
        this.initServices();
    }

    initServices() {
        logger.info('Initializing external services...');
        // Stripe
        if (this.config.stripeSecretKey) {
            // const stripe = require('stripe')(this.config.stripeSecretKey);
            this.services.stripe = {
                createCharge: async (amount, currency, source) => {
                    return { id: `ch_mock_${Date.now()}`, amount, currency, status: 'succeeded' };
                },
            };
            logger.info('Stripe service initialized.');
        } else { logger.warn('Stripe service not initialized: Missing API key.'); }

        // Twilio
        if (this.config.twilioAccountSid && this.config.twilioAuthToken) {
            // const twilio = require('twilio')(this.config.twilioAccountSid, this.config.twilioAuthToken);
            this.services.twilio = {
                sendSMS: async (to, body) => {
                    return { sid: `SM_mock_${Date.now()}`, status: 'queued' };
                },
            };
            logger.info('Twilio service initialized.');
        } else { logger.warn('Twilio service not initialized: Missing credentials.'); }

        // AWS S3
        if (this.config.awsAccessKeyId && this.config.awsSecretAccessKey && this.config.awsRegion) {
            // const AWS = require('aws-sdk');
            // AWS.config.update({ accessKeyId: this.config.awsAccessKeyId, secretAccessKey: this.config.awsSecretAccessKey, region: this.config.awsRegion });
            // const s3 = new AWS.S3();
            this.services.awsS3 = {
                uploadFile: async (bucket, key, body, contentType) => {
                    return { ETag: `mock_etag_${Date.now()}`, Location: `https://${bucket}.s3.${this.config.awsRegion}.amazonaws.com/${key}` };
                },
            };
            logger.info('AWS S3 service initialized.');
        } else { logger.warn('AWS S3 service not initialized: Missing credentials.'); }

        // Placeholder for the remaining ~97 services
        // Each would follow a similar pattern: check config, instantiate client, expose methods.
        // For demonstration, these are not fully implemented.
        for (const [key, value] of Object.entries(this.config)) {
            if (key.startsWith('service')) { // Generic placeholder services
                const serviceName = key.split('_')[0]; // e.g., 'serviceA'
                if (!this.services[serviceName]) { // Only initialize once per service base name
                    this.services[serviceName] = {
                        callApi: async (method, params) => {
                            logger.debug(`Generic service ${serviceName} called with method ${method}`);
                            return { status: 'mock_success', response: `Called ${serviceName} with ${JSON.stringify(params)}` };
                        }
                    };
                    logger.info(`Generic service ${serviceName} initialized.`);
                }
            }
        }
    }

    getService(name) {
        const lowerCaseName = name.toLowerCase();
        if (!this.services[lowerCaseName]) {
            logger.error(`Attempted to access uninitialized service: ${name}`);
            throw new Error(`Service '${name}' is not configured or initialized.`);
        }
        return this.services[lowerCaseName];
    }
}
const externalServiceManager = new ExternalServiceManager(config);

// --- Event Bus / PubSub for internal communication ---
const pubsub = new PubSub();
const TOPICS = {
    USER_CREATED: 'USER_CREATED',
    PROJECT_UPDATED: 'PROJECT_UPDATED',
    INTEGRATION_CONFIG_CHANGED: 'INTEGRATION_CONFIG_CHANGED',
    GEMINI_RESPONSE_RECEIVED: 'GEMINI_RESPONSE_RECEIVED',
    EXTERNAL_SERVICE_CALL: 'EXTERNAL_SERVICE_CALL',
};

// --- Original OperationStoreClient (integrated) ---
var _aliases = {
    "CreateOrganization": "ba84c641ed4e686aadd8332e16c58430e741b4d7e20907cdeccfdbdbe8bc9640",
    "DebugInteractionExecutions": "1cc02c7fd13381cb7e72ed75713e6a15be793ef0583cf44afc7d7f69711eb247",
    "DebugInteractions": "7aac197f7b26fb83a4f0264087f5cfbe8ee2776b7cda3659f56646bd8aec8b8c",
    "PipelineInvocation": "79032483b0a93364a13d8d0f36052d7f8587288046753c5111a97fcea83466f7",
    "PipelineInvocationDetailsTable": "0717100b0c7c15b2d1378df5b98f513c86e2c1058ae3d5fde38daeb628e388eb",
    "RunDebugInteraction": "fdaacb8375ccc364145482830f50e73df481c218b21910d322c0317621693c33",
    "StepInvocation": "f89a073d03993b4c515694dd12b3348a51e057fb80a003e0e571e6fb67e93090",
    "StepInvocationDetailsTable": "1b8feb7e33b4ed0bfd8b4272ca2bd22931b895ac89211c5cbbe6c46b84cec239",
    "pipelineInvocationFlowChart": "614632a637cd6b298f02c4c4f99b3bc3d0233620982f99c117f0cafcdbdb8d4a",
    "pipelineInvocationsHome": "2e5bb7c4f3eb794d48262bc2f5f259b8c48831b134c54dfc1ad2d94a41ffb4be",
    "stepInvocationsHome": "99bcf2bf2cd63254d77dc9df55cc67f61eac70f918d64daf67dbe948a7fe7e94",
    "GetUserProfile": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    "UpdateUserProfile": "f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1",
    "CreateProject": "b1a2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    "GetProjectDetails": "c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2",
    "IntegrateService": "d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d6e7f8g9h0i1",
    "PerformGeminiQuery": "e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2",
    "GetExternalServiceStatus": "f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0j1k2",
    "SearchDocuments": "g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d3e4f5g6h7i8j9k0l1",
    "ProcessPayment": "h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2",
    "SendNotification": "i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0b1c2d3e4f5g6h7i8j9k0l1m2n3",
    "UploadFile": "j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l7m8n9o0p1",
    "GetUsageAnalytics": "k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j7k8l9m0n1o2p3q4"
};

var _client = "admin_super_app_client";

var OperationStoreClient = {
    getOperationId: function(operationName) {
        return _client + "/" + OperationStoreClient.getPersistedQueryAlias(operationName);
    },

    getPersistedQueryAlias: function(operationName) {
        var persistedAlias = _aliases[operationName];
        if (!persistedAlias) {
            logger.warn(`GraphQL Operation "${operationName}" not found in persisted query aliases.`);
            throw new GraphQLError(`Failed to find persisted alias for operation name: ${operationName}. Ensure it's registered.`);
        }
        return persistedAlias;
    },

    apolloLink: function(operation, forward) {
        if (operation.operationName) {
            try {
                const operationId = OperationStoreClient.getOperationId(operation.operationName);
                operation.setContext({
                    http: {
                        includeQuery: false,
                        includeExtensions: true,
                    }
                });
                operation.extensions.operationId = operationId;
                logger.debug(`Apollo Link: Persisted query ID set for operation "${operation.operationName}"`);
            } catch (error) {
                logger.error(`Apollo Link Error for operation "${operation.operationName}": ${error.message}`);
                throw error;
            }
        }
        return forward(operation);
    },

    apolloMiddleware: {
        applyBatchMiddleware: function(options, next) {
            options.requests.forEach(function(req) {
                try {
                    req.operationId = OperationStoreClient.getOperationId(req.operationName);
                    delete req.query;
                } catch (error) {
                    logger.error(`Apollo Batch Middleware Error for operation "${req.operationName}": ${error.message}`);
                }
            });
            next();
        },

        applyMiddleware: function(options, next) {
            var req = options.request;
            try {
                req.operationId = OperationStoreClient.getOperationId(req.operationName);
                delete req.query;
            } catch (error) {
                logger.error(`Apollo Middleware Error for operation "${req.operationName}": ${error.message}`);
            }
            next();
        }
    }
};

// --- GraphQL Schema, Resolvers, and Context ---
const typeDefs = `
    scalar JSON
    scalar DateTime

    enum UserRole {
        user
        admin
        premium
    }

    type User {
        id: ID!
        username: String!
        email: String!
        role: UserRole!
        createdAt: DateTime!
        updatedAt: DateTime!
        geminiConversationHistory: [ConversationEntry!]
        externalServiceIntegrations: [Integration!]
    }

    type Project {
        id: ID!
        name: String!
        description: String
        owner: User!
        members: [User!]
        status: String!
        createdAt: DateTime!
        updatedAt: DateTime!
        settings: JSON
    }

    type Integration {
        id: ID!
        serviceName: String!
        config: JSON!
        isEnabled: Boolean!
        user: User!
        project: Project
    }

    type ConversationEntry {
        role: String!
        content: String!
        timestamp: DateTime!
    }

    type GeminiResponse {
        text: String
        error: String
        conversationId: ID
    }

    type AnalysisResult {
        summary: String
        entities: [String!]
        error: String
    }

    type PaymentResult {
        id: String!
        amount: Int!
        currency: String!
        status: String!
        error: String
    }

    type SMSResult {
        sid: String!
        status: String!
        error: String
    }

    type UploadResult {
        ETag: String
        Location: String
        error: String
    }

    type Query {
        me: User
        user(id: ID!): User
        users: [User!]
        project(id: ID!): Project
        projects(ownerId: ID): [Project!]
        integrations(userId: ID!, serviceName: String): [Integration!]
        geminiChatHistory(userId: ID!): [ConversationEntry!]
        externalServiceStatus(serviceName: String!): JSON
    }

    type Mutation {
        register(username: String!, email: String!, password: String!): User!
        login(email: String!, password: String!): String!
        updateUserProfile(username: String, email: String, role: UserRole): User!
        createProject(name: String!, description: String): Project!
        updateProject(id: ID!, name: String, description: String, status: String): Project!
        deleteProject(id: ID!): Boolean!
        addProjectMember(projectId: ID!, userId: ID!): Project!
        removeProjectMember(projectId: ID!, userId: ID!): Project!

        sendGeminiMessage(message: String!, userId: ID!, conversationId: ID): GeminiResponse!
        analyzeDocumentWithGemini(documentContent: String!): AnalysisResult!

        setupIntegration(serviceName: String!, config: JSON!, projectId: ID): Integration!
        updateIntegration(id: ID!, config: JSON, isEnabled: Boolean): Integration!
        deleteIntegration(id: ID!): Boolean!
        
        processPayment(amount: Int!, currency: String!, source: String!, userId: ID!): PaymentResult!
        sendSMSNotification(to: String!, body: String!, userId: ID!): SMSResult!
        uploadFileToS3(bucket: String!, key: String!, fileBase64: String!, contentType: String!): UploadResult!
    }

    type Subscription {
        userCreated: User!
        projectUpdated(projectId: ID!): Project!
        geminiResponse(userId: ID!): ConversationEntry!
        externalServiceEvent(eventName: String!, payload: JSON): JSON
    }
`;

const resolvers = {
    JSON: require('graphql-type-json'),
    DateTime: require('graphql-type-datetime'),
    Query: {
        me: async (parent, args, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            return await User.findById(context.user.id);
        },
        user: async (parent, { id }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            if (context.user.role !== 'admin' && context.user.id !== id) {
                throw new GraphQLError('Unauthorized access.', { extensions: { code: 'FORBIDDEN' } });
            }
            return await User.findById(id);
        },
        users: async (parent, args, context) => {
            if (!context.user || context.user.role !== 'admin') {
                throw new GraphQLError('Admin authorization required.', { extensions: { code: 'FORBIDDEN' } });
            }
            return await User.find({});
        },
        project: async (parent, { id }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const project = await Project.findById(id).populate('owner').populate('members');
            if (!project) throw new GraphQLError('Project not found.', { extensions: { code: 'NOT_FOUND' } });
            if (project.owner._id.toString() !== context.user.id && !project.members.some(m => m._id.toString() === context.user.id)) {
                throw new GraphQLError('Unauthorized access to project.', { extensions: { code: 'FORBIDDEN' } });
            }
            return project;
        },
        projects: async (parent, { ownerId }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const query = ownerId ? { owner: ownerId } : { $or: [{ owner: context.user.id }, { members: context.user.id }] };
            return await Project.find(query).populate('owner').populate('members');
        },
        integrations: async (parent, { userId, serviceName }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            if (context.user.id !== userId && context.user.role !== 'admin') {
                throw new GraphQLError('Unauthorized to view these integrations.', { extensions: { code: 'FORBIDDEN' } });
            }
            const query = { user: userId };
            if (serviceName) query.serviceName = serviceName;
            return await Integration.find(query);
        },
        geminiChatHistory: async (parent, { userId }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            if (context.user.id !== userId && context.user.role !== 'admin') {
                throw new GraphQLError('Unauthorized to view this chat history.', { extensions: { code: 'FORBIDDEN' } });
            }
            const user = await User.findById(userId);
            return user ? user.geminiConversationHistory : [];
        },
        externalServiceStatus: async (parent, { serviceName }, context) => {
            if (!context.user || context.user.role !== 'admin') {
                throw new GraphQLError('Admin authorization required.', { extensions: { code: 'FORBIDDEN' } });
            }
            const serviceConfigKey = Object.keys(config.externalServices).find(key => key.toLowerCase().includes(serviceName.toLowerCase()) && (key.endsWith('ApiKey') || key.endsWith('ClientId') || key.endsWith('SecretKey')));
            const isConfigured = !!config.externalServices[serviceConfigKey];
            return {
                name: serviceName,
                isConfigured: isConfigured,
                status: isConfigured ? 'operational (conceptual)' : 'not configured',
                timestamp: new Date().toISOString(),
            };
        }
    },
    Mutation: {
        register: async (parent, { username, email, password }) => {
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                throw new GraphQLError('User with this username or email already exists.', { extensions: { code: 'BAD_USER_INPUT' } });
            }
            const user = new User({ username, email, password });
            await user.save();
            pubsub.publish(TOPICS.USER_CREATED, { userCreated: user });
            logger.info(`User registered: ${user.email}`);
            return user;
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                throw new GraphQLError('Invalid credentials.', { extensions: { code: 'UNAUTHENTICATED' } });
            }
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '1d' });
            logger.info(`User logged in: ${user.email}`);
            return token;
        },
        updateUserProfile: async (parent, { username, email, role }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const user = await User.findById(context.user.id);
            if (!user) throw new GraphQLError('User not found.', { extensions: { code: 'NOT_FOUND' } });

            if (username) user.username = username;
            if (email) user.email = email;
            if (role && context.user.role === 'admin') user.role = role;
            else if (role) throw new GraphQLError('Unauthorized to change user role.', { extensions: { code: 'FORBIDDEN' } });

            user.updatedAt = new Date();
            await user.save();
            return user;
        },
        createProject: async (parent, { name, description }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const project = new Project({ name, description, owner: context.user.id, members: [context.user.id] });
            await project.save();
            logger.info(`Project created by ${context.user.email}: ${project.name}`);
            return project;
        },
        updateProject: async (parent, { id, name, description, status }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const project = await Project.findById(id);
            if (!project) throw new GraphQLError('Project not found.', { extensions: { code: 'NOT_FOUND' } });
            if (project.owner.toString() !== context.user.id) {
                throw new GraphQLError('Unauthorized to update this project.', { extensions: { code: 'FORBIDDEN' } });
            }
            if (name) project.name = name;
            if (description) project.description = description;
            if (status) project.status = status;
            project.updatedAt = new Date();
            await project.save();
            pubsub.publish(TOPICS.PROJECT_UPDATED, { projectUpdated: project });
            logger.info(`Project updated by ${context.user.email}: ${project.name}`);
            return project;
        },
        deleteProject: async (parent, { id }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const project = await Project.findById(id);
            if (!project) throw new GraphQLError('Project not found.', { extensions: { code: 'NOT_FOUND' } });
            if (project.owner.toString() !== context.user.id) {
                throw new GraphQLError('Unauthorized to delete this project.', { extensions: { code: 'FORBIDDEN' } });
            }
            await project.deleteOne();
            logger.info(`Project deleted by ${context.user.email}: ${project.name}`);
            return true;
        },
        addProjectMember: async (parent, { projectId, userId }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const project = await Project.findById(projectId);
            if (!project) throw new GraphQLError('Project not found.', { extensions: { code: 'NOT_FOUND' } });
            if (project.owner.toString() !== context.user.id) {
                throw new GraphQLError('Unauthorized to add members to this project.', { extensions: { code: 'FORBIDDEN' } });
            }
            const member = await User.findById(userId);
            if (!member) throw new GraphQLError('Member user not found.', { extensions: { code: 'NOT_FOUND' } });
            if (!project.members.includes(userId)) {
                project.members.push(userId);
                await project.save();
                pubsub.publish(TOPICS.PROJECT_UPDATED, { projectUpdated: project });
            }
            logger.info(`User ${member.email} added to project ${project.name} by ${context.user.email}`);
            return project;
        },
        removeProjectMember: async (parent, { projectId, userId }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const project = await Project.findById(projectId);
            if (!project) throw new GraphQLError('Project not found.', { extensions: { code: 'NOT_FOUND' } });
            if (project.owner.toString() !== context.user.id) {
                throw new GraphQLError('Unauthorized to remove members from this project.', { extensions: { code: 'FORBIDDEN' } });
            }
            project.members = project.members.filter(m => m.toString() !== userId);
            await project.save();
            pubsub.publish(TOPICS.PROJECT_UPDATED, { projectUpdated: project });
            logger.info(`User ${userId} removed from project ${project.name} by ${context.user.email}`);
            return project;
        },

        sendGeminiMessage: async (parent, { message, userId, conversationId }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            if (context.user.id !== userId) {
                throw new GraphQLError('Unauthorized to send messages for this user.', { extensions: { code: 'FORBIDDEN' } });
            }
            const user = await User.findById(userId);
            if (!user) throw new GraphQLError('User not found.', { extensions: { code: 'NOT_FOUND' } });

            const conversationHistory = user.geminiConversationHistory.map(entry => ({ role: entry.role, content: entry.content }));
            const response = await geminiService.generateText(message, userId, conversationHistory);

            if (response.error) {
                throw new GraphQLError(response.error, { extensions: { code: 'GEMINI_ERROR' } });
            }

            const latestEntry = user.geminiConversationHistory.slice(-1)[0];
            pubsub.publish(TOPICS.GEMINI_RESPONSE_RECEIVED, { geminiResponse: latestEntry, userId });
            logger.info(`Gemini message sent by ${context.user.email}, response received.`);
            return { text: response.text, conversationId: conversationId || 'new_conv_id' };
        },
        analyzeDocumentWithGemini: async (parent, { documentContent }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const response = await geminiService.analyzeDocument(documentContent);
            if (response.error) {
                throw new GraphQLError(response.error, { extensions: { code: 'GEMINI_ERROR' } });
            }
            logger.info(`Document analyzed with Gemini by ${context.user.email}.`);
            return response;
        },

        setupIntegration: async (parent, { serviceName, config, projectId }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });

            const integration = new Integration({
                user: context.user.id,
                project: projectId,
                serviceName,
                config: config,
                isEnabled: true,
            });
            await integration.save();
            pubsub.publish(TOPICS.INTEGRATION_CONFIG_CHANGED, { integrationConfigChanged: integration });
            logger.info(`Integration ${serviceName} set up by ${context.user.email}.`);
            return integration;
        },
        updateIntegration: async (parent, { id, config, isEnabled }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const integration = await Integration.findById(id);
            if (!integration) throw new GraphQLError('Integration not found.', { extensions: { code: 'NOT_FOUND' } });
            if (integration.user.toString() !== context.user.id) {
                throw new GraphQLError('Unauthorized to update this integration.', { extensions: { code: 'FORBIDDEN' } });
            }
            if (config) integration.config = config;
            if (typeof isEnabled === 'boolean') integration.isEnabled = isEnabled;
            integration.updatedAt = new Date();
            await integration.save();
            pubsub.publish(TOPICS.INTEGRATION_CONFIG_CHANGED, { integrationConfigChanged: integration });
            logger.info(`Integration ${integration.serviceName} updated by ${context.user.email}.`);
            return integration;
        },
        deleteIntegration: async (parent, { id }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            const integration = await Integration.findById(id);
            if (!integration) throw new GraphQLError('Integration not found.', { extensions: { code: 'NOT_FOUND' } });
            if (integration.user.toString() !== context.user.id) {
                throw new GraphQLError('Unauthorized to delete this integration.', { extensions: { code: 'FORBIDDEN' } });
            }
            await integration.deleteOne();
            logger.info(`Integration ${integration.serviceName} deleted by ${context.user.email}.`);
            return true;
        },

        processPayment: async (parent, { amount, currency, source, userId }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            if (context.user.id !== userId) throw new GraphQLError('Unauthorized to process payment for this user.', { extensions: { code: 'FORBIDDEN' } });

            try {
                const stripeService = externalServiceManager.getService('stripe');
                const result = await stripeService.createCharge(amount, currency, source);
                logger.info(`Payment processed for user ${userId} via Stripe.`);
                pubsub.publish(TOPICS.EXTERNAL_SERVICE_CALL, { eventName: 'STRIPE_CHARGE_SUCCESS', payload: result });
                return { ...result, error: null };
            } catch (error) {
                logger.error(`Error processing payment for user ${userId}:`, error);
                pubsub.publish(TOPICS.EXTERNAL_SERVICE_CALL, { eventName: 'STRIPE_CHARGE_FAILED', payload: { userId, error: error.message } });
                return { id: '', amount, currency, status: 'failed', error: error.message };
            }
        },
        sendSMSNotification: async (parent, { to, body, userId }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            if (context.user.id !== userId) throw new GraphQLError('Unauthorized to send SMS for this user.', { extensions: { code: 'FORBIDDEN' } });
            try {
                const twilioService = externalServiceManager.getService('twilio');
                const result = await twilioService.sendSMS(to, body);
                logger.info(`SMS sent to ${to} for user ${userId} via Twilio.`);
                pubsub.publish(TOPICS.EXTERNAL_SERVICE_CALL, { eventName: 'TWILIO_SMS_SENT', payload: result });
                return { ...result, error: null };
            } catch (error) {
                logger.error(`Error sending SMS for user ${userId}:`, error);
                pubsub.publish(TOPICS.EXTERNAL_SERVICE_CALL, { eventName: 'TWILIO_SMS_FAILED', payload: { userId, error: error.message } });
                return { sid: '', status: 'failed', error: error.message };
            }
        },
        uploadFileToS3: async (parent, { bucket, key, fileBase64, contentType }, context) => {
            if (!context.user) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
            try {
                const s3Service = externalServiceManager.getService('awsS3');
                const fileBuffer = Buffer.from(fileBase64, 'base64');
                const result = await s3Service.uploadFile(bucket || config.externalServices.awsS3BucketName, key, fileBuffer, contentType);
                logger.info(`File ${key} uploaded to S3 by user ${context.user.email}.`);
                pubsub.publish(TOPICS.EXTERNAL_SERVICE_CALL, { eventName: 'S3_UPLOAD_SUCCESS', payload: result });
                return { ...result, error: null };
            } catch (error) {
                logger.error(`Error uploading file to S3 by user ${context.user.email}:`, error);
                pubsub.publish(TOPICS.EXTERNAL_SERVICE_CALL, { eventName: 'S3_UPLOAD_FAILED', payload: { user: context.user.id, error: error.message } });
                return { ETag: '', Location: '', error: error.message };
            }
        }
    },
    Subscription: {
        userCreated: {
            subscribe: () => pubsub.asyncIterator([TOPICS.USER_CREATED]),
        },
        projectUpdated: {
            subscribe: (parent, { projectId }) => pubsub.asyncIterator([TOPICS.PROJECT_UPDATED]),
            resolve: (payload, { projectId }) => {
                if (projectId && payload.projectUpdated.id !== projectId) {
                    return null;
                }
                return payload.projectUpdated;
            }
        },
        geminiResponse: {
            subscribe: (parent, { userId }) => pubsub.asyncIterator([TOPICS.GEMINI_RESPONSE_RECEIVED]),
            resolve: (payload, { userId }) => {
                if (payload.userId === userId) {
                    return payload.geminiResponse;
                }
                return null;
            }
        },
        externalServiceEvent: {
            subscribe: () => pubsub.asyncIterator([TOPICS.EXTERNAL_SERVICE_CALL]),
            resolve: (payload) => payload,
        },
    },
    User: {
        externalServiceIntegrations: async (parent) => {
            return await Integration.find({ user: parent.id });
        }
    },
    Project: {
        owner: async (parent) => {
            return await User.findById(parent.owner);
        },
        members: async (parent) => {
            return await User.find({ _id: { $in: parent.members } });
        }
    },
    Integration: {
        user: async (parent) => {
            return await User.findById(parent.user);
        },
        project: async (parent) => {
            if (parent.project) {
                return await Project.findById(parent.project);
            }
            return null;
        }
    }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const loggingMiddleware = async (resolve, root, args, context, info) => {
    logger.debug(`GraphQL Operation: ${info.operation.operationName} - Field: ${info.fieldName}`);
    const result = await resolve(root, args, context, info);
    logger.debug(`GraphQL Result for ${info.fieldName}: ${JSON.stringify(result).substring(0, 200)}...`);
    return result;
};

const permissionsMiddleware = async (resolve, root, args, context, info) => {
    return resolve(root, args, context, info);
};

const schemaWithMiddleware = applyMiddleware(
    schema,
    loggingMiddleware,
    permissionsMiddleware
);

// --- Apollo Server Setup ---
const apolloServer = new ApolloServer({
    schema: schemaWithMiddleware,
    context: async ({ req, connection }) => {
        if (connection) {
            return connection.context;
        }

        let user = null;
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
        if (token) {
            try {
                const decoded = jwt.verify(token, config.jwtSecret);
                user = await User.findById(decoded.id);
            } catch (err) {
                logger.warn('Invalid or expired JWT token:', err.message);
            }
        }
        return {
            user,
            logger,
            geminiService,
            externalServiceManager,
            pubsub,
            TOPICS,
        };
    },
    subscriptions: {
        onConnect: async (connectionParams, webSocket, context) => {
            let user = null;
            if (connectionParams.authorization) {
                try {
                    const token = connectionParams.authorization.split(' ')[1];
                    const decoded = jwt.verify(token, config.jwtSecret);
                    user = await User.findById(decoded.id);
                } catch (err) {
                    logger.warn('Invalid or expired JWT token for subscription:', err.message);
                }
            }
            return {
                user,
                logger,
                geminiService,
                externalServiceManager,
                pubsub,
                TOPICS,
            };
        },
        path: '/subscriptions',
    },
    formatError: (error) => {
        logger.error('GraphQL Error:', error);
        if (config.env === 'production' && !error.extensions.code) {
            return new GraphQLError('An internal server error occurred.', {
                extensions: { code: 'INTERNAL_SERVER_ERROR' },
            });
        }
        return error;
    },
    plugins: [
        {
            requestDidStart(requestContext) {
                logger.info(`GraphQL Request: ${requestContext.request.operationName || 'Anonymous Operation'}`);
                return {
                    didEncounterErrors(requestContext) {},
                    willSendResponse(requestContext) {
                        logger.debug(`GraphQL Response Sent for ${requestContext.request.operationName || 'Anonymous Operation'}`);
                    }
                };
            }
        }
    ],
});

// --- Express App Setup ---
const app = express();

app.use(helmet());
app.use(cors({
    origin: config.env === 'development' ? '*' : ['https://your-frontend-domain.com', 'https://another-approved-domain.com'],
    credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(pino);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/graphql', apiLimiter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), database: mongoose.connection.readyState });
});

app.post('/webhook/dialogflow', (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });

    function welcome(agent) {
        agent.add(`Welcome to the Gemini-powered Super App! How can I help you today?`);
    }

    async function handleGeminiQuery(agent) {
        const query = agent.parameters.query;
        try {
            const geminiRes = await geminiService.generateText(query, 'dialogflow-user-123'); // Example user ID
            if (geminiRes.error) {
                agent.add(`Sorry, I couldn't process that with Gemini: ${geminiRes.error}`);
            } else {
                agent.add(`Gemini says: ${geminiRes.text}`);
            }
        } catch (err) {
            logger.error('Dialogflow webhook Gemini integration error:', err);
            agent.add('I encountered an error trying to talk to Gemini.');
        }
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('GeminiQueryIntent', handleGeminiQuery);
    agent.handleRequest(intentMap);
});


async function startServer() {
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    const httpServer = http.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);

    await connectDb();

    httpServer.listen(config.port, () => {
        logger.info(`🚀 Server ready at http://localhost:${config.port}${apolloServer.graphqlPath}`);
        logger.info(`🚀 Subscriptions ready at ws://localhost:${config.port}${apolloServer.subscriptionsPath}`);
        logger.info(`Environment: ${config.env}`);
    });
}

startServer().catch(err => {
    logger.error('Failed to start server:', err);
    process.exit(1);
});

process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    await apolloServer.stop();
    await mongoose.disconnect();
    logger.info('MongoDB disconnected.');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});