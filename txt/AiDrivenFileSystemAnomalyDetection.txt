// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback, createContext, useContext, useReducer, useRef } from 'react';
import { ShieldCheckIcon } from '../icons';

// --- Aethelgard Core Data Models & Interfaces (Lumina Core, Chronos Engine Foundations) ---

/**
 * @typedef {number} Timestamp Epoch milliseconds.
 */
export type Timestamp = number;

/**
 * Represents different types of file system operations.
 * Polymorphic Data Abstraction from Lumina Core.
 */
export enum FileSystemEventType {
    FileRead = 'FILE_READ',
    FileWrite = 'FILE_WRITE',
    FileCreate = 'FILE_CREATE',
    FileDelete = 'FILE_DELETE',
    FileRename = 'FILE_RENAME',
    FileExecute = 'FILE_EXECUTE',
    DirectoryCreate = 'DIRECTORY_CREATE',
    DirectoryDelete = 'DIRECTORY_DELETE',
    PermissionChange = 'PERMISSION_CHANGE',
    AttributeChange = 'ATTRIBUTE_CHANGE',
    MetadataRead = 'METADATA_READ',
    NetworkAccess = 'NETWORK_ACCESS', // e.g., file accessed over network share
    ProcessSpawn = 'PROCESS_SPAWN', // A process initiated by a file execution
    MemoryAccess = 'MEMORY_ACCESS', // Related to file content in memory
}

/**
 * Represents the actor performing a file system event.
 */
export interface FileSystemActor {
    userId: string;
    userName: string;
    processId: string;
    processName: string;
    applicationName?: string;
    ipAddress?: string; // For network-related events
}

/**
 * Represents a single file system event.
 * Basis for Adaptive Relational Graphing and Chronos Engine analysis.
 */
export interface FileSystemEvent {
    id: string;
    timestamp: Timestamp;
    eventType: FileSystemEventType;
    path: string; // The primary file/directory path involved
    targetPath?: string; // For rename operations
    actor: FileSystemActor;
    size?: number; // Size of file written/read/created
    hash?: string; // Hash of file content (e.g., MD5, SHA256) for integrity checks
    permissions?: string; // New permissions after change
    metadata?: Record<string, any>; // Additional event-specific metadata
    contextId?: string; // Link to a broader operational context (e.g., deployment ID)
}

/**
 * Severity levels for detected anomalies.
 */
export enum AnomalySeverity {
    Informational = 'INFORMATIONAL',
    Low = 'LOW',
    Medium = 'MEDIUM',
    High = 'HIGH',
    Critical = 'CRITICAL',
}

/**
 * Categories of anomalies for easier classification and response.
 */
export enum AnomalyCategory {
    Ransomware = 'RANSOMWARE',
    DataExfiltration = 'DATA_EXFILTRATION',
    InsiderThreat = 'INSIDER_THREAT',
    MalwareExecution = 'MALWARE_EXECUTION',
    SystemMisconfiguration = 'SYSTEM_MISCONFIGURATION',
    PerformanceDegradation = 'PERFORMANCE_DEGRADATION',
    PolicyViolation = 'POLICY_VIOLATION',
    SuspiciousActivity = 'SUSPICIOUS_ACTIVITY',
    UnauthorizedAccess = 'UNAUTHORIZED_ACCESS',
    UnexpectedSoftwareBehavior = 'UNEXPECTED_SOFTWARE_BEHAVIOR',
}

/**
 * Defines a specific anomaly alert.
 * The output of Probabilistic Inference Engines.
 */
export interface AnomalyAlert {
    alertId: string;
    timestamp: Timestamp;
    severity: AnomalySeverity;
    category: AnomalyCategory;
    title: string;
    description: string;
    detectedBy: string; // Which Aethelgard Oracle/Engine detected it
    relatedEvents: FileSystemEvent[]; // Correlated raw events
    suggestedActions: string[]; // Ethos Layer informed recommendations
    confidenceScore: number; // Lumina Core Meta-Cognitive Reflexivity
    status: 'new' | 'investigating' | 'resolved' | 'false_positive';
    acknowledgedBy?: string;
    acknowledgedAt?: Timestamp;
    feedback?: string; // Human-centric feedback
}

/**
 * Operational metrics for a detection engine.
 */
export interface DetectionEngineMetrics {
    engineName: string;
    eventsProcessedPerSecond: number;
    anomaliesDetectedLastHour: number;
    falsePositiveRate: number; // From Human-Centric Feedback Loops
    truePositiveRate: number;
    modelVersion: string;
    lastUpdated: Timestamp;
    status: 'running' | 'paused' | 'error' | 'learning';
}

/**
 * Overall system health status.
 */
export interface SystemHealthStatus {
    overallStatus: 'healthy' | 'degraded' | 'critical';
    message: string;
    componentStatuses: { [key: string]: 'healthy' | 'degraded' | 'critical' };
    lastCheck: Timestamp;
}

/**
 * Represents a baseline profile for normal file system behavior.
 * Part of Lumina Core's internal models, refined by Chronos Engine.
 */
export interface BehavioralBaseline {
    profileId: string;
    scope: 'user' | 'process' | 'path' | 'system';
    identifier: string; // e.g., userId, processName, '/Documents'
    eventCountsPerHour: { [eventType: string]: { mean: number; stdDev: number } };
    typicalFileSizes: { mean: number; stdDev: number };
    typicalFileTypes: { [fileExtension: string]: number }; // Probability distribution
    knownNetworkEndpoints: string[];
    establishedProcesses: string[]; // Processes typically run by this user/in this path
    lastUpdated: Timestamp;
    status: 'learning' | 'active' | 'outdated';
}

/**
 * A rule for deterministic anomaly detection (can be integrated with probabilistic inference).
 * Managed via the Ethos Layer for policy enforcement.
 */
export interface AnomalyDetectionRule {
    ruleId: string;
    name: string;
    description: string;
    priority: AnomalySeverity;
    category: AnomalyCategory;
    definition: string; // e.g., a query language expression, or pseudo-code
    enabled: boolean;
    createdBy: string;
    createdAt: Timestamp;
    lastModifiedBy: string;
    lastModifiedAt: Timestamp;
    actionTemplate?: string[]; // Default actions for this rule
}

/**
 * Represents a simulated response action.
 * Informed by the Ethos Layer's Constraint-Based Decision Frameworks.
 */
export enum AnomalyActionType {
    QuarantineProcess = 'QUARANTINE_PROCESS',
    BlockIP = 'BLOCK_IP',
    IsolateUser = 'ISOLATE_USER',
    InitiateScan = 'INITIATE_SCAN',
    SendNotification = 'SEND_NOTIFICATION',
    RevokePermissions = 'REVOKE_PERMISSIONS',
    RollbackFiles = 'ROLLBACK_FILES', // Chronos Engine's Counterfactual Exploration support
    CreateForensicSnapshot = 'CREATE_FORENSIC_SNAPSHOT',
}

