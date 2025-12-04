// data/integrationData.ts
// This is the Scribe's Ledger of Infinite Connections. It contains the raw knowledge
// that fuels the Integration Codex, defining the pantheon of linkable platforms, the
// incantations of code, and the litany of use cases for each sacred module.

import React from 'react';
import { View } from '../types';
import type { IntegrationPlatform, UseCase } from '../types';
// FIX: Moved icon component definitions to constants.tsx and imported them. This resolves JSX parsing errors in a .ts file.
import {
    StripeIcon,
    PlaidIcon,
    SlackIcon,
    SalesforceIcon,
    PagerDutyIcon,
    JiraIcon,
} from '../constants';

// ================================================================================================
// DASHBOARD INTEGRATIONS
// ================================================================================================

const dashboardIntegrations: IntegrationPlatform[] = [
    {
        name: 'Plaid',
        logo: React.createElement(PlaidIcon),
        description: 'Securely connect user bank accounts to fetch real-time transaction and balance data.',
        snippets: [
            { language: 'typescript', label: 'Initialize Link', code: `// Frontend TypeScript\nconst handler = Plaid.create({\n  token: linkToken,\n  onSuccess: (public_token, metadata) => {\n    // Send public_token to your server\n  },\n});\nhandler.open();` },
            { language: 'python', label: 'Exchange Token', code: `# Backend Python (Flask)\n@app.route('/exchange_token', methods=['POST'])\ndef exchange_token():\n  public_token = request.json['public_token']\n  response = client.item_public_token_exchange(public_token)\n  access_token = response['access_token']\n  # Store access_token securely\n  return jsonify({'status': 'success'})`},
            { language: 'go', label: 'Fetch Transactions', code: `// Backend Go\nfunc getTransactions(accessToken string) {\n  client := plaid.NewClient(...)\n  resp, err := client.GetTransactions(accessToken, "2024-01-01", "2024-07-31")\n  // Process resp.Transactions\n}`},
        ]
    },
    {
        name: 'Stripe',
        logo: React.createElement(StripeIcon),
        description: 'Process payments, manage subscriptions, and integrate financial services.',
        snippets: [
            { language: 'typescript', label: 'Create Payment Intent', code: `// Backend TypeScript (Node.js)\nimport Stripe from 'stripe';\nconst stripe = new Stripe('sk_test_...');\n\nconst paymentIntent = await stripe.paymentIntents.create({\n  amount: 2000,\n  currency: 'usd',\n});` },
            { language: 'python', label: 'Create Customer', code: `# Backend Python\nimport stripe\nstripe.api_key = 'sk_test_...'\n\ncustomer = stripe.Customer.create(\n  email='visionary@demobank.com',\n  name='The Visionary',\n)`},
            { language: 'go', label: 'List Charges', code: `// Backend Go\nimport "github.com/stripe/stripe-go/v72"\n\nstripe.Key = "sk_test_..."\nparams := &stripe.ChargeListParams{}\n_ = charge.List(params)`},
        ]
    }
];

const dashboardUseCases: UseCase[] = [
    { title: 'Holistic Financial View', description: 'Aggregate data from multiple institutions using Plaid to provide a complete financial picture, powering the Balance Summary and Net Worth widgets.' },
    { title: 'Personalized Budgeting', description: 'Analyze incoming transaction data from Plaid to automatically categorize spending and track it against user-defined budgets in the Allocatra™ module.' },
    { title: 'AI-Powered Savings Insights', description: 'Feed real-time transaction data into the Gemini API to generate actionable savings recommendations and anomaly alerts in the AI Insights widget.' },
    { title: 'Automated Goal Contributions', description: 'When a salary is detected via a Plaid transaction webhook, use the Stripe API to automatically transfer a pre-defined amount to a user\'s savings goal.' },
    { title: 'Subscription Management', description: 'Identify recurring payments from transaction data and allow users to manage or cancel them through an integrated service, reducing unwanted spend.' },
];

// ================================================================================================
// CORPORATE DASHBOARD INTEGRATIONS
// ================================================================================================

