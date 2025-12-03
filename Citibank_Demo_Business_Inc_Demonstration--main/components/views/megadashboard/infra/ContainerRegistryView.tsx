import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

// ====================================================================================================================
// --- Type Definitions (Extensive for all new features) ---
// ====================================================================================================================

/**
 * Represents a single container image entry.
 * @interface ContainerImage
 */
export interface ContainerImage {
    id: string;
    repository: string;
    tag: string;
    size: string; // e.g., "500MB"
    lastPush: string; // ISO date string
    digest: string; // SHA256 digest
    status: 'active' | 'deprecated' | 'archived' | 'pending_scan';
    architecture: 'amd64' | 'arm64' | 'windows/amd64';
    os: 'linux' | 'windows';
    vulnerabilityScore: number; // 0-100, lower is better
    vulnerabilities: ImageVulnerability[];
    layers: ImageLayer[];
    manifest: string; // Base64 encoded manifest or a large JSON string
    labels: { [key: string]: string };
    baseImage: string;
    pullCountLast30Days: number;
    pullCountTotal: number;
    lastPulled: string; // ISO date string
    buildId?: string; // Link to a build process
    deploymentTargets: ImageDeploymentTarget[];
    retentionPolicyApplied?: string; // e.g., "30-day-policy"
    costEstimateUSD?: number; // Estimated cost for storage/pulls
    aiInsights?: ImageAIInsight[];
    metadata: {
        creator: string;
        source: string; // e.g., "CI/CD Pipeline", "Local Build"
        scanStatus: 'NOT_SCANNED' | 'SCANNING' | 'COMPLETED' | 'FAILED';
        scanLastRun?: string; // ISO date string
        scanResultsSummary?: string;
    };
    storageDetails: {
        location: string; // e.g., "us-east-1", "eu-west-2", "on-prem"
        compressionRatio: string; // e.g., "1.5x"
        storageClass: 'standard' | 'cold' | 'archive';
    };
    networkAccess: {
        exposedPorts: number[];
        registryPullAccess: string[]; // e.g., "public", "private", "vpc-only"
        repoExternalAccess?: string; // e.g., "Read-only for org"
    };
    securityContext?: {
        runAsUser: string; // e.g., "root", "1000"
        capabilities: string[]; // e.g., "NET_RAW", "SYS_ADMIN"
        seccompProfile?: string;
    };
    dependencyGraph?: {
        packages: { name: string; version: string; license: string; vulnerabilities: string[]; }[];
        osDependencies: { name: string; version: string; }[];
    };
}

/**
 * Represents a detected vulnerability in a container image.
 * @interface ImageVulnerability
 */
export interface ImageVulnerability {
    id: string;
    cve: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    packageName: string;
    version: string;
    fixedVersion: string;
    description: string;
    links: string[];
    exploitabilityScore: number; // 0-10, higher means easier to exploit
    cvssScore: string; // e.g., "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H/E:X/RL:X/RC:X"
    attackVector: 'NETWORK' | 'ADJACENT_NETWORK' | 'LOCAL' | 'PHYSICAL';
    references: string[]; // URLs to external resources
    exploitCodeMaturity: 'NOT_DEFINED' | 'UNPROVEN' | 'PROOF_OF_CONCEPT' | 'FUNCTIONAL' | 'HIGH';
    discoveredDate: string; // ISO date string
    status: 'open' | 'fixed' | 'ignored' | 'deferred';
    patchAvailable: boolean;
    remediationGuidance: string;
    identifiedLayerId?: string; // Which layer introduced this vuln
}

/**
 * Represents a layer in a Docker image.
 * @interface ImageLayer
 */
export interface ImageLayer {
    id: string; // Layer digest
    size: string;
    compressedSize: string;
    command: string; // The Dockerfile command that created this layer
    digest: string;
    created: string; // ISO date string
    emptyLayer: boolean;
    packagesInstalled: { name: string; version: string; }[];
    filesAdded: { path: string; size: string; permissions: string; }[];
    envVariables: { [key: string]: string };
    portsExposed: number[];
    diffId: string; // Content addressable ID for the layer filesystem changes
}

/**
 * Represents a target where an image is deployed.
 * @interface ImageDeploymentTarget
 */
export interface ImageDeploymentTarget {
    id: string;
    environment: string; // e.g., "production", "staging"
    cluster: string; // e.g., "k8s-prod-us-east-1"
    namespace: string;
    service: string;
    currentVersion: string; // Tag or digest deployed
    status: 'healthy' | 'unhealthy' | 'deploying' | 'pending' | 'rolled_back';
    lastUpdated: string; // ISO date string
    healthChecks: DeploymentHealthCheck[];
    associatedResources: {
        type: 'Pod' | 'Deployment' | 'ReplicaSet';
        name: string;
        status: string;
    }[];
    rollbackHistory: {
        timestamp: string;
        previousVersion: string;
        reason: string;
        triggeredBy: string;
    }[];
    trafficSplitPercentage: number; // e.g., for canary deployments
}

/**
 * Represents a health check for a deployed image.
 * @interface DeploymentHealthCheck
 */
export interface DeploymentHealthCheck {
    id: string;
    type: 'liveness' | 'readiness' | 'startup';
    status: 'pass' | 'fail' | 'unknown';
    timestamp: string; // ISO date string
    message?: string;
    lastProbeTime: string; // ISO date string
    failureCount: number;
}

/**
 * Represents a build pipeline definition.
 * @interface BuildPipeline
 */
export interface BuildPipeline {
    id: string;
    name: string;
    description: string;
    repository: string; // Git repository URL
    branch: string;
    dockerfilePath: string; // Path to Dockerfile in repo
    contextPath: string; // Build context path
    buildArguments: { [key: string]: string };
    envVariables: { [key: string]: string };
    targetImageName: string;
    tags: string[]; // Tags to apply to built image
    status: 'active' | 'inactive' | 'archived';
    lastRunId?: string;
    lastRunStatus?: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING' | 'CANCELLED';
    lastRunStartTime?: string;
    lastRunEndTime?: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    webhooksEnabled: boolean;
    cachingStrategy: 'LAYER' | 'NOCACHE' | 'CUSTOM';
    artifactStorageLocation: string; // e.g., "s3://my-bucket/artifacts"
    notificationEmails: string[];
    buildStages: { name: string; commands: string[]; baseImage?: string; }[];
    securityScanningAfterBuild: boolean;
    automaticDeploymentOnSuccess: boolean;
}

/**
 * Represents a single run of a build pipeline.
 * @interface BuildRun
 */
