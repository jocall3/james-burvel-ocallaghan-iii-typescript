// google/drive/components/FileItem.tsx
// A Single Scroll. Represents one piece of knowledge within the Great Library.

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { DriveFile } from '../types';

// --- Existing Icons ---
const FileIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A1 1 0 0111.293 2.707l4 4A1 1 0 0115.707 7.5H12a2 2 0 01-2-2V4H6zm2 6a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H9z" clipRule="evenodd" /></svg>;
const FolderIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;

// --- New Icons & UI Elements (Extending the universe) ---
export const LockIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
export const ShareIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.831-1.606H15a3 3 0 00-.001-.639v-4.018z" /></svg>;
export const StarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" /></svg>;
export const HistoryIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>;
export const InfoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
export const AITagIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3.055A9.001 9.001 0 1020 12h-8V3.055zM12 2.055A9.001 9.001 0 0119.945 11H12V2.055z" /></svg>;
export const CommentIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>;
export const EyeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 10 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
export const PinIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.25c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5h-2.5V6.75z" clipRule="evenodd" /></svg>;
export const TemplateIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
export const WorkflowIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
export const ShieldCheckIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>;
export const GlobeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
export const ConnectIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
export const AtomIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeWidth="2" strokeLinejoin="round"></path><path d="M2.288 10.455C2.10238 10.9723 2 11.4883 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 11.4883 21.8976 10.9723 21.712 10.455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M10.455 2.288C10.9723 2.10238 11.4883 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C11.4883 22 10.9723 21.8976 10.455 21.712" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;


// --- Advanced Types & Enums (Building the "universe" data model) ---

/**
 * Represents the comprehensive state of a Scroll's permissions.
 * Includes explicit user/group access, public status, and inheritance.
 */
export interface ScrollPermissions {
    canRead: boolean;
    canWrite: boolean;
    canShare: boolean;
    canDelete: boolean;
    canManageVersions: boolean;
    isPublic: boolean;
    ownerId: string;
    allowedUsers: Array<{ id: string; role: 'viewer' | 'editor' | 'commenter' | 'owner' }>;
    allowedGroups: Array<{ id: string; role: 'viewer' | 'editor' }>;
    inheritedFrom?: string; // ID of parent folder or policy
}

/**
 * Details about a version of a Scroll.
 */
export interface ScrollVersion {
    id: string;
    modifiedTime: string;
    modifierId: string;
    description?: string;
    sizeBytes: number;
    isCurrent: boolean;
    majorVersion: number;
    minorVersion: number;
}

/**
 * Information about real-time collaboration on a Scroll.
 */
export interface CollaborationInfo {
    activeUsers: Array<{ id: string; name: string; avatarUrl: string; status: 'editing' | 'viewing' }>;
    lastActivityTime: string;
    editLockOwnerId?: string; // For exclusive editing modes
}

/**
 * AI-generated insights for a Scroll.
 */
export interface AIInsights {
    summary: string;
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    suggestedTags: string[];
    relatedScrollIds: string[];
    contentQualityScore: number; // 0-100
    complianceFlags: string[]; // e.g., 'PII_DETECTED', 'HIPAA_RISK'
}

/**
 * Workflow status for a Scroll (e.g., Draft, Review, Approved, Published).
 */
export enum WorkflowStage {
    DRAFT = 'Draft',
    IN_REVIEW = 'In Review',
    APPROVED = 'Approved',
    PUBLISHED = 'Published',
    ARCHIVED = 'Archived',
    REJECTED = 'Rejected',
    PENDING_APPROVAL = 'Pending Approval',
    NEEDS_REVISION = 'Needs Revision',
}

/**
 * Lifecycle and retention policy information.
 */
export interface LifecyclePolicy {
    stage: WorkflowStage;
    assignedPolicyId?: string;
    retentionUntil?: string; // ISO date string
    isLegalHoldActive: boolean;
}

/**
 * Ephemeral user notes or highlights.
 */
export interface EphemeralNote {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    targetSelection?: string; // e.g., text range, image coordinate
    isHighlight?: boolean;
}

/**
 * Represents a connection or link in the knowledge graph.
 */
export interface KnowledgeGraphLink {
    targetScrollId: string;
    relationshipType: string; // e.g., 'references', 'is_component_of', 'expands_on'
    description?: string;
}

/**
 * Advanced metadata for a Scroll.
 */
export interface ScrollMetadata {
    description?: string;
    tags: string[];
    categories: string[];
    sourceApplication?: string;
    thumbnailUrl?: string;
    contentHash?: string; // For integrity verification
    encryptionStatus: 'encrypted' | 'unencrypted' | 'pending';
    digitalSignatureStatus: 'signed' | 'unsigned' | 'invalid';
    dataSovereigntyZone?: string; // e.g., 'EU', 'US_WEST'
    customProperties: { [key: string]: string | number | boolean | string[] };
}

/**
 * User engagement metrics for a Scroll.
 */
export interface EngagementMetrics {
    views: number;
    uniqueViewers: number;
    downloads: number;
    shares: number;
    comments: number;
    lastViewedBy?: { id: string; name: string; time: string };
    averageReadTimeMinutes?: number;
}

