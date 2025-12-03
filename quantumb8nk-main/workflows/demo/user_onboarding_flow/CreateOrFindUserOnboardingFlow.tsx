import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";

// --- Global Type Definitions ---
interface UserProfile {
  id: string;
  email: string;
  name: string;
  roles: string[];
  organizationId?: string;
  preferences: Record<string, any>;
}

interface Organization {
  id: string;
  name: string;
  settings: Record<string, any>;
  billingPlan: string;
}

interface LifecycleFlow {
  id: string;
  name: string;
  type: 'onboarding' | 'offboarding' | 'training' | 'compliance';
  steps: FlowStep[];
  isActive: boolean;
  targetAudience: 'user' | 'employee' | 'customer' | 'partner';
  createdAt: string;
  updatedAt: string;
}

interface FlowStep {
  id: string;
  name: string;
  description?: string;
  moduleIds: string[]; // References to content modules
  isSkippable: boolean;
  requiresApproval: boolean;
  automationTrigger?: { service: string; action: string; payload: Record<string, any> };
  dueDateOffset?: string; // e.g., "7 days", "1 month"
}

interface ContentModule {
  id: string;
  title: string;
  type: 'document' | 'video' | 'quiz' | 'form' | 'ai-generated';
  contentUrl?: string; // For documents/videos
  markdownContent?: string; // For AI-generated or simple text
  quizQuestions?: any[];
  formSchema?: any;
  createdBy: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  link?: string;
}