export interface AnomalyAction {
    actionId: string;
    alertId: string;
    type: AnomalyActionType;
    parameters: Record<string, any>;
    initiatedBy: 'system' | 'human';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    timestamp: Timestamp;
    justification?: string;
    auditLogLink?: string; // Transparency and Auditability
}

// --- Aethelgard Architectural Pillars (Conceptual Services) ---

/**
 * Simulates the Lumina Core for understanding and contextualizing file system data.
 * Polymorphic Data Abstraction, Adaptive Relational Graphing, Probabilistic Inference.
 */
export class LuminaCoreService {
    private knowledgeGraph: Map<string, any> = new Map(); // Represents a simplified knowledge graph
    private ontologies: Map<string, any> = new Map();

    constructor() {
        console.log("Lumina Core: Initializing semantic fabric and contextual awareness.");
        // Initialize with some basic ontologies or known entities
        this.ontologies.set('fileExtensions', { '.exe': 'executable', '.doc': 'document', '.jpg': 'image' });
        this.ontologies.set('systemPaths', { '/Windows': 'systemDir', '/Users': 'userDir' });
    }

    /**
     * Ingests and normalizes raw event data into a semantic representation.
     * @param event The raw file system event.
     * @returns A semantically enriched event.
     */
    public async processEvent(event: FileSystemEvent): Promise<FileSystemEvent> {
        // Simulate polymorphic data abstraction: parse and enrich
        const enrichedEvent = { ...event };

        // Example: Add file type context
        const extMatch = event.path.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
        if (extMatch && extMatch[1]) {
            const fileType = this.ontologies.get('fileExtensions')[`.${extMatch[1].toLowerCase()}`] || 'unknown';
            enrichedEvent.metadata = { ...enrichedEvent.metadata, fileType };
        }

        // Example: Check if path is a known system directory
        if (Object.keys(this.ontologies.get('systemPaths')).some(p => event.path.startsWith(p))) {
            enrichedEvent.metadata = { ...enrichedEvent.metadata, isSystemPath: true };
        }

        // Update adaptive relational graph (mock for brevity)
        this.knowledgeGraph.set(event.id, enrichedEvent);
        return enrichedEvent;
    }

    /**
     * Performs probabilistic inference on a set of events.
     * @param events A list of events.
     * @returns A confidence score based on learned patterns.
     */
    public async inferPlausibility(events: FileSystemEvent[]): Promise<{ score: number; explanation: string }> {
        // Simplified inference: look for sequential anomalies or known bad patterns
        let score = 0.5; // Default neutral score
        let explanation = "No strong inference found.";

        if (events.length > 1) {
            const firstEvent = events[0];
            const lastEvent = events[events.length - 1];

            // Example: High write activity followed by network access
            if (firstEvent.eventType === FileSystemEventType.FileWrite && lastEvent.eventType === FileSystemEventType.NetworkAccess) {
                score += 0.2; // Increase score for suspicious sequence
                explanation = "Suspicious sequence: file write followed by network access.";
            }

            // Example: Rapid multiple file operations by a new process
            const uniqueProcessNames = new Set(events.map(e => e.actor.processName));
            if (uniqueProcessNames.size === 1 && events.length > 5 && Math.random() < 0.3) { // Simulate 'new process'
                score += 0.1;
                explanation = "High activity from a single, potentially new process.";
            }
        }
        return { score: Math.min(1, score), explanation }; // Ensure score is <= 1
    }

    /**
     * Simulates meta-cognitive reflexivity, identifying gaps in understanding.
     * @param query The query or observed pattern.
     * @returns True if understanding is nascent, false otherwise.
     */
    public hasKnowledgeGap(query: string): boolean {
        // Simplified: if the query contains a new keyword or an unknown entity
        return !this.knowledgeGraph.has(query) && Math.random() < 0.1;
    }
}

/**
 * Simulates the Chronos Engine for temporal reasoning and predictive analysis.
 * Multi-Scale Temporal Analysis, Causal Chain Mapping, Dynamic Simulation, Anomaly Detection and Event Horizon Forecasting.
 */
export class ChronosEngineService {
    private historicalEvents: FileSystemEvent[] = [];
    private baselines: Map<string, BehavioralBaseline> = new Map();

    constructor() {
        console.log("Chronos Engine: Initializing temporal reasoning and predictive synthesis.");
    }

    /**
     * Records an event for historical analysis.
     * @param event The file system event.
     */
    public recordEvent(event: FileSystemEvent) {
        this.historicalEvents.push(event);
        // Trim historical events to a certain size or age to prevent memory issues
        if (this.historicalEvents.length > 10000) {
            this.historicalEvents.splice(0, 1000);
        }
    }

    /**
     * Learns or updates behavioral baselines.
     * @param event The event to use for learning.
     */
    public learnBaseline(event: FileSystemEvent) {
        const key = `${event.actor.userId}:${event.actor.processName}:${event.eventType}`;
        let baseline = this.baselines.get(key);

        if (!baseline) {
            baseline = {
                profileId: `baseline-${key}`,
                scope: 'system', // Simplified scope
                identifier: key,
                eventCountsPerHour: {},
                typicalFileSizes: { mean: 0, stdDev: 0 },
                typicalFileTypes: {},
                knownNetworkEndpoints: [],
                establishedProcesses: [],
                lastUpdated: Date.now(),
                status: 'learning',
            };
        }

        // Simulate incremental learning for event counts (simplified)
        const eventTypeCount = baseline.eventCountsPerHour[event.eventType] || { mean: 0, stdDev: 0 };
        eventTypeCount.mean = (eventTypeCount.mean * 0.9 + 1 * 0.1); // Simple moving average
        baseline.eventCountsPerHour[event.eventType] = eventTypeCount;

        baseline.lastUpdated = Date.now();
        baseline.status = 'active';
        this.baselines.set(key, baseline);
    }

