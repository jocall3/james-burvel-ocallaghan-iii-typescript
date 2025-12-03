// data/admin/auditTrails.ts
import type { AuditTrail } from '../../types';

/**
 * @description A collection of mock audit trails for various critical actions within the system.
 * This data is essential for the 'Audit Logs' view, simulating a detailed and immutable record
 * of all significant events for compliance and security analysis.
 */
export const MOCK_AUDIT_TRAILS: AuditTrail[] = [
    {
        id: 'audit_po_005',
        entityType: 'PaymentOrder',
        entityId: 'po_005',
        logs: [
            { timestamp: '2024-07-23 10:45 AM', userId: 'user_finance_manager', action: 'CREATE', details: { amount: 15000, counterparty: 'QuantumLeap Marketing' } },
            { timestamp: '2024-07-23 10:46 AM', userId: 'system_ai', action: 'FLAG_ANOMALY', details: { anomalyId: 'anom_1', reason: 'Unusually Large Payment to New Counterparty' } },
            { timestamp: '2024-07-23 11:15 AM', userId: 'user_admin', action: 'APPROVE', details: { comment: 'Approved after manual verification of invoice.' } },
        ]
    },
    {
        id: 'audit_role_admin',
        entityType: 'Role',
        entityId: 'role_admin',
        logs: [
            { timestamp: '2024-07-20 09:00 AM', userId: 'user_admin', action: 'CREATE_ROLE', details: { name: 'Administrator' } },
            { timestamp: '2024-07-21 02:30 PM', userId: 'user_admin', action: 'ADD_PERMISSION', details: { permission: 'security:admin' } },
        ]
    }
];