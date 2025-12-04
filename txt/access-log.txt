// types/models/corporate/access-log.ts
export interface AccessLog {
    id: string;
    user: string;
    ip: string;
    location: string;
    timestamp: string;
    status: 'Success' | 'Failed';
    riskLevel: 'Low' | 'Medium' | 'High';
}