    /**
     * Detects anomalies based on temporal patterns and learned baselines.
     * @param recentEvents Recent events to analyze.
     * @returns Detected anomalies.
     */
    public detectTemporalAnomalies(recentEvents: FileSystemEvent[]): AnomalyAlert[] {
        const anomalies: AnomalyAlert[] = [];
        if (recentEvents.length === 0) return anomalies;

        const latestEvent = recentEvents[recentEvents.length - 1];
        const key = `${latestEvent.actor.userId}:${latestEvent.actor.processName}:${latestEvent.eventType}`;
        const baseline = this.baselines.get(key);

        if (baseline) {
            const eventTypeStats = baseline.eventCountsPerHour[latestEvent.eventType];
            if (eventTypeStats && eventTypeStats.mean > 0 && Math.random() < 0.05) { // Simulate anomaly if current rate is too high compared to baseline
                anomalies.push({
                    alertId: `chrono-anomaly-${Date.now()}-${Math.random()}`,
                    timestamp: latestEvent.timestamp,
                    severity: AnomalySeverity.Low,
                    category: AnomalyCategory.UnexpectedSoftwareBehavior,
                    title: `Unusual ${latestEvent.eventType} rate for ${latestEvent.actor.processName}`,
                    description: `Process ${latestEvent.actor.processName} performing ${latestEvent.eventType} at a rate higher than its learned baseline.`,
                    detectedBy: 'Chronos Engine',
                    relatedEvents: [latestEvent],
                    suggestedActions: ['Monitor process activity', 'Review baseline'],
                    confidenceScore: 0.6,
                    status: 'new',
                });
            }
        }

        // Simulate ransomware detection pattern: high volume of file writes/encrypts
        const recentWrites = recentEvents.filter(e => e.eventType === FileSystemEventType.FileWrite && e.timestamp > Date.now() - 5000); // Last 5 seconds
        if (recentWrites.length > 10) { // e.g., 10 writes in 5 seconds
            anomalies.push({
                alertId: `ransomware-pattern-${Date.now()}-${Math.random()}`,
                timestamp: latestEvent.timestamp,
                severity: AnomalySeverity.Critical,
                category: AnomalyCategory.Ransomware,
                title: 'High Volume File Write Activity - Potential Ransomware!',
                description: `Detected ${recentWrites.length} file write operations in a very short period (5 seconds). This pattern is highly indicative of ransomware.`,
                detectedBy: 'Chronos Engine: Anomaly Detection',
                relatedEvents: recentWrites,
                suggestedActions: [
                    AnomalyActionType.QuarantineProcess,
                    AnomalyActionType.IsolateUser,
                    AnomalyActionType.CreateForensicSnapshot,
                    AnomalyActionType.SendNotification,
                ],
                confidenceScore: 0.95,
                status: 'new',
            });
        }

        return anomalies;
    }

    /**
     * Simulates Event Horizon Forecasting.
     * Predicts potential future states based on current anomalies.
     * @param alert The anomaly alert to forecast from.
     * @returns A list of potential future scenarios.
     */
    public forecastEventHorizon(alert: AnomalyAlert): string[] {
        const forecasts: string[] = [];
        if (alert.category === AnomalyCategory.Ransomware) {
            forecasts.push("High probability of data encryption spreading to network shares.");
            forecasts.push("Potential for critical system files to be targeted next.");
            forecasts.push("Data exfiltration attempt might follow successful encryption.");
        } else if (alert.category === AnomalyCategory.DataExfiltration) {
            forecasts.push("Continued data transfer to external/unauthorized endpoints.");
            forecasts.push("Deletion of original data to cover tracks.");
        }
        return forecasts;
    }

    /**
     * Simulates Historical Recapitulation and Counterfactual Exploration.
     * @param alert The anomaly alert for which to explore counterfactuals.
     * @returns Potential outcomes if different actions were taken.
     */
    public exploreCounterfactuals(alert: AnomalyAlert): string[] {
        const counterfactuals: string[] = [];
        if (alert.category === AnomalyCategory.Ransomware) {
            counterfactuals.push("If process was quarantined 30 seconds earlier: 80% fewer files would be encrypted.");
            counterfactuals.push("If user permissions were revoked: Ransomware spread would be contained to local system.");
        }
        return counterfactuals;
    }
}

/**
 * Simulates the Ethos Layer for ethical alignment and decision frameworks.
 * Constraint-Based Decision Frameworks, Transparency and Auditability, Bias Detection, Human-Centric Feedback Loops.
 */
export class EthosLayerService {
    private ethicalGuidelines: string[] = [
        "Prioritize human safety and well-being.",
        "Ensure data privacy and confidentiality.",
        "Maintain system integrity and availability.",
        "Avoid algorithmic bias in detection and response.",
        "Provide clear audit trails for all decisions and actions.",
        "Always allow for human oversight and veto.",
    ];
    private auditLogs: AnomalyAction[] = [];

    constructor() {
        console.log("Ethos Layer: Initializing ethical guidelines and transparency protocols.");
    }

    /**
     * Filters and prioritizes suggested actions based on ethical guidelines.
     * @param initialActions Actions suggested by detection engines.
     * @param context Additional context for ethical evaluation.
     * @returns Ethically reviewed and prioritized actions.
     */
    public reviewActionsEthically(initialActions: AnomalyActionType[], context: AnomalyAlert): AnomalyActionType[] {
        // Simplified ethical filtering: e.g., never automatically `RollbackFiles` without human approval if data loss risk is high.
        const filteredActions = initialActions.filter(action => {
            if (action === AnomalyActionType.RollbackFiles && context.severity === AnomalySeverity.Critical) {
                // High risk action, requires human confirmation for now
                return false;
            }
            return true;
        });

        // Further refine and prioritize (mock for brevity)
        const prioritizedActions = [...filteredActions].sort((a, b) => {
            if (a === AnomalyActionType.QuarantineProcess) return -1; // Highest priority
            if (b === AnomalyActionType.QuarantineProcess) return 1;
            return 0;
        });

        return prioritizedActions;
    }

    /**
     * Records an action for auditability.
     * @param action The action performed.
     */
    public recordAction(action: AnomalyAction) {
        this.auditLogs.push(action);
        console.log(`Ethos Layer: Recorded action ${action.type} for alert ${action.alertId}.`);
        // In a real system, this would write to a secure, immutable audit log.
    }

    /**
     * Simulates bias detection in anomaly patterns.
     * @param anomalyPatterns Detected anomaly patterns.
     * @returns True if potential bias is detected.
     */
    public detectBias(anomalyPatterns: AnomalyAlert[]): boolean {
        // Very simplified: check if anomalies are disproportionately affecting a certain user group or file type
        const userIds = anomalyPatterns.map(a => a.relatedEvents[0]?.actor.userId).filter(Boolean);
        const uniqueUserIds = new Set(userIds);

        if (uniqueUserIds.size === 1 && userIds.length > 5) {
            console.warn(`Ethos Layer: Potential bias detected - A single user ('${userIds[0]}') is disproportionately affected by recent alerts. Investigate if detection models are biased.`);
            return true;
        }
        return false;
    }

    /**
     * Processes human feedback to refine ethical decision-making.
     * @param feedback AnomalyAlert with human feedback.
     */
    public processHumanFeedback(feedback: AnomalyAlert) {
        if (feedback.feedback === 'false_positive') {
            console.log(`Ethos Layer: Processing false positive feedback for alert ${feedback.alertId}. Updating model weights/rules.`);
            // In a real system, this would trigger retraining or rule adjustment
        } else if (feedback.feedback === 'true_positive_missed_action') {
            console.log(`Ethos Layer: Processing missed action feedback for alert ${feedback.alertId}. Reviewing action recommendation logic.`);
        }
        // This is where Bias Detection and Mitigation Envelopes would be updated.
    }
}

/**
 * Simulates the Agora Network's federated intelligence for collaborative learning.
 * Specialized Oracles, Consensus and Disputation Protocols.
 */
