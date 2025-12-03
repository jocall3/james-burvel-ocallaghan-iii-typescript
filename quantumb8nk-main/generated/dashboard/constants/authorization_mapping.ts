/**
 * @file This file represents the core of a sophisticated, AI-powered ad management and optimization platform.
 * It integrates a multitude of external services, leverages advanced Generative AI capabilities (Gemini),
 * and provides robust features for campaign creation, management, analytics, and business automation.
 * This application is designed to be a comprehensive solution for modern digital advertising,
 * offering unparalleled functionality and portability.
 *
 * It replaces the original authorization constants with a complete application architecture,
 * including configurations for numerous external services and their respective secret management.
 *
 * Copyright 2023 OmniAd Solutions Inc.
 */

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JWT } from 'google-auth-library';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import Stripe from 'stripe';
import { Client as TwilioClient } from 'twilio';
import { WebClient as SlackWebClient } from '@slack/web-api';
import { Client as SendGridClient } from '@sendgrid/client';
import { S3Client } from '@aws-sdk/client-s3';
import { createClient as createRedisClient } from 'redis';
import { connect as connectMongoose } from 'mongoose';
import { Client as HubSpotClient } from '@hubspot/api-client';
import { Mailgun } from 'mailgun.js';
import FormData from 'form-data';
import { GraphQLClient } from 'graphql-request';
import PipedriveClient from 'pipedrive';
import { Mixpanel } from 'mixpanel';
import { PostHog } from 'posthog-node';
import * as Segment from '@segment/analytics-node';
import { Salesforce } from 'jsforce';
import * as Sentry from '@sentry/node';
import { DatadogClient } from '@datadog/datadog-api-client/v2/api';
import { Octokit } from '@octokit/rest';
import { Client as NotionClient } from '@notionhq/client';
import { Configuration, PlaidApi, Environments } from 'plaid';
import { ApiClient as ZohoCrmApiClient } from '@zoho-api/crm';
import { Auth0Client } from '@auth0/auth0-spa-js'; // For client-side, but conceptual for backend
import { OktaAuth } from '@okta/okta-auth-js'; // For client-side, but conceptual for backend
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { App as SlackApp } from '@slack/bolt';
import * as postmark from 'postmark';
import { Client as MailchimpClient } from '@mailchimp/mailchimp_marketing';
import { AmplitudeClient } from '@amplitude/node';
import { Configuration as OpenAIApiConfiguration, OpenAIApi } from 'openai';
import { Client as MongoDBClient } from 'mongodb'; // For direct MongoDB operations
import { Pool as PgPool } from 'pg'; // For PostgreSQL
import { Configuration as StableDiffusionConfiguration, StableDiffusionApi } from '@stability/sdk'; // Hypothetical
import { createRequire } from 'module';

// Polyfill for 'require' in ES Modules context
const require = createRequire(import.meta.url);
const Mailchimp = require('@mailchimp/mailchimp_marketing');

// Load environment variables from .env file
dotenv.config();

// --- Configuration & Secrets Management ---
interface ExternalServiceSecrets {
  [key: string]: string | undefined;
}

