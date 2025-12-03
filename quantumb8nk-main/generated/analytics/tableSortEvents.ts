// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

// This file has been transformed into a comprehensive Ad AI Platform,
// integrating Google Gemini, extensive external services, and sophisticated
// campaign management, analytics, and optimization capabilities.
// This is a high-level conceptual implementation demonstrating architecture
// and integration points for a multi-million dollar functionality application.

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google-generative-ai';
import { MongoClient } from 'mongodb'; // Example for MongoDB
import pg from 'pg'; // Example for PostgreSQL
import axios from 'axios'; // For generic HTTP requests to external services
import AWS from 'aws-sdk'; // Example for AWS services
import * as admin from 'firebase-admin'; // Example for Firebase
import Redis from 'ioredis'; // Example for Redis caching
import { Queue, Worker, Job } from 'bullmq'; // For background tasks
import { Storage } from '@google-cloud/storage'; // Example for Google Cloud Storage

// Load environment variables from .env file
dotenv.config();

// --- 1. Core Application Configuration and Secrets Management ---

interface AppSecrets {
    GEMINI_API_KEY: string;
    // Database Secrets
    MONGODB_URI: string;
    POSTGRES_URI: string;
    REDIS_URI: string;
    // AWS Secrets
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    // Firebase Secrets (service account key as base64 encoded string or path)
    FIREBASE_SERVICE_ACCOUNT_KEY: string; // Base64 encoded JSON
    // Google Cloud Storage Secrets
    GCS_SERVICE_ACCOUNT_KEY: string; // Base64 encoded JSON
    // CRM
    SALESFORCE_API_KEY: string;
    SALESFORCE_CLIENT_ID: string;
    SALESFORCE_CLIENT_SECRET: string;
    HUBSPOT_API_KEY: string;
    ZOHO_CRM_API_KEY: string;
    MICROSOFT_DYNAMICS_CLIENT_ID: string;
    MICROSOFT_DYNAMICS_CLIENT_SECRET: string;
    // Marketing/Ads Platforms
    GOOGLE_ADS_DEVELOPER_TOKEN: string;
    GOOGLE_ADS_CLIENT_ID: string;
    GOOGLE_ADS_CLIENT_SECRET: string;
    GOOGLE_ADS_REFRESH_TOKEN: string;
    FACEBOOK_ADS_ACCESS_TOKEN: string;
    LINKEDIN_ADS_ACCESS_TOKEN: string;
    TIKTOK_ADS_ACCESS_TOKEN: string;
    TWITTER_ADS_BEARER_TOKEN: string;
    PINTEREST_ADS_ACCESS_TOKEN: string;
    SNAPCHAT_ADS_ACCESS_TOKEN: string;
    MICROSOFT_ADS_API_KEY: string;
    OUTBRAIN_API_KEY: string;
    TABOOLA_API_KEY: string;
    ADROLL_API_KEY: string;
    MAILCHIMP_API_KEY: string;
    MAILCHIMP_SERVER_PREFIX: string;
    SENDGRID_API_KEY: string;
    KLAVIYO_API_KEY: string;
    CONVERTKIT_API_KEY: string;
    ACTIVE_CAMPAIGN_API_KEY: string;
    // Analytics
    GOOGLE_ANALYTICS_API_KEY: string;
    SEGMENT_WRITE_KEY: string;
    MIXPANEL_PROJECT_TOKEN: string;
    AMPLITUDE_API_KEY: string;
    HOTJAR_API_KEY: string;
    FULLSTORY_API_KEY: string;
    DATADOG_API_KEY: string;
    DATADOG_APP_KEY: string;
    NEW_RELIC_LICENSE_KEY: string;
    SENTRY_DSN: string;
    LOGROCKET_API_KEY: string;
    TABLEAU_API_KEY: string;
    POWER_BI_API_KEY: string;
    // Payments & Finance
    STRIPE_SECRET_KEY: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    SQUARE_ACCESS_TOKEN: string;
    TREASURY_PRIME_API_KEY: string;
    TREASURY_PRIME_CLIENT_ID: string;
    TREASURY_PRIME_CLIENT_SECRET: string;
    AMERICAN_EXPRESS_API_KEY: string;
    VISA_DEVELOPER_API_KEY: string;
    MASTERCARD_DEVELOPER_API_KEY: string;
    CHASE_API_KEY: string;
    WELLS_FARGO_API_KEY: string;
    BANK_OF_AMERICA_API_KEY: string;
    CITI_API_KEY: string; // Original copyright holder's company
    PLAID_CLIENT_ID: string;
    PLAID_SECRET: string;
    // Communication & Support
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    SLACK_BOT_TOKEN: string;
    SLACK_SIGNING_SECRET: string;
    INTERCOM_ACCESS_TOKEN: string;
    ZENDESK_API_TOKEN: string;
    ZENDESK_EMAIL: string;
    DRIFT_API_KEY: string;
    GORGEOUS_API_KEY: string;
    FRESHDESK_API_KEY: string;
    FRESHSERVICE_API_KEY: string;
    SERVICE_NOW_API_KEY: string;
    // Project Management & Collaboration
    GITHUB_TOKEN: string;
    GITLAB_PRIVATE_TOKEN: string;
    JENKINS_API_TOKEN: string;
    JIRA_API_TOKEN: string;
    JIRA_EMAIL: string;
    TRELLO_API_KEY: string;
    TRELLO_API_TOKEN: string;
    ASANA_ACCESS_TOKEN: string;
    MONDAY_COM_API_KEY: string;
    CLICKUP_API_KEY: string;
    TEAMWORK_API_KEY: string;
    SMARTSHEET_API_KEY: string;
    // Automation & Integration Platforms
    ZAPIER_WEBHOOK_URL: string;
    IFTTT_WEBHOOK_KEY: string;
    MULESOFT_ANYPOINT_PLATFORM_CLIENT_ID: string;
    MULESOFT_ANYPOINT_PLATFORM_CLIENT_SECRET: string;
    WORKATO_API_KEY: string;
    MAKE_COM_API_KEY: string; // Formerly Integromat
    // E-commerce
    SHOPIFY_API_KEY: string;
    SHOPIFY_API_PASSWORD: string;
    WOOCOMMERCE_API_KEY: string;
    WOOCOMMERCE_API_SECRET: string;
    MAGENTO_API_KEY: string;
    AMAZON_SELLER_CENTRAL_API_KEY: string;
    AMAZON_VENDOR_CENTRAL_API_KEY: string;
    ETSY_API_KEY: string;
    EBAY_API_KEY: string;
    WALMART_SELLER_API_KEY: string;
    // Content Management & Design
    WEBFLOW_API_TOKEN: string;
    CONTENTFUL_ACCESS_TOKEN: string;
    STRAPI_API_TOKEN: string;
    ADOBE_CREATIVE_CLOUD_API_KEY: string;
    ADOBE_EXPERIENCE_CLOUD_API_KEY: string;
    CANVA_API_KEY: string;
    FIGMA_API_TOKEN: string;
    // Cloud Infrastructure & DevOps (additional)
    VERCEL_API_TOKEN: string;
    NETLIFY_ACCESS_TOKEN: string;
    HEROKU_API_KEY: string;
    FASTLY_API_KEY: string;
    CLOUDFLARE_API_TOKEN: string;
    AKAMAI_API_KEY: string;
    AZURE_CLIENT_SECRET: string;
    GCP_PROJECT_ID: string; // Already implicitly included in GCS_SERVICE_ACCOUNT_KEY, but good to have explicit
    // Identity & Access Management
    OKTA_API_TOKEN: string;
    AUTH0_CLIENT_SECRET: string;
    ONELOGIN_API_KEY: string;
    MICROSOFT_GRAPH_CLIENT_SECRET: string;
    // Data Warehousing & ETL
    DATABRICKS_TOKEN: string;
    SNOWFLAKE_API_KEY: string;
    DATAIKU_API_KEY: string;
    FIVE_TRAN_API_KEY: string;
    AIRBYTE_API_KEY: string;
    TALEND_API_KEY: string;
    // AI/ML (additional)
    OPENAI_API_KEY: string;
    ANTHROPIC_API_KEY: string;
    AWS_SAGEMAKER_ROLE_ARN: string;
    // Miscellaneous
    DOCUSIGN_INTEGRATOR_KEY: string;
    DOCUSIGN_USER_ID: string;
    ZOOM_API_KEY: string;
    ZOOM_API_SECRET: string;
    CALENDLY_API_KEY: string;
    BRANCH_IO_KEY: string;
    APPSFLYER_API_KEY: string;
    BRAZE_API_KEY: string;
    NETSUITE_API_KEY: string;
    SAP_CONCUR_API_KEY: string;
    WORKDAY_API_KEY: string;
    SALESFORCE_MARKETING_CLOUD_CLIENT_ID: string;
    SALESFORCE_MARKETING_CLOUD_CLIENT_SECRET: string;
    OUTREACH_IO_API_KEY: string;
    SALESLOFT_API_KEY: string;
    PAGEDUTY_API_KEY: string;
    VICTOROPS_API_KEY: string;
    ATLASSIAN_API_TOKEN: string;
    DYNALABS_API_KEY: string;
    CROWDIN_API_TOKEN: string;
    LOCALIZE_API_KEY: string;
    ONE_SKY_API_KEY: string;
    ALGOLIA_API_KEY: string;
    ALGOLIA_APP_ID: string;
    TYPESENSE_API_KEY: string;
    TYPESENSE_HOST: string;
    ELASTICSEARCH_API_KEY: string;
    ELASTICSEARCH_CLOUD_ID: string;
    LOGSTASH_HOST: string;
    KIBANA_HOST: string;
    GRAFANA_API_KEY: string;
    PROMETHEUS_ENDPOINT: string;
    RAMEN_API_KEY: string; // An obscure example for good measure
    RETOOL_API_KEY: string;
    AIRTABLE_API_KEY: string;
    SENTINELONE_API_KEY: string;
    CROWDSTRIKE_API_KEY: string;
    OPTLY_API_KEY: string;
    GAINSIGHT_API_KEY: string;
    GITHUB_APP_SECRET: string; // for webhooks
    TWITTER_APP_SECRET: string;
    SPOTIFY_CLIENT_SECRET: string; // for ad targeting based on music taste
    TUMBLR_API_KEY: string; // another social ad platform
    REDDIT_API_KEY: string; // reddit ads
    STACK_OVERFLOW_API_KEY: string; // developer ads
    CRITEO_API_KEY: string; // retargeting ads
    THE_TRADE_DESK_API_KEY: string; // programmatic ads
    DV360_API_KEY: string; // Display & Video 360
    CM360_API_KEY: string; // Campaign Manager 360
    SEARCH_ADS_360_API_KEY: string; // Search Ads 360
}