// --- Extended Props for FileItem (representing the full "Scroll") ---
interface FileItemProps {
    file: DriveFile;
    // Core expansions
    scrollMetadata?: ScrollMetadata;
    permissions?: ScrollPermissions;
    latestVersion?: ScrollVersion;
    currentCollaborators?: CollaborationInfo;
    aiInsights?: AIInsights;
    workflowStatus?: LifecyclePolicy;
    engagementMetrics?: EngagementMetrics;
    knowledgeGraphLinks?: KnowledgeGraphLink[];
    ephemeralNotes?: EphemeralNote[];
    isPinned?: boolean;
    isFavorite?: boolean;
    contextMenuActions?: Array<{
        label: string;
        icon: React.FC;
        action: (file: DriveFile) => void;
        condition?: (file: DriveFile) => boolean;
    }>;
    onFileClick?: (file: DriveFile) => void;
    onFileDoubleClick?: (file: DriveFile) => void;
    onContextMenuOpen?: (file: DriveFile) => void;
    onActionTriggered?: (action: string, file: DriveFile) => void;

    // UI/UX Customization
    displayMode?: 'list' | 'grid' | 'compact';
    showPreviewOnHover?: boolean;
    enableDragAndDrop?: boolean;
    dragHandleRef?: React.RefObject<HTMLDivElement>;
    isSelected?: boolean;
    onSelectionChange?: (fileId: string, isSelected: boolean) => void;
    highlightKeywords?: string[]; // For search result highlighting

    // "Universe" specific
    scholarId?: string; // Current user's ID
}

// --- Utility Functions (The Loremasters' Tools) ---

/**
 * @function exportableFormatFileSize
 * Formats file size into a human-readable string.
 */
export const exportableFormatFileSize = (bytes: number | undefined): string => {
    if (bytes === undefined || bytes === null || bytes < 0) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
};

/**
 * @function exportableGeneratePreviewUrl
 * Generates a mock preview URL based on file type.
 */
export const exportableGeneratePreviewUrl = (file: DriveFile): string | undefined => {
    if (file.thumbnailLink) return file.thumbnailLink;
    if (file.mimeType.startsWith('image/')) return `/api/previews/image/${file.id}`;
    if (file.mimeType.includes('pdf')) return `/api/previews/pdf/${file.id}`;
    // Placeholder for a service that generates previews
    return undefined;
};

/**
 * @function exportableTriggerFileAction
 * Simulates triggering a file action and logs it for audit.
 */
export const exportableTriggerFileAction = (action: string, file: DriveFile, scholarId?: string) => {
    console.log(`Scholar ${scholarId || 'unknown'} triggered action "${action}" on scroll "${file.name}" (${file.id})`);
    // In a real app, this would dispatch an event, call an API, etc.
};

// --- Sub-Components (The intricate mechanisms of the Great Library) ---

/**
 * @component ExportableFileIconResolver
 * Resolves and renders the appropriate icon based on file mime type and other properties.
 */
export const ExportableFileIconResolver: React.FC<{ file: DriveFile; className?: string }> = ({ file, className }) => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    // Add logic for more specific icons based on file extensions or special mime types
    const specificIcon = useMemo(() => {
        // Example: Word docs, Excel, Code, etc.
        if (file.mimeType.includes('word')) return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12 18H8m0-4h8m-8-4h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
        // ... many more specific icons
        return null;
    }, [file.mimeType, className]);

    return (
        <div className={className}>
            {isFolder ? <FolderIcon /> : (specificIcon || <FileIcon />)}
        </div>
    );
};

/**
 * @component ExportableFileStatusIndicator
 * Displays various statuses like encryption, sync, read-only.
 */
export const ExportableFileStatusIndicator: React.FC<{
    encryptionStatus?: 'encrypted' | 'unencrypted' | 'pending';
    digitalSignatureStatus?: 'signed' | 'unsigned' | 'invalid';
    workflowStage?: WorkflowStage;
    isLegalHoldActive?: boolean;
}> = ({ encryptionStatus, digitalSignatureStatus, workflowStage, isLegalHoldActive }) => {
    return (
        <div className="flex items-center space-x-1 text-gray-500 text-xs">
            {encryptionStatus === 'encrypted' && <span title="Encrypted" className="text-green-500"><LockIcon /></span>}
            {digitalSignatureStatus === 'signed' && <span title="Digitally Signed" className="text-blue-400"><ShieldCheckIcon /></span>}
            {isLegalHoldActive && <span title="Legal Hold Active" className="text-red-500"><InfoIcon /></span>}
            {workflowStage && (
                <span className={`px-1 rounded-full text-xs font-semibold
                    ${workflowStage === WorkflowStage.DRAFT ? 'bg-gray-600 text-gray-200' : ''}
                    ${workflowStage === WorkflowStage.IN_REVIEW || workflowStage === WorkflowStage.PENDING_APPROVAL ? 'bg-yellow-600 text-yellow-100' : ''}
                    ${workflowStage === WorkflowStage.APPROVED || workflowStage === WorkflowStage.PUBLISHED ? 'bg-green-600 text-green-100' : ''}
                    ${workflowStage === WorkflowStage.REJECTED || workflowStage === WorkflowStage.NEEDS_REVISION ? 'bg-red-600 text-red-100' : ''}
                    ${workflowStage === WorkflowStage.ARCHIVED ? 'bg-indigo-600 text-indigo-100' : ''}
                `}>
                    {workflowStage}
                </span>
            )}
        </div>
    );
};

/**
 * @component ExportableCollaborationIndicator
 * Shows who is currently viewing/editing.
 */