export interface BuildRun {
    id: string;
    pipelineId: string;
    status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING' | 'CANCELLED';
    triggeredBy: string; // User ID or "webhook"
    startTime: string; // ISO date string
    endTime?: string; // ISO date string
    durationSeconds?: number;
    logOutput: string; // Large string of build logs
    logUrl?: string; // Link to external log viewer
    commitHash: string;
    commitMessage: string;
    builtImageDigest?: string;
    builtImageTags: string[];
    errorMessage?: string;
    artifacts: { name: string; size: string; url: string; }[];
    buildArgsUsed: { [key: string]: string };
    envVarsUsed: { [key: string]: string };
    cpuUsagePercent: number; // Simulated
    memoryUsageMB: number; // Simulated
    scanResultSummary?: {
        status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
        vulnerabilitiesFound: number;
        criticalCount: number;
    };
}

/**
 * Represents a webhook configuration for the registry.
 * @interface RegistryWebhook
 */
export interface RegistryWebhook {
    id: string;
    name: string;
    url: string;
    events: ('push' | 'pull' | 'scan_completed' | 'build_completed' | 'tag_created' | 'tag_deleted')[];
    secret?: string; // Hashed secret
    headers: { [key: string]: string }; // Custom headers
    retryPolicy: {
        maxAttempts: number;
        intervalSeconds: number;
        backoffFactor: number;
    };
    eventFilters: {
        repositoryRegex?: string;
        tagRegex?: string;
        minSeverity?: ImageVulnerability['severity'];
    };
    status: 'active' | 'inactive' | 'failed';
    createdAt: string;
    lastTriggered?: string;
    lastStatus?: 'SUCCESS' | 'FAILED';
    lastResponseCode?: number;
    errorCount: number;
}

/**
 * Represents a retention policy for images.
 * @interface RetentionPolicy
 */
export interface RetentionPolicy {
    id: string;
    name: string;
    description: string;
    priority: number; // Lower number means higher priority
    repositoryFilter: string; // Regex or exact match
    tagFilters: {
        keepTagsMatching?: string; // Regex
        keepTagsNotMatching?: string; // Regex
    };
    rules: {
        keepLastNImages?: number;
        deleteImagesOlderThanDays?: number;
        keepIfDeployed?: boolean; // Don't delete if still deployed
        keepIfCriticalVulnerabilities?: boolean; // Don't delete if critical vulns exist
    }[];
    schedule: string; // e.g., "daily", "weekly", "CRON_EXPRESSION"
    status: 'active' | 'inactive';
    dryRunMode: boolean; // If true, only simulate deletion
    lastRunResult?: string; // Log of what was deleted
    lastRunTimestamp?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    exemptRepositories: string[]; // List of repos explicitly excluded
    notifyOnDeletion: string[]; // Email addresses to notify
}

/**
 * Represents an audit log entry.
 * @interface AuditLogEntry
 */
export interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO date string
    user: string;
    action: string; // e.g., "PUSH_IMAGE", "DELETE_TAG", "UPDATE_POLICY"
    resourceType: 'image' | 'repository' | 'policy' | 'webhook' | 'build_pipeline' | 'user' | 'role';
    resourceId: string;
    details: {
        ipAddress: string;
        userAgent?: string;
        repository?: string;
        tag?: string;
        oldValue?: any;
        newValue?: any;
        reason?: string;
        success: boolean;
        errorMessage?: string;
    }; // Arbitrary details
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    location: string; // e.g., "us-east-1"
}

/**
 * Represents a user or role in the system.
 * @interface UserRole
 */
export interface UserRole {
    id: string;
    name: string;
    type: 'user' | 'role';
    description?: string;
    permissions: {
        scope: 'global' | 'repository' | 'image';
        resource: string; // e.g., "myorg/repo-backend" or "*" for global
        actions: string[]; // e.g., "read", "write", "delete", "pull", "push", "manage_policy"
    }[];
    assignedUsers?: string[]; // For roles, list of user IDs
    email?: string; // For users
    mfaEnabled: boolean;
    lastLogin?: string; // ISO date string
    status: 'active' | 'suspended';
    createdAt: string;
    updatedAt: string;
}

/**
 * Represents an AI insight about an image.
 * @interface ImageAIInsight
 */
export interface ImageAIInsight {
    id: string;
    type: 'OPTIMIZATION_SUGGESTION' | 'SECURITY_RECOMMENDATION' | 'COST_ANALYSIS' | 'COMPLIANCE_CHECK' | 'CONTENT_SUMMARY' | 'PERFORMANCE_TIP';
    summary: string;
    details: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    timestamp: string;
    actionableItems?: {
        description: string;
        recommendationCode?: string; // e.g., optimized Dockerfile snippet
        jiraLink?: string;
        status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
    }[];
    confidenceScore?: number; // 0-1
    modelUsed: string; // e.g., "gemini-pro-1.5"
    tags: string[]; // e.g., "Dockerfile", "CVE", "Cost"
    costSavingsEstimate?: number; // USD/month
    relatedVulnerabilityIds?: string[];
}

/**
 * Represents a global notification.
 * @interface SystemNotification
 */
export interface SystemNotification {
    id: string;
    type: 'alert' | 'info' | 'warning' | 'success';
    message: string;
    timestamp: string;
    read: boolean;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    source: 'Registry Scanner' | 'Build System' | 'User Activity' | 'AI Insights';
    actions?: { label: string; action: string; payload?: any; }[];
    expiryDate?: string; // ISO date string
}

/**
 * Represents aggregated metrics for the registry.
 * @interface RegistryMetrics
 */
export interface RegistryMetrics {
    totalImages: number;
    totalRepositories: number;
    totalStorageGB: number;
    pullsLast24Hours: number;
    pushesLast24Hours: number;
    criticalVulnerabilitiesCount: number;
    highVulnerabilitiesCount: number;
    averageImageSizeMB: number;
    storageUsageBreakdown: {
        repository: string;
        sizeGB: number;
        imageCount: number;
    }[];
    topRepositoriesByPulls: { repository: string; pulls: number }[];
    storageUsageHistoryGB: { timestamp: string; value: number }[]; // For charts (last 30 days)
    pullRateHistoryHourly: { timestamp: string; value: number }[]; // For charts (last 24 hours)
    vulnerabilitySeverityBreakdown: {
        CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number; INFO: number;
    };
    buildSuccessRate: number; // percentage
    deploymentHealthSummary: {
        healthy: number; unhealthy: number; deploying: number;
    };
    geoDistributionPulls: { region: string; count: number; }[];
}