const SECRETS: ExternalServiceSecrets = {
  // Core Application Secrets
  PORT: process.env.PORT || '3000',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkeyforads',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/omniad_db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // I. AI/ML & Content Generation
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_PROJECT_ID: process.env.GEMINI_PROJECT_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
  STABILITY_AI_API_KEY: process.env.STABILITY_AI_API_KEY,
  MIDJOURNEY_API_KEY: process.env.MIDJOURNEY_API_KEY, // Often through Discord bots, less a direct API
  AWS_REKOGNITION_ACCESS_KEY_ID: process.env.AWS_REKOGNITION_ACCESS_KEY_ID,
  AWS_REKOGNITION_SECRET_ACCESS_KEY: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY,
  AWS_REKOGNITION_REGION: process.env.AWS_REKOGNITION_REGION,
  GOOGLE_CLOUD_VISION_API_KEY: process.env.GOOGLE_CLOUD_VISION_API_KEY,
  IBM_WATSON_API_KEY: process.env.IBM_WATSON_API_KEY,
  IBM_WATSON_URL: process.env.IBM_WATSON_URL,
  HF_API_TOKEN: process.env.HF_API_TOKEN, // Hugging Face

  // II. Ad Platforms & Marketing
  GOOGLE_ADS_CLIENT_ID: process.env.GOOGLE_ADS_CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET: process.env.GOOGLE_ADS_CLIENT_SECRET,
  GOOGLE_ADS_REFRESH_TOKEN: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  GOOGLE_ADS_DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  LINKEDIN_ACCESS_TOKEN: process.env.LINKEDIN_ACCESS_TOKEN,
  TWITTER_API_KEY: process.env.TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY: process.env.TWITTER_API_SECRET_KEY,
  TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  TIKTOK_APP_ID: process.env.TIKTOK_APP_ID,
  TIKTOK_APP_SECRET: process.env.TIKTOK_APP_SECRET,
  TIKTOK_ACCESS_TOKEN: process.env.TIKTOK_ACCESS_TOKEN,
  PINTEREST_APP_ID: process.env.PINTEREST_APP_ID,
  PINTEREST_APP_SECRET: process.env.PINTEREST_APP_SECRET,
  PINTEREST_ACCESS_TOKEN: process.env.PINTEREST_ACCESS_TOKEN,
  SNAPCHAT_CLIENT_ID: process.env.SNAPCHAT_CLIENT_ID,
  SNAPCHAT_CLIENT_SECRET: process.env.SNAPCHAT_CLIENT_SECRET,
  SNAPCHAT_ACCESS_TOKEN: process.env.SNAPCHAT_ACCESS_TOKEN,
  MICROSOFT_ADS_CLIENT_ID: process.env.MICROSOFT_ADS_CLIENT_ID,
  MICROSOFT_ADS_CLIENT_SECRET: process.env.MICROSOFT_ADS_CLIENT_SECRET,
  MICROSOFT_ADS_REFRESH_TOKEN: process.env.MICROSOFT_ADS_REFRESH_TOKEN,
  AMAZON_ADS_CLIENT_ID: process.env.AMAZON_ADS_CLIENT_ID,
  AMAZON_ADS_CLIENT_SECRET: process.env.AMAZON_ADS_CLIENT_SECRET,
  AMAZON_ADS_REFRESH_TOKEN: process.env.AMAZON_ADS_REFRESH_TOKEN,
  TABOOLA_API_KEY: process.env.TABOOLA_API_KEY,
  TABOOLA_ACCOUNT_ID: process.env.TABOOLA_ACCOUNT_ID,
  OUTBRAIN_API_KEY: process.env.OUTBRAIN_API_KEY,
  OUTBRAIN_ACCOUNT_ID: process.env.OUTBRAIN_ACCOUNT_ID,
  CRITEO_CLIENT_ID: process.env.CRITEO_CLIENT_ID,
  CRITEO_CLIENT_SECRET: process.env.CRITEO_CLIENT_SECRET,
  ADROLL_API_KEY: process.env.ADROLL_API_KEY,
  ADROLL_ADVERTISABLE_ID: process.env.ADROLL_ADVERTISABLE_ID,

  // III. Analytics & Tracking
  GA4_CLIENT_EMAIL: process.env.GA4_CLIENT_EMAIL,
  GA4_PRIVATE_KEY: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle newlines in private key
  GA4_PROPERTY_ID: process.env.GA4_PROPERTY_ID,
  MIXPANEL_PROJECT_TOKEN: process.env.MIXPANEL_PROJECT_TOKEN,
  MIXPANEL_API_SECRET: process.env.MIXPANEL_API_SECRET,
  AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY,
  AMPLITUDE_SECRET_KEY: process.env.AMPLITUDE_SECRET_KEY,
  SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
  HOTJAR_API_KEY: process.env.HOTJAR_API_KEY,
  HOTJAR_SITE_ID: process.env.HOTJAR_SITE_ID,
  FULLSTORY_API_KEY: process.env.FULLSTORY_API_KEY,
  MATOMO_API_URL: process.env.MATOMO_API_URL,
  MATOMO_AUTH_TOKEN: process.env.MATOMO_AUTH_TOKEN,
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
  POSTHOG_API_HOST: process.env.POSTHOG_API_HOST,

  // IV. CRM & Sales Automation
  SALESFORCE_CLIENT_ID: process.env.SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET: process.env.SALESFORCE_CLIENT_SECRET,
  SALESFORCE_USERNAME: process.env.SALESFORCE_USERNAME,
  SALESFORCE_PASSWORD: process.env.SALESFORCE_PASSWORD,
  HUBSPOT_API_KEY: process.env.HUBSPOT_API_KEY,
  HUBSPOT_DEVELOPER_API_KEY: process.env.HUBSPOT_DEVELOPER_API_KEY,
  ZOHO_CRM_CLIENT_ID: process.env.ZOHO_CRM_CLIENT_ID,
  ZOHO_CRM_CLIENT_SECRET: process.env.ZOHO_CRM_CLIENT_SECRET,
  ZOHO_CRM_REFRESH_TOKEN: process.env.ZOHO_CRM_REFRESH_TOKEN,
  PIPEDRIVE_API_TOKEN: process.env.PIPEDRIVE_API_TOKEN,
  PIPEDRIVE_COMPANY_DOMAIN: process.env.PIPEDRIVE_COMPANY_DOMAIN,
  FRESHSALES_API_KEY: process.env.FRESHSALES_API_KEY,
  FRESHSALES_DOMAIN: process.env.FRESHSALES_DOMAIN,
  INTERCOM_ACCESS_TOKEN: process.env.INTERCOM_ACCESS_TOKEN,
  INTERCOM_APP_ID: process.env.INTERCOM_APP_ID,
  ZENDESK_SELL_API_TOKEN: process.env.ZENDESK_SELL_API_TOKEN,

  // V. Email & Messaging
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
  AWS_SES_ACCESS_KEY_ID: process.env.AWS_SES_ACCESS_KEY_ID,
  AWS_SES_SECRET_ACCESS_KEY: process.env.AWS_SES_SECRET_ACCESS_KEY,
  AWS_SES_REGION: process.env.AWS_SES_REGION,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  MS_GRAPH_CLIENT_ID: process.env.MS_GRAPH_CLIENT_ID,
  MS_GRAPH_CLIENT_SECRET: process.env.MS_GRAPH_CLIENT_SECRET,
  MS_GRAPH_TENANT_ID: process.env.MS_GRAPH_TENANT_ID,
  WHATSAPP_BUSINESS_API_TOKEN: process.env.WHATSAPP_BUSINESS_API_TOKEN,
  WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,

  // VI. Payment Gateways & Banking
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE: process.env.PAYPAL_MODE, // 'sandbox' or 'live'
  BRAINTREE_MERCHANT_ID: process.env.BRAINTREE_MERCHANT_ID,
  BRAINTREE_PUBLIC_KEY: process.env.BRAINTREE_PUBLIC_KEY,
  BRAINTREE_PRIVATE_KEY: process.env.BRAINTREE_PRIVATE_KEY,
  ADYEN_API_KEY: process.env.ADYEN_API_KEY,
  ADYEN_MERCHANT_ACCOUNT: process.env.ADYEN_MERCHANT_ACCOUNT,
  PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
  PLAID_SECRET: process.env.PLAID_SECRET,
  PLAID_ENV: process.env.PLAID_ENV, // 'sandbox', 'development', 'production'
  FINICITY_APP_KEY: process.env.FINICITY_APP_KEY,
  FINICITY_PARTNER_ID: process.env.FINICITY_PARTNER_ID,
  FINICITY_PARTNER_SECRET: process.env.FINICITY_PARTNER_SECRET,

  // VII. Cloud Infrastructure & Storage
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  GOOGLE_CLOUD_STORAGE_PROJECT_ID: process.env.GOOGLE_CLOUD_STORAGE_PROJECT_ID,
  GOOGLE_CLOUD_STORAGE_KEYFILE_PATH: process.env.GOOGLE_CLOUD_STORAGE_KEYFILE_PATH,
  GOOGLE_CLOUD_STORAGE_BUCKET_NAME: process.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME,
  AZURE_STORAGE_ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
  CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_API_KEY,
  CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_EMAIL,
  CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
  VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN,
  NETLIFY_API_TOKEN: process.env.NETLIFY_API_TOKEN,
  DO_SPACES_KEY: process.env.DO_SPACES_KEY,
  DO_SPACES_SECRET: process.env.DO_SPACES_SECRET,
  DO_SPACES_REGION: process.env.DO_SPACES_REGION,
  DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,

  // VIII. Database & Data Warehousing
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/omniad_db',
  POSTGRES_DATABASE_URL: process.env.POSTGRES_DATABASE_URL || 'postgresql://user:password@localhost:5432/omniad_db',
  REDIS_URI: process.env.REDIS_URI || 'redis://localhost:6379',
  BIGQUERY_PROJECT_ID: process.env.BIGQUERY_PROJECT_ID,
  BIGQUERY_KEYFILE_PATH: process.env.BIGQUERY_KEYFILE_PATH,
  SNOWFLAKE_ACCOUNT: process.env.SNOWFLAKE_ACCOUNT,
  SNOWFLAKE_USERNAME: process.env.SNOWFLAKE_USERNAME,
  SNOWFLAKE_PASSWORD: process.env.SNOWFLAKE_PASSWORD,
  SNOWFLAKE_WAREHOUSE: process.env.SNOWFLAKE_WAREHOUSE,
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL,
  ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // IX. Authentication & Identity
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  OKTA_ORG_URL: process.env.OKTA_ORG_URL,
  OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID,
  OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
  OKTA_PRIVATE_KEY: process.env.OKTA_PRIVATE_KEY,
  AWS_COGNITO_USER_POOL_ID: process.env.AWS_COGNITO_USER_POOL_ID,
  AWS_COGNITO_CLIENT_ID: process.env.AWS_COGNITO_CLIENT_ID,
  AWS_COGNITO_REGION: process.env.AWS_COGNITO_REGION,
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,

  // X. Productivity & Collaboration
  GOOGLE_WORKSPACE_CLIENT_ID: process.env.GOOGLE_WORKSPACE_CLIENT_ID,
  GOOGLE_WORKSPACE_CLIENT_SECRET: process.env.GOOGLE_WORKSPACE_CLIENT_SECRET,
  GOOGLE_WORKSPACE_REFRESH_TOKEN: process.env.GOOGLE_WORKSPACE_REFRESH_TOKEN,
  MICROSOFT_GRAPH_CLIENT_ID: process.env.MICROSOFT_GRAPH_CLIENT_ID,
  MICROSOFT_GRAPH_CLIENT_SECRET: process.env.MICROSOFT_GRAPH_CLIENT_SECRET,
  MICROSOFT_GRAPH_TENANT_ID: process.env.MICROSOFT_GRAPH_TENANT_ID,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  ASANA_ACCESS_TOKEN: process.env.ASANA_ACCESS_TOKEN,
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
  JIRA_HOST: process.env.JIRA_HOST,
  JIRA_USERNAME: process.env.JIRA_USERNAME,
  TRELLO_API_KEY: process.env.TRELLO_API_KEY,
  TRELLO_API_TOKEN: process.env.TRELLO_API_TOKEN,
  ZOOM_API_KEY: process.env.ZOOM_API_KEY,
  ZOOM_API_SECRET: process.env.ZOOM_API_SECRET,

  // XI. Monitoring & Logging
  DATADOG_API_KEY: process.env.DATADOG_API_KEY,
  DATADOG_APP_KEY: process.env.DATADOG_APP_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
  NEW_RELIC_APP_NAME: process.env.NEW_RELIC_APP_NAME,
  LOGROCKET_APP_ID: process.env.LOGROCKET_APP_ID,
  SPLUNK_HEC_URL: process.env.SPLUNK_HEC_URL,
  SPLUNK_HEC_TOKEN: process.env.SPLUNK_HEC_TOKEN,
  PAGERDUTY_API_KEY: process.env.PAGERDUTY_API_KEY,
  PAGERDUTY_SERVICE_ID: process.env.PAGERDUTY_SERVICE_ID,

  // XII. Developer Tools & DevOps (Limited to operational integrations)
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITLAB_PRIVATE_TOKEN: process.env.GITLAB_PRIVATE_TOKEN,
  GITLAB_HOST: process.env.GITLAB_HOST,
  JENKINS_USERNAME: process.env.JENKINS_USERNAME,
  JENKINS_API_TOKEN: process.env.JENKINS_API_TOKEN,
  JENKINS_URL: process.env.JENKINS_URL,
  DOCKER_USERNAME: process.env.DOCKER_USERNAME,
  DOCKER_PASSWORD: process.env.DOCKER_PASSWORD,
  TF_CLOUD_TOKEN: process.env.TF_CLOUD_TOKEN,
  POSTMARK_SERVER_TOKEN: process.env.POSTMARK_SERVER_TOKEN,
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
  MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX,

  // XIII. SEO & Web Tools
  GSC_CLIENT_EMAIL: process.env.GSC_CLIENT_EMAIL,
  GSC_PRIVATE_KEY: process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  MOZ_ACCESS_ID: process.env.MOZ_ACCESS_ID,
  MOZ_SECRET_KEY: process.env.MOZ_SECRET_KEY,
  AHREFS_API_TOKEN: process.env.AHREFS_API_TOKEN,
  SEMRUSH_API_KEY: process.env.SEMRUSH_API_KEY,
  SCREAMING_FROG_API_ENDPOINT: process.env.SCREAMING_FROG_API_ENDPOINT, // Often a local tool, less a cloud API
  WEBFLOW_API_TOKEN: process.env.WEBFLOW_API_TOKEN,
  CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
  CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
  SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
  SANITY_DATASET: process.env.SANITY_DATASET,
  SANITY_TOKEN: process.env.SANITY_TOKEN,

  // XIV. Other Marketing/Ad-related
  ZAPIER_WEBHOOK_URL: process.env.ZAPIER_WEBHOOK_URL,
  MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL,
  UNBOUNCE_API_KEY: process.env.UNBOUNCE_API_KEY,
  INSTAPAGE_API_KEY: process.env.INSTAPAGE_API_KEY,
  CALLRAIL_API_KEY: process.env.CALLRAIL_API_KEY,
  CALLRAIL_ACCOUNT_ID: process.env.CALLRAIL_ACCOUNT_ID,
};

