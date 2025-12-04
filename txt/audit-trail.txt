// types/models/audit/audit-trail.ts
import type { LogEntry } from './log-entry';

export interface AuditTrail {
    id: string;
    entityId: string;
    entityType: string;
    logs: LogEntry[];
}