// ====================================================================================================================
// --- Mock Data Generation (To simulate a real backend) ---
// ====================================================================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);
const getRandomDate = (daysAgoMax: number = 30) => new Date(Date.now() - Math.random() * daysAgoMax * 24 * 60 * 60 * 1000).toISOString();
const getRandomSeverity = (): ImageVulnerability['severity'] => {
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    return severities[Math.floor(Math.random() * severities.length)];
};
const getRandomImageStatus = (): ContainerImage['status'] => {
    const statuses = ['active', 'deprecated', 'archived', 'pending_scan'];
    return statuses[Math.floor(Math.random() * statuses.length)];
};
const getRandomDeploymentStatus = (): ImageDeploymentTarget['status'] => {
    const statuses = ['healthy', 'unhealthy', 'deploying', 'pending', 'rolled_back'];
    return statuses[Math.floor(Math.random() * statuses.length)];
};
const getRandomBuildStatus = (): BuildRun['status'] => {
    const statuses = ['SUCCESS', 'FAILED', 'RUNNING', 'PENDING', 'CANCELLED'];
    return statuses[Math.floor(Math.random() * statuses.length)];
};
const generateRandomText = (wordCount: number): string => {
    const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua"];
    return Array.from({ length: wordCount }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
};

const generateVulnerability = (layerId?: string): ImageVulnerability => ({
    id: generateId(),
    cve: `CVE-2023-${Math.floor(1000 + Math.random() * 9000)}`,
    severity: getRandomSeverity(),
    packageName: `lib-${Math.floor(Math.random() * 100)}`,
    version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    fixedVersion: Math.random() > 0.3 ? `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 10)}` : '',
    description: `A ${getRandomSeverity().toLowerCase()} vulnerability found in ${`lib-${Math.floor(Math.random() * 100)}`} affecting versions prior to ${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10) + 1}. ${generateRandomText(20)}`,
    links: ['https://cve.mitre.org/', 'https://nvd.nist.gov/'],
    exploitabilityScore: parseFloat((Math.random() * 10).toFixed(1)),
    cvssScore: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H/E:${Math.random() > 0.5 ? 'F' : 'P'}/RL:X/RC:X`,
    attackVector: Math.random() > 0.7 ? 'NETWORK' : 'LOCAL',
    references: [`https://example.com/vuln-${generateId().substring(0,5)}`],
    exploitCodeMaturity: Math.random() > 0.6 ? 'FUNCTIONAL' : 'PROOF_OF_CONCEPT',
    discoveredDate: getRandomDate(90),
    status: Math.random() > 0.8 ? 'fixed' : (Math.random() > 0.7 ? 'ignored' : 'open'),
    patchAvailable: Math.random() > 0.5,
    remediationGuidance: `Upgrade ${`lib-${Math.floor(Math.random() * 100)}`} to version ${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 10)} or apply official patch.`,
    identifiedLayerId: layerId,
});

const generateLayer = (): ImageLayer => {
    const layerId = `sha256:${generateId()}${generateId()}${generateId()}`;
    return {
        id: layerId,
        size: `${Math.floor(1 + Math.random() * 500)}MB`,
        command: `CMD [\"/bin/sh\", \"-c\", \"${generateRandomText(5)}\"]`,
        digest: `sha256:${generateId()}${generateId()}`,
        created: getRandomDate(60),
        compressedSize: `${Math.floor(1 + Math.random() * 200)}MB`,
        emptyLayer: Math.random() < 0.1,
        packagesInstalled: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
            name: `pkg-${i}-${generateId().substring(0,3)}`,
            version: `${Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 10)}`,
        })),
        filesAdded: Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
            path: `/app/file_${i}.txt`,
            size: `${Math.floor(Math.random() * 10)}KB`,
            permissions: 'rw-r--r--',
        })),
        envVariables: Math.random() > 0.5 ? { PATH: '/usr/local/sbin:/usr/local/bin', LANG: 'C.UTF-8' } : {},
        portsExposed: Math.random() > 0.7 ? [8080, 8443] : [],
        diffId: `sha256:${generateId()}${generateId()}${generateId()}${generateId()}`,
    };
};

const generateDeploymentTarget = (imageRepo: string, imageTag: string): ImageDeploymentTarget => ({
    id: generateId(),
    environment: Math.random() > 0.7 ? 'production' : 'staging',
    cluster: `k8s-${Math.random() > 0.5 ? 'prod' : 'dev'}-${Math.random() > 0.5 ? 'us-east-1' : 'eu-west-1'}`,
    namespace: Math.random() > 0.5 ? 'default' : `app-ns-${generateId().substring(0,3)}`,
    service: `${imageRepo.split('/').pop()}-service-${generateId().substring(0,4)}`,
    currentVersion: imageTag,
    status: getRandomDeploymentStatus(),
    lastUpdated: getRandomDate(7),
    healthChecks: [
        { id: generateId(), type: 'liveness', status: Math.random() > 0.1 ? 'pass' : 'fail', timestamp: getRandomDate(1), lastProbeTime: getRandomDate(1), failureCount: Math.floor(Math.random() * 3) },
        { id: generateId(), type: 'readiness', status: Math.random() > 0.1 ? 'pass' : 'fail', timestamp: getRandomDate(1), lastProbeTime: getRandomDate(1), failureCount: Math.floor(Math.random() * 2) },
    ],
    associatedResources: [
        { type: 'Deployment', name: `${imageRepo.split('/').pop()}-deployment`, status: 'Running' },
        { type: 'Pod', name: `${imageRepo.split('/').pop()}-pod-${generateId().substring(0,5)}`, status: 'Running' },
    ],
    rollbackHistory: Math.random() > 0.6 ? [{
        timestamp: getRandomDate(14),
        previousVersion: `${imageTag.split('.').slice(0, -1).join('.')}.${parseInt(imageTag.split('.').pop() || '0') - 1}`,
        reason: generateRandomText(5),
        triggeredBy: `user-${Math.floor(Math.random() * 5)}`,
    }] : [],
    trafficSplitPercentage: Math.random() > 0.8 ? (Math.random() > 0.5 ? 50 : 10) : 100,
});