// --- Authorization Interfaces (Enhanced from original) ---
export interface AuthorizationResourceAttributes {
  [key: string]: {
    resourceLabel: string;
    permits: Array<string>;
    description: string; // Added description for clarity
  };
}

export const AUTHORIZATION_RESOURCE_FIELDS_FOR_API: AuthorizationResourceAttributes = {
  // Original resources
  account_detail: { resourceLabel: "Account Details for External Accounts", permits: ["read"], description: "Access to external financial account details." },
  case: { resourceLabel: "Cases", permits: ["create", "read", "update", "delete"], description: "Management of internal support and compliance cases." },
  compliance_rule: { resourceLabel: "Compliance Rules", permits: ["create", "read", "update", "delete"], description: "Management of regulatory compliance rules and policies." },
  connection: { resourceLabel: "Connections", permits: ["read"], description: "Read-only access to integrated service connections." },
  connection_legal_entity: { resourceLabel: "Connection Legal Entities", permits: ["create", "read", "update", "delete"], description: "Management of legal entities linked to service connections." },
  counterparty: { resourceLabel: "Counterparties", permits: ["create", "read", "update", "delete"], description: "Management of business counterparties." },
  decision: { resourceLabel: "Decisions", permits: ["create", "read", "update", "delete"], description: "Management of automated decision outcomes." },
  decision_feedback: { resourceLabel: "Decision Feedbacks", permits: ["create", "read", "update", "delete"], description: "Management of feedback on automated decisions." },
  document: { resourceLabel: "Documents", permits: ["read", "create", "delete"], description: "Access and management of various documents." },
  event: { resourceLabel: "Events", permits: ["read", "create", "update", "delete"], description: "Management of system events and logs." },
  expected_payment: { resourceLabel: "Expected Payments", permits: ["create", "read", "update", "delete"], description: "Management of anticipated incoming payments." },
  external_account: { resourceLabel: "External Accounts", permits: ["create", "read", "update", "delete"], description: "Management of linked external financial accounts." },
  flow: { resourceLabel: "Flows", permits: ["create", "read", "update", "delete"], description: "Management of automated business workflows." },
  flow_configuration: { resourceLabel: "Flow Configurations", permits: ["create", "read", "update", "delete"], description: "Configuration of automated business workflows." },
  incoming_payment_detail: { resourceLabel: "Incoming Payment Details", permits: ["create", "read", "update", "delete"], description: "Management of detailed incoming payment records." },
  internal_account: { resourceLabel: "Internal Accounts", permits: ["create", "read", "update", "delete"], description: "Management of internal ledger accounts." },
  invoice: { resourceLabel: "Invoices", permits: ["create", "read", "update", "delete"], description: "Management of customer invoices." },
  ledger: { resourceLabel: "Ledgers", permits: ["create", "read", "update", "delete"], description: "Management of financial ledgers." },
  ledger_account: { resourceLabel: "Ledger Accounts", permits: ["create", "read", "update", "delete"], description: "Management of individual ledger accounts." },
  ledger_account_category: { resourceLabel: "Ledger Account Categories", permits: ["create", "read", "update", "delete"], description: "Management of categories for ledger accounts." },
  ledger_account_settlement: { resourceLabel: "Ledger Account Settlements", permits: ["create", "read", "update", "delete"], description: "Management of ledger account settlements." },
  ledger_account_statement: { resourceLabel: "Ledger Account Statements", permits: ["create", "read", "update", "delete"], description: "Management of ledger account statements." },
  ledger_entry: { resourceLabel: "Ledger Entries", permits: ["read", "create", "update", "delete"], description: "Management of individual ledger entries." },
  ledger_event_handler: { resourceLabel: "Ledger Event Handlers", permits: ["create", "read", "update", "delete"], description: "Management of handlers for ledger events." },
  ledger_transaction: { resourceLabel: "Ledger Transactions", permits: ["create", "read", "update", "delete"], description: "Management of financial transactions within ledgers." },
  ledgerable_event: { resourceLabel: "Ledgerable Events", permits: ["create", "read", "update", "delete"], description: "Management of events that can be recorded in ledgers." },
  legal_entity: { resourceLabel: "Legal Entities", permits: ["create", "read", "update", "delete"], description: "Management of legal entities within the system." },
  legal_entity_association: { resourceLabel: "Legal Entity Associations", permits: ["create", "read", "update", "delete"], description: "Management of associations between legal entities." },
  paper_item: { resourceLabel: "Paper Items", permits: ["create", "read", "update", "delete"], description: "Management of physical paper items (e.g., checks)." },
  payment_flow: { resourceLabel: "Payment Flows", permits: ["create", "read", "update", "delete"], description: "Management of payment processing workflows." },
  payment_order: { resourceLabel: "Payment Orders", permits: ["create", "read", "update", "delete"], description: "Management of payment initiation orders." },
  publishable_key: { resourceLabel: "Publishable Keys", permits: ["create", "read", "update", "delete"], description: "Management of API publishable keys." },
  quote: { resourceLabel: "FX Quotes", permits: ["create", "read", "update", "delete"], description: "Management of foreign exchange rate quotes." },
  return: { resourceLabel: "Returns", permits: ["create", "read", "update", "delete"], description: "Management of returned payments or items." },
  reversal: { resourceLabel: "Reversals", permits: ["create", "read", "update", "delete"], description: "Management of transaction reversals." },
  screening_result: { resourceLabel: "Screening Results", permits: ["create", "read", "update", "delete"], description: "Management of compliance screening results." },
  transaction: { resourceLabel: "Transactions", permits: ["create", "read", "update", "delete"], description: "Management of financial transactions." },
  transaction_line_item: { resourceLabel: "Transaction Line Items", permits: ["create", "read", "update", "delete"], description: "Management of line items within transactions." },
  user_onboarding: { resourceLabel: "User Onboardings", permits: ["create", "read", "update", "delete"], description: "Management of user onboarding processes." },
  verification: { resourceLabel: "Verifications", permits: ["create", "read", "update", "delete"], description: "Management of user or entity verifications." },
  virtual_account: { resourceLabel: "Virtual Accounts", permits: ["create", "read", "update", "delete"], description: "Management of virtual bank accounts." },

  // New AI/Ad-specific resources
  ad_campaign: { resourceLabel: "Ad Campaigns", permits: ["create", "read", "update", "delete", "launch", "pause"], description: "Comprehensive management of advertising campaigns across platforms." },
  ad_group: { resourceLabel: "Ad Groups", permits: ["create", "read", "update", "delete"], description: "Management of ad groups within campaigns." },
  ad_asset: { resourceLabel: "Ad Assets", permits: ["create", "read", "update", "delete"], description: "Management of creative assets (images, videos, copy) for ads." },
  ad_creative: { resourceLabel: "Ad Creatives", permits: ["create", "read", "update", "delete", "test"], description: "Management of generated ad creatives including AI suggestions." },
  audience_segment: { resourceLabel: "Audience Segments", permits: ["create", "read", "update", "delete"], description: "Management of target audience definitions." },
  bid_strategy: { resourceLabel: "Bid Strategies", permits: ["create", "read", "update", "delete"], description: "Management of automated bidding strategies for ad platforms." },
  budget_plan: { resourceLabel: "Budget Plans", permits: ["create", "read", "update", "delete"], description: "Management of advertising budget allocation and tracking." },
  performance_report: { resourceLabel: "Performance Reports", permits: ["read", "export"], description: "Generation and access to ad campaign performance reports." },
  ai_prompt_template: { resourceLabel: "AI Prompt Templates", permits: ["create", "read", "update", "delete"], description: "Management of templates for generating AI prompts." },
  integration_setting: { resourceLabel: "Integration Settings", permits: ["create", "read", "update", "delete"], description: "Configuration for various external service integrations." },
  webhook_event_log: { resourceLabel: "Webhook Event Logs", permits: ["read"], description: "Monitoring logs of incoming and outgoing webhook events." },
  user_profile: { resourceLabel: "User Profiles", permits: ["read", "update"], description: "Management of user-specific preferences and data." },
  organization_setting: { resourceLabel: "Organization Settings", permits: ["read", "update"], description: "Management of organization-wide configurations." },
  audit_log: { resourceLabel: "Audit Logs", permits: ["read"], description: "Access to system-wide audit trails for security and compliance." },
  notification_preference: { resourceLabel: "Notification Preferences", permits: ["create", "read", "update", "delete"], description: "Management of user notification settings." },
  template_library: { resourceLabel: "Template Library", permits: ["create", "read", "update", "delete"], description: "Management of reusable ad content and strategy templates." },
  data_connector: { resourceLabel: "Data Connectors", permits: ["create", "read", "update", "delete"], description: "Management of connections to external data sources for analytics and enrichment." },
};