export const ExportableCollaborationIndicator: React.FC<{
    collaborationInfo?: CollaborationInfo;
    maxAvatars?: number;
}> = ({ collaborationInfo, maxAvatars = 3 }) => {
    if (!collaborationInfo || collaborationInfo.activeUsers.length === 0) return null;

    const activeEditors = collaborationInfo.activeUsers.filter(u => u.status === 'editing');
    const activeViewers = collaborationInfo.activeUsers.filter(u => u.status === 'viewing');

    return (
        <div className="flex items-center -space-x-1.5 overflow-hidden group">
            {activeEditors.slice(0, maxAvatars).map(user => (
                <img key={user.id} className="inline-block h-5 w-5 rounded-full ring-2 ring-red-500 bg-gray-600"
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name}
                    title={`${user.name} is editing`} />
            ))}
            {activeViewers.slice(0, maxAvatars).map(user => (
                <img key={user.id} className="inline-block h-5 w-5 rounded-full ring-2 ring-blue-500 bg-gray-600"
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name}
                    title={`${user.name} is viewing`} />
            ))}
            {collaborationInfo.activeUsers.length > maxAvatars && (
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-600 text-xs text-white ring-2 ring-gray-700">
                    +{collaborationInfo.activeUsers.length - maxAvatars}
                </span>
            )}
            {collaborationInfo.activeUsers.length > 0 && (
                <span className="ml-2 text-xs text-gray-400 hidden group-hover:block transition-all duration-200">
                    {collaborationInfo.activeUsers.length} active
                </span>
            )}
        </div>
    );
};

/**
 * @component ExportableFilePreview
 * Renders a thumbnail or content snippet for a file.
 */
export const ExportableFilePreview: React.FC<{
    file: DriveFile;
    scrollMetadata?: ScrollMetadata;
    aiInsights?: AIInsights;
    className?: string;
}> = ({ file, scrollMetadata, aiInsights, className }) => {
    const previewUrl = exportableGeneratePreviewUrl(file);
    const hasPreview = previewUrl || aiInsights?.summary;

    if (!hasPreview) return null;

    return (
        <div className={`absolute z-10 p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-w-sm right-full mr-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto ${className}`}>
            {previewUrl && (
                <img src={previewUrl} alt={`Preview of ${file.name}`} className="max-h-32 w-full object-cover rounded mb-2 border border-gray-800" />
            )}
            {aiInsights?.summary && (
                <p className="text-xs text-gray-300 line-clamp-3">{aiInsights.summary}</p>
            )}
            {scrollMetadata?.tags && scrollMetadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {scrollMetadata.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-700 text-cyan-300 px-1.5 py-0.5 rounded-full">#{tag}</span>
                    ))}
                    {scrollMetadata.tags.length > 3 && <span className="text-xs text-gray-500">+{scrollMetadata.tags.length - 3}</span>}
                </div>
            )}
        </div>
    );
};

/**
 * @component ExportableAIPredictions
 * Displays AI-generated tags and related scrolls.
 */
export const ExportableAIPredictions: React.FC<{
    aiInsights?: AIInsights;
    onTagClick?: (tag: string) => void;
    onRelatedScrollClick?: (scrollId: string) => void;
}> = ({ aiInsights, onTagClick, onRelatedScrollClick }) => {
    if (!aiInsights || (aiInsights.suggestedTags.length === 0 && aiInsights.relatedScrollIds.length === 0)) return null;

    return (
        <div className="flex items-center flex-wrap gap-1 mt-1 text-gray-500 text-xs">
            {aiInsights.suggestedTags.slice(0, 3).map(tag => (
                <span
                    key={tag}
                    className="px-1 py-0.5 bg-cyan-900/30 text-cyan-300 rounded-md cursor-pointer hover:bg-cyan-800/50 transition-colors"
                    onClick={() => onTagClick?.(tag)}
                    title={`AI Suggested Tag: ${tag}`}
                >
                    <AITagIcon className="inline h-3 w-3 mr-0.5" />{tag}
                </span>
            ))}
            {aiInsights.relatedScrollIds.length > 0 && (
                <span
                    className="flex items-center px-1 py-0.5 bg-purple-900/30 text-purple-300 rounded-md cursor-pointer hover:bg-purple-800/50 transition-colors"
                    onClick={() => onRelatedScrollClick?.(aiInsights.relatedScrollIds[0])}
                    title={`AI Suggested Related Scroll: ${aiInsights.relatedScrollIds[0]}`}
                >
                    <ConnectIcon className="inline h-3 w-3 mr-0.5" />{aiInsights.relatedScrollIds.length} related
                </span>
            )}
        </div>
    );
};

/**
 * @component ExportableContextMenuItem
 * A single item in the context menu.
 */
export const ExportableContextMenuItem: React.FC<{
    icon: React.FC;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}> = ({ icon: Icon, label, onClick, disabled }) => (
    <button
        className={`flex items-center w-full px-4 py-2 text-sm text-left ${disabled ? 'text-gray-600 cursor-not-allowed' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`}
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        role="menuitem"
    >
        <Icon className="mr-2 h-4 w-4" />
        {label}
    </button>
);

/**
 * @component ExportableFileActionsMenu
 * A dropdown context menu for various file actions.
 */
