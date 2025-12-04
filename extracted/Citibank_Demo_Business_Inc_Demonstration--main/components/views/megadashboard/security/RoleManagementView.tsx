import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';
import Card from '../../../Card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../components/ui/command';
import { Calendar } from '../../../../components/ui/calendar';
import { CalendarIcon, CheckIcon, ChevronsUpDown, Eye, EyeOff, PlusCircle, Search, Trash2, Edit2, Info, XCircle, AlertCircle, RefreshCcw, Save, Loader2, Link, Unlink } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { format } from 'date-fns';
import { Toggle } from '../../../../components/ui/toggle';
import { Switch } from '../../../../components/ui/switch';
import { toast } from '../../../../components/ui/use-toast';
import { Separator } from '../../../../components/ui/separator';
import { Slider } from '../../../../components/ui/slider';
import { Progress } from '../../../../components/ui/progress';

// --- Utility Types and Interfaces ---

/**
 * Represents a unique identifier for any entity.
 */
export type EntityId = string;

/**
 * Base interface for audit trail information.
 */
export interface AuditMeta {
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    createdBy: EntityId;
    updatedBy: EntityId;
    version: number;
}

/**
 * Represents a permission that can be assigned to a role.
 */
export interface Permission {
    id: EntityId;
    name: string;
    description: string;
    resource: string; // e.g., 'accounts', 'transactions', 'users'
    action: string;   // e.g., 'read', 'write', 'delete', 'approve'
    level?: 'global' | 'organizational' | 'departmental' | 'individual'; // Scope of the permission
    tags: string[]; // e.g., ['finance', 'sensitive', 'PII']
    deprecated?: boolean;
    audit: AuditMeta;
}

/**
 * Represents a security role.
 */
export interface Role {
    id: EntityId;
    name: string;
    description: string;
    permissions: EntityId[]; // Array of permission IDs
    users: EntityId[];       // Array of user IDs assigned to this role
    parentRoleId?: EntityId; // For role hierarchy
    isSystemRole: boolean; // Roles created by the system, cannot be deleted
    status: 'active' | 'inactive' | 'pending_review' | 'deprecated';
    reviewDate?: string; // Next scheduled review date
    aiSuggestions?: AISuggestion[]; // AI-driven recommendations
    audit: AuditMeta;
}

/**
 * Represents a user in the system (simplified for role management context).
 */
export interface User {
    id: EntityId;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    status: 'active' | 'inactive' | 'locked';
    lastLogin: string; // ISO string
    roles: EntityId[]; // Roles assigned to this user
    audit: AuditMeta;
}

/**
 * Represents an AI-driven suggestion related to roles or permissions.
 */
export interface AISuggestion {
    id: EntityId;
    type: 'least_privilege' | 'role_clustering' | 'drift_detection' | 'compliance_violation';
    targetId: EntityId; // Role ID or User ID
    message: string;
    details: Record<string, any>; // JSON object with specific details
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'accepted' | 'rejected' | 'dismissed';
    generatedAt: string; // ISO string
    acceptedBy?: EntityId; // User who accepted the suggestion
    acceptedAt?: string; // ISO string
    audit: AuditMeta;
}

/**
 * Represents an audit log entry for security-related actions.
 */
export interface AuditLogEntry {
    id: EntityId;
    timestamp: string; // ISO string
    actorId: EntityId; // User ID performing the action
    action: string; // e.g., 'ROLE_CREATED', 'PERMISSION_UPDATED', 'USER_ROLE_ASSIGNED'
    targetType: 'role' | 'permission' | 'user';
    targetId: EntityId;
    details: Record<string, any>; // Old/New values, context, etc.
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Context for managing global settings and state.
 */
export interface GlobalSecurityContextType {
    isSimulationMode: boolean;
    toggleSimulationMode: () => void;
    // Add other global settings if needed
}

export const GlobalSecurityContext = createContext<GlobalSecurityContextType | undefined>(undefined);

export const useGlobalSecurityContext = () => {
    const context = useContext(GlobalSecurityContext);
    if (!context) {
        throw new Error('useGlobalSecurityContext must be used within a GlobalSecurityProvider');
    }
    return context;
};

// --- Mock Data Service (Replace with actual API calls) ---
// In a real application, these would be API calls to a backend.
// For this extensive example, we'll simulate async behavior.

const MOCK_CURRENT_USER_ID: EntityId = 'user-admin-123';

let mockRoles: Role[] = [
    {
        id: 'role-admin',
        name: 'System Administrator',
        description: 'Grants full administrative access across the platform. Use with extreme caution.',
        permissions: ['perm-all', 'perm-user-mgmt', 'perm-role-mgmt', 'perm-audit-view'],
        users: ['user-admin-123'],
        isSystemRole: true,
        status: 'active',
        audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 }
    },
    {
        id: 'role-finance-manager',
        name: 'Finance Manager',
        description: 'Manages financial transactions, approvals, and reporting.',
        permissions: ['perm-tx-read', 'perm-tx-write', 'perm-tx-approve', 'perm-report-finance'],
        users: ['user-finance-mgr-1'],
        isSystemRole: false,
        status: 'active',
        reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        aiSuggestions: [],
        audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 }
    },
    {
        id: 'role-customer-service',
        name: 'Customer Service Agent',
        description: 'Handles customer inquiries and basic account modifications.',
        permissions: ['perm-user-read', 'perm-user-update-basic', 'perm-tx-read'],
        users: ['user-cs-1', 'user-cs-2'],
        isSystemRole: false,
        status: 'active',
        audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 }
    },
    {
        id: 'role-auditor',
        name: 'Security Auditor',
        description: 'Grants read-only access to audit logs and security configurations.',
        permissions: ['perm-audit-view', 'perm-role-read', 'perm-user-read'],
        users: [],
        isSystemRole: true,
        status: 'active',
        audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 }
    },
    {
        id: 'role-developer',
        name: 'Developer',
        description: 'Access for development environments and API usage.',
        permissions: ['perm-api-read', 'perm-api-write'],
        users: ['user-dev-1'],
        isSystemRole: false,
        status: 'pending_review',
        aiSuggestions: [
            {
                id: 'ai-sugg-1',
                type: 'least_privilege',
                targetId: 'role-developer',
                message: 'Consider removing "perm-api-write" if only read access is needed for monitoring.',
                details: { recommendedPermissions: ['perm-api-read'], unnecessaryPermissions: ['perm-api-write'] },
                severity: 'medium',
                status: 'pending',
                generatedAt: new Date().toISOString(),
                audit: { createdAt: new Date().toISOString(), createdBy: 'AI-system', updatedAt: new Date().toISOString(), updatedBy: 'AI-system', version: 1 }
            }
        ],
        audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 }
    }
];

