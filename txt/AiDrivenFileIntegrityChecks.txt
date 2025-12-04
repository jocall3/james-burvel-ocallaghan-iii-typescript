// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useEffect } from 'react';
import { checkFileIntegrity, simulateSemanticAnalysis, simulateThreatDetection, simulateEthicalCompliance, simulateTemporalDriftPrediction, simulateRemediationSuggestions, fetchExternalContextualData } from '../../services/api';
import { ShieldCheckIcon, AlertTriangleIcon, ClockIcon, BrainIcon, LeafIcon, BookOpenIcon, ZapIcon, InfoIcon, TargetIcon, LayersIcon, ChevronDownIcon } from '../icons';
import { LoadingSpinner } from '../shared';


// --- Aethelgard-specific Type Definitions ---

// Represents metadata associated with a file, crucial for contextual analysis (Lumina Core)
export interface FileMetadata {
    fileName: string;
    fileType: 'text' | 'code' | 'document' | 'configuration' | 'data' | 'other';
    ownerId: string;
    creationTimestamp: string; // ISO 8601 string
    lastModifiedTimestamp: string; // ISO 8601 string
    versionHash?: string; // e.g., git commit hash or content hash
    securityContextTags: string[]; // e.g., ['PII', 'Financial', 'Public']
    retentionPolicyId?: string;
    classificationLevel?: 'Unclassified' | 'Confidential' | 'Secret' | 'Top Secret'; // New field for Aethelgard's enhanced security context
}

// Defines options for the integrity scan, influencing which Aethelgard modules are engaged
export interface IntegrityScanOptions {
    scanDepth: 'shallow' | 'normal' | 'deep' | 'exhaustive';
    enableSemanticAnalysis: boolean; // Engages Lumina Core
    enableThreatDetection: boolean; // Engages Agora Network (Security Oracle)
    enableEthicalCompliance: boolean; // Engages Ethos Layer
    enableTemporalDriftPrediction: boolean; // Engages Chronos Engine
    autoSuggestRemediations: boolean;
    scheduleScan: 'manual' | 'daily' | 'weekly' | 'monthly';
    targetContextKeywords: string[]; // For Lumina Core to focus semantic search
    riskTolerance: 'low' | 'medium' | 'high'; // New: influences thresholds for warnings/critical statuses
    priorityAssessment: 'low' | 'normal' | 'high' | 'critical'; // New: priority for resource allocation in Agora
}

// Represents the detailed integrity report from Aethelgard
export interface AethelgardIntegrityReport {
    overallStatus: 'Secure' | 'Warning' | 'Critical' | 'Unknown';
    overallConfidenceScore: number; // 0-100
    summary: string;
    integrityIssues: IntegrityIssue[];
    semanticAnalysis?: SemanticAnalysisReport;
    threatDetection?: ThreatDetectionReport;
    ethicalCompliance?: EthicalComplianceReport;
    temporalDrift?: TemporalDriftReport;
    suggestedRemediations?: RemediationSuggestion[];
    provenanceTrace: string[]; // Chain of operations and data sources used (Ethos Layer)
    timestamp: string; // When the report was generated
    externalContextsIncorporated?: ExternalContextualData[]; // New: Data from integrated external services
}

// Generic structure for an issue found
export interface IntegrityIssue {
    type: 'Modification' | 'Corruption' | 'Security Vulnerability' | 'Semantic Anomaly' | 'Ethical Breach' | 'Performance Risk' | 'Data Drift' | 'Policy Violation' | 'Interoperability Risk'; // Added types
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
    details?: string;
    location?: string; // e.g., line number, section, URL
    detectedByModule: string; // e.g., 'Lumina Core', 'Agora Network - Security Oracle'
    remediationId?: string; // Links to a suggested remediation
    confidence?: number; // New: confidence in this specific issue detection
}

// Sub-report for Semantic Analysis (Lumina Core)
export interface SemanticAnalysisReport {
    coherenceScore: number; // 0-100, how well the content aligns with its context/declared purpose
    keyConceptsIdentified: string[];
    anomalousPhrases?: { phrase: string; reason: string; context: string }[]; // Added context
    contextualMatches: { externalSource: string; matchScore: number; url?: string }[]; // Added URL
    knowledgeGraphLinks: string[]; // URLs or IDs to related knowledge graph entities
    semanticDensity: number; // New: measures information richness
}

// Sub-report for Threat Detection (Agora Network - Security Oracle)
export interface ThreatDetectionReport {
    vulnerabilityScore: number; // 0-100, higher is worse
    knownVulnerabilitiesDetected: { id: string; description: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; cveLink?: string }[]; // Added cveLink
    potentialAttackVectors: string[];
    externalThreatIntelligenceMatches: { source: string; details: string; link?: string }[];
    recommendations: string[];
    riskExploitabilityScore: number; // New: how easily exploited are detected vulnerabilities
}

// Sub-report for Ethical Compliance (Ethos Layer)
export interface EthicalComplianceReport {
    complianceStatus: 'Compliant' | 'Warning' | 'Non-Compliant';
    ethicalViolations?: { rule: string; description: string; impact: string; guidelineLink?: string }[]; // Added guidelineLink
    biasDetectionResults: { type: string; severity: 'Low' | 'Medium' | 'High'; detail: string; mitigationStrategy?: string }[]; // Added mitigationStrategy
    privacyRiskScore: number; // 0-100, higher is worse
    governancePolicyMatches: string[]; // e.g., GDPR, internal data policies
    explainabilityScore: number; // New: how transparent is the content's origin/reasoning
}

// Sub-report for Temporal Drift (Chronos Engine)
export interface TemporalDriftReport {
    driftLikelihood: number; // 0-100, probability of significant unintended change
    predictedChangeImpact: 'Low' | 'Medium' | 'High';
    historicalStabilityScore: number; // 0-100
    anomalousChangePatternsDetected?: { pattern: string; detail: string; recommendedAction?: string }[]; // Added recommendedAction
    proactiveMonitoringSuggested: boolean;
    forecastHorizon: string; // New: e.g., "next 3 months", "next year"
}