export const ExportableFileActionsMenu: React.FC<{
    file: DriveFile;
    permissions?: ScrollPermissions;
    onActionTriggered: (action: string, file: DriveFile) => void;
    contextMenuActions?: FileItemProps['contextMenuActions'];
}> = ({ file, permissions, onActionTriggered, contextMenuActions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleMenu = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setIsOpen(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeMenu]);

    const handleAction = useCallback((action: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onActionTriggered(action, file);
        closeMenu();
    }, [onActionTriggered, file, closeMenu]);

    const defaultActions = useMemo(() => [
        { label: 'Open', icon: EyeIcon, action: (f: DriveFile) => exportableTriggerFileAction('open', f), condition: (f: DriveFile) => f.mimeType !== 'application/vnd.google-apps.folder' },
        { label: 'Share', icon: ShareIcon, action: (f: DriveFile) => exportableTriggerFileAction('share', f), condition: () => permissions?.canShare },
        { label: 'View History', icon: HistoryIcon, action: (f: DriveFile) => exportableTriggerFileAction('view_history', f), condition: () => true },
        { label: 'Get Info', icon: InfoIcon, action: (f: DriveFile) => exportableTriggerFileAction('get_info', f), condition: () => true },
        { label: 'Pin to Collection', icon: PinIcon, action: (f: DriveFile) => exportableTriggerFileAction('pin', f), condition: () => true },
        { label: 'Rename', icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-5.5 5.5a2 2 0 012.828 0L15 11.172V15h-2.828l-3.586-3.586a2 2 0 010-2.828z" /></svg>, condition: () => permissions?.canWrite },
        { label: 'Delete', icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" /></svg>, condition: () => permissions?.canDelete },
        // ... more advanced actions
        { label: 'Integrate Workflow', icon: WorkflowIcon, action: (f: DriveFile) => exportableTriggerFileAction('integrate_workflow', f), condition: () => true },
        { label: 'Create Template from Scroll', icon: TemplateIcon, action: (f: DriveFile) => exportableTriggerFileAction('create_template', f), condition: () => permissions?.canWrite },
        { label: 'View Knowledge Graph Links', icon: ConnectIcon, action: (f: DriveFile) => exportableTriggerFileAction('view_kg_links', f), condition: () => true },
        { label: 'Manage AI Insights', icon: AITagIcon, action: (f: DriveFile) => exportableTriggerFileAction('manage_ai_insights', f), condition: () => true },
    ], [permissions]);

    const allActions = useMemo(() => {
        const filteredDefaults = defaultActions.filter(action => action.condition?.(file) ?? true);
        const combinedActions = contextMenuActions ? [...filteredDefaults, ...contextMenuActions] : filteredDefaults;
        // Deduplicate actions by label if necessary
        return Array.from(new Map(combinedActions.map(item => [item.label, item])).values());
    }, [file, permissions, contextMenuActions, defaultActions]);

    return (
        <div className="relative inline-block text-left z-20">
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="inline-flex justify-center w-full rounded-md p-1 text-sm font-medium text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                id={`options-menu-${file.id}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-700 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby={`options-menu-${file.id}`}
                >
                    <div className="py-1" role="none">
                        {allActions.map((action, index) => (
                            <ExportableContextMenuItem
                                key={`${action.label}-${index}`}
                                icon={action.icon}
                                label={action.label}
                                onClick={(e) => handleAction(action.label.toLowerCase().replace(/\s/g, '_'), e)}
                                disabled={action.condition && !action.condition(file)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * @component ExportableKnowledgeGraphLink
 * Displays a badge for linked scrolls.
 */
export const ExportableKnowledgeGraphLinkBadge: React.FC<{
    links?: KnowledgeGraphLink[];
    onLinkClick?: (scrollId: string) => void;
}> = ({ links, onLinkClick }) => {
    if (!links || links.length === 0) return null;
    return (
        <div className="flex items-center text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full cursor-pointer hover:bg-purple-800/50 transition-colors"
             onClick={() => onLinkClick?.(links[0].targetScrollId)}
             title={`${links.length} knowledge graph links`}>
            <ConnectIcon className="h-3 w-3 mr-1" />
            <span>{links.length} Links</span>
        </div>
    );
};

/**
 * @component ExportableEphemeralNotesIndicator
 * Shows an icon if there are ephemeral notes.
 */
export const ExportableEphemeralNotesIndicator: React.FC<{
    notes?: EphemeralNote[];
    onViewNotes?: () => void;
}> = ({ notes, onViewNotes }) => {
    if (!notes || notes.length === 0) return null;
    return (
        <span
            className="flex items-center text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full cursor-pointer hover:bg-yellow-800/50 transition-colors"
            onClick={onViewNotes}
            title={`${notes.length} ephemeral notes`}
        >
            <CommentIcon className="h-3 w-3 mr-1" />
            <span>{notes.length} Notes</span>
        </span>
    );
};

/**
 * @component ExportableContentQualityScore
 * Displays an AI-generated content quality score.
 */
export const ExportableContentQualityScore: React.FC<{ score?: number }> = ({ score }) => {
    if (score === undefined || score < 0 || score > 100) return null;
    let colorClass = 'text-gray-500';
    if (score >= 80) colorClass = 'text-green-400';
    else if (score >= 60) colorClass = 'text-yellow-400';
    else colorClass = 'text-red-400';

    return (
        <div className="flex items-center text-xs font-medium" title={`Content Quality Score: ${score}/100`}>
            <AtomIcon className={`h-3 w-3 mr-1 ${colorClass}`} />
            <span className={colorClass}>{score}/100</span>
        </div>
    );
};

/**
 * @component ExportableEngagementMetricsDisplay
 * Shows views, downloads, etc.
 */
export const ExportableEngagementMetricsDisplay: React.FC<{ metrics?: EngagementMetrics }> = ({ metrics }) => {
    if (!metrics) return null;
    return (
        <div className="flex items-center text-xs text-gray-500 space-x-2">
            {metrics.views > 0 && (
                <span className="flex items-center" title={`${metrics.views} views`}>
                    <EyeIcon className="h-3 w-3 mr-0.5" /> {metrics.views}
                </span>
            )}
            {metrics.comments > 0 && (
                <span className="flex items-center" title={`${metrics.comments} comments`}>
                    <CommentIcon className="h-3 w-3 mr-0.5" /> {metrics.comments}
                </span>
            )}
            {/* Add more metrics like downloads, shares if needed */}
        </div>
    );
};

/**
 * @component ExportableComplianceTags
 * Displays important compliance or data sovereignty tags.
 */
export const ExportableComplianceTags: React.FC<{ scrollMetadata?: ScrollMetadata }> = ({ scrollMetadata }) => {
    if (!scrollMetadata || (!scrollMetadata.dataSovereigntyZone && !scrollMetadata.customProperties?.complianceCategory)) return null;

    const complianceCategory = scrollMetadata.customProperties?.complianceCategory as string;

    return (
        <div className="flex items-center flex-wrap gap-1 text-xs text-red-400">
            {scrollMetadata.dataSovereigntyZone && (
                <span className="bg-red-900/30 px-1.5 py-0.5 rounded-md" title={`Data Sovereignty Zone: ${scrollMetadata.dataSovereigntyZone}`}>
                    <GlobeIcon className="h-3 w-3 inline-block mr-1" />{scrollMetadata.dataSovereigntyZone}
                </span>
            )}
            {complianceCategory && (
                <span className="bg-red-900/30 px-1.5 py-0.5 rounded-md" title={`Compliance Category: ${complianceCategory}`}>
                    <ShieldCheckIcon className="h-3 w-3 inline-block mr-1" />{complianceCategory}
                </span>
            )}
        </div>
    );
};

/**
 * @component ExportableInterstellarSyncIndicator
 * A whimsical indicator for sync status in the "universe" theme.
 */
export const ExportableInterstellarSyncIndicator: React.FC<{ file: DriveFile; isSyncing?: boolean }> = ({ file, isSyncing }) => {
    // This is purely for the "universe" aesthetic. In a real app, this would be complex.
    const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date(file.modifiedTime));
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (isSyncing) {
            setPulse(true);
            const timer = setTimeout(() => {
                setPulse(false);
                setLastSyncTime(new Date()); // Simulate successful sync
            }, 2000); // Simulate sync duration
            return () => clearTimeout(timer);
        }
    }, [isSyncing]);

    const statusText = isSyncing ? 'Synchronizing...' : `Last Sync: ${lastSyncTime.toLocaleTimeString()}`;
    const pulseClass = pulse ? 'animate-pulse' : '';

    return (
        <div className="flex items-center text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full"
             title={statusText}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 ${pulseClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v10"></path><path d="M18.4 6.6A9 9 0 1 1 5.6 6.6"></path><path d="M22 10H12l-5 5-5-5"></path>
            </svg>
            <span className="hidden sm:inline">{isSyncing ? 'Syncing' : 'Synced'}</span>
        </div>
    );
};


// --- The Expanded FileItem (The Scroll itself, imbued with power) ---

const FileItem: React.FC<FileItemProps> = ({
    file,
    scrollMetadata,
    permissions,
    latestVersion,
    currentCollaborators,
    aiInsights,
    workflowStatus,
    engagementMetrics,
    knowledgeGraphLinks,
    ephemeralNotes,
    isPinned,
    isFavorite,
    contextMenuActions,
    onFileClick,
    onFileDoubleClick,
    onContextMenuOpen,
    onActionTriggered,
    displayMode = 'list',
    showPreviewOnHover = true,
    enableDragAndDrop = true,
    dragHandleRef,
    isSelected,
    onSelectionChange,
    highlightKeywords,
    scholarId,
}) => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    const lastModifiedDate = useMemo(() => new Date(file.modifiedTime).toLocaleDateString(), [file.modifiedTime]);
    const fileRef = useRef<HTMLDivElement>(null);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (onFileClick) {
            onFileClick(file);
        } else {
            exportableTriggerFileAction('click', file, scholarId);
        }
        if (e.ctrlKey || e.metaKey) {
            onSelectionChange?.(file.id, !isSelected);
        }
    }, [file, onFileClick, onSelectionChange, isSelected, scholarId]);

    const handleDoubleClick = useCallback(() => {
        if (onFileDoubleClick) {
            onFileDoubleClick(file);
        } else {
            exportableTriggerFileAction('double_click', file, scholarId);
        }
    }, [file, onFileDoubleClick, scholarId]);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onContextMenuOpen?.(file);
        exportableTriggerFileAction('context_menu_open', file, scholarId);
        // This component doesn't manage global context menu state,
        // it only triggers the event for parent to handle.
    }, [file, onContextMenuOpen, scholarId]);

    const renderHighlightedName = (name: string, keywords?: string[]) => {
        if (!keywords || keywords.length === 0) return name;
        const lowerName = name.toLowerCase();
        let currentString = name;
        let offset = 0;

        keywords.forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase();
            let index = lowerName.indexOf(lowerKeyword, offset);
            while (index !== -1) {
                const before = currentString.substring(0, index);
                const match = currentString.substring(index, index + keyword.length);
                const after = currentString.substring(index + keyword.length);
                currentString = `${before}<mark class="bg-yellow-400 text-black rounded px-0.5">${match}</mark>${after}`;
                offset = index + (`<mark class="bg-yellow-400 text-black rounded px-0.5">${match}</mark>`).length;
                index = lowerName.indexOf(lowerKeyword, index + lowerKeyword.length); // Search for next occurrence
            }
        });
        return <span dangerouslySetInnerHTML={{ __html: currentString }} />;
    };


    const isSelectable = onSelectionChange !== undefined;
    const itemClass = `
        flex items-center p-2 rounded-lg cursor-pointer
        ${displayMode === 'list' ? 'bg-gray-800 hover:bg-gray-700' : 'flex-col bg-gray-800 hover:bg-gray-700 p-4 text-center'}
        ${isSelected ? 'border border-cyan-500 ring-1 ring-cyan-500' : 'border border-transparent'}
        relative group transition-all duration-150 ease-in-out
    `;

    // Visual elements for "universe" theme
    const chronicleSeal = file.id.substring(0, 4); // A unique identifier from the scroll's essence
    const aethericGlow = currentCollaborators && currentCollaborators.activeUsers.length > 0 ? 'ring-2 ring-purple-500/50' : '';

    if (displayMode === 'grid') {
        return (
            <div
                ref={fileRef}
                className={`${itemClass} flex-col !items-center !justify-center p-4 min-h-[160px] ${aethericGlow}`}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleContextMenu}
                draggable={enableDragAndDrop}
                aria-selected={isSelected}
            >
                <div className="absolute top-1 left-1 text-gray-600 text-[10px]">{chronicleSeal}</div>
                {isPinned && <PinIcon className="absolute top-1 right-1 text-yellow-500 h-4 w-4" title="Pinned Scroll" />}
                {isFavorite && <StarIcon className="absolute bottom-1 right-1 text-pink-500 h-4 w-4" title="Favorite Scroll" />}

                {enableDragAndDrop && dragHandleRef && <div ref={dragHandleRef} className="absolute inset-0 cursor-grab z-0"></div>}

                {isSelectable && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); onSelectionChange?.(file.id, e.target.checked); }}
                        className="absolute top-2 left-2 z-10 form-checkbox h-4 w-4 text-cyan-500 bg-gray-900 border-gray-600 rounded focus:ring-cyan-500"
                    />
                )}

                <div className="text-cyan-400 mb-2 mt-4 text-3xl">
                    <ExportableFileIconResolver file={file} className="h-10 w-10" />
                </div>
                <p className="font-medium text-white text-sm text-center line-clamp-2 mt-1 px-1">
                    {renderHighlightedName(file.name, highlightKeywords)}
                </p>
                <div className="flex-col text-[10px] text-gray-400 mt-2 space-y-1">
                    <span className="block">{lastModifiedDate}</span>
                    <ExportableFileStatusIndicator
                        encryptionStatus={scrollMetadata?.encryptionStatus}
                        digitalSignatureStatus={scrollMetadata?.digitalSignatureStatus}
                        workflowStage={workflowStatus?.stage}
                        isLegalHoldActive={workflowStatus?.isLegalHoldActive}
                    />
                    <ExportableCollaborationIndicator collaborationInfo={currentCollaborators} maxAvatars={2} />
                    <ExportableEngagementMetricsDisplay metrics={engagementMetrics} />
                    {showPreviewOnHover && <ExportableFilePreview file={file} scrollMetadata={scrollMetadata} aiInsights={aiInsights} className="top-1/2 -translate-y-1/2 left-full !opacity-0 !group-hover:opacity-100" />}
                </div>
                <div className="absolute top-1 right-1 z-10">
                    <ExportableFileActionsMenu
                        file={file}
                        permissions={permissions}
                        onActionTriggered={onActionTriggered || ((action) => exportableTriggerFileAction(action, file, scholarId))}
                        contextMenuActions={contextMenuActions}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            ref={fileRef}
            className={`${itemClass} ${aethericGlow}`}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            draggable={enableDragAndDrop}
            aria-selected={isSelected}
        >
            <div className="absolute top-1 left-1 text-gray-600 text-[10px] hidden group-hover:block transition-all duration-200">{chronicleSeal}</div>
            {isSelectable && (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => { e.stopPropagation(); onSelectionChange?.(file.id, e.target.checked); }}
                    className="mr-2 z-10 form-checkbox h-4 w-4 text-cyan-500 bg-gray-900 border-gray-600 rounded focus:ring-cyan-500"
                />
            )}
            {enableDragAndDrop && dragHandleRef && <div ref={dragHandleRef} className="absolute inset-y-0 left-0 w-2 cursor-grab z-0"></div>}

            <div className="mr-3 text-cyan-400 z-10">
                <ExportableFileIconResolver file={file} />
            </div>
            <div className="flex-grow flex flex-col min-w-0 pr-4 z-10">
                <p className="font-medium text-white truncate text-base leading-tight">
                    {renderHighlightedName(file.name, highlightKeywords)}
                </p>
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-sm text-gray-400">
                    <span className="text-xs text-gray-500">
                        {exportableFormatFileSize(latestVersion?.sizeBytes || file.size)}
                        {file.size !== undefined && file.size !== null && file.size > 0 && latestVersion?.sizeBytes === undefined && ' (est.)'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {file.owners?.[0]?.displayName ? `By ${file.owners[0].displayName}` : `Owned by ${permissions?.ownerId || 'Unknown'}`}
                    </span>
                    <ExportableInterstellarSyncIndicator file={file} isSyncing={Math.random() > 0.95} /> {/* Random sync status for universe theme */}
                </div>
                <ExportableAIPredictions aiInsights={aiInsights} />
                <div className="flex items-center flex-wrap gap-2 mt-1">
                    <ExportableKnowledgeGraphLinkBadge links={knowledgeGraphLinks} />
                    <ExportableEphemeralNotesIndicator notes={ephemeralNotes} />
                    <ExportableContentQualityScore score={aiInsights?.contentQualityScore} />
                    <ExportableEngagementMetricsDisplay metrics={engagementMetrics} />
                    <ExportableComplianceTags scrollMetadata={scrollMetadata} />
                </div>
            </div>

            <div className="flex-shrink-0 flex items-center space-x-2 z-10">
                <ExportableCollaborationIndicator currentCollaborators={currentCollaborators} />
                <ExportableFileStatusIndicator
                    encryptionStatus={scrollMetadata?.encryptionStatus}
                    digitalSignatureStatus={scrollMetadata?.digitalSignatureStatus}
                    workflowStage={workflowStatus?.stage}
                    isLegalHoldActive={workflowStatus?.isLegalHoldActive}
                />
                {isPinned && <PinIcon className="text-yellow-500" title="Pinned Scroll" />}
                {isFavorite && <StarIcon className="text-pink-500" title="Favorite Scroll" />}

                <div className="text-sm text-gray-400 min-w-[70px] text-right">
                    {lastModifiedDate}
                </div>

                {showPreviewOnHover && <ExportableFilePreview file={file} scrollMetadata={scrollMetadata} aiInsights={aiInsights} />}

                <ExportableFileActionsMenu
                    file={file}
                    permissions={permissions}
                    onActionTriggered={onActionTriggered || ((action) => exportableTriggerFileAction(action, file, scholarId))}
                    contextMenuActions={contextMenuActions}
                />
            </div>
        </div>
    );
};

