// google/drive/services/DriveAPI.ts
// The Librarian's Index. A set of commands to find and retrieve scrolls from the Great Library.
// Evolved into the Universal Data Repository and Cognitive Asset Management System.
// A multi-dimensional data fabric for the conscious age, integrating AI, spatial computing, and immutable ledgers.

import { DriveFile } from '../types';

// --- Original MOCK_FILES (kept for strict adherence to "You MUST NOT change or remove any existing import statements."
//     and preserving top-level constants which are not imports) ---
const ORIGINAL_MOCK_FILES: DriveFile[] = [
    { id: 'file-1', name: 'Project Phoenix - Plan.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', modifiedTime: '2024-07-26T12:00:00Z' },
    { id: 'folder-1', name: 'Screenplays', mimeType: 'application/vnd.google-apps.folder', modifiedTime: '2024-07-27T10:00:00Z' },
    { id: 'file-2', name: 'The Sovereign\'s Ledger.md', mimeType: 'text/markdown', modifiedTime: '2024-07-27T11:30:00Z' },
    { id: 'file-3', name: 'Q4 Budget.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', modifiedTime: '2024-07-25T15:00:00Z' },
];

// --- Start of New Type Definitions (Universe Expansion) ---

/** Represents a user or entity with permissions. */
export interface DriveUser {
    id: string;
    name: string;
    email?: string;
    photoUrl?: string;
    organization?: string;
    roles?: string[]; // e.g., 'admin', 'auditor', 'developer'
}

/** Defines a permission role. */
export type PermissionRole = 'owner' | 'editor' | 'viewer' | 'commenter' | 'manager' | 'contributor' | 'admin' | 'reader' | 'writer' | 'publisher';

/** Represents a specific permission entry for a file/folder. */
export interface DrivePermission {
    id: string;
    fileId: string;
    role: PermissionRole;
    type: 'user' | 'group' | 'domain' | 'anyone' | 'serviceAccount';
    targetId?: string; // userId, groupId, domainId, serviceAccountId
    targetEmail?: string; // For 'user' or 'group'
    allowDownload?: boolean;
    expirationTime?: string; // ISO 8601
    inheritedFrom?: string; // Folder ID from which permission is inherited
    inherited?: boolean; // True if inherited, false if direct
}

/** Represents a version of a file. */
export interface DriveFileVersion {
    id: string;
    fileId: string;
    versionNumber: number;
    modifiedTime: string; // ISO 8601
    modifiedBy: DriveUser;
    mimeType: string;
    size: number; // in bytes
    md5Checksum: string;
    sha256Checksum?: string; // Added for enhanced security
    downloadLink: string;
    comment?: string; // Version specific comment
    isRestorable: boolean;
    storageTier: 'standard' | 'cold' | 'archive';
}

/** Represents a comment on a file. */
export interface DriveComment {
    id: string;
    fileId: string;
    author: DriveUser;
    createdTime: string; // ISO 8601
    modifiedTime: string; // ISO 8601
    content: string;
    resolved: boolean;
    replies?: DriveComment[]; // Nested replies
    anchor?: { // For specific location in document
        type: 'text' | 'image' | 'area' | 'page';
        data: any; // e.g., text range, coordinates, page number
    };
    mentions?: DriveUser[]; // Users mentioned in the comment
    reactionSummary?: { [emoji: string]: number }; // e.g., { '👍': 5, '❤️': 2 }
}

/** Represents a structured label applied to a file. */
export interface DriveLabelValue {
    fieldId: string;
    value: string | number | boolean | string[] | Date; // Can be various types, added Date
}

export interface DriveLabel {
    id: string; // Label schema ID
    labelValues: DriveLabelValue[];
    revisionId: string; // For tracking label schema changes
    appliedBy: DriveUser;
    appliedTime: string; // ISO 8601
    source?: 'manual' | 'ai_auto' | 'workflow';
}

/** Represents the schema definition for a label. */
export interface DriveLabelSchemaField {
    id: string;
    title: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'selection' | 'multi-selection' | 'user'; // Added 'user' type
    options?: string[]; // For selection types
    required?: boolean;
    defaultValue?: any;
    description?: string;
    validationRegex?: string;
    isHidden?: boolean; // For fields visible only to admins
}