export const AUTHORIZATION_RESOURCE_FIELDS_FOR_DASHBOARD: AuthorizationResourceAttributes = {
  ...AUTHORIZATION_RESOURCE_FIELDS_FOR_API, // Inherit all API resources for dashboard
  account_collection_flow: { resourceLabel: "Account Collection Flows", permits: ["read", "create", "update", "delete"], description: "Management of flows for collecting account information." },
  account_group: { resourceLabel: "Account Groups", permits: ["create", "read", "update", "delete"], description: "Management of logical groupings of accounts." },
  api_key: { resourceLabel: "API Keys", permits: ["create", "read", "update", "delete"], description: "Management of API keys for external access." },
  balance_report: { resourceLabel: "Balance Reports", permits: ["read"], description: "Generation and access to financial balance reports." },
  bulk_error: { resourceLabel: "Bulk Errors", permits: ["read"], description: "Access to errors from bulk operations." },
  bulk_request: { resourceLabel: "Bulk Requests", permits: ["read"], description: "Access to status and details of bulk requests." },
  bulk_result: { resourceLabel: "Bulk Results", permits: ["read"], description: "Access to results of bulk operations." },
  custom_email_domain: { resourceLabel: "Custom Email Domains", permits: ["create", "read", "update", "delete"], description: "Management of custom email domains for communication." },
  expected_payment_custom_identifier_key: { resourceLabel: "Expected Payment Custom Identifier Keys", permits: ["read"], description: "Read-only access to custom identifiers for expected payments." },
  file_transfer: { resourceLabel: "File Transfers", permits: ["read"], description: "Monitoring and access to file transfer operations." },
  invoice_line_item: { resourceLabel: "Invoice Line Items", permits: ["read"], description: "Read-only access to line items within invoices." },
  organization_user: { resourceLabel: "Organization Users", permits: ["read", "create", "update", "delete"], description: "Management of users within the organization." }, // Added create/update/delete
  reconciliation_rule: { resourceLabel: "Reconciliation Rules", permits: ["create", "read", "update", "delete"], description: "Management of rules for financial reconciliation." },
  request_log: { resourceLabel: "Request Logs", permits: ["read"], description: "Access to detailed logs of API requests." },
  rule: { resourceLabel: "Payment Rules", permits: ["create", "read", "update", "delete"], description: "Management of payment processing rules." },
  spof_organization: { resourceLabel: "Spof Organizations", permits: ["update", "read"], description: "Management of Single Point of Failure (SPOF) organizations." },
  sweep_rule: { resourceLabel: "Sweep Rules", permits: ["create", "read", "update", "delete"], description: "Management of automated fund sweep rules." },
  transaction_categorization_rule: { resourceLabel: "Transaction Categorization Rules", permits: ["read", "create", "update", "delete"], description: "Management of rules for categorizing transactions." },
  user_invitation: { resourceLabel: "User Invitations", permits: ["read", "create", "update", "delete"], description: "Management of invitations for new users." },
  webhook_endpoint: { resourceLabel: "Webhook Endpoints", permits: ["create", "read", "update", "delete"], description: "Management of configured webhook endpoints." },
  webhook_event: { resourceLabel: "Webhook Events", permits: ["read", "create", "update", "delete"], description: "Management and monitoring of webhook events." },

  // Dashboard-specific enhancements / new resources
  dashboard_widget: { resourceLabel: "Dashboard Widgets", permits: ["create", "read", "update", "delete"], description: "Management of customizable dashboard widgets." },
  user_role: { resourceLabel: "User Roles", permits: ["create", "read", "update", "delete"], description: "Management of user roles and permissions." },
  system_setting: { resourceLabel: "System Settings", permits: ["read", "update"], description: "Configuration of global system parameters." },
  audit_trail: { resourceLabel: "Audit Trail", permits: ["read"], description: "Comprehensive audit trail for all system activities." },
};

// --- Database Models (Conceptual - using Mongoose-like structure for brevity) ---
interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IOrganization {
  id: string;
  name: string;
  settings: { [key: string]: any };
  createdAt: Date;
  updatedAt: Date;
}

interface IAdCampaign {
  id: string;
  organizationId: string;
  name: string;
  platform: 'GoogleAds' | 'FacebookAds' | 'LinkedInAds' | 'TikTokAds';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  startDate: Date;
  endDate: Date;
  targeting: { [key: string]: any };
  performanceMetrics: { [key: string]: any };
  aiOptimized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IAdCreative {
  id: string;
  campaignId: string;
  adGroupId: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  generatedByAi: boolean;
  aiPrompt?: string;
  performanceData: { [key: string]: any };
  createdAt: Date;
  updatedAt: Date;
}

interface IAIPromptTemplate {
  id: string;
  name: string;
  template: string; // e.g., "Generate 5 ad headlines for a {{product}} campaign targeting {{audience}}."
  variables: string[]; // e.g., ["product", "audience"]
  createdAt: Date;
  updatedAt: Date;
}

// --- Services ---

// 1. Database Service
class DatabaseService {
  private mongoClient?: MongoDBClient;
  private pgPool?: PgPool;

  constructor() {
    this.init();
  }

  private async init() {
    // MongoDB (for flexible data like campaigns, creatives, logs)
    if (SECRETS.MONGODB_URI) {
      try {
        await connectMongoose(SECRETS.MONGODB_URI);
        console.log('Connected to MongoDB');
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
      }
    }

    // PostgreSQL (for structured data like users, organizations, ledger entries)
    if (SECRETS.POSTGRES_DATABASE_URL) {
      this.pgPool = new PgPool({
        connectionString: SECRETS.POSTGRES_DATABASE_URL,
      });
      this.pgPool.on('error', (err) => console.error('PostgreSQL client error:', err));
      try {
        await this.pgPool.query('SELECT 1');
        console.log('Connected to PostgreSQL');
      } catch (error) {
        console.error('Failed to connect to PostgreSQL:', error);
      }
    }

    // Example models (simplified representation)
    // For a real app, these would be separate Mongoose schemas or TypeORM/Sequelize entities
    console.log("Database models initialized (conceptual).");
  }