export class AgoraNetworkService {
    private oracles: { [name: string]: (events: FileSystemEvent[]) => AnomalyAlert[] } = {};

    constructor(
        private luminaCore: LuminaCoreService,
        private chronosEngine: ChronosEngineService,
        private ethosLayer: EthosLayerService
    ) {
        console.log("Agora Network: Initializing federated intelligence and collaborative learning.");
        this.registerOracle('RansomwareOracle', this.createRansomwareOracle());
        this.registerOracle('InsiderThreatOracle', this.createInsiderThreatOracle());
        this.registerOracle('PolicyViolationOracle', this.createPolicyViolationOracle());
    }

    private registerOracle(name: string, detector: (events: FileSystemEvent[]) => AnomalyAlert[]) {
        this.oracles[name] = detector;
    }

    /**
     * A specialized Oracle for ransomware detection.
     * Utilizes Lumina Core's context and Chronos Engine's temporal analysis.
     */
    private createRansomwareOracle() {
        return (events: FileSystemEvent[]): AnomalyAlert[] => {
            const alerts: AnomalyAlert[] = [];
            const recentEncrypts = events.filter(e =>
                (e.eventType === FileSystemEventType.FileWrite && e.path.match(/\.(encrypted|locked|ransom)$/i)) ||
                (e.eventType === FileSystemEventType.AttributeChange && e.metadata?.encrypted)
            );
            const highVolumeWrites = events.filter(e => e.eventType === FileSystemEventType.FileWrite && e.size && e.size > 0);

            if (recentEncrypts.length > 0) {
                alerts.push({
                    alertId: `oracle-ransom-encrypt-${Date.now()}`,
                    timestamp: recentEncrypts[0].timestamp,
                    severity: AnomalySeverity.Critical,
                    category: AnomalyCategory.Ransomware,
                    title: 'Ransomware Activity: File Encryption Detected',
                    description: `Multiple files (${recentEncrypts.length}) were detected with encryption-like extensions or attributes.`,
                    detectedBy: 'Agora: RansomwareOracle',
                    relatedEvents: recentEncrypts,
                    suggestedActions: [AnomalyActionType.QuarantineProcess, AnomalyActionType.NetworkAccess, AnomalyActionType.CreateForensicSnapshot],
                    confidenceScore: 0.98,
                    status: 'new',
                });
            }

            if (highVolumeWrites.length > 50 && events.length > 100) { // e.g., 50+ writes in a burst within 100 total events
                alerts.push({
                    alertId: `oracle-ransom-volume-${Date.now()}`,
                    timestamp: events[0].timestamp,
                    severity: AnomalySeverity.High,
                    category: AnomalyCategory.Ransomware,
                    title: 'High Volume File Modification Pattern Detected',
                    description: `A process is performing an unusually high number of file modifications. This often precedes encryption.`,
                    detectedBy: 'Agora: RansomwareOracle',
                    relatedEvents: highVolumeWrites,
                    suggestedActions: [AnomalyActionType.QuarantineProcess, AnomalyActionType.InitiateScan],
                    confidenceScore: 0.85,
                    status: 'new',
                });
            }
            return alerts;
        };
    }

    /**
     * A specialized Oracle for insider threat detection.
     * Focuses on anomalous access patterns, data movement to external drives.
     */
    private createInsiderThreatOracle() {
        return (events: FileSystemEvent[]): AnomalyAlert[] => {
            const alerts: AnomalyAlert[] = [];
            const suspiciousAccess = events.filter(e =>
                (e.eventType === FileSystemEventType.FileRead || e.eventType === FileSystemEventType.FileWrite) &&
                e.path.includes('/Confidential/') && // Access to sensitive data
                e.actor.applicationName === 'UsbDriveCopier.exe' // Known suspicious app
            );

            if (suspiciousAccess.length > 0) {
                alerts.push({
                    alertId: `oracle-insider-${Date.now()}`,
                    timestamp: suspiciousAccess[0].timestamp,
                    severity: AnomalySeverity.Critical,
                    category: AnomalyCategory.InsiderThreat,
                    title: 'Potential Insider Data Exfiltration Detected',
                    description: `Sensitive files accessed by a suspicious application, possibly for exfiltration.`,
                    detectedBy: 'Agora: InsiderThreatOracle',
                    relatedEvents: suspiciousAccess,
                    suggestedActions: [AnomalyActionType.IsolateUser, AnomalyActionType.RevokePermissions, AnomalyActionType.CreateForensicSnapshot],
                    confidenceScore: 0.9,
                    status: 'new',
                });
            }
            return alerts;
        };
    }

    /**
     * A specialized Oracle for policy violation detection.
     * Can check against pre-defined rules.
     */
    private createPolicyViolationOracle() {
        return (events: FileSystemEvent[]): AnomalyAlert[] => {
            const alerts: AnomalyAlert[] = [];
            // Example: Policy against executing files from temp directories
            const tempExecution = events.filter(e =>
                e.eventType === FileSystemEventType.FileExecute &&
                (e.path.includes('/Temp/') || e.path.includes('/Windows/Temp/'))
            );

            if (tempExecution.length > 0) {
                alerts.push({
                    alertId: `oracle-policy-temp-exec-${Date.now()}`,
                    timestamp: tempExecution[0].timestamp,
                    severity: AnomalySeverity.Medium,
                    category: AnomalyCategory.PolicyViolation,
                    title: 'Policy Violation: Execution from Temporary Directory',
                    description: `A process attempted to execute a file from a common temporary directory, which is against security policy.`,
                    detectedBy: 'Agora: PolicyViolationOracle',
                    relatedEvents: tempExecution,
                    suggestedActions: [AnomalyActionType.SendNotification, AnomalyActionType.InitiateScan],
                    confidenceScore: 0.7,
                    status: 'new',
                });
            }
            return alerts;
        };
    }

