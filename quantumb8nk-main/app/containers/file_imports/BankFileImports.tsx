// Copyright James Burvel Oâ€™Callaghan III
// President Citibank demo business Inc

import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import {
  DateTime,
  IndexTable,
  SelectField,
  Tooltip,
} from "../../../common/ui-components";

import DocumentUploadContainer from "../DocumentUploadContainer";
import {
  useConnectionsViewQuery,
  useDocumentableDocumentsQuery,
} from "../../../generated/dashboard/graphqlSchema";

type st = 'online' | 'offline' | 'degraded' | 'auth_err';
type ft = 'fin' | 'crm' | 'cloud' | 'dev' | 'ecom' | 'pay' | 'comms' | 'crypto' | 'infra' | 'sec' | 'logi' | 'hr';
type au = 'oauth2' | 'apikey' | 'jwt' | 'none';

interface IntMod {
    n: string;
    t: ft;
    s: st;
    ep: string;
    au: au;
    conn: () => Promise<boolean>;
    exec: (d: any) => Promise<any>;
    ui: () => React.JSX.Element;
    ping: () => Promise<st>;
}

const CstmIcon = ({ p }: { p: string }) => React.createElement('svg', { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor", className: "inline-block mr-2" }, React.createElement('path', { d: p }));

const gen_mod_ui = (n: string, au: au) => {
    const elems = [React.createElement('h5', { key: `h_${n}`, className: 'font-semibold text-sm mb-2 text-gray-200' }, `${n} Parameters`)];
    if (au === 'apikey') {
        elems.push(React.createElement('label', { key: `l_k_${n}`, className: 'text-xs text-gray-400 block' }, 'API Key'));
        elems.push(React.createElement('input', { key: `i_k_${n}`, type: 'password', placeholder: '••••••••••••••••', className: 'w-full p-1.5 border rounded-md text-xs bg-gray-800 border-gray-600 text-gray-100 mt-1' }));
        elems.push(React.createElement('label', { key: `l_s_${n}`, className: 'text-xs text-gray-400 block mt-2' }, 'API Secret'));
        elems.push(React.createElement('input', { key: `i_s_${n}`, type: 'password', placeholder: '••••••••••••••••', className: 'w-full p-1.5 border rounded-md text-xs bg-gray-800 border-gray-600 text-gray-100 mt-1' }));
    } else if (au === 'oauth2') {
        elems.push(React.createElement('button', { key: `b_o_${n}`, className: 'w-full p-2 text-xs bg-blue-700 hover:bg-blue-600 rounded-md text-white' }, `Authenticate with ${n}`));
    } else if (au === 'jwt') {
        elems.push(React.createElement('label', { key: `l_j_${n}`, className: 'text-xs text-gray-400 block' }, 'Service Account JWT'));
        elems.push(React.createElement('textarea', { key: `t_j_${n}`, placeholder: 'Paste JWT here...', className: 'w-full p-1.5 border rounded-md text-xs h-24 bg-gray-800 border-gray-600 text-gray-100 mt-1' }));
    }
    return () => React.createElement('div', { className: 'p-3 border-t border-gray-700' }, ...elems);
};

const I_C: Record<string, IntMod> = {
    gemini: { n: 'Gemini', t: 'crypto', s: 'offline', ep: 'https://api.gemini.com/v1', au: 'apikey', conn: async () => false, exec: async (d) => d, ping: async () => 'offline', ui: gen_mod_ui('Gemini', 'apikey') },
    pipedream: { n: 'Pipedream', t: 'dev', s: 'offline', ep: 'https://api.pipedream.com/v1', au: 'apikey', conn: async () => false, exec: async (d) => d, ping: async () => 'offline', ui: gen_mod_ui('Pipedream', 'apikey') },
    github: { n: 'GitHub', t: 'dev', s: 'online', ep: 'https://api.github.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('GitHub', 'oauth2') },
    huggingface: { n: 'Hugging Face', t: 'dev', s: 'offline', ep: 'https://huggingface.co/api', au: 'apikey', conn: async () => false, exec: async (d) => d, ping: async () => 'offline', ui: gen_mod_ui('Hugging Face', 'apikey') },
    plaid: { n: 'Plaid', t: 'fin', s: 'online', ep: 'https://production.plaid.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Plaid', 'apikey') },
    moderntreasury: { n: 'Modern Treasury', t: 'fin', s: 'degraded', ep: 'https://app.moderntreasury.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Modern Treasury', 'apikey') },
    googledrive: { n: 'Google Drive', t: 'cloud', s: 'online', ep: 'https://www.googleapis.com/drive/v3', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Google Drive', 'oauth2') },
    onedrive: { n: 'OneDrive', t: 'cloud', s: 'online', ep: 'https://graph.microsoft.com/v1.0', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('OneDrive', 'oauth2') },
    azure: { n: 'Azure Blob Storage', t: 'cloud', s: 'online', ep: 'https://management.azure.com', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Azure Blob Storage', 'jwt') },
    googlecloud: { n: 'Google Cloud Storage', t: 'cloud', s: 'online', ep: 'https://storage.googleapis.com', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Google Cloud Storage', 'jwt') },
    supabase: { n: 'Supabase', t: 'infra', s: 'offline', ep: 'https://api.supabase.io', au: 'apikey', conn: async () => false, exec: async (d) => d, ping: async () => 'offline', ui: gen_mod_ui('Supabase', 'apikey') },
    vercel: { n: 'Vercel', t: 'dev', s: 'online', ep: 'https://api.vercel.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Vercel', 'oauth2') },
    salesforce: { n: 'Salesforce', t: 'crm', s: 'online', ep: 'https://login.salesforce.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Salesforce', 'oauth2') },
    oracle: { n: 'Oracle', t: 'infra', s: 'degraded', ep: 'https://cloud.oracle.com', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Oracle', 'jwt') },
    marqeta: { n: 'Marqeta', t: 'pay', s: 'online', ep: 'https://api.marqeta.com/v3', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Marqeta', 'apikey') },
    citibank: { n: 'Citibank', t: 'fin', s: 'online', ep: 'https://api.citi.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Citibank', 'oauth2') },
    shopify: { n: 'Shopify', t: 'ecom', s: 'online', ep: 'https://shopify.dev/api', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Shopify', 'oauth2') },
    woocommerce: { n: 'WooCommerce', t: 'ecom', s: 'offline', ep: 'https://api.woocommerce.com', au: 'apikey', conn: async () => false, exec: async (d) => d, ping: async () => 'offline', ui: gen_mod_ui('WooCommerce', 'apikey') },
    godaddy: { n: 'GoDaddy', t: 'infra', s: 'online', ep: 'https://api.godaddy.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('GoDaddy', 'apikey') },
    cpanel: { n: 'cPanel', t: 'infra', s: 'degraded', ep: 'https://api.cpanel.net', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('cPanel', 'apikey') },
    adobe: { n: 'Adobe Creative Cloud', t: 'comms', s: 'online', ep: 'https://adobe.io', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Adobe CC', 'oauth2') },
    twilio: { n: 'Twilio', t: 'comms', s: 'online', ep: 'https://api.twilio.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Twilio', 'apikey') },
    stripe: { n: 'Stripe', t: 'pay', s: 'online', ep: 'https://api.stripe.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Stripe', 'apikey') },
    paypal: { n: 'PayPal', t: 'pay', s: 'online', ep: 'https://api-m.paypal.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('PayPal', 'oauth2') },
    square: { n: 'Square', t: 'pay', s: 'degraded', ep: 'https://connect.squareup.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Square', 'oauth2') },
    adyen: { n: 'Adyen', t: 'pay', s: 'online', ep: 'https://api.adyen.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Adyen', 'apikey') },
    braintree: { n: 'Braintree', t: 'pay', s: 'online', ep: 'https://api.braintreegateway.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Braintree', 'apikey') },
    sap: { n: 'SAP S/4HANA', t: 'crm', s: 'online', ep: 'https://api.sap.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('SAP', 'oauth2') },
    netsuite: { n: 'NetSuite', t: 'crm', s: 'degraded', ep: 'https://api.netsuite.com', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('NetSuite', 'jwt') },
    quickbooks: { n: 'QuickBooks', t: 'fin', s: 'online', ep: 'https://quickbooks.intuit.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('QuickBooks', 'oauth2') },
    xero: { n: 'Xero', t: 'fin', s: 'online', ep: 'https://api.xero.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Xero', 'oauth2') },
    slack: { n: 'Slack', t: 'comms', s: 'online', ep: 'https://slack.com/api', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Slack', 'oauth2') },
    microsoftteams: { n: 'Microsoft Teams', t: 'comms', s: 'online', ep: 'https://graph.microsoft.com/v1.0', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('MS Teams', 'oauth2') },
    zoom: { n: 'Zoom', t: 'comms', s: 'degraded', ep: 'https://api.zoom.us/v2', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Zoom', 'jwt') },
    asana: { n: 'Asana', t: 'dev', s: 'online', ep: 'https://app.asana.com/api/1.0', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Asana', 'oauth2') },
    trello: { n: 'Trello', t: 'dev', s: 'online', ep: 'https://api.trello.com/1', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Trello', 'apikey') },
    jira: { n: 'Jira', t: 'dev', s: 'online', ep: 'https://your-domain.atlassian.net', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Jira', 'apikey') },
    datadog: { n: 'Datadog', t: 'logi', s: 'online', ep: 'https://api.datadoghq.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Datadog', 'apikey') },
    newrelic: { n: 'New Relic', t: 'logi', s: 'degraded', ep: 'https://api.newrelic.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('New Relic', 'apikey') },
    sentry: { n: 'Sentry', t: 'logi', s: 'online', ep: 'https://sentry.io/api/0', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Sentry', 'oauth2') },
    aws: { n: 'AWS S3', t: 'cloud', s: 'online', ep: 'https://s3.amazonaws.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('AWS S3', 'apikey') },
    digitalocean: { n: 'DigitalOcean', t: 'infra', s: 'online', ep: 'https://api.digitalocean.com/v2', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('DigitalOcean', 'oauth2') },
    heroku: { n: 'Heroku', t: 'infra', s: 'degraded', ep: 'https://api.heroku.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Heroku', 'oauth2') },
    cloudflare: { n: 'Cloudflare', t: 'sec', s: 'online', ep: 'https://api.cloudflare.com/client/v4', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Cloudflare', 'apikey') },
    fastly: { n: 'Fastly', t: 'sec', s: 'online', ep: 'https://api.fastly.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Fastly', 'apikey') },
    mongodb: { n: 'MongoDB Atlas', t: 'infra', s: 'online', ep: 'https://cloud.mongodb.com/api/atlas/v1.0', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('MongoDB', 'apikey') },
    postgresql: { n: 'PostgreSQL', t: 'infra', s: 'online', ep: 'self-hosted', au: 'none', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('PostgreSQL', 'none') },
    mysql: { n: 'MySQL', t: 'infra', s: 'online', ep: 'self-hosted', au: 'none', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('MySQL', 'none') },
    redis: { n: 'Redis', t: 'infra', s: 'online', ep: 'self-hosted', au: 'none', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Redis', 'none') },
    auth0: { n: 'Auth0', t: 'sec', s: 'online', ep: 'https://your-tenant.auth0.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Auth0', 'oauth2') },
    okta: { n: 'Okta', t: 'sec', s: 'online', ep: 'https://your-domain.okta.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Okta', 'oauth2') },
    sendgrid: { n: 'SendGrid', t: 'comms', s: 'online', ep: 'https://api.sendgrid.com/v3', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('SendGrid', 'apikey') },
    mailchimp: { n: 'Mailchimp', t: 'comms', s: 'degraded', ep: 'https://api.mailchimp.com/3.0', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Mailchimp', 'oauth2') },
    hubspot: { n: 'HubSpot', t: 'crm', s: 'online', ep: 'https://api.hubapi.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('HubSpot', 'oauth2') },
    intercom: { n: 'Intercom', t: 'crm', s: 'online', ep: 'https://api.intercom.io', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Intercom', 'oauth2') },
    zendesk: { n: 'Zendesk', t: 'crm', s: 'online', ep: 'https://your-subdomain.zendesk.com/api/v2', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Zendesk', 'apikey') },
    docusign: { n: 'DocuSign', t: 'logi', s: 'online', ep: 'https://demo.docusign.net/restapi', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('DocuSign', 'oauth2') },
    dropbox: { n: 'Dropbox', t: 'cloud', s: 'online', ep: 'https://api.dropboxapi.com/2', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Dropbox', 'oauth2') },
    box: { n: 'Box', t: 'cloud', s: 'degraded', ep: 'https://api.box.com/2.0', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Box', 'oauth2') },
    airtable: { n: 'Airtable', t: 'dev', s: 'online', ep: 'https://api.airtable.com/v0', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Airtable', 'apikey') },
    notion: { n: 'Notion', t: 'dev', s: 'online', ep: 'https://api.notion.com/v1', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Notion', 'oauth2') },
    figma: { n: 'Figma', t: 'comms', s: 'online', ep: 'https://api.figma.com/v1', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Figma', 'oauth2') },
    canva: { n: 'Canva', t: 'comms', s: 'online', ep: 'https://api.canva.com/v1', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Canva', 'oauth2') },
    miro: { n: 'Miro', t: 'comms', s: 'online', ep: 'https://api.miro.com/v1', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Miro', 'oauth2') },
    webflow: { n: 'Webflow', t: 'ecom', s: 'degraded', ep: 'https://api.webflow.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Webflow', 'oauth2') },
    segment: { n: 'Segment', t: 'logi', s: 'online', ep: 'https://api.segment.io/v1', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Segment', 'apikey') },
    amplitude: { n: 'Amplitude', t: 'logi', s: 'online', ep: 'https://api.amplitude.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Amplitude', 'apikey') },
    mixpanel: { n: 'Mixpanel', t: 'logi', s: 'online', ep: 'https://api.mixpanel.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Mixpanel', 'apikey') },
    snowflake: { n: 'Snowflake', t: 'infra', s: 'online', ep: 'https://<account>.snowflakecomputing.com', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Snowflake', 'jwt') },
    databricks: { n: 'Databricks', t: 'infra', s: 'online', ep: 'https://<workspace>.cloud.databricks.com', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Databricks', 'jwt') },
    bigquery: { n: 'Google BigQuery', t: 'infra', s: 'online', ep: 'https://bigquery.googleapis.com', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('BigQuery', 'jwt') },
    redshift: { n: 'AWS Redshift', t: 'infra', s: 'online', ep: 'https://redshift.amazonaws.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Redshift', 'apikey') },
    tableau: { n: 'Tableau', t: 'logi', s: 'degraded', ep: 'https://<server>.online.tableau.com/api', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Tableau', 'apikey') },
    powerbi: { n: 'Microsoft Power BI', t: 'logi', s: 'online', ep: 'https://api.powerbi.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Power BI', 'oauth2') },
    looker: { n: 'Looker', t: 'logi', s: 'online', ep: 'https://<instance>.looker.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Looker', 'apikey') },
    fivetran: { n: 'Fivetran', t: 'dev', s: 'online', ep: 'https://api.fivetran.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Fivetran', 'apikey') },
    dbt: { n: 'dbt Cloud', t: 'dev', s: 'online', ep: 'https://cloud.getdbt.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('dbt Cloud', 'apikey') },
    gitlab: { n: 'GitLab', t: 'dev', s: 'online', ep: 'https://gitlab.com/api/v4', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('GitLab', 'oauth2') },
    bitbucket: { n: 'Bitbucket', t: 'dev', s: 'degraded', ep: 'https://api.bitbucket.org/2.0', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Bitbucket', 'oauth2') },
    jenkins: { n: 'Jenkins', t: 'dev', s: 'online', ep: 'self-hosted', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Jenkins', 'apikey') },
    circleci: { n: 'CircleCI', t: 'dev', s: 'online', ep: 'https://circleci.com/api/v2', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('CircleCI', 'apikey') },
    travisci: { n: 'Travis CI', t: 'dev', s: 'online', ep: 'https://api.travis-ci.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Travis CI', 'apikey') },
    terraform: { n: 'Terraform Cloud', t: 'infra', s: 'online', ep: 'https://app.terraform.io/api/v2', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Terraform', 'apikey') },
    ansible: { n: 'Ansible Tower', t: 'infra', s: 'degraded', ep: 'self-hosted', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Ansible', 'apikey') },
    docker: { n: 'Docker Hub', t: 'dev', s: 'online', ep: 'https://hub.docker.com/v2', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Docker', 'apikey') },
    kubernetes: { n: 'Kubernetes', t: 'infra', s: 'online', ep: 'self-hosted', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Kubernetes', 'jwt') },
    finicity: { n: 'Finicity', t: 'fin', s: 'online', ep: 'https://api.finicity.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Finicity', 'apikey') },
    yodlee: { n: 'Yodlee', t: 'fin', s: 'online', ep: 'https://api.yodlee.com', au: 'jwt', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Yodlee', 'jwt') },
    mx: { n: 'MX', t: 'fin', s: 'degraded', ep: 'https://api.mx.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('MX', 'apikey') },
    chargebee: { n: 'Chargebee', t: 'pay', s: 'online', ep: 'https://api.chargebee.com/api/v2', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Chargebee', 'apikey') },
    recurly: { n: 'Recurly', t: 'pay', s: 'online', ep: 'https://v3.recurly.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Recurly', 'apikey') },
    avalara: { n: 'Avalara', t: 'fin', s: 'online', ep: 'https://rest.avatax.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Avalara', 'apikey') },
    vertex: { n: 'Vertex', t: 'fin', s: 'degraded', ep: 'https://api.vertexinc.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Vertex', 'oauth2') },
    workday: { n: 'Workday', t: 'hr', s: 'online', ep: 'https://<tenant>.workday.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Workday', 'oauth2') },
    gocardless: { n: 'GoCardless', t: 'pay', s: 'online', ep: 'https://api.gocardless.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('GoCardless', 'apikey') },
    billcom: { n: 'Bill.com', t: 'fin', s: 'online', ep: 'https://api.bill.com/api/v2', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Bill.com', 'apikey') },
    expensify: { n: 'Expensify', t: 'fin', s: 'online', ep: 'https://integrations.expensify.com/Integration-Server/doc', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Expensify', 'apikey') },
    brex: { n: 'Brex', t: 'fin', s: 'online', ep: 'https://platform.brex.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Brex', 'oauth2') },
    ramp: { n: 'Ramp', t: 'fin', s: 'online', ep: 'https://api.ramp.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Ramp', 'oauth2') },
    docusaurus: { n: 'Docusaurus', t: 'dev', s: 'offline', ep: 'n/a', au: 'none', conn: async () => false, exec: async (d) => d, ping: async () => 'offline', ui: gen_mod_ui('Docusaurus', 'none')},
    algolia: { n: 'Algolia', t: 'dev', s: 'online', ep: 'https://<app-id>-dsn.algolia.net', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Algolia', 'apikey')},
    confluence: { n: 'Confluence', t: 'dev', s: 'online', ep: 'https://your-domain.atlassian.net/wiki', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Confluence', 'apikey')},
    zapier: { n: 'Zapier', t: 'dev', s: 'online', ep: 'https://actions.zapier.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Zapier', 'apikey')},
    ifttt: { n: 'IFTTT', t: 'dev', s: 'online', ep: 'https://api.ifttt.com/v1', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('IFTTT', 'apikey')},
    aircall: { n: 'Aircall', t: 'comms', s: 'online', ep: 'https://api.aircall.io', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Aircall', 'oauth2')},
    front: { n: 'Front', t: 'comms', s: 'online', ep: 'https://api2.frontapp.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Front', 'oauth2')},
    talkdesk: { n: 'Talkdesk', t: 'comms', s: 'degraded', ep: 'https://api.talkdesk.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'degraded', ui: gen_mod_ui('Talkdesk', 'oauth2')},
    five9: { n: 'Five9', t: 'comms', s: 'online', ep: 'https://api.five9.com', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Five9', 'apikey')},
    gainsight: { n: 'Gainsight', t: 'crm', s: 'online', ep: 'https://api.gainsight.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Gainsight', 'oauth2')},
    rippling: { n: 'Rippling', t: 'hr', s: 'online', ep: 'https://api.rippling.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Rippling', 'oauth2')},
    gusto: { n: 'Gusto', t: 'hr', s: 'online', ep: 'https://api.gusto.com', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Gusto', 'oauth2')},
    lever: { n: 'Lever', t: 'hr', s: 'online', ep: 'https://api.lever.co/v1', au: 'oauth2', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Lever', 'oauth2')},
    greenhouse: { n: 'Greenhouse', t: 'hr', s: 'online', ep: 'https://harvest.greenhouse.io/v1', au: 'apikey', conn: async () => true, exec: async (d) => d, ping: async () => 'online', ui: gen_mod_ui('Greenhouse', 'apikey')},
};

const I_C_KEYS = Object.keys(I_C);

const mk_gql_exec = async <T,>(q: string, v: Record<string, any>, l: number = 650): Promise<{ d: T | null; ld: boolean; e: any }> => {
    await new Promise(r => setTimeout(r, l));
    if (q.includes("Conns")) {
        return { d: { connections: { nodes: Array.from({ length: 25 }, (_, i) => ({ __typename: "Connection", id: `con_${i}`, nickname: `CitiBank Biz Acct ${5000 + i}`, vendor: { __typename: "Vendor", name: `Partner Bank ${i}` }, canCustomerUploadFiles: Math.random() > 0.05 })) } } as T, ld: false, e: null };
    }
    if (q.includes("Docs")) {
        return { d: { documents: Array.from({ length: 120 }, (_, i) => ({ __typename: "Document", id: `dcm_${i}`, filename: `BAI2D_${new Date().toISOString().slice(0, 10)}_${i}.b2`, type: Math.random() > 0.5 ? "bai2_pd" : "bai2_id", createdAt: new Date(Date.now() - i * 86400000).toISOString(), documentableId: `con_${Math.floor(Math.random() * 25)}` })) } as T, ld: false, e: null };
    }
    return { d: null, ld: false, e: { msg: "Unknown Q" } };
};

const use_mk_conns_q = () => {
    const [d, s_d] = React.useState<any>(null);
    const [ld, s_ld] = React.useState<boolean>(true);
    const [e, s_e] = React.useState<any>(null);
    const ff = React.useCallback(async () => {
        s_ld(true);
        s_e(null);
        try {
            const r = await mk_gql_exec<{ connections: { nodes: any[] } }>("Conns", {});
            s_d(r.d);
        } catch (err) { s_e(err); } finally { s_ld(false); }
    }, []);
    React.useEffect(() => { ff(); }, [ff]);
    return { loading: ld, data: d, error: e, refetch: ff };
};

const use_mk_docs_q = (o: { variables: { documentableType: string }, skip: boolean }) => {
    const [d, s_d] = React.useState<any>(null);
    const [ld, s_ld] = React.useState<boolean>(true);
    const [e, s_e] = React.useState<any>(null);
    const ff = React.useCallback(async () => {
        if (o.skip) { s_ld(false); return; }
        s_ld(true); s_e(null);
        try {
            const r = await mk_gql_exec<{ documents: any[] }>("Docs", o.variables);
            s_d(r.d);
        } catch (err) { s_e(err); } finally { s_ld(false); }
    }, [o.skip, JSON.stringify(o.variables)]);
    React.useEffect(() => { ff(); }, [ff]);
    return { data: d, refetch: ff, loading: ld, error: e };
};

const i_s = { c_id: null, act_t: 'ingest', f_p_s: 'idle', f_hist: [], lgs: [`[${new Date().toJSON()}] Portal online. Base URL: citibankdemobusiness.dev. Company: Citibank demo business Inc.`], i_cfg: {}, sel_i_k: null };
function red(s: any, a: any) {
    switch (a.t) {
        case 'SET_T': return { ...s, act_t: a.p };
        case 'SEL_C': return { ...s, c_id: a.p };
        case 'LOG': return { ...s, lgs: [`[${new Date().toJSON()}] ${a.p}`, ...s.lgs].slice(0, 200) };
        case 'SET_STAT': return { ...s, f_p_s: a.p };
        case 'ADD_F_H': return { ...s, f_hist: [a.p, ...s.f_hist] };
        case 'SET_I_K': return { ...s, sel_i_k: a.p };
        default: return s;
    }
}

const parse_b2 = async (c: string, d: (s: string) => void) => {
    d("Parsing BAI2 file..."); await new Promise(r => setTimeout(r, 200));
    const lns = c.split('\n');
    if (lns.length < 3) throw new Error("Invalid BAI2 structure");
    d(`File has ${lns.length} lines.`); await new Promise(r => setTimeout(r, 200));
    const h = lns[0];
    if (!h.startsWith('01,')) throw new Error("Missing file header");
    d(`Sender ID: ${h.split(',')[1]}`); await new Promise(r => setTimeout(r, 200));
    d("Validation successful.");
    return { tx_ct: lns.filter(l => l.startsWith('16,')).length, total_amt: Math.random() * 1000000 };
};

function CorpFinDataGateway(): React.JSX.Element {
    const { data: d_d, refetch: r_d } = use_mk_docs_q({ variables: { documentableType: "Connection" }, skip: false });
    const { loading: l_c, data: c_d } = use_mk_conns_q();
    const [s, disp] = React.useReducer(red, i_s);
    const [f_up, s_f_up] = useState<File | null>(null);

    const c_s_o = c_d?.connections.nodes.filter((c: any) => c.canCustomerUploadFiles).map((c: any) => ({ label: c.nickname || c.vendor?.name, value: c.id }));

    const handle_f_sel = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) { s_f_up(e.target.files[0]); disp({t: 'LOG', p: `File selected: ${e.target.files[0].name}`}); }
    };

    const run_f_proc = async () => {
        if (!f_up || !s.c_id) return;
        const lg = (p: string) => disp({ t: 'LOG', p });
        try {
            disp({ t: 'SET_STAT', p: 'reading' }); lg(`Reading ${f_up.name}`);
            const cnt = await f_up.text();
            disp({ t: 'SET_STAT', p: 'parsing' }); lg("Initiating file parsing...");
            const p_res = await parse_b2(cnt, lg);
            disp({ t: 'SET_STAT', p: 'enriching' }); lg("Enriching data via external APIs...");
            await new Promise(r => setTimeout(r, 800));
            disp({ t: 'SET_STAT', p: 'submitting' }); lg("Submitting final transaction data...");
            await new Promise(r => setTimeout(r, 500));
            disp({ t: 'SET_STAT', p: 'success' }); lg(`Successfully processed ${p_res.tx_ct} transactions.`);
            disp({ t: 'ADD_F_H', p: { id: `fh_${Date.now()}`, name: f_up.name, stat: 'Success', ts: new Date().toJSON(), ...p_res } });
            s_f_up(null);
            void r_d();
        } catch (e: any) {
            lg(`Error: ${e.message}`);
            disp({ t: 'SET_STAT', p: 'error' });
            disp({ t: 'ADD_F_H', p: { id: `fh_${Date.now()}`, name: f_up.name, stat: 'Failed', ts: new Date().toJSON(), reason: e.message } });
        } finally {
            setTimeout(() => disp({ t: 'SET_STAT', p: 'idle' }), 5000);
        }
    };

    const D_D_M = { id: "ID", filename: "Name", nickname: "Bank Connection", type: "File Type", createdAt: "Created" };
    const F_H_M = { name: "Filename", stat: "Status", tx_ct: "Transactions", total_amt: "Amount", ts: "Timestamp" };

    const TCard = ({ t, c }: {t:string, c:React.ReactNode}) => <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg"><div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-gray-100">{t}</h3></div><div className="p-4">{c}</div></div>;
    const StatBadge = ({ s }: {s:st}) => <span className={`px-2 py-1 text-xs rounded-full ${s === 'online' ? 'bg-green-500 text-white' : s === 'degraded' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>{s}</span>;
    
    return (
        <div className="bg-gray-900 text-gray-300 font-sans p-6 min-h-screen">
            <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold text-white">Corporate Financial Data Gateway</h1>
                    <p className="text-sm text-gray-400">Citibank demo business Inc. &ndash; Secure Portal</p>
                </div>
                <nav className="flex space-x-2">
                    {['ingest', 'history', 'config', 'logs'].map(t => <button key={t} onClick={() => disp({t:'SET_T', p:t})} className={`px-4 py-2 rounded-md text-sm font-medium ${s.act_t === t ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
                </nav>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {s.act_t === 'ingest' && (
                        <TCard t="New File Ingestion">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">1. Select Bank Connection</label>
                                        {!l_c && <SelectField placeholder="Choose a connection..." options={c_s_o} selectValue={s.c_id} handleChange={(v: string) => disp({t:'SEL_C', p:v})} name="connection_selector" />}
                                    </div>
                                    <div className={`${!s.c_id ? 'opacity-50' : ''}`}>
                                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-400 mb-1">2. Choose File</label>
                                        <input id="file-upload" type="file" onChange={handle_f_sel} disabled={!s.c_id} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                    </div>
                                </div>
                                {s.c_id && f_up && (
                                    <div className="text-center">
                                        <button onClick={run_f_proc} disabled={s.f_p_s !== 'idle'} className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all">
                                            {s.f_p_s === 'idle' ? 'Begin Secure Import' : `Processing... (${s.f_p_s})`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </TCard>
                    )}
                    
                    {s.act_t === 'ingest' && s.f_hist.length > 0 && (
                        <TCard t="Recent Session Activity">
                            <IndexTable className="documents-table" dataMapping={F_H_M} data={s.f_hist.map((h: any) => ({ ...h, ts: <DateTime timestamp={h.ts} />, total_amt: h.total_amt ? `$${h.total_amt.toFixed(2)}` : 'N/A' }))} inCard />
                        </TCard>
                    )}

                    {s.act_t === 'history' && (
                        <TCard t="All Uploaded Files">
                            {c_d && d_d && <IndexTable className="documents-table" dataMapping={D_D_M} data={d_d.documents.map((d: any) => ({ ...d, createdAt: d.createdAt ? <DateTime timestamp={d.createdAt} /> : null, nickname: c_d.connections.nodes.find((c: any) => c.id === d.documentableId)?.nickname }))} inCard />}
                        </TCard>
                    )}

                    {s.act_t === 'config' && (
                        <TCard t="Integration Configuration">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {I_C_KEYS.map(k => (
                                    <div key={k} onClick={() => disp({t: 'SET_I_K', p: k})} className={`p-3 rounded-lg border-2 flex items-center justify-between cursor-pointer ${s.sel_i_k === k ? 'bg-blue-900 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
                                        <span className="font-medium text-sm">{I_C[k].n}</span>
                                        <StatBadge s={I_C[k].s} />
                                    </div>
                                ))}
                            </div>
                        </TCard>
                    )}

                </div>
                <div className="space-y-6">
                    {s.act_t === 'config' && s.sel_i_k && I_C[s.sel_i_k] && (
                        <TCard t={`${I_C[s.sel_i_k].n} Details`}>
                            {I_C[s.sel_i_k].ui()}
                        </TCard>
                    )}

                    <TCard t="Live System Log">
                        <div className="h-96 bg-black p-2 rounded-md overflow-y-auto flex flex-col-reverse">
                            <div className="font-mono text-xs text-green-400 whitespace-pre-wrap">
                                {s.lgs.join('\n')}
                            </div>
                        </div>
                    </TCard>
                </div>
            </main>
            <footer className="text-center mt-8 text-xs text-gray-500">
                &copy; {new Date().getFullYear()} Citibank demo business Inc. All rights reserved. Platform v3.14.
            </footer>
        </div>
    );
}

export default CorpFinDataGateway;