  // --- CRUD Operations (Simplified stubs) ---
  async createUser(userData: Partial<IUser>): Promise<IUser> { /* ... */ return userData as IUser; }
  async findUserById(id: string): Promise<IUser | null> { /* ... */ return null; }
  async findUserByEmail(email: string): Promise<IUser | null> { /* ... */ return null; }
  async createAdCampaign(campaignData: Partial<IAdCampaign>): Promise<IAdCampaign> { /* ... */ return campaignData as IAdCampaign; }
  async getAdCampaign(id: string): Promise<IAdCampaign | null> { /* ... */ return null; }
  async updateAdCampaign(id: string, updates: Partial<IAdCampaign>): Promise<IAdCampaign | null> { /* ... */ return null; }
  async createAdCreative(creativeData: Partial<IAdCreative>): Promise<IAdCreative> { /* ... */ return creativeData as IAdCreative; }
  async getAdCreative(id: string): Promise<IAdCreative | null> { /* ... */ return null; }
  async createPromptTemplate(templateData: Partial<IAIPromptTemplate>): Promise<IAIPromptTemplate> { /* ... */ return templateData as IAIPromptTemplate; }
  async getPromptTemplate(id: string): Promise<IAIPromptTemplate | null> { /* ... */ return null; }
  async logEvent(eventType: string, data: any): Promise<void> { console.log(`Logging event: ${eventType}`, data); }
}

const dbService = new DatabaseService();

// 2. Auth Service
class AuthService {
  async authenticateUser(email: string, password: string): Promise<IUser | null> {
    const user = await dbService.findUserByEmail(email);
    if (!user || user.passwordHash !== this.hashPassword(password)) { // Simplified hash check
      return null;
    }
    return user;
  }

  generateToken(user: IUser): string {
    const jwt = require('jsonwebtoken'); // Dynamically import
    return jwt.sign({ userId: user.id, organizationId: user.organizationId, role: user.role, permissions: user.permissions }, SECRETS.JWT_SECRET!, { expiresIn: '1h' });
  }

  verifyToken(token: string): any | null {
    const jwt = require('jsonwebtoken'); // Dynamically import
    try {
      return jwt.verify(token, SECRETS.JWT_SECRET!);
    } catch (error) {
      return null;
    }
  }

  private hashPassword(password: string): string {
    // In a real app, use bcrypt or Argon2
    return `hashed_${password}`;
  }
}
const authService = new AuthService();

// 3. Gemini AI Service
class GeminiAIService {
  private genAI: GoogleGenerativeAI | undefined;

  constructor() {
    if (SECRETS.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(SECRETS.GEMINI_API_KEY);
      console.log('Gemini AI service initialized.');
    } else {
      console.warn('GEMINI_API_KEY is not set. Gemini AI service disabled.');
    }
  }

  async generateAdCreativeCopy(prompt: string): Promise<string | null> {
    if (!this.genAI) return null;
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating ad creative copy with Gemini:', error);
      return null;
    }
  }

  async analyzeAdPerformance(data: string): Promise<string | null> {
    if (!this.genAI) return null;
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze the following ad performance data and provide actionable insights:\n${data}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing ad performance with Gemini:', error);
      return null;
    }
  }
}
const geminiService = new GeminiAIService();

// 4. OpenAI Service
class OpenAIService {
  private openai: OpenAIApi | undefined;

  constructor() {
    if (SECRETS.OPENAI_API_KEY) {
      const configuration = new OpenAIApiConfiguration({
        apiKey: SECRETS.OPENAI_API_KEY,
        organization: SECRETS.OPENAI_ORG_ID,
      });
      this.openai = new OpenAIApi(configuration);
      console.log('OpenAI service initialized.');
    } else {
      console.warn('OPENAI_API_KEY is not set. OpenAI service disabled.');
    }
  }

  async generateText(prompt: string, model: string = 'gpt-3.5-turbo'): Promise<string | null> {
    if (!this.openai) return null;
    try {
      const response = await this.openai.createChatCompletion({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });
      return response.data.choices[0].message?.content || null;
    } catch (error) {
      console.error('Error generating text with OpenAI:', error);
      return null;
    }
  }

  async generateImage(prompt: string, size: '256x256' | '512x512' | '1024x1024' = '512x512'): Promise<string | null> {
    if (!this.openai) return null;
    try {
      const response = await this.openai.createImage({
        prompt: prompt,
        n: 1,
        size: size,
      });
      return response.data.data[0].url || null;
    } catch (error) {
      console.error('Error generating image with DALL-E:', error);
      return null;
    }
  }
}
const openAIService = new OpenAIService();

// 5. Google Ads Service
class GoogleAdsService {
  private authClient: OAuth2Client | undefined;
  private adsClient: any; // Type for google.ads.googleads.v15.GoogleAdsServiceClient;

  constructor() {
    if (SECRETS.GOOGLE_ADS_CLIENT_ID && SECRETS.GOOGLE_ADS_CLIENT_SECRET && SECRETS.GOOGLE_ADS_REFRESH_TOKEN && SECRETS.GOOGLE_ADS_DEVELOPER_TOKEN) {
      this.authClient = new google.auth.OAuth2(
        SECRETS.GOOGLE_ADS_CLIENT_ID,
        SECRETS.GOOGLE_ADS_CLIENT_SECRET
      );
      this.authClient.setCredentials({ refresh_token: SECRETS.GOOGLE_ADS_REFRESH_TOKEN });

      // The actual Google Ads API client requires a different setup, this is a conceptual placeholder
      // For real implementation: const { GoogleAdsClient } = require('google-ads-api');
      // this.adsClient = new GoogleAdsClient({
      //   developer_token: SECRETS.GOOGLE_ADS_DEVELOPER_TOKEN,
      //   client_id: SECRETS.GOOGLE_ADS_CLIENT_ID,
      //   client_secret: SECRETS.GOOGLE_ADS_CLIENT_SECRET,
      //   refresh_token: SECRETS.GOOGLE_ADS_REFRESH_TOKEN,
      // });
      console.log('Google Ads service initialized (conceptual).');
    } else {
      console.warn('Google Ads credentials not fully set. Google Ads service disabled.');
    }
  }

  async createCampaign(campaignData: any): Promise<string | null> {
    if (!this.adsClient) return null;
    console.log('Creating Google Ads campaign:', campaignData);
    // Placeholder for actual API call
    return `google_campaign_id_${Date.now()}`;
  }

  async getCampaignPerformance(campaignId: string): Promise<any | null> {
    if (!this.adsClient) return null;
    console.log('Fetching Google Ads campaign performance for:', campaignId);
    // Placeholder for actual API call
    return { clicks: 1000, impressions: 50000, cost: 250 };
  }
}
const googleAdsService = new GoogleAdsService();

// 6. Facebook Marketing Service (Conceptual)
class FacebookMarketingService {
  constructor() {
    if (SECRETS.FACEBOOK_APP_ID && SECRETS.FACEBOOK_APP_SECRET && SECRETS.FACEBOOK_ACCESS_TOKEN) {
      console.log('Facebook Marketing service initialized (conceptual).');
    } else {
      console.warn('Facebook Marketing credentials not fully set. Facebook Marketing service disabled.');
    }
  }

  async createFacebookAd(adData: any): Promise<string | null> {
    if (!SECRETS.FACEBOOK_ACCESS_TOKEN) return null;
    console.log('Creating Facebook Ad:', adData);
    // Requires Facebook Marketing SDK or direct API calls
    return `facebook_ad_id_${Date.now()}`;
  }
}
const facebookMarketingService = new FacebookMarketingService();

// 7. Stripe Payment Service
class StripeService {
  private stripe: Stripe | undefined;

  constructor() {
    if (SECRETS.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(SECRETS.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      console.log('Stripe service initialized.');
    } else {
      console.warn('STRIPE_SECRET_KEY is not set. Stripe service disabled.');
    }
  }

  async createPaymentIntent(amount: number, currency: string, description: string): Promise<Stripe.PaymentIntent | null> {
    if (!this.stripe) return null;
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        description,
      });
      return paymentIntent;
    } catch (error) {
      console.error('Error creating Stripe Payment Intent:', error);
      return null;
    }
  }
}
const stripeService = new StripeService();

// 8. Twilio SMS Service
class TwilioService {
  private client: TwilioClient | undefined;

  constructor() {
    if (SECRETS.TWILIO_ACCOUNT_SID && SECRETS.TWILIO_AUTH_TOKEN) {
      this.client = new TwilioClient(SECRETS.TWILIO_ACCOUNT_SID, SECRETS.TWILIO_AUTH_TOKEN);
      console.log('Twilio service initialized.');
    } else {
      console.warn('Twilio credentials not fully set. Twilio service disabled.');
    }
  }