    /**
     * Runs all registered oracles and applies consensus protocols.
     * @param events The batch of events to analyze.
     * @returns A consolidated list of unique anomaly alerts.
     */
    public async analyzeEvents(events: FileSystemEvent[]): Promise<AnomalyAlert[]> {
        let allAlerts: AnomalyAlert[] = [];
        for (const oracleName in this.oracles) {
            const oracleAlerts = await this.oracles[oracleName](events);
            allAlerts = allAlerts.concat(oracleAlerts);
        }

        // Apply consensus and disputation protocols (simplified: deduplicate and merge)
        const consolidatedAlerts: AnomalyAlert[] = [];
        const alertMap = new Map<string, AnomalyAlert>(); // Key: title + category

        for (const alert of allAlerts) {
            const key = `${alert.title}-${alert.category}`;
            if (!alertMap.has(key) || alertMap.get(key)!.confidenceScore < alert.confidenceScore) {
                // If new alert or higher confidence, replace/add
                alertMap.set(key, alert);
            }
        }

        consolidatedAlerts.push(...Array.from(alertMap.values()));

        // Simulate Chronos engine and Lumina core contributions
        if (events.length > 0) {
            const chronosAlerts = this.chronosEngine.detectTemporalAnomalies(events);
            consolidatedAlerts.push(...chronosAlerts);

            const { score, explanation } = await this.luminaCore.inferPlausibility(events);
            if (score > 0.8 && consolidatedAlerts.every(a => a.alertId !== `lumina-inference-${events[0].id}`)) {
                consolidatedAlerts.push({
                    alertId: `lumina-inference-${events[0].id}`,
                    timestamp: events[0].timestamp,
                    severity: AnomalySeverity.High,
                    category: AnomalyCategory.SuspiciousActivity,
                    title: 'Lumina Core: High Probabilistic Inference of Suspicious Activity',
                    description: `Lumina Core detected a highly unusual pattern: ${explanation}. Confidence: ${Math.round(score * 100)}%.`,
                    detectedBy: 'Lumina Core: Probabilistic Inference',
                    relatedEvents: events,
                    suggestedActions: ['Deep forensic analysis', 'Isolate system'],
                    confidenceScore: score,
                    status: 'new',
                });
            }
        }

        // Filter alerts through Ethos Layer for ethical review
        // In a real system, the Ethos layer would review actions, not necessarily the alerts themselves,
        // but for demo purposes, we can simulate an ethical filter on the alerts.
        const ethicallyReviewedAlerts = consolidatedAlerts.filter(alert => {
            // Placeholder: if an alert suggests an action that is currently ethically constrained,
            // we might flag it for human review or slightly lower its severity.
            return true; // For now, all alerts pass initial ethical review.
        });


        // Apply Ethos Layer bias detection (conceptual)
        this.ethosLayer.detectBias(ethicallyReviewedAlerts);

        return ethicallyReviewedAlerts;
    }
}

// --- External Service Mockups (for potential integration) ---

export interface ThreatIntelligenceReport {
    indicator: string; // e.g., file hash, IP address
    threatType: string;
    confidence: number;
    lastSeen: Timestamp;
    source: string;
}

export class ThreatIntelligenceService {
    private knownThreats: Map<string, ThreatIntelligenceReport> = new Map();

    constructor() {
        console.log("Threat Intelligence Service: Initializing.");
        // Mock some known threats
        this.knownThreats.set("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", { // Mock SHA256 for a common malware
            indicator: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            threatType: "Malware",
            confidence: 0.99,
            lastSeen: Date.now(),
            source: "MockVirusTotal",
        });
    }

    public async checkIndicator(indicator: string): Promise<ThreatIntelligenceReport | undefined> {
        // Simulate API call to external TI feed
        await new Promise(resolve => setTimeout(resolve, 50));
        return this.knownThreats.get(indicator);
    }
}

export interface SIEMEvent {
    id: string;
    timestamp: Timestamp;
    eventType: string;
    source: string;
    data: Record<string, any>;
}

export class SIEMIntegrationService {
    constructor() {
        console.log("SIEM Integration Service: Initializing.");
    }

    public async sendAlertToSIEM(alert: AnomalyAlert): Promise<boolean> {
        console.log(`SIEM Integration: Sending alert ${alert.alertId} to SIEM.`);
        // Simulate API call to SIEM system
        await new Promise(resolve => setTimeout(resolve, 100));
        return Math.random() > 0.1; // 90% success rate
    }

    public async querySIEMForRelatedEvents(alert: AnomalyAlert): Promise<SIEMEvent[]> {
        console.log(`SIEM Integration: Querying SIEM for related events for alert ${alert.alertId}.`);
        await new Promise(resolve => setTimeout(resolve, 150));
        // Simulate returning some related events
        return [{
            id: `siem-related-${alert.alertId}-1`,
            timestamp: alert.timestamp - 1000,
            eventType: 'AuthFailure',
            source: 'ActiveDirectory',
            data: { userId: alert.relatedEvents[0]?.actor.userId, message: 'Login failed from unusual IP' }
        }];
    }
}

// --- Global Context for Aethelgard Services ---

interface AethelgardServices {
    luminaCore: LuminaCoreService;
    chronosEngine: ChronosEngineService;
    ethosLayer: EthosLayerService;
    agoraNetwork: AgoraNetworkService;
    threatIntelligence: ThreatIntelligenceService;
    siemIntegration: SIEMIntegrationService;
}

const AethelgardServicesContext = createContext<AethelgardServices | undefined>(undefined);

export const AethelgardServiceProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const luminaCore = useRef(new LuminaCoreService()).current;
    const chronosEngine = useRef(new ChronosEngineService()).current;
    const ethosLayer = useRef(new EthosLayerService()).current;
    const agoraNetwork = useRef(new AgoraNetworkService(luminaCore, chronosEngine, ethosLayer)).current;
    const threatIntelligence = useRef(new ThreatIntelligenceService()).current;
    const siemIntegration = useRef(new SIEMIntegrationService()).current;

    const services = {
        luminaCore,
        chronosEngine,
        ethosLayer,
        agoraNetwork,
        threatIntelligence,
        siemIntegration,
    };

    return (
        <AethelgardServicesContext.Provider value={services}>
            {children}
        </AethelgardServicesContext.Provider>
    );
};

export const useAethelgardServices = () => {
    const context = useContext(AethelgardServicesContext);
    if (context === undefined) {
        throw new Error('useAethelgardServices must be used within an AethelgardServiceProvider');
    }
    return context;
};


// --- Simulation and Core Logic for UI ---

/**
 * Hook to simulate real-time file system events.
 */