// --- Environment Variables (Representing Secrets Manager Integration) ---
// These environment variables would be securely loaded at runtime, e.g., from AWS Secrets Manager, GCP Secret Manager, Azure Key Vault.
// For this client-side context, they are accessed via process.env.
const ENV = {
  // Core AI Services
  GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || "dummy_gemini_key",
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || "dummy_openai_key",
  COHERE_API_KEY: process.env.REACT_APP_COHERE_API_KEY || "dummy_cohere_key",
  HUGGINGFACE_API_TOKEN: process.env.REACT_APP_HUGGINGFACE_API_TOKEN || "dummy_hf_token",

  // Authentication & IAM
  AUTH0_DOMAIN: process.env.REACT_APP_AUTH0_DOMAIN || "dummy-auth0.com",
  AUTH0_CLIENT_ID: process.env.REACT_APP_AUTH0_CLIENT_ID || "dummy_auth0_client_id",
  OKTA_ORG_URL: process.env.REACT_APP_OKTA_ORG_URL || "dummy-okta.com",
  OKTA_CLIENT_ID: process.env.REACT_APP_OKTA_CLIENT_ID || "dummy_okta_client_id",
  AWS_COGNITO_USER_POOL_ID: process.env.REACT_APP_AWS_COGNITO_USER_POOL_ID || "dummy_cognito_pool_id",
  AWS_COGNITO_CLIENT_ID: process.env.REACT_APP_AWS_COGNITO_CLIENT_ID || "dummy_cognito_client_id",
  FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY || "dummy_firebase_key",
  FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "dummy-firebase.com",
  FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID || "dummy-firebase-project",

  // Payment & Billing
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_dummy",
  STRIPE_SECRET_KEY: process.env.REACT_APP_STRIPE_SECRET_KEY || "sk_test_dummy",
  PAYPAL_CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID || "dummy_paypal_client",
  PAYPAL_SECRET: process.env.REACT_APP_PAYPAL_SECRET || "dummy_paypal_secret",
  BRAINTREE_MERCHANT_ID: process.env.REACT_APP_BRAINTREE_MERCHANT_ID || "dummy_braintree_mid",
  BRAINTREE_PUBLIC_KEY: process.env.REACT_APP_BRAINTREE_PUBLIC_KEY || "dummy_braintree_pk",
  PADDLE_VENDOR_ID: process.env.REACT_APP_PADDLE_VENDOR_ID || "dummy_paddle_vid",
  PADDLE_AUTH_CODE: process.env.REACT_APP_PADDLE_AUTH_CODE || "dummy_paddle_auth",

  // Communication & Messaging
  TWILIO_ACCOUNT_SID: process.env.REACT_APP_TWILIO_ACCOUNT_SID || "dummy_twilio_sid",
  TWILIO_AUTH_TOKEN: process.env.REACT_APP_TWILIO_AUTH_TOKEN || "dummy_twilio_token",
  SENDGRID_API_KEY: process.env.REACT_APP_SENDGRID_API_KEY || "dummy_sendgrid_key",
  MAILGUN_API_KEY: process.env.REACT_APP_MAILGUN_API_KEY || "dummy_mailgun_key",
  MAILGUN_DOMAIN: process.env.REACT_APP_MAILGUN_DOMAIN || "dummy-mailgun.com",
  AWS_SES_REGION: process.env.REACT_APP_AWS_SES_REGION || "us-east-1",
  AWS_SES_ACCESS_KEY_ID: process.env.REACT_APP_AWS_SES_ACCESS_KEY_ID || "dummy_aws_ses_id",
  AWS_SES_SECRET_ACCESS_KEY: process.env.REACT_APP_AWS_SES_SECRET_ACCESS_KEY || "dummy_aws_ses_key",
  SLACK_WEBHOOK_URL: process.env.REACT_APP_SLACK_WEBHOOK_URL || "dummy_slack_webhook",
  MS_TEAMS_WEBHOOK_URL: process.env.REACT_APP_MS_TEAMS_WEBHOOK_URL || "dummy_teams_webhook",
  ZOOM_API_KEY: process.env.REACT_APP_ZOOM_API_KEY || "dummy_zoom_key",
  ZOOM_API_SECRET: process.env.REACT_APP_ZOOM_API_SECRET || "dummy_zoom_secret",
  GOOGLE_MEET_API_KEY: process.env.REACT_APP_GOOGLE_MEET_API_KEY || "dummy_google_meet_key",

  // Storage & CDN
  AWS_S3_BUCKET_NAME: process.env.REACT_APP_AWS_S3_BUCKET_NAME || "dummy-s3-bucket",
  AWS_S3_REGION: process.env.REACT_APP_AWS_S3_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.REACT_APP_AWS_ACCESS_KEY_ID || "dummy_aws_access_id",
  AWS_SECRET_ACCESS_KEY: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "dummy_aws_secret_key",
  GCP_STORAGE_BUCKET_NAME: process.env.REACT_APP_GCP_STORAGE_BUCKET_NAME || "dummy-gcp-bucket",
  GCP_PROJECT_ID: process.env.REACT_APP_GCP_PROJECT_ID || "dummy-gcp-project",
  GCP_CLIENT_EMAIL: process.env.REACT_APP_GCP_CLIENT_EMAIL || "dummy@gcp.com",
  GCP_PRIVATE_KEY: process.env.REACT_APP_GCP_PRIVATE_KEY || "dummy_gcp_key",
  CLOUDINARY_CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dummy_cloud_name",
  CLOUDINARY_API_KEY: process.env.REACT_APP_CLOUDINARY_API_KEY || "dummy_cloudinary_key",
  CLOUDINARY_API_SECRET: process.env.REACT_APP_CLOUDINARY_API_SECRET || "dummy_cloudinary_secret",
  CLOUDFLARE_API_TOKEN: process.env.REACT_APP_CLOUDFLARE_API_TOKEN || "dummy_cf_token",
  AKAMAI_API_KEY: process.env.REACT_APP_AKAMAI_API_KEY || "dummy_akamai_key",

  // Database & Caching (Backend-only, but represented here for completeness)
  POSTGRES_HOST: process.env.REACT_APP_POSTGRES_HOST || "dummy_pg_host",
  POSTGRES_PORT: process.env.REACT_APP_POSTGRES_PORT || "5432",
  POSTGRES_USER: process.env.REACT_APP_POSTGRES_USER || "dummy_pg_user",
  POSTGRES_PASSWORD: process.env.REACT_APP_POSTGRES_PASSWORD || "dummy_pg_pass",
  POSTGRES_DATABASE: process.env.REACT_APP_POSTGRES_DATABASE || "dummy_pg_db",
  MONGODB_URI: process.env.REACT_APP_MONGODB_URI || "mongodb://dummy_mongo_uri",
  REDIS_HOST: process.env.REACT_APP_REDIS_HOST || "dummy_redis_host",
  REDIS_PORT: process.env.REACT_APP_REDIS_PORT || "6379",
  REDIS_PASSWORD: process.env.REACT_APP_REDIS_PASSWORD || "dummy_redis_pass",

  // CRM, ERP, HRIS
  SALESFORCE_CLIENT_ID: process.env.REACT_APP_SALESFORCE_CLIENT_ID || "dummy_sf_client_id",
  SALESFORCE_CLIENT_SECRET: process.env.REACT_APP_SALESFORCE_CLIENT_SECRET || "dummy_sf_client_secret",
  HUBSPOT_API_KEY: process.env.REACT_APP_HUBSPOT_API_KEY || "dummy_hs_key",
  SAP_API_KEY: process.env.REACT_APP_SAP_API_KEY || "dummy_sap_key",
  WORKDAY_API_KEY: process.env.REACT_APP_WORKDAY_API_KEY || "dummy_workday_key",
  GREENHOUSE_API_KEY: process.env.REACT_APP_GREENHOUSE_API_KEY || "dummy_greenhouse_key",

  // Analytics & Monitoring
  GOOGLE_ANALYTICS_TRACKING_ID: process.env.REACT_APP_GOOGLE_ANALYTICS_TRACKING_ID || "UA-dummy",
  AMPLITUDE_API_KEY: process.env.REACT_APP_AMPLITUDE_API_KEY || "dummy_amplitude_key",
  MIXPANEL_TOKEN: process.env.REACT_APP_MIXPANEL_TOKEN || "dummy_mixpanel_token",
  DATADOG_CLIENT_TOKEN: process.env.REACT_APP_DATADOG_CLIENT_TOKEN || "dummy_datadog_token",
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || "https://dummy@sentry.io/dummy",
  LOGROCKET_API_KEY: process.env.REACT_APP_LOGROCKET_API_KEY || "dummy_logrocket_key",
  SEGMENT_WRITE_KEY: process.env.REACT_APP_SEGMENT_WRITE_KEY || "dummy_segment_key",
  PROMETHEUS_ENDPOINT: process.env.REACT_APP_PROMETHEUS_ENDPOINT || "dummy_prometheus_url",
  GRAFANA_ENDPOINT: process.env.REACT_APP_GRAFANA_ENDPOINT || "dummy_grafana_url",

  // Document Management & E-Signature
  DOCUSIGN_CLIENT_ID: process.env.REACT_APP_DOCUSIGN_CLIENT_ID || "dummy_ds_client_id",
  DOCUSIGN_CLIENT_SECRET: process.env.REACT_APP_DOCUSIGN_CLIENT_SECRET || "dummy_ds_client_secret",
  PANDADOC_API_KEY: process.env.REACT_APP_PANDADOC_API_KEY || "dummy_pd_key",

  // Workflow & Automation
  ZAPIER_WEBHOOK_URL: process.env.REACT_APP_ZAPIER_WEBHOOK_URL || "dummy_zapier_url",
  MAKE_WEBHOOK_URL: process.env.REACT_APP_MAKE_WEBHOOK_URL || "dummy_make_url",
  TEMPORAL_GRPC_ENDPOINT: process.env.REACT_APP_TEMPORAL_GRPC_ENDPOINT || "dummy_temporal_endpoint",

  // Search
  ALGOLIA_APP_ID: process.env.REACT_APP_ALGOLIA_APP_ID || "dummy_algolia_id",
  ALGOLIA_SEARCH_API_KEY: process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY || "dummy_algolia_key",
  ELASTICSEARCH_HOST: process.env.REACT_APP_ELASTICSEARCH_HOST || "dummy_es_host",

  // Marketing Automation
  ACTIVECAMPAIGN_API_KEY: process.env.REACT_APP_ACTIVECAMPAIGN_API_KEY || "dummy_ac_key",
  ACTIVECAMPAIGN_URL: process.env.REACT_APP_ACTIVECAMPAIGN_URL || "dummy-ac.com",
  BRAZE_API_KEY: process.env.REACT_APP_BRAZE_API_KEY || "dummy_braze_key",
  BRAZE_ENDPOINT: process.env.REACT_APP_BRAZE_ENDPOINT || "dummy-braze.com",

  // Backend as a Service (BaaS) / GraphQL
  HASURA_GRAPHQL_ENDPOINT: process.env.REACT_APP_HASURA_GRAPHQL_ENDPOINT || "dummy_hasura_url",
  HASURA_ADMIN_SECRET: process.env.REACT_APP_HASURA_ADMIN_SECRET || "dummy_hasura_secret",
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || "dummy_supabase_url",
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || "dummy_supabase_key",

  // General Utility APIs
  RECAPTCHA_SITE_KEY: process.env.REACT_APP_RECAPTCHA_SITE_KEY || "dummy_recaptcha_key",
  GEOLOCATION_API_KEY: process.env.REACT_APP_GEOLOCATION_API_KEY || "dummy_geo_key",
  MAPBOX_ACCESS_TOKEN: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "dummy_mapbox_token",
  HERE_MAPS_API_KEY: process.env.REACT_APP_HERE_MAPS_API_KEY || "dummy_here_key",
  WEATHER_API_KEY: process.env.REACT_APP_WEATHER_API_KEY || "dummy_weather_key",
  EXCHANGE_RATE_API_KEY: process.env.REACT_APP_EXCHANGE_RATE_API_KEY || "dummy_exchange_key",
  TIMEZONE_API_KEY: process.env.REACT_APP_TIMEZONE_API_KEY || "dummy_timezone_key",
  STOCK_API_KEY: process.env.REACT_APP_STOCK_API_KEY || "dummy_stock_key",
  NEWS_API_KEY: process.env.REACT_APP_NEWS_API_KEY || "dummy_news_key",
  NUTRITION_API_KEY: process.env.REACT_APP_NUTRITION_API_KEY || "dummy_nutrition_key",
  TRANSLATION_API_KEY: process.env.REACT_APP_TRANSLATION_API_KEY || "dummy_translation_key",
  QR_CODE_API_KEY: process.env.REACT_APP_QR_CODE_API_KEY || "dummy_qrcode_key",
  BARCODE_API_KEY: process.env.REACT_APP_BARCODE_API_KEY || "dummy_barcode_key",
  FILE_CONVERSION_API_KEY: process.env.REACT_APP_FILE_CONVERSION_API_KEY || "dummy_fileconv_key",
  PDF_GENERATION_API_KEY: process.env.REACT_APP_PDF_GENERATION_API_KEY || "dummy_pdfgen_key",
  CAPTCHA_SERVICE_KEY: process.env.REACT_APP_CAPTCHA_SERVICE_KEY || "dummy_captcha_key",
  DATA_ENRICHMENT_API_KEY: process.env.REACT_APP_DATA_ENRICHMENT_API_KEY || "dummy_dataenrich_key",
  LEAD_GENERATION_API_KEY: process.env.REACT_APP_LEAD_GENERATION_API_KEY || "dummy_leadgen_key",
  SMS_GATEWAY_API_KEY: process.env.REACT_APP_SMS_GATEWAY_API_KEY || "dummy_smsgw_key",
  VOICE_GATEWAY_API_KEY: process.env.REACT_APP_VOICE_GATEWAY_API_KEY || "dummy_voicegw_key",
  VIDEO_TRANSCODING_API_KEY: process.env.REACT_APP_VIDEO_TRANSCODING_API_KEY || "dummy_video_key",
  IMAGE_OPTIMIZATION_API_KEY: process.env.REACT_APP_IMAGE_OPTIMIZATION_API_KEY || "dummy_imageopt_key",
  CDN_PROVISIONING_API_KEY: process.env.REACT_APP_CDN_PROVISIONING_API_KEY || "dummy_cdnprov_key",
  WEB_SCRAPING_API_KEY: process.env.REACT_APP_WEB_SCRAPING_API_KEY || "dummy_webscrape_key",
  ESIGNATURE_PROVIDER_URL: process.env.REACT_APP_ESIGNATURE_PROVIDER_URL || "https://dummy-esign.com",
  BLOCKCHAIN_INTEGRATION_ENDPOINT: process.env.REACT_APP_BLOCKCHAIN_INTEGRATION_ENDPOINT || "https://dummy-blockchain.com",
  IOT_PLATFORM_API_KEY: process.env.REACT_APP_IOT_PLATFORM_API_KEY || "dummy_iot_key",
  AR_VR_SDK_KEY: process.env.REACT_APP_AR_VR_SDK_KEY || "dummy_arvr_key",
  BIOMETRIC_AUTH_SERVICE_KEY: process.env.REACT_APP_BIOMETRIC_AUTH_SERVICE_KEY || "dummy_biometric_key",
  
  // DevOps/Infrastructure (Internal use, mostly backend)
  KUBERNETES_API_SERVER: process.env.REACT_APP_KUBERNETES_API_SERVER || "https://dummy-k8s-api.com",
  KUBERNETES_SA_TOKEN: process.env.REACT_APP_KUBERNETES_SA_TOKEN || "dummy_k8s_token",
  TERRAFORM_CLOUD_TOKEN: process.env.REACT_APP_TERRAFORM_CLOUD_TOKEN || "dummy_tf_token",
  GITHUB_TOKEN: process.env.REACT_APP_GITHUB_TOKEN || "dummy_github_token",
  GITLAB_TOKEN: process.env.REACT_APP_GITLAB_TOKEN || "dummy_gitlab_token",
  CIRCLECI_API_TOKEN: process.env.REACT_APP_CIRCLECI_API_TOKEN || "dummy_circleci_token",
  AWS_KMS_KEY_ID: process.env.REACT_APP_AWS_KMS_KEY_ID || "dummy_aws_kms_id",
  GCP_KMS_KEY_ID: process.env.REACT_APP_GCP_KMS_KEY_ID || "dummy_gcp_kms_id",
  AZURE_KEY_VAULT_URL: process.env.REACT_APP_AZURE_KEY_VAULT_URL || "https://dummy-keyvault.vault.azure.net",
  SNYK_API_KEY: process.env.REACT_APP_SNYK_API_KEY || "dummy_snyk_key",
  MEND_API_KEY: process.env.REACT_APP_MEND_API_KEY || "dummy_mend_key",
};