const generateImage = (repo: string, tag: string): ContainerImage => {
    const numLayers = Math.floor(Math.random() * 15) + 5;
    const layers = Array.from({ length: numLayers }, generateLayer);

    const numVulnerabilities = Math.floor(Math.random() * 10);
    const vulnerabilities = Array.from({ length: numVulnerabilities }, () => generateVulnerability(layers[Math.floor(Math.random() * layers.length)]?.id));

    const numDeployments = Math.floor(Math.random() * 3);
    const deploymentTargets = Array.from({ length: numDeployments }, () => generateDeploymentTarget(repo, tag));

    const totalSizeMB = Math.floor(100 + Math.random() * 1500);
    const vulnerabilityScore = Math.floor(Math.random() * 100);
    const scanStatus = Math.random() > 0.2 ? 'COMPLETED' : (Math.random() > 0.5 ? 'SCANNING' : 'NOT_SCANNED');

    return {
        id: generateId(),
        repository: repo,
        tag: tag,
        size: `${totalSizeMB}MB`,
        lastPush: getRandomDate(60),
        digest: `sha256:${generateId()}${generateId()}${generateId()}${generateId()}`,
        status: getRandomImageStatus(),
        architecture: Math.random() > 0.8 ? 'arm64' : 'amd64',
        os: 'linux',
        vulnerabilityScore: vulnerabilityScore,
        vulnerabilities: vulnerabilities,
        layers: layers,
        manifest: btoa(JSON.stringify({ config: { image: repo, tag: tag, os: 'linux', arch: 'amd64', exposedPorts: [80, 443] }, layers: layers.map(l => l.digest) }, null, 2)),
        labels: {
            'org.label-schema.schema-version': '1.0',
            'org.label-schema.vcs-ref': generateId().substring(0, 7),
            'org.label-schema.build-date': getRandomDate(90),
            'com.example.project': repo.split('/')[1],
            'com.example.team': Math.random() > 0.5 ? 'backend' : 'frontend',
        },
        baseImage: Math.random() > 0.5 ? 'alpine:3.18' : 'ubuntu:22.04',
        pullCountLast30Days: Math.floor(Math.random() * 5000),
        pullCountTotal: Math.floor(5000 + Math.random() * 20000),
        lastPulled: getRandomDate(30),
        buildId: Math.random() > 0.5 ? generateId() : undefined,
        deploymentTargets: deploymentTargets,
        retentionPolicyApplied: Math.random() > 0.7 ? 'prod-cleanup-policy-1' : undefined,
        costEstimateUSD: parseFloat((Math.random() * 0.5 + 0.1).toFixed(2)),
        aiInsights: [], // Will be populated later
        metadata: {
            creator: `user-${Math.floor(Math.random() * 5)}`,
            source: Math.random() > 0.6 ? 'CI/CD Pipeline' : 'Local Build',
            scanStatus: scanStatus,
            scanLastRun: scanStatus === 'COMPLETED' ? getRandomDate(7) : undefined,
            scanResultsSummary: scanStatus === 'COMPLETED' ? `${vulnerabilities.filter(v => v.status === 'open' && v.severity === 'CRITICAL').length} critical, ${vulnerabilities.filter(v => v.status === 'open' && v.severity === 'HIGH').length} high vulnerabilities.` : undefined,
        },
        storageDetails: {
            location: Math.random() > 0.5 ? 'us-east-1' : 'eu-west-1',
            compressionRatio: `${(1 + Math.random() * 0.5).toFixed(1)}x`,
            storageClass: Math.random() > 0.8 ? 'cold' : 'standard',
        },
        networkAccess: {
            exposedPorts: Math.random() > 0.6 ? [80, 443] : [8080],
            registryPullAccess: Math.random() > 0.5 ? ['private', 'vpc-only'] : ['public'],
            repoExternalAccess: Math.random() > 0.7 ? 'Read-only for org' : undefined,
        },
        securityContext: {
            runAsUser: Math.random() > 0.7 ? '1000' : 'root',
            capabilities: Math.random() > 0.5 ? ['NET_BIND_SERVICE'] : [],
            seccompProfile: Math.random() > 0.5 ? 'default' : 'unconfined',
        },
        dependencyGraph: {
            packages: Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
                name: `dep-pkg-${i}`, version: `${Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 5)}`, license: Math.random() > 0.7 ? 'MIT' : 'GPLv3', vulnerabilities: Math.random() > 0.6 ? [`CVE-${generateId().substring(0,4)}`] : []
            })),
            osDependencies: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
                name: `os-dep-${i}`, version: `${Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 5)}`
            })),
        },
    };
};

const generateBuildPipeline = (index: number): BuildPipeline => ({
    id: generateId(),
    name: `frontend-app-ci-${index}`,
    description: `CI/CD pipeline for frontend application number ${index}. Builds and pushes to registry. ${generateRandomText(15)}`,
    repository: `https://github.com/myorg/frontend-app-${index}.git`,
    branch: 'main',
    dockerfilePath: 'Dockerfile',
    contextPath: './',
    buildArguments: { NODE_ENV: 'production', BUILD_VER: `v1.0.${index}` },
    envVariables: { SECRET_KEY: 'encrypted_value', CI_JOB_ID: generateId().substring(0,8) },
    targetImageName: `myorg/frontend-app-${index}`,
    tags: ['latest', `v1.${index}.0`, `build-${generateId().substring(0,5)}`],
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    lastRunId: generateId(),
    lastRunStatus: Math.random() > 0.3 ? 'SUCCESS' : 'FAILED',
    lastRunStartTime: getRandomDate(7),
    lastRunEndTime: getRandomDate(1),
    createdAt: getRandomDate(90),
    updatedAt: getRandomDate(7),
    webhooksEnabled: Math.random() > 0.5,
    cachingStrategy: Math.random() > 0.7 ? 'LAYER' : 'NOCACHE',
    artifactStorageLocation: `s3://build-artifacts/pipeline-${index}`,
    notificationEmails: Math.random() > 0.6 ? [`dev-team-${index}@example.com`] : [],
    buildStages: [
        { name: 'build-frontend', commands: ['npm install', 'npm run build'] },
        { name: 'build-docker-image', commands: ['docker build -t $TARGET_IMAGE .'] },
        { name: 'push-image', commands: ['docker push $TARGET_IMAGE'] }
    ],
    securityScanningAfterBuild: Math.random() > 0.6,
    automaticDeploymentOnSuccess: Math.random() > 0.7,
});

const generateBuildRun = (pipelineId: string): BuildRun => {
    const status = getRandomBuildStatus();
    const startTime = getRandomDate(7);
    const endTime = status !== 'RUNNING' ? getRandomDate(1) : undefined;
    const durationSeconds = endTime ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000) : undefined;
    const builtImageDigest = status === 'SUCCESS' ? `sha256:${generateId()}${generateId()}` : undefined;
    const numVulns = Math.floor(Math.random() * 15);

    return {
        id: generateId(),
        pipelineId: pipelineId,
        status: status,
        triggeredBy: Math.random() > 0.7 ? 'webhook' : `user-${Math.floor(Math.random() * 5)}`,
        startTime: startTime,
        endTime: endTime,
        durationSeconds: durationSeconds,
        logOutput: `
Fetching repository...
Checking out branch main...
Building image myorg/frontend-app:latest
Step 1/8 : FROM node:18-alpine
 ---> e7b059728
Step 2/8 : WORKDIR /app
 ---> c1a2b3c4d
Step 3/8 : COPY package*.json ./
 ---> d5e6f7g8h
Step 4/8 : RUN npm install --production
 ---> i9j0k1l2m (cached)
Step 5/8 : COPY . .
 ---> m3n4o5p6q
Step 6/8 : RUN npm run build
 ---> q7r8s9t0u
Step 7/8 : EXPOSE 8080
 ---> u1v2w3x4y
Step 8/8 : CMD [\"npm\", \"start\"]
 ---> y5z6a7b8c
Successfully built ${builtImageDigest || 'xxxxx'}
Successfully tagged myorg/frontend-app:latest
Pushing image myorg/frontend-app:latest...
${status === 'SUCCESS' ? 'Push successful.' : (status === 'FAILED' ? 'ERROR: Failed to push image. Network timeout.' : '')}
`,
        logUrl: `https://ci.example.com/logs/${generateId()}`,
        commitHash: generateId().substring(0, 7),
        commitMessage: `Feat: ${generateRandomText(5)} for new feature.`,
        builtImageDigest: builtImageDigest,
        builtImageTags: ['latest', `v1.${Math.floor(Math.random() * 10)}.0`],
        errorMessage: status === 'FAILED' ? `Build failed due to: ${generateRandomText(10)}` : undefined,
        artifacts: Math.random() > 0.6 ? [{ name: 'bundle.zip', size: '10MB', url: `https://artifacts.example.com/${generateId()}/bundle.zip` }] : [],
        buildArgsUsed: { NODE_ENV: 'production' },
        envVarsUsed: { CI_JOB_ID: generateId().substring(0,8) },
        cpuUsagePercent: parseFloat((20 + Math.random() * 80).toFixed(1)),
        memoryUsageMB: Math.floor(100 + Math.random() * 2000),
        scanResultSummary: Math.random() > 0.4 ? {
            status: Math.random() > 0.1 ? 'COMPLETED' : 'FAILED',
            vulnerabilitiesFound: numVulns,
            criticalCount: Math.floor(Math.random() * Math.min(5, numVulns / 2)),
        } : undefined,
    };
};

