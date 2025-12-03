// data/platform/webhooks.ts
import type { WebhookSubscription } from '../../types';

/**
 * @description A list of configured webhook subscriptions. This data is used in the
 * 'Webhooks' view within the developer hub, showing how external services can subscribe
 * to events happening within the Demo Bank ecosystem.
 */
export const MOCK_WEBHOOK_SUBSCRIPTIONS: WebhookSubscription[] = [
    { id: 'wh_sub_1', targetUrl: 'https://api.crm-provider.com/hooks/demobank', topics: ['db.users.created', 'db.counterparties.created'], isActive: true },
    { id: 'wh_sub_2', targetUrl: 'https://api.slack.com/hooks/T12345', topics: ['db.anomalies.detected', 'db.payments.failed'], isActive: true },
    { id: 'wh_sub_3', targetUrl: 'https://api.internal-analytics.com/ingest', topics: ['db.transactions.*'], isActive: false },
];