// --- Service Integrations (Conceptual Implementations) ---

// AI Services
interface GeminiAIServiceInstance {
  generateContent(prompt: string): Promise<string>;
  analyzeSentiment(text: string): Promise<string>;
  summarize(text: string): Promise<string>;
  chat(messages: { role: 'user' | 'model'; content: string }[]): Promise<string>;
  visionAnalyze(imageUrl: string, prompt: string): Promise<string>;
}
class GeminiAIService implements GeminiAIServiceInstance {
  constructor(private apiKey: string) {
    console.log(`GeminiAIService initialized with API Key: ${this.apiKey.substring(0, 5)}...`);
  }
  async generateContent(prompt: string) {
    console.log(`[Gemini] Generating content for: "${prompt}"`);
    return `AI-generated content for "${prompt}"`;
  }
  async analyzeSentiment(text: string) {
    console.log(`[Gemini] Analyzing sentiment for: "${text}"`);
    return "Positive";
  }
  async summarize(text: string) {
    console.log(`[Gemini] Summarizing: "${text}"`);
    return `Summary of: "${text}"`;
  }
  async chat(messages: { role: 'user' | 'model'; content: string }[]) {
    console.log(`[Gemini] Chat interaction with ${messages.length} messages.`);
    const lastMessage = messages[messages.length - 1]?.content || '';
    return `AI response to: "${lastMessage}"`;
  }
  async visionAnalyze(imageUrl: string, prompt: string) {
    console.log(`[Gemini] Analyzing image ${imageUrl} with prompt "${prompt}"`);
    return `Analysis of image content related to "${prompt}"`;
  }
}

interface OpenAIServiceInstance {
  generateText(prompt: string, model: string): Promise<string>;
  createImage(description: string): Promise<string>;
}
class OpenAIService implements OpenAIServiceInstance {
  constructor(private apiKey: string) {
    console.log(`OpenAIService initialized with API Key: ${this.apiKey.substring(0, 5)}...`);
  }
  async generateText(prompt: string, model: string) {
    console.log(`[OpenAI] Generating text with ${model} for: "${prompt}"`);
    return `OpenAI-generated text for "${prompt}"`;
  }
  async createImage(description: string) {
    console.log(`[OpenAI] Creating image for: "${description}"`);
    return `https://dummy-image-url.com/${encodeURIComponent(description)}.png`;
  }
}

// Authentication Service
interface AuthServiceInstance {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login(provider: 'auth0' | 'okta' | 'cognito' | 'firebase'): Promise<UserProfile>;
  logout(): void;
  getAccessToken(): Promise<string | null>;
  register(userData: any): Promise<UserProfile>;
}
class AuthService implements AuthServiceInstance {
  isAuthenticated: boolean = false;
  user: UserProfile | null = null;
  private accessToken: string | null = null;

  constructor(private configs: Record<string, string>) {
    console.log(`AuthService initialized with various providers. Auth0 domain: ${configs.AUTH0_DOMAIN}`);
    this.checkSession();
  }

  private async checkSession() {
    // In a real app, this would check localStorage/cookies/IDP for active session
    // For demo, we simulate a logged-in user if an "access token" exists in sessionStorage
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      this.isAuthenticated = true;
      this.accessToken = token;
      this.user = {
        id: 'user-123',
        email: 'demo@example.com',
        name: 'Demo User',
        roles: ['admin', 'flow_manager'],
        organizationId: 'org-abc',
        preferences: { theme: 'dark' }
      };
    }
  }

  async login(provider: 'auth0' | 'okta' | 'cognito' | 'firebase'): Promise<UserProfile> {
    console.log(`[AuthService] Attempting login via ${provider}`);
    // Simulate OAuth redirect and callback
    await new Promise(resolve => setTimeout(resolve, 500));
    this.isAuthenticated = true;
    this.accessToken = `fake_jwt_token_${Date.now()}`;
    sessionStorage.setItem('accessToken', this.accessToken);
    this.user = {
      id: `user-${Date.now()}`,
      email: `user${Date.now()}@${provider}.com`,
      name: `User via ${provider}`,
      roles: ['user'],
      organizationId: 'org-abc',
      preferences: {}
    };
    return this.user;
  }

  logout() {
    console.log(`[AuthService] Logging out.`);
    this.isAuthenticated = false;
    this.user = null;
    this.accessToken = null;
    sessionStorage.removeItem('accessToken');
    // In a real app, also clear IDP sessions
  }

  async getAccessToken() {
    return this.accessToken;
  }

  async register(userData: any): Promise<UserProfile> {
    console.log(`[AuthService] Registering user: ${userData.email}`);
    // Simulate user registration
    return {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name || userData.email,
      roles: ['user'],
      organizationId: 'org-abc',
      preferences: {}
    };
  }
}

// Payment Service
interface PaymentServiceInstance {
  createCheckoutSession(items: any[], currency: string): Promise<string>; // Returns session ID or URL
  getCustomerPortalLink(customerId: string): Promise<string>;
  processPayment(amount: number, token: string): Promise<any>;
}
class PaymentService implements PaymentServiceInstance {
  constructor(private configs: Record<string, string>) {
    console.log(`PaymentService (Stripe/PayPal) initialized. Stripe PK: ${configs.STRIPE_PUBLIC_KEY?.substring(0, 5)}...`);
  }
  async createCheckoutSession(items: any[], currency: string) {
    console.log(`[Payment] Creating checkout session for items: ${items.length} in ${currency}`);
    return `https://dummy-stripe.com/checkout/${Date.now()}`;
  }
  async getCustomerPortalLink(customerId: string) {
    console.log(`[Payment] Getting customer portal link for ${customerId}`);
    return `https://dummy-stripe.com/portal/${customerId}`;
  }
  async processPayment(amount: number, token: string) {
    console.log(`[Payment] Processing payment of ${amount} with token: ${token.substring(0, 10)}...`);
    return { success: true, transactionId: `txn_${Date.now()}` };
  }
}

// Communication Service
interface CommunicationServiceInstance {
  sendEmail(to: string, subject: string, body: string, templateId?: string): Promise<any>;
  sendSMS(to: string, message: string): Promise<any>;
  sendSlackNotification(channel: string, message: string): Promise<any>;
  scheduleMeeting(participants: string[], topic: string, startTime: Date, durationMinutes: number): Promise<any>;
}
class CommunicationService implements CommunicationServiceInstance {
  constructor(private configs: Record<string, string>) {
    console.log(`CommunicationService (Twilio/SendGrid/Slack) initialized.`);
  }
  async sendEmail(to: string, subject: string, body: string, templateId?: string) {
    console.log(`[Email] Sending email to ${to} with subject "${subject}" (Template: ${templateId || 'None'})`);
    return { success: true, messageId: `email_${Date.now()}` };
  }
  async sendSMS(to: string, message: string) {
    console.log(`[SMS] Sending SMS to ${to}: "${message}"`);
    return { success: true, sid: `sms_${Date.now()}` };
  }
  async sendSlackNotification(channel: string, message: string) {
    console.log(`[Slack] Sending message to ${channel}: "${message}"`);
    return { success: true };
  }
  async scheduleMeeting(participants: string[], topic: string, startTime: Date, durationMinutes: number) {
    console.log(`[Meeting] Scheduling Zoom/Meet meeting for ${topic} at ${startTime.toISOString()} for ${durationMinutes} mins`);
    return { success: true, meetingId: `mtg_${Date.now()}`, joinUrl: `https://zoom.us/j/dummy_${Date.now()}` };
  }
}

// Storage Service
interface StorageServiceInstance {
  uploadFile(file: File, path: string, options?: any): Promise<string>; // Returns URL
  deleteFile(url: string): Promise<void>;
  listFilesInPath(path: string): Promise<string[]>;
  getImageTransformationUrl(url: string, transformations: Record<string, any>): string;
}
class StorageService implements StorageServiceInstance {
  constructor(private configs: Record<string, string>) {
    console.log(`StorageService (S3/Cloudinary) initialized. S3 Bucket: ${configs.AWS_S3_BUCKET_NAME}`);
  }
  async uploadFile(file: File, path: string, options?: any) {
    console.log(`[Storage] Uploading file "${file.name}" to "${path}"`);
    return `https://dummy-s3-bucket.s3.amazonaws.com/${path}/${file.name}`;
  }
  async deleteFile(url: string) {
    console.log(`[Storage] Deleting file at "${url}"`);
  }
  async listFilesInPath(path: string) {
    console.log(`[Storage] Listing files in "${path}"`);
    return [`file1.pdf`, `file2.jpg`];
  }
  getImageTransformationUrl(url: string, transformations: Record<string, any>): string {
    console.log(`[Cloudinary] Transforming image ${url} with ${JSON.stringify(transformations)}`);
    return `https://res.cloudinary.com/${this.configs.CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill/${url.split('/').pop()}`;
  }
}

