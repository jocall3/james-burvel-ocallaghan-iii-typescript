// types/models/audit/log-entry.ts
export interface LogEntry {
    timestamp: string;
    userId: string;
    action: string;
    details: Record<string, any>;
}
