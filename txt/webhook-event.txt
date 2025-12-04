// types/models/webhooks/webhook-event.ts
export interface WebhookEvent {
    id: string;
    topic: string;
    payload: Record<string, any>;
    createdAt: string;
}