let mockPermissions: Permission[] = [
    { id: 'perm-all', name: 'All Access', description: 'Grants all possible permissions.', resource: '*', action: '*', tags: ['dangerous', 'privileged'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-user-mgmt', name: 'User Management', description: 'Create, update, delete users.', resource: 'users', action: 'manage', tags: ['admin', 'PII'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-role-mgmt', name: 'Role Management', description: 'Create, update, delete roles and assign permissions.', resource: 'roles', action: 'manage', tags: ['admin', 'security'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-audit-view', name: 'View Audit Logs', description: 'Read all audit log entries.', resource: 'audit_logs', action: 'read', tags: ['security', 'compliance'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-tx-read', name: 'Read Transactions', description: 'View all transaction details.', resource: 'transactions', action: 'read', tags: ['finance'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-tx-write', name: 'Write Transactions', description: 'Create or modify transaction details.', resource: 'transactions', action: 'write', tags: ['finance', 'sensitive'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-tx-approve', name: 'Approve Transactions', description: 'Approve pending financial transactions.', resource: 'transactions', action: 'approve', tags: ['finance', 'privileged'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-report-finance', name: 'View Finance Reports', description: 'Access financial reports and analytics.', resource: 'reports_finance', action: 'read', tags: ['finance', 'reporting'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-user-read', name: 'Read User Profiles', description: 'View basic user profile information.', resource: 'users', action: 'read_basic', tags: ['PII'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-user-update-basic', name: 'Update Basic User Info', description: 'Modify non-sensitive user profile data.', resource: 'users', action: 'update_basic', tags: ['PII'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-api-read', name: 'API Read Access', description: 'Read data via API endpoints.', resource: 'api', action: 'read', tags: ['developer', 'technical'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'perm-api-write', name: 'API Write Access', description: 'Write data via API endpoints.', resource: 'api', action: 'write', tags: ['developer', 'technical', 'sensitive'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
];

let mockUsers: User[] = [
    { id: 'user-admin-123', username: 'john.doe', email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', department: 'IT Security', status: 'active', lastLogin: new Date().toISOString(), roles: ['role-admin'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'user-finance-mgr-1', username: 'jane.smith', email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith', department: 'Finance', status: 'active', lastLogin: new Date().toISOString(), roles: ['role-finance-manager'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'user-cs-1', username: 'peter.jones', email: 'peter.jones@example.com', firstName: 'Peter', lastName: 'Jones', department: 'Customer Service', status: 'active', lastLogin: new Date().toISOString(), roles: ['role-customer-service'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'user-cs-2', username: 'alice.brown', email: 'alice.brown@example.com', firstName: 'Alice', lastName: 'Brown', department: 'Customer Service', status: 'active', lastLogin: new Date().toISOString(), roles: ['role-customer-service'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
    { id: 'user-dev-1', username: 'bob.developer', email: 'bob.developer@example.com', firstName: 'Bob', lastName: 'Developer', department: 'Engineering', status: 'active', lastLogin: new Date().toISOString(), roles: ['role-developer'], audit: { createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system', version: 1 } },
];

let mockAuditLogs: AuditLogEntry[] = [];

// Helper to simulate API delay
const simulateApiCall = <T>(data: T, delay: number = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

// MOCK API LAYER
export const RoleAPI = {
    getRoles: async (): Promise<Role[]> => simulateApiCall(mockRoles),
    getRoleById: async (id: EntityId): Promise<Role | undefined> => simulateApiCall(mockRoles.find(r => r.id === id)),
    createRole: async (role: Omit<Role, 'id' | 'audit' | 'users' | 'isSystemRole' | 'status'>): Promise<Role> => {
        const newRole: Role = {
            ...role,
            id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            users: [],
            isSystemRole: false,
            status: 'active',
            audit: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: MOCK_CURRENT_USER_ID,
                updatedBy: MOCK_CURRENT_USER_ID,
                version: 1
            }
        };
        mockRoles.push(newRole);
        mockAuditLogs.push({
            id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'ROLE_CREATED',
            targetType: 'role', targetId: newRole.id, details: { newRole: newRole.name }
        });
        toast({ title: 'Role Created', description: `Role "${newRole.name}" successfully created.`, variant: 'success' });
        return simulateApiCall(newRole);
    },
    updateRole: async (id: EntityId, updates: Partial<Omit<Role, 'id' | 'audit' | 'isSystemRole'>>): Promise<Role> => {
        const index = mockRoles.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Role not found');
        const oldRole = mockRoles[index];
        const updatedRole: Role = {
            ...oldRole,
            ...updates,
            audit: {
                ...oldRole.audit,
                updatedAt: new Date().toISOString(),
                updatedBy: MOCK_CURRENT_USER_ID,
                version: oldRole.audit.version + 1
            }
        };
        mockRoles[index] = updatedRole;
        mockAuditLogs.push({
            id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'ROLE_UPDATED',
            targetType: 'role', targetId: updatedRole.id, details: { old: oldRole, new: updates }
        });
        toast({ title: 'Role Updated', description: `Role "${updatedRole.name}" successfully updated.`, variant: 'success' });
        return simulateApiCall(updatedRole);
    },
    deleteRole: async (id: EntityId): Promise<void> => {
        const roleToDelete = mockRoles.find(r => r.id === id);
        if (!roleToDelete) throw new Error('Role not found');
        if (roleToDelete.isSystemRole) throw new Error('Cannot delete system roles');
        if (roleToDelete.users.length > 0) throw new Error('Cannot delete role with assigned users. Unassign users first.');

        mockRoles = mockRoles.filter(r => r.id !== id);
        mockAuditLogs.push({
            id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'ROLE_DELETED',
            targetType: 'role', targetId: id, details: { roleName: roleToDelete.name }
        });
        toast({ title: 'Role Deleted', description: `Role "${roleToDelete.name}" successfully deleted.`, variant: 'success' });
        return simulateApiCall(undefined);
    },
    assignUserToRole: async (userId: EntityId, roleId: EntityId): Promise<void> => {
        const user = mockUsers.find(u => u.id === userId);
        const role = mockRoles.find(r => r.id === roleId);
        if (!user) throw new Error('User not found');
        if (!role) throw new Error('Role not found');

        if (!user.roles.includes(roleId)) {
            user.roles.push(roleId);
        }
        if (!role.users.includes(userId)) {
            role.users.push(userId);
        }
        mockAuditLogs.push({
            id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'USER_ROLE_ASSIGNED',
            targetType: 'user', targetId: userId, details: { roleId, roleName: role.name }
        });
        toast({ title: 'User Assigned', description: `User "${user.username}" assigned to role "${role.name}".`, variant: 'success' });
        return simulateApiCall(undefined);
    },
    unassignUserFromRole: async (userId: EntityId, roleId: EntityId): Promise<void> => {
        const user = mockUsers.find(u => u.id === userId);
        const role = mockRoles.find(r => r.id === roleId);
        if (!user) throw new Error('User not found');
        if (!role) throw new Error('Role not found');

        user.roles = user.roles.filter(r => r !== roleId);
        role.users = role.users.filter(u => u !== userId);
        mockAuditLogs.push({
            id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'USER_ROLE_UNASSIGNED',
            targetType: 'user', targetId: userId, details: { roleId, roleName: role.name }
        });
        toast({ title: 'User Unassigned', description: `User "${user.username}" unassigned from role "${role.name}".`, variant: 'success' });
        return simulateApiCall(undefined);
    },
    getRoleHistory: async (roleId: EntityId): Promise<AuditLogEntry[]> => {
        return simulateApiCall(mockAuditLogs.filter(log => log.targetType === 'role' && log.targetId === roleId));
    },
    getSuggestionsForRole: async (roleId: EntityId): Promise<AISuggestion[]> => {
        const role = mockRoles.find(r => r.id === roleId);
        return simulateApiCall(role?.aiSuggestions || []);
    },
    acceptSuggestion: async (suggestionId: EntityId): Promise<void> => {
        for (const role of mockRoles) {
            const suggestionIndex = role.aiSuggestions?.findIndex(s => s.id === suggestionId);
            if (suggestionIndex !== undefined && suggestionIndex !== -1 && role.aiSuggestions) {
                const suggestion = role.aiSuggestions[suggestionIndex];
                suggestion.status = 'accepted';
                suggestion.acceptedBy = MOCK_CURRENT_USER_ID;
                suggestion.acceptedAt = new Date().toISOString();

                // Apply the suggestion (mock logic)
                if (suggestion.type === 'least_privilege' && suggestion.details.unnecessaryPermissions) {
                    const permissionsToRemove = suggestion.details.unnecessaryPermissions as EntityId[];
                    role.permissions = role.permissions.filter(p => !permissionsToRemove.includes(p));
                    toast({
                        title: 'Suggestion Accepted',
                        description: `Least-privilege suggestion applied for role "${role.name}". Permissions removed.`,
                        variant: 'success'
                    });
                } else {
                    toast({ title: 'Suggestion Accepted', description: `Suggestion "${suggestion.id}" for role "${role.name}" accepted.`, variant: 'success' });
                }

                mockAuditLogs.push({
                    id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'AI_SUGGESTION_ACCEPTED',
                    targetType: 'role', targetId: role.id, details: { suggestionId, suggestionType: suggestion.type, message: suggestion.message }
                });
                return simulateApiCall(undefined);
            }
        }
        throw new Error('Suggestion not found');
    },
    rejectSuggestion: async (suggestionId: EntityId): Promise<void> => {
        for (const role of mockRoles) {
            const suggestionIndex = role.aiSuggestions?.findIndex(s => s.id === suggestionId);
            if (suggestionIndex !== undefined && suggestionIndex !== -1 && role.aiSuggestions) {
                role.aiSuggestions[suggestionIndex].status = 'rejected';
                mockAuditLogs.push({
                    id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'AI_SUGGESTION_REJECTED',
                    targetType: 'role', targetId: role.id, details: { suggestionId, suggestionType: role.aiSuggestions[suggestionIndex].type }
                });
                toast({ title: 'Suggestion Rejected', description: `Suggestion "${suggestionId}" for role "${role.name}" rejected.`, variant: 'warning' });
                return simulateApiCall(undefined);
            }
        }
        throw new Error('Suggestion not found');
    }
};

export const PermissionAPI = {
    getPermissions: async (): Promise<Permission[]> => simulateApiCall(mockPermissions),
    getPermissionById: async (id: EntityId): Promise<Permission | undefined> => simulateApiCall(mockPermissions.find(p => p.id === id)),
    createPermission: async (permission: Omit<Permission, 'id' | 'audit'>): Promise<Permission> => {
        const newPermission: Permission = {
            ...permission,
            id: `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            audit: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: MOCK_CURRENT_USER_ID,
                updatedBy: MOCK_CURRENT_USER_ID,
                version: 1
            }
        };
        mockPermissions.push(newPermission);
        mockAuditLogs.push({
            id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'PERMISSION_CREATED',
            targetType: 'permission', targetId: newPermission.id, details: { newPermission: newPermission.name }
        });
        toast({ title: 'Permission Created', description: `Permission "${newPermission.name}" successfully created.`, variant: 'success' });
        return simulateApiCall(newPermission);
    },
    updatePermission: async (id: EntityId, updates: Partial<Omit<Permission, 'id' | 'audit'>>): Promise<Permission> => {
        const index = mockPermissions.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Permission not found');
        const oldPermission = mockPermissions[index];
        const updatedPermission: Permission = {
            ...oldPermission,
            ...updates,
            audit: {
                ...oldPermission.audit,
                updatedAt: new Date().toISOString(),
                updatedBy: MOCK_CURRENT_USER_ID,
                version: oldPermission.audit.version + 1
            }
        };
        mockPermissions[index] = updatedPermission;
        mockAuditLogs.push({
            id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'PERMISSION_UPDATED',
            targetType: 'permission', targetId: updatedPermission.id, details: { old: oldPermission, new: updates }
        });
        toast({ title: 'Permission Updated', description: `Permission "${updatedPermission.name}" successfully updated.`, variant: 'success' });
        return simulateApiCall(updatedPermission);
    },
    deletePermission: async (id: EntityId): Promise<void> => {
        const permissionToDelete = mockPermissions.find(p => p.id === id);
        if (!permissionToDelete) throw new Error('Permission not found');

        // Check if any role is using this permission
        const rolesUsingPermission = mockRoles.filter(role => role.permissions.includes(id));
        if (rolesUsingPermission.length > 0) {
            const roleNames = rolesUsingPermission.map(r => r.name).join(', ');
            throw new Error(`Cannot delete permission "${permissionToDelete.name}" as it is currently assigned to roles: ${roleNames}. Please unassign it first.`);
        }

        mockPermissions = mockPermissions.filter(p => p.id !== id);
        mockAuditLogs.push({
            id: `audit-${Date.now()}`, timestamp: new Date().toISOString(), actorId: MOCK_CURRENT_USER_ID, action: 'PERMISSION_DELETED',
            targetType: 'permission', targetId: id, details: { permissionName: permissionToDelete.name }
        });
        toast({ title: 'Permission Deleted', description: `Permission "${permissionToDelete.name}" successfully deleted.`, variant: 'success' });
        return simulateApiCall(undefined);
    }
};

export const UserAPI = {
    getUsers: async (): Promise<User[]> => simulateApiCall(mockUsers),
    getUserById: async (id: EntityId): Promise<User | undefined> => simulateApiCall(mockUsers.find(u => u.id === id)),
    getUsersByRole: async (roleId: EntityId): Promise<User[]> => simulateApiCall(mockUsers.filter(u => u.roles.includes(roleId))),
};

export const AISuggestionAPI = {
    getAISuggestions: async (): Promise<AISuggestion[]> => {
        const allSuggestions: AISuggestion[] = [];
        mockRoles.forEach(role => {
            if (role.aiSuggestions) {
                allSuggestions.push(...role.aiSuggestions);
            }
        });
        return simulateApiCall(allSuggestions);
    },
    generateNewSuggestions: async (): Promise<AISuggestion[]> => {
        // Simulate AI generation logic
        const newSuggestions: AISuggestion[] = [];
        const now = new Date().toISOString();

        // Example: Generate a "role drift" suggestion for a random role
        if (Math.random() > 0.5 && mockRoles.length > 0) {
            const randomRole = mockRoles[Math.floor(Math.random() * mockRoles.length)];
            const existingDriftSuggestion = randomRole.aiSuggestions?.find(s => s.type === 'drift_detection' && s.status === 'pending');

            if (!existingDriftSuggestion) {
                const recentLogs = mockAuditLogs.filter(log => log.targetType === 'role' && log.targetId === randomRole.id && new Date(log.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                if (recentLogs.length > 3) { // If role has had significant changes recently
                    const newId = `ai-sugg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const driftSuggestion: AISuggestion = {
                        id: newId,
                        type: 'drift_detection',
                        targetId: randomRole.id,
                        message: `Role "${randomRole.name}" has experienced significant permission changes in the last 7 days. Review for potential drift.`,
                        details: { recentChanges: recentLogs.length, logs: recentLogs.map(l => ({ action: l.action, timestamp: l.timestamp })) },
                        severity: 'high',
                        status: 'pending',
                        generatedAt: now,
                        audit: { createdAt: now, createdBy: 'AI-System', updatedAt: now, updatedBy: 'AI-System', version: 1 }
                    };
                    randomRole.aiSuggestions = randomRole.aiSuggestions ? [...randomRole.aiSuggestions, driftSuggestion] : [driftSuggestion];
                    newSuggestions.push(driftSuggestion);
                }
            }
        }
        // Example: Generate a "least privilege" suggestion for a random role
        if (Math.random() > 0.5 && mockRoles.length > 0) {
            const randomRole = mockRoles[Math.floor(Math.random() * mockRoles.length)];
            const existingLPSuggestion = randomRole.aiSuggestions?.find(s => s.type === 'least_privilege' && s.status === 'pending');

            if (!existingLPSuggestion && randomRole.permissions.length > 2) {
                const permissionToSuggestRemoval = randomRole.permissions[Math.floor(Math.random() * randomRole.permissions.length)];
                const permName = mockPermissions.find(p => p.id === permissionToSuggestRemoval)?.name || permissionToSuggestRemoval;
                const newId = `ai-sugg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const lpSuggestion: AISuggestion = {
                    id: newId,
                    type: 'least_privilege',
                    targetId: randomRole.id,
                    message: `Permission "${permName}" in role "${randomRole.name}" seems unused based on recent user activity. Consider removal.`,
                    details: { unnecessaryPermissions: [permissionToSuggestRemoval] },
                    severity: 'medium',
                    status: 'pending',
                    generatedAt: now,
                    audit: { createdAt: now, createdBy: 'AI-System', updatedAt: now, updatedBy: 'AI-System', version: 1 }
                };
                randomRole.aiSuggestions = randomRole.aiSuggestions ? [...randomRole.aiSuggestions, lpSuggestion] : [lpSuggestion];
                newSuggestions.push(lpSuggestion);
            }
        }

        toast({ title: 'AI Suggestions', description: `${newSuggestions.length} new suggestions generated.`, variant: 'info' });
        return simulateApiCall(newSuggestions);
    }
};

export const AuditLogAPI = {
    getAuditLogs: async (filters?: { targetType?: 'role' | 'permission' | 'user', targetId?: EntityId, action?: string }): Promise<AuditLogEntry[]> => {
        let logs = [...mockAuditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (filters?.targetType) {
            logs = logs.filter(log => log.targetType === filters.targetType);
        }
        if (filters?.targetId) {
            logs = logs.filter(log => log.targetId === filters.targetId);
        }
        if (filters?.action) {
            logs = logs.filter(log => log.action.includes(filters.action));
        }
        return simulateApiCall(logs);
    }
};


// --- UI Components ---

interface RoleFormProps {
    role?: Role;
    onSave: (role: Omit<Role, 'id' | 'audit' | 'users' | 'isSystemRole' | 'status'> | Role) => Promise<void>;
    onClose: () => void;
    isLoading: boolean;
    allPermissions: Permission[];
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, onSave, onClose, isLoading, allPermissions }) => {
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<EntityId[]>(role?.permissions || []);
    const [status, setStatus] = useState<Role['status']>(role?.status || 'active');
    const [reviewDate, setReviewDate] = useState<Date | undefined>(role?.reviewDate ? new Date(role.reviewDate) : undefined);
    const [showPermissionSearch, setShowPermissionSearch] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!role;

    const handleSave = async () => {
        if (!name.trim()) {
            toast({ title: 'Error', description: 'Role name cannot be empty.', variant: 'destructive' });
            return;
        }

        const roleData: Omit<Role, 'id' | 'audit' | 'users' | 'isSystemRole' | 'status'> = {
            name,
            description,
            permissions: selectedPermissionIds,
            status: status,
            reviewDate: reviewDate?.toISOString()
        };

        await onSave(roleData);
        onClose();
    };

    const togglePermission = (permissionId: EntityId) => {
        setSelectedPermissionIds(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    useEffect(() => {
        if (showPermissionSearch) {
            inputRef.current?.focus();
        }
    }, [showPermissionSearch]);

    const availablePermissions = useMemo(() => {
        return allPermissions.filter(p => !p.deprecated);
    }, [allPermissions]);

    const selectedPermissions = useMemo(() => {
        return availablePermissions.filter(p => selectedPermissionIds.includes(p.id));
    }, [availablePermissions, selectedPermissionIds]);

    const unselectedPermissions = useMemo(() => {
        return availablePermissions.filter(p => !selectedPermissionIds.includes(p.id));
    }, [availablePermissions, selectedPermissionIds]);

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="name" className="text-gray-300">Role Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Finance Manager"
                    className="mt-1"
                />
            </div>
            <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of the role's responsibilities and access."
                    className="mt-1"
                />
            </div>
            {!isEditing && ( // New roles are always active by default. Existing roles can change status.
                <div>
                    <Label htmlFor="status" className="text-gray-300">Status</Label>
                    <Select value={status} onValueChange={(value: Role['status']) => setStatus(value)}>
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-gray-200 border-gray-700">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending_review">Pending Review</SelectItem>
                            <SelectItem value="deprecated">Deprecated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div>
                <Label htmlFor="reviewDate" className="text-gray-300 block mb-1">Next Review Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !reviewDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {reviewDate ? format(reviewDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700 text-white" align="start">
                        <Calendar
                            mode="single"
                            selected={reviewDate}
                            onSelect={setReviewDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div>
                <Label className="text-gray-300 block mb-2">Permissions</Label>
                <div className="border border-gray-700 rounded-md p-3 max-h-60 overflow-y-auto">
                    {selectedPermissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedPermissions.map(perm => (
                                <span key={perm.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-600 text-white">
                                    {perm.name}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-1 h-auto p-0.5 text-white hover:text-red-300"
                                        onClick={() => togglePermission(perm.id)}
                                    >
                                        <XCircle className="h-3 w-3" />
                                    </Button>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic">No permissions selected.</p>
                    )}
                    <Popover open={showPermissionSearch} onOpenChange={setShowPermissionSearch}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between" onClick={() => setShowPermissionSearch(true)}>
                                Add Permissions
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-gray-800 border-gray-700 text-white">
                            <Command>
                                <CommandInput
                                    placeholder="Search permissions..."
                                    className="bg-gray-700 text-white placeholder-gray-400 border-gray-600"
                                    ref={inputRef}
                                />
                                <CommandList className="max-h-60 overflow-y-auto">
                                    <CommandEmpty>No permissions found.</CommandEmpty>
                                    <CommandGroup>
                                        {unselectedPermissions.map(perm => (
                                            <CommandItem
                                                key={perm.id}
                                                value={perm.name}
                                                onSelect={() => {
                                                    togglePermission(perm.id);
                                                    setShowPermissionSearch(false); // Close popover after selection
                                                }}
                                                className="hover:bg-gray-700 data-[state=selected]:bg-gray-600 cursor-pointer"
                                            >
                                                <CheckIcon
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedPermissionIds.includes(perm.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {perm.name} <span className="text-xs text-gray-500 ml-2">({perm.resource}:{perm.action})</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <DialogFooter className="mt-6">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Update Role' : 'Create Role'}
                </Button>
            </DialogFooter>
        </div>
    );
};

interface PermissionFormProps {
    permission?: Permission;
    onSave: (permission: Omit<Permission, 'id' | 'audit'> | Permission) => Promise<void>;
    onClose: () => void;
    isLoading: boolean;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({ permission, onSave, onClose, isLoading }) => {
    const [name, setName] = useState(permission?.name || '');
    const [description, setDescription] = useState(permission?.description || '');
    const [resource, setResource] = useState(permission?.resource || '');
    const [action, setAction] = useState(permission?.action || '');
    const [level, setLevel] = useState<Permission['level']>(permission?.level || 'global');
    const [tags, setTags] = useState(permission?.tags.join(', ') || '');
    const [deprecated, setDeprecated] = useState(permission?.deprecated || false);

    const isEditing = !!permission;

    const handleSave = async () => {
        if (!name.trim() || !resource.trim() || !action.trim()) {
            toast({ title: 'Error', description: 'Name, Resource, and Action are required.', variant: 'destructive' });
            return;
        }

        const permissionData: Omit<Permission, 'id' | 'audit'> = {
            name,
            description,
            resource,
            action,
            level,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            deprecated
        };

        await onSave(permissionData);
        onClose();
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="perm-name" className="text-gray-300">Permission Name</Label>
                <Input
                    id="perm-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Read Customer Data"
                    className="mt-1"
                />
            </div>
            <div>
                <Label htmlFor="perm-description" className="text-gray-300">Description</Label>
                <Textarea
                    id="perm-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details what this permission grants access to."
                    className="mt-1"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="perm-resource" className="text-gray-300">Resource</Label>
                    <Input
                        id="perm-resource"
                        value={resource}
                        onChange={(e) => setResource(e.target.value)}
                        placeholder="e.g., users, transactions"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="perm-action" className="text-gray-300">Action</Label>
                    <Input
                        id="perm-action"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="e.g., read, write, approve"
                        className="mt-1"
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="perm-level" className="text-gray-300">Scope Level</Label>
                <Select value={level} onValueChange={(value: Permission['level']) => setLevel(value)}>
                    <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-gray-200 border-gray-700">
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="organizational">Organizational</SelectItem>
                        <SelectItem value="departmental">Departmental</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="perm-tags" className="text-gray-300">Tags (comma-separated)</Label>
                <Input
                    id="perm-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., finance, PII, sensitive"
                    className="mt-1"
                />
            </div>
            <div className="flex items-center space-x-2 mt-4">
                <Switch
                    id="perm-deprecated"
                    checked={deprecated}
                    onCheckedChange={setDeprecated}
                    disabled={permission?.id === 'perm-all' && !isEditing} // Prevent deprecating "All Access" if it's not the initial state
                />
                <Label htmlFor="perm-deprecated">Mark as Deprecated</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                            <Info className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="text-sm bg-gray-800 border-gray-700 text-white">
                        Deprecated permissions are still functional but indicate they should be phased out.
                    </PopoverContent>
                </Popover>
            </div>

            <DialogFooter className="mt-6">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Update Permission' : 'Create Permission'}
                </Button>
            </DialogFooter>
        </div>
    );
};

// --- Core Feature Components ---

export const RoleTable: React.FC<{ roles: Role[]; onEdit: (role: Role) => void; onDelete: (role: Role) => void; onViewUsers: (role: Role) => void; onViewDetails: (role: Role) => void }> = ({ roles, onEdit, onDelete, onViewUsers, onViewDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
            const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  role.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || role.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [roles, searchTerm, filterStatus]);

    return (
        <Card title="Roles">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-grow">
                    <Input
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-gray-200 border-gray-700">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="border-gray-700">
                        <TableHead className="w-[200px] text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Description</TableHead>
                        <TableHead className="w-[100px] text-gray-300">Users</TableHead>
                        <TableHead className="w-[120px] text-gray-300">Status</TableHead>
                        <TableHead className="w-[150px] text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRoles.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500">No roles found.</TableCell>
                        </TableRow>
                    ) : (
                        filteredRoles.map((role) => (
                            <TableRow key={role.id} className="border-gray-800 hover:bg-gray-800">
                                <TableCell className="font-medium text-white">{role.name} {role.isSystemRole && <span className="text-xs text-blue-400">(System)</span>}</TableCell>
                                <TableCell className="text-gray-400">{role.description}</TableCell>
                                <TableCell className="text-gray-400">{role.users.length}</TableCell>
                                <TableCell>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        role.status === 'active' && 'bg-green-500/20 text-green-400',
                                        role.status === 'inactive' && 'bg-red-500/20 text-red-400',
                                        role.status === 'pending_review' && 'bg-yellow-500/20 text-yellow-400',
                                        role.status === 'deprecated' && 'bg-gray-500/20 text-gray-400',
                                    )}>
                                        {role.status.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => onViewDetails(role)} title="View Details">
                                            <Eye className="h-4 w-4 text-blue-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onViewUsers(role)} title="Manage Users">
                                            <Link className="h-4 w-4 text-purple-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(role)} title="Edit Role">
                                            <Edit2 className="h-4 w-4 text-yellow-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDelete(role)} disabled={role.isSystemRole || role.users.length > 0} title={role.isSystemRole ? "Cannot delete system role" : role.users.length > 0 ? "Role has assigned users" : "Delete Role"}>
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
};

export const PermissionTable: React.FC<{ permissions: Permission[]; onEdit: (permission: Permission) => void; onDelete: (permission: Permission) => void; }> = ({ permissions, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDeprecated, setFilterDeprecated] = useState<boolean | 'all'>('all');

    const filteredPermissions = useMemo(() => {
        return permissions.filter(permission => {
            const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  permission.action.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDeprecated = filterDeprecated === 'all' || permission.deprecated === filterDeprecated;
            return matchesSearch && matchesDeprecated;
        });
    }, [permissions, searchTerm, filterDeprecated]);

    return (
        <Card title="Permissions">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-grow">
                    <Input
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <Select value={filterDeprecated.toString()} onValueChange={(value) => setFilterDeprecated(value === 'all' ? 'all' : value === 'true')}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by Deprecated" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-gray-200 border-gray-700">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Deprecated</SelectItem>
                        <SelectItem value="false">Active</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="border-gray-700">
                        <TableHead className="w-[200px] text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Description</TableHead>
                        <TableHead className="w-[120px] text-gray-300">Resource</TableHead>
                        <TableHead className="w-[100px] text-gray-300">Action</TableHead>
                        <TableHead className="w-[100px] text-gray-300">Level</TableHead>
                        <TableHead className="w-[80px] text-gray-300">Status</TableHead>
                        <TableHead className="w-[100px] text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPermissions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">No permissions found.</TableCell>
                        </TableRow>
                    ) : (
                        filteredPermissions.map((permission) => (
                            <TableRow key={permission.id} className="border-gray-800 hover:bg-gray-800">
                                <TableCell className="font-medium text-white">{permission.name}</TableCell>
                                <TableCell className="text-gray-400">{permission.description}</TableCell>
                                <TableCell className="text-gray-400">{permission.resource}</TableCell>
                                <TableCell className="text-gray-400">{permission.action}</TableCell>
                                <TableCell className="text-gray-400">{permission.level?.charAt(0).toUpperCase() + permission.level?.slice(1)}</TableCell>
                                <TableCell>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        permission.deprecated ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'
                                    )}>
                                        {permission.deprecated ? 'Deprecated' : 'Active'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(permission)} title="Edit Permission">
                                            <Edit2 className="h-4 w-4 text-yellow-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDelete(permission)} title="Delete Permission">
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
};

export const AISuggestionsPanel: React.FC<{ suggestions: AISuggestion[]; onAccept: (id: EntityId) => void; onReject: (id: EntityId) => void; onRefresh: () => void; isLoading: boolean }> = ({ suggestions, onAccept, onReject, onRefresh, isLoading }) => {
    const pendingSuggestions = useMemo(() => suggestions.filter(s => s.status === 'pending'), [suggestions]);

    const getSeverityClass = (severity: AISuggestion['severity']) => {
        switch (severity) {
            case 'low': return 'text-gray-400 bg-gray-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/20';
            case 'critical': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getTypeIcon = (type: AISuggestion['type']) => {
        switch (type) {
            case 'least_privilege': return <EyeOff className="h-4 w-4 mr-1" />;
            case 'role_clustering': return <Users className="h-4 w-4 mr-1" />;
            case 'drift_detection': return <AlertCircle className="h-4 w-4 mr-1" />;
            case 'compliance_violation': return <ShieldAlert className="h-4 w-4 mr-1" />;
            default: return <Info className="h-4 w-4 mr-1" />;
        }
    };

    return (
        <Card title="AI Security Suggestions">
            <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-400">Review AI-powered recommendations to enhance your security posture.</p>
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                    Refresh Suggestions
                </Button>
            </div>
            {pendingSuggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500" />
                    <p>No pending AI suggestions at the moment. Your security posture looks good!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingSuggestions.map(suggestion => (
                        <div key={suggestion.id} className="bg-gray-800 p-4 rounded-md border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                    {getTypeIcon(suggestion.type)}
                                    <h4 className="font-semibold text-white mr-2">{suggestion.message}</h4>
                                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getSeverityClass(suggestion.severity))}>
                                        {suggestion.severity.charAt(0).toUpperCase() + suggestion.severity.slice(1)}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Generated: {format(new Date(suggestion.generatedAt), 'PPP')}
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">{suggestion.details.recommendedAction || "Review role permissions or user assignments."}</p>
                            <div className="flex space-x-2">
                                <Button size="sm" variant="success" onClick={() => onAccept(suggestion.id)} disabled={isLoading}>
                                    Accept
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => onReject(suggestion.id)} disabled={isLoading}>
                                    Reject
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-white">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">AI Suggestion Details</DialogTitle>
                                            <DialogDescription className="text-gray-400">
                                                Detailed information about the AI's recommendation.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-3 text-sm">
                                            <p><strong className="text-gray-300">Type:</strong> {suggestion.type.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</p>
                                            <p><strong className="text-gray-300">Target:</strong> {mockRoles.find(r => r.id === suggestion.targetId)?.name || suggestion.targetId}</p>
                                            <p><strong className="text-gray-300">Severity:</strong> {suggestion.severity}</p>
                                            <p><strong className="text-gray-300">Message:</strong> {suggestion.message}</p>
                                            <Separator className="bg-gray-700" />
                                            <p className="text-gray-300 font-semibold">Additional Details:</p>
                                            <pre className="bg-gray-700 p-2 rounded text-xs overflow-auto max-h-40 text-gray-200">
                                                {JSON.stringify(suggestion.details, null, 2)}
                                            </pre>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline">Close</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export const RoleDetailsPanel: React.FC<{ role: Role; allPermissions: Permission[]; allUsers: User[]; onClose: () => void; }> = ({ role, allPermissions, allUsers, onClose }) => {
    const { isSimulationMode } = useGlobalSecurityContext();
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isAssigningUser, setIsAssigningUser] = useState(false);
    const [selectedUserToAssign, setSelectedUserToAssign] = useState<EntityId | null>(null);

    const rolePermissions = useMemo(() => {
        return allPermissions.filter(p => role.permissions.includes(p.id));
    }, [role.permissions, allPermissions]);

    const assignedUsers = useMemo(() => {
        return allUsers.filter(u => role.users.includes(u.id));
    }, [role.users, allUsers]);

    const unassignedUsers = useMemo(() => {
        return allUsers.filter(u => !role.users.includes(u.id));
    }, [role.users, allUsers]);

    const fetchAuditLogs = useCallback(async () => {
        setIsLoadingLogs(true);
        try {
            const logs = await AuditLogAPI.getAuditLogs({ targetType: 'role', targetId: role.id });
            setAuditLogs(logs);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch audit logs.', variant: 'destructive' });
        } finally {
            setIsLoadingLogs(false);
        }
    }, [role.id]);

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    const handleAssignUser = async () => {
        if (!selectedUserToAssign) return;
        setIsAssigningUser(true);
        try {
            if (isSimulationMode) {
                toast({ title: "Simulation Mode", description: "User assignment simulated successfully.", variant: "info" });
            } else {
                await RoleAPI.assignUserToRole(selectedUserToAssign, role.id);
                // Refetch roles and users in parent component
            }
            setSelectedUserToAssign(null);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to assign user to role.', variant: 'destructive' });
        } finally {
            setIsAssigningUser(false);
        }
    };

    const handleUnassignUser = async (userId: EntityId) => {
        setIsAssigningUser(true); // Re-using loading state
        try {
            if (isSimulationMode) {
                toast({ title: "Simulation Mode", description: "User unassignment simulated successfully.", variant: "info" });
            } else {
                await RoleAPI.unassignUserFromRole(userId, role.id);
                // Refetch roles and users in parent component
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to unassign user from role.', variant: 'destructive' });
        } finally {
            setIsAssigningUser(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white p-6">
                <DialogHeader>
                    <DialogTitle className="text-white text-2xl">{role.name} Details</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Comprehensive view of role configurations, assigned users, and audit history.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar">
                    {/* Role Information */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-200">Basic Information</h3>
                        <p><strong className="text-gray-300">ID:</strong> <span className="text-sm bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-mono">{role.id}</span></p>
                        <p><strong className="text-gray-300">Description:</strong> {role.description}</p>
                        <p><strong className="text-gray-300">Status:</strong>
                            <span className={cn(
                                "ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                                role.status === 'active' && 'bg-green-500/20 text-green-400',
                                role.status === 'inactive' && 'bg-red-500/20 text-red-400',
                                role.status === 'pending_review' && 'bg-yellow-500/20 text-yellow-400',
                                role.status === 'deprecated' && 'bg-gray-500/20 text-gray-400',
                            )}>
                                {role.status.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                            </span>
                        </p>
                        <p><strong className="text-gray-300">System Role:</strong> {role.isSystemRole ? 'Yes' : 'No'}</p>
                        {role.reviewDate && <p><strong className="text-gray-300">Next Review:</strong> {format(new Date(role.reviewDate), 'PPP')}</p>}
                        <p className="text-sm text-gray-500">
                            Created: {format(new Date(role.audit.createdAt), 'PPP HH:mm')} by {role.audit.createdBy}<br />
                            Last Updated: {format(new Date(role.audit.updatedAt), 'PPP HH:mm')} by {role.audit.updatedBy} (v{role.audit.version})
                        </p>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-200">Permissions ({rolePermissions.length})</h3>
                        {rolePermissions.length === 0 ? (
                            <p className="text-gray-500 italic">No permissions assigned to this role.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {rolePermissions.map(perm => (
                                    <div key={perm.id} className="bg-gray-800 p-3 rounded-md border border-gray-700 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold text-white text-sm">{perm.name}</h4>
                                            <p className="text-xs text-gray-400">{perm.resource}:{perm.action}</p>
                                        </div>
                                        {perm.deprecated && (
                                            <span className="text-xs text-gray-500 mt-1 italic flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" /> Deprecated
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Assigned Users */}
                    <div className="space-y-4 col-span-2">
                        <h3 className="text-xl font-semibold text-gray-200">Assigned Users ({assignedUsers.length})</h3>
                        <div className="flex items-center space-x-2">
                            <Select value={selectedUserToAssign || ''} onValueChange={setSelectedUserToAssign} disabled={unassignedUsers.length === 0}>
                                <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select user to assign" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-gray-200 border-gray-700">
                                    {unassignedUsers.length === 0 && <SelectItem value="no-users" disabled>No users available</SelectItem>}
                                    {unassignedUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.username} ({user.department})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAssignUser} disabled={!selectedUserToAssign || isAssigningUser || unassignedUsers.length === 0}>
                                {isAssigningUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                Assign User
                            </Button>
                        </div>

                        {assignedUsers.length === 0 ? (
                            <p className="text-gray-500 italic">No users currently assigned to this role.</p>
                        ) : (
                            <Table className="bg-gray-800 border-gray-700 rounded-md">
                                <TableHeader>
                                    <TableRow className="border-gray-700">
                                        <TableHead className="text-gray-300">Username</TableHead>
                                        <TableHead className="text-gray-300">Department</TableHead>
                                        <TableHead className="text-gray-300">Email</TableHead>
                                        <TableHead className="text-gray-300 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignedUsers.map(user => (
                                        <TableRow key={user.id} className="border-gray-800 hover:bg-gray-700">
                                            <TableCell className="font-medium text-white">{user.username}</TableCell>
                                            <TableCell className="text-gray-400">{user.department}</TableCell>
                                            <TableCell className="text-gray-400">{user.email}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleUnassignUser(user.id)} disabled={isAssigningUser} title="Unassign User">
                                                    <Unlink className="h-4 w-4 text-red-400" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Audit Trail */}
                    <div className="space-y-4 col-span-2">
                        <h3 className="text-xl font-semibold text-gray-200">Audit Trail ({auditLogs.length})</h3>
                        {isLoadingLogs ? (
                            <div className="flex justify-center items-center h-20">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-400">Loading audit logs...</span>
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <p className="text-gray-500 italic">No audit history for this role.</p>
                        ) : (
                            <div className="space-y-3">
                                {auditLogs.map((log, index) => (
                                    <div key={log.id} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="font-semibold text-white">{log.action.replace(/_/g, ' ')}</span>
                                            <span className="text-gray-500">{format(new Date(log.timestamp), 'PPP HH:mm:ss')}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            By: {mockUsers.find(u => u.id === log.actorId)?.username || log.actorId}
                                        </p>
                                        {Object.keys(log.details).length > 0 && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-400 text-xs">View Details</Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="text-sm bg-gray-800 border-gray-700 text-white max-w-lg p-3">
                                                    <h5 className="font-semibold mb-1">Log Details</h5>
                                                    <pre className="bg-gray-700 p-2 rounded text-xs overflow-auto max-h-40 text-gray-200">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter className="mt-6">
                    <Button onClick={onClose} variant="outline">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const GlobalSecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSimulationMode, setIsSimulationMode] = useState(false);

    const toggleSimulationMode = useCallback(() => {
        setIsSimulationMode(prev => {
            const newState = !prev;
            toast({
                title: newState ? 'Simulation Mode ON' : 'Simulation Mode OFF',
                description: newState ? 'Changes will not be persisted to mock backend.' : 'Changes will be persisted to mock backend.',
                variant: newState ? 'info' : 'default',
            });
            return newState;
        });
    }, []);

    const contextValue = useMemo(() => ({
        isSimulationMode,
        toggleSimulationMode,
    }), [isSimulationMode, toggleSimulationMode]);

    return (
        <GlobalSecurityContext.Provider value={contextValue}>
            {children}
        </GlobalSecurityContext.Provider>
    );
};

// --- Main View Component ---

const RoleManagementView: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([]);

    const [loadingRoles, setLoadingRoles] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);

    const [isPermissionFormOpen, setIsPermissionFormOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | undefined>(undefined);

    const [viewingRoleDetails, setViewingRoleDetails] = useState<Role | undefined>(undefined);

    const { isSimulationMode } = useGlobalSecurityContext();

    // --- Data Fetching ---
    const fetchRoles = useCallback(async () => {
        setLoadingRoles(true);
        try {
            const data = await RoleAPI.getRoles();
            setRoles(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch roles.', variant: 'destructive' });
        } finally {
            setLoadingRoles(false);
        }
    }, []);

    const fetchPermissions = useCallback(async () => {
        setLoadingPermissions(true);
        try {
            const data = await PermissionAPI.getPermissions();
            setPermissions(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch permissions.', variant: 'destructive' });
        } finally {
            setLoadingPermissions(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const data = await UserAPI.getUsers();
            setUsers(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const fetchAISuggestions = useCallback(async () => {
        setLoadingSuggestions(true);
        try {
            const data = await AISuggestionAPI.getAISuggestions();
            setAISuggestions(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch AI suggestions.', variant: 'destructive' });
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
        fetchUsers();
        fetchAISuggestions();
    }, [fetchRoles, fetchPermissions, fetchUsers, fetchAISuggestions]);

    // --- Role Management Handlers ---
    const handleCreateOrUpdateRole = async (roleData: Omit<Role, 'id' | 'audit' | 'users' | 'isSystemRole' | 'status'> | Role) => {
        setLoadingRoles(true); // Indicate saving process
        try {
            if (isSimulationMode) {
                toast({ title: "Simulation Mode", description: "Role save simulated successfully.", variant: "info" });
            } else {
                if ('id' in roleData && editingRole) {
                    await RoleAPI.updateRole(editingRole.id, roleData);
                } else {
                    await RoleAPI.createRole(roleData as Omit<Role, 'id' | 'audit' | 'users' | 'isSystemRole' | 'status'>);
                }
            }
            await fetchRoles(); // Refresh roles list
            setEditingRole(undefined);
            setIsRoleFormOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to save role.', variant: 'destructive' });
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleDeleteRole = async (role: Role) => {
        if (role.isSystemRole) {
            toast({ title: 'Action Denied', description: 'Cannot delete system roles.', variant: 'destructive' });
            return;
        }
        if (role.users.length > 0) {
            toast({ title: 'Action Denied', description: `Role "${role.name}" has ${role.users.length} assigned users. Please unassign users first.`, variant: 'destructive' });
            return;
        }

        if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
            setLoadingRoles(true);
            try {
                if (isSimulationMode) {
                    toast({ title: "Simulation Mode", description: "Role deletion simulated successfully.", variant: "info" });
                } else {
                    await RoleAPI.deleteRole(role.id);
                }
                await fetchRoles();
            } catch (error: any) {
                toast({ title: 'Error', description: error.message || 'Failed to delete role.', variant: 'destructive' });
            } finally {
                setLoadingRoles(false);
            }
        }
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsRoleFormOpen(true);
    };

    const handleViewRoleDetails = (role: Role) => {
        setViewingRoleDetails(role);
    };

    // --- Permission Management Handlers ---
    const handleCreateOrUpdatePermission = async (permissionData: Omit<Permission, 'id' | 'audit'> | Permission) => {
        setLoadingPermissions(true); // Indicate saving process
        try {
            if (isSimulationMode) {
                toast({ title: "Simulation Mode", description: "Permission save simulated successfully.", variant: "info" });
            } else {
                if ('id' in permissionData && editingPermission) {
                    await PermissionAPI.updatePermission(editingPermission.id, permissionData);
                } else {
                    await PermissionAPI.createPermission(permissionData as Omit<Permission, 'id' | 'audit'>);
                }
            }
            await fetchPermissions(); // Refresh permissions list
            setEditingPermission(undefined);
            setIsPermissionFormOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to save permission.', variant: 'destructive' });
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleDeletePermission = async (permission: Permission) => {
        if (window.confirm(`Are you sure you want to delete the permission "${permission.name}"? This action cannot be undone and will fail if it's assigned to any roles.`)) {
            setLoadingPermissions(true);
            try {
                if (isSimulationMode) {
                    toast({ title: "Simulation Mode", description: "Permission deletion simulated successfully.", variant: "info" });
                } else {
                    await PermissionAPI.deletePermission(permission.id);
                }
                await fetchPermissions();
            } catch (error: any) {
                toast({ title: 'Error', description: error.message || 'Failed to delete permission.', variant: 'destructive' });
            } finally {
                setLoadingPermissions(false);
            }
        }
    };

    const handleEditPermission = (permission: Permission) => {
        setEditingPermission(permission);
        setIsPermissionFormOpen(true);
    };

    // --- AI Suggestion Handlers ---
    const handleAcceptSuggestion = async (suggestionId: EntityId) => {
        setLoadingSuggestions(true);
        try {
            if (isSimulationMode) {
                toast({ title: "Simulation Mode", description: "AI suggestion acceptance simulated.", variant: "info" });
            } else {
                await AISuggestionAPI.acceptSuggestion(suggestionId);
            }
            await fetchAISuggestions();
            await fetchRoles(); // Accepting suggestions might change roles
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to accept suggestion.', variant: 'destructive' });
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleRejectSuggestion = async (suggestionId: EntityId) => {
        setLoadingSuggestions(true);
        try {
            if (isSimulationMode) {
                toast({ title: "Simulation Mode", description: "AI suggestion rejection simulated.", variant: "info" });
            } else {
                await AISuggestionAPI.rejectSuggestion(suggestionId);
            }
            await fetchAISuggestions();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to reject suggestion.', variant: 'destructive' });
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleGenerateNewSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            if (isSimulationMode) {
                toast({ title: "Simulation Mode", description: "AI suggestion generation simulated.", variant: "info" });
            } else {
                await AISuggestionAPI.generateNewSuggestions();
            }
            await fetchAISuggestions();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to generate new suggestions.', variant: 'destructive' });
        } finally {
            setLoadingSuggestions(false);
        }
    };


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Identity & Role Command</h2>
            <Card title="Mission Brief">
                <p className="text-gray-400">Define and manage the nervous system of your organization. This is where you define user roles and permissions across the entire Demo Bank platform. Implement least-privilege access with AI-powered suggestions to ensure security by default.</p>
                <div className="mt-4 flex items-center space-x-2">
                    <Switch
                        id="simulation-mode"
                        checked={isSimulationMode}
                        onCheckedChange={useGlobalSecurityContext().toggleSimulationMode}
                    />
                    <Label htmlFor="simulation-mode">Simulation Mode</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                                <Info className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="text-sm bg-gray-800 border-gray-700 text-white">
                            When enabled, actions will be simulated and not persist changes to the mock backend. Ideal for testing configurations.
                        </PopoverContent>
                    </Popover>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="AI Role Clustering"><p>Our AI automatically groups users with similar access patterns to suggest new, optimized roles, reducing complexity and human error.</p></Card>
                <Card title="Least-Privilege Suggestions"><p>Receive continuous, AI-driven recommendations to remove unnecessary permissions from roles, hardening your security posture automatically.</p></Card>
                <Card title="Role Drift Detection"><p>Get alerted when a role's permissions have significantly changed over time, preventing unintended privilege escalation.</p></Card>
            </div>

            <Separator className="bg-gray-700" />

            {/* AI Suggestions Section */}
            <AISuggestionsPanel
                suggestions={aiSuggestions}
                onAccept={handleAcceptSuggestion}
                onReject={handleRejectSuggestion}
                onRefresh={handleGenerateNewSuggestions}
                isLoading={loadingSuggestions}
            />

            <Separator className="bg-gray-700" />

            {/* Role Management Section */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-white">Role Management</h3>
                <Dialog open={isRoleFormOpen} onOpenChange={setIsRoleFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingRole(undefined); setIsRoleFormOpen(true); }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                {editingRole ? 'Modify the details and permissions of this role.' : 'Define a new security role with specific permissions.'}
                            </DialogDescription>
                        </DialogHeader>
                        <RoleForm
                            role={editingRole}
                            onSave={handleCreateOrUpdateRole}
                            onClose={() => setIsRoleFormOpen(false)}
                            isLoading={loadingRoles}
                            allPermissions={permissions}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {loadingRoles ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-400">Loading roles...</span>
                </div>
            ) : (
                <RoleTable
                    roles={roles}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                    onViewUsers={handleViewRoleDetails} // Re-using role details for user management
                    onViewDetails={handleViewRoleDetails}
                />
            )}

            {viewingRoleDetails && (
                <RoleDetailsPanel
                    role={viewingRoleDetails}
                    allPermissions={permissions}
                    allUsers={users}
                    onClose={() => { setViewingRoleDetails(undefined); fetchRoles(); fetchUsers(); }} // Refresh data when closing
                />
            )}

            <Separator className="bg-gray-700" />

            {/* Permission Management Section */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-white">Permission Management</h3>
                <Dialog open={isPermissionFormOpen} onOpenChange={setIsPermissionFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingPermission(undefined); setIsPermissionFormOpen(true); }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New Permission
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">{editingPermission ? 'Edit Permission' : 'Create New Permission'}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                {editingPermission ? 'Modify the details of this specific permission.' : 'Define a granular permission to control access to resources and actions.'}
                            </DialogDescription>
                        </DialogHeader>
                        <PermissionForm
                            permission={editingPermission}
                            onSave={handleCreateOrUpdatePermission}
                            onClose={() => setIsPermissionFormOpen(false)}
                            isLoading={loadingPermissions}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {loadingPermissions ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-400">Loading permissions...</span>
                </div>
            ) : (
                <PermissionTable
                    permissions={permissions}
                    onEdit={handleEditPermission}
                    onDelete={handleDeletePermission}
                />
            )}

            <Separator className="bg-gray-700" />

            {/* AI Role Analyzer and Simulation (Advanced Section) */}
            <Card title="AI Role Analyzer & Simulation">
                <div className="space-y-4">
                    <p className="text-gray-400">Leverage advanced AI capabilities to analyze role effectiveness, simulate policy changes, and proactively identify security gaps.</p>

                    {/* Role Health Score */}
                    <div>
                        <h4 className="font-semibold text-lg text-white mb-2">Role Health Score</h4>
                        <p className="text-gray-400 text-sm mb-2">An aggregated metric based on least-privilege adherence, usage patterns, and compliance. Higher is better.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {roles.slice(0, 3).map(role => ( // Showing top 3 for brevity
                                <Card key={role.id} title={role.name} className="bg-gray-800 border-gray-700">
                                    <div className="flex items-center space-x-3">
                                        <Progress value={Math.min(100, 50 + role.permissions.length * 5)} className="w-full h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
                                        <span className="text-white text-sm">{Math.min(100, 50 + role.permissions.length * 5)}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Permissions: {role.permissions.length} | Users: {role.users.length}</p>
                                </Card>
                            ))}
                        </div>
                        <Button variant="link" className="text-blue-400 text-sm mt-2">View Full Role Health Report</Button>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Policy Simulation */}
                    <div>
                        <h4 className="font-semibold text-lg text-white mb-2">Policy Change Simulation</h4>
                        <p className="text-gray-400 text-sm mb-2">Simulate the impact of role or permission changes before applying them to production.</p>
                        <div className="flex space-x-4 items-center">
                            <Select defaultValue="role-finance-manager">
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Select a role to simulate" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-gray-200 border-gray-700">
                                    {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select defaultValue="add-permission">
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Select an action" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-gray-200 border-gray-700">
                                    <SelectItem value="add-permission">Add Permission</SelectItem>
                                    <SelectItem value="remove-permission">Remove Permission</SelectItem>
                                    <SelectItem value="change-status">Change Status</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="secondary">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin hidden" /> {/* Show when simulating */}
                                Run Simulation
                            </Button>
                        </div>
                        <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-400">
                            <p className="font-semibold text-white mb-1">Simulation Results (Preview):</p>
                            <p><strong>Impact on Users:</strong> 5 users affected.</p>
                            <p><strong>Compliance Risk:</strong> Low (no new violations detected).</p>
                            <p><strong>Effective Permissions:</strong> 2 new permissions gained, 0 lost.</p>
                        </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Role Hierarchies and Inheritance */}
                    <div>
                        <h4 className="font-semibold text-lg text-white mb-2">Role Hierarchy & Inheritance</h4>
                        <p className="text-gray-400 text-sm mb-2">Visualize and manage parent-child relationships between roles for easier permission inheritance.</p>
                        {/* This would typically be a complex graph visualization component */}
                        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 h-48 flex items-center justify-center">
                            <p className="text-gray-500 italic">Role hierarchy visualization (e.g., D3.js graph) goes here.</p>
                        </div>
                        <Button variant="link" className="text-blue-400 text-sm mt-2">Manage Role Hierarchy</Button>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* AI-Powered Compliance Checks */}
                    <div>
                        <h4 className="font-semibold text-lg text-white mb-2">AI-Powered Compliance Checks</h4>
                        <p className="text-gray-400 text-sm mb-2">Automatically audit your role configurations against pre-defined compliance standards (e.g., GDPR, SOC2).</p>
                        <div className="flex justify-between items-center bg-gray-800 border border-gray-700 rounded-md p-4">
                            <div>
                                <p className="text-white font-medium">Last Compliance Scan: <span className="text-gray-400">{format(new Date(), 'PPP HH:mm')}</span></p>
                                <p className="text-gray-400 text-sm">Status: <span className="text-yellow-400">2 Minor Warnings</span></p>
                            </div>
                            <Button variant="secondary">
                                Run Compliance Scan
                            </Button>
                        </div>
                        <Button variant="link" className="text-blue-400 text-sm mt-2">View Compliance Report</Button>
                    </div>

                </div>
            </Card>

        </div>
    );
};

// Wrap the main component with the GlobalSecurityProvider
const RoleManagementViewWithProvider: React.FC = () => (
    <GlobalSecurityProvider>
        <RoleManagementView />
    </GlobalSecurityProvider>
);

export default RoleManagementViewWithProvider;