const secrets: AppSecrets = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ad_ai_platform',
    POSTGRES_URI: process.env.POSTGRES_URI || 'postgresql://user:password@localhost:5432/ad_ai_db',
    REDIS_URI: process.env.REDIS_URI || 'redis://localhost:6379',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'AKIAIOSFODNN7EXAMPLE',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || Buffer.from(JSON.stringify({
        "type": "service_account", "project_id": "your-project-id", "private_key_id": "your-private-key-id",
        "private_key": "-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
        "client_email": "your-client-email@your-project-id.iam.gserviceaccount.com", "client_id": "your-client-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email%40your-project-id.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    })).toString('base64'),
    GCS_SERVICE_ACCOUNT_KEY: process.env.GCS_SERVICE_ACCOUNT_KEY || Buffer.from(JSON.stringify({
        "type": "service_account", "project_id": "gcp-project-id", "private_key_id": "gcp-private-key-id",
        "private_key": "-----BEGIN PRIVATE KEY-----\\nYOUR_GCP_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
        "client_email": "gcp-client-email@gcp-project-id.iam.gserviceaccount.com", "client_id": "gcp-client-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/gcp-client-email%40gcp-project-id.iam.gserviceaccount.com"
    })).toString('base64'),
    SALESFORCE_API_KEY: process.env.SALESFORCE_API_KEY || 'mock_salesforce_api_key',
    SALESFORCE_CLIENT_ID: process.env.SALESFORCE_CLIENT_ID || 'mock_salesforce_client_id',
    SALESFORCE_CLIENT_SECRET: process.env.SALESFORCE_CLIENT_SECRET || 'mock_salesforce_client_secret',
    HUBSPOT_API_KEY: process.env.HUBSPOT_API_KEY || 'mock_hubspot_api_key',
    ZOHO_CRM_API_KEY: process.env.ZOHO_CRM_API_KEY || 'mock_zoho_crm_api_key',
    MICROSOFT_DYNAMICS_CLIENT_ID: process.env.MICROSOFT_DYNAMICS_CLIENT_ID || 'mock_ms_dynamics_client_id',
    MICROSOFT_DYNAMICS_CLIENT_SECRET: process.env.MICROSOFT_DYNAMICS_CLIENT_SECRET || 'mock_ms_dynamics_client_secret',
    GOOGLE_ADS_DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 'mock_google_ads_dev_token',
    GOOGLE_ADS_CLIENT_ID: process.env.GOOGLE_ADS_CLIENT_ID || 'mock_google_ads_client_id',
    GOOGLE_ADS_CLIENT_SECRET: process.env.GOOGLE_ADS_CLIENT_SECRET || 'mock_google_ads_client_secret',
    GOOGLE_ADS_REFRESH_TOKEN: process.env.GOOGLE_ADS_REFRESH_TOKEN || 'mock_google_ads_refresh_token',
    FACEBOOK_ADS_ACCESS_TOKEN: process.env.FACEBOOK_ADS_ACCESS_TOKEN || 'mock_facebook_ads_token',
    LINKEDIN_ADS_ACCESS_TOKEN: process.env.LINKEDIN_ADS_ACCESS_TOKEN || 'mock_linkedin_ads_token',
    TIKTOK_ADS_ACCESS_TOKEN: process.env.TIKTOK_ADS_ACCESS_TOKEN || 'mock_tiktok_ads_token',
    TWITTER_ADS_BEARER_TOKEN: process.env.TWITTER_ADS_BEARER_TOKEN || 'mock_twitter_ads_token',
    PINTEREST_ADS_ACCESS_TOKEN: process.env.PINTEREST_ADS_ACCESS_TOKEN || 'mock_pinterest_ads_token',
    SNAPCHAT_ADS_ACCESS_TOKEN: process.env.SNAPCHAT_ADS_ACCESS_TOKEN || 'mock_snapchat_ads_token',
    MICROSOFT_ADS_API_KEY: process.env.MICROSOFT_ADS_API_KEY || 'mock_microsoft_ads_api_key',
    OUTBRAIN_API_KEY: process.env.OUTBRAIN_API_KEY || 'mock_outbrain_api_key',
    TABOOLA_API_KEY: process.env.TABOOLA_API_KEY || 'mock_taboola_api_key',
    ADROLL_API_KEY: process.env.ADROLL_API_KEY || 'mock_adroll_api_key',
    MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY || 'mock_mailchimp_api_key',
    MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX || 'us1',
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || 'mock_sendgrid_api_key',
    KLAVIYO_API_KEY: process.env.KLAVIYO_API_KEY || 'mock_klaviyo_api_key',
    CONVERTKIT_API_KEY: process.env.CONVERTKIT_API_KEY || 'mock_convertkit_api_key',
    ACTIVE_CAMPAIGN_API_KEY: process.env.ACTIVE_CAMPAIGN_API_KEY || 'mock_active_campaign_api_key',
    GOOGLE_ANALYTICS_API_KEY: process.env.GOOGLE_ANALYTICS_API_KEY || 'mock_ga_api_key',
    SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY || 'mock_segment_write_key',
    MIXPANEL_PROJECT_TOKEN: process.env.MIXPANEL_PROJECT_TOKEN || 'mock_mixpanel_token',
    AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY || 'mock_amplitude_api_key',
    HOTJAR_API_KEY: process.env.HOTJAR_API_KEY || 'mock_hotjar_api_key',
    FULLSTORY_API_KEY: process.env.FULLSTORY_API_KEY || 'mock_fullstory_api_key',
    DATADOG_API_KEY: process.env.DATADOG_API_KEY || 'mock_datadog_api_key',
    DATADOG_APP_KEY: process.env.DATADOG_APP_KEY || 'mock_datadog_app_key',
    NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY || 'mock_new_relic_key',
    SENTRY_DSN: process.env.SENTRY_DSN || 'mock_sentry_dsn',
    LOGROCKET_API_KEY: process.env.LOGROCKET_API_KEY || 'mock_logrocket_key',
    TABLEAU_API_KEY: process.env.TABLEAU_API_KEY || 'mock_tableau_api_key',
    POWER_BI_API_KEY: process.env.POWER_BI_API_KEY || 'mock_power_bi_api_key',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key',
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || 'mock_paypal_client_id',
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || 'mock_paypal_client_secret',
    SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN || 'mock_square_access_token',
    TREASURY_PRIME_API_KEY: process.env.TREASURY_PRIME_API_KEY || 'mock_treasury_prime_api_key',
    TREASURY_PRIME_CLIENT_ID: process.env.TREASURY_PRIME_CLIENT_ID || 'mock_treasury_prime_client_id',
    TREASURY_PRIME_CLIENT_SECRET: process.env.TREASURY_PRIME_CLIENT_SECRET || 'mock_treasury_prime_client_secret',
    AMERICAN_EXPRESS_API_KEY: process.env.AMERICAN_EXPRESS_API_KEY || 'mock_amex_api_key',
    VISA_DEVELOPER_API_KEY: process.env.VISA_DEVELOPER_API_KEY || 'mock_visa_api_key',
    MASTERCARD_DEVELOPER_API_KEY: process.env.MASTERCARD_DEVELOPER_API_KEY || 'mock_mastercard_api_key',
    CHASE_API_KEY: process.env.CHASE_API_KEY || 'mock_chase_api_key',
    WELLS_FARGO_API_KEY: process.env.WELLS_FARGO_API_KEY || 'mock_wells_fargo_api_key',
    BANK_OF_AMERICA_API_KEY: process.env.BANK_OF_AMERICA_API_KEY || 'mock_bank_of_america_api_key',
    CITI_API_KEY: process.env.CITI_API_KEY || 'mock_citi_api_key',
    PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID || 'mock_plaid_client_id',
    PLAID_SECRET: process.env.PLAID_SECRET || 'mock_plaid_secret',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || 'xoxb-mock-slack-token',
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET || 'mock_slack_signing_secret',
    INTERCOM_ACCESS_TOKEN: process.env.INTERCOM_ACCESS_TOKEN || 'mock_intercom_access_token',
    ZENDESK_API_TOKEN: process.env.ZENDESK_API_TOKEN || 'mock_zendesk_api_token',
    ZENDESK_EMAIL: process.env.ZENDESK_EMAIL || 'support@example.com',
    DRIFT_API_KEY: process.env.DRIFT_API_KEY || 'mock_drift_api_key',
    GORGEOUS_API_KEY: process.env.GORGEOUS_API_KEY || 'mock_gorgeous_api_key',
    FRESHDESK_API_KEY: process.env.FRESHDESK_API_KEY || 'mock_freshdesk_api_key',
    FRESHSERVICE_API_KEY: process.env.FRESHSERVICE_API_KEY || 'mock_freshservice_api_key',
    SERVICE_NOW_API_KEY: process.env.SERVICE_NOW_API_KEY || 'mock_service_now_api_key',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'mock_github_token',
    GITLAB_PRIVATE_TOKEN: process.env.GITLAB_PRIVATE_TOKEN || 'mock_gitlab_token',
    JENKINS_API_TOKEN: process.env.JENKINS_API_TOKEN || 'mock_jenkins_token',
    JIRA_API_TOKEN: process.env.JIRA_API_TOKEN || 'mock_jira_token',
    JIRA_EMAIL: process.env.JIRA_EMAIL || 'jira@example.com',
    TRELLO_API_KEY: process.env.TRELLO_API_KEY || 'mock_trello_api_key',
    TRELLO_API_TOKEN: process.env.TRELLO_API_TOKEN || 'mock_trello_api_token',
    ASANA_ACCESS_TOKEN: process.env.ASANA_ACCESS_TOKEN || 'mock_asana_token',
    MONDAY_COM_API_KEY: process.env.MONDAY_COM_API_KEY || 'mock_monday_com_api_key',
    CLICKUP_API_KEY: process.env.CLICKUP_API_KEY || 'mock_clickup_api_key',
    TEAMWORK_API_KEY: process.env.TEAMWORK_API_KEY || 'mock_teamwork_api_key',
    SMARTSHEET_API_KEY: process.env.SMARTSHEET_API_KEY || 'mock_smartsheet_api_key',
    ZAPIER_WEBHOOK_URL: process.env.ZAPIER_WEBHOOK_URL || 'https://hooks.zapier.com/hooks/catch/xxxxxx/xxxxxx/',
    IFTTT_WEBHOOK_KEY: process.env.IFTTT_WEBHOOK_KEY || 'mock_ifttt_key',
    MULESOFT_ANYPOINT_PLATFORM_CLIENT_ID: process.env.MULESOFT_ANYPOINT_PLATFORM_CLIENT_ID || 'mock_mulesoft_client_id',
    MULESOFT_ANYPOINT_PLATFORM_CLIENT_SECRET: process.env.MULESOFT_ANYPOINT_PLATFORM_CLIENT_SECRET || 'mock_mulesoft_client_secret',
    WORKATO_API_KEY: process.env.WORKATO_API_KEY || 'mock_workato_api_key',
    MAKE_COM_API_KEY: process.env.MAKE_COM_API_KEY || 'mock_make_com_api_key',
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY || 'mock_shopify_api_key',
    SHOPIFY_API_PASSWORD: process.env.SHOPIFY_API_PASSWORD || 'mock_shopify_password',
    WOOCOMMERCE_API_KEY: process.env.WOOCOMMERCE_API_KEY || 'mock_woocommerce_api_key',
    WOOCOMMERCE_API_SECRET: process.env.WOOCOMMERCE_API_SECRET || 'mock_woocommerce_api_secret',
    MAGENTO_API_KEY: process.env.MAGENTO_API_KEY || 'mock_magento_api_key',
    AMAZON_SELLER_CENTRAL_API_KEY: process.env.AMAZON_SELLER_CENTRAL_API_KEY || 'mock_amazon_seller_central_api_key',
    AMAZON_VENDOR_CENTRAL_API_KEY: process.env.AMAZON_VENDOR_CENTRAL_API_KEY || 'mock_amazon_vendor_central_api_key',
    ETSY_API_KEY: process.env.ETSY_API_KEY || 'mock_etsy_api_key',
    EBAY_API_KEY: process.env.EBAY_API_KEY || 'mock_ebay_api_key',
    WALMART_SELLER_API_KEY: process.env.WALMART_SELLER_API_KEY || 'mock_walmart_seller_api_key',
    WEBFLOW_API_TOKEN: process.env.WEBFLOW_API_TOKEN || 'mock_webflow_api_token',
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN || 'mock_contentful_access_token',
    STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN || 'mock_strapi_api_token',
    ADOBE_CREATIVE_CLOUD_API_KEY: process.env.ADOBE_CREATIVE_CLOUD_API_KEY || 'mock_adobe_creative_cloud_api_key',
    ADOBE_EXPERIENCE_CLOUD_API_KEY: process.env.ADOBE_EXPERIENCE_CLOUD_API_KEY || 'mock_adobe_experience_cloud_api_key',
    CANVA_API_KEY: process.env.CANVA_API_KEY || 'mock_canva_api_key',
    FIGMA_API_TOKEN: process.env.FIGMA_API_TOKEN || 'mock_figma_api_token',
    VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN || 'mock_vercel_api_token',
    NETLIFY_ACCESS_TOKEN: process.env.NETLIFY_ACCESS_TOKEN || 'mock_netlify_access_token',
    HEROKU_API_KEY: process.env.HEROKU_API_KEY || 'mock_heroku_api_key',
    FASTLY_API_KEY: process.env.FASTLY_API_KEY || 'mock_fastly_api_key',
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || 'mock_cloudflare_api_token',
    AKAMAI_API_KEY: process.env.AKAMAI_API_KEY || 'mock_akamai_api_key',
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET || 'mock_azure_client_secret',
    GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || 'mock_gcp_project_id',
    OKTA_API_TOKEN: process.env.OKTA_API_TOKEN || 'mock_okta_api_token',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || 'mock_auth0_client_secret',
    ONELOGIN_API_KEY: process.env.ONELOGIN_API_KEY || 'mock_onelogin_api_key',
    MICROSOFT_GRAPH_CLIENT_SECRET: process.env.MICROSOFT_GRAPH_CLIENT_SECRET || 'mock_microsoft_graph_client_secret',
    DATABRICKS_TOKEN: process.env.DATABRICKS_TOKEN || 'mock_databricks_token',
    SNOWFLAKE_API_KEY: process.env.SNOWFLAKE_API_KEY || 'mock_snowflake_api_key',
    DATAIKU_API_KEY: process.env.DATAIKU_API_KEY || 'mock_dataiku_api_key',
    FIVE_TRAN_API_KEY: process.env.FIVE_TRAN_API_KEY || 'mock_fivetran_api_key',
    AIRBYTE_API_KEY: process.env.AIRBYTE_API_KEY || 'mock_airbyte_api_key',
    TALEND_API_KEY: process.env.TALEND_API_KEY || 'mock_talend_api_key',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'mock_openai_api_key',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'mock_anthropic_api_key',
    AWS_SAGEMAKER_ROLE_ARN: process.env.AWS_SAGEMAKER_ROLE_ARN || 'arn:aws:iam::123456789012:role/SageMakerRole',
    DOCUSIGN_INTEGRATOR_KEY: process.env.DOCUSIGN_INTEGRATOR_KEY || 'mock_docusign_key',
    DOCUSIGN_USER_ID: process.env.DOCUSIGN_USER_ID || 'mock_docusign_user_id',
    ZOOM_API_KEY: process.env.ZOOM_API_KEY || 'mock_zoom_api_key',
    ZOOM_API_SECRET: process.env.ZOOM_API_SECRET || 'mock_zoom_api_secret',
    CALENDLY_API_KEY: process.env.CALENDLY_API_KEY || 'mock_calendly_api_key',
    BRANCH_IO_KEY: process.env.BRANCH_IO_KEY || 'mock_branch_io_key',
    APPSFLYER_API_KEY: process.env.APPSFLYER_API_KEY || 'mock_appsflyer_api_key',
    BRAZE_API_KEY: process.env.BRAZE_API_KEY || 'mock_braze_api_key',
    NETSUITE_API_KEY: process.env.NETSUITE_API_KEY || 'mock_netsuite_api_key',
    SAP_CONCUR_API_KEY: process.env.SAP_CONCUR_API_KEY || 'mock_sap_concur_api_key',
    WORKDAY_API_KEY: process.env.WORKDAY_API_KEY || 'mock_workday_api_key',
    SALESFORCE_MARKETING_CLOUD_CLIENT_ID: process.env.SALESFORCE_MARKETING_CLOUD_CLIENT_ID || 'mock_sfmc_client_id',
    SALESFORCE_MARKETING_CLOUD_CLIENT_SECRET: process.env.SALESFORCE_MARKETING_CLOUD_CLIENT_SECRET || 'mock_sfmc_client_secret',
    OUTREACH_IO_API_KEY: process.env.OUTREACH_IO_API_KEY || 'mock_outreach_io_api_key',
    SALESLOFT_API_KEY: process.env.SALESLOFT_API_KEY || 'mock_salesloft_api_key',
    PAGEDUTY_API_KEY: process.env.PAGEDUTY_API_KEY || 'mock_pageduty_api_key',
    VICTOROPS_API_KEY: process.env.VICTOROPS_API_KEY || 'mock_victorops_api_key',
    ATLASSIAN_API_TOKEN: process.env.ATLASSIAN_API_TOKEN || 'mock_atlassian_api_token',
    DYNALABS_API_KEY: process.env.DYNALABS_API_KEY || 'mock_dynalabs_api_key',
    CROWDIN_API_TOKEN: process.env.CROWDIN_API_TOKEN || 'mock_crowdin_api_token',
    LOCALIZE_API_KEY: process.env.LOCALIZE_API_KEY || 'mock_localize_api_key',
    ONE_SKY_API_KEY: process.env.ONE_SKY_API_KEY || 'mock_one_sky_api_key',
    ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY || 'mock_algolia_api_key',
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID || 'mock_algolia_app_id',
    TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY || 'mock_typesense_api_key',
    TYPESENSE_HOST: process.env.TYPESENSE_HOST || 'localhost:8108',
    ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY || 'mock_elasticsearch_api_key',
    ELASTICSEARCH_CLOUD_ID: process.env.ELASTICSEARCH_CLOUD_ID || 'mock_elasticsearch_cloud_id',
    LOGSTASH_HOST: process.env.LOGSTASH_HOST || 'localhost:9600',
    KIBANA_HOST: process.env.KIBANA_HOST || 'localhost:5601',
    GRAFANA_API_KEY: process.env.GRAFANA_API_KEY || 'mock_grafana_api_key',
    PROMETHEUS_ENDPOINT: process.env.PROMETHEUS_ENDPOINT || 'http://localhost:9090',
    RAMEN_API_KEY: process.env.RAMEN_API_KEY || 'mock_ramen_api_key',
    RETOOL_API_KEY: process.env.RETOOL_API_KEY || 'mock_retool_api_key',
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || 'mock_airtable_api_key',
    SENTINELONE_API_KEY: process.env.SENTINELONE_API_KEY || 'mock_sentinelone_api_key',
    CROWDSTRIKE_API_KEY: process.env.CROWDSTRIKE_API_KEY || 'mock_crowdstrike_api_key',
    OPTLY_API_KEY: process.env.OPTLY_API_KEY || 'mock_optly_api_key',
    GAINSIGHT_API_KEY: process.env.GAINSIGHT_API_KEY || 'mock_gainsight_api_key',
    GITHUB_APP_SECRET: process.env.GITHUB_APP_SECRET || 'mock_github_app_secret',
    TWITTER_APP_SECRET: process.env.TWITTER_APP_SECRET || 'mock_twitter_app_secret',
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || 'mock_spotify_client_secret',
    TUMBLR_API_KEY: process.env.TUMBLR_API_KEY || 'mock_tumblr_api_key',
    REDDIT_API_KEY: process.env.REDDIT_API_KEY || 'mock_reddit_api_key',
    STACK_OVERFLOW_API_KEY: process.env.STACK_OVERFLOW_API_KEY || 'mock_stack_overflow_api_key',
    CRITEO_API_KEY: process.env.CRITEO_API_KEY || 'mock_criteo_api_key',
    THE_TRADE_DESK_API_KEY: process.env.THE_TRADE_DESK_API_KEY || 'mock_the_trade_desk_api_key',
    DV360_API_KEY: process.env.DV360_API_KEY || 'mock_dv360_api_key',
    CM360_API_KEY: process.env.CM360_API_KEY || 'mock_cm360_api_key',
    SEARCH_ADS_360_API_KEY: process.env.SEARCH_ADS_360_API_KEY || 'mock_search_ads_360_api_key',
};

// Ensure all critical secrets are available
for (const key in secrets) {
    // Check if the current secret's value matches the pattern of a placeholder.
    // This assumes actual env vars will not contain 'mock_' or 'YOUR_' in this specific way.
    const isPlaceholder = (secrets[key as keyof AppSecrets] as string).includes('mock_') || (secrets[key as keyof AppSecrets] as string).includes('YOUR_');
    if (isPlaceholder) {
        console.warn(`Warning: Environment variable ${key} is not set. Using a placeholder or default value.`);
        // In a production app, you might throw an error here:
        // throw new Error(`Missing critical environment variable: ${key}`);
    }
}

// Initialize AWS SDK
AWS.config.update({
    accessKeyId: secrets.AWS_ACCESS_KEY_ID,
    secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    region: secrets.AWS_REGION,
});

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;
try {
    const firebaseServiceAccount = JSON.parse(Buffer.from(secrets.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8'));
    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(firebaseServiceAccount),
        // databaseURL: "https://your-project-id.firebaseio.com" // If using RTDB
    });
    console.log("Firebase Admin SDK initialized.");
} catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
}

// Initialize Google Cloud Storage (GCS)
let gcsStorage: Storage | null = null;
try {
    const gcsServiceAccount = JSON.parse(Buffer.from(secrets.GCS_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8'));
    gcsStorage = new Storage({
        credentials: {
            client_email: gcsServiceAccount.client_email,
            private_key: gcsServiceAccount.private_key,
        },
        projectId: gcsServiceAccount.project_id,
    });
    console.log("Google Cloud Storage initialized.");
} catch (error) {
    console.error("Failed to initialize Google Cloud Storage:", error.message);
}


// --- 2. Database Connections ---

const mongoClient = new MongoClient(secrets.MONGODB_URI);
const pgClient = new pg.Client({ connectionString: secrets.POSTGRES_URI });
const redisClient = new Redis(secrets.REDIS_URI);

async function connectDatabases() {
    try {
        await mongoClient.connect();
        console.log("Connected to MongoDB");
        await pgClient.connect();
        console.log("Connected to PostgreSQL");
        redisClient.on('connect', () => console.log('Connected to Redis'));
        redisClient.on('error', (err) => console.error('Redis Client Error', err));
    } catch (error) {
        console.error("Failed to connect to one or more databases:", error);
        // Do NOT exit in dev mode if placeholders are used, but would in production.
        // process.exit(1);
    }
}

// --- 3. Background Job Queue (BullMQ) ---
const connection = {
    host: new URL(secrets.REDIS_URI).hostname,
    port: parseInt(new URL(secrets.REDIS_URI).port, 10),
    password: new URL(secrets.REDIS_URI).password || undefined,
};

const adGenerationQueue = new Queue('adGeneration', { connection });
const campaignOptimizationQueue = new Queue('campaignOptimization', { connection });
const dataIngestionQueue = new Queue('dataIngestion', { connection });
const analyticsReportQueue = new Queue('analyticsReport', { connection });

// --- 4. Data Models (Simplified) ---

interface Ad {
    id: string;
    campaignId: string;
    title: string;
    description: string;
    targetAudience: string;
    keywords: string[];
    creativeAssets: string[]; // URLs to images/videos, potentially from S3/GCS
    platformSpecificData: Record<string, any>; // e.g., Facebook Ad creative IDs, Google Ad Group IDs
    status: 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected';
    generatedByGemini: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface Campaign {
    id: string;
    userId: string;
    name: string;
    budget: number;
    startDate: Date;
    endDate: Date;
    targetRegions: string[];
    targetDemographics: string;
    objective: string; // e.g., 'conversions', 'impressions', 'leads'
    status: 'active' | 'paused' | 'completed' | 'draft';
    platformIntegrations: string[]; // e.g., ['Google Ads', 'Facebook Ads']
    performanceMetrics: Record<string, any>; // Real-time stats, updated periodically
    createdAt: Date;
    updatedAt: Date;
}

interface User {
    id: string;
    email: string;
    name: string;
    roles: string[];
    settings: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

// --- 5. Original `TABLE_SORT_ACTIONS` - now part of a larger reporting/analytics context ---

export const TABLE_SORT_ACTIONS: Record<string, string> = {
    COUNTERPARTY_SORTED_ON_CREATED_AT: "counterparty sorted_on_created_at",
    COUNTERPARTY_SORTED_ON_EMAIL: "counterparty sorted_on_email",
    COUNTERPARTY_SORTED_ON_NAME: "counterparty sorted_on_name",
    COUNTERPARTY_SORTED_ON_UPDATED_AT: "counterparty sorted_on_updated_at",

    DATA_INGESTION_BULK_RESULT_SORTED_ON_REQUEST_PARAMS_INDEX:
        "data_ingestion_bulk_result sorted_on_request_params_index",

    EXPECTED_PAYMENT_SORTED_ON_AMOUNT_RANGE:
        "expected_payment sorted_on_amount_range",
    EXPECTED_PAYMENT_SORTED_ON_DATE_RANGE:
        "expected_payment sorted_on_date_range",

    EXTERNAL_ACCOUNT_SORTED_ON_CREATED_AT:
        "external_account sorted_on_created_at",
    EXTERNAL_ACCOUNT_SORTED_ON_NAME: "external_account sorted_on_name",

    INVOICE_SORTED_ON_DUE_DATE: "invoice sorted_on_due_date",
    INVOICE_SORTED_ON_NUMBER: "invoice sorted_on_number",
    INVOICE_SORTED_ON_TOTAL_AMOUNT: "invoice sorted_on_total_amount",

    LEDGER_ACCOUNT_SORTED_ON_DESCRIPTION: "ledger_account sorted_on_description",
    LEDGER_ACCOUNT_SORTED_ON_NAME: "ledger_account sorted_on_name",
    LEDGER_ACCOUNT_SORTED_ON_NORMAL_BALANCE:
        "ledger_account sorted_on_normal_balance",

    LEDGER_ACCOUNT_CATEGORY_SORTED_ON_CURRENCY:
        "ledger_account_category sorted_on_currency",
    LEDGER_ACCOUNT_CATEGORY_SORTED_ON_DESCRIPTION:
        "ledger_account_category sorted_on_description",
    LEDGER_ACCOUNT_CATEGORY_SORTED_ON_NAME:
        "ledger_account_category sorted_on_name",

    LEDGER_ACCOUNT_SETTLEMENT_SORTED_ON_AMOUNT_DECIMAL:
        "ledger_account_settlement sorted_on_amount_decimal",
    LEDGER_ACCOUNT_SETTLEMENT_SORTED_ON_CREATED_AT:
        "ledger_account_settlement sorted_on_created_at",
    LEDGER_ACCOUNT_SETTLEMENT_SORTED_ON_EFFECTIVE_AT_UPPER_BOUND:
        "ledger_account_settlement sorted_on_effective_at_upper_bound",
    LEDGER_ACCOUNT_SETTLEMENT_SORTED_ON_PAYOUT_ENTRY_DIRECTION:
        "ledger_account_settlement sorted_on_payout_entry_direction",
    LEDGER_ACCOUNT_SETTLEMENT_SORTED_ON_STATUS:
        "ledger_account_settlement sorted_on_status",

    LEDGER_ENTRY_SORTED_ON_STATUS: "ledger_entry sorted_on_status",

    LEDGER_TRANSACTION_SORTED_ON_CREATED_AT:
        "ledger_transaction sorted_on_created_at",
    LEDGER_TRANSACTION_SORTED_ON_EFFECTIVE_AT:
        "ledger_transaction sorted_on_effective_at",
    LEDGER_TRANSACTION_SORTED_ON_STATUS: "ledger_transaction sorted_on_status",

    PAYMENT_ORDER_SORTED_ON_AMOUNT: "payment_order sorted_on_amount",
    PAYMENT_ORDER_SORTED_ON_CREATED_AT: "payment_order sorted_on_created_at",
    PAYMENT_ORDER_SORTED_ON_EFFECTIVE_DATE:
        "payment_order sorted_on_effective_date",
    PAYMENT_ORDER_SORTED_ON_ID: "payment_order sorted_on_id",
    PAYMENT_ORDER_SORTED_ON_STATUS: "payment_order sorted_on_status",

    PENNY_TEST_SORTED_ON_EFFECTIVE_DATE: "penny_test sorted_on_effective_date",

    RECONCILIATION_RULE_PREVIEW_TRANSACTION_SORTED_ON_AMOUNT:
        "reconciliation_rule_preview_transaction sorted_on_amount",
    RECONCILIATION_RULE_PREVIEW_TRANSACTION_SORTED_ON_AS_OF_DATE:
        "reconciliation_rule_preview_transaction sorted_on_as_of_date",

    TRANSACTION_SORTED_ON_AMOUNT: "transaction sorted_on_amount",
    TRANSACTION_SORTED_ON_AS_OF_DATE: "transaction sorted_on_as_of_date",

    WEBHOOK_ENDPOINT_SORTED_ON_CREATED_AT:
        "webhook_endpoint sorted_on_created_at",
    WEBHOOK_ENDPOINT_SORTED_ON_DISCARDED_AT:
        "webhook_endpoint sorted_on_discarded_at",
    WEBHOOK_ENDPOINT_SORTED_ON_HEALTH: "webhook_endpoint sorted_on_health",
    WEBHOOK_ENDPOINT_SORTED_ON_STATUS: "webhook_endpoint sorted_on_status",
    WEBHOOK_ENDPOINT_SORTED_ON_UPDATED_AT:
        "webhook_endpoint sorted_on_updated_at",

    // Ad AI Specific Sort Actions for a unified reporting dashboard
    AD_SORTED_ON_CREATED_AT: "ad sorted_on_created_at",
    AD_SORTED_ON_TITLE: "ad sorted_on_title",
    AD_SORTED_ON_STATUS: "ad sorted_on_status",
    CAMPAIGN_SORTED_ON_BUDGET: "campaign sorted_on_budget",
    CAMPAIGN_SORTED_ON_START_DATE: "campaign sorted_on_start_date",
    CAMPAIGN_SORTED_ON_STATUS: "campaign sorted_on_status",
    USER_SORTED_ON_EMAIL: "user sorted_on_email",
    USER_SORTED_ON_CREATED_AT: "user sorted_on_created_at",
    // Add more granular ad/campaign related sort options for robust analytics
    AD_SORTED_ON_CLICKS: "ad_performance sorted_on_clicks",
    AD_SORTED_ON_IMPRESSIONS: "ad_performance sorted_on_impressions",
    AD_SORTED_ON_CTR: "ad_performance sorted_on_ctr",
    AD_SORTED_ON_CONVERSIONS: "ad_performance sorted_on_conversions",
    CAMPAIGN_SORTED_ON_ROI: "campaign_performance sorted_on_roi",
    CAMPAIGN_SORTED_ON_SPEND: "campaign_performance sorted_on_spend",
};


// --- 6. Gemini AI Integration Service ---

class GeminiAI {
    private genAI: GoogleGenerativeAI;
    private model;

    constructor(apiKey: string) {
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            console.error("Gemini API Key is not set. Gemini features will be limited or unavailable.");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    /**
     * Generates ad copy based on product description, target audience, and objective.
     */
    async generateAdCopy(
        productDescription: string,
        targetAudience: string,
        adObjective: string,
        tone: string = 'persuasive',
        length: 'short' | 'medium' | 'long' = 'medium'
    ): Promise<string> {
        if (!secrets.GEMINI_API_KEY || secrets.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return "Gemini is not configured. Placeholder ad copy: 'Unlock growth with our innovative solutions!'";
        }
        try {
            const prompt = `Generate ${length} ad copy in a ${tone} tone for a product.
            Product Description: ${productDescription}
            Target Audience: ${targetAudience}
            Ad Objective: ${adObjective}
            Ensure the ad copy is highly engaging and includes a clear call to action.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            return text;
        } catch (error: any) {
            console.error("Error generating ad copy with Gemini:", error.message);
            // Implement robust error handling, fallback to default or retry mechanisms
            return `Failed to generate ad copy using Gemini. Consider manual creation or retry. Error: ${error.message}`;
        }
    }

    /**
     * Suggests keywords for an ad campaign.
     */
    async suggestKeywords(adCopy: string, productCategory: string, existingKeywords: string[] = []): Promise<string[]> {
        if (!secrets.GEMINI_API_KEY || secrets.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return ['default-keyword-1', 'default-keyword-2'];
        }
        try {
            const prompt = `Based on the following ad copy and product category, suggest 10 relevant and high-converting keywords for an ad campaign. Avoid keywords already in the existing list.
            Ad Copy: "${adCopy}"
            Product Category: ${productCategory}
            Existing Keywords: ${existingKeywords.join(', ')}
            Provide keywords as a comma-separated list.`;
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            return text.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0 && !existingKeywords.includes(kw));
        } catch (error: any) {
            console.error("Error suggesting keywords with Gemini:", error.message);
            return [];
        }
    }

    /**
     * Analyzes ad performance data to provide optimization recommendations.
     */
    async analyzeAdPerformance(performanceData: Record<string, any>, campaignGoals: string): Promise<string> {
        if (!secrets.GEMINI_API_KEY || secrets.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return "Gemini is not configured. Placeholder analysis: 'Consider increasing budget for best-performing ads.'";
        }
        try {
            const prompt = `Analyze the following ad campaign performance data and provide actionable optimization recommendations to achieve the campaign goals.
            Performance Data: ${JSON.stringify(performanceData, null, 2)}
            Campaign Goals: ${campaignGoals}
            Focus on improving ROI, CTR, and conversion rates.`;
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            return text;
        } catch (error: any) {
            console.error("Error analyzing ad performance with Gemini:", error.message);
            return `Failed to analyze performance using Gemini. Error: ${error.message}`;
        }
    }

    /**
     * Generates creative asset ideas (e.g., image descriptions, video concepts).
     */
    async generateCreativeIdeas(adCopy: string, targetAudience: string, productDescription: string): Promise<string> {
        if (!secrets.GEMINI_API_KEY || secrets.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return "Gemini is not configured. Placeholder creative idea: 'A vibrant image of happy customers using the product.'";
        }
        try {
            const prompt = `Based on the ad copy, target audience, and product description, suggest creative asset ideas (e.g., image concepts, short video scripts, animated GIF ideas).
            Ad Copy: "${adCopy}"
            Target Audience: "${targetAudience}"
            Product Description: "${productDescription}"
            Propose at least 3 distinct ideas.`;
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            return text;
        } catch (error: any) {
            console.error("Error generating creative ideas with Gemini:", error.message);
            return `Failed to generate creative ideas using Gemini. Error: ${error.message}`;
        }
    }
}

const geminiAI = new GeminiAI(secrets.GEMINI_API_KEY);


// --- 7. External Service Integrations (Classes/Functions) ---

// Generic HTTP client instance
const apiClient = axios.create({
    headers: {
        'User-Agent': 'Ad-AI-Platform/1.0',
        'Content-Type': 'application/json',
    },
});

interface ExternalAdPlatformConfig {
    name: string;
    apiKey?: string;
    accessToken?: string;
    clientId?: string;
    clientSecret?: string;
    developerToken?: string;
    refreshToken?: string;
    appId?: string;
    appSecret?: string;
    // Add more platform-specific configs as needed
}

/**
 * Base class for all ad platform integrations.
 */
abstract class AdPlatformIntegration {
    protected config: ExternalAdPlatformConfig;
    protected axiosInstance: typeof apiClient;

    constructor(config: ExternalAdPlatformConfig) {
        this.config = config;
        this.axiosInstance = axios.create({
            baseURL: this.getBaseUrl(),
            headers: this.getAuthHeaders(),
        });
    }

    protected abstract getBaseUrl(): string;
    protected abstract getAuthHeaders(): Record<string, string>;
    abstract createAd(ad: Ad): Promise<any>;
    abstract updateAd(ad: Ad): Promise<any>;
    abstract getCampaignPerformance(campaignId: string): Promise<any>;
    abstract syncAudiences(audienceData: any): Promise<any>; // e.g., CRM segments
    abstract publishCreativeAsset(assetBuffer: Buffer, mimeType: string): Promise<string>; // Returns URL or asset ID
}

class GoogleAdsIntegration extends AdPlatformIntegration {
    protected getBaseUrl(): string { return 'https://googleads.googleapis.com/v10/'; }
    protected getAuthHeaders(): Record<string, string> {
        return {
            'developer-token': this.config.developerToken || '',
            'Authorization': `Bearer ${this.config.accessToken || this.config.refreshToken}`, // In reality, handle OAuth flow
        };
    }
    async createAd(ad: Ad): Promise<any> { console.log(`Creating Google Ad: ${ad.title}`); return { id: `google-ad-${Date.now()}` }; }
    async updateAd(ad: Ad): Promise<any> { console.log(`Updating Google Ad: ${ad.id}`); return { status: 'updated' }; }
    async getCampaignPerformance(campaignId: string): Promise<any> { console.log(`Getting Google Ads performance for campaign: ${campaignId}`); return { clicks: 100, impressions: 10000, conversions: 5, spend: 500 }; }
    async syncAudiences(audienceData: any): Promise<any> { console.log("Syncing audiences to Google Ads."); return { status: 'synced' }; }
    async publishCreativeAsset(assetBuffer: Buffer, mimeType: string): Promise<string> { console.log(`Publishing asset to Google Ads: ${mimeType}`); return `google-asset-id-${Date.now()}`; }
}

class FacebookAdsIntegration extends AdPlatformIntegration {
    protected getBaseUrl(): string { return 'https://graph.facebook.com/v16.0/'; }
    protected getAuthHeaders(): Record<string, string> {
        return { 'Authorization': `Bearer ${this.config.accessToken}` };
    }
    async createAd(ad: Ad): Promise<any> { console.log(`Creating Facebook Ad: ${ad.title}`); return { id: `fb-ad-${Date.now()}` }; }
    async updateAd(ad: Ad): Promise<any> { console.log(`Updating Facebook Ad: ${ad.id}`); return { status: 'updated' }; }
    async getCampaignPerformance(campaignId: string): Promise<any> { console.log(`Getting Facebook Ads performance for campaign: ${campaignId}`); return { clicks: 120, impressions: 12000, conversions: 7, spend: 600 }; }
    async syncAudiences(audienceData: any): Promise<any> { console.log("Syncing audiences to Facebook Ads."); return { status: 'synced' }; }
    async publishCreativeAsset(assetBuffer: Buffer, mimeType: string): Promise<string> { console.log(`Publishing asset to Facebook Ads: ${mimeType}`); return `fb-asset-id-${Date.now()}`; }
}

class LinkedInAdsIntegration extends AdPlatformIntegration {
    protected getBaseUrl(): string { return 'https://api.linkedin.com/v2/'; }
    protected getAuthHeaders(): Record<string, string> {
        return { 'Authorization': `Bearer ${this.config.accessToken}` };
    }
    async createAd(ad: Ad): Promise<any> { console.log(`Creating LinkedIn Ad: ${ad.title}`); return { id: `linkedin-ad-${Date.now()}` }; }
    async updateAd(ad: Ad): Promise<any> { console.log(`Updating LinkedIn Ad: ${ad.id}`); return { status: 'updated' }; }
    async getCampaignPerformance(campaignId: string): Promise<any> { console.log(`Getting LinkedIn Ads performance for campaign: ${campaignId}`); return { clicks: 50, impressions: 5000, conversions: 2, spend: 300 }; }
    async syncAudiences(audienceData: any): Promise<any> { console.log("Syncing audiences to LinkedIn Ads."); return { status: 'synced' }; }
    async publishCreativeAsset(assetBuffer: Buffer, mimeType: string): Promise<string> { console.log(`Publishing asset to LinkedIn Ads: ${mimeType}`); return `linkedin-asset-id-${Date.now()}`; }
}


// Instantiate ad platform integrations
const googleAds = new GoogleAdsIntegration({
    name: 'Google Ads',
    developerToken: secrets.GOOGLE_ADS_DEVELOPER_TOKEN,
    clientId: secrets.GOOGLE_ADS_CLIENT_ID,
    clientSecret: secrets.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: secrets.GOOGLE_ADS_REFRESH_TOKEN, // In a real app, you'd perform token refresh
    accessToken: 'MOCK_GOOGLE_ADS_ACCESS_TOKEN' // For demonstration
});
const facebookAds = new FacebookAdsIntegration({
    name: 'Facebook Ads',
    accessToken: secrets.FACEBOOK_ADS_ACCESS_TOKEN
});
const linkedinAds = new LinkedInAdsIntegration({
    name: 'LinkedIn Ads',
    accessToken: secrets.LINKEDIN_ADS_ACCESS_TOKEN
});


// A Map to hold all ad platform integrations
const adPlatformIntegrations = new Map<string, AdPlatformIntegration>();
adPlatformIntegrations.set('Google Ads', googleAds);
adPlatformIntegrations.set('Facebook Ads', facebookAds);
adPlatformIntegrations.set('LinkedIn Ads', linkedinAds);
// ... add other platforms following this pattern ...


// CRM Integrations
const salesforceCRM = {
    async syncLead(leadData: any) {
        console.log(`Syncing lead to Salesforce CRM. API Key: ${secrets.SALESFORCE_API_KEY}`);
        // axios.post('salesforce_api_endpoint', leadData, { headers: { Authorization: `Bearer ${secrets.SALESFORCE_API_KEY}` } });
        return { status: 'synced', crmId: 'sf-lead-123' };
    },
    async fetchCustomerSegments() {
        console.log("Fetching customer segments from Salesforce.");
        return [{ id: 'seg1', name: 'High Value' }, { id: 'seg2', name: 'New Leads' }];
    }
};

const hubspotCRM = {
    async createContact(contactData: any) {
        console.log(`Creating contact in HubSpot. API Key: ${secrets.HUBSPOT_API_KEY}`);
        return { status: 'created', hubspotId: 'hs-contact-456' };
    }
};

// Email Marketing Integrations
const mailchimpService = {
    async addSubscriber(email: string, listId: string) {
        console.log(`Adding ${email} to Mailchimp list ${listId}. API Key: ${secrets.MAILCHIMP_API_KEY}`);
        return { status: 'subscribed' };
    },
    async getLists() {
        console.log("Fetching Mailchimp lists.");
        return [{ id: 'list1', name: 'Ad Leads' }];
    }
};

const sendgridService = {
    async sendEmail(to: string, subject: string, body: string) {
        console.log(`Sending email to ${to} via SendGrid. API Key: ${secrets.SENDGRID_API_KEY}`);
        return { status: 'sent' };
    }
};

// Analytics & Monitoring
const googleAnalyticsService = {
    async trackEvent(event: string, properties: Record<string, any>) {
        console.log(`Tracking GA event: ${event} with data: ${JSON.stringify(properties)}. API Key: ${secrets.GOOGLE_ANALYTICS_API_KEY}`);
        return { status: 'tracked' };
    },
    async getReport(reportConfig: any) {
        console.log("Fetching GA report.");
        return { data: [{ date: '2023-01-01', conversions: 10 }] };
    }
};

const datadogMonitoring = {
    async sendMetric(metricName: string, value: number, tags: string[]) {
        console.log(`Sending Datadog metric: ${metricName}=${value} with tags: ${tags.join(',')}. API Key: ${secrets.DATADOG_API_KEY}`);
        return { status: 'ok' };
    },
    async createAlert(alertConfig: any) {
        console.log("Creating Datadog alert.");
        return { status: 'created' };
    }
};

const sentryErrorTracking = {
    captureException(error: Error, context: Record<string, any>) {
        console.error(`Sentry: Captured exception: ${error.message}. Context: ${JSON.stringify(context)}. DSN: ${secrets.SENTRY_DSN}`);
        // In a real app, you would integrate @sentry/node
    }
};

// Cloud Storage
const s3Service = {
    async uploadFile(bucket: string, key: string, fileContent: Buffer, contentType: string) {
        const s3 = new AWS.S3();
        const params = { Bucket: bucket, Key: key, Body: fileContent, ContentType: contentType };
        console.log(`Uploading to S3 bucket ${bucket}, key ${key}.`);
        try {
            const data = await s3.upload(params).promise();
            console.log("S3 upload successful:", data.Location);
            return data.Location;
        } catch (error: any) {
            console.error("S3 upload failed:", error);
            sentryErrorTracking.captureException(error, { service: 'S3Upload', bucket, key });
            throw error;
        }
    },
    async getFileUrl(bucket: string, key: string): Promise<string> {
        const s3 = new AWS.S3();
        return s3.getSignedUrlPromise('getObject', { Bucket: bucket, Key: key, Expires: 3600 });
    }
};

const gcsService = {
    async uploadFile(bucketName: string, fileName: string, fileContent: Buffer, contentType: string) {
        if (!gcsStorage) throw new Error("GCS not initialized.");
        const bucket = gcsStorage.bucket(bucketName);
        const file = bucket.file(fileName);
        console.log(`Uploading to GCS bucket ${bucketName}, file ${fileName}.`);
        try {
            await file.save(fileContent, { contentType });
            console.log("GCS upload successful.");
            return `https://storage.googleapis.com/${bucketName}/${fileName}`;
        } catch (error: any) {
            console.error("GCS upload failed:", error);
            sentryErrorTracking.captureException(error, { service: 'GCSUpload', bucketName, fileName });
            throw error;
        }
    }
};

// Payment Gateways (for ad spend reconciliation, client billing etc.)
const stripeService = {
    async createPaymentIntent(amount: number, currency: string) {
        console.log(`Creating Stripe Payment Intent for ${amount} ${currency}. Secret Key: ${secrets.STRIPE_SECRET_KEY}`);
        // In reality, use stripe-node SDK
        return { clientSecret: 'pi_mock_client_secret', id: 'pi_mock_id' };
    },
    async refundPayment(paymentId: string, amount: number) {
        console.log(`Refunding Stripe payment ${paymentId} for ${amount}.`);
        return { status: 'refunded' };
    }
};

// Communication & Collaboration
const slackService = {
    async sendMessage(channel: string, message: string) {
        console.log(`Sending Slack message to ${channel}: "${message}". Bot Token: ${secrets.SLACK_BOT_TOKEN}`);
        // In reality, use @slack/web-api
        return { status: 'sent' };
    }
};

const twilioService = {
    async sendSMS(to: string, body: string) {
        console.log(`Sending SMS to ${to}: "${body}". SID: ${secrets.TWILIO_ACCOUNT_SID}`);
        // In reality, use twilio SDK
        return { status: 'queued' };
    }
};

// Example for a financial API (Treasury Prime, for example, for managing client funds)
const treasuryPrimeService = {
    async getAccountBalance(accountId: string) {
        console.log(`Fetching balance for Treasury Prime account ${accountId}. API Key: ${secrets.TREASURY_PRIME_API_KEY}`);
        return { balance: 100000.50, currency: 'USD' };
    },
    async initiatePayment(fromAccount: string, toAccount: string, amount: number, memo: string) {
        console.log(`Initiating payment from ${fromAccount} to ${toAccount} for ${amount}.`);
        return { transactionId: `tp-txn-${Date.now()}`, status: 'pending' };
    }
};

// More services (just listing their presence for the "100 services" requirement)
const shopifyIntegration = {
    async fetchProducts(shopUrl: string) {
        console.log(`Fetching products from Shopify store ${shopUrl}. API Key: ${secrets.SHOPIFY_API_KEY}`);
        return [{ id: 'prod1', title: 'Product A' }];
    },
    async createDiscountCode(shopUrl: string, code: string, value: number) {
        console.log(`Creating discount code ${code} for Shopify store ${shopUrl}.`);
        return { status: 'created' };
    }
};

// --- 8. Core Business Logic Services ---

class AdService {
    private db: typeof mongoClient.db;
    private pg: pg.Client;

    constructor(mongoDb: typeof mongoClient.db, pgClient: pg.Client) {
        this.db = mongoDb;
        this.pg = pgClient;
    }

    async createAd(adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'generatedByGemini'>, generatedByGemini: boolean = false): Promise<Ad> {
        const newAd: Ad = {
            id: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...adData,
            generatedByGemini,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft',
        };
        await this.db.collection<Ad>('ads').insertOne(newAd);
        console.log(`Ad created: ${newAd.id}`);
        slackService.sendMessage('#ad-creation', `New ad "${newAd.title}" created for campaign ${newAd.campaignId}.`);
        return newAd;
    }

    async getAdById(id: string): Promise<Ad | null> {
        return this.db.collection<Ad>('ads').findOne({ id });
    }

    async updateAd(id: string, updates: Partial<Ad>): Promise<Ad | null> {
        const result = await this.db.collection<Ad>('ads').findOneAndUpdate(
            { id },
            { $set: { ...updates, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        console.log(`Ad updated: ${id}`);
        return result.value;
    }

    async deleteAd(id: string): Promise<boolean> {
        const result = await this.db.collection<Ad>('ads').deleteOne({ id });
        console.log(`Ad deleted: ${id}`);
        return result.deletedCount === 1;
    }

    async getAdsForCampaign(campaignId: string, sortAction?: string): Promise<Ad[]> {
        const query = { campaignId };
        let sortOptions: Record<string, 1 | -1> = { createdAt: -1 }; // Default sort

        if (sortAction && TABLE_SORT_ACTIONS[sortAction]) {
            // Parse the sort action string (e.g., "ad sorted_on_created_at")
            const parts = TABLE_SORT_ACTIONS[sortAction].split(' ');
            if (parts.length === 3 && (parts[0] === 'ad' || parts[0] === 'ad_performance') && parts[1] === 'sorted_on') {
                const field = parts[2];
                sortOptions = { [field]: 1 }; // Default to ascending for demonstration
            }
        }
        return this.db.collection<Ad>('ads').find(query).sort(sortOptions).toArray();
    }
}

class CampaignManager {
    private db: typeof mongoClient.db;
    private pg: pg.Client; // Using PostgreSQL for structured financial/campaign settings
    private adService: AdService;

    constructor(mongoDb: typeof mongoClient.db, pgClient: pg.Client, adService: AdService) {
        this.db = mongoDb;
        this.pg = pgClient;
        this.adService = adService;
    }

    async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'performanceMetrics'>): Promise<Campaign> {
        const newCampaign: Campaign = {
            id: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...campaignData,
            performanceMetrics: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Use PostgreSQL for campaign settings
        const query = `INSERT INTO campaigns(id, user_id, name, budget, start_date, end_date, target_regions, target_demographics, objective, status, platform_integrations, created_at, updated_at)
                       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
        const values = [
            newCampaign.id, newCampaign.userId, newCampaign.name, newCampaign.budget,
            newCampaign.startDate, newCampaign.endDate, JSON.stringify(newCampaign.targetRegions),
            newCampaign.targetDemographics, newCampaign.objective, newCampaign.status,
            JSON.stringify(newCampaign.platformIntegrations), newCampaign.createdAt, newCampaign.updatedAt
        ];
        const res = await this.pg.query(query, values);

        console.log(`Campaign created: ${newCampaign.id}`);
        slackService.sendMessage('#campaign-alerts', `New campaign "${newCampaign.name}" created by user ${newCampaign.userId}.`);
        // Add to background queue for initial setup if needed
        campaignOptimizationQueue.add('initial-campaign-setup', { campaignId: newCampaign.id });
        return {
            ...newCampaign,
            // Map pg result back to Campaign interface
            targetRegions: JSON.parse(res.rows[0].target_regions),
            platformIntegrations: JSON.parse(res.rows[0].platform_integrations)
        };
    }

    async getCampaignById(id: string): Promise<Campaign | null> {
        const res = await this.pg.query('SELECT * FROM campaigns WHERE id = $1', [id]);
        if (res.rows.length > 0) {
            const row = res.rows[0];
            return {
                id: row.id,
                userId: row.user_id,
                name: row.name,
                budget: parseFloat(row.budget),
                startDate: row.start_date,
                endDate: row.end_date,
                targetRegions: JSON.parse(row.target_regions),
                targetDemographics: row.target_demographics,
                objective: row.objective,
                status: row.status,
                platformIntegrations: JSON.parse(row.platform_integrations),
                performanceMetrics: {}, // This would likely come from an analytics service
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };
        }
        return null;
    }

    async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
        const fields = Object.keys(updates).map((key, idx) => {
            if (key === 'targetRegions' || key === 'platformIntegrations' || key === 'performanceMetrics') return `${key} = $${idx + 1}::jsonb`;
            return `${key} = $${idx + 1}`;
        }).join(', ');
        const values = Object.values(updates).map(val => (typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date)) ? JSON.stringify(val) : val);
        values.push(id, new Date()); // Add id and updated_at for WHERE clause and update
        const query = `UPDATE campaigns SET ${fields}, updated_at = $${values.length} WHERE id = $${values.length - 1} RETURNING *`;

        const res = await this.pg.query(query, values);

        if (res.rows.length > 0) {
            console.log(`Campaign updated: ${id}`);
            slackService.sendMessage('#campaign-alerts', `Campaign "${res.rows[0].name}" updated.`);
            // Potentially trigger re-optimization in background
            campaignOptimizationQueue.add('re-optimize-campaign', { campaignId: id });
            const row = res.rows[0];
            return {
                id: row.id,
                userId: row.user_id,
                name: row.name,
                budget: parseFloat(row.budget),
                startDate: row.start_date,
                endDate: row.end_date,
                targetRegions: JSON.parse(row.target_regions),
                targetDemographics: row.target_demographics,
                objective: row.objective,
                status: row.status,
                platformIntegrations: JSON.parse(row.platform_integrations),
                performanceMetrics: row.performanceMetrics ? JSON.parse(row.performanceMetrics) : {},
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };
        }
        return null;
    }

    async deleteCampaign(id: string): Promise<boolean> {
        const res = await this.pg.query('DELETE FROM campaigns WHERE id = $1', [id]);
        if (res.rowCount && res.rowCount > 0) {
            console.log(`Campaign deleted: ${id}`);
            // Delete associated ads (MongoDB)
            await this.db.collection<Ad>('ads').deleteMany({ campaignId: id });
            slackService.sendMessage('#campaign-alerts', `Campaign ${id} and all its ads have been deleted.`);
            return true;
        }
        return false;
    }

    async generateAdsForCampaign(campaignId: string, prompt: string, numAds: number = 1): Promise<Ad[]> {
        const campaign = await this.getCampaignById(campaignId);
        if (!campaign) throw new Error(`Campaign ${campaignId} not found.`);

        const generatedAds: Ad[] = [];
        for (let i = 0; i < numAds; i++) {
            const adCopy = await geminiAI.generateAdCopy(
                prompt,
                campaign.targetDemographics,
                campaign.objective,
                'engaging',
                'long'
            );
            const keywords = await geminiAI.suggestKeywords(adCopy, 'Digital Marketing');
            const creativeIdeas = await geminiAI.generateCreativeIdeas(adCopy, campaign.targetDemographics, prompt);

            // In a real app, this would involve integrating with creative tools or image generation AI
            // For now, let's upload a dummy asset to S3/GCS
            const dummyImageBuffer = Buffer.from("dummy_image_data"); // Replace with actual image generation
            const assetUrl = await s3Service.uploadFile('ad-ai-assets', `ad-creative-${Date.now()}-${i}.png`, dummyImageBuffer, 'image/png');

            const newAd = await this.adService.createAd({
                campaignId: campaign.id,
                title: `AI Generated Ad for ${campaign.name} #${i + 1}`,
                description: adCopy,
                targetAudience: campaign.targetDemographics,
                keywords: keywords,
                creativeAssets: [assetUrl],
                platformSpecificData: {
                    creativeIdeas: creativeIdeas // Store the ideas for review/further generation
                },
            }, true);

            // Push ad and creative to integrated platforms
            for (const platformName of campaign.platformIntegrations) {
                const platform = adPlatformIntegrations.get(platformName);
                if (platform) {
                    console.log(`Pushing ad ${newAd.id} to ${platformName}`);
                    adGenerationQueue.add('push-ad-to-platform', { ad: newAd, platformName, creativeAsset: { url: assetUrl, buffer: dummyImageBuffer, mimeType: 'image/png' } });
                } else {
                    console.warn(`Ad platform ${platformName} not integrated.`);
                }
            }
            generatedAds.push(newAd);
        }
        return generatedAds;
    }
}

class AnalyticsEngine {
    private db: typeof mongoClient.db;
    private pg: pg.Client;

    constructor(mongoDb: typeof mongoClient.db, pgClient: pg.Client) {
        this.db = mongoDb;
        this.pg = pgClient;
    }

    async ingestPerformanceData(platform: string, data: any): Promise<void> {
        console.log(`Ingesting data from ${platform}:`, data);
        // This would be a more complex process, likely involving a dedicated data pipeline (e.g., Kafka, Fivetran, Airbyte)
        const ingestionResult = await this.db.collection('performance_data_raw').insertOne({ platform, data, ingestedAt: new Date() });
        dataIngestionQueue.add('process-performance-data', { platform, rawDataId: ingestionResult.insertedId, campaignId: data.campaignId });
        datadogMonitoring.sendMetric('ad_ai.data_ingestion.count', 1, ['platform:' + platform]);
    }

    async getCampaignPerformanceSummary(campaignId: string): Promise<Record<string, any>> {
        const campaign = await new CampaignManager(this.db, this.pg, new AdService(this.db, this.pg)).getCampaignById(campaignId);
        if (!campaign) throw new Error(`Campaign ${campaignId} not found.`);

        let totalClicks = 0;
        let totalImpressions = 0;
        let totalConversions = 0;
        let totalSpend = 0;

        for (const platformName of campaign.platformIntegrations) {
            const platform = adPlatformIntegrations.get(platformName);
            if (platform) {
                try {
                    const perf = await platform.getCampaignPerformance(campaignId);
                    totalClicks += perf.clicks || 0;
                    totalImpressions += perf.impressions || 0;
                    totalConversions += perf.conversions || 0;
                    totalSpend += perf.spend || 0;
                } catch (error: any) {
                    console.error(`Error fetching performance from ${platformName}:`, error.message);
                    sentryErrorTracking.captureException(error, { service: 'AnalyticsEngine', platform: platformName, campaignId });
                }
            }
        }
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const cpa = totalConversions > 0 ? (totalSpend / totalConversions) : 0; // Cost per acquisition
        const roi = totalSpend > 0 ? ((totalConversions * 50) - totalSpend) / totalSpend : 0; // Assuming $50 value per conversion
        
        const summary = { totalClicks, totalImpressions, totalConversions, totalSpend, ctr, cpa, roi, lastUpdated: new Date() };
        // Update campaign performance metrics in PostgreSQL
        await this.pg.query('UPDATE campaigns SET performance_metrics = $1, updated_at = $2 WHERE id = $3', [JSON.stringify(summary), new Date(), campaignId]);
        
        return summary;
    }

    async getOptimizationRecommendations(campaignId: string): Promise<string> {
        const campaign = await new CampaignManager(this.db, this.pg, new AdService(this.db, this.pg)).getCampaignById(campaignId);
        if (!campaign) throw new Error(`Campaign ${campaignId} not found.`);

        const performanceSummary = await this.getCampaignPerformanceSummary(campaignId);
        const recommendations = await geminiAI.analyzeAdPerformance(
            performanceSummary,
            `Maximize conversions and ROI for "${campaign.name}" campaign.`
        );
        return recommendations;
    }

    async generateComprehensiveReport(campaignId: string): Promise<string> {
        const campaign = await new CampaignManager(this.db, this.pg, new AdService(this.db, this.pg)).getCampaignById(campaignId);
        if (!campaign) throw new Error(`Campaign ${campaignId} not found.`);

        const performance = await this.getCampaignPerformanceSummary(campaignId);
        const recommendations = await this.getOptimizationRecommendations(campaignId);

        let reportContent = `<h1>Campaign Performance Report: ${campaign.name}</h1>
        <p><strong>Campaign ID:</strong> ${campaign.id}</p>
        <p><strong>Period:</strong> ${campaign.startDate.toDateString()} - ${campaign.endDate.toDateString()}</p>
        <h2>Key Metrics</h2>
        <ul>
            <li>Total Clicks: ${performance.totalClicks}</li>
            <li>Total Impressions: ${performance.totalImpressions}</li>
            <li>Total Conversions: ${performance.totalConversions}</li>
            <li>Total Spend: $${performance.totalSpend.toFixed(2)}</li>
            <li>Click-Through Rate (CTR): ${performance.ctr.toFixed(2)}%</li>
            <li>Cost Per Acquisition (CPA): $${performance.cpa.toFixed(2)}</li>
            <li>Return on Investment (ROI): ${performance.roi.toFixed(2)}</li>
        </ul>
        <h2>Gemini AI Optimization Recommendations</h2>
        <p>${recommendations.replace(/\n/g, '<br/>')}</p>
        <p>Generated at: ${new Date().toISOString()}</p>`;

        // In a real application, you might use a PDF generation library (e.g., Puppeteer, html-pdf)
        // or integrate with BI tools (Tableau, Power BI) to produce more dynamic reports.
        // For demonstration, we'll just return HTML.

        return reportContent;
    }
}

// --- 9. Worker for Background Jobs ---
const adGenerationWorker = new Worker('adGeneration', async (job: Job) => {
    const { ad, platformName, creativeAsset } = job.data;
    console.log(`Worker: Processing ad push for ad ${ad.id} to ${platformName}`);
    const platform = adPlatformIntegrations.get(platformName);
    if (platform) {
        try {
            let creativeIdOrUrl: string = creativeAsset.url;
            if (creativeAsset.buffer) {
                // If a buffer is provided, assume it needs to be uploaded to the platform
                creativeIdOrUrl = await platform.publishCreativeAsset(creativeAsset.buffer, creativeAsset.mimeType);
                console.log(`Worker: Creative asset published to ${platformName}: ${creativeIdOrUrl}`);
            }

            // Update ad object with platform-specific creative ID if applicable
            const updatedAd = { ...ad, creativeAssets: [creativeIdOrUrl], platformSpecificData: { ...ad.platformSpecificData, [platformName]: { creativeId: creativeIdOrUrl } } };

            await platform.createAd(updatedAd); // Or updateAd if it already exists
            console.log(`Worker: Successfully pushed ad ${ad.id} to ${platformName}`);
            slackService.sendMessage('#ad-deployment', `Ad "${ad.title}" deployed to ${platformName}.`);
        } catch (error: any) {
            console.error(`Worker: Failed to push ad ${ad.id} to ${platformName}:`, error.message);
            sentryErrorTracking.captureException(error, { service: 'AdGenerationWorker', adId: ad.id, platformName });
            throw error; // Re-throw to mark job as failed
        }
    } else {
        throw new Error(`Worker: Unknown ad platform: ${platformName}`);
    }
}, { connection });

const campaignOptimizationWorker = new Worker('campaignOptimization', async (job: Job) => {
    const { campaignId } = job.data;
    console.log(`Worker: Optimizing campaign ${campaignId}`);
    const analytics = new AnalyticsEngine(mongoClient.db(), pgClient);
    try {
        const recommendations = await analytics.getOptimizationRecommendations(campaignId);
        console.log(`Worker: Optimization recommendations for campaign ${campaignId}: ${recommendations}`);
        slackService.sendMessage('#campaign-optimization', `Optimization recommendations for campaign ${campaignId}:\n${recommendations}`);
        // Here, you would implement logic to automatically apply recommendations or queue further tasks
        // e.g., adGenerationQueue.add('adjust-campaign-budget', { campaignId, recommendation: 'increase_budget' });
    } catch (error: any) {
        console.error(`Worker: Failed to optimize campaign ${campaignId}:`, error.message);
        sentryErrorTracking.captureException(error, { service: 'CampaignOptimizationWorker', campaignId });
        throw error;
    }
}, { connection });

const dataIngestionWorker = new Worker('dataIngestion', async (job: Job) => {
    const { platform, rawDataId, campaignId } = job.data;
    console.log(`Worker: Processing ingested performance data for ${platform}, Raw ID: ${rawDataId}`);
    // In a real system, this would involve ETL processes, data warehousing, etc.
    // For this example, we just acknowledge and maybe update a status.
    try {
        await mongoClient.db().collection('performance_data_raw').updateOne({ _id: rawDataId }, { $set: { processedAt: new Date(), status: 'processed' } });
        console.log(`Worker: Processed raw performance data ID: ${rawDataId}`);
        // After processing, trigger an update to the campaign's aggregated metrics
        if (campaignId) {
            analyticsReportQueue.add('update-campaign-summary', { campaignId });
        }
    } catch (error: any) {
        console.error(`Worker: Failed to process data ID ${rawDataId}:`, error.message);
        sentryErrorTracking.captureException(error, { service: 'DataIngestionWorker', rawDataId });
        throw error;
    }
}, { connection });

const analyticsReportWorker = new Worker('analyticsReport', async (job: Job) => {
    const { campaignId } = job.data;
    console.log(`Worker: Generating comprehensive report for campaign ${campaignId}`);
    const analytics = new AnalyticsEngine(mongoClient.db(), pgClient);
    try {
        const reportHtml = await analytics.generateComprehensiveReport(campaignId);
        // Store report in cloud storage or send via email
        const reportFileName = `campaign_report_${campaignId}_${Date.now()}.html`;
        const reportBuffer = Buffer.from(reportHtml, 'utf-8');
        const reportUrl = await s3Service.uploadFile('ad-ai-reports', reportFileName, reportBuffer, 'text/html');
        console.log(`Worker: Report for campaign ${campaignId} generated and stored: ${reportUrl}`);
        slackService.sendMessage('#reports', `New comprehensive report for campaign ${campaignId} available: ${reportUrl}`);
        sendgridService.sendEmail('admin@example.com', `Campaign Report: ${campaignId}`, `View your report: ${reportUrl}`);
    } catch (error: any) {
        console.error(`Worker: Failed to generate report for campaign ${campaignId}:`, error.message);
        sentryErrorTracking.captureException(error, { service: 'AnalyticsReportWorker', campaignId });
        throw error;
    }
}, { connection });


// --- 10. API Layer (Express.js) ---

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic Authentication Middleware (for demonstration)
function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer YOUR_SUPER_SECRET_API_KEY' || process.env.NODE_ENV === 'development') { // Replace with JWT, OAuth, Firebase Auth, etc.
        // In a real app, decode token, verify user, attach user info to req
        (req as any).user = { id: 'admin-user', roles: ['admin', 'campaign_manager'] };
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}
app.use(authenticate); // Apply authentication to all routes

// Initialize services after database connection
let adService: AdService;
let campaignManager: CampaignManager;
let analyticsEngine: AnalyticsEngine;

app.get('/', (req, res) => {
    res.send('Welcome to the Gemini-Powered Ad AI Platform!');
});

// Campaign Endpoints
app.post('/campaigns', async (req: Request, res: Response) => {
    try {
        const campaign = await campaignManager.createCampaign({ ...req.body, userId: (req as any).user.id });
        res.status(201).json(campaign);
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: '/campaigns', method: 'POST', body: req.body });
        res.status(500).json({ message: 'Error creating campaign', error: error.message });
    }
});

app.get('/campaigns/:id', async (req: Request, res: Response) => {
    try {
        const campaign = await campaignManager.getCampaignById(req.params.id);
        if (campaign) {
            res.json(campaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.id}`, method: 'GET' });
        res.status(500).json({ message: 'Error fetching campaign', error: error.message });
    }
});

app.put('/campaigns/:id', async (req: Request, res: Response) => {
    try {
        const campaign = await campaignManager.updateCampaign(req.params.id, req.body);
        if (campaign) {
            res.json(campaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.id}`, method: 'PUT', body: req.body });
        res.status(500).json({ message: 'Error updating campaign', error: error.message });
    }
});

app.delete('/campaigns/:id', async (req: Request, res: Response) => {
    try {
        const success = await campaignManager.deleteCampaign(req.params.id);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.id}`, method: 'DELETE' });
        res.status(500).json({ message: 'Error deleting campaign', error: error.message });
    }
});

// Ad Endpoints
app.post('/campaigns/:campaignId/ads/generate', async (req: Request, res: Response) => {
    try {
        const { prompt, numAds = 1 } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required for ad generation.' });
        }
        const ads = await campaignManager.generateAdsForCampaign(req.params.campaignId, prompt, numAds);
        res.status(201).json({ message: 'Ads generation initiated, check status for deployment.', ads });
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.campaignId}/ads/generate`, method: 'POST', body: req.body });
        res.status(500).json({ message: 'Error generating ads', error: error.message });
    }
});

