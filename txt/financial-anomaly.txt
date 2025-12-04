// types/models/corporate/financial-anomaly.ts
import type { AnomalySeverity } from './anomaly-severity';
import type { AnomalyStatus } from './anomaly-status';
import type { AnomalyEntityType } from './anomaly-entity-type';

export interface FinancialAnomaly {
    id: string;
    description: string;
    details: string; // AI-generated explanation
    severity: AnomalySeverity;
    status: AnomalyStatus;
    entityType: AnomalyEntityType;
    entityId: string;
    entityDescription: string;
    timestamp: string;
    riskScore: number; // 0-100
}