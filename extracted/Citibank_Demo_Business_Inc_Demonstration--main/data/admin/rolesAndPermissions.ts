// data/admin/rolesAndPermissions.ts
import type { Role, Permission } from '../../types';

/**
 * @description The complete list of granular permissions available in the system.
 * This serves as the source of truth for what actions can be controlled.
 */
export const MOCK_PERMISSIONS: Permission[] = [
    { id: 'users:read', name: 'Read Users', description: 'Can view user profiles and lists.' },
    { id: 'users:write', name: 'Write Users', description: 'Can create, edit, and delete user profiles.' },
    { id: 'transactions:read', name: 'Read Transactions', description: 'Can view personal and corporate transaction histories.' },
    { id: 'payments:create', name: 'Create Payments', description: 'Can initiate new payment orders.' },
    { id: 'payments:approve', name: 'Approve Payments', description: 'Can approve payment orders that require sign-off.' },
    { id: 'compliance:review', name: 'Review Compliance Cases', description: 'Can view and take action on compliance cases.' },
    { id: 'security:admin', name: 'Administer Security', description: 'Can manage roles, permissions, and security settings.' },
];

/**
 * @description A list of user roles, each with a specific set of permissions.
 * This data is foundational for the 'Role Management' and 'Access Controls' views,
 * demonstrating a sophisticated, enterprise-grade security model.
 */
export const MOCK_ROLES: Role[] = [
    {
        id: 'role_admin',
        name: 'Administrator',
        permissions: ['users:read', 'users:write', 'transactions:read', 'payments:create', 'payments:approve', 'compliance:review', 'security:admin'],
    },
    {
        id: 'role_finance_manager',
        name: 'Finance Manager',
        permissions: ['transactions:read', 'payments:create', 'payments:approve', 'compliance:review'],
    },
    {
        id: 'role_analyst',
        name: 'Compliance Analyst',
        permissions: ['transactions:read', 'compliance:review'],
    },
    {
        id: 'role_employee',
        name: 'Employee',
        permissions: ['transactions:read'],
    },
];