const generateWebhook = (index: number): RegistryWebhook => ({
    id: generateId(),
    name: `webhook-notify-${index}`,
    url: `https://my-webhook-receiver.com/hook/${index}`,
    events: ['push', 'scan_completed', 'tag_created'],
    secret: '********',
    headers: Math.random() > 0.5 ? { 'X-Custom-Header': 'value', 'Authorization': 'Bearer token_placeholder' } : {},
    retryPolicy: {
        maxAttempts: 3,
        intervalSeconds: 10,
        backoffFactor: 2,
    },
    eventFilters: Math.random() > 0.5 ? { repositoryRegex: `myorg/service-${Math.floor(index/2)}.*`, minSeverity: 'HIGH' } : {},
    status: Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'failed'),
    createdAt: getRandomDate(120),
    lastTriggered: getRandomDate(10),
    lastStatus: Math.random() > 0.1 ? 'SUCCESS' : 'FAILED',
    lastResponseCode: Math.random() > 0.1 ? 200 : (Math.random() > 0.5 ? 500 : 401),
    errorCount: Math.floor(Math.random() * 5),
});

const generateRetentionPolicy = (index: number): RetentionPolicy => ({
    id: generateId(),
    name: `prod-cleanup-policy-${index}`,
    description: `Cleans up old images in production repositories for service ${index}. Ensures critical tags and deployed images are kept. ${generateRandomText(20)}`,
    priority: index,
    repositoryFilter: `myorg/service-${index}.*`,
    tagFilters: {
        keepTagsMatching: 'prod|release.*',
        keepTagsNotMatching: 'temp|dev.*',
    },
    rules: [
        { keepLastNImages: 5 },
        { deleteImagesOlderThanDays: 60, keepIfDeployed: true },
        { keepIfCriticalVulnerabilities: true }
    ],
    schedule: Math.random() > 0.5 ? 'daily' : 'weekly',
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    dryRunMode: Math.random() > 0.8,
    lastRunResult: Math.random() > 0.5 ? `Simulated deletion of ${Math.floor(Math.random() * 10)} images from myorg/service-${index}/backend. Kept 2 images due to deployment.` : 'Policy ran, no images matched deletion criteria.',
    lastRunTimestamp: getRandomDate(7),
    createdAt: getRandomDate(180),
    updatedAt: getRandomDate(10),
    createdBy: `admin-${Math.floor(Math.random() * 3)}`,
    exemptRepositories: Math.random() > 0.7 ? [`myorg/service-${index}-critical`] : [],
    notifyOnDeletion: Math.random() > 0.6 ? [`devops-alerts@example.com`] : [],
});