  async sendSMS(to: string, message: string): Promise<any | null> {
    if (!this.client || !SECRETS.TWILIO_PHONE_NUMBER) return null;
    try {
      const result = await this.client.messages.create({
        body: message,
        from: SECRETS.TWILIO_PHONE_NUMBER,
        to: to,
      });
      return result;
    } catch (error) {
      console.error('Error sending SMS with Twilio:', error);
      return null;
    }
  }
}
const twilioService = new TwilioService();

// 9. Slack Notification Service
class SlackService {
  private client: SlackWebClient | undefined;
  private boltApp: SlackApp | undefined; // For advanced interactivity and events

  constructor() {
    if (SECRETS.SLACK_BOT_TOKEN && SECRETS.SLACK_SIGNING_SECRET) {
      this.client = new SlackWebClient(SECRETS.SLACK_BOT_TOKEN);
      this.boltApp = new SlackApp({
        token: SECRETS.SLACK_BOT_TOKEN,
        signingSecret: SECRETS.SLACK_SIGNING_SECRET,
      });
      console.log('Slack service initialized.');
    } else {
      console.warn('Slack credentials not fully set. Slack service disabled.');
    }
  }

  async sendMessage(channel: string, text: string): Promise<any | null> {
    if (!this.client) return null;
    try {
      const result = await this.client.chat.postMessage({
        channel: channel,
        text: text,
      });
      return result;
    } catch (error) {
      console.error('Error sending Slack message:', error);
      return null;
    }
  }

  // Example of setting up a Slack listener (would need a dedicated endpoint for events)
  // public startListening(app: express.Application) {
  //   if (this.boltApp) {
  //     // Attach the Bolt app to the Express server
  //     app.use('/slack/events', this.boltApp.receiver.router);
  //     this.boltApp.message('hello', async ({ message, say }) => {
  //       await say(`Hey there <@${message.user}>!`);
  //     });
  //     console.log('Slack Bolt app listening for events on /slack/events');
  //   }
  // }
}
const slackService = new SlackService();

// 10. SendGrid Email Service
class SendGridService {
  private client: SendGridClient | undefined;

  constructor() {
    if (SECRETS.SENDGRID_API_KEY) {
      this.client = require('@sendgrid/mail'); // SendGrid Mail client
      this.client.setApiKey(SECRETS.SENDGRID_API_KEY);
      console.log('SendGrid service initialized.');
    } else {
      console.warn('SENDGRID_API_KEY is not set. SendGrid service disabled.');
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string, from: string = 'no-reply@omniad.ai'): Promise<any | null> {
    if (!this.client) return null;
    try {
      const msg = { to, from, subject, html: htmlContent };
      const [response] = await this.client.send(msg);
      return response;
    } catch (error) {
      console.error('Error sending email with SendGrid:', error);
      return null;
    }
  }
}
const sendGridService = new SendGridService();

// 11. AWS S3 Storage Service
class S3StorageService {
  private s3Client: S3Client | undefined;
  private bucketName: string | undefined;

  constructor() {
    if (SECRETS.AWS_ACCESS_KEY_ID && SECRETS.AWS_SECRET_ACCESS_KEY && SECRETS.AWS_REGION && SECRETS.AWS_S3_BUCKET_NAME) {
      this.s3Client = new S3Client({
        region: SECRETS.AWS_REGION,
        credentials: {
          accessKeyId: SECRETS.AWS_ACCESS_KEY_ID,
          secretAccessKey: SECRETS.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.bucketName = SECRETS.AWS_S3_BUCKET_NAME;
      console.log('AWS S3 service initialized.');
    } else {
      console.warn('AWS S3 credentials not fully set. S3 service disabled.');
    }
  }

  async uploadFile(key: string, body: Buffer | string, contentType: string): Promise<string | null> {
    if (!this.s3Client || !this.bucketName) return null;
    try {
      const { Upload } = require("@aws-sdk/lib-storage"); // Dynamically import
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: contentType,
          ACL: 'public-read', // Or more restrictive based on use case
        },
      });
      await upload.done();
      const fileUrl = `https://${this.bucketName}.s3.${SECRETS.AWS_REGION}.amazonaws.com/${key}`;
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      return null;
    }
  }

  async getFileUrl(key: string): Promise<string | null> {
    if (!this.bucketName || !SECRETS.AWS_REGION) return null;
    return `https://${this.bucketName}.s3.${SECRETS.AWS_REGION}.amazonaws.com/${key}`;
  }
}
const s3StorageService = new S3StorageService();

// 12. Redis Caching/Queue Service
class RedisService {
  private client: ReturnType<typeof createRedisClient> | undefined;

  constructor() {
    if (SECRETS.REDIS_URI) {
      this.client = createRedisClient({ url: SECRETS.REDIS_URI });
      this.client.on('error', (err) => console.error('Redis Client Error', err));
      this.client.connect().then(() => console.log('Connected to Redis')).catch((err) => console.error('Failed to connect to Redis:', err));
    } else {
      console.warn('REDIS_URI is not set. Redis service disabled.');
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async publish(channel: string, message: string): Promise<void> {
    if (!this.client) return;
    await this.client.publish(channel, message);
  }
}
const redisService = new RedisService();


// Placeholder for other 88+ services initialization
// This pattern would be repeated for each service.
// For brevity, only a few are fully defined.

// HubSpot
class HubSpotService {
  private client: HubSpotClient | undefined;
  constructor() {
    if (SECRETS.HUBSPOT_API_KEY) {
      this.client = new HubSpotClient({ accessToken: SECRETS.HUBSPOT_API_KEY });
      console.log('HubSpot service initialized.');
    } else { console.warn('HubSpot API key not set.'); }
  }
  async createContact(email: string, properties: { [key: string]: string }): Promise<any | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.crm.contacts.basicApi.create({ properties: { email, ...properties } });
      return response.body;
    } catch (e) { console.error('HubSpot create contact error:', e); return null; }
  }
}
const hubSpotService = new HubSpotService();

// Mailgun
class MailgunService {
  private mailgun: Mailgun | undefined;
  private formData: typeof FormData;
  constructor() {
    if (SECRETS.MAILGUN_API_KEY && SECRETS.MAILGUN_DOMAIN) {
      const Mailgun = require('mailgun.js'); // Dynamically import
      const formData = require('form-data'); // Dynamically import
      this.formData = formData;
      this.mailgun = new Mailgun(formData).client({
        username: 'api',
        key: SECRETS.MAILGUN_API_KEY,
      });
      console.log('Mailgun service initialized.');
    } else { console.warn('Mailgun credentials not fully set.'); }
  }
  async sendEmail(to: string, subject: string, html: string, from: string = `Excited User <mailgun@${SECRETS.MAILGUN_DOMAIN}>`): Promise<any | null> {
    if (!this.mailgun || !SECRETS.MAILGUN_DOMAIN) return null;
    try {
      const data = { from, to, subject, html };
      const response = await this.mailgun.messages.create(SECRETS.MAILGUN_DOMAIN, data);
      return response;
    } catch (e) { console.error('Mailgun send email error:', e); return null; }
  }
}
const mailgunService = new MailgunService();

// Plaid
class PlaidService {
  private client: PlaidApi | undefined;
  constructor() {
    if (SECRETS.PLAID_CLIENT_ID && SECRETS.PLAID_SECRET && SECRETS.PLAID_ENV) {
      const configuration = new Configuration({
        basePath: Environments[SECRETS.PLAID_ENV.toUpperCase() as keyof typeof Environments],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': SECRETS.PLAID_CLIENT_ID,
            'PLAID-SECRET': SECRETS.PLAID_SECRET,
          },
        },
      });
      this.client = new PlaidApi(configuration);
      console.log('Plaid service initialized.');
    } else { console.warn('Plaid credentials not fully set.'); }
  }
  async createLinkToken(userId: string): Promise<any | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'OmniAd Solutions',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en',
      });
      return response.data;
    } catch (e) { console.error('Plaid link token creation error:', e); return null; }
  }
  async exchangePublicToken(publicToken: string): Promise<any | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.itemPublicTokenExchange({ public_token: publicToken });
      return response.data;
    } catch (e) { console.error('Plaid public token exchange error:', e); return null; }
  }
}
const plaidService = new PlaidService();