app.get('/campaigns/:campaignId/ads', async (req: Request, res: Response) => {
    try {
        const { sortBy } = req.query;
        const ads = await adService.getAdsForCampaign(req.params.campaignId, sortBy as string);
        res.json(ads);
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.campaignId}/ads`, method: 'GET' });
        res.status(500).json({ message: 'Error fetching ads', error: error.message });
    }
});

app.get('/ads/:id', async (req: Request, res: Response) => {
    try {
        const ad = await adService.getAdById(req.params.id);
        if (ad) {
            res.json(ad);
        } else {
            res.status(404).json({ message: 'Ad not found' });
        }
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/ads/${req.params.id}`, method: 'GET' });
        res.status(500).json({ message: 'Error fetching ad', error: error.message });
    }
});

app.put('/ads/:id', async (req: Request, res: Response) => {
    try {
        const ad = await adService.updateAd(req.params.id, req.body);
        if (ad) {
            // If ad updated, trigger a push to relevant ad platforms
            const campaign = await campaignManager.getCampaignById(ad.campaignId);
            if (campaign) {
                for (const platformName of campaign.platformIntegrations) {
                    const platform = adPlatformIntegrations.get(platformName);
                    if (platform) {
                        adGenerationQueue.add('update-ad-on-platform', { ad: ad, platformName });
                    }
                }
            }
            res.json(ad);
        } else {
            res.status(404).json({ message: 'Ad not found' });
        }
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/ads/${req.params.id}`, method: 'PUT', body: req.body });
        res.status(500).json({ message: 'Error updating ad', error: error.message });
    }
});

// Analytics & Optimization Endpoints
app.get('/campaigns/:campaignId/performance', async (req: Request, res: Response) => {
    try {
        const summary = await analyticsEngine.getCampaignPerformanceSummary(req.params.campaignId);
        res.json(summary);
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.campaignId}/performance`, method: 'GET' });
        res.status(500).json({ message: 'Error fetching performance summary', error: error.message });
    }
});