const generateAuditLogEntry = (): AuditLogEntry => {
    const actionTypes = ['PUSH_IMAGE', 'DELETE_TAG', 'UPDATE_POLICY', 'TRIGGER_BUILD', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'CHANGE_PERMISSION'];
    const resourceTypes = ['image', 'repository', 'policy', 'webhook', 'build_pipeline', 'user', 'role'];
    const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const success = Math.random() > 0.1;

    let details: AuditLogEntry['details'] = {
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)`,
        success: success,
    };

    if (!success) {
        details.errorMessage = `Failed to ${action.toLowerCase().replace('_', ' ')}: ${generateRandomText(5)}`;
    }

    if (resourceType === 'image') {
        details.repository = `myorg/app-${generateId().substring(0,4)}`;
        details.tag = `v1.2.${Math.floor(Math.random() * 10)}`;
    } else if (resourceType === 'policy') {
        details.oldValue = { status: 'inactive' };
        details.newValue = { status: 'active' };
    }

    return {
        id: generateId(),
        timestamp: getRandomDate(30),
        user: `user-${Math.floor(Math.random() * 10)}`,
        action: action,
        resourceType: resourceType,
        resourceId: generateId().substring(0, 8),
        details: details,
        severity: success ? 'INFO' : 'CRITICAL',
        location: Math.random() > 0.5 ? 'us-east-1' : 'eu-west-1',
    };
};

const generateUserRole = (isRole: boolean): UserRole => ({
    id: generateId(),
    name: isRole ? `role-${Math.floor(Math.random() * 5)}` : `user-${Math.floor(Math.random() * 10)}`,
    type: isRole ? 'role' : 'user',
    description: `This ${isRole ? 'role' : 'user'} manages ${generateRandomText(5)} in the registry.`,
    permissions: [
        { scope: 'global', resource: '*', actions: ['read', 'pull'] },
        ...(isRole && Math.random() > 0.5 ? [{ scope: 'repository', resource: `myorg/repo-${Math.floor(Math.random() * 3)}`, actions: ['push', 'delete'] }] : []),
    ],
    assignedUsers: isRole ? Array.from({ length: Math.floor(Math.random() * 3) }, () => `user-${Math.floor(Math.random() * 10)}`) : undefined,
    email: isRole ? undefined : `user${Math.floor(Math.random() * 10)}@example.com`,
    mfaEnabled: Math.random() > 0.5,
    lastLogin: Math.random() > 0.2 ? getRandomDate(7) : undefined,
    status: Math.random() > 0.1 ? 'active' : 'suspended',
    createdAt: getRandomDate(365),
    updatedAt: getRandomDate(30),
});

const generateImageAIInsight = (image: ContainerImage): ImageAIInsight => {
    const types: ImageAIInsight['type'][] = ['OPTIMIZATION_SUGGESTION', 'SECURITY_RECOMMENDATION', 'COST_ANALYSIS', 'COMPLIANCE_CHECK', 'CONTENT_SUMMARY', 'PERFORMANCE_TIP'];
    const type = types[Math.floor(Math.random() * types.length)];
    let summary: string;
    let details: string;
    let severity: ImageAIInsight['severity'] = 'INFO';
    const actionableItems: ImageAIInsight['actionableItems'] = [];
    let recommendationCode: string | undefined;
    let costSavingsEstimate: number | undefined;

    switch (type) {
        case 'OPTIMIZATION_SUGGESTION':
            summary = 'Potential image size reduction identified.';
            details = `Detected unnecessary packages in base image '${image.baseImage}' and opportunities for multi-stage builds. Identified unused build arguments. Analyzing image layers, found redundant files in layer ${image.layers[0]?.id.substring(0,10)}.`;
            severity = 'WARNING';
            actionableItems.push(
                { description: 'Review Dockerfile for multi-stage build opportunities.', status: 'OPEN', jiraLink: 'https://jira.example.com/T123', recommendationCode: `FROM alpine:3.18 as builder\nWORKDIR /app\nCOPY . .\nRUN npm install\nFROM node:18-alpine\nCOPY --from=builder /app/build /app/build` },
                { description: 'Replace `apt install` with specific package versions.', status: 'OPEN' }
            );
            costSavingsEstimate = parseFloat((Math.random() * 5 + 1).toFixed(2)); // 1-6 USD
            break;
        case 'SECURITY_RECOMMENDATION':
            summary = 'Critical base image vulnerability detected.';
            details = `Your base image '${image.baseImage}' contains multiple critical CVEs. Upgrade to a newer secure version. Ensure rootless containers are used. Specifically, CVE-2023-XXXX in package 'openssl' found in layer ${image.layers[Math.floor(Math.random() * image.layers.length)]?.id.substring(0,10)}.`;
            severity = 'CRITICAL';
            actionableItems.push(
                { description: 'Upgrade base image to a secure version.', status: 'OPEN' },
                { description: 'Implement rootless container best practices.', status: 'OPEN' }
            );
            break;
        case 'COST_ANALYSIS':
            summary = 'Image pull costs are high for this repository.';
            details = `Repository ${image.repository} has ${image.pullCountLast30Days} pulls in last 30 days, with average size ${image.size}. Estimated storage cost: $${image.costEstimateUSD}. Consider geo-replication for pull cost optimization if users are global. High traffic observed from 'us-west-2' region.`;
            severity = 'INFO';
            actionableItems.push({ description: 'Consider geo-replication to regions with high pull traffic.', status: 'OPEN' }, { description: 'Review image usage patterns and deprecate unused tags.', status: 'OPEN' });
            costSavingsEstimate = parseFloat((Math.random() * 10 + 5).toFixed(2)); // 5-15 USD
            break;
        case 'COMPLIANCE_CHECK':
            summary = 'Potential license compliance issues in detected packages.';
            details = `Detected GPL-licensed libraries that may conflict with your product's licensing model. Review dependencies: \`lib-gpl-v3.0\`, \`tool-lgpl\`. Identified 'lib-gpl-v3.0' in layer ${image.layers[Math.floor(Math.random() * image.layers.length)]?.id.substring(0,10)}.`;
            severity = 'WARNING';
            actionableItems.push({ description: 'Review dependencies licenses and replace conflicting ones.', status: 'OPEN' }, { description: 'Consult legal team for compliance implications.', status: 'OPEN' });
            break;
        case 'CONTENT_SUMMARY':
            summary = 'AI-generated summary of image content and purpose.';
            details = `This image appears to be a Node.js application running on Alpine Linux (version ${image.baseImage.split(':')[1] || 'unknown'}). Detected \`npm\` for package management and a web server on port 3000. It contains standard development tools but no obvious sensitive files. The entrypoint is 'npm start'.`;
            severity = 'INFO';
            break;
        case 'PERFORMANCE_TIP':
            summary = 'Detected inefficient package installation pattern.';
            details = `Your Dockerfile might be causing unnecessary rebuilds of layers due to ` +
                      `installing packages (` + image.layers[Math.floor(Math.random() * image.layers.length)]?.command + `) before ` +
                      `copying application code. Consider moving application code copy to a later stage if dependencies are stable.`;
            severity = 'INFO';
            actionableItems.push(
                { description: 'Reorder Dockerfile commands to leverage build cache effectively.', status: 'OPEN', recommendationCode: `COPY package*.json ./\nRUN npm install\nCOPY . .` },
            );
            break;
    }

    return {
        id: generateId(),
        type,
        summary,
        details,
        severity,
        timestamp: getRandomDate(14),
        actionableItems: actionableItems.length > 0 ? actionableItems : undefined,
        confidenceScore: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
        modelUsed: 'gemini-pro-1.5',
        tags: [type.split('_')[0], image.repository.split('/')[1]],
        costSavingsEstimate,
        relatedVulnerabilityIds: type === 'SECURITY_RECOMMENDATION' && image.vulnerabilities.length > 0
            ? [image.vulnerabilities[Math.floor(Math.random() * image.vulnerabilities.length)].id]
            : undefined,
    };
};

const generateMetrics = (): RegistryMetrics => {
    const totalImages = Math.floor(100 + Math.random() * 1000);
    const totalRepositories = Math.floor(10 + Math.random() * 100);
    const totalStorageGB = parseFloat((Math.random() * 2000).toFixed(2));
    const pullsLast24Hours = Math.floor(1000 + Math.random() * 20000);
    const pushesLast24Hours = Math.floor(50 + Math.random() * 1000);
    const criticalVulnerabilitiesCount = Math.floor(Math.random() * 30);
    const highVulnerabilitiesCount = Math.floor(Math.random() * 50);
    const averageImageSizeMB = parseFloat((50 + Math.random() * 700).toFixed(2));

    const storageUsageHistoryGB = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: parseFloat((totalStorageGB * (0.8 + Math.random() * 0.2)).toFixed(2)),
    }));
    const pullRateHistoryHourly = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        value: Math.floor(pullsLast24Hours / 24 * (0.5 + Math.random() * 1.5)),
    }));

    const vulnerabilitySeverityBreakdown = {
        CRITICAL: Math.floor(Math.random() * 30),
        HIGH: Math.floor(Math.random() * 50),
        MEDIUM: Math.floor(Math.random() * 100),
        LOW: Math.floor(Math.random() * 150),
        INFO: Math.floor(Math.random() * 200),
    };

    const deploymentHealthy = Math.floor(Math.random() * 50) + 10;
    const deploymentUnhealthy = Math.floor(Math.random() * 5);
    const deploymentDeploying = Math.floor(Math.random() * 8);

    return {
        totalImages,
        totalRepositories,
        totalStorageGB,
        pullsLast24Hours,
        pushesLast24Hours,
        criticalVulnerabilitiesCount,
        highVulnerabilitiesCount,
        averageImageSizeMB,
        storageUsageBreakdown: Array.from({ length: 5 }, (_, i) => ({
            repository: `myorg/repo-${i}`,
            sizeGB: parseFloat((Math.random() * totalStorageGB / 5).toFixed(2)),
            imageCount: Math.floor(Math.random() * totalImages / 5),
        })).sort((a, b) => b.sizeGB - a.sizeGB),
        topRepositoriesByPulls: Array.from({ length: 5 }, (_, i) => ({
            repository: `myorg/repo-${i}`,
            pulls: Math.floor(Math.random() * 5000),
        })).sort((a, b) => b.pulls - a.pulls),
        storageUsageHistoryGB,
        pullRateHistoryHourly,
        vulnerabilitySeverityBreakdown,
        buildSuccessRate: parseFloat((70 + Math.random() * 30).toFixed(2)),
        deploymentHealthSummary: {
            healthy: deploymentHealthy,
            unhealthy: deploymentUnhealthy,
            deploying: deploymentDeploying,
        },
        geoDistributionPulls: [
            { region: 'us-east-1', count: Math.floor(pullsLast24Hours * 0.4) },
            { region: 'eu-west-1', count: Math.floor(pullsLast24Hours * 0.3) },
            { region: 'ap-southeast-2', count: Math.floor(pullsLast24Hours * 0.2) },
            { region: 'us-west-2', count: Math.floor(pullsLast24Hours * 0.1) },
        ],
    };
};