export const useFileSystemEventSimulator = (interval: number = 200) => {
    const [events, setEvents] = useState<FileSystemEvent[]>([]);
    const eventCounter = useRef(0);

    const generateRandomEvent = useCallback((): FileSystemEvent => {
        eventCounter.current++;
        const eventTypes = Object.values(FileSystemEventType);
        const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const paths = ['/Documents/report.docx', '/System/log.txt', '/Users/john/image.jpg', '/AppData/temp/exec.exe', '/NetworkShare/data.zip'];
        const users = [{ id: 'user_a', name: 'Alice' }, { id: 'user_b', name: 'Bob' }, { id: 'user_c', name: 'Charlie' }];
        const processes = [{ id: 'proc_1', name: 'explorer.exe' }, { id: 'proc_2', name: 'chrome.exe' }, { id: 'proc_3', name: 'powershell.exe' }];

        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomProcess = processes[Math.floor(Math.random() * processes.length)];
        const randomPath = paths[Math.floor(Math.random() * paths.length)];

        return {
            id: `event-${eventCounter.current}-${Date.now()}`,
            timestamp: Date.now(),
            eventType: randomEventType,
            path: randomPath,
            actor: {
                userId: randomUser.id,
                userName: randomUser.name,
                processId: randomProcess.id,
                processName: randomProcess.name,
                applicationName: randomProcess.name,
                ipAddress: '192.168.1.100', // Example
            },
            size: randomEventType === FileSystemEventType.FileWrite ? Math.floor(Math.random() * 1024 * 1024) : undefined, // 0-1MB
            hash: randomEventType === FileSystemEventType.FileWrite ? `hash-${Math.random().toString(16).substr(2, 8)}` : undefined,
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setEvents(prevEvents => {
                const newEvent = generateRandomEvent();
                // Introduce some 'ransomware' like burst for demonstration
                if (Math.random() < 0.02) { // 2% chance for a burst
                    const burstEvents: FileSystemEvent[] = [];
                    for (let i = 0; i < Math.floor(Math.random() * 20) + 5; i++) { // 5 to 25 events
                        burstEvents.push({
                            ...generateRandomEvent(),
                            eventType: FileSystemEventType.FileWrite,
                            path: `/Documents/encrypted_file_${i}.txt.ransom`,
                            size: Math.floor(Math.random() * 100 * 1024) + 1024, // 1KB-100KB
                            actor: { ...burstEvents[0]?.actor || { userId: 'attacker_1', userName: 'MaliciousApp', processId: 'ransom.exe', processName: 'ransom.exe' } },
                        });
                    }
                    return [...prevEvents.slice(-990), newEvent, ...burstEvents];
                }
                return [...prevEvents.slice(-999), newEvent]; // Keep last 1000 events
            });
        }, interval);

        return () => clearInterval(intervalId);
    }, [interval, generateRandomEvent]);

    return events;
};

/**
 * Hook to manage anomaly alerts.
 */
export const useAnomalyAlerts = () => {
    const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);

    const addAlert = useCallback((newAlert: AnomalyAlert) => {
        setAlerts(prev => {
            // Prevent duplicate alerts based on a simplified key (e.g., title + category + related events hash)
            const alertKey = `${newAlert.title}-${newAlert.category}-${newAlert.relatedEvents.map(e => e.id).sort().join('-')}`;
            if (prev.some(alert => `${alert.title}-${alert.category}-${alert.relatedEvents.map(e => e.id).sort().join('-')}` === alertKey)) {
                return prev; // Alert already exists
            }
            return [newAlert, ...prev].slice(0, 50); // Keep last 50 alerts
        });
    }, []);

    const updateAlertStatus = useCallback((alertId: string, newStatus: AnomalyAlert['status'], feedback?: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.alertId === alertId
                ? { ...alert, status: newStatus, acknowledgedAt: Date.now(), acknowledgedBy: 'Human Operator', feedback: feedback || alert.feedback }
                : alert
        ));
    }, []);

    return { alerts, addAlert, updateAlertStatus };
};

/**
 * Utility to format timestamps.
 */
export const formatTimestamp = (timestamp: Timestamp): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

// --- UI Components ---

export const EventStreamDisplay: React.FC<{ events: FileSystemEvent[] }> = ({ events }) => {
    return (
        <div className="bg-surface-dark border border-border rounded-lg p-3 h-80 overflow-y-auto font-mono text-xs shadow-inner">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Real-time Event Stream</h3>
            {events.slice(0, 20).map(event => ( // Display only the most recent few for performance
                <div key={event.id} className="border-b border-border-light py-1 last:border-b-0">
                    <span className="text-blue-300">{formatTimestamp(event.timestamp)}</span> &mdash;
                    <span className="text-purple-300">[{event.actor.processName}]</span>
                    <span className="text-green-300"> {event.eventType}</span>
                    <span className="text-gray-400"> {event.path}</span>
                    {event.targetPath && <span className="text-gray-400"> -&gt; {event.targetPath}</span>}
                </div>
            ))}
            {events.length === 0 && <p className="text-text-secondary text-center italic">No events streaming...</p>}
        </div>
    );
};