export default FileItem;

// --- Additional Exported Components/Hooks (Expanding the universe's capabilities) ---

/**
 * @hook exportableUseFilePermissions
 * A mock hook for fetching and managing file permissions.
 */
export const exportableUseFilePermissions = (fileId: string, scholarId: string): ScrollPermissions | undefined => {
    // In a real application, this would fetch permissions from a backend.
    // For now, return a mock based on IDs.
    const mockPermissions: ScrollPermissions = useMemo(() => ({
        canRead: true,
        canWrite: fileId.length % 2 === 0, // Mock: even IDs are editable
        canShare: true,
        canDelete: fileId.length % 3 === 0, // Mock: every 3rd is deletable
        canManageVersions: true,
        isPublic: false,
        ownerId: (fileId.length % 5 === 0) ? 'scholar_admin_123' : 'scholar_default_abc',
        allowedUsers: [{ id: scholarId, role: 'editor' }],
        allowedGroups: [],
    }), [fileId, scholarId]);
    return mockPermissions;
};

/**
 * @hook exportableUseFileLifecycle
 * A mock hook for tracking a scroll's lifecycle.
 */
export const exportableUseFileLifecycle = (fileId: string): LifecyclePolicy => {
    const mockLifecycle: LifecyclePolicy = useMemo(() => ({
        stage: Math.random() > 0.8 ? WorkflowStage.PUBLISHED : Math.random() > 0.5 ? WorkflowStage.IN_REVIEW : WorkflowStage.DRAFT,
        assignedPolicyId: 'policy_alpha_1',
        retentionUntil: Math.random() > 0.7 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        isLegalHoldActive: fileId.includes('legal_hold'),
    }), [fileId]);
    return mockLifecycle;
};