// CRM/HRIS Service (Simplified)
interface CrmHrisServiceInstance {
  createContact(data: any): Promise<any>;
  updateUserRecord(userId: string, data: any): Promise<any>;
  syncFlowProgress(userId: string, flowId: string, progress: number): Promise<any>;
}
class CrmHrisService implements CrmHrisServiceInstance {
  constructor(private configs: Record<string, string>) {
    console.log(`CrmHrisService (Salesforce/Workday) initialized. Salesforce Client ID: ${configs.SALESFORCE_CLIENT_ID?.substring(0, 5)}...`);
  }
  async createContact(data: any) {
    console.log(`[CRM] Creating contact: ${data.email}`);
    return { id: `crm_contact_${Date.now()}`, ...data };
  }
  async updateUserRecord(userId: string, data: any) {
    console.log(`[HRIS] Updating user record for ${userId}: ${JSON.stringify(data)}`);
    return { id: userId, ...data };
  }
  async syncFlowProgress(userId: string, flowId: string, progress: number) {
    console.log(`[CRM/HRIS] Syncing flow ${flowId} progress for user ${userId}: ${progress}%`);
    return { success: true };
  }
}

// Analytics Service
interface AnalyticsServiceInstance {
  trackEvent(eventName: string, properties?: Record<string, any>): void;
  identifyUser(userId: string, traits?: Record<string, any>): void;
  pageView(pageName: string, properties?: Record<string, any>): void;
}
class AnalyticsService implements AnalyticsServiceInstance {
  constructor(private configs: Record<string, string>) {
    console.log(`AnalyticsService (GA/Amplitude/Sentry) initialized. GA ID: ${configs.GOOGLE_ANALYTICS_TRACKING_ID}`);
  }
  trackEvent(eventName: string, properties?: Record<string, any>) {
    console.log(`[Analytics] Track event: ${eventName}, Props: ${JSON.stringify(properties)}`);
  }
  identifyUser(userId: string, traits?: Record<string, any>) {
    console.log(`[Analytics] Identify user: ${userId}, Traits: ${JSON.stringify(traits)}`);
  }
  pageView(pageName: string, properties?: Record<string, any>) {
    console.log(`[Analytics] Page view: ${pageName}, Props: ${JSON.stringify(properties)}`);
  }
}

// Document & E-Signature Service
interface DocumentServiceInstance {
  createDocumentFromTemplate(templateId: string, data: Record<string, any>): Promise<string>; // Returns document URL
  requestSignature(documentUrl: string, signers: { email: string; name: string }[]): Promise<string>; // Returns signing URL
  checkSignatureStatus(signatureRequestId: string): Promise<string>;
}
class DocumentService implements DocumentServiceInstance {
  constructor(private configs: Record<string, string>) {
    console.log(`DocumentService (DocuSign/PandaDoc) initialized. DocuSign Client ID: ${configs.DOCUSIGN_CLIENT_ID?.substring(0, 5)}...`);
  }
  async createDocumentFromTemplate(templateId: string, data: Record<string, any>) {
    console.log(`[Doc/E-Sign] Creating document from template ${templateId} with data.`);
    return `https://dummy-doc.com/doc_${Date.now()}.pdf`;
  }
  async requestSignature(documentUrl: string, signers: { email: string; name: string }[]) {
    console.log(`[Doc/E-Sign] Requesting signature for ${documentUrl} from ${signers.map(s => s.name).join(', ')}`);
    return `https://dummy-esign.com/sign/${Date.now()}`;
  }
  async checkSignatureStatus(signatureRequestId: string) {
    console.log(`[Doc/E-Sign] Checking status for ${signatureRequestId}`);
    return 'Pending'; // 'Pending', 'Completed', 'Declined'
  }
}

// Workflow Automation Service
interface WorkflowServiceInstance {
  triggerAutomation(triggerName: string, payload: Record<string, any>): Promise<any>;
  scheduleTask(taskName: string, data: Record<string, any>, cronSchedule: string): Promise<any>;
}
class WorkflowService implements WorkflowServiceInstance {
  constructor(private configs: Record<string, string>) {
    console.log(`WorkflowService (Zapier/Make/Temporal) initialized. Zapier Webhook: ${configs.ZAPIER_WEBHOOK_URL?.substring(0, 20)}...`);
  }
  async triggerAutomation(triggerName: string, payload: Record<string, any>) {
    console.log(`[Workflow] Triggering automation "${triggerName}" with payload: ${JSON.stringify(payload)}`);
    return { success: true, jobId: `wf_${Date.now()}` };
  }
  async scheduleTask(taskName: string, data: Record<string, any>, cronSchedule: string) {
    console.log(`[Workflow] Scheduling task "${taskName}" for ${cronSchedule} with data.`);
    return { success: true, taskId: `task_${Date.now()}` };
  }
}

// Search Service
interface SearchServiceInstance {
  indexDocument(index: string, document: any): Promise<any>;
  search(index: string, query: string, options?: any): Promise<any[]>;
}
class SearchService implements SearchServiceInstance {
  constructor(private configs: Record<string, string>) {
    console.log(`SearchService (Algolia/Elasticsearch) initialized. Algolia App ID: ${configs.ALGOLIA_APP_ID}`);
  }
  async indexDocument(index: string, document: any) {
    console.log(`[Search] Indexing document in "${index}": ${JSON.stringify(document.id)}`);
    return { success: true };
  }
  async search(index: string, query: string, options?: any) {
    console.log(`[Search] Searching "${index}" for "${query}"`);
    return [{ id: 'doc-1', title: `Result for ${query}` }];
  }
}

// Mock Database/API Layer
// In a real app, this would be actual API calls to a GraphQL (Hasura) or REST backend.
const MOCK_DB = {
  users: new Map<string, UserProfile>(),
  organizations: new Map<string, Organization>(),
  lifecycleFlows: new Map<string, LifecycleFlow>(),
  contentModules: new Map<string, ContentModule>(),
  notifications: new Map<string, Notification>(),
};

MOCK_DB.users.set('user-123', {
  id: 'user-123',
  email: 'admin@example.com',
  name: 'Admin User',
  roles: ['admin', 'flow_manager', 'content_creator'],
  organizationId: 'org-abc',
  preferences: { theme: 'dark', notifications: true }
});

MOCK_DB.organizations.set('org-abc', {
  id: 'org-abc',
  name: 'Acme Corp',
  settings: { customBranding: true },
  billingPlan: 'enterprise'
});

MOCK_DB.contentModules.set('mod-1', {
  id: 'mod-1',
  title: 'Welcome Video',
  type: 'video',
  contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  createdBy: 'user-123',
  createdAt: new Date().toISOString()
});

MOCK_DB.contentModules.set('mod-2', {
  id: 'mod-2',
  title: 'Company Policy Document',
  type: 'document',
  contentUrl: 'https://dummy-s3-bucket.s3.amazonaws.com/policies/company-policy.pdf',
  createdBy: 'user-123',
  createdAt: new Date().toISOString()
});

