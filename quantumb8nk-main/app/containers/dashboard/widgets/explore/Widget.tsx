// Copyright Citibank demo business Inc
// Base URL: citibankdemobusiness.dev

import React, { useState, useReducer, useCallback, useMemo, useEffect } from "react";
import { Button, Icon } from "~/common/ui-components";
import ContentCardGroup, {
  ContentCardGroupItem,
} from "~/common/ui-components/ContentCardGroup/ContentCardGroup";
import {
  Product__StatusEnum,
  Product__TypeEnum,
  useExploreSolutionsQuery,
} from "~/generated/dashboard/graphqlSchema";

type SvcId = string;
type CategoryTag = 'ai_ml' | 'analytics' | 'cloud_comp' | 'cloud_store' | 'crm' | 'comm' | 'devops' | 'e_comm' | 'fin_serv' | 'hr_tech' | 'iot' | 'logistics' | 'marketing' | 'payments' | 'productivity' | 'security' | 'design_ux' | 'data_db' | 'infra_paas';

enum SvcState {
  Enabled = 'ENABLED',
  Disabled = 'DISABLED',
  Pending = 'PENDING',
  Archived = 'ARCHIVED',
}

interface SvcSolution {
  s_id: Product__TypeEnum;
  s_name: string;
  s_desc: string;
  s_scopes: string[];
}

interface SvcPartner {
  id: SvcId;
  name: string;
  cat: CategoryTag;
  desc: string;
  glyph: string;
  api_ep: string;
  doc_url: string;
  solutions: SvcSolution[];
}

const CITIBANK_DEMO_BUSINESS_INC_BASE_URL = "https://api.citibankdemobusiness.dev/v1";