// Salesforce
class SalesforceService {
  private client: Salesforce | undefined;
  constructor() {
    if (SECRETS.SALESFORCE_CLIENT_ID && SECRETS.SALESFORCE_CLIENT_SECRET && SECRETS.SALESFORCE_USERNAME && SECRETS.SALESFORCE_PASSWORD) {
      this.client = new Salesforce();
      this.client.oauth2 = {
        clientId: SECRETS.SALESFORCE_CLIENT_ID,
        clientSecret: SECRETS.SALESFORCE_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/auth/salesforce/callback' // Placeholder
      };
      // For direct username/password login, but OAuth is preferred
      // this.client.login(SECRETS.SALESFORCE_USERNAME, SECRETS.SALESFORCE_PASSWORD).then(() => {
      //   console.log('Salesforce service initialized.');
      // }).catch(e => console.error('Salesforce login error:', e));
    } else { console.warn('Salesforce credentials not fully set.'); }
  }
  async createLead(leadData: any): Promise<any | null> {
    if (!this.client || !this.client.accessToken) {
      console.warn('Salesforce not authenticated. Attempting login...');
      try {
        await this.client.login(SECRETS.SALESFORCE_USERNAME!, SECRETS.SALESFORCE_PASSWORD!);
      } catch (e) {
        console.error('Failed to login to Salesforce:', e);
        return null;
      }
    }
    try {
      const response = await this.client.sobject('Lead').create(leadData);
      return response;
    } catch (e) { console.error('Salesforce create lead error:', e); return null; }
  }
}
const salesforceService = new SalesforceService();


// Sentry Error Tracking
if (SECRETS.SENTRY_DSN) {
  Sentry.init({
    dsn: SECRETS.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: express() }), // Attach to express app later
    ],
    tracesSampleRate: 1.0,
  });
  console.log('Sentry initialized.');
} else {
  console.warn('SENTRY_DSN is not set. Sentry error tracking disabled.');
}

// Datadog Monitoring
class DatadogService {
  private client: DatadogClient | undefined;
  constructor() {
    if (SECRETS.DATADOG_API_KEY && SECRETS.DATADOG_APP_KEY) {
      const { Configuration, ApiClient } = require('@datadog/datadog-api-client'); // Dynamically import
      const datadogConfig = Configuration.create({
        apiKeyAuth: SECRETS.DATADOG_API_KEY,
        appKeyAuth: SECRETS.DATADOG_APP_KEY,
      });
      // this.client = new DatadogClient(datadogConfig); // Correct client requires different setup
      console.log('Datadog service initialized (conceptual).');
    } else { console.warn('Datadog credentials not fully set.'); }
  }
  async recordMetric(metricName: string, value: number, tags: string[] = []): Promise<void> {
    if (!this.client) return;
    console.log(`Datadog metric: ${metricName}=${value} tags=${tags}`);
    // Actual API call: new MetricsApi(this.client).submitMetrics()
  }
}
const datadogService = new DatadogService();

// GitHub Service
class GitHubService {
  private octokit: Octokit | undefined;
  constructor() {
    if (SECRETS.GITHUB_TOKEN) {
      this.octokit = new Octokit({ auth: SECRETS.GITHUB_TOKEN });
      console.log('GitHub service initialized.');
    } else { console.warn('GITHUB_TOKEN not set.'); }
  }
  async createIssue(owner: string, repo: string, title: string, body: string): Promise<any | null> {
    if (!this.octokit) return null;
    try {
      const response = await this.octokit.issues.create({ owner, repo, title, body });
      return response.data;
    } catch (e) { console.error('GitHub create issue error:', e); return null; }
  }
}
const githubService = new GitHubService();

// Notion Service
class NotionService {
  private client: NotionClient | undefined;
  constructor() {
    if (SECRETS.NOTION_API_KEY) {
      this.client = new NotionClient({ auth: SECRETS.NOTION_API_KEY });
      console.log('Notion service initialized.');
    } else { console.warn('NOTION_API_KEY not set.'); }
  }
  async createDatabasePage(databaseId: string, properties: any): Promise<any | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.pages.create({
        parent: { database_id: databaseId },
        properties: properties,
      });
      return response;
    } catch (e) { console.error('Notion create database page error:', e); return null; }
  }
}
const notionService = new NotionService();

// Postmark Service
class PostmarkService {
  private client: postmark.ServerClient | undefined;
  constructor() {
    if (SECRETS.POSTMARK_SERVER_TOKEN) {
      this.client = new postmark.ServerClient(SECRETS.POSTMARK_SERVER_TOKEN);
      console.log('Postmark service initialized.');
    } else { console.warn('POSTMARK_SERVER_TOKEN not set.'); }
  }
  async sendTransactionalEmail(to: string, subject: string, htmlBody: string, from: string = 'info@omniad.ai'): Promise<any | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.sendEmail({
        From: from,
        To: to,
        Subject: subject,
        HtmlBody: htmlBody,
      });
      return response;
    } catch (e) { console.error('Postmark send email error:', e); return null; }
  }
}
const postmarkService = new PostmarkService();

// Mailchimp Service
class MailchimpService {
  private client: typeof Mailchimp | undefined;
  constructor() {
    if (SECRETS.MAILCHIMP_API_KEY && SECRETS.MAILCHIMP_SERVER_PREFIX) {
      this.client = Mailchimp;
      this.client.setConfig({
        apiKey: SECRETS.MAILCHIMP_API_KEY,
        server: SECRETS.MAILCHIMP_SERVER_PREFIX,
      });
      console.log('Mailchimp service initialized.');
    } else { console.warn('Mailchimp credentials not fully set.'); }
  }
  async addContactToList(listId: string, email: string, mergeFields?: object): Promise<any | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.lists.addListMember(listId, {
        email_address: email,
        status: 'subscribed',
        merge_fields: mergeFields,
      });
      return response;
    } catch (e) { console.error('Mailchimp add contact error:', e); return null; }
  }
}
const mailchimpService = new MailchimpService();

// Amplitude Service
class AmplitudeService {
  private client: AmplitudeClient | undefined;
  constructor() {
    if (SECRETS.AMPLITUDE_API_KEY) {
      this.client = new AmplitudeClient(SECRETS.AMPLITUDE_API_KEY, {
        // userId: 'omniad-system-user', // Optional system user ID
      });
      console.log('Amplitude service initialized.');
    } else { console.warn('Amplitude API key not set.'); }
  }
  async trackEvent(eventType: string, eventProperties: object, userId?: string): Promise<void> {
    if (!this.client) return;
    const identify = new this.client.Identify();
    if (userId) identify.set('user_id', userId);
    this.client.track({ event_type: eventType, event_properties: eventProperties, user_id: userId,  time: Date.now() });
    console.log(`Amplitude event tracked: ${eventType}`, eventProperties);
  }
}
const amplitudeService = new AmplitudeService();

// Supabase Service (PostgreSQL + Auth + Storage)
class SupabaseService {
  private client: ReturnType<typeof createSupabaseClient> | undefined;
  constructor() {
    if (SECRETS.SUPABASE_URL && SECRETS.SUPABASE_SERVICE_ROLE_KEY) {
      this.client = createSupabaseClient(SECRETS.SUPABASE_URL, SECRETS.SUPABASE_SERVICE_ROLE_KEY);
      console.log('Supabase service initialized.');
    } else { console.warn('Supabase credentials not fully set.'); }
  }
  async insertData(table: string, data: object): Promise<any | null> {
    if (!this.client) return null;
    try {
      const { data: result, error } = await this.client.from(table).insert(data);
      if (error) throw error;
      return result;
    } catch (e) { console.error('Supabase insert data error:', e); return null; }
  }
  async uploadFile(bucket: string, path: string, file: Buffer | Blob | string, options?: object): Promise<any | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.storage.from(bucket).upload(path, file, options);
      if (error) throw error;
      return data;
    } catch (e) { console.error('Supabase upload file error:', e); return null; }
  }
}
const supabaseService = new SupabaseService();

// --- Middleware ---

interface AuthenticatedRequest extends express.Request {
  user?: IUser;
  organizationId?: string;
  permissions?: string[];
}

const authenticateToken = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }

  // In a real app, fetch user from DB to ensure they still exist and permissions are current
  const user = await dbService.findUserById(decoded.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  req.user = user;
  req.organizationId = user.organizationId;
  req.permissions = user.permissions;
  next();
};

const authorize = (requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.permissions) {
      return res.status(403).json({ message: 'User permissions not loaded.' });
    }
    const hasPermission = requiredPermissions.every(perm => req.permissions!.includes(perm));
    if (!hasPermission) {
      return res.status(403).json({ message: `Access denied. Missing required permissions: ${requiredPermissions.join(', ')}` });
    }
    next();
  };
};