// Suggested Remediation (Chronos Engine, Agora Network, Lumina Core)
export interface RemediationSuggestion {
    id: string;
    action: string;
    justification: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    estimatedImpact?: string;
    linkedIssues: string[]; // IDs of integrity issues this remediation addresses
    responsibleTeam?: string; // New: e.g., 'Security', 'Data Governance'
    automationPotential?: 'None' | 'Partial' | 'Full'; // New: can this be automated by Aethelgard?
}

// New: Represents data retrieved from external services
export interface ExternalContextualData {
    serviceName: string;
    query: string;
    results: string[];
    timestamp: string;
}

// --- Extended Aethelgard UI Component ---

export const AiDrivenFileIntegrityChecks: React.FC = () => {
    // Existing state
    const [content, setContent] = useState<string>('This is the content of a perfectly normal file. It discusses quantum entanglement and its potential applications in secure communication, aligning with project Aethelgard\'s pursuit of fundamental knowledge and ethical technological advancement. It also contains some financial figures that, while anonymized, require careful handling under specific regulations.');
    const [report, setReport] = useState<string>(''); // This will likely be replaced by a structured report object
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // New Aethelgard-specific state
    const [fileMetadata, setFileMetadata] = useState<FileMetadata>({
        fileName: 'Aethelgard_Deep_Research_V2.md',
        fileType: 'document',
        ownerId: 'user-aethelgard-1',
        creationTimestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        lastModifiedTimestamp: new Date().toISOString(),
        securityContextTags: ['Confidential', 'Project-Aethelgard', 'Research-Data', 'Financial-Data', 'Compliance-GDPR'],
        versionHash: 'initial-v1.0-alpha',
        classificationLevel: 'Secret'
    });
    const [scanOptions, setScanOptions] = useState<IntegrityScanOptions>({
        scanDepth: 'normal',
        enableSemanticAnalysis: true,
        enableThreatDetection: true,
        enableEthicalCompliance: true,
        enableTemporalDriftPrediction: true,
        autoSuggestRemediations: true,
        scheduleScan: 'manual',
        targetContextKeywords: ['Aethelgard', 'AI', 'Ethics', 'Collaboration', 'Cognitive Systems', 'Quantum Computing', 'Data Security'],
        riskTolerance: 'medium',
        priorityAssessment: 'high'
    });
    const [aethelgardReport, setAethelgardReport] = useState<AethelgardIntegrityReport | null>(null);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
    const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false); // New: for internal Aethelgard developer use

    // Effect to update lastModifiedTimestamp and versionHash when content changes
    useEffect(() => {
        setFileMetadata(prev => ({ ...prev, lastModifiedTimestamp: new Date().toISOString() }));
        // Simulate a content hash update for version tracking. In production, use a proper hashing algorithm.
        setFileMetadata(prev => ({ ...prev, versionHash: `content-hash-${Math.random().toString(36).substring(2, 10)}-${content.length}` }));
    }, [content]);

    const handleCheck = useCallback(async () => {
        if (!content.trim()) {
            setError('Please provide file content to check.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAethelgardReport(null);
        setReport(''); // Clear old simple report
        
        try {
            // Initiate core integrity check (can be a lightweight hashing or syntax check)
            const baseIntegrityResult = await checkFileIntegrity(content);
            console.log("Base integrity check result:", baseIntegrityResult);
            // Optionally, integrate baseIntegrityResult into Aethelgard's report later

            const newIntegrityReport: AethelgardIntegrityReport = {
                overallStatus: 'Secure', 
                overallConfidenceScore: 98, 
                summary: 'Aethelgard commencing multi-layered analysis. Expect detailed insights shortly.',
                integrityIssues: [],
                provenanceTrace: [`Initiating Aethelgard analysis at ${new Date().toISOString()}`, 'Initial file hashing and structural validation complete.'],
                timestamp: new Date().toISOString(),
                externalContextsIncorporated: [],
            };

            // Stage 1: Lumina Core - Semantic Analysis
            if (scanOptions.enableSemanticAnalysis) {
                newIntegrityReport.provenanceTrace.push('Lumina Core engaged for deep semantic and contextual understanding.');
                const semanticReport = await simulateSemanticAnalysis(content, fileMetadata, scanOptions.targetContextKeywords, scanOptions.scanDepth);
                newIntegrityReport.semanticAnalysis = semanticReport;
                newIntegrityReport.externalContextsIncorporated?.push(
                    await fetchExternalContextualData(`Semantic analysis based on keywords: ${scanOptions.targetContextKeywords.join(', ')}`)
                );

                if (semanticReport.coherenceScore < 70 && scanOptions.riskTolerance === 'low' || semanticReport.coherenceScore < 50 && scanOptions.riskTolerance === 'medium') {
                    newIntegrityReport.overallStatus = 'Warning';
                    newIntegrityReport.summary = 'Semantic coherence concerns identified. Review contextual alignment.';
                    newIntegrityReport.integrityIssues.push({
                        type: 'Semantic Anomaly',
                        severity: semanticReport.coherenceScore < 40 ? 'High' : 'Medium',
                        description: `Content deviates significantly from expected semantic context (Coherence Score: ${semanticReport.coherenceScore}%).`,
                        details: semanticReport.anomalousPhrases?.map(p => `${p.phrase} (${p.reason})`).join('; '),
                        location: 'Content body',
                        detectedByModule: 'Lumina Core',
                        confidence: 90
                    });
                }
            }

            // Stage 2: Agora Network - Threat Detection & Interoperability
            if (scanOptions.enableThreatDetection) {
                newIntegrityReport.provenanceTrace.push('Agora Network activated: Security Oracles performing threat assessment.');
                const threatReport = await simulateThreatDetection(content, fileMetadata, scanOptions.scanDepth);
                newIntegrityReport.threatDetection = threatReport;
                newIntegrityReport.externalContextsIncorporated?.push(
                    await fetchExternalContextualData(`Threat intelligence lookup for fileType: ${fileMetadata.fileType}`)
                );

                if (threatReport.vulnerabilityScore > 40 && scanOptions.riskTolerance === 'low' || threatReport.vulnerabilityScore > 60 && scanOptions.riskTolerance === 'medium') {
                    newIntegrityReport.overallStatus = 'Critical';
                    newIntegrityReport.summary = 'Immediate action required: High security vulnerabilities detected.';
                    newIntegrityReport.integrityIssues.push({
                        type: 'Security Vulnerability',
                        severity: threatReport.vulnerabilityScore > 75 ? 'Critical' : 'High',
                        description: `Identified significant security vulnerabilities (Score: ${threatReport.vulnerabilityScore}%).`,
                        details: threatReport.knownVulnerabilitiesDetected.map(v => `${v.description} (${v.id})`).join('; ') || threatReport.potentialAttackVectors.join('; '),
                        location: 'Content structure/Keywords',
                        detectedByModule: 'Agora Network - Security Oracle',
                        confidence: 95
                    });
                }
                // Check for interoperability risks, e.g., incompatible data formats, outdated APIs for code files.
                if (fileMetadata.fileType === 'code' && content.includes('legacy_api_call')) {
                    if (newIntegrityReport.overallStatus === 'Secure') newIntegrityReport.overallStatus = 'Warning';
                    newIntegrityReport.integrityIssues.push({
                        type: 'Interoperability Risk',
                        severity: 'Medium',
                        description: 'Detected use of a legacy API call which may lead to future interoperability issues.',
                        details: 'Consider updating to modern API standards for broader ecosystem compatibility.',
                        location: 'Line 42 (simulated)',
                        detectedByModule: 'Agora Network - Interoperability Oracle',
                        confidence: 70
                    });
                }
            }

            // Stage 3: Ethos Layer - Ethical & Compliance Review
            if (scanOptions.enableEthicalCompliance) {
                newIntegrityReport.provenanceTrace.push('Ethos Layer initiated for ethical, privacy, and policy compliance.');
                const ethicalReport = await simulateEthicalCompliance(content, fileMetadata, scanOptions.scanDepth);
                newIntegrityReport.ethicalCompliance = ethicalReport;
                newIntegrityReport.externalContextsIncorporated?.push(
                    await fetchExternalContextualData(`Compliance check against policies: ${fileMetadata.securityContextTags.filter(tag => tag.includes('Compliance')).join(', ')}`)
                );

                if (ethicalReport.complianceStatus !== 'Compliant' || ethicalReport.privacyRiskScore > 30) {
                    if (newIntegrityReport.overallStatus === 'Secure' || newIntegrityReport.overallStatus === 'Warning') newIntegrityReport.overallStatus = 'Critical';
                    newIntegrityReport.summary = 'Ethical or compliance breaches detected. Requires urgent review.';
                    ethicalReport.ethicalViolations?.forEach(violation => {
                        newIntegrityReport.integrityIssues.push({
                            type: 'Ethical Breach',
                            severity: 'Critical',
                            description: `Potential ethical violation: ${violation.description}`,
                            details: `Rule: ${violation.rule}, Impact: ${violation.impact}`,
                            detectedByModule: 'Ethos Layer - Ethical Guidelines Oracle',
                            confidence: 98
                        });
                    });
                    ethicalReport.biasDetectionResults?.forEach(bias => {
                        newIntegrityReport.integrityIssues.push({
                            type: 'Semantic Anomaly', 
                            severity: bias.severity === 'High' ? 'Critical' : bias.severity,
                            description: `Potential bias detected (${bias.type}): ${bias.detail}`,
                            details: bias.detail,
                            detectedByModule: 'Ethos Layer - Bias Detection Oracle',
                            confidence: 85
                        });
                    });
                    if (ethicalReport.privacyRiskScore > 30) {
                        newIntegrityReport.integrityIssues.push({
                            type: 'Policy Violation',
                            severity: ethicalReport.privacyRiskScore > 70 ? 'Critical' : 'High',
                            description: `High privacy risk identified (Score: ${ethicalReport.privacyRiskScore}%). Potentially non-compliant with data protection regulations.`,
                            details: `Security Tags: ${fileMetadata.securityContextTags.join(', ')}.`,
                            detectedByModule: 'Ethos Layer - Privacy Oracle',
                            confidence: 92
                        });
                    }
                }
            }

            // Stage 4: Chronos Engine - Temporal Reasoning and Predictive Synthesis
            if (scanOptions.enableTemporalDriftPrediction) {
                newIntegrityReport.provenanceTrace.push('Chronos Engine forecasting temporal drift and change patterns.');
                const temporalReport = await simulateTemporalDriftPrediction(content, fileMetadata, new Date().toISOString(), scanOptions.scanDepth);
                newIntegrityReport.temporalDrift = temporalReport;
                
                if (temporalReport.driftLikelihood > 50 && scanOptions.riskTolerance === 'low' || temporalReport.driftLikelihood > 70 && scanOptions.riskTolerance === 'medium') {
                    if (newIntegrityReport.overallStatus === 'Secure') newIntegrityReport.overallStatus = 'Warning';
                    newIntegrityReport.summary = 'Chronos Engine predicts high likelihood of future unintended temporal drift.';
                    newIntegrityReport.integrityIssues.push({
                        type: 'Data Drift',
                        severity: temporalReport.predictedChangeImpact === 'High' ? 'High' : 'Medium',
                        description: `Predicted high likelihood of unintended future changes or semantic drift (Likelihood: ${temporalReport.driftLikelihood}% over ${temporalReport.forecastHorizon}).`,
                        details: `Impact: ${temporalReport.predictedChangeImpact}. Historical stability: ${temporalReport.historicalStabilityScore}%.`,
                        detectedByModule: 'Chronos Engine',
                        confidence: 88
                    });
                }
            }

            // Consolidate overall status and confidence based on all module reports
            const criticalIssues = newIntegrityReport.integrityIssues.filter(issue => issue.severity === 'Critical').length;
            const highIssues = newIntegrityReport.integrityIssues.filter(issue => issue.severity === 'High').length;
            
            if (criticalIssues > 0) {
                newIntegrityReport.overallStatus = 'Critical';
                newIntegrityReport.overallConfidenceScore = Math.max(0, newIntegrityReport.overallConfidenceScore - (criticalIssues * 20));
            } else if (highIssues > 0) {
                newIntegrityReport.overallStatus = 'Warning';
                newIntegrityReport.overallConfidenceScore = Math.max(0, newIntegrityReport.overallConfidenceScore - (highIssues * 10));
            }

            if (newIntegrityReport.integrityIssues.length === 0) {
                newIntegrityReport.summary = 'Aethelgard analysis complete. No critical or significant issues detected. File maintains high integrity across all evaluated dimensions.';
            } else if (newIntegrityReport.integrityIssues.length > 0 && newIntegrityReport.overallStatus !== 'Critical') {
                 newIntegrityReport.summary = 'Aethelgard analysis complete. Some warnings identified, but overall integrity is manageable. Review specific issues for optimal file health.';
            }


            // Auto-suggest remediations if enabled and issues exist
            if (scanOptions.autoSuggestRemediations && newIntegrityReport.integrityIssues.length > 0) {
                newIntegrityReport.provenanceTrace.push('Generating context-aware remediation suggestions.');
                const remediationSuggestions = await simulateRemediationSuggestions(newIntegrityReport, scanOptions.priorityAssessment);
                newIntegrityReport.suggestedRemediations = remediationSuggestions;
            }

            setAethelgardReport(newIntegrityReport);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during Aethelgard analysis.');
        } finally {
            setIsLoading(false);
        }
    }, [content, fileMetadata, scanOptions]);

    const getStatusColorClass = (status: AethelgardIntegrityReport['overallStatus']) => {
        switch (status) {
            case 'Secure': return 'text-green-500';
            case 'Warning': return 'text-yellow-500';
            case 'Critical': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getSeverityColorClass = (severity: IntegrityIssue['severity']) => {
        switch (severity) {
            case 'Critical': return 'text-red-600 font-bold';
            case 'High': return 'text-orange-500';
            case 'Medium': return 'text-yellow-500';
            case 'Low': return 'text-blue-400';
            default: return 'text-text-secondary';
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background-light">
            <header className="mb-6 border-b border-border pb-4">
                <h1 className="text-4xl font-extrabold flex items-center text-primary-gradient bg-clip-text text-transparent">
                    <ShieldCheckIcon className="w-10 h-10 mr-4 text-accent" />
                    <span className="leading-tight">Aethelgard: AI-Driven File Integrity Analysis</span>
                </h1>
                <p className="text-text-secondary mt-2 text-lg">
                    Unlocking profound understanding through collaborative intelligence.
                    <span className="block italic text-sm mt-1">Leveraging Lumina Core, Agora Network, Chronos Engine, and Ethos Layer.</span>
                </p>
            </header>

            <div className="flex flex-col gap-6 flex-grow min-h-0 overflow-y-auto">
                <Card className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <BookOpenIcon className="w-6 h-6 mr-2 text-accent" /> File Configuration & Content
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            label="File Name"
                            value={fileMetadata.fileName}
                            onChange={(e) => setFileMetadata(prev => ({ ...prev, fileName: e.target.value }))}
                            placeholder="e.g., my_project_spec.json"
                            description="Name of the file for Aethelgard's context."
                        />
                        <Select
                            label="File Type"
                            value={fileMetadata.fileType}
                            onValueChange={(value: FileMetadata['fileType']) => setFileMetadata(prev => ({ ...prev, fileType: value }))}
                            description="Helps Aethelgard apply relevant domain-specific oracles."
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select file type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="code">Code</SelectItem>
                                <SelectItem value="document">Document</SelectItem>
                                <SelectItem value="configuration">Configuration</SelectItem>
                                <SelectItem value="data">Data</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            label="Owner ID"
                            value={fileMetadata.ownerId}
                            onChange={(e) => setFileMetadata(prev => ({ ...prev, ownerId: e.target.value }))}
                            placeholder="e.g., user-aethelgard-1"
                            description="Identifies the responsible party for provenance."
                        />
                        <Select
                            label="Classification Level"
                            value={fileMetadata.classificationLevel || 'Unclassified'}
                            onValueChange={(value: FileMetadata['classificationLevel']) => setFileMetadata(prev => ({ ...prev, classificationLevel: value }))}
                            description="Governs security protocols and data handling sensitivity."
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select classification" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Unclassified">Unclassified</SelectItem>
                                <SelectItem value="Confidential">Confidential</SelectItem>
                                <SelectItem value="Secret">Secret</SelectItem>
                                <SelectItem value="Top Secret">Top Secret</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="col-span-full">
                            <Input
                                label="Security & Compliance Context Tags (comma-separated)"
                                value={fileMetadata.securityContextTags.join(', ')}
                                onChange={(e) => setFileMetadata(prev => ({ ...prev, securityContextTags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))}
                                placeholder="e.g., PII, Financial, Public, HIPAA-Compliant"
                                description="Crucial for Ethos Layer's policy checks and Agora's security analysis."
                            />
                        </div>
                    </div>
                    <label htmlFor="content-input" className="text-sm font-medium text-text-secondary mb-2 block">File Content</label>
                    <textarea
                        id="content-input"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-4 bg-surface-dark border border-border rounded-md resize-y min-h-[150px] font-mono text-sm focus:ring-2 focus:ring-accent"
                        placeholder="Paste or type file content here for Aethelgard to analyze..."
                    />
                     <div className="mt-2 text-xs text-text-tertiary">
                        Created: {new Date(fileMetadata.creationTimestamp).toLocaleString()} |
                        Last Modified: {new Date(fileMetadata.lastModifiedTimestamp).toLocaleString()} |
                        Version Hash: {fileMetadata.versionHash || 'N/A'}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <TargetIcon className="w-6 h-6 mr-2 text-accent" /> Aethelgard Scan Parameters
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Scan Depth"
                            value={scanOptions.scanDepth}
                            onValueChange={(value: IntegrityScanOptions['scanDepth']) => setScanOptions(prev => ({ ...prev, scanDepth: value }))}
                            description="Determines the thoroughness of Aethelgard's multi-module analysis."
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select scan depth" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="shallow">Shallow (Quick Check)</SelectItem>
                                <SelectItem value="normal">Normal (Standard Modules)</SelectItem>
                                <SelectItem value="deep">Deep (Comprehensive Analysis)</SelectItem>
                                <SelectItem value="exhaustive">Exhaustive (All Modules, Max Context)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            label="Scan Schedule"
                            value={scanOptions.scheduleScan}
                            onValueChange={(value: IntegrityScanOptions['scheduleScan']) => setScanOptions(prev => ({ ...prev, scheduleScan: value }))}
                            description="Set recurring checks for continuous monitoring and drift detection."
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select schedule" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            label="Risk Tolerance"
                            value={scanOptions.riskTolerance}
                            onValueChange={(value: IntegrityScanOptions['riskTolerance']) => setScanOptions(prev => ({ ...prev, riskTolerance: value }))}
                            description="Adjusts sensitivity for flagging issues. Low = more alerts, High = fewer."
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select risk tolerance" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low (Highly Sensitive)</SelectItem>
                                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                                <SelectItem value="high">High (Focus on Critical)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            label="Priority Assessment"
                            value={scanOptions.priorityAssessment}
                            onValueChange={(value: IntegrityScanOptions['priorityAssessment']) => setScanOptions(prev => ({ ...prev, priorityAssessment: value }))}
                            description="Informs Aethelgard's resource allocation and remediation prioritization."
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-6">
                        <button
                            className="text-accent hover:underline flex items-center text-sm"
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        >
                            <InfoIcon className="w-4 h-4 mr-1" />
                            {showAdvancedOptions ? 'Hide Advanced Module & AI Configuration' : 'Show Advanced Module & AI Configuration'}
                        </button>
                        {showAdvancedOptions && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-surface-dark rounded-md border border-border">
                                <Toggle
                                    label="Enable Semantic Analysis (Lumina Core)"
                                    checked={scanOptions.enableSemanticAnalysis}
                                    onCheckedChange={(checked) => setScanOptions(prev => ({ ...prev, enableSemanticAnalysis: checked }))}
                                    description="Leverage Aethelgard's Lumina Core for deep contextual understanding."
                                />
                                <Toggle
                                    label="Enable Threat Detection (Agora Network)"
                                    checked={scanOptions.enableThreatDetection}
                                    onCheckedChange={(checked) => setScanOptions(prev => ({ ...prev, enableThreatDetection: checked }))}
                                    description="Utilize specialized Oracles within Agora Network for security assessment."
                                />
                                <Toggle
                                    label="Enable Ethical Compliance (Ethos Layer)"
                                    checked={scanOptions.enableEthicalCompliance}
                                    onCheckedChange={(checked) => setScanOptions(prev => ({ ...prev, enableEthicalCompliance: checked }))}
                                    description="Engage Ethos Layer for bias detection, privacy, and ethical guidelines review."
                                />
                                <Toggle
                                    label="Enable Temporal Drift Prediction (Chronos Engine)"
                                    checked={scanOptions.enableTemporalDriftPrediction}
                                    onCheckedChange={(checked) => setScanOptions(prev => ({ ...prev, enableTemporalDriftPrediction: checked }))}
                                    description="Employ Chronos Engine to predict future unintended changes and data drift."
                                />
                                <Toggle
                                    label="Auto-Suggest Remediations"
                                    checked={scanOptions.autoSuggestRemediations}
                                    onCheckedChange={(checked) => setScanOptions(prev => ({ ...prev, autoSuggestRemediations: checked }))}
                                    description="Automatically generate actionable steps for detected issues, prioritized by Ethos Layer."
                                />
                                <Input
                                    label="Target Context Keywords (for Lumina Core)"
                                    value={scanOptions.targetContextKeywords.join(', ')}
                                    onChange={(e) => setScanOptions(prev => ({ ...prev, targetContextKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
                                    placeholder="e.g., quantum, AI, ethics, climate"
                                    description="Guides Lumina Core's semantic focus during analysis."
                                />
                            </div>
                        )}
                    </div>

                    <Button onClick={handleCheck} disabled={isLoading} className="btn-primary w-full mt-6 flex items-center justify-center">
                        {isLoading ? <LoadingSpinner /> : (
                            <>
                                <ZapIcon className="w-5 h-5 mr-2" /> Initiate Aethelgard Analysis
                            </>
                        )}
                    </Button>
                </Card>

                {aethelgardReport && (
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center">
                            <LayersIcon className="w-6 h-6 mr-2 text-accent" /> Aethelgard Comprehensive Report
                        </h2>
                        {isLoading && <LoadingSpinner />}
                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        <div className="mb-4 p-4 border border-border rounded-md bg-surface-dark">
                            <h3 className="text-xl font-bold flex items-center">
                                Overall Status: <span className={`ml-2 ${getStatusColorClass(aethelgardReport.overallStatus)}`}>
                                    {aethelgardReport.overallStatus}
                                </span>
                            </h3>
                            <p className="text-text-secondary mt-1 text-sm">Aethelgard Confidence Score: <span className="font-semibold">{aethelgardReport.overallConfidenceScore}%</span></p>
                            <p className="mt-2 text-lg">{aethelgardReport.summary}</p>
                            <p className="text-xs text-text-tertiary mt-2">Report Generated: {new Date(aethelgardReport.timestamp).toLocaleString()}</p>
                        </div>

                        {aethelgardReport.integrityIssues.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-bold text-lg mb-2 flex items-center"><AlertTriangleIcon className="w-5 h-5 mr-2 text-red-500" /> Detected Issues</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    {aethelgardReport.integrityIssues.map((issue, index) => (
                                        <li key={index} id={`issue-${index}`} className="bg-surface-dark p-3 rounded-md border border-border">
                                            <p className={`font-semibold ${getSeverityColorClass(issue.severity)}`}>Severity: {issue.severity} - {issue.type}</p>
                                            <p className="text-text-primary mt-1">{issue.description}</p>
                                            {issue.details && <p className="text-sm text-text-secondary italic">Details: {issue.details}</p>}
                                            {issue.location && <p className="text-xs text-text-tertiary mt-1">Location: {issue.location}</p>}
                                            <p className="text-xs text-text-tertiary mt-1">Detected by: {issue.detectedByModule} (Confidence: {issue.confidence || 'N/A'}%)</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Accordion type="multiple" defaultValue={["overall-summary", "semantic-analysis"]}> {/* Default open semantic analysis */}
                            <AccordionItem value="overall-summary">
                                <AccordionTrigger className="text-lg font-medium flex items-center"><InfoIcon className="w-5 h-5 mr-2 text-gray-400" /> Executive Summary & Status</AccordionTrigger>
                                <AccordionContent className="p-4 bg-surface-dark border-t border-border">
                                    <p className="mb-2 text-lg font-bold">Overall Status: <span className={getStatusColorClass(aethelgardReport.overallStatus)}>{aethelgardReport.overallStatus}</span></p>
                                    <p className="mb-2">Aethelgard Confidence in Report: <span className="font-semibold">{aethelgardReport.overallConfidenceScore}%</span></p>
                                    <p className="mt-2 text-text-primary">{aethelgardReport.summary}</p>
                                    <p className="text-xs text-text-tertiary mt-2">Generated at: {new Date(aethelgardReport.timestamp).toLocaleString()}</p>
                                    {aethelgardReport.externalContextsIncorporated && aethelgardReport.externalContextsIncorporated.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-medium text-text-secondary">External Contexts Integrated:</h4>
                                            <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                {aethelgardReport.externalContextsIncorporated.map((ctx, idx) => (
                                                    <li key={idx} className="py-1">
                                                        <span className="font-semibold">{ctx.serviceName}:</span> Query "{ctx.query}" - Results: {ctx.results.join(', ')} (at {new Date(ctx.timestamp).toLocaleTimeString()})
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                            
                            {aethelgardReport.semanticAnalysis && (
                                <AccordionItem value="semantic-analysis">
                                    <AccordionTrigger className="text-lg font-medium flex items-center"><BrainIcon className="w-5 h-5 mr-2 text-blue-400" /> Lumina Core: Semantic Analysis</AccordionTrigger>
                                    <AccordionContent className="p-4 bg-surface-dark border-t border-border">
                                        <p className="mb-2">Coherence Score: <span className="font-semibold">{aethelgardReport.semanticAnalysis.coherenceScore}%</span></p>
                                        <p className="mb-2">Semantic Density: <span className="font-semibold">{aethelgardReport.semanticAnalysis.semanticDensity}%</span> (Higher indicates richer information)</p>
                                        <p className="mb-2">Key Concepts: <span className="italic">{aethelgardReport.semanticAnalysis.keyConceptsIdentified.join(', ')}</span></p>
                                        {aethelgardReport.semanticAnalysis.anomalousPhrases && aethelgardReport.semanticAnalysis.anomalousPhrases.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Anomalous Phrases:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.semanticAnalysis.anomalousPhrases.map((ap, idx) => (
                                                        <li key={idx}>"{ap.phrase}" - {ap.reason} (Context: {ap.context})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aethelgardReport.semanticAnalysis.contextualMatches && aethelgardReport.semanticAnalysis.contextualMatches.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Contextual Matches (External):</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.semanticAnalysis.contextualMatches.map((match, idx) => (
                                                        <li key={idx}>
                                                            <span className="font-semibold">{match.externalSource}</span>: {match.matchScore}% Match {match.url && <a href={match.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">(Link)</a>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aethelgardReport.semanticAnalysis.knowledgeGraphLinks && aethelgardReport.semanticAnalysis.knowledgeGraphLinks.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Aethelgard Knowledge Graph Links:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.semanticAnalysis.knowledgeGraphLinks.map((link, idx) => (
                                                        <li key={idx}><a href={link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{link}</a></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            {aethelgardReport.threatDetection && (
                                <AccordionItem value="threat-detection">
                                    <AccordionTrigger className="text-lg font-medium flex items-center"><ZapIcon className="w-5 h-5 mr-2 text-red-500" /> Agora Network: Threat Detection</AccordionTrigger>
                                    <AccordionContent className="p-4 bg-surface-dark border-t border-border">
                                        <p className="mb-2">Vulnerability Score: <span className="font-semibold">{aethelgardReport.threatDetection.vulnerabilityScore}%</span></p>
                                        <p className="mb-2">Risk Exploitability Score: <span className="font-semibold">{aethelgardReport.threatDetection.riskExploitabilityScore}%</span></p>
                                        {aethelgardReport.threatDetection.knownVulnerabilitiesDetected && aethelgardReport.threatDetection.knownVulnerabilitiesDetected.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Known Vulnerabilities:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.threatDetection.knownVulnerabilitiesDetected.map((vuln, idx) => (
                                                        <li key={idx}>
                                                            <span className={getSeverityColorClass(vuln.severity)}>{vuln.severity}</span>: {vuln.description} (ID: {vuln.id})
                                                            {vuln.cveLink && <a href={vuln.cveLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">(CVE)</a>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aethelgardReport.threatDetection.potentialAttackVectors && aethelgardReport.threatDetection.potentialAttackVectors.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Potential Attack Vectors:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.threatDetection.potentialAttackVectors.map((vector, idx) => (
                                                        <li key={idx}>{vector}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aethelgardReport.threatDetection.externalThreatIntelligenceMatches && aethelgardReport.threatDetection.externalThreatIntelligenceMatches.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">External Threat Intelligence Matches:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.threatDetection.externalThreatIntelligenceMatches.map((match, idx) => (
                                                        <li key={idx}>
                                                            <span className="font-semibold">{match.source}</span>: {match.details} {match.link && <a href={match.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">(Link)</a>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aethelgardReport.threatDetection.recommendations && aethelgardReport.threatDetection.recommendations.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Security Recommendations:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.threatDetection.recommendations.map((rec, idx) => (
                                                        <li key={idx}>{rec}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            {aethelgardReport.ethicalCompliance && (
                                <AccordionItem value="ethical-compliance">
                                    <AccordionTrigger className="text-lg font-medium flex items-center"><LeafIcon className="w-5 h-5 mr-2 text-green-500" /> Ethos Layer: Ethical & Compliance Review</AccordionTrigger>
                                    <AccordionContent className="p-4 bg-surface-dark border-t border-border">
                                        <p className="mb-2">Compliance Status: <span className={`font-semibold ${getStatusColorClass(aethelgardReport.ethicalCompliance.complianceStatus === 'Compliant' ? 'Secure' : 'Critical')}`}>{aethelgardReport.ethicalCompliance.complianceStatus}</span></p>
                                        <p className="mb-2">Privacy Risk Score: <span className="font-semibold">{aethelgardReport.ethicalCompliance.privacyRiskScore}%</span></p>
                                        <p className="mb-2">Aethelgard Explainability Score: <span className="font-semibold">{aethelgardReport.ethicalCompliance.explainabilityScore}%</span></p>
                                        {aethelgardReport.ethicalCompliance.ethicalViolations && aethelgardReport.ethicalCompliance.ethicalViolations.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Detected Ethical Violations:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.ethicalCompliance.ethicalViolations.map((violation, idx) => (
                                                        <li key={idx}>
                                                            <span className="text-red-500 font-bold">Violation:</span> {violation.description} (Rule: {violation.rule}, Impact: {violation.impact})
                                                            {violation.guidelineLink && <a href={violation.guidelineLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">(Guide)</a>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aethelgardReport.ethicalCompliance.biasDetectionResults && aethelgardReport.ethicalCompliance.biasDetectionResults.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Bias Detection Results:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.ethicalCompliance.biasDetectionResults.map((bias, idx) => (
                                                        <li key={idx}>
                                                            <span className={getSeverityColorClass(bias.severity)}>{bias.severity}</span> Bias ({bias.type}): {bias.detail}
                                                            {bias.mitigationStrategy && <span className="italic ml-1"> (Mitigation: {bias.mitigationStrategy})</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aethelgardReport.ethicalCompliance.governancePolicyMatches && aethelgardReport.ethicalCompliance.governancePolicyMatches.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Applicable Policies:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.ethicalCompliance.governancePolicyMatches.map((policy, idx) => (
                                                        <li key={idx}>{policy}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            {aethelgardReport.temporalDrift && (
                                <AccordionItem value="temporal-drift">
                                    <AccordionTrigger className="text-lg font-medium flex items-center"><ClockIcon className="w-5 h-5 mr-2 text-purple-400" /> Chronos Engine: Temporal Drift Prediction</AccordionTrigger>
                                    <AccordionContent className="p-4 bg-surface-dark border-t border-border">
                                        <p className="mb-2">Drift Likelihood: <span className="font-semibold">{aethelgardReport.temporalDrift.driftLikelihood}%</span></p>
                                        <p className="mb-2">Predicted Change Impact: <span className="font-semibold">{aethelgardReport.temporalDrift.predictedChangeImpact}</span></p>
                                        <p className="mb-2">Historical Stability Score: <span className="font-semibold">{aethelgardReport.temporalDrift.historicalStabilityScore}%</span></p>
                                        <p className="mb-2">Forecast Horizon: <span className="font-semibold">{aethelgardReport.temporalDrift.forecastHorizon}</span></p>
                                        <p className="mb-2">Proactive Monitoring Suggested: <span className="font-semibold">{aethelgardReport.temporalDrift.proactiveMonitoringSuggested ? 'Yes' : 'No'}</span></p>
                                        {aethelgardReport.temporalDrift.anomalousChangePatternsDetected && aethelgardReport.temporalDrift.anomalousChangePatternsDetected.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-text-secondary">Anomalous Change Patterns:</h4>
                                                <ul className="list-disc list-inside text-sm text-text-tertiary">
                                                    {aethelgardReport.temporalDrift.anomalousChangePatternsDetected.map((pattern, idx) => (
                                                        <li key={idx}>
                                                            "{pattern.pattern}" - {pattern.detail}
                                                            {pattern.recommendedAction && <span className="italic ml-1"> (Action: {pattern.recommendedAction})</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            {aethelgardReport.suggestedRemediations && aethelgardReport.suggestedRemediations.length > 0 && (
                                <AccordionItem value="remediations">
                                    <AccordionTrigger className="text-lg font-medium flex items-center"><InfoIcon className="w-5 h-5 mr-2 text-teal-400" /> Suggested Remediations</AccordionTrigger>
                                    <AccordionContent className="p-4 bg-surface-dark border-t border-border">
                                        <ul className="list-disc pl-5 space-y-2">
                                            {aethelgardReport.suggestedRemediations.map((rem, index) => (
                                                <li key={index} id={`remediation-${index}`} className="p-3 bg-surface-light rounded-md border border-border">
                                                    <p className={`font-semibold ${getSeverityColorClass(rem.priority)}`}>Priority: {rem.priority}</p>
                                                    <p className="text-text-primary mt-1">{rem.action}</p>
                                                    <p className="text-sm text-text-secondary italic">Justification: {rem.justification}</p>
                                                    {rem.estimatedImpact && <p className="text-xs text-text-tertiary">Estimated Impact: {rem.estimatedImpact}</p>}
                                                    {rem.responsibleTeam && <p className="text-xs text-text-tertiary">Responsible Team: {rem.responsibleTeam}</p>}
                                                    {rem.automationPotential && <p className="text-xs text-text-tertiary">Automation Potential: {rem.automationPotential}</p>}
                                                    {rem.linkedIssues.length > 0 && <p className="text-xs text-text-tertiary">Linked Issues: {rem.linkedIssues.map(id => <a key={id} href={`#${id}`} className="text-accent hover:underline">{id}</a>).join(', ')}</p>}
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            <AccordionItem value="provenance">
                                <AccordionTrigger className="text-lg font-medium flex items-center"><BookOpenIcon className="w-5 h-5 mr-2 text-gray-400" /> Provenance Trace (Ethos Layer)</AccordionTrigger>
                                <AccordionContent className="p-4 bg-surface-dark border-t border-border">
                                    <ul className="list-decimal pl-5 text-sm text-text-secondary">
                                        {aethelgardReport.provenanceTrace.map((trace, index) => (
                                            <li key={index} className="py-1">{trace}</li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Card>
                )}
                
                {/* Debug Info Toggle for Aethelgard Developers */}
                <div className="mt-4 flex justify-end">
                    <Toggle
                        label="Show Debug Information"
                        checked={showDebugInfo}
                        onCheckedChange={setShowDebugInfo}
                        description="For Aethelgard internal diagnostics."
                    />
                </div>

                {showDebugInfo && aethelgardReport && (
                    <Card className="p-6 bg-red-900 bg-opacity-10 border-red-700">
                        <h2 className="text-xl font-bold mb-4 text-red-400 flex items-center">
                            <AlertTriangleIcon className="w-5 h-5 mr-2" /> Aethelgard Internal Debug Log
                        </h2>
                        <pre className="whitespace-pre-wrap break-words text-sm text-red-300 font-mono bg-red-900 p-4 rounded-md">
                            {JSON.stringify(aethelgardReport, null, 2)}
                        </pre>
                    </Card>
                )}
            </div>
        </div>
    );
};

// --- Mock Components for assumed shared library ---
// These components are fully coded and exported within this file, as per the interpretation
// that existing imports must not be touched, and new components should be 'fully coded'
// within this file if they are not covered by existing import paths or explicitly allowed new imports.
// This allows the main component to use them without additional explicit import statements for these specific UIs.

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button
        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ease-in-out
                   bg-primary-500 hover:bg-primary-600 text-white
                   disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
    >
        {children}
    </button>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
    <div
        className={`bg-surface border border-border rounded-lg shadow-md ${className}`}
        {...props}
    >
        {children}
    </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; description?: string }> = ({ label, description, className, ...props }) => (
    <div className="flex flex-col space-y-1">
        {label && <label htmlFor={props.id || props.name} className="text-sm font-medium text-text-secondary">{label}</label>}
        <input
            className={`p-3 bg-surface-dark border border-border rounded-md focus:ring-2 focus:ring-accent focus:outline-none ${className}`}
            {...props}
        />
        {description && <p className="text-xs text-text-tertiary mt-1">{description}</p>}
    </div>
);

export const Toggle: React.FC<{ label: string; checked: boolean; onCheckedChange: (checked: boolean) => void; description?: string }> = ({ label, checked, onCheckedChange, description }) => (
    <div className="flex items-center justify-between p-3 bg-surface-light rounded-md border border-border cursor-pointer select-none" onClick={() => onCheckedChange(!checked)}>
        <div className="flex flex-col flex-grow">
            <span className="font-medium text-text-primary">{label}</span>
            {description && <span className="text-xs text-text-secondary">{description}</span>}
        </div>
        <div className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${checked ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </div>
    </div>
);

// Simplified Select Component for Demo
// In a real application, this would use a library like Headless UI for accessibility and rich features.
export const Select: React.FC<{ label: string; value: string; onValueChange: (value: string) => void; children: React.ReactNode; description?: string }> = ({ label, value, onValueChange, children, description }) => (
    <div className="flex flex-col space-y-1 relative">
        {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
        <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="p-3 bg-surface-dark border border-border rounded-md focus:ring-2 focus:ring-accent focus:outline-none appearance-none pr-8 cursor-pointer text-text-primary"
            style={{ backgroundImage: `url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3e%3cpath d="M6 9l6 6 6-6"/%3e%3c/svg%3e')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em' }}
        >
            {children}
        </select>
        {description && <p className="text-xs text-text-tertiary mt-1">{description}</p>}
    </div>
);

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    // This is a placeholder for the trigger of a custom select. For a native <select>, it just renders children.
    return <>{children}</>;
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
    <span className="block truncate text-text-primary">{placeholder}</span>
);

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // For a native <select>, the options are direct children, so this is just a wrapper for styling purposes if needed for a custom select.
    return <>{children}</>;
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
    <option value={value} className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-text-primary hover:bg-surface-light">
        {children}
    </option>
);

// Simplified Accordion Component for Demo
export const Accordion: React.FC<{ type: 'single' | 'multiple'; defaultValue?: string[]; children: React.ReactNode }> = ({ type, defaultValue, children }) => {
    const [openItems, setOpenItems] = useState<string[]>(defaultValue || []);

    const toggleItem = (value: string) => {
        if (type === 'single') {
            setOpenItems(openItems[0] === value ? [] : [value]);
        } else {
            setOpenItems(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        }
    };

    return (
        <div className="space-y-3">
            {React.Children.map(children, child => {
                if (React.isValidElement(child) && child.type === AccordionItem) {
                    const itemValue = (child.props as { value: string }).value;
                    const isOpen = openItems.includes(itemValue);
                    return React.cloneElement(child as React.ReactElement<any>, {
                        isOpen,
                        toggleOpen: () => toggleItem(itemValue),
                    });
                }
                return child;
            })}
        </div>
    );
};

export const AccordionItem: React.FC<{ value: string; children: React.ReactNode; isOpen?: boolean; toggleOpen?: () => void }> = ({ value, children, isOpen, toggleOpen }) => {
    return (
        <div className="border border-border rounded-md bg-surface">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    if (child.type === AccordionTrigger) {
                        return React.cloneElement(child as React.ReactElement<any>, { isOpen, toggleOpen });
                    }
                    if (child.type === AccordionContent) {
                        return React.cloneElement(child as React.ReactElement<any>, { isOpen });
                    }
                }
                return child;
            })}
        </div>
    );
};

export const AccordionTrigger: React.FC<{ children: React.ReactNode; className?: string; isOpen?: boolean; toggleOpen?: () => void }> = ({ children, className, isOpen, toggleOpen }) => (
    <button
        className={`flex items-center justify-between w-full p-4 text-left font-semibold hover:bg-surface-light transition-colors duration-200 ${className}`}
        onClick={toggleOpen}
    >
        {children}
        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
);

export const AccordionContent: React.FC<{ children: React.ReactNode; className?: string; isOpen?: boolean }> = ({ children, className, isOpen }) => (
    <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
    >
        <div className={`overflow-hidden pb-4 ${className}`}>{children}</div>
    </div>
);