const corpIntegrations: IntegrationPlatform[] = [
    {
        name: 'Salesforce',
        logo: React.createElement(SalesforceIcon),
        description: 'Sync customer data, invoices, and payment statuses with your CRM.',
        snippets: [{ language: 'typescript', label: 'Update Account', code: `// TypeScript (using jsforce)\nimport jsforce from 'jsforce';\nconst conn = new jsforce.Connection({...});\nconn.login(username, password, (err, userInfo) => {\n  conn.sobject("Account").update({ \n    Id: '001...', Name: 'New Name' \n  });\n});` }, { language: 'python', label: 'Query Contacts', code: `# Python (using simple-salesforce)\nfrom simple_salesforce import Salesforce\nsf = Salesforce(username='...', password='...', security_token='...')\ndata = sf.query("SELECT Id, Name FROM Contact")` }, { language: 'go', label: 'Create Lead', code: `// Go (conceptual)\nclient := salesforce.NewClient(...)\nlead := &salesforce.Lead{LastName: "Smith"}\n_ = client.Create(lead)` }]
    },
    {
        name: 'Slack',
        logo: React.createElement(SlackIcon),
        description: 'Send real-time notifications for critical events like payment approvals or compliance alerts.',
        snippets: [{ language: 'typescript', label: 'Post Message', code: `// TypeScript (using @slack/web-api)\nimport { WebClient } from '@slack/web-api';\nconst web = new WebClient(token);\n\nawait web.chat.postMessage({\n  channel: '#finance-alerts',\n  text: 'Payment PO-005 needs approval.'\n});` }, { language: 'python', label: 'Send Alert', code: `# Python (using slack_sdk)\nimport slack_sdk\nclient = slack_sdk.WebClient(token=token)\n\nclient.chat_postMessage(\n  channel="#compliance",\n  text="New anomaly detected: ANOM-001"\n)` }, { language: 'go', label: 'Post to Channel', code: `// Go (using slack-go)\nimport "github.com/slack-go/slack"\n\napi := slack.New("xoxb-...")\n_, _, err := api.PostMessage(\n  "C12345",\n  slack.MsgOptionText("Hello world", false),\n)` }]
    },
     {
        name: 'PagerDuty',
        logo: React.createElement(PagerDutyIcon),
        description: 'Automatically trigger incidents for high-severity financial anomalies.',
        snippets: [{ language: 'typescript', label: 'Trigger Incident', code: `// TypeScript (using @pagerduty/pdjs)\nimport { events } from '@pagerduty/pdjs';\n\nevents.send({\n  routing_key: 'YOUR_KEY',\n  event_action: 'trigger',\n  payload: { ... }\n});` }, { language: 'python', label: 'Trigger Event', code: `# Python (using pdpyras)\nfrom pdpyras import APISession\nsession = APISession(api_key)\nsession.trigger(\n  'High-risk anomaly detected',\n  'your-service-id'\n)` }, { language: 'go', label: 'Send Event', code: `// Go (conceptual)\nclient := pagerduty.NewClient(...)\nevent := &pagerduty.Event{...}\n_ = client.Send(event)` }]
    },
      {
        name: 'Jira',
        logo: React.createElement(JiraIcon),
        description: 'Create tickets for fraud cases, compliance reviews, or payment failures.',
        snippets: [{ language: 'typescript', label: 'Create Issue', code: `// TypeScript (using jira.js)\nimport { JiraClient } from 'jira.js';\n\nconst client = new JiraClient({...});\nconst issue = await client.issues.createIssue({...});` }, { language: 'python', label: 'New Ticket', code: `# Python (using jira)\nfrom jira import JIRA\njira = JIRA(server='...', basic_auth=('...', '...'))\n\njira.create_issue(project='FIN', summary='...')` }, { language: 'go', label: 'Create Issue', code: `// Go (using go-jira)\nimport "github.com/andygrunwald/go-jira"\n\njiraClient, _ := jira.NewClient(...)` }]
    },
];

const corpUseCases: UseCase[] = [
    { title: 'Automated Incident Response', description: 'When a "Critical" financial anomaly is detected, automatically create a PagerDuty incident for the on-call finance team and a Jira ticket for the fraud investigation team.' },
    { title: 'Streamlined Approval Workflow', description: 'When a payment order requires approval, post an interactive message in a private Slack channel. Managers can approve or deny with a single click directly from Slack.' },
    { title: 'CRM Sync for Invoices', description: 'When an invoice is marked as "Paid" in Demo Bank, automatically update the corresponding Opportunity or Account record in Salesforce to "Closed Won".' },
    { title: 'Real-time Compliance Alerts', description: 'If a transaction is flagged by a compliance rule, immediately send a high-priority alert to the #compliance Slack channel with a link to the case file.' },
    { title: 'Vendor Onboarding Automation', description: 'When a new Counterparty is added and verified in Demo Bank, create a corresponding "Vendor" account in Salesforce and a new private channel in Slack for communication.' },
];


// ================================================================================================
// EXPORTED DATA MAP
// ================================================================================================

type IntegrationData = {
    integrations: IntegrationPlatform[];
    useCases: UseCase[];
}

export const INTEGRATION_DATA: Partial<Record<View, IntegrationData>> = {
    [View.Dashboard]: {
        integrations: dashboardIntegrations,
        useCases: dashboardUseCases,
    },
    [View.CorporateDashboard]: {
        integrations: corpIntegrations,
        useCases: corpUseCases,
    }
};