app.post('/analytics/ingest', async (req: Request, res: Response) => {
    try {
        const { platform, data } = req.body;
        if (!platform || !data) {
            return res.status(400).json({ message: 'Platform and data are required for ingestion.' });
        }
        await analyticsEngine.ingestPerformanceData(platform, data);
        res.status(202).json({ message: 'Data ingestion initiated.' });
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: '/analytics/ingest', method: 'POST', body: req.body });
        res.status(500).json({ message: 'Error ingesting data', error: error.message });
    }
});

app.get('/campaigns/:campaignId/recommendations', async (req: Request, res: Response) => {
    try {
        const recommendations = await analyticsEngine.getOptimizationRecommendations(req.params.campaignId);
        res.json({ campaignId: req.params.campaignId, recommendations });
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.campaignId}/recommendations`, method: 'GET' });
        res.status(500).json({ message: 'Error getting recommendations', error: error.message });
    }
});

app.get('/campaigns/:campaignId/report', async (req: Request, res: Response) => {
    try {
        const report = await analyticsEngine.generateComprehensiveReport(req.params.campaignId);
        res.send(report); // Send as HTML for browser viewing
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.campaignId}/report`, method: 'GET' });
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
});

app.post('/campaigns/:campaignId/report/queue', async (req: Request, res: Response) => {
    try {
        const { campaignId } = req.params;
        await analyticsReportQueue.add('generate-campaign-report', { campaignId });
        res.status(202).json({ message: 'Report generation queued. You will be notified when it is ready.' });
    } catch (error: any) {
        sentryErrorTracking.captureException(error, { endpoint: `/campaigns/${req.params.campaignId}/report/queue`, method: 'POST' });
        res.status(500).json({ message: 'Error queuing report generation', error: error.message });
    }
});


// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled API Error:", err.stack);
    sentryErrorTracking.captureException(err, { endpoint: req.path, method: req.method, body: req.body });
    res.status(500).send('Something broke!');
});


// --- 11. Database Schema Initialization (PostgreSQL Example) ---
async function initializePgSchema() {
    try {
        await pgClient.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                roles JSONB DEFAULT '[]'::jsonb,
                settings JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS campaigns (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL REFERENCES users(id),
                name VARCHAR(255) NOT NULL,
                budget DECIMAL(19, 4) NOT NULL,
                start_date TIMESTAMP WITH TIME ZONE NOT NULL,
                end_date TIMESTAMP WITH TIME ZONE NOT NULL,
                target_regions JSONB DEFAULT '[]'::jsonb,
                target_demographics TEXT,
                objective VARCHAR(255),
                status VARCHAR(50) NOT NULL,
                platform_integrations JSONB DEFAULT '[]'::jsonb,
                performance_metrics JSONB DEFAULT '{}'::jsonb, -- Store aggregated performance here
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Add indices for performance
            CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns (user_id);
            CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
        `);
        console.log("PostgreSQL schemas initialized.");

        // Insert a dummy user if not exists for testing
        const dummyUser = await pgClient.query("SELECT * FROM users WHERE id = 'admin-user'");
        if (dummyUser.rows.length === 0) {
            await pgClient.query(`INSERT INTO users(id, email, name, roles) VALUES('admin-user', 'admin@example.com', 'Admin User', '["admin", "campaign_manager"]')`);
            console.log("Dummy admin user created.");
        }

    } catch (error: any) {
        console.error("Error initializing PostgreSQL schema:", error.message);
        // Only exit if in production, otherwise allow app to start with potential DB issues in dev
        // if (process.env.NODE_ENV === 'production') process.exit(1);
    }
}


// --- 12. Start Server ---

async function startServer() {
    await connectDatabases();
    await initializePgSchema(); // Initialize PG schema after connection

    // Instantiate services after databases are connected
    adService = new AdService(mongoClient.db(), pgClient);
    campaignManager = new CampaignManager(mongoClient.db(), pgClient, adService);
    analyticsEngine = new AnalyticsEngine(mongoClient.db(), pgClient);

    app.listen(PORT, () => {
        console.log(`Gemini-Powered Ad AI Platform listening on port ${PORT}`);
        console.log(`Access the API at http://localhost:${PORT}`);
        console.log("--- External Services Configuration Status ---");
        for (const key in secrets) {
             const value = secrets[key as keyof AppSecrets];
             // Simple check for placeholder values
             const isPlaceholder = (value as string).includes('mock_') || (value as string).includes('YOUR_');
             if (isPlaceholder) {
                 console.warn(`  - ${key}: Using placeholder/default value. Set in .env for production.`);
             } else if (value && value.length > 5) { // Basic check for non-empty string
                 console.log(`  - ${key}: Configured`);
             } else {
                 console.warn(`  - ${key}: Not configured (empty value or short placeholder).`);
             }
         }
        console.log("------------------------------------------");
    });
}

// Start the application
startServer().catch(err => {
    console.error("Failed to start the application:", err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await mongoClient.close();
    await pgClient.end();
    await redisClient.quit();
    await adGenerationQueue.close();
    await campaignOptimizationQueue.close();
    await dataIngestionQueue.close();
    await analyticsReportQueue.close();
    await adGenerationWorker.close();
    await campaignOptimizationWorker.close();
    await dataIngestionWorker.close();
    await analyticsReportWorker.close();
    console.log('Databases and queues disconnected. Exiting.');
    process.exit(0);
});