// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
} from "~/common/ui-components/Card/Card";
import LedgersTable from "./Table";

const B_URL = "citibankdemobusiness.dev";
const C_NAME = "Citibank demo business Inc";
const G_API_V = "v3";

export type LdgAcc = {
  id: string;
  nm: string;
  dbt: number;
  crd: number;
  bal: number;
  crn: string;
  ts: number;
  meta: Record<string, any>;
};

export type ApiConnStatus = 'connected' | 'disconnected' | 'pending' | 'error';

export interface IIntegration {
  name: string;
  id: string;
  category: string;
  status: ApiConnStatus;
  apiUrl: string;
  docsUrl: string;
  lastSync: number | null;
}

export const allIntegrations: IIntegration[] = [
  { name: 'Gemini', id: 'gem', category: 'Crypto', status: 'disconnected', apiUrl: `https://api.gemini.com/v1`, docsUrl: 'https://docs.gemini.com', lastSync: null },
  { name: 'ChatGPT', id: 'cpt', category: 'AI', status: 'disconnected', apiUrl: `https://api.openai.com/v1`, docsUrl: 'https://beta.openai.com/docs', lastSync: null },
  { name: 'Pipedream', id: 'pdr', category: 'Automation', status: 'disconnected', apiUrl: `https://api.pipedream.com/v1`, docsUrl: 'https://pipedream.com/docs', lastSync: null },
  { name: 'GitHub', id: 'ghb', category: 'DevOps', status: 'disconnected', apiUrl: `https://api.github.com`, docsUrl: 'https://docs.github.com', lastSync: null },
  { name: 'Hugging Face', id: 'hgf', category: 'AI', status: 'disconnected', apiUrl: `https://api-inference.huggingface.co`, docsUrl: 'https://huggingface.co/docs', lastSync: null },
  { name: 'Plaid', id: 'pld', category: 'Finance', status: 'disconnected', apiUrl: `https://production.plaid.com`, docsUrl: 'https://plaid.com/docs', lastSync: null },
  { name: 'Modern Treasury', id: 'mtr', category: 'Finance', status: 'disconnected', apiUrl: `https://app.moderntreasury.com/api`, docsUrl: 'https://docs.moderntreasury.com', lastSync: null },
  { name: 'Google Drive', id: 'gdr', category: 'Storage', status: 'disconnected', apiUrl: `https://www.googleapis.com/drive/v3`, docsUrl: 'https://developers.google.com/drive', lastSync: null },
  { name: 'OneDrive', id: 'odr', category: 'Storage', status: 'disconnected', apiUrl: `https://graph.microsoft.com/v1.0/me/drive`, docsUrl: 'https://docs.microsoft.com/en-us/onedrive/developer', lastSync: null },
  { name: 'Azure', id: 'azr', category: 'Cloud', status: 'disconnected', apiUrl: `https://management.azure.com`, docsUrl: 'https://docs.microsoft.com/en-us/azure', lastSync: null },
  { name: 'Google Cloud', id: 'gcp', category: 'Cloud', status: 'disconnected', apiUrl: `https://cloud.google.com/apis`, docsUrl: 'https://cloud.google.com/docs', lastSync: null },
  { name: 'Supabase', id: 'sbs', category: 'Database', status: 'disconnected', apiUrl: `https://api.supabase.io`, docsUrl: 'https://supabase.io/docs', lastSync: null },
  { name: 'Vercel', id: 'vrl', category: 'Hosting', status: 'disconnected', apiUrl: `https://api.vercel.com`, docsUrl: 'https://vercel.com/docs', lastSync: null },
  { name: 'Salesforce', id: 'sfc', category: 'CRM', status: 'disconnected', apiUrl: `https://login.salesforce.com`, docsUrl: 'https://developer.salesforce.com/docs', lastSync: null },
  { name: 'Oracle', id: 'orc', category: 'Database', status: 'disconnected', apiUrl: `https://docs.oracle.com/en/cloud/paas/database-autonomous-cloud/index.html`, docsUrl: 'https://docs.oracle.com', lastSync: null },
  { name: 'Marqeta', id: 'mqt', category: 'Finance', status: 'disconnected', apiUrl: `https://api.marqeta.com/v3`, docsUrl: 'https://www.marqeta.com/docs', lastSync: null },
  { name: 'Citibank', id: 'ctb', category: 'Finance', status: 'disconnected', apiUrl: `https://sandbox.apihub.citi.com`, docsUrl: 'https://developer.citi.com', lastSync: null },
  { name: 'Shopify', id: 'spy', category: 'Ecommerce', status: 'disconnected', apiUrl: `https://shopify.dev/api`, docsUrl: 'https://shopify.dev/docs', lastSync: null },
  { name: 'WooCommerce', id: 'woc', category: 'Ecommerce', status: 'disconnected', apiUrl: `https://woocommerce.github.io/woocommerce-rest-api-docs/`, docsUrl: 'https://woocommerce.com/document/woocommerce-rest-api/', lastSync: null },
  { name: 'GoDaddy', id: 'gdd', category: 'Hosting', status: 'disconnected', apiUrl: `https://developer.godaddy.com`, docsUrl: 'https://developer.godaddy.com/doc', lastSync: null },
  { name: 'cPanel', id: 'cpl', category: 'Hosting', status: 'disconnected', apiUrl: `https://api.cpanel.net`, docsUrl: 'https://documentation.cpanel.net/display/DD/cPanel+API+2', lastSync: null },
  { name: 'Adobe', id: 'adb', category: 'Creative', status: 'disconnected', apiUrl: `https://www.adobe.io/apis/`, docsUrl: 'https://www.adobe.io/creative-cloud-libraries/docs.html', lastSync: null },
  { name: 'Twilio', id: 'twl', category: 'Communication', status: 'disconnected', apiUrl: `https://api.twilio.com`, docsUrl: 'https://www.twilio.com/docs', lastSync: null },
  { name: 'Stripe', id: 'stp', category: 'Finance', status: 'disconnected', apiUrl: 'https://api.stripe.com', docsUrl: 'https://stripe.com/docs/api', lastSync: null },
  { name: 'PayPal', id: 'ppl', category: 'Finance', status: 'disconnected', apiUrl: 'https://api-m.paypal.com', docsUrl: 'https://developer.paypal.com/docs/api/', lastSync: null },
  { name: 'Square', id: 'sqr', category: 'Finance', status: 'disconnected', apiUrl: 'https://connect.squareup.com', docsUrl: 'https://developer.squareup.com/docs', lastSync: null },
  { name: 'QuickBooks', id: 'qkb', category: 'Accounting', status: 'disconnected', apiUrl: 'https://developer.intuit.com/app/developer/qbo/docs/api', docsUrl: 'https://developer.intuit.com/app/developer/qbo/docs/get-started', lastSync: null },
  { name: 'Xero', id: 'xro', category: 'Accounting', status: 'disconnected', apiUrl: 'https://api.xero.com/api.xro/2.0', docsUrl: 'https://developer.xero.com/documentation/api/accounting/overview', lastSync: null },
  { name: 'HubSpot', id: 'hbt', category: 'CRM', status: 'disconnected', apiUrl: 'https://api.hubapi.com', docsUrl: 'https://developers.hubspot.com/docs/api/overview', lastSync: null },
  { name: 'Mailchimp', id: 'mcp', category: 'Marketing', status: 'disconnected', apiUrl: 'https://<dc>.api.mailchimp.com/3.0/', docsUrl: 'https://mailchimp.com/developer/marketing/api/', lastSync: null },
  { name: 'Slack', id: 'slk', category: 'Communication', status: 'disconnected', apiUrl: 'https://slack.com/api', docsUrl: 'https://api.slack.com/', lastSync: null },
  { name: 'Zoom', id: 'zom', category: 'Communication', status: 'disconnected', apiUrl: 'https://api.zoom.us/v2', docsUrl: 'https://marketplace.zoom.us/docs/api-reference/zoom-api', lastSync: null },
  { name: 'Trello', id: 'trl', category: 'Productivity', status: 'disconnected', apiUrl: 'https://api.trello.com/1', docsUrl: 'https://developer.atlassian.com/cloud/trello/rest/', lastSync: null },
  { name: 'Jira', id: 'jra', category: 'Productivity', status: 'disconnected', apiUrl: 'https://your-domain.atlassian.net/rest/api/3', docsUrl: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/', lastSync: null },
  { name: 'Asana', id: 'asn', category: 'Productivity', status: 'disconnected', apiUrl: 'https://app.asana.com/api/1.0', docsUrl: 'https://developers.asana.com/docs', lastSync: null },
  { name: 'Notion', id: 'ntn', category: 'Productivity', status: 'disconnected', apiUrl: 'https://api.notion.com/v1', docsUrl: 'https://developers.notion.com/', lastSync: null },
  { name: 'Dropbox', id: 'dbx', category: 'Storage', status: 'disconnected', apiUrl: 'https://api.dropboxapi.com/2', docsUrl: 'https://www.dropbox.com/developers/documentation', lastSync: null },
  { name: 'Box', id: 'box', category: 'Storage', status: 'disconnected', apiUrl: 'https://api.box.com/2.0', docsUrl: 'https://developer.box.com/reference/', lastSync: null },
  { name: 'Zendesk', id: 'zdk', category: 'Customer Support', status: 'disconnected', apiUrl: 'https://{subdomain}.zendesk.com/api/v2', docsUrl: 'https://developer.zendesk.com/api-reference/introduction/getting-started/', lastSync: null },
  { name: 'Intercom', id: 'icm', category: 'Customer Support', status: 'disconnected', apiUrl: 'https://api.intercom.io', docsUrl: 'https://developers.intercom.com/intercom-api-reference/v2.8/reference', lastSync: null },
  { name: 'DocuSign', id: 'dsn', category: 'Documents', status: 'disconnected', apiUrl: 'https://demo.docusign.net/restapi', docsUrl: 'https://developers.docusign.com/docs/esign-rest-api/reference/', lastSync: null },
  { name: 'AWS', id: 'aws', category: 'Cloud', status: 'disconnected', apiUrl: 'https://aws.amazon.com/api/', docsUrl: 'https://aws.amazon.com/tools/', lastSync: null },
  { name: 'DigitalOcean', id: 'dgo', category: 'Cloud', status: 'disconnected', apiUrl: 'https://api.digitalocean.com/v2', docsUrl: 'https://docs.digitalocean.com/reference/api/', lastSync: null },
  { name: 'Linode', id: 'lnd', category: 'Cloud', status: 'disconnected', apiUrl: 'https://api.linode.com/v4', docsUrl: 'https://www.linode.com/docs/api/', lastSync: null },
  { name: 'SendGrid', id: 'sgr', category: 'Email', status: 'disconnected', apiUrl: 'https://api.sendgrid.com/v3', docsUrl: 'https://docs.sendgrid.com/api-reference/', lastSync: null },
  { name: 'Mailgun', id: 'mgn', category: 'Email', status: 'disconnected', apiUrl: 'https://api.mailgun.net/v3', docsUrl: 'https://documentation.mailgun.com/en/latest/api_reference.html', lastSync: null },
  { name: 'Postmark', id: 'pmk', category: 'Email', status: 'disconnected', apiUrl: 'https://api.postmarkapp.com', docsUrl: 'https://postmarkapp.com/developer/api/overview', lastSync: null },
  { name: 'Algolia', id: 'alg', category: 'Search', status: 'disconnected', apiUrl: 'https://{Application-ID}-dsn.algolia.net/1/indexes', docsUrl: 'https://www.algolia.com/doc/api-reference/rest-api/', lastSync: null },
  { name: 'Twitch', id: 'tch', category: 'Streaming', status: 'disconnected', apiUrl: 'https://api.twitch.tv/helix', docsUrl: 'https://dev.twitch.tv/docs/api/', lastSync: null },
  { name: 'YouTube', id: 'ytb', category: 'Streaming', status: 'disconnected', apiUrl: 'https://www.googleapis.com/youtube/v3', docsUrl: 'https://developers.google.com/youtube/v3/docs', lastSync: null },
  { name: 'Vimeo', id: 'vmo', category: 'Streaming', status: 'disconnected', apiUrl: 'https://api.vimeo.com', docsUrl: 'https://developer.vimeo.com/api/guides/start', lastSync: null },
  { name: 'Discord', id: 'dsc', category: 'Communication', status: 'disconnected', apiUrl: 'https://discord.com/api/v10', docsUrl: 'https://discord.com/developers/docs/intro', lastSync: null },
  { name: 'Telegram', id: 'tlg', category: 'Communication', status: 'disconnected', apiUrl: 'https://api.telegram.org/bot{token}', docsUrl: 'https://core.telegram.org/bots/api', lastSync: null },
  { name: 'WhatsApp', id: 'whp', category: 'Communication', status: 'disconnected', apiUrl: 'https://graph.facebook.com/v15.0/{phone-number-ID}/messages', docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference', lastSync: null },
  { name: 'Airtable', id: 'atb', category: 'Database', status: 'disconnected', apiUrl: 'https://api.airtable.com/v0', docsUrl: 'https://airtable.com/developers/web/api/introduction', lastSync: null },
  { name: 'Firebase', id: 'fbs', category: 'Database', status: 'disconnected', apiUrl: 'https://firebase.google.com/docs/reference/rest', docsUrl: 'https://firebase.google.com/docs/build', lastSync: null },
  { name: 'MongoDB Atlas', id: 'mda', category: 'Database', status: 'disconnected', apiUrl: 'https://cloud.mongodb.com/api/atlas/v1.0', docsUrl: 'https://www.mongodb.com/docs/atlas/api/', lastSync: null },
  { name: 'Redis', id: 'rds', category: 'Database', status: 'disconnected', apiUrl: 'https://redis.io/commands', docsUrl: 'https://redis.io/docs/', lastSync: null },
  { name: 'PostgreSQL', id: 'psg', category: 'Database', status: 'disconnected', apiUrl: 'N/A', docsUrl: 'https://www.postgresql.org/docs/', lastSync: null },
  { name: 'MySQL', id: 'msl', category: 'Database', status: 'disconnected', apiUrl: 'N/A', docsUrl: 'https://dev.mysql.com/doc/', lastSync: null },
  { name: 'Datadog', id: 'ddg', category: 'Monitoring', status: 'disconnected', apiUrl: 'https://api.datadoghq.com', docsUrl: 'https://docs.datadoghq.com/api/latest/', lastSync: null },
  { name: 'New Relic', id: 'nrc', category: 'Monitoring', status: 'disconnected', apiUrl: 'https://api.newrelic.com/v2', docsUrl: 'https://docs.newrelic.com/docs/apis/', lastSync: null },
  { name: 'Sentry', id: 'sny', category: 'Monitoring', status: 'disconnected', apiUrl: 'https://sentry.io/api/0/', docsUrl: 'https://docs.sentry.io/api/', lastSync: null },
  { name: 'Cloudflare', id: 'cfl', category: 'CDN', status: 'disconnected', apiUrl: 'https://api.cloudflare.com/client/v4', docsUrl: 'https://developers.cloudflare.com/api/', lastSync: null },
  { name: 'Fastly', id: 'fly', category: 'CDN', status: 'disconnected', apiUrl: 'https://api.fastly.com', docsUrl: 'https://developer.fastly.com/reference/api/', lastSync: null },
  { name: 'Auth0', id: 'a0', category: 'Authentication', status: 'disconnected', apiUrl: 'https://{your-domain}.auth0.com/api/v2/', docsUrl: 'https://auth0.com/docs/api/management/v2', lastSync: null },
  { name: 'Okta', id: 'okt', category: 'Authentication', status: 'disconnected', apiUrl: 'https://{yourOktaDomain}/api/v1', docsUrl: 'https://developer.okta.com/docs/reference/', lastSync: null },
  { name: 'Twitch', id: 'twh', category: 'Social', status: 'disconnected', apiUrl: 'https://api.twitch.tv/helix', docsUrl: 'https://dev.twitch.tv/docs/api', lastSync: null },
  { name: 'Twitter', id: 'twt', category: 'Social', status: 'disconnected', apiUrl: 'https://api.twitter.com/2', docsUrl: 'https://developer.twitter.com/en/docs/twitter-api', lastSync: null },
  { name: 'Facebook', id: 'fbk', category: 'Social', status: 'disconnected', apiUrl: 'https://graph.facebook.com', docsUrl: 'https://developers.facebook.com/docs/graph-api', lastSync: null },
  { name: 'Instagram', id: 'ing', category: 'Social', status: 'disconnected', apiUrl: 'https://graph.instagram.com', docsUrl: 'https://developers.facebook.com/docs/instagram-api', lastSync: null },
  { name: 'LinkedIn', id: 'lkn', category: 'Social', status: 'disconnected', apiUrl: 'https://api.linkedin.com/v2', docsUrl: 'https://docs.microsoft.com/en-us/linkedin/shared/api-guide/concepts/rate-limits', lastSync: null },
  { name: 'Reddit', id: 'rdt', category: 'Social', status: 'disconnected', apiUrl: 'https://www.reddit.com/dev/api', docsUrl: 'https://www.reddit.com/dev/api/', lastSync: null },
  { name: 'Figma', id: 'fgm', category: 'Design', status: 'disconnected', apiUrl: 'https://api.figma.com/v1/', docsUrl: 'https://www.figma.com/developers/api', lastSync: null },
  { name: 'Sketch', id: 'skh', category: 'Design', status: 'disconnected', apiUrl: 'https://developer.sketch.com/reference/api/', docsUrl: 'https://developer.sketch.com/reference/api/', lastSync: null },
  { name: 'InVision', id: 'ivn', category: 'Design', status: 'disconnected', apiUrl: 'https://www.invisionapp.com/platform/rest-api-documentation/', docsUrl: 'https://www.invisionapp.com/platform/rest-api-documentation/', lastSync: null },
  { name: 'Zapier', id: 'zpr', category: 'Automation', status: 'disconnected', apiUrl: 'https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks', docsUrl: 'https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks', lastSync: null },
  { name: 'IFTTT', id: 'itt', category: 'Automation', status: 'disconnected', apiUrl: 'https://ifttt.com/docs/connect_api', docsUrl: 'https://ifttt.com/docs/connect_api', lastSync: null },
  { name: 'Calendly', id: 'cly', category: 'Scheduling', status: 'disconnected', apiUrl: 'https://api.calendly.com', docsUrl: 'https://calendly.dev/api-docs/getting-started', lastSync: null },
  { name: 'SurveyMonkey', id: 'smk', category: 'Surveys', status: 'disconnected', apiUrl: 'https://api.surveymonkey.com/v3', docsUrl: 'https://developer.surveymonkey.com/api/v3/', lastSync: null },
  { name: 'Typeform', id: 'tfm', category: 'Surveys', status: 'disconnected', apiUrl: 'https://api.typeform.com/', docsUrl: 'https://developer.typeform.com/get-started/', lastSync: null },
  { name: 'Eventbrite', id: 'evt', category: 'Events', status: 'disconnected', apiUrl: 'https://www.eventbriteapi.com/v3/', docsUrl: 'https://www.eventbrite.com/platform/api/', lastSync: null },
  { name: 'Contentful', id: 'cfl', category: 'CMS', status: 'disconnected', apiUrl: 'https://cdn.contentful.com', docsUrl: 'https://www.contentful.com/developers/docs/references/content-delivery-api/', lastSync: null },
  { name: 'Stripe', id: 'str', category: 'Payments', status: 'disconnected', apiUrl: 'https://api.stripe.com/v1', docsUrl: 'https://stripe.com/docs/api', lastSync: null },
  { name: 'Braintree', id: 'bnt', category: 'Payments', status: 'disconnected', apiUrl: 'https://developers.braintreepayments.com/reference/request', docsUrl: 'https://developers.braintreepayments.com/start/hello-server/node', lastSync: null },
  { name: 'Adyen', id: 'ayn', category: 'Payments', status: 'disconnected', apiUrl: 'https://docs.adyen.com/api-explorer', docsUrl: 'https://docs.adyen.com/', lastSync: null },
  { name: 'Chargebee', id: 'cgb', category: 'Billing', status: 'disconnected', apiUrl: 'https://{site}.chargebee.com/api/v2', docsUrl: 'https://apidocs.chargebee.com/docs/api', lastSync: null },
  { name: 'Recurly', id: 'rcy', category: 'Billing', status: 'disconnected', apiUrl: 'https://v3.recurly.com', docsUrl: 'https://developers.recurly.com/api/v2021-02-25/', lastSync: null },
  { name: 'Avalara', id: 'alr', category: 'Tax', status: 'disconnected', apiUrl: 'https://developer.avalara.com/api-reference/', docsUrl: 'https://developer.avalara.com/', lastSync: null },
  { name: 'TaxJar', id: 'txj', category: 'Tax', status: 'disconnected', apiUrl: 'https://api.taxjar.com/v2/', docsUrl: 'https://developers.taxjar.com/api/reference/', lastSync: null },
  { name: 'Shippo', id: 'shp', category: 'Shipping', status: 'disconnected', apiUrl: 'https://api.goshippo.com/', docsUrl: 'https://goshippo.com/docs/reference/', lastSync: null },
  { name: 'EasyPost', id: 'eps', category: 'Shipping', status: 'disconnected', apiUrl: 'https://api.easypost.com/v2/', docsUrl: 'https://www.easypost.com/docs/api', lastSync: null },
  { name: 'Drip', id: 'drp', category: 'Marketing', status: 'disconnected', apiUrl: 'https://api.getdrip.com/v2/', docsUrl: 'https://developer.drip.com/#getting-started', lastSync: null },
  { name: 'Klaviyo', id: 'kvy', category: 'Marketing', status: 'disconnected', apiUrl: 'https://a.klaviyo.com/api/', docsUrl: 'https://developers.klaviyo.com/en/docs/getting-started-with-klaviyo-apis', lastSync: null },
  { name: 'Segment', id: 'sgm', category: 'Analytics', status: 'disconnected', apiUrl: 'https://api.segment.io/v1', docsUrl: 'https://segment.com/docs/connections/sources/catalog/libraries/server/http-api/', lastSync: null },
  { name: 'Mixpanel', id: 'mxp', category: 'Analytics', status: 'disconnected', apiUrl: 'https://api.mixpanel.com', docsUrl: 'https://developer.mixpanel.com/reference/overview', lastSync: null },
  { name: 'Amplitude', id: 'amp', category: 'Analytics', status: 'disconnected', apiUrl: 'https://api.amplitude.com', docsUrl: 'https://www.docs.developers.amplitude.com/analytics/apis/http-v2-api/', lastSync: null },
  { name: 'Google Analytics', id: 'gan', category: 'Analytics', status: 'disconnected', apiUrl: 'https://analytics.googleapis.com', docsUrl: 'https://developers.google.com/analytics/', lastSync: null },
  { name: 'Heap', id: 'hap', category: 'Analytics', status: 'disconnected', apiUrl: 'https://heapanalytics.com/api/v1', docsUrl: 'https://developers.heap.io/docs', lastSync: null },
  { name: 'FullStory', id: 'f_s', category: 'Analytics', status: 'disconnected', apiUrl: 'https://api.fullstory.com', docsUrl: 'https://developer.fullstory.com/intro', lastSync: null },
  { name: 'Hotjar', id: 'hjr', category: 'Analytics', status: 'disconnected', apiUrl: 'https://api.hotjar.com', docsUrl: 'https://developers.hotjar.com/docs', lastSync: null },
  { name: 'Optimizely', id: 'opt', category: 'Experimentation', status: 'disconnected', apiUrl: 'https://api.optimizely.com/v2', docsUrl: 'https://docs.developers.optimizely.com/rest-api/docs', lastSync: null },
  { name: 'LaunchDarkly', id: 'ldr', category: 'Experimentation', status: 'disconnected', apiUrl: 'https://app.launchdarkly.com/api/v2', docsUrl: 'https://apidocs.launchdarkly.com/', lastSync: null },
  { name: 'Bitbucket', id: 'bbt', category: 'DevOps', status: 'disconnected', apiUrl: 'https://api.bitbucket.org/2.0', docsUrl: 'https://developer.atlassian.com/bitbucket/api/2/reference/', lastSync: null },
  { name: 'GitLab', id: 'glb', category: 'DevOps', status: 'disconnected', apiUrl: 'https://gitlab.com/api/v4', docsUrl: 'https://docs.gitlab.com/ee/api/', lastSync: null },
  { name: 'CircleCI', id: 'cci', category: 'DevOps', status: 'disconnected', apiUrl: 'https://circleci.com/api/v2', docsUrl: 'https://circleci.com/docs/api/v2/', lastSync: null },
  { name: 'Travis CI', id: 'tci', category: 'DevOps', status: 'disconnected', apiUrl: 'https://api.travis-ci.com', docsUrl: 'https://developer.travis-ci.com/resource/requests', lastSync: null },
  { name: 'Jenkins', id: 'jks', category: 'DevOps', status: 'disconnected', apiUrl: 'https://{your-jenkins-server}/api/json', docsUrl: 'https://www.jenkins.io/doc/book/using/remote-access-api/', lastSync: null },
  { name: 'Docker Hub', id: 'dkh', category: 'DevOps', status: 'disconnected', apiUrl: 'https://hub.docker.com/v2', docsUrl: 'https://docs.docker.com/docker-hub/api/latest/', lastSync: null },
  { name: 'Kubernetes', id: 'k8s', category: 'DevOps', status: 'disconnected', apiUrl: 'https://{your-k8s-cluster}/api/v1', docsUrl: 'https://kubernetes.io/docs/reference/kubernetes-api/', lastSync: null },
];

export const genPseudoUUID = () => {
  let d = new Date().getTime();
  let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

export const createMockDataStream = (count: number): LdgAcc[] => {
    const d: LdgAcc[] = [];
    for (let i = 0; i < count; i++) {
        const dbt = Math.random() * 10000;
        const crd = Math.random() * 10000;
        d.push({
            id: genPseudoUUID(),
            nm: `Acct-${(Math.random() + 1).toString(36).substring(2)}-${i}`,
            dbt,
            crd,
            bal: (i > 0 ? d[i-1].bal : 50000) + crd - dbt,
            crn: ['USD', 'EUR', 'GBP', 'JPY'][Math.floor(Math.random() * 4)],
            ts: Date.now() - Math.floor(Math.random() * 1000000000),
            meta: { src: allIntegrations[Math.floor(Math.random() * allIntegrations.length)].id, v: Math.random() > 0.5 },
        });
    }
    return d;
};

export class UniversalDataConnector {
    private b: string;
    private c: string;
    private t: string | null = null;
    
    constructor(bUrl: string, cName: string) {
        this.b = bUrl;
        this.c = cName;
    }

    async auth(sId: string, k: string): Promise<boolean> {
        console.log(`Authenticating ${sId} for ${this.c}`);
        this.t = `tk_${sId}_${Math.random()}`;
        await new Promise(r => setTimeout(r, 500));
        return true;
    }

    async fetchData(sId: string, p: Record<string, any>): Promise<any> {
        if (!this.t) throw new Error("Not authenticated");
        const s = allIntegrations.find(i => i.id === sId);
        if (!s) throw new Error("Service not found");
        
        console.log(`Fetching data from ${s.name} with params`, p);
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        return {
            data: createMockDataStream(50),
            meta: { timestamp: Date.now(), source: s.name, query: p }
        };
    }
}


export const CStyledElement = React.forwardRef<any, { as: React.ElementType; style?: React.CSSProperties; children?: React.ReactNode; [key: string]: any }>(
    ({ as: Cmp, style, children, ...props }, ref) => {
        return <Cmp ref={ref} style={style} {...props}>{children}</Cmp>;
    }
);
CStyledElement.displayName = 'CStyledElement';


type GState = {
    data: LdgAcc[];
    loading: boolean;
    error: string | null;
    integrations: IIntegration[];
    filter: string;
    sort: { key: keyof LdgAcc, dir: 'asc' | 'desc' };
    pagination: { page: number, size: number, total: number };
};

type GAction = 
    | { type: 'FETCH_INIT' }
    | { type: 'FETCH_SUCCESS', payload: LdgAcc[] }
    | { type: 'FETCH_FAILURE', payload: string }
    | { type: 'SET_FILTER', payload: string }
    | { type: 'SET_SORT', payload: { key: keyof LdgAcc, dir: 'asc' | 'desc' } }
    | { type: 'SET_PAGE', payload: number }
    | { type: 'UPDATE_INTEGRATION_STATUS', payload: { id: string, status: ApiConnStatus } };

const initialGlobalState: GState = {
    data: [],
    loading: true,
    error: null,
    integrations: allIntegrations,
    filter: '',
    sort: { key: 'ts', dir: 'desc' },
    pagination: { page: 1, size: 50, total: 0 },
};

const gReducer = (state: GState, action: GAction): GState => {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, data: action.payload, pagination: {...state.pagination, total: action.payload.length} };
        case 'FETCH_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'SET_FILTER':
            return { ...state, filter: action.payload, pagination: {...state.pagination, page: 1} };
        case 'SET_SORT':
            return { ...state, sort: action.payload };
        case 'SET_PAGE':
            return { ...state, pagination: { ...state.pagination, page: action.payload } };
        case 'UPDATE_INTEGRATION_STATUS':
            return {
                ...state,
                integrations: state.integrations.map(i => 
                    i.id === action.payload.id ? { ...i, status: action.payload.status, lastSync: Date.now() } : i
                )
            };
        default:
            return state;
    }
};

const useComprehensiveState = () => {
    const [st, dispatch] = React.useReducer(gReducer, initialGlobalState);

    React.useEffect(() => {
        dispatch({ type: 'FETCH_INIT' });
        const t = setTimeout(() => {
            try {
                const d = createMockDataStream(5000);
                dispatch({ type: 'FETCH_SUCCESS', payload: d });
            } catch (e: any) {
                dispatch({ type: 'FETCH_FAILURE', payload: e.message });
            }
        }, 1500);
        return () => clearTimeout(t);
    }, []);
    
    const filteredData = React.useMemo(() => {
        return st.data
            .filter(row => row.nm.toLowerCase().includes(st.filter.toLowerCase()))
            .sort((a, b) => {
                const valA = a[st.sort.key];
                const valB = b[st.sort.key];
                if (valA < valB) return st.sort.dir === 'asc' ? -1 : 1;
                if (valA > valB) return st.sort.dir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [st.data, st.filter, st.sort]);

    const paginatedData = React.useMemo(() => {
        const start = (st.pagination.page - 1) * st.pagination.size;
        const end = start + st.pagination.size;
        return filteredData.slice(start, end);
    }, [filteredData, st.pagination.page, st.pagination.size]);

    return { st, dispatch, pData: paginatedData, fData: filteredData };
};

const headerCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #e0e0e0',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    position: 'sticky',
    top: 0,
    zIndex: 1,
};

const cellStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderBottom: '1px solid #f0f0f0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

const rowStyle: React.CSSProperties = {
    transition: 'background-color 0.1s ease-in-out',
};

const rowHoverStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
};

export const AdvancedDataGrid = ({
  d,
  s,
  onSort,
}: {
  d: LdgAcc[];
  s: GState['sort'];
  onSort: (k: keyof LdgAcc) => void;
}) => {
    const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 50 });
    const rowHeight = 45;

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, clientHeight } = containerRef.current;
            const start = Math.floor(scrollTop / rowHeight);
            const end = Math.min(d.length, start + Math.ceil(clientHeight / rowHeight) + 5);
            setVisibleRange({ start, end });
        }
    };
    
    React.useEffect(() => {
        const el = containerRef.current;
        el?.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => el?.removeEventListener('scroll', handleScroll);
    }, [d.length]);

    const cols: { key: keyof LdgAcc; label: string; width?: string }[] = [
        { key: 'nm', label: 'Account Name', width: '250px' },
        { key: 'ts', label: 'Timestamp', width: '200px' },
        { key: 'crn', label: 'Currency', width: '100px' },
        { key: 'dbt', label: 'Debit', width: '150px' },
        { key: 'crd', label: 'Credit', width: '150px' },
        { key: 'bal', label: 'Balance', width: '150px' },
    ];
    
    const formatCurrency = (n: number, c: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n);
    };
    
    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleString();
    };
    
    const getRenderedData = () => {
      const visibleData = [];
      for (let i = visibleRange.start; i < visibleRange.end; i++) {
        if (d[i]) {
          visibleData.push(d[i]);
        }
      }
      return visibleData;
    };

    return (
        <CStyledElement as="div" ref={containerRef} style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <CStyledElement as="div" style={{ position: 'relative', height: `${d.length * rowHeight}px` }}>
                <CStyledElement as="div" style={{ position: 'absolute', top: `${visibleRange.start * rowHeight}px`, width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {cols.map(c => (
                                    <th key={c.key} style={{...headerCellStyle, width: c.width}} onClick={() => onSort(c.key)}>
                                        {c.label} {s.key === c.key ? (s.dir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {getRenderedData().map((r, i) => (
                                <tr 
                                    key={r.id}
                                    onMouseEnter={() => setHoveredRow(r.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    style={{ ...rowStyle, ...(hoveredRow === r.id ? rowHoverStyle : {}) }}
                                >
                                    {cols.map(c => (
                                        <td key={`${r.id}-${c.key}`} style={{...cellStyle, width: c.width, maxWidth: c.width}}>
                                            {c.key === 'ts' ? formatDate(r[c.key] as number) : 
                                             ['dbt', 'crd', 'bal'].includes(c.key) ? formatCurrency(r[c.key] as number, r.crn) : 
                                             r[c.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CStyledElement>
            </CStyledElement>
        </CStyledElement>
    );
};


export const IntegrationManager = ({ ints, dispatch }: { ints: IIntegration[], dispatch: React.Dispatch<GAction> }) => {
    const [category, setCategory] = React.useState('All');
    const categories = ['All', ...Array.from(new Set(ints.map(i => i.category)))];

    const toggleConnection = (id: string, currentStatus: ApiConnStatus) => {
        if (currentStatus === 'connected' || currentStatus === 'pending') {
            dispatch({ type: 'UPDATE_INTEGRATION_STATUS', payload: { id, status: 'disconnected' } });
        } else {
            dispatch({ type: 'UPDATE_INTEGRATION_STATUS', payload: { id, status: 'pending' } });
            setTimeout(() => {
                const success = Math.random() > 0.2;
                dispatch({ type: 'UPDATE_INTEGRATION_STATUS', payload: { id, status: success ? 'connected' : 'error' } });
            }, 1500);
        }
    };
    
    const getStatusIndicator = (s: ApiConnStatus) => {
        const style: React.CSSProperties = {
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: '8px',
        };
        switch (s) {
            case 'connected': return <span style={{ ...style, backgroundColor: '#2ecc71' }} />;
            case 'disconnected': return <span style={{ ...style, backgroundColor: '#95a5a6' }} />;
            case 'pending': return <span style={{ ...style, backgroundColor: '#f1c40f' }} />;
            case 'error': return <span style={{ ...style, backgroundColor: '#e74c3c' }} />;
        }
    };
    
    return (
        <CStyledElement as="div" style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>API Integrations</h3>
            <div style={{ marginBottom: '16px' }}>
                {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{ padding: '8px 12px', marginRight: '8px', border: '1px solid', borderColor: category === c ? '#3498db' : '#ccc', borderRadius: '4px', background: category === c ? '#3498db' : 'white', color: category === c ? 'white' : 'black', cursor: 'pointer' }}>
                        {c}
                    </button>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {ints.filter(i => category === 'All' || i.category === category).map(i => (
                    <div key={i.id} style={{ border: '1px solid #eee', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h4 style={{ margin: '0 0 8px 0' }}>{getStatusIndicator(i.status)} {i.name}</h4>
                            <p style={{ fontSize: '12px', color: '#777', margin: '0 0 12px 0' }}>{i.category}</p>
                        </div>
                        <button onClick={() => toggleConnection(i.id, i.status)} style={{ padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: i.status === 'connected' ? '#e74c3c' : '#27ae60', color: 'white', width: '100%' }}>
                            {i.status === 'connected' ? 'Disconnect' : i.status === 'pending' ? 'Connecting...' : 'Connect'}
                        </button>
                    </div>
                ))}
            </div>
        </CStyledElement>
    );
};

export default function MonetarySystemHub() {
  const { st, dispatch, pData, fData } = useComprehensiveState();
  const handleSort = (k: keyof LdgAcc) => {
    const dir = st.sort.key === k && st.sort.dir === 'asc' ? 'desc' : 'asc';
    dispatch({ type: 'SET_SORT', payload: { key: k, dir } });
  };
  
  const totalPages = Math.ceil(fData.length / st.pagination.size);

  return (
    <Card className="!p-0" style={{ fontFamily: 'sans-serif' }}>
      <CardHeader className="items-start justify-between px-4 pt-4 flex-col md:flex-row">
        <CardHeading>
          <CardTitle>Consolidated Financial Ledger</CardTitle>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Powered by {C_NAME}</p>
        </CardHeading>
        <div style={{ marginTop: '10px' }}>
            <input 
                type="text" 
                placeholder="Filter by account name..."
                value={st.filter}
                onChange={e => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '300px' }}
            />
        </div>
      </CardHeader>
      <CardContent style={{ padding: '16px' }}>
        <IntegrationManager ints={st.integrations} dispatch={dispatch} />
        {st.loading && <p>Loading financial data stream...</p>}
        {st.error && <p style={{ color: 'red' }}>Error: {st.error}</p>}
        {!st.loading && !st.error && (
            <>
                <AdvancedDataGrid d={fData} s={st.sort} onSort={handleSort} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '8px' }}>
                    <span>Showing {pData.length} of {fData.length} records</span>
                    <div>
                        <button 
                            disabled={st.pagination.page <= 1} 
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: st.pagination.page - 1 })}
                            style={{ padding: '8px 12px', marginRight: '8px', cursor: st.pagination.page <= 1 ? 'not-allowed' : 'pointer' }}
                        >
                            Previous
                        </button>
                        <span>Page {st.pagination.page} of {totalPages}</span>
                        <button 
                            disabled={st.pagination.page >= totalPages}
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: st.pagination.page + 1 })}
                            style={{ padding: '8px 12px', marginLeft: '8px', cursor: st.pagination.page >= totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}