// types/models/webhooks/webhook-subscription.ts
export interface WebhookSubscription {
    id: string;
    targetUrl: string;
    topics: string[];
    isActive: boolean;
}