const MOCK_DATA = {
    images: Array.from({ length: 150 }, (_, i) => generateImage(`myorg/app-service-${Math.floor(i / 15)}`, `v1.0.${i % 15}`)),
    buildPipelines: Array.from({ length: 20 }, (_, i) => generateBuildPipeline(i)),
    webhooks: Array.from({ length: 10 }, (_, i) => generateWebhook(i)),
    retentionPolicies: Array.from({ length: 10 }, (_, i) => generateRetentionPolicy(i)),
    auditLogs: Array.from({ length: 500 }, generateAuditLogEntry).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    userRoles: Array.from({ length: 10 }, (_, i) => generateUserRole(true)).concat(Array.from({ length: 20 }, (_, i) => generateUserRole(false))),
    notifications: Array.from({ length: 20 }, (_, i) => ({
        id: generateId(),
        type: i % 4 === 0 ? 'alert' : (i % 4 === 1 ? 'warning' : (i % 4 === 2 ? 'info' : 'success')),
        message: i % 4 === 0 ? 'Critical vulnerability detected in `myorg/app-backend:latest`!' : (i % 4 === 1 ? 'Retention policy `prod-cleanup-policy-1` failed to run.' : (i % 4 === 2 ? 'New image `myorg/frontend-app:v2.0.0` pushed.' : 'Build pipeline `frontend-app-ci-1` completed successfully.')),
        timestamp: getRandomDate(14),
        read: i % 2 === 0,
        priority: Math.random() > 0.7 ? 'HIGH' : (Math.random() > 0.5 ? 'MEDIUM' : 'LOW'),
        source: ['Registry Scanner', 'Build System', 'User Activity', 'AI Insights'][Math.floor(Math.random() * 4)],
        actions: Math.random() > 0.6 ? [{ label: 'View Image', action: 'view_image', payload: { imageId: MOCK_DATA.images[0]?.id } }] : [],
        expiryDate: Math.random() > 0.8 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    metrics: generateMetrics(),
};

// Populate build runs for pipelines and AI insights for images after initial generation
MOCK_DATA.buildPipelines.forEach(bp => {
    (bp as any).buildRuns = Array.from({ length: Math.floor(Math.random() * 10) + 3 }, () => generateBuildRun(bp.id));
});
MOCK_DATA.images.forEach(img => {
    (img as any).aiInsights = Array.from({ length: Math.floor(Math.random() * 5) }, () => generateImageAIInsight(img));
});

/**
 * Simulates an API call with a delay.
 * @template T
 * @param {T} data - The data to return.
 * @param {number} [delay=500] - The delay in milliseconds.
 * @returns {Promise<T>} A promise that resolves with the data after the delay.
 */
const simulateApiCall = <T,>(data: T, delay: number = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};


// ====================================================================================================================
// --- Utility Functions & Helper Components ---
// ====================================================================================================================

/**
 * Formats a date string into a human-readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
};

/**
 * Formats a duration in seconds into a human-readable string.
 * @param {number | undefined} seconds - The duration in seconds.
 * @returns {string} The formatted duration string.
 */
export const formatDuration = (seconds: number | undefined): string => {
    if (seconds === undefined || isNaN(seconds)) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
};

/**
 * A generic loading spinner component.
 * @returns {JSX.Element}
 */
export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500" />
        <span className="ml-2 text-gray-400">Loading...</span>
    </div>
);

/**
 * A simple modal component.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {() => void} props.onClose - Function to call when modal is closed.
 * @param {React.ReactNode} props.children - Modal content.
 * @param {string} [props.title] - Modal title.
 * @param {string} [props.maxWidthClass='max-w-xl'] - Tailwind class for max-width.
 * @param {boolean} [props.disableOverlayClose=false] - If true, clicking overlay does not close modal.
 * @returns {JSX.Element | null}
 */
export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    maxWidthClass?: string;
    disableOverlayClose?: boolean;
}> = ({ isOpen, onClose, children, title, maxWidthClass = 'max-w-xl', disableOverlayClose = false }) => {
    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (!disableOverlayClose) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" onClick={handleOverlayClick}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl w-full ${maxWidthClass}`} onClick={e => e.stopPropagation()}>
                {title && (
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                )}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * A customizable button component.
 * @param {object} props
 * @param {string} props.children - Button text or content.
 * @param {() => void} props.onClick - Click handler.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {string} [props.className] - Additional Tailwind classes.
 * @param {('primary'|'secondary'|'danger'|'outline')} [props.variant='primary'] - Button style variant.
 * @returns {JSX.Element}
 */
export const Button: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}> = ({ children, onClick, disabled = false, className = '', variant = 'primary' }) => {
    let baseStyles = "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ";
    switch (variant) {
        case 'primary':
            baseStyles += "bg-cyan-600 hover:bg-cyan-700 text-white";
            break;
        case 'secondary':
            baseStyles += "bg-gray-700 hover:bg-gray-600 text-white";
            break;
        case 'danger':
            baseStyles += "bg-red-600 hover:bg-red-700 text-white";
            break;
        case 'outline':
            baseStyles += "border border-gray-600 text-gray-300 hover:bg-gray-700";
            break;
    }
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

/**
 * A basic text input component.
 * @param {object} props
 * @param {string} props.label - Input label.
 * @param {string} props.value - Input value.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Change handler.
 * @param {string} [props.type='text'] - Input type.
 * @param {string} [props.placeholder] - Input placeholder.
 * @param {string} [props.className] - Additional Tailwind classes.
 * @param {boolean} [props.readOnly=false] - Whether the input is read-only.
 * @param {string} [props.name] - Name attribute for the input.
 * @returns {JSX.Element}
 */
export const TextInput: React.FC<{
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
    name?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, className = '', readOnly = false, name }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-gray-300 text-sm">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            name={name}
            className={`w-full bg-gray-900/50 p-2 rounded text-sm text-white border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 ${readOnly ? 'opacity-70' : ''} ${className}`}
        />
    </div>
);

/**
 * A basic textarea component.
 * @param {object} props
 * @param {string} props.label - Textarea label.
 * @param {string} props.value - Textarea value.
 * @param {(e: React.ChangeEvent<HTMLTextAreaElement>) => void} props.onChange - Change handler.
 * @param {string} [props.placeholder] - Textarea placeholder.
 * @param {string} [props.className] - Additional Tailwind classes.
 * @param {boolean} [props.readOnly=false] - Whether the textarea is read-only.
 * @param {number} [props.rows=5] - Number of rows.
 * @param {string} [props.name] - Name attribute for the textarea.
 * @returns {JSX.Element}
 */
export const TextareaInput: React.FC<{
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
    rows?: number;
    name?: string;
}> = ({ label, value, onChange, placeholder, className = '', readOnly = false, rows = 5, name }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-gray-300 text-sm">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            rows={rows}
            name={name}
            className={`w-full bg-gray-900/50 p-2 rounded font-mono text-sm text-white border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 ${readOnly ? 'opacity-70' : ''} ${className}`}
        />
    </div>
);

/**
 * A checkbox component.
 * @param {object} props
 * @param {string} props.label - Checkbox label.
 * @param {boolean} props.checked - Whether the checkbox is checked.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Change handler.
 * @param {string} [props.className] - Additional Tailwind classes.
 * @param {string} [props.value] - Value attribute for the checkbox.
 * @param {string} [props.name] - Name attribute for the checkbox.
 * @returns {JSX.Element}
 */
export const CheckboxInput: React.FC<{
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    value?: string;
    name?: string;
}> = ({ label, checked, onChange, className = '', value, name }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            value={value}
            name={name}
            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
        />
        <label className="text-gray-300 text-sm">{label}</label>
    </div>
);

/**
 * A select/dropdown component.
 * @param {object} props
 * @param {string} props.label - Select label.
 * @param {string} props.value - Selected value.
 * @param {(e: React.ChangeEvent<HTMLSelectElement>) => void} props.onChange - Change handler.
 * @param {{value: string; label: string;}[]} props.options - Array of options.
 * @param {string} [props.className] - Additional Tailwind classes.
 * @param {string} [props.name] - Name attribute for the select.
 * @returns {JSX.Element}
 */
export const SelectInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string; }[];
    className?: string;
    name?: string;
}> = ({ label, value, onChange, options, className = '', name }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-gray-300 text-sm">{label}</label>
        <select
            value={value}
            onChange={onChange}
            name={name}
            className={`w-full bg-gray-900/50 p-2 rounded text-sm text-white border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 ${className}`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

/**
 * A Badge component for status or labels.
 * @param {object} props
 * @param {string} props.children - Badge content.
 * @param {('info'|'success'|'warning'|'danger'|'default')} [props.type='default'] - Badge color type.
 * @param {string} [props.className] - Additional Tailwind classes.
 * @returns {JSX.Element}
 */
export const Badge: React.FC<{ children: React.ReactNode; type?: 'info' | 'success' | 'warning' | 'danger' | 'default'; className?: string }> = ({ children, type = 'default', className = '' }) => {
    let colorClass = "bg-gray-600 text-gray-200";
    switch (type) {
        case 'info': colorClass = "bg-blue-600 text-blue-100"; break;
        case 'success': colorClass = "bg-green-600 text-green-100"; break;
        case 'warning': colorClass = "bg-yellow-600 text-yellow-100"; break;
        case 'danger': colorClass = "bg-red-600 text-red-100"; break;
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
            {children}
        </span>
    );
};

/**
 * Component to display a simple icon.
 * (Placeholder for actual icon library usage to avoid large imports for this exercise).
 * @param {object} props
 * @param {string} props.iconName - Name of the icon (e.g., 'shield', 'rocket', 'plus').
 * @param {string} [props.tooltip] - Text for the tooltip.
 * @param {string} [props.className] - Additional classes for the icon.
 * @returns {JSX.Element}
 */
export const Icon: React.FC<{ iconName: string; tooltip?: string; className?: string }> = ({ iconName, tooltip, className }) => {
    const getIconSvg = (name: string) => {
        switch (name.toLowerCase()) {
            case 'shield': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2.5a.5.5 0 01.5.5v4a.5.5 0 01-1 0V3a.5.5 0 01.5-.5zM5.5 8.5a.5.5 0 010-1h9a.5.5 0 010 1h-9zM15.5 10.5a.5.5 0 000-1h-11a.5.5 0 000 1h11zM10 12.5a.5.5 0 000-1h-5a.5.5 0 000 1h5zM4 14.5a.5.5 0 010-1h12a.5.5 0 010 1H4z" clipRule="evenodd"></path></svg>;
            case 'rocket': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11.666 1.334a.667.667 0 00-1.332 0l-1.333 1.333a.667.667 0 00.943.943l.722-.722v2.716l-2.062 2.063a.667.667 0 00-.063.882l.854.854a.667.667 0 00.882-.063L11.5 6.444v2.716l2.063 2.063a.667.667 0 00.882-.063l.854-.854a.667.667 0 00-.063-.882L12.444 6.444V3.728l.722.722a.667.667 0 00.943-.943l-1.333-1.333zM7.333 12.333a.667.667 0 000 1.334h5.334a.667.667 0 000-1.334H7.333zM6.666 14.666a.667.667 0 000 1.334h6.668a.667.667 0 000-1.334H6.666zM6 17a.667.667 0 000 1.334h8a.667.667 0 000-1.334H6z"></path></svg>;
            case 'cogs': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M11.493 3.504a1 1 0 01-.194.275l-2 2a1 1 0 01-1.414-1.414l2-2a1 1 0 011.414 1.414zM16 10a6 6 0 11-12 0 6 6 0 0112 0zm-5 0a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 01-1-1v-2a1 1 0 012 0v2a1 1 0 01-1 1zm4 0a1 1 0 01-1-1v-2a1 1 0 012 0v2a1 1 0 01-1 1zm-2-6a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>;
            case 'sync': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v2.586a1 1 0 00.293.707l.5.5a1 1 0 001.414 0l.5-.5A1 1 0 005.707 6.586L6 6.293V4a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1h-2.293l-.5.5a1 1 0 000 1.414l.5.5a1 1 0 00.707.293H18a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h1a1 1 0 011 1v1.586l-.293.293a.5.5 0 01-.707 0L4 7.293V4zM2 14.5a2.5 2.5 0 012.5-2.5h11a.5.5 0 010 1h-11A1.5 1.5 0 003 14.5v1a.5.5 0 01-1 0v-1z" clipRule="evenodd"></path></svg>;
            case 'trash': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd"></path></svg>;
            case 'plus': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>;
            case 'edit': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>;
            case 'eye': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>;
            case 'question': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5L6.67 11.01a1 1 0 101.732 1L9 10.428V14a1 1 0 102 0v-3.572l.598.604a.5.5 0 00.707 0 .5.5 0 000-.707L10.867 7.5A1 1 0 0010 7zM9 15a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd"></path></svg>;
            case 'docker': return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6V4l3-3V1h4l-3 3v3l7-7H6