// --- Controllers ---

class AuthController {
  async login(req: express.Request, res: express.Response) {
    const { email, password } = req.body;
    const user = await authService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = authService.generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }
}
const authController = new AuthController();

class AdCampaignController {
  async createCampaign(req: AuthenticatedRequest, res: express.Response) {
    const { name, platform, budget, startDate, endDate, targeting } = req.body;
    if (!req.organizationId) {
      return res.status(400).json({ message: 'Organization ID missing from authenticated user.' });
    }

    const campaignData: Partial<IAdCampaign> = {
      organizationId: req.organizationId,
      name,
      platform,
      budget,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targeting,
      status: 'draft',
      aiOptimized: false,
    };
    const newCampaign = await dbService.createAdCampaign(campaignData);
    if (newCampaign) {
      res.status(201).json(newCampaign);
    } else {
      res.status(500).json({ message: 'Failed to create campaign.' });
    }
  }

  async getCampaigns(req: AuthenticatedRequest, res: express.Response) {
    // In a real app, filter by organizationId
    // const campaigns = await dbService.getCampaignsByOrganization(req.organizationId);
    res.json([{ id: 'mock-campaign-1', name: 'AI Launch Ad', status: 'active' }]);
  }

  async generateCreative(req: AuthenticatedRequest, res: express.Response) {
    const { campaignId, prompt } = req.body;
    const generatedCopy = await geminiService.generateAdCreativeCopy(prompt);
    if (generatedCopy) {
      const newCreative = await dbService.createAdCreative({
        campaignId,
        title: generatedCopy.split('\n')[0].trim(),
        description: generatedCopy,
        generatedByAi: true,
        aiPrompt: prompt,
        performanceData: {},
      });
      res.json(newCreative);
    } else {
      res.status(500).json({ message: 'Failed to generate ad creative copy.' });
    }
  }

  async launchCampaign(req: AuthenticatedRequest, res: express.Response) {
    const { campaignId } = req.params;
    const campaign = await dbService.getAdCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    let adPlatformCampaignId: string | null = null;
    switch (campaign.platform) {
      case 'GoogleAds':
        adPlatformCampaignId = await googleAdsService.createCampaign(campaign);
        break;
      case 'FacebookAds':
        adPlatformCampaignId = await facebookMarketingService.createFacebookAd(campaign); // Simplified for campaign
        break;
      // Add other platforms
      default:
        console.warn(`Unsupported platform for launch: ${campaign.platform}`);
    }

    if (adPlatformCampaignId) {
      await dbService.updateAdCampaign(campaignId, { status: 'active', performanceMetrics: { externalId: adPlatformCampaignId } });
      await slackService.sendMessage('general', `Campaign "${campaign.name}" (${campaignId}) launched successfully on ${campaign.platform}!`);
      res.json({ message: 'Campaign launched successfully.', campaignId: campaign.id });
    } else {
      res.status(500).json({ message: 'Failed to launch campaign on external platform.' });
    }
  }
}
const adCampaignController = new AdCampaignController();

class AnalyticsController {
  async getCampaignAnalytics(req: AuthenticatedRequest, res: express.Response) {
    const { campaignId } = req.params;
    const campaign = await dbService.getAdCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    // This would ideally pull from a data warehouse (BigQuery, Snowflake) or directly from ad platforms
    let performanceData: any = {};
    switch (campaign.platform) {
      case 'GoogleAds':
        performanceData = await googleAdsService.getCampaignPerformance(campaign.performanceMetrics.externalId);
        break;
      // ... other platforms
      default:
        performanceData = { clicks: 0, impressions: 0, cost: 0, platform: campaign.platform, message: 'Mock data for unsupported platform' };
    }

    // Use AI to analyze the data
    const aiAnalysis = await geminiService.analyzeAdPerformance(JSON.stringify(performanceData));

    res.json({ campaignId, performanceData, aiAnalysis });
  }
}
const analyticsController = new AnalyticsController();

class WebhookController {
  async handleStripeWebhook(req: express.Request, res: express.Response) {
    if (!SECRETS.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook secret not configured.');
      return res.sendStatus(500);
    }
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = stripeService.stripe!.webhooks.constructEvent(req.body, sig!, SECRETS.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent for ${paymentIntentSucceeded.amount} was successful!`);
        await dbService.logEvent('stripe_payment_success', paymentIntentSucceeded);
        await slackService.sendMessage('finance', `💰 New Stripe payment succeeded: ${paymentIntentSucceeded.amount / 100} ${paymentIntentSucceeded.currency.toUpperCase()}`);
        break;
      case 'customer.created':
        const customerCreated = event.data.object as Stripe.Customer;
        console.log(`New Stripe Customer: ${customerCreated.id}`);
        await dbService.logEvent('stripe_customer_created', customerCreated);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
        await dbService.logEvent('stripe_unhandled_event', event);
    }

    res.sendStatus(200);
  }

  async handleGenericWebhook(req: express.Request, res: express.Response) {
    const { type, payload } = req.body;
    console.log(`Received generic webhook: Type=${type}, Payload=`, payload);
    await dbService.logEvent('generic_webhook_received', { type, payload, headers: req.headers });
    // Example: Forward to Slack for certain types
    if (type === 'alert' && payload.severity === 'critical') {
      await slackService.sendMessage('alerts', `🚨 Critical Webhook Alert: ${payload.message}`);
    }
    res.sendStatus(200);
  }
}
const webhookController = new WebhookController();

// --- Express Application Setup ---
const app = express();

// Sentry RequestHandler must be the first middleware on the app
if (Sentry.Handlers.requestHandler) {
  app.use(Sentry.Handlers.requestHandler());
}

app.use(cors({ origin: SECRETS.FRONTEND_URL }));
app.use(bodyParser.json({
  verify: (req: any, res, buf) => {
    // Store raw body for Stripe webhook verification
    if (req.originalUrl === '/webhooks/stripe') {
      req.rawBody = buf;
    }
  }
}));

// Sentry TracingHandler before any routes
if (Sentry.Handlers.tracingHandler) {
  app.use(Sentry.Handlers.tracingHandler());
}

// --- Routes ---

// Public Routes
app.post('/auth/login', authController.login);
app.post('/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);
app.post('/webhooks/generic', webhookController.handleGenericWebhook);

// Authenticated Routes
app.use(authenticateToken); // All routes below this require authentication

// Ad Campaign Routes
app.post('/campaigns', authorize(['ad_campaign:create']), adCampaignController.createCampaign);
app.get('/campaigns', authorize(['ad_campaign:read']), adCampaignController.getCampaigns);
app.post('/campaigns/:campaignId/generate-creative', authorize(['ad_creative:create']), adCampaignController.generateCreative);
app.post('/campaigns/:campaignId/launch', authorize(['ad_campaign:launch']), adCampaignController.launchCampaign);
app.get('/campaigns/:campaignId/analytics', authorize(['performance_report:read']), analyticsController.getCampaignAnalytics);

// User and Organization Management (simplified for example)
app.get('/users/me', authorize(['user_profile:read']), (req: AuthenticatedRequest, res) => res.json(req.user));
app.put('/users/me', authorize(['user_profile:update']), async (req: AuthenticatedRequest, res) => {
  // Update user profile logic
  res.json({ message: 'Profile updated (mock)', user: req.user });
});
app.get('/organization/settings', authorize(['organization_setting:read']), async (req: AuthenticatedRequest, res) => {
  // Fetch organization settings
  res.json({ message: 'Organization settings (mock)', id: req.organizationId });
});

// Admin Routes (example)
app.get('/admin/audit-logs', authorize(['audit_log:read']), async (req, res) => {
  // Fetch audit logs
  res.json({ message: 'Audit logs accessed by admin.' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Sentry ErrorHandler must be before any other error middleware and after all controllers
if (Sentry.Handlers.errorHandler) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// --- Start Server ---
const PORT = SECRETS.PORT;
app.listen(PORT, () => {
  console.log(`OmniAd Solutions AI backend running on port ${PORT}`);
  // if (slackService.boltApp) {
  //   slackService.boltApp.start(parseInt(PORT, 10)).catch(console.error);
  // }
});

// Export constants for potential frontend consumption or other modules
export {
  AUTHORIZATION_RESOURCE_FIELDS_FOR_API,
  AUTHORIZATION_RESOURCE_FIELDS_FOR_DASHBOARD,
  SECRETS
};