export interface DriveLabelSchema {
    id: string;
    title: string;
    description?: string;
    fields: DriveLabelSchemaField[];
    published: boolean;
    creator: DriveUser;
    createdTime: string; // ISO 8601
    modifiedTime: string; // ISO 8601
    revisionId: string;
    scope: 'global' | 'organization' | 'team' | 'personal';
    enforcedByDLP?: boolean; // Whether this label can trigger DLP policies
}

/** Represents an AI-generated insight or analysis. */
export interface DriveAIInsight {
    id: string;
    fileId: string;
    type: 'summary' | 'entity_extraction' | 'sentiment_analysis' | 'classification' | 'suggested_tags' | 'anomaly_detection' | 'translation' | 'ocr_text' | 'image_caption';
    modelId: string; // Identifier for the AI model used
    timestamp: string; // ISO 8601
    confidence: number; // 0-1
    content: any; // e.g., { summary: "...", keywords: ["..."] }
    version?: string; // Which file version this insight applies to
    isLatest?: boolean; // If insight applies to current version
    sourceFileHash?: string; // Hash of file content when insight was generated
}

/** Represents a task associated with a file or workflow. */
export interface DriveTask {
    id: string;
    fileId?: string; // Optional, if task is independent or workflow-level
    workflowInstanceId?: string; // Reference to workflow instance
    title: string;
    description?: string;
    assignee: DriveUser;
    reporter: DriveUser;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'deferred' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: string; // ISO 8601
    createdTime: string; // ISO 8601
    completedTime?: string; // ISO 8601
    comments?: DriveComment[]; // Task-specific comments
    parentTaskId?: string; // For sub-tasks
    metadata?: { [key: string]: string }; // Custom task properties
}

/** Represents a workflow definition. */
export interface DriveWorkflowDefinition {
    id: string;
    name: string;
    description?: string;
    trigger: {
        type: 'manual' | 'file_created' | 'file_modified' | 'metadata_changed' | 'scheduled' | 'webhook_event' | 'user_action';
        criteria?: any; // e.g., { folderId: '...', mimeType: '...', labelId: '...' }
        schedule?: string; // Cron expression for scheduled triggers
    };
    steps: Array<{
        stepId: string;
        name: string;
        action: 'assign_task' | 'send_notification' | 'update_metadata' | 'request_approval' | 'move_file' | 'run_script' | 'generate_content' | 'archive_file' | 'call_external_api' | 'apply_retention_policy';
        parameters: any; // e.g., { assigneeId: '...', message: '...' }
        onCompletion?: 'next_step' | 'end_workflow' | 'go_to_step';
        onFailure?: 'retry' | 'notify' | 'end_workflow' | 'go_to_step';
        timeoutSeconds?: number;
        transitionToStepId?: string; // For 'go_to_step'
    }>;
    creator: DriveUser;
    createdTime: string; // ISO 8601
    modifiedTime: string; // ISO 8601
    published: boolean;
    version?: number; // Version of the workflow definition itself
    tags?: string[];
}

/** Represents an active instance of a workflow. */
export interface DriveWorkflowInstance {
    id: string;
    definitionId: string;
    status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'pending_approval';
    startTime: string; // ISO 8601
    endTime?: string; // ISO 8601
    triggeredBy: DriveUser;
    targetFileId?: string; // If workflow is file-specific
    currentStepId?: string;
    progress?: any; // Custom progress data / step-specific outputs
    log: Array<{
        timestamp: string;
        level: 'info' | 'warning' | 'error' | 'debug';
        message: string;
        stepId?: string;
        details?: any;
    }>;
    currentApprovers?: DriveUser[]; // For approval steps
    attachments?: DriveFile[]; // Files generated or used by the workflow
}

/** Represents a data retention policy. */
export interface DriveRetentionPolicy {
    id: string;
    name: string;
    description?: string;
    criteria: {
        fileType?: string[];
        labels?: { id: string; fieldId?: string; value?: string | string[] }[]; // Specific label field matching
        folderId?: string;
        age?: { value: number; unit: 'days' | 'months' | 'years'; relativeTo: 'creationTime' | 'modifiedTime' | 'lastAccessedTime' };
        isTrashed?: boolean;
        customQuery?: string; // Advanced query string
    };
    action: 'archive' | 'delete' | 'move_to_cold_storage' | 'apply_legal_hold' | 'encrypt';
    enforcedBy: DriveUser;
    createdTime: string; // ISO 8601
    lastModifiedTime: string;
    isActive: boolean;
    lastRunTime?: string; // ISO 8601
    nextRunTime?: string; // ISO 8601
}

/** Represents a data loss prevention (DLP) policy. */
export interface