MOCK_DB.lifecycleFlows.set('flow-onboarding-employee', {
  id: 'flow-onboarding-employee',
  name: 'Employee Onboarding Flow',
  type: 'onboarding',
  steps: [
    { id: 'step-1', name: 'Watch Welcome Video', moduleIds: ['mod-1'], isSkippable: false, requiresApproval: false },
    { id: 'step-2', name: 'Read Company Policy', moduleIds: ['mod-2'], isSkippable: false, requiresApproval: false, automationTrigger: { service: 'DocumentService', action: 'requestSignature', payload: { documentUrl: 'https://dummy-doc.com/policy-sign.pdf', type: 'employee' } } },
  ],
  isActive: true,
  targetAudience: 'employee',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

class APIService {
  constructor(private authService: AuthServiceInstance) {
    console.log("APIService initialized.");
  }

  async get<T>(path: string): Promise<T> {
    console.log(`[API] Fetching ${path}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    if (!this.authService.isAuthenticated) throw new Error("Unauthorized");

    if (path.startsWith('/flows')) {
      return Array.from(MOCK_DB.lifecycleFlows.values()) as T;
    }
    if (path.startsWith('/content-modules')) {
      return Array.from(MOCK_DB.contentModules.values()) as T;
    }
    if (path.startsWith('/users')) {
      return Array.from(MOCK_DB.users.values()) as T;
    }
    if (path.startsWith('/notifications')) {
      const currentUser = this.authService.user;
      return Array.from(MOCK_DB.notifications.values()).filter(n => n.userId === currentUser?.id) as T;
    }
    throw new Error(`Not found: ${path}`);
  }

  async post<T>(path: string, data: any): Promise<T> {
    console.log(`[API] Posting to ${path} with data:`, data);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    if (!this.authService.isAuthenticated) throw new Error("Unauthorized");

    if (path === '/flows') {
      const newFlow: LifecycleFlow = {
        ...data,
        id: `flow-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_DB.lifecycleFlows.set(newFlow.id, newFlow);
      return newFlow as T;
    }
    if (path === '/content-modules') {
      const newModule: ContentModule = {
        ...data,
        id: `mod-${Date.now()}`,
        createdBy: this.authService.user?.id || 'system',
        createdAt: new Date().toISOString(),
      };
      MOCK_DB.contentModules.set(newModule.id, newModule);
      return newModule as T;
    }
    if (path === '/notifications') {
      const newNotification: Notification = {
        ...data,
        id: `notif-${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      MOCK_DB.notifications.set(newNotification.id, newNotification);
      return newNotification as T;
    }
    throw new Error(`Endpoint not supported: ${path}`);
  }

  async put<T>(path: string, data: any): Promise<T> {
    console.log(`[API] Putting to ${path} with data:`, data);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    if (!this.authService.isAuthenticated) throw new Error("Unauthorized");

    if (path.startsWith('/flows/')) {
      const id = path.split('/').pop();
      if (!id || !MOCK_DB.lifecycleFlows.has(id)) throw new Error("Flow not found");
      const updatedFlow = { ...MOCK_DB.lifecycleFlows.get(id), ...data, updatedAt: new Date().toISOString() };
      MOCK_DB.lifecycleFlows.set(id, updatedFlow);
      return updatedFlow as T;
    }
    throw new Error(`Endpoint not supported: ${path}`);
  }
}


// --- React Contexts for Dependency Injection and Global State ---

interface AppServices {
  gemini: GeminiAIServiceInstance;
  openai: OpenAIServiceInstance;
  auth: AuthServiceInstance;
  payment: PaymentServiceInstance;
  communication: CommunicationServiceInstance;
  storage: StorageServiceInstance;
  crmHris: CrmHrisServiceInstance;
  analytics: AnalyticsServiceInstance;
  document: DocumentServiceInstance;
  workflow: WorkflowServiceInstance;
  search: SearchServiceInstance;
  api: APIService; // Mock API service
  // ... potentially 90 more services grouped or individually
}

const ServicesContext = createContext<AppServices | undefined>(undefined);
const AuthContext = createContext<AuthServiceInstance | undefined>(undefined);

const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) throw new Error("useServices must be used within a ServicesProvider");
  return context;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- Core Application Components ---

const Header: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-teal-300">
        AI-Powered LifecycleFlow Platform
      </Link>
      <nav className="flex space-x-4">
        {auth.isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:text-teal-300">Dashboard</Link>
            <Link to="/flows" className="hover:text-teal-300">Flows</Link>
            <Link to="/content" className="hover:text-teal-300">Content</Link>
            <Link to="/users" className="hover:text-teal-300">Users</Link>
            <Link to="/ai-studio" className="hover:text-teal-300">AI Studio</Link>
            <Link to="/settings" className="hover:text-teal-300">Settings</Link>
            <button onClick={handleLogout} className="bg-teal-600 px-3 py-1 rounded hover:bg-teal-700">Logout</button>
            <span className="ml-4">Welcome, {auth.user?.name || 'Guest'}</span>
          </>
        ) : (
          <Link to="/login" className="bg-teal-600 px-3 py-1 rounded hover:bg-teal-700">Login</Link>
        )}
      </nav>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white p-4 text-center text-sm mt-8">
    &copy; {new Date().getFullYear()} AI-Powered LifecycleFlow Platform. All rights reserved.
    <br />
    Powered by Gemini AI and 100+ external integrations.
  </footer>
);

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [auth.isAuthenticated, navigate, location]);

  return auth.isAuthenticated ? <>{children}</> : null;
};

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (provider: 'auth0' | 'okta' | 'cognito' | 'firebase' = 'auth0') => {
    setError('');
    try {
      await auth.login(provider);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    // Simulate login with email/password, then use Auth0 provider
    await handleLogin('auth0');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="text-center text-gray-400 my-4">OR</div>
        <div className="space-y-2">
          <button
            onClick={() => handleLogin('auth0')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login with Auth0
          </button>
          <button
            onClick={() => handleLogin('okta')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Login with Okta
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { api, analytics, gemini } = useServices();
  const auth = useAuth();
  const [flows, setFlows] = useState<LifecycleFlow[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    analytics.pageView('Dashboard');
    const fetchData = async () => {
      try {
        const fetchedFlows = await api.get<LifecycleFlow[]>('/flows');
        setFlows(fetchedFlows);
        const fetchedNotifications = await api.get<Notification[]>('/notifications');
        setNotifications(fetchedNotifications.filter(n => !n.read));
        const insight = await gemini.generateContent("Provide a brief, encouraging AI insight for a busy platform administrator.");
        setAiInsight(insight);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchData();
  }, [api, analytics, gemini]);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-teal-300">Welcome, {auth.user?.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">AI Insight</h2>
          <p className="text-gray-300 italic">"{aiInsight}"</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">Active Flows</h2>
          <p className="text-4xl font-bold">{flows.filter(f => f.isActive).length}</p>
          <Link to="/flows" className="text-teal-400 hover:underline">View All Flows</Link>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">Unread Notifications</h2>
          <p className="text-4xl font-bold">{notifications.length}</p>
          <Link to="/notifications" className="text-teal-400 hover:underline">Manage Notifications</Link>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-teal-200">Recent Activity & Quick Links</h2>
        <ul className="space-y-2">
          <li><Link to="/flows/create" className="text-teal-400 hover:underline">Create New Lifecycle Flow</Link></li>
          <li><Link to="/content/create" className="text-teal-400 hover:underline">Add New Content Module</Link></li>
          <li><Link to="/users/onboard" className="text-teal-400 hover:underline">Onboard a New User/Employee</Link></li>
          <li><Link to="/ai-studio" className="text-teal-400 hover:underline">Generate Content with AI Studio</Link></li>
        </ul>
      </div>
    </div>
  );
};

interface CreateUserOnboardingFlowFormProps {
  onSuccess: (flow: LifecycleFlow) => void;
  initialFlow?: LifecycleFlow;
}

const CreateUserOnboardingFlowForm: React.FC<CreateUserOnboardingFlowFormProps> = ({ onSuccess, initialFlow }) => {
  const { api, gemini } = useServices();
  const [flowName, setFlowName] = useState(initialFlow?.name || '');
  const [flowType, setFlowType] = useState<LifecycleFlow['type']>(initialFlow?.type || 'onboarding');
  const [targetAudience, setTargetAudience] = useState<LifecycleFlow['targetAudience']>(initialFlow?.targetAudience || 'user');
  const [steps, setSteps] = useState<FlowStep[]>(initialFlow?.steps || [{ id: 'step-1', name: 'Initial Step', moduleIds: [], isSkippable: false, requiresApproval: false }]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [contentModules, setContentModules] = useState<ContentModule[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modules = await api.get<ContentModule[]>('/content-modules');
        setContentModules(modules);
      } catch (err) {
        console.error("Failed to fetch content modules", err);
      }
    };
    fetchModules();
  }, [api]);

  const generateAISuggestions = async () => {
    if (!flowName) return;
    try {
      const prompt = `Suggest 3 unique, engaging, and comprehensive lifecycle flow steps for a "${targetAudience}" "${flowType}" flow named "${flowName}". Each suggestion should be concise and relevant to a modern enterprise onboarding/training experience.`;
      const response = await gemini.generateContent(prompt);
      const suggestions = response.split('\n').filter(s => s.trim() !== '' && s.length > 5).map(s => s.replace(/^\d+\.\s*/, '').trim());
      setAiSuggestions(suggestions);
    } catch (err) {
      setError("Failed to generate AI suggestions. Please try again.");
      console.error("AI suggestion error:", err);
    }
  };

  const handleAddAISuggestion = (suggestion: string) => {
    const newStep: FlowStep = {
      id: `step-${Date.now()}`,
      name: suggestion,
      moduleIds: [],
      isSkippable: true,
      requiresApproval: false,
    };
    setSteps(prev => [...prev, newStep]);
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const handleStepChange = (index: number, field: keyof FlowStep, value: any) => {
    const newSteps = [...steps];
    (newSteps[index] as any)[field] = value;
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    setSteps(prev => [...prev, { id: `step-${Date.now()}`, name: '', moduleIds: [], isSkippable: false, requiresApproval: false }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowName || steps.some(step => !step.name)) {
      setError('Flow name and all step names are required.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const flowData = {
        name: flowName,
        type: flowType,
        targetAudience: targetAudience,
        steps: steps.map(({ id, name, description, moduleIds, isSkippable, requiresApproval, automationTrigger, dueDateOffset }) => ({
          id, name, description, moduleIds, isSkippable, requiresApproval, automationTrigger, dueDateOffset
        })),
        isActive: true,
      };

      let result: LifecycleFlow;
      if (initialFlow) {
        result = await api.put<LifecycleFlow>(`/flows/${initialFlow.id}`, flowData);
      } else {
        result = await api.post<LifecycleFlow>('/flows', flowData);
      }
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Failed to save flow.');
      console.error("Save flow error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-white mb-6 text-teal-200">{initialFlow ? 'Edit Lifecycle Flow' : 'Create New Lifecycle Flow'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="flowName" className="block text-gray-300 text-sm font-bold mb-2">Flow Name</label>
          <input
            type="text"
            id="flowName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4 flex space-x-4">
          <div className="flex-1">
            <label htmlFor="flowType" className="block text-gray-300 text-sm font-bold mb-2">Flow Type</label>
            <select
              id="flowType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              value={flowType}
              onChange={(e) => setFlowType(e.target.value as LifecycleFlow['type'])}
            >
              <option value="onboarding">Onboarding</option>
              <option value="offboarding">Offboarding</option>
              <option value="training">Training</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="targetAudience" className="block text-gray-300 text-sm font-bold mb-2">Target Audience</label>
            <select
              id="targetAudience"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as LifecycleFlow['targetAudience'])}
            >
              <option value="user">User</option>
              <option value="employee">Employee</option>
              <option value="customer">Customer</option>
              <option value="partner">Partner</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-teal-200 mb-4">Flow Steps</h3>
          {steps.map((step, index) => (
            <div key={step.id} className="bg-gray-700 p-4 rounded-lg mb-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-300 text-sm font-bold">Step {index + 1}</label>
                <button type="button" onClick={() => handleRemoveStep(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
              <input
                type="text"
                placeholder="Step Name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-2 bg-gray-600 border-gray-500 text-white"
                value={step.name}
                onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                required
              />
              <textarea
                placeholder="Step Description (optional)"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-2 bg-gray-600 border-gray-500 text-white"
                value={step.description || ''}
                onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                rows={2}
              ></textarea>
              <div className="mb-2">
                <label className="block text-gray-300 text-sm font-bold mb-1">Content Modules</label>
                <select
                  multiple
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-600 border-gray-500 text-white h-24"
                  value={step.moduleIds}
                  onChange={(e) => handleStepChange(index, 'moduleIds', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {contentModules.map(mod => (
                    <option key={mod.id} value={mod.id}>{mod.title} ({mod.type})</option>
                  ))}
                </select>
                <Link to="/content/create" className="text-teal-400 text-sm hover:underline mt-1 block">Create New Content Module</Link>
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`skippable-${step.id}`}
                  className="mr-2 leading-tight"
                  checked={step.isSkippable}
                  onChange={(e) => handleStepChange(index, 'isSkippable', e.target.checked)}
                />
                <label htmlFor={`skippable-${step.id}`} className="text-gray-300 text-sm">Skippable</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`approval-${step.id}`}
                  className="mr-2 leading-tight"
                  checked={step.requiresApproval}
                  onChange={(e) => handleStepChange(index, 'requiresApproval', e.target.checked)}
                />
                <label htmlFor={`approval-${step.id}`} className="text-gray-300 text-sm">Requires Approval</label>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddStep} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded w-full">
            Add Step
          </button>
        </div>

        <div className="mb-6 bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-teal-200 mb-3">AI Step Suggestions</h3>
          <button
            type="button"
            onClick={generateAISuggestions}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-3"
            disabled={isSaving}
          >
            Generate AI Suggestions
          </button>
          {aiSuggestions.length > 0 && (
            <div className="mt-2 space-y-2">
              {aiSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-600 p-2 rounded">
                  <p className="text-gray-200 text-sm">{suggestion}</p>
                  <button type="button" onClick={() => handleAddAISuggestion(suggestion)} className="text-teal-400 hover:text-teal-300 text-sm ml-4">
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : initialFlow ? 'Update Flow' : 'Create Flow'}
        </button>
      </form>
    </div>
  );
};

const FlowsPage: React.FC = () => {
  const { api } = useServices();
  const [flows, setFlows] = useState<LifecycleFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      try {
        const fetchedFlows = await api.get<LifecycleFlow[]>('/flows');
        setFlows(fetchedFlows);
      } catch (error) {
        console.error("Failed to fetch flows:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlows();
  }, [api]);

  const handleFlowCreated = (newFlow: LifecycleFlow) => {
    setFlows(prev => [...prev, newFlow]);
    navigate(`/flows/${newFlow.id}`);
  };

  if (loading) return <div className="p-8 text-white">Loading flows...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 bg-gray-900 text-white min-h-screen">
      <div className="lg:col-span-2">
        <h1 className="text-4xl font-extrabold mb-8 text-teal-300">Lifecycle Flows</h1>
        {flows.length === 0 ? (
          <p className="text-gray-400">No flows found. Create one to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flows.map(flow => (
              <div key={flow.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-2 text-teal-200">{flow.name}</h2>
                <p className="text-gray-400 mb-2">Type: {flow.type} | Audience: {flow.targetAudience}</p>
                <p className="text-gray-300 text-sm mb-4">{flow.steps.length} steps</p>
                <div className="flex space-x-4">
                  <Link to={`/flows/${flow.id}`} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">
                    View/Edit
                  </Link>
                  <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
                    Manage Enrollments
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="lg:col-span-1">
        <CreateUserOnboardingFlowForm onSuccess={handleFlowCreated} />
      </div>
    </div>
  );
};

const FlowDetailPage: React.FC = () => {
  const { api } = useServices();
  const { pathname } = useLocation();
  const flowId = pathname.split('/').pop();
  const [flow, setFlow] = useState<LifecycleFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!flowId) {
      setError("Flow ID not provided.");
      setLoading(false);
      return;
    }
    const fetchFlow = async () => {
      setLoading(true);
      try {
        const fetchedFlows = await api.get<LifecycleFlow[]>('/flows');
        const foundFlow = fetchedFlows.find(f => f.id === flowId);
        if (foundFlow) {
          setFlow(foundFlow);
        } else {
          setError("Flow not found.");
        }
      } catch (err) {
        setError("Failed to fetch flow details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlow();
  }, [api, flowId]);

  const handleFlowUpdate = (updatedFlow: LifecycleFlow) => {
    setFlow(updatedFlow);
    setError('');
    navigate(`/flows/${updatedFlow.id}`); // Navigate to ensure URL is consistent
  };

  if (loading) return <div className="p-8 text-white">Loading flow details...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!flow) return <div className="p-8 text-gray-400">Flow data is missing.</div>;

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-teal-300">Manage Flow: {flow.name}</h1>
      <CreateUserOnboardingFlowForm onSuccess={handleFlowUpdate} initialFlow={flow} />

      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-teal-200">Flow Progress & Analytics</h2>
        <p className="text-gray-300">Simulated analytics for flow enrollment and completion rates would go here.</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4">
          View Detailed Analytics
        </button>
      </div>
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-teal-200">Enroll Users</h2>
        <p className="text-gray-300">Options to enroll individual users, import a list, or set up auto-enrollment rules.</p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-4">
          Enroll Users
        </button>
      </div>
    </div>
  );
};

const ContentPage: React.FC = () => {
  const { api, gemini, storage } = useServices();
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleType, setNewModuleType] = useState<ContentModule['type']>('document');
  const [newModuleContent, setNewModuleContent] = useState(''); // for text/markdown
  const [newModuleFile, setNewModuleFile] = useState<File | null>(null); // for file uploads
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const fetchedModules = await api.get<ContentModule[]>('/content-modules');
        setModules(fetchedModules);
      } catch (err) {
        console.error("Failed to fetch modules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [api]);

  const handleGenerateAIContent = async () => {
    if (!newModuleTitle) {
      setError("Please provide a title for AI content generation.");
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const prompt = `Generate a comprehensive content module text for a topic titled: "${newModuleTitle}". Focus on providing educational or onboarding material.`;
      const generatedContent = await gemini.generateContent(prompt);
      setNewModuleContent(generatedContent);
      setNewModuleType('ai-generated');
    } catch (err: any) {
      setError(err.message || "Failed to generate AI content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle || (!newModuleContent && !newModuleFile)) {
      setError("Title and content/file are required.");
      return;
    }
    setUploading(true);
    setError('');

    let contentUrl: string | undefined;
    let markdownContent: string | undefined;

    try {
      if (newModuleFile) {
        contentUrl = await storage.uploadFile(newModuleFile, `content-modules/${newModuleType}`);
      } else if (newModuleContent) {
        markdownContent = newModuleContent;
      }

      const newModule: Partial<ContentModule> = {
        title: newModuleTitle,
        type: newModuleType,
        contentUrl: contentUrl,
        markdownContent: markdownContent,
      };

      const createdModule = await api.post<ContentModule>('/content-modules', newModule);
      setModules(prev => [...prev, createdModule]);
      setNewModuleTitle('');
      setNewModuleType('document');
      setNewModuleContent('');
      setNewModuleFile(null);
    } catch (err: any) {
      setError(err.message || "Failed to create content module.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading content modules...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 bg-gray-900 text-white min-h-screen">
      <div className="lg:col-span-2">
        <h1 className="text-4xl font-extrabold mb-8 text-teal-300">Content Modules</h1>
        {modules.length === 0 ? (
          <p className="text-gray-400">No content modules found. Create one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map(mod => (
              <div key={mod.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-2 text-teal-200">{mod.title}</h2>
                <p className="text-gray-400 mb-2">Type: {mod.type}</p>
                {mod.contentUrl && <p className="text-gray-300 text-sm truncate">{mod.contentUrl}</p>}
                {mod.markdownContent && <p className="text-gray-300 text-sm">{mod.markdownContent.substring(0, 100)}...</p>}
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded mt-4">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="lg:col-span-1">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6 text-teal-200">Create New Content Module</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleCreateModule}>
            <div className="mb-4">
              <label htmlFor="moduleTitle" className="block text-gray-300 text-sm font-bold mb-2">Title</label>
              <input
                type="text"
                id="moduleTitle"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="moduleType" className="block text-gray-300 text-sm font-bold mb-2">Type</label>
              <select
                id="moduleType"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                value={newModuleType}
                onChange={(e) => {
                  setNewModuleType(e.target.value as ContentModule['type']);
                  setNewModuleContent(''); // Clear text content if changing type
                  setNewModuleFile(null); // Clear file if changing type
                }}
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="quiz">Quiz</option>
                <option value="form">Form</option>
                <option value="ai-generated">AI Generated Text</option>
              </select>
            </div>
            {(newModuleType === 'document' || newModuleType === 'video') && (
              <div className="mb-4">
                <label htmlFor="moduleFile" className="block text-gray-300 text-sm font-bold mb-2">Upload File</label>
                <input
                  type="file"
                  id="moduleFile"
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  onChange={(e) => setNewModuleFile(e.target.files ? e.target.files[0] : null)}
                  required={!newModuleContent}
                />
              </div>
            )}
            {(newModuleType === 'ai-generated' || newModuleType === 'quiz' || newModuleType === 'form') && (
              <div className="mb-4">
                <label htmlFor="moduleContent" className="block text-gray-300 text-sm font-bold mb-2">Content (Markdown/JSON Schema)</label>
                <textarea
                  id="moduleContent"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                  value={newModuleContent}
                  onChange={(e) => setNewModuleContent(e.target.value)}
                  rows={6}
                  required={!newModuleFile}
                ></textarea>
                {newModuleType === 'ai-generated' && (
                  <button
                    type="button"
                    onClick={handleGenerateAIContent}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-2"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
                )}
              </div>
            )}
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={uploading || isGenerating}
            >
              {uploading || isGenerating ? 'Processing...' : 'Create Module'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const UserManagementPage: React.FC = () => {
  const { api, crmHris, communication } = useServices();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await api.get<UserProfile[]>('/users');
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [api]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) {
      setError("Email and name are required.");
      return;
    }
    setIsAddingUser(true);
    setError('');
    try {
      const newUser = await crmHris.createContact({ email: newUserEmail, name: newUserName });
      const userProfile: UserProfile = {
        ...newUser,
        id: `user-${Date.now()}`, // Simulated ID from our system
        roles: ['user'],
        preferences: {},
      };
      // Also register in our auth system
      await useAuth().register({ email: newUserEmail, name: newUserName });
      await communication.sendEmail(newUserEmail, 'Welcome to LifecycleFlow Platform', `Hello ${newUserName},\n\nWelcome to the platform! Your account has been created.`);
      setUsers(prev => [...prev, userProfile]);
      setNewUserEmail('');
      setNewUserName('');
    } catch (err: any) {
      setError(err.message || "Failed to add user.");
    } finally {
      setIsAddingUser(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading users...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 bg-gray-900 text-white min-h-screen">
      <div className="lg:col-span-2">
        <h1 className="text-4xl font-extrabold mb-8 text-teal-300">User Management</h1>
        {users.length === 0 ? (
          <p className="text-gray-400">No users found. Add one!</p>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-teal-200">{user.name}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  <p className="text-gray-500 text-sm">Roles: {user.roles.join(', ')}</p>
                </div>
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">
                  Manage User
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="lg:col-span-1">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6 text-teal-200">Add New User</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleAddUser}>
            <div className="mb-4">
              <label htmlFor="newUserName" className="block text-gray-300 text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                id="newUserName"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newUserEmail" className="block text-gray-300 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                id="newUserEmail"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isAddingUser}
            >
              {isAddingUser ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


const AIStudioPage: React.FC = () => {
  const { gemini, openai } = useServices();
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [sentimentResult, setSentimentResult] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateContent = async () => {
    if (!aiPrompt) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await gemini.generateContent(aiPrompt);
      setGeneratedContent(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!aiPrompt) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await gemini.analyzeSentiment(aiPrompt);
      setSentimentResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze sentiment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!aiPrompt) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await gemini.summarize(aiPrompt);
      setSummaryResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to summarize content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user' as const, content: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsLoading(true);
    setError('');
    try {
      const aiResponse = await gemini.chat(newMessages);
      setChatMessages(prev => [...prev, { role: 'model', content: aiResponse }]);
    } catch (err: any) {
      setError(err.message || 'AI chat failed.');
      setChatMessages(newMessages); // Revert or show error next to message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-teal-300">AI Studio</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">AI Content Generation & Analysis (Gemini)</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <textarea
            className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 mb-4"
            placeholder="Enter your prompt or text for AI processing..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          ></textarea>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={handleGenerateContent}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
            <button
              onClick={handleAnalyzeSentiment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>
            <button
              onClick={handleSummarize}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Summarizing...' : 'Summarize Text'}
            </button>
          </div>

          {(generatedContent || sentimentResult || summaryResult) && (
            <div className="mt-6 p-4 bg-gray-700 rounded-md">
              <h3 className="text-xl font-semibold text-teal-200 mb-2">AI Results:</h3>
              {generatedContent && <div className="mb-4"><p className="text-gray-300 font-bold">Generated Content:</p><p className="whitespace-pre-wrap">{generatedContent}</p></div>}
              {sentimentResult && <div className="mb-4"><p className="text-gray-300 font-bold">Sentiment Analysis:</p><p>{sentimentResult}</p></div>}
              {summaryResult && <div><p className="text-gray-300 font-bold">Summary:</p><p>{summaryResult}</p></div>}
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">AI Chat Assistant (Gemini)</h2>
          <div className="flex-1 overflow-y-auto h-96 p-3 bg-gray-700 border border-gray-600 rounded-md mb-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
            {chatMessages.length === 0 && <p className="text-gray-400">Start a conversation with your AI Assistant...</p>}
            {chatMessages.map((msg, index) => (
              <div key={index} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-teal-700' : 'bg-gray-600'}`}>
                  {msg.content}
                </span>
              </div>
            ))}
            {isLoading && <p className="text-gray-500 italic mt-2">AI is thinking...</p>}
          </div>
          <div className="flex">
            <input
              type="text"
              className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleChatSend(); }}
              disabled={isLoading}
            />
            <button
              onClick={handleChatSend}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-r-md"
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-teal-200">Other AI Tools</h2>
        <p className="text-gray-300">Integrations with OpenAI for advanced text and image generation (e.g., DALL-E) or Cohere for deeper NLU tasks can be accessed here.</p>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded mt-4" onClick={() => openai.createImage("a happy robot onboarding a new employee in a futuristic office")}>
          Generate Image with OpenAI
        </button>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { payment, communication, crmHris, analytics, document, workflow, search } = useServices();
  const [stripeLink, setStripeLink] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const userId = auth.user?.id || 'dummy-customer-id';

  const fetchCustomerPortal = useCallback(async () => {
    setLoading(true);
    try {
      const link = await payment.getCustomerPortalLink(userId);
      setStripeLink(link);
    } catch (err) {
      console.error("Failed to fetch customer portal link:", err);
    } finally {
      setLoading(false);
    }
  }, [payment, userId]);

  useEffect(() => {
    fetchCustomerPortal();
  }, [fetchCustomerPortal]);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-teal-300">Application Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">Billing & Subscription</h2>
          <p className="text-gray-300 mb-4">Manage your subscription, view invoices, and update payment methods securely via our integrated payment gateway.</p>
          {loading ? (
            <p className="text-gray-400">Loading customer portal...</p>
          ) : stripeLink ? (
            <a href={stripeLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded inline-block">
              Go to Customer Portal
            </a>
          ) : (
            <p className="text-red-400">Failed to load billing portal. Please contact support.</p>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">Integrations Management</h2>
          <p className="text-gray-300 mb-4">Connect and configure your external services.</p>
          <div className="space-y-3">
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center" onClick={() => console.log('Configuring Salesforce')}>
              <span>Salesforce CRM</span> <span className="text-teal-400">Connected</span>
            </button>
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center" onClick={() => console.log('Configuring Twilio')}>
              <span>Twilio (SMS/Voice)</span> <span className="text-yellow-400">Needs Re-auth</span>
            </button>
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center" onClick={() => console.log('Configuring Slack')}>
              <span>Slack Notifications</span> <span className="text-teal-400">Connected</span>
            </button>
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center" onClick={() => console.log('Configuring DocuSign')}>
              <span>DocuSign eSignatures</span> <span className="text-red-400">Disconnected</span>
            </button>
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center" onClick={() => console.log('Configuring Google Analytics')}>
              <span>Google Analytics</span> <span className="text-teal-400">Connected</span>
            </button>
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center" onClick={() => console.log('Configuring Zapier')}>
              <span>Zapier Automations</span> <span className="text-teal-400">Connected</span>
            </button>
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center" onClick={() => console.log('Configuring Algolia')}>
              <span>Algolia Search</span> <span className="text-yellow-400">Indexing Issues</span>
            </button>
            {/* Add more integrations here, potentially with a 'See all' link to a dedicated page */}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">Security & Compliance</h2>
          <p className="text-gray-300 mb-4">Manage roles, permissions, audit logs, and compliance settings.</p>
          <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded mr-2">
            Audit Logs
          </button>
          <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
            Role Based Access Control
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-200">Company Profile & Branding</h2>
          <p className="text-gray-300 mb-4">Customize your platform's appearance and update company information.</p>
          <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
            Edit Profile
          </button>
          <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded ml-2">
            Custom Branding
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Application Component ---
const App: React.FC = () => {
  // Initialize all services with environment variables
  const authService = useMemo(() => new AuthService({
    AUTH0_DOMAIN: ENV.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: ENV.AUTH0_CLIENT_ID,
    OKTA_ORG_URL: ENV.OKTA_ORG_URL,
    OKTA_CLIENT_ID: ENV.OKTA_CLIENT_ID,
    AWS_COGNITO_USER_POOL_ID: ENV.AWS_COGNITO_USER_POOL_ID,
    AWS_COGNITO_CLIENT_ID: ENV.AWS_COGNITO_CLIENT_ID,
    FIREBASE_API_KEY: ENV.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: ENV.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: ENV.FIREBASE_PROJECT_ID,
  }), []);

  const apiService = useMemo(() => new APIService(authService), [authService]);

  const appServices: AppServices = useMemo(() => ({
    gemini: new GeminiAIService(ENV.GEMINI_API_KEY),
    openai: new OpenAIService(ENV.OPENAI_API_KEY),
    auth: authService,
    payment: new PaymentService({
      STRIPE_PUBLIC_KEY: ENV.STRIPE_PUBLIC_KEY,
      STRIPE_SECRET_KEY: ENV.STRIPE_SECRET_KEY,
      PAYPAL_CLIENT_ID: ENV.PAYPAL_CLIENT_ID,
      PAYPAL_SECRET: ENV.PAYPAL_SECRET,
      BRAINTREE_MERCHANT_ID: ENV.BRAINTREE_MERCHANT_ID,
      BRAINTREE_PUBLIC_KEY: ENV.BRAINTREE_PUBLIC_KEY,
      PADDLE_VENDOR_ID: ENV.PADDLE_VENDOR_ID,
      PADDLE_AUTH_CODE: ENV.PADDLE_AUTH_CODE,
    }),
    communication: new CommunicationService({
      TWILIO_ACCOUNT_SID: ENV.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: ENV.TWILIO_AUTH_TOKEN,
      SENDGRID_API_KEY: ENV.SENDGRID_API_KEY,
      MAILGUN_API_KEY: ENV.MAILGUN_API_KEY,
      MAILGUN_DOMAIN: ENV.MAILGUN_DOMAIN,
      AWS_SES_REGION: ENV.AWS_SES_REGION,
      AWS_SES_ACCESS_KEY_ID: ENV.AWS_SES_ACCESS_KEY_ID,
      AWS_SES_SECRET_ACCESS_KEY: ENV.AWS_SES_SECRET_ACCESS_KEY,
      SLACK_WEBHOOK_URL: ENV.SLACK_WEBHOOK_URL,
      MS_TEAMS_WEBHOOK_URL: ENV.MS_TEAMS_WEBHOOK_URL,
      ZOOM_API_KEY: ENV.ZOOM_API_KEY,
      ZOOM_API_SECRET: ENV.ZOOM_API_SECRET,
      GOOGLE_MEET_API_KEY: ENV.GOOGLE_MEET_API_KEY,
    }),
    storage: new StorageService({
      AWS_S3_BUCKET_NAME: ENV.AWS_S3_BUCKET_NAME,
      AWS_S3_REGION: ENV.AWS_S3_REGION,
      AWS_ACCESS_KEY_ID: ENV.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: ENV.AWS_SECRET_ACCESS_KEY,
      GCP_STORAGE_BUCKET_NAME: ENV.GCP_STORAGE_BUCKET_NAME,
      GCP_PROJECT_ID: ENV.GCP_PROJECT_ID,
      GCP_CLIENT_EMAIL: ENV.GCP_CLIENT_EMAIL,
      GCP_PRIVATE_KEY: ENV.GCP_PRIVATE_KEY,
      CLOUDINARY_CLOUD_NAME: ENV.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: ENV.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: ENV.CLOUDINARY_API_SECRET,
      CLOUDFLARE_API_TOKEN: ENV.CLOUDFLARE_API_TOKEN,
      AKAMAI_API_KEY: ENV.AKAMAI_API_KEY,
    }),
    crmHris: new CrmHrisService({
      SALESFORCE_CLIENT_ID: ENV.SALESFORCE_CLIENT_ID,
      SALESFORCE_CLIENT_SECRET: ENV.SALESFORCE_CLIENT_SECRET,
      HUBSPOT_API_KEY: ENV.HUBSPOT_API_KEY,
      SAP_API_KEY: ENV.SAP_API_KEY,
      WORKDAY_API_KEY: ENV.WORKDAY_API_KEY,
      GREENHOUSE_API_KEY: ENV.GREENHOUSE_API_KEY,
    }),
    analytics: new AnalyticsService({
      GOOGLE_ANALYTICS_TRACKING_ID: ENV.GOOGLE_ANALYTICS_TRACKING_ID,
      AMPLITUDE_API_KEY: ENV.AMPLITUDE_API_KEY,
      MIXPANEL_TOKEN: ENV.MIXPANEL_TOKEN,
      DATADOG_CLIENT_TOKEN: ENV.DATADOG_CLIENT_TOKEN,
      SENTRY_DSN: ENV.SENTRY_DSN,
      LOGROCKET_API_KEY: ENV.LOGROCKET_API_KEY,
      SEGMENT_WRITE_KEY: ENV.SEGMENT_WRITE_KEY,
      PROMETHEUS_ENDPOINT: ENV.PROMETHEUS_ENDPOINT,
      GRAFANA_ENDPOINT: ENV.GRAFANA_ENDPOINT,
    }),
    document: new DocumentService({
      DOCUSIGN_CLIENT_ID: ENV.DOCUSIGN_CLIENT_ID,
      DOCUSIGN_CLIENT_SECRET: ENV.DOCUSIGN_CLIENT_SECRET,
      PANDADOC_API_KEY: ENV.PANDADOC_API_KEY,
    }),
    workflow: new WorkflowService({
      ZAPIER_WEBHOOK_URL: ENV.ZAPIER_WEBHOOK_URL,
      MAKE_WEBHOOK_URL: ENV.MAKE_WEBHOOK_URL,
      TEMPORAL_GRPC_ENDPOINT: ENV.TEMPORAL_GRPC_ENDPOINT,
    }),
    search: new SearchService({
      ALGOLIA_APP_ID: ENV.ALGOLIA_APP_ID,
      ALGOLIA_SEARCH_API_KEY: ENV.ALGOLIA_SEARCH_API_KEY,
      ELASTICSEARCH_HOST: ENV.ELASTICSEARCH_HOST,
    }),
    api: apiService,
    // Add other services here following similar pattern...
  }), [authService, apiService]);


  return (
    <AuthContext.Provider value={authService}>
      <ServicesContext.Provider value={appServices}>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-900">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<AuthGuard><DashboardPage /></AuthGuard>} />
                <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
                <Route path="/flows" element={<AuthGuard><FlowsPage /></AuthGuard>} />
                <Route path="/flows/:id" element={<AuthGuard><FlowDetailPage /></AuthGuard>} />
                <Route path="/content" element={<AuthGuard><ContentPage /></AuthGuard>} />
                <Route path="/content/create" element={<AuthGuard><ContentPage /></AuthGuard>} /> {/* Reuses ContentPage for creation */}
                <Route path="/users" element={<AuthGuard><UserManagementPage /></AuthGuard>} />
                <Route path="/ai-studio" element={<AuthGuard><AIStudioPage /></AuthGuard>} />
                <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
                {/* Additional routes for other modules */}
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ServicesContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;