export const AnomalyAlertsList: React.FC<{ alerts: AnomalyAlert[]; updateAlertStatus: (id: string, status: AnomalyAlert['status'], feedback?: string) => void }> = ({ alerts, updateAlertStatus }) => {
    const getSeverityColor = (severity: AnomalySeverity) => {
        switch (severity) {
            case AnomalySeverity.Critical: return 'text-red-500';
            case AnomalySeverity.High: return 'text-orange-500';
            case AnomalySeverity.Medium: return 'text-yellow-500';
            case AnomalySeverity.Low: return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const handleAcknowledge = (alertId: string) => {
        updateAlertStatus(alertId, 'investigating');
        alert('Alert acknowledged! Initiating investigation procedures...');
    };

    const handleResolve = (alertId: string, isFalsePositive: boolean = false) => {
        updateAlertStatus(alertId, isFalsePositive ? 'false_positive' : 'resolved', isFalsePositive ? 'User marked as false positive.' : 'User marked as resolved.');
        alert(`Alert ${isFalsePositive ? 'marked as false positive' : 'resolved'}!`);
    };

    return (
        <div className="bg-surface-dark border border-border rounded-lg p-3 h-96 overflow-y-auto shadow-inner">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Anomaly Alerts</h3>
            {alerts.length === 0 && <p className="text-text-secondary text-center italic">No active anomalies detected.</p>}
            {alerts.map(alert => (
                <div key={alert.alertId} className={`mb-3 p-3 border rounded-md ${alert.status === 'new' ? 'border-primary-light bg-primary-dark/20' : 'border-border bg-surface'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className={`${getSeverityColor(alert.severity)} font-bold text-sm`}>
                                {alert.severity} ({alert.category})
                            </p>
                            <h4 className="text-text-primary text-md font-semibold mt-1">{alert.title}</h4>
                            <p className="text-text-secondary text-sm leading-tight mt-1">{alert.description}</p>
                            <p className="text-xs text-text-tertiary mt-1">
                                Detected by: <span className="font-mono">{alert.detectedBy}</span> at <span className="font-mono">{formatTimestamp(alert.timestamp)}</span>
                                {alert.confidenceScore && ` | Confidence: ${Math.round(alert.confidenceScore * 100)}%`}
                            </p>
                        </div>
                        <div className="ml-4 text-right">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                alert.status === 'new' ? 'bg-red-600 text-white' :
                                alert.status === 'investigating' ? 'bg-yellow-600 text-white' :
                                alert.status === 'resolved' ? 'bg-green-600 text-white' :
                                'bg-gray-600 text-white'
                            }`}>
                                {alert.status.replace('_', ' ')}
                            </span>
                            {alert.status === 'new' && (
                                <div className="mt-2 flex flex-col space-y-1">
                                    <button
                                        onClick={() => handleAcknowledge(alert.alertId)}
                                        className="bg-primary hover:bg-primary-dark text-white px-3 py-1 text-xs rounded-md"
                                    >
                                        Acknowledge
                                    </button>
                                </div>
                            )}
                            {(alert.status === 'new' || alert.status === 'investigating') && (
                                <div className="mt-2 flex flex-col space-y-1">
                                    <button
                                        onClick={() => handleResolve(alert.alertId)}
                                        className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 text-xs rounded-md"
                                    >
                                        Resolve
                                    </button>
                                     <button
                                        onClick={() => handleResolve(alert.alertId, true)}
                                        className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 text-xs rounded-md"
                                    >
                                        False Positive
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                     {alert.suggestedActions && alert.suggestedActions.length > 0 && (
                        <div className="mt-2">
                            <p className="text-text-primary text-xs font-semibold">Suggested Actions:</p>
                            <ul className="list-disc list-inside text-text-secondary text-xs pl-2">
                                {alert.suggestedActions.map((action, i) => <li key={i}>{action}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const SystemHealthDisplay: React.FC<{ status: SystemHealthStatus; metrics: DetectionEngineMetrics[] }> = ({ status, metrics }) => {
    return (
        <div className="bg-surface-dark border border-border rounded-lg p-3 shadow-inner">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Aethelgard System Health</h3>
            <p className="text-text-primary">Overall Status: <span className={`font-bold ${status.overallStatus === 'healthy' ? 'text-green-500' : status.overallStatus === 'degraded' ? 'text-yellow-500' : 'text-red-500'}`}>{status.overallStatus.toUpperCase()}</span></p>
            <p className="text-text-secondary text-sm">{status.message}</p>
            <div className="mt-4">
                <h4 className="text-text-primary text-md font-semibold mb-1">Detection Engine Metrics:</h4>
                <div className="space-y-2">
                    {metrics.map(m => (
                        <div key={m.engineName} className="flex justify-between items-center text-xs text-text-secondary">
                            <span className="font-mono">{m.engineName} ({m.modelVersion})</span>
                            <span className={`px-2 py-0.5 rounded-full text-white ${m.status === 'running' ? 'bg-green-500' : m.status === 'learning' ? 'bg-blue-500' : 'bg-red-500'}`}>{m.status.toUpperCase()}</span>
                            <span>{m.eventsProcessedPerSecond.toFixed(1)} eps | {m.anomaliesDetectedLastHour} alerts/hr</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AnomalyForecasting: React.FC<{ latestAlert?: AnomalyAlert; chronosEngine: ChronosEngineService }> = ({ latestAlert, chronosEngine }) => {
    const [forecasts, setForecasts] = useState<string[]>([]);
    const [counterfactuals, setCounterfactuals] = useState<string[]>([]);

    useEffect(() => {
        if (latestAlert) {
            setForecasts(chronosEngine.forecastEventHorizon(latestAlert));
            setCounterfactuals(chronosEngine.exploreCounterfactuals(latestAlert));
        } else {
            setForecasts([]);
            setCounterfactuals([]);
        }
    }, [latestAlert, chronosEngine]);

    return (
        <div className="bg-surface-dark border border-border rounded-lg p-3 shadow-inner">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Aethelgard Predictive Synthesis (Chronos Engine)</h3>
            {latestAlert ? (
                <>
                    <p className="text-text-secondary text-sm mb-2">Analyzing potential impact for alert: <span className="font-semibold italic text-primary">{latestAlert.title}</span></p>
                    {forecasts.length > 0 && (
                        <div>
                            <p className="text-text-primary font-semibold text-sm mt-3">Event Horizon Forecasts:</p>
                            <ul className="list-disc list-inside text-text-secondary text-xs pl-2">
                                {forecasts.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                    )}
                     {counterfactuals.length > 0 && (
                        <div>
                            <p className="text-text-primary font-semibold text-sm mt-3">Counterfactual Exploration:</p>
                            <ul className="list-disc list-inside text-text-secondary text-xs pl-2">
                                {counterfactuals.map((cf, i) => <li key={i}>{cf}</li>)}
                            </ul>
                        </div>
                    )}
                    {(forecasts.length === 0 && counterfactuals.length === 0) && <p className="text-text-secondary text-center italic">No immediate forecasts available for this alert.</p>}
                </>
            ) : (
                <p className="text-text-secondary text-center italic">Awaiting new critical alerts for predictive analysis...</p>
            )}
        </div>
    );
};

export const AethelgardEthosFeedback: React.FC<{ latestAlert?: AnomalyAlert; ethosLayer: EthosLayerService; updateAlertStatus: (id: string, status: AnomalyAlert['status'], feedback?: string) => void }> = ({ latestAlert, ethosLayer, updateAlertStatus }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackType, setFeedbackType] = useState<'false_positive' | 'missed_action' | 'other'>('false_positive');

    const handleSubmitFeedback = useCallback(() => {
        if (latestAlert && feedbackText) {
            const updatedAlert = { ...latestAlert, feedback: feedbackText };
            ethosLayer.processHumanFeedback(updatedAlert);
            updateAlertStatus(latestAlert.alertId, feedbackType === 'false_positive' ? 'false_positive' : 'resolved', feedbackText);
            alert('Feedback submitted to Ethos Layer for model refinement.');
            setFeedbackText('');
        }
    }, [latestAlert, feedbackText, feedbackType, ethosLayer, updateAlertStatus]);

    return (
        <div className="bg-surface-dark border border-border rounded-lg p-3 shadow-inner">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Human-AI Feedback Loop (Ethos Layer)</h3>
            {latestAlert ? (
                <>
                    <p className="text-text-secondary text-sm mb-2">Provide feedback for alert: <span className="font-semibold italic text-primary">{latestAlert.title}</span></p>
                    <div className="mb-3">
                        <label htmlFor="feedbackType" className="block text-text-primary text-sm font-medium mb-1">Feedback Type:</label>
                        <select
                            id="feedbackType"
                            className="w-full p-2 rounded bg-surface-light border border-border text-text-primary"
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value as any)}
                        >
                            <option value="false_positive">False Positive</option>
                            <option value="missed_action">Action Missed/Insufficient</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="feedbackText" className="block text-text-primary text-sm font-medium mb-1">Your Feedback:</label>
                        <textarea
                            id="feedbackText"
                            className="w-full p-2 rounded bg-surface-light border border-border text-text-primary h-20"
                            placeholder="Explain why this alert was inaccurate, or what could have been done better..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                        ></textarea>
                    </div>
                    <button
                        onClick={handleSubmitFeedback}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md disabled:opacity-50"
                        disabled={!feedbackText}
                    >
                        Submit Feedback
                    </button>
                </>
            ) : (
                <p className="text-text-secondary text-center italic">Awaiting an alert to provide feedback...</p>
            )}
        </div>
    );
};


// --- Main Feature Component ---

export const AiDrivenFileSystemAnomalyDetection: React.FC = () => {
    const fileSystemEvents = useFileSystemEventSimulator(100); // Generate an event every 100ms
    const { alerts, addAlert, updateAlertStatus } = useAnomalyAlerts();
    const { luminaCore, chronosEngine, agoraNetwork, ethosLayer, threatIntelligence, siemIntegration } = useAethelgardServices();

    const [systemHealth, setSystemHealth] = useState<SystemHealthStatus>({
        overallStatus: 'healthy',
        message: 'All core Aethelgard components operating normally.',
        componentStatuses: {
            LuminaCore: 'healthy',
            ChronosEngine: 'healthy',
            AgoraNetwork: 'healthy',
            EthosLayer: 'healthy',
        },
        lastCheck: Date.now(),
    });

    const [engineMetrics, setEngineMetrics] = useState<DetectionEngineMetrics[]>([
        { engineName: 'Lumina Core Inference', eventsProcessedPerSecond: 0, anomaliesDetectedLastHour: 0, falsePositiveRate: 0.01, truePositiveRate: 0.9, modelVersion: '1.2.0', lastUpdated: Date.now(), status: 'running' },
        { engineName: 'Chronos Temporal', eventsProcessedPerSecond: 0, anomaliesDetectedLastHour: 0, falsePositiveRate: 0.02, truePositiveRate: 0.88, modelVersion: '2.1.0', lastUpdated: Date.now(), status: 'running' },
        { engineName: 'Agora Oracles', eventsProcessedPerSecond: 0, anomaliesDetectedLastHour: 0, falsePositiveRate: 0.03, truePositiveRate: 0.85, modelVersion: '3.0.1', lastUpdated: Date.now(), status: 'running' },
    ]);

    // Process events and detect anomalies
    useEffect(() => {
        if (fileSystemEvents.length === 0) return;

        // Process new events in batches (e.g., last 10 events)
        const newEventsBatch = fileSystemEvents.slice(-10);

        const processBatch = async () => {
            const enrichedEvents: FileSystemEvent[] = await Promise.all(newEventsBatch.map(e => luminaCore.processEvent(e)));
            enrichedEvents.forEach(e => chronosEngine.recordEvent(e));
            enrichedEvents.forEach(e => chronosEngine.learnBaseline(e));

            const detectedAlerts = await agoraNetwork.analyzeEvents(enrichedEvents);

            // Integrate with external TI if an alert comes up (conceptual)
            for (const alert of detectedAlerts) {
                if (alert.relatedEvents.length > 0 && alert.relatedEvents[0].hash) {
                    const tiReport = await threatIntelligence.checkIndicator(alert.relatedEvents[0].hash);
                    if (tiReport) {
                        alert.description += ` (Matched known threat: ${tiReport.threatType} from ${tiReport.source})`;
                        if (tiReport.confidence > alert.confidenceScore) {
                            alert.confidenceScore = tiReport.confidence;
                        }
                    }
                }
                addAlert(alert);

                // Send to SIEM for critical alerts (conceptual)
                if (alert.severity === AnomalySeverity.Critical) {
                    await siemIntegration.sendAlertToSIEM(alert);
                }
            }

            // Update metrics
            setEngineMetrics(prevMetrics => prevMetrics.map(metric => {
                if (metric.engineName.includes('Lumina')) {
                    return { ...metric, eventsProcessedPerSecond: newEventsBatch.length / (0.1), anomaliesDetectedLastHour: metric.anomaliesDetectedLastHour + detectedAlerts.length / 10 };
                }
                if (metric.engineName.includes('Chronos')) {
                     return { ...metric, eventsProcessedPerSecond: newEventsBatch.length / (0.1), anomaliesDetectedLastHour: metric.anomaliesDetectedLastHour + detectedAlerts.filter(a => a.detectedBy.includes('Chronos')).length / 10 };
                }
                 if (metric.engineName.includes('Agora')) {
                     return { ...metric, eventsProcessedPerSecond: newEventsBatch.length / (0.1), anomaliesDetectedLastHour: metric.anomaliesDetectedLastHour + detectedAlerts.filter(a => a.detectedBy.includes('Agora')).length / 10 };
                }
                return metric;
            }));
        };

        const timeout = setTimeout(processBatch, 100); // Process every 100ms to simulate continuous detection
        return () => clearTimeout(timeout);

    }, [fileSystemEvents, addAlert, luminaCore, chronosEngine, agoraNetwork, threatIntelligence, siemIntegration]);

    // Periodically update system health (simulated)
    useEffect(() => {
        const healthInterval = setInterval(() => {
            setSystemHealth(prev => {
                const newStatus = Math.random() > 0.95 ? 'degraded' : 'healthy'; // 5% chance of degraded
                return {
                    ...prev,
                    overallStatus: newStatus,
                    message: newStatus === 'degraded' ? 'Minor degradation detected in Chronos Engine, performance impact possible.' : 'All core Aethelgard components operating normally.',
                    componentStatuses: {
                        ...prev.componentStatuses,
                        ChronosEngine: newStatus,
                    },
                    lastCheck: Date.now(),
                };
            });
        }, 5000); // Every 5 seconds
        return () => clearInterval(healthInterval);
    }, []);

    const latestCriticalAlert = alerts.find(a => a.severity === AnomalySeverity.Critical && a.status === 'new');
    const latestAlertForFeedback = alerts.find(a => (a.status === 'new' || a.status === 'investigating'));


    return (
        <AethelgardServiceProvider>
            <div className="h-full w-full flex flex-col p-8 text-center text-text-primary bg-background-dark overflow-auto">
                <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                    <ShieldCheckIcon />
                </div>
                <h1 className="text-4xl font-extrabold mb-2 text-white">
                    Aethelgard: AI File System Anomaly Detection
                </h1>
                <p className="text-xl text-text-secondary max-w-4xl mx-auto mb-8">
                    An advanced cognitive architecture leveraging Lumina Core for semantic understanding, Chronos Engine for temporal reasoning, and Agora Network for federated detection, guided by the Ethos Layer for ethical alignment.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                    {/* Column 1: Event Stream & System Health */}
                    <div className="flex flex-col space-y-6">
                        <EventStreamDisplay events={fileSystemEvents} />
                        <SystemHealthDisplay status={systemHealth} metrics={engineMetrics} />
                    </div>

                    {/* Column 2: Anomaly Alerts */}
                    <div className="lg:col-span-2">
                        <AnomalyAlertsList alerts={alerts} updateAlertStatus={updateAlertStatus} />
                    </div>

                    {/* Column 3: Predictive Synthesis & Feedback */}
                    <div className="flex flex-col space-y-6">
                        <AnomalyForecasting latestAlert={latestCriticalAlert} chronosEngine={chronosEngine} />
                        <AethelgardEthosFeedback latestAlert={latestAlertForFeedback} ethosLayer={ethosLayer} updateAlertStatus={updateAlertStatus} />
                    </div>
                </div>

                <p className="text-xs text-text-tertiary mt-8">
                    Note: This is a conceptual UI demonstrating Aethelgard's AI-driven capabilities. Actual implementation requires deep system integration and robust backend services.
                </p>
            </div>
        </AethelgardServiceProvider>
    );
};