/**
 * @component ExportableFileDetailsPanel
 * A comprehensive panel to display all extended information about a file, used perhaps in a modal or sidebar.
 */
export const ExportableFileDetailsPanel: React.FC<FileItemProps & { onClose: () => void }> = ({
    file,
    scrollMetadata,
    permissions,
    latestVersion,
    currentCollaborators,
    aiInsights,
    workflowStatus,
    engagementMetrics,
    knowledgeGraphLinks,
    ephemeralNotes,
    onClose
}) => {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <ExportableFileIconResolver file={file} className="h-7 w-7 mr-3" />
                    {file.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Basic Scroll Attributes</h3>
                        <ul className="text-gray-300 text-sm space-y-1">
                            <li><strong>ID:</strong> {file.id}</li>
                            <li><strong>Type:</strong> {file.mimeType}</li>
                            <li><strong>Created:</strong> {new Date(file.createdTime).toLocaleString()}</li>
                            <li><strong>Last Modified:</strong> {new Date(file.modifiedTime).toLocaleString()}</li>
                            <li><strong>Size:</strong> {exportableFormatFileSize(file.size)}</li>
                            <li><strong>Owner:</strong> {file.owners?.[0]?.displayName || 'Unknown'}</li>
                            {scrollMetadata?.description && <li><strong>Description:</strong> {scrollMetadata.description}</li>}
                        </ul>
                    </div>

                    {/* Status & Lifecycle */}
                    <div>
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Scroll State & Destiny</h3>
                        <div className="space-y-2">
                            <ExportableFileStatusIndicator
                                encryptionStatus={scrollMetadata?.encryptionStatus}
                                digitalSignatureStatus={scrollMetadata?.digitalSignatureStatus}
                                workflowStage={workflowStatus?.stage}
                                isLegalHoldActive={workflowStatus?.isLegalHoldActive}
                            />
                            {workflowStatus?.retentionUntil && (
                                <p className="text-sm text-gray-300">
                                    <strong>Retention Until:</strong> {new Date(workflowStatus.retentionUntil).toLocaleDateString()}
                                </p>
                            )}
                            {scrollMetadata?.encryptionStatus && <p className="text-sm text-gray-300"><strong>Encryption:</strong> {scrollMetadata.encryptionStatus}</p>}
                            {scrollMetadata?.digitalSignatureStatus && <p className="text-sm text-gray-300"><strong>Signature:</strong> {scrollMetadata.digitalSignatureStatus}</p>}
                            {scrollMetadata?.dataSovereigntyZone && (
                                <p className="text-sm text-gray-300">
                                    <strong>Sovereignty Zone:</strong> <span className="text-red-400">{scrollMetadata.dataSovereigntyZone}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Permissions */}
                    {permissions && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Access & Custodianship</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li><strong>Can Read:</strong> {permissions.canRead ? 'Yes' : 'No'}</li>
                                <li><strong>Can Write:</strong> {permissions.canWrite ? 'Yes' : 'No'}</li>
                                <li><strong>Can Share:</strong> {permissions.canShare ? 'Yes' : 'No'}</li>
                                <li><strong>Publicly Accessible:</strong> {permissions.isPublic ? 'Yes' : 'No'}</li>
                                {permissions.allowedUsers.length > 0 && (
                                    <li><strong>Collaborators:</strong> {permissions.allowedUsers.map(u => `${u.role}: ${u.id}`).join(', ')}</li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* AI Insights */}
                    {aiInsights && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Oracle's Projections (AI Insights)</h3>
                            <div className="space-y-2 text-sm text-gray-300">
                                <p><strong>Summary:</strong> {aiInsights.summary || 'N/A'}</p>
                                <p><strong>Keywords:</strong> {aiInsights.keywords.join(', ') || 'N/A'}</p>
                                <p><strong>Sentiment:</strong> {aiInsights.sentiment}</p>
                                <p><strong>Content Quality:</strong> <ExportableContentQualityScore score={aiInsights.contentQualityScore} /></p>
                                {aiInsights.complianceFlags.length > 0 && (
                                    <p><strong>Compliance Flags:</strong> <span className="text-red-400">{aiInsights.complianceFlags.join(', ')}</span></p>
                                )}
                                {aiInsights.suggestedTags.length > 0 && (
                                    <p><strong>Suggested Runes (Tags):</strong> {aiInsights.suggestedTags.map(tag => <span key={tag} className="px-1 bg-cyan-900/30 rounded-md text-cyan-300 mr-1 text-xs">#{tag}</span>)}</p>
                                )}
                                {aiInsights.relatedScrollIds.length > 0 && (
                                    <p><strong>Related Scrolls:</strong> {aiInsights.relatedScrollIds.slice(0, 3).map(id => <span key={id} className="text-purple-400 mr-1 text-xs">[{id.substring(0, 7)}...]</span>)}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Collaboration */}
                    {currentCollaborators && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Active Scholars</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                {currentCollaborators.activeUsers.length > 0 ? (
                                    currentCollaborators.activeUsers.map(user => (
                                        <li key={user.id} className="flex items-center">
                                            <img src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} className="h-5 w-5 rounded-full mr-2" />
                                            {user.name} ({user.status})
                                        </li>
                                    ))
                                ) : (
                                    <li>No active scholars.</li>
                                )}
                                {currentCollaborators.lastActivityTime && <li><strong>Last Activity:</strong> {new Date(currentCollaborators.lastActivityTime).toLocaleString()}</li>}
                            </ul>
                        </div>
                    )}

                    {/* Engagement */}
                    {engagementMetrics && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Engagement Metrics</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li><strong>Views:</strong> {engagementMetrics.views}</li>
                                <li><strong>Unique Viewers:</strong> {engagementMetrics.uniqueViewers}</li>
                                <li><strong>Downloads:</strong> {engagementMetrics.downloads}</li>
                                <li><strong>Comments:</strong> {engagementMetrics.comments}</li>
                                {engagementMetrics.averageReadTimeMinutes && <li><strong>Avg. Read Time:</strong> {engagementMetrics.averageReadTimeMinutes} min</li>}
                                {engagementMetrics.lastViewedBy && (
                                    <li><strong>Last Viewed By:</strong> {engagementMetrics.lastViewedBy.name} ({new Date(engagementMetrics.lastViewedBy.time).toLocaleString()})</li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Version History (Latest) */}
                    {latestVersion && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Temporal Weave (Latest Version)</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li><strong>Version:</strong> {latestVersion.majorVersion}.{latestVersion.minorVersion}</li>
                                <li><strong>Modified:</strong> {new Date(latestVersion.modifiedTime).toLocaleString()}</li>
                                <li><strong>Modifier:</strong> {latestVersion.modifierId}</li>
                                <li><strong>Size:</strong> {exportableFormatFileSize(latestVersion.sizeBytes)}</li>
                                {latestVersion.description && <li><strong>Changes:</strong> {latestVersion.description}</li>}
                                <li><button className="text-blue-400 hover:underline mt-1" onClick={() => exportableTriggerFileAction('view_full_history', file)}>View Full Chronicle</button></li>
                            </ul>
                        </div>
                    )}

                    {/* Knowledge Graph Links */}
                    {knowledgeGraphLinks && knowledgeGraphLinks.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Aetheric Links (Knowledge Graph)</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                {knowledgeGraphLinks.map((link, idx) => (
                                    <li key={idx}>
                                        <ConnectIcon className="inline h-4 w-4 mr-1 text-purple-400" />
                                        <span>{link.relationshipType}</span> to <span className="text-purple-300 cursor-pointer hover:underline" onClick={() => exportableTriggerFileAction('navigate_to_scroll', { ...file, id: link.targetScrollId })}>{link.targetScrollId.substring(0, 8)}...</span>
                                        {link.description && <span className="text-gray-500"> ({link.description})</span>}
                                    </li>
                                ))}
                                <li><button className="text-blue-400 hover:underline mt-1" onClick={() => exportableTriggerFileAction('view_entire_knowledge_graph', file)}>Explore Constellation</button></li>
                            </ul>
                        </div>
                    )}

                    {/* Ephemeral Notes */}
                    {ephemeralNotes && ephemeralNotes.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Ephemeral Scholar Notes</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                {ephemeralNotes.map((note, idx) => (
                                    <li key={idx} className="bg-gray-700 p-2 rounded-md">
                                        <p className="font-semibold text-yellow-300">{note.userId} on {new Date(note.createdAt).toLocaleDateString()}:</p>
                                        <p>{note.content}</p>
                                    </li>
                                ))}
                                <li><button className="text-blue-400 hover:underline mt-1" onClick={() => exportableTriggerFileAction('add_new_note', file)}>Add New Annotation</button></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};