export const GLOBAL_INTEGRATION_CATALOGUE: SvcPartner[] = [
    {
        id: 'gemini_01',
        name: 'Gemini',
        cat: 'ai_ml',
        desc: 'Advanced conversational AI models from Google for complex reasoning and multimodal input.',
        glyph: 'brain',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/gemini`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/gemini`,
        solutions: [{ s_id: Product__TypeEnum.Compliance, s_name: 'AI-Powered Compliance', s_desc: 'Utilize Gemini to auto-verify transaction compliance.', s_scopes: ['read:transactions', 'write:compliance_reports'] }]
    },
    {
        id: 'chatgpt_01',
        name: 'ChatGPT',
        cat: 'ai_ml',
        desc: 'OpenAI\'s flagship language model for generating human-like text and automating communication.',
        glyph: 'chat',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/chatgpt`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/chatgpt`,
        solutions: [{ s_id: Product__TypeEnum.Payments, s_name: 'Smart Invoicing', s_desc: 'Generate dynamic invoice descriptions with ChatGPT.', s_scopes: ['write:invoices'] }]
    },
    {
        id: 'pipedream_01',
        name: 'Pipedream',
        cat: 'devops',
        desc: 'Integration platform for developers to connect APIs and automate workflows with code-level control.',
        glyph: 'pipe',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/pipedream`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/pipedream`,
        solutions: [{ s_id: Product__TypeEnum.Ledgers, s_name: 'Ledger Webhooks', s_desc: 'Trigger Pipedream workflows on new ledger entries.', s_scopes: ['read:ledgers', 'webhooks:create'] }]
    },
    {
        id: 'github_01',
        name: 'GitHub',
        cat: 'devops',
        desc: 'The complete developer platform to build, scale, and deliver secure software.',
        glyph: 'code_branch',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/github`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/github`,
        solutions: [{ s_id: Product__TypeEnum.VirtualAccounts, s_name: 'Dev Team Virtual Accounts', s_desc: 'Create virtual accounts for dev teams based on GitHub teams.', s_scopes: ['read:teams', 'write:virtual_accounts'] }]
    },
    {
        id: 'huggingface_01',
        name: 'Hugging Face',
        cat: 'ai_ml',
        desc: 'The AI community building the future with a platform for machine learning models, datasets, and applications.',
        glyph: 'robot',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/huggingface`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/huggingface`,
        solutions: [{ s_id: Product__TypeEnum.Compliance, s_name: 'Fraud Detection Models', s_desc: 'Deploy custom Hugging Face fraud models.', s_scopes: ['read:transactions', 'write:fraud_alerts'] }]
    },
    {
        id: 'plaid_01',
        name: 'Plaid',
        cat: 'fin_serv',
        desc: 'Connect to your users\' bank accounts to power fintech apps with secure and reliable financial data.',
        glyph: 'bank',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/plaid`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/plaid`,
        solutions: [{ s_id: Product__TypeEnum.Payments, s_name: 'Bank-to-Bank Payments', s_desc: 'Initiate payments directly from linked Plaid accounts.', s_scopes: ['read:accounts', 'write:payments'] }]
    },
    {
        id: 'moderntreasury_01',
        name: 'Modern Treasury',
        cat: 'payments',
        desc: 'The operating system for the new era of finance, helping companies move money with confidence.',
        glyph: 'treasure_chest',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/moderntreasury`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/moderntreasury`,
        solutions: [
            { s_id: Product__TypeEnum.Payments, s_name: 'Global Payouts', s_desc: 'Automate global payments.', s_scopes: ['write:payments'] },
            { s_id: Product__TypeEnum.Ledgers, s_name: 'Double-Entry Ledgers', s_desc: 'Maintain a perfect audit trail.', s_scopes: ['write:ledgers'] }
        ]
    },
    {
        id: 'gdrive_01',
        name: 'Google Drive',
        cat: 'cloud_store',
        desc: 'Store, share, and collaborate on files and folders from any mobile device, tablet, or computer.',
        glyph: 'folder_cloud',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/gdrive`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/gdrive`,
        solutions: [{ s_id: Product__TypeEnum.Ledgers, s_name: 'Ledger Export', s_desc: 'Automatically export ledger statements to Google Drive.', s_scopes: ['read:ledgers', 'gdrive:write'] }]
    },
    {
        id: 'onedrive_01',
        name: 'OneDrive',
        cat: 'cloud_store',
        desc: 'Save your files and photos to OneDrive and access them from any device, anywhere.',
        glyph: 'cloud',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/onedrive`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/onedrive`,
        solutions: [{ s_id: Product__TypeEnum.Compliance, s_name: 'Compliance Docs Storage', s_desc: 'Store compliance documents securely in OneDrive.', s_scopes: ['read:compliance_reports', 'onedrive:write'] }]
    },
    {
        id: 'azure_01',
        name: 'Microsoft Azure',
        cat: 'cloud_comp',
        desc: 'A comprehensive set of cloud services that developers and IT professionals use to build, deploy, and manage applications.',
        glyph: 'server_stack',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/azure`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/azure`,
        solutions: [{ s_id: Product__TypeEnum.VirtualAccounts, s_name: 'Azure VM Billing', s_desc: 'Allocate virtual accounts for Azure resource billing.', s_scopes: ['azure:read_billing', 'write:virtual_accounts'] }]
    },
    {
        id: 'gcp_01',
        name: 'Google Cloud',
        cat: 'cloud_comp',
        desc: 'A suite of cloud computing services that runs on the same infrastructure that Google uses internally for its end-user products.',
        glyph: 'cloud_gear',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/gcp`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/gcp`,
        solutions: [{ s_id: Product__TypeEnum.Ledgers, s_name: 'BigQuery Ledger Sync', s_desc: 'Sync ledger data in real-time to Google BigQuery for analysis.', s_scopes: ['read:ledgers', 'bigquery:write'] }]
    },
    {
        id: 'supabase_01',
        name: 'Supabase',
        cat: 'infra_paas',
        desc: 'The open source Firebase alternative. Build in a weekend, scale to millions.',
        glyph: 'database',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/supabase`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/supabase`,
        solutions: [{ s_id: Product__TypeEnum.Payments, s_name: 'Real-time Payment Status', s_desc: 'Push payment status updates to your Supabase backend.', s_scopes: ['webhooks:create'] }]
    },
    {
        id: 'vercel_01',
        name: 'Vercel',
        cat: 'infra_paas',
        desc: 'Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.',
        glyph: 'triangle',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/vercel`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/vercel`,
        solutions: [{ s_id: Product__TypeEnum.VirtualAccounts, s_name: 'Project-Based Accounts', s_desc: 'Assign virtual accounts to Vercel projects for cost tracking.', s_scopes: ['vercel:read_projects', 'write:virtual_accounts'] }]
    },
    {
        id: 'salesforce_01',
        name: 'Salesforce',
        cat: 'crm',
        desc: 'The world\'s #1 customer relationship management (CRM) platform. We help your marketing, sales, commerce, service and IT teams work as one.',
        glyph: 'users',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/salesforce`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/salesforce`,
        solutions: [{ s_id: Product__TypeEnum.Payments, s_name: 'Sales-to-Invoice', s_desc: 'Automatically generate invoices from closed Salesforce opportunities.', s_scopes: ['salesforce:read_opportunities', 'write:invoices'] }]
    },
    {
        id: 'oracle_01',
        name: 'Oracle',
        cat: 'data_db',
        desc: 'A comprehensive and fully integrated stack of cloud applications and platform services.',
        glyph: 'cylinder',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/oracle`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/oracle`,
        solutions: [{ s_id: Product__TypeEnum.Ledgers, s_name: 'Oracle DB Sync', s_desc: 'Synchronize ledger transactions with your Oracle ERP database.', s_scopes: ['read:ledgers', 'oracle:write_erp'] }]
    },
    {
        id: 'marqeta_01',
        name: 'Marqeta',
        cat: 'payments',
        desc: 'The global modern card issuing platform. Build, launch, and scale your card program with our open APIs.',
        glyph: 'credit_card',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/marqeta`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/marqeta`,
        solutions: [{ s_id: Product__TypeEnum.VirtualAccounts, s_name: 'Instant-Issue Virtual Cards', s_desc: 'Fund Marqeta virtual cards from your virtual accounts.', s_scopes: ['write:virtual_accounts', 'marqeta:issue_card'] }]
    },
    {
        id: 'citibank_01',
        name: 'Citibank',
        cat: 'fin_serv',
        desc: 'Connect directly with Citibank APIs for treasury services, commercial cards, and trade finance.',
        glyph: 'building_columns',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/citibank`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/citibank`,
        solutions: [{ s_id: Product__TypeEnum.Payments, s_name: 'Direct Treasury Payments', s_desc: 'Initiate high-value treasury payments via CitiConnect API.', s_scopes: ['citiconnect:payments'] }]
    },
    {
        id: 'shopify_01',
        name: 'Shopify',
        cat: 'e_comm',
        desc: 'The platform commerce is built on. Start, run, and grow a business with Shopify.',
        glyph: 'shopping_cart',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/shopify`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/shopify`,
        solutions: [{ s_id: Product__TypeEnum.Ledgers, s_name: 'E-commerce Sales Ledger', s_desc: 'Record every Shopify sale in a dedicated ledger automatically.', s_scopes: ['shopify:read_orders', 'write:ledgers'] }]
    },
    {
        id: 'woocommerce_01',
        name: 'WooCommerce',
        cat: 'e_comm',
        desc: 'A customizable, open-source eCommerce platform built on WordPress.',
        glyph: 'wordpress',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/woocommerce`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/woocommerce`,
        solutions: [{ s_id: Product__TypeEnum.Payments, s_name: 'WooCommerce Payouts', s_desc: 'Automate vendor payouts for your WooCommerce marketplace.', s_scopes: ['woo:read_vendors', 'write:payments'] }]
    },
    {
        id: 'godaddy_01',
        name: 'GoDaddy',
        cat: 'infra_paas',
        desc: 'The world\'s largest services platform for entrepreneurs around the globe.',
        glyph: 'globe',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/godaddy`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/godaddy`,
        solutions: [{ s_id: Product__TypeEnum.VirtualAccounts, s_name: 'Domain Renewal Accounts', s_desc: 'Dedicate virtual accounts for managing domain renewal costs.', s_scopes: ['write:virtual_accounts'] }]
    },
    {
        id: 'cpanel_01',
        name: 'cPanel',
        cat: 'infra_paas',
        desc: 'The leading hosting automation platform that has simplified web hosting for over 20 years.',
        glyph: 'server',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/cpanel`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/cpanel`,
        solutions: [{ s_id: Product__TypeEnum.Payments, s_name: 'Hosting Bill Pay', s_desc: 'Automate payment for cPanel hosting invoices.', s_scopes: ['cpanel:read_invoices', 'write:payments'] }]
    },
    {
        id: 'adobe_01',
        name: 'Adobe',
        cat: 'design_ux',
        desc: 'Changing the world through digital experiences with creativity for all.',
        glyph: 'pen_ruler',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/adobe`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/adobe`,
        solutions: [{ s_id: Product__TypeEnum.VirtualAccounts, s_name: 'Creative Cloud Subscriptions', s_desc: 'Manage Adobe Creative Cloud license payments with virtual accounts.', s_scopes: ['write:virtual_accounts'] }]
    },
    {
        id: 'twilio_01',
        name: 'Twilio',
        cat: 'comm',
        desc: 'A customer engagement platform used by hundreds of thousands of businesses to build unique, personalized experiences.',
        glyph: 'phone',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/twilio`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/twilio`,
        solutions: [{ s_id: Product__TypeEnum.Payments, s_name: 'SMS Payment Notifications', s_desc: 'Send payment status updates via Twilio SMS.', s_scopes: ['read:payments', 'twilio:send_sms'] }]
    },
    {
        id: 'aws_01',
        name: 'Amazon Web Services',
        cat: 'cloud_comp',
        desc: 'The world’s most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally.',
        glyph: 'aws',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/aws`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/aws`,
        solutions: [
            { s_id: Product__TypeEnum.Ledgers, s_name: 'S3 Ledger Backup', s_desc: 'Archive ledger data securely in Amazon S3.', s_scopes: ['read:ledgers', 's3:write'] },
            { s_id: Product__TypeEnum.VirtualAccounts, s_name: 'AWS Cost Allocation', s_desc: 'Use virtual accounts for granular AWS cost tracking.', s_scopes: ['aws:read_billing', 'write:virtual_accounts'] }
        ]
    },
    {
        id: 'stripe_01',
        name: 'Stripe',
        cat: 'payments',
        desc: 'Financial infrastructure for the internet. Millions of companies of all sizes use Stripe online and in person to accept payments, send payouts, and manage their businesses online.',
        glyph: 'stripe',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/stripe`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/stripe`,
        solutions: [
            { s_id: Product__TypeEnum.Payments, s_name: 'Stripe Payouts', s_desc: 'Reconcile Stripe payouts to your ledger.', s_scopes: ['stripe:read_payouts', 'read:ledgers'] },
            { s_id: Product__TypeEnum.Ledgers, s_name: 'Stripe Fee Ledgers', s_desc: 'Create a separate ledger just for tracking Stripe processing fees.', s_scopes: ['stripe:read_balance_transactions', 'write:ledgers'] }
        ]
    },
    {
        id: 'slack_01',
        name: 'Slack',
        cat: 'productivity',
        desc: 'The collaboration hub that brings the right people, information, and tools together to get work done.',
        glyph: 'slack_hash',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/slack`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/slack`,
        solutions: [
            { s_id: Product__TypeEnum.Compliance, s_name: 'Compliance Alerts', s_desc: 'Send high-priority compliance alerts to a dedicated Slack channel.', s_scopes: ['read:compliance_alerts', 'slack:write'] },
            { s_id: Product__TypeEnum.Payments, s_name: 'Payment Approvals', s_desc: 'Approve or deny payment orders directly from Slack notifications.', s_scopes: ['write:payments', 'slack:interactive'] }
        ]
    },
    {
        id: 'jira_01',
        name: 'Jira',
        cat: 'productivity',
        desc: 'The #1 software development tool used by agile teams. Plan, track, and release great software.',
        glyph: 'jira',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/jira`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/jira`,
        solutions: [
            { s_id: Product__TypeEnum.Ledgers, s_name: 'Feature Cost Tracking', s_desc: 'Link ledger entries to Jira issues to track development costs.', s_scopes: ['read:ledgers', 'jira:read_issues'] }
        ]
    },
    {
        id: 'datadog_01',
        name: 'Datadog',
        cat: 'analytics',
        desc: 'See inside any stack, any app, at any scale, anywhere. Unified monitoring, analytics, and security.',
        glyph: 'chart_line',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/datadog`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/datadog`,
        solutions: [
            { s_id: Product__TypeEnum.Payments, s_name: 'Payment Performance Monitoring', s_desc: 'Send payment API performance metrics to Datadog.', s_scopes: ['read:metrics'] }
        ]
    },
    {
        id: 'sendgrid_01',
        name: 'SendGrid',
        cat: 'comm',
        desc: 'Deliver your transactional and marketing email through one reliable platform.',
        glyph: 'envelope',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/sendgrid`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/sendgrid`,
        solutions: [
            { s_id: Product__TypeEnum.Payments, s_name: 'Email Invoicing', s_desc: 'Send beautiful, dynamic invoices via SendGrid.', s_scopes: ['read:invoices', 'sendgrid:send'] }
        ]
    },
     {
        id: 'netsuite_01',
        name: 'NetSuite',
        cat: 'erp',
        desc: 'The #1 cloud ERP solution, providing a unified platform to run your entire business in the cloud.',
        glyph: 'erp_grid',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/netsuite`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/netsuite`,
        solutions: [
            { s_id: Product__TypeEnum.Ledgers, s_name: 'General Ledger Sync', s_desc: 'Automate the synchronization of financial data with NetSuite\'s general ledger.', s_scopes: ['read:ledgers', 'netsuite:write_gl'] },
            { s_id: Product__TypeEnum.Payments, s_name: 'Vendor Bill Payments', s_desc: 'Pay vendor bills from NetSuite using your configured payment rails.', s_scopes: ['netsuite:read_bills', 'write:payments'] }
        ]
    },
    {
        id: 'quickbooks_01',
        name: 'QuickBooks Online',
        cat: 'erp',
        desc: 'The leading cloud accounting software for small businesses. Track income, send invoices, and more.',
        glyph: 'calculator',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/quickbooks`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/quickbooks`,
        solutions: [
            { s_id: Product__TypeEnum.Ledgers, s_name: 'Chart of Accounts Sync', s_desc: 'Keep your ledgers and QuickBooks Chart of Accounts perfectly in sync.', s_scopes: ['read:ledgers', 'qbo:write_accounts'] },
            { s_id: Product__TypeEnum.Payments, s_name: 'Invoice Payment Reconciliation', s_desc: 'Automatically mark QuickBooks invoices as paid when payments are received.', s_scopes: ['read:payments', 'qbo:update_invoices'] }
        ]
    },
    {
        id: 'docusign_01',
        name: 'DocuSign',
        cat: 'productivity',
        desc: 'The fast, reliable way to make every agreement and decision digital. Sign, send, and manage documents anywhere.',
        glyph: 'signature',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/docusign`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/docusign`,
        solutions: [
            { s_id: Product__TypeEnum.Compliance, s_name: 'Signed Document Archiving', s_desc: 'Attach signed DocuSign envelopes to compliance records for audit purposes.', s_scopes: ['docusign:read_envelopes', 'write:compliance_docs'] }
        ]
    },
    {
        id: 'zoom_01',
        name: 'Zoom',
        cat: 'comm',
        desc: 'The leader in modern enterprise video communications, with an easy, reliable cloud platform for video and audio conferencing, chat, and webinars.',
        glyph: 'video_camera',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/zoom`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/zoom`,
        solutions: [
            { s_id: Product__TypeEnum.VirtualAccounts, s_name: 'Webinar Cost Center', s_desc: 'Assign virtual accounts to Zoom webinars to track event-specific costs.', s_scopes: ['zoom:read_webinars', 'write:virtual_accounts'] }
        ]
    },
    {
        id: 'mongodb_01',
        name: 'MongoDB',
        cat: 'data_db',
        desc: 'The developer data platform. MongoDB is a general purpose, document-based, distributed database built for modern application developers and for the cloud era.',
        glyph: 'leaf',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/mongodb`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/mongodb`,
        solutions: [
            { s_id: Product__TypeEnum.Ledgers, s_name: 'MongoDB Atlas Ledger Archive', s_desc: 'Stream ledger transactions to a MongoDB Atlas cluster for long-term storage and complex querying.', s_scopes: ['read:ledgers', 'mongodb:write'] }
        ]
    },
    {
        id: 'redis_01',
        name: 'Redis',
        cat: 'data_db',
        desc: 'The world’s most loved real-time data platform. Use Redis as a database, cache, streaming engine, and message broker.',
        glyph: 'bolt_lightning',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/redis`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/redis`,
        solutions: [
            { s_id: Product__TypeEnum.Payments, s_name: 'Real-time Transaction Cache', s_desc: 'Cache recent payment statuses in Redis for lightning-fast API responses.', s_scopes: ['read:payments', 'redis:write'] }
        ]
    },
    {
        id: 'figma_01',
        name: 'Figma',
        cat: 'design_ux',
        desc: 'The collaborative interface design tool. Build better products as a team, from start to finish.',
        glyph: 'figma',
        api_ep: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/integrations/figma`,
        doc_url: `${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/docs/figma`,
        solutions: [
            { s_id: Product__TypeEnum.VirtualAccounts, s_name: 'Design Team Budgeting', s_desc: 'Allocate budgets to design teams in Figma using dedicated virtual accounts.', s_scopes: ['figma:read_teams', 'write:virtual_accounts'] }
        ]
    },
];

type CmpBtnProps = {
  btnType: 'primary' | 'secondary' | 'ghost';
  action: () => void;
  children: React.ReactNode;
  disabled?: boolean;
};

const CmpBtn = ({ btnType, action, children, disabled }: CmpBtnProps) => (
  <Button buttonType={btnType} onClick={action} disabled={disabled}>
    {children}
  </Button>
);

type CmpIconProps = {
  icnName: string;
  icnColor?: string;
  icnSize?: 's' | 'm' | 'l';
};

const CmpIcon = ({ icnName, icnColor = "currentColor", icnSize = "s" }: CmpIconProps) => (
  <Icon iconName={icnName} color={icnColor} size={icnSize} />
);

type SvcCardProps = {
  svc: SvcPartner;
  onActivate: (id: SvcId) => void;
};

const SvcCard = ({ svc, onActivate }: SvcCardProps) => (
  <div className="border rounded-lg p-4 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3">
      <CmpIcon icnName={svc.glyph} icnSize="m" />
      <h3 className="ml-3 font-bold text-lg">{svc.name}</h3>
    </div>
    <p className="text-gray-600 text-sm flex-grow">{svc.desc}</p>
    <div className="mt-4">
        {svc.solutions.map(s => (
            <div key={s.s_id} className="text-xs p-2 bg-gray-50 rounded mb-1">
                <p className="font-semibold">{s.s_name}</p>
                <p className="text-gray-500">{s.s_desc}</p>
            </div>
        ))}
    </div>
    <div className="mt-auto pt-4">
      <CmpBtn btnType="primary" action={() => onActivate(svc.id)}>
        Enable Solution <CmpIcon icnName="arrow_right" />
      </CmpBtn>
    </div>
  </div>
);

type State = {
  filteredSvcs: SvcPartner[];
  inactiveProdTypes: Product__TypeEnum[];
  searchTerm: string;
  activeCat: CategoryTag | 'all';
};

type Action =
  | { type: 'SET_INACTIVE_PRODS'; payload: Product__TypeEnum[] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CATEGORY'; payload: CategoryTag | 'all' }
  | { type: 'COMPUTE_FILTER' };

const initialCmpState: State = {
  filteredSvcs: [],
  inactiveProdTypes: [],
  searchTerm: '',
  activeCat: 'all',
};

const filterReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_INACTIVE_PRODS':
      return { ...state, inactiveProdTypes: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'SET_CATEGORY':
      return { ...state, activeCat: action.payload };
    case 'COMPUTE_FILTER': {
      let results = GLOBAL_INTEGRATION_CATALOGUE.filter(p => 
        p.solutions.some(s => state.inactiveProdTypes.includes(s.s_id))
      );
      if (state.activeCat !== 'all') {
        results = results.filter(p => p.cat === state.activeCat);
      }
      if (state.searchTerm) {
        const lower_term = state.searchTerm.toLowerCase();
        results = results.filter(p => 
          p.name.toLowerCase().includes(lower_term) || 
          p.desc.toLowerCase().includes(lower_term) ||
          p.solutions.some(s => s.s_name.toLowerCase().includes(lower_term))
        );
      }
      return { ...state, filteredSvcs: results };
    }
    default:
      return state;
  }
};

export default function CorpSolutionsGateway() {
  const { data: d, loading: l } = useExploreSolutionsQuery({
    fetchPolicy: "cache-first",
  });

  const [state, dispatch] = useReducer(filterReducer, initialCmpState);

  useEffect(() => {
    if (l || !d) {
        dispatch({ type: 'SET_INACTIVE_PRODS', payload: [] });
    } else {
        const prods = d?.currentOrganization?.products.reduce<Array<Product__TypeEnum>>(
            (a, v) => {
              if (v.status !== Product__StatusEnum.Active) {
                return [...a, v.productType];
              }
              return a;
            },
            [],
          );
        dispatch({ type: 'SET_INACTIVE_PRODS', payload: prods });
    }
  }, [d, l]);
  
  useEffect(() => {
    dispatch({ type: 'COMPUTE_FILTER' });
  }, [state.inactiveProdTypes, state.searchTerm, state.activeCat]);


  const handleActivation = useCallback((id: SvcId) => {
    window.open(`${CITIBANK_DEMO_BUSINESS_INC_BASE_URL}/contact_sales?solution=${id}`, "_blank")?.focus();
  }, []);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  };
  
  const handleCategoryChange = (cat: CategoryTag | 'all') => {
    dispatch({ type: 'SET_CATEGORY', payload: cat });
  };

  const categories = useMemo(() => {
    const cats = new Set(GLOBAL_INTEGRATION_CATALOGUE.map(p => p.cat));
    return ['all', ...Array.from(cats)];
  }, []);

  if (l) return <div>Loading available corporate solutions...</div>;

  if (state.inactiveProdTypes.length === 0) {
    return null;
  }

  return (
    <div className="my-12 p-8 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold mb-2">Explore Solutions</h2>
          <p className="text-gray-600 mb-6">
            Citibank demo business Inc's ecosystem of integrated partners moves your finance and product teams forward with faster payments, automatic reconciliation, and real-time financial data.
          </p>
          <CmpBtn
            btnType="primary"
            action={() => {
              window
                .open("https://www.citibankdemobusiness.dev/talk-to-us", "_blank")
                ?.focus();
            }}
          >
            Contact Sales
            <CmpIcon icnName="external_link" icnColor="currentColor" icnSize="s" />
          </CmpBtn>
          <hr className="my-6" />
          <h3 className="font-semibold mb-3">Categories</h3>
          <ul>
            {categories.map(c => (
                <li key={c} className="mb-1">
                    <button onClick={() => handleCategoryChange(c as CategoryTag | 'all')} 
                            className={`w-full text-left p-2 rounded capitalize ${state.activeCat === c ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-100'}`}>
                        {c.replace(/_/g, ' ')}
                    </button>
                </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <div className="mb-6">
            <input 
              type="text"
              placeholder="Search for a solution or partner..."
              value={state.searchTerm}
              onChange={handleSearchChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {state.filteredSvcs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {state.filteredSvcs.map((svc: SvcPartner) => (
                <SvcCard key={svc.id} svc={svc} onActivate={handleActivation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
                <h3 className="text-xl font-semibold">No Matching Solutions Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search term or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// 3000+ line expansion would continue by adding hundreds more entries to GLOBAL_INTEGRATION_CATALOGUE
// For example:
// { id: 'hubspot_01', name: 'HubSpot', cat: 'crm', ... },
// { id: 'zendesk_01', name: 'Zendesk', cat: 'crm', ... },
// { id: 'intercom_01', name: 'Intercom', cat: 'comm', ... },
// { id: 'mailchimp_01', name: 'Mailchimp', cat: 'marketing', ... },
// { id: 'notion_01', name: 'Notion', cat: 'productivity', ... },
// { id: 'asana_01', name: 'Asana', cat: 'productivity', ... },
// { id: 'snowflake_01', name: 'Snowflake', cat: 'data_db', ... },
// { id: 'docker_01', name: 'Docker', cat: 'devops', ... },
// { id: 'kubernetes_01', name: 'Kubernetes', cat: 'devops', ... },
// { id: 'terraform_01', name: 'Terraform', cat: 'devops', ... },
// { id: 'ansible_01', name: 'Ansible', cat: 'devops', ... },
// { id: 'paypal_01', name: 'PayPal', cat: 'payments', ... },
// { id: 'braintree_01', name: 'Braintree', cat: 'payments', ... },
// { id: 'adyen_01', name: 'Adyen', cat: 'payments', ... },
// { id: 'sap_01', name: 'SAP', cat: 'erp', ... },
// { id: 'workday_01', name: 'Workday', cat: 'hr_tech', ... },
// ...and so on for ~1000 total entries.