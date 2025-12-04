// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { debugFromErrorLog } from '../../services/api';
import { BugAntIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

// Type definitions for richer contextual input to Aethelgard's debugging service.
// These are interfaces to represent the data structure that would be sent to the backend
// Aethelgard service, even if the frontend passes it as a stringified JSON due to current API constraints.
export interface ProjectContext {
    repoUrl: string;
    branch: string;
    commitId: string;
    filePath: string;
    projectName?: string;
    lastDeployment?: string;
}

export interface AethelgardDebuggingInput {
    errorLog: string;
    codeSnippet: string;
    projectContext: ProjectContext;
    dependencyTree?: string; // e.g., yarn.lock, package-lock.json content or parsed summary
    testResults?: string;    // e.g., JUnit XML, Jest JSON output, or summarized text
    performanceMetrics?: string; // e.g., CPU usage, memory leaks, query times, network latency
    securityScanReport?: string; // e.g., Snyk, Dependabot, SonarQube report snippets
    architecturalGuidelines?: string; // Project-specific architectural rules or patterns
    historicalChanges?: string; // Recent relevant commits, previous bug fixes for similar patterns
    userPersona?: 'developer' | 'qa_engineer' | 'architect' | 'ops_engineer'; // To tailor the response
    severityLevel?: 'critical' | 'high' | 'medium' | 'low'; // User-defined severity
    environment?: 'development' | 'staging' | 'production';
}

// Utility function to parse structured markdown output from Aethelgard.
// This function is designed to work with a long, multi-section markdown string
// and extract content for various states.
export const parseAethelgardAnalysisOutput = (fullOutput: string) => {
    const results: { [key: string]: string } = {};
    const sections = [
        'Overall AI-Powered Debugging Analysis',
        'Root Cause Analysis (Aethelgard\'s Lumina Core & Chronos Engine)',
        'Suggested Fixes (Aethelgard\'s Generative Synthesis)',
        'Proactive Suggestions (Aethelgard\'s Chronos Engine & Ethos Layer)',
        'Ethical & Compliance Insights (Aethelgard\'s Ethos Layer)',
        'Historical Context (Aethelgard\'s Chronos Engine)',
        'Deep Semantic Code Graph Analysis (Aethelgard\'s Lumina Core)',
        'Performance Bottleneck Prediction (Aethelgard\'s Chronos Engine)',
        'Security Vulnerability Assessment (Aethelgard\'s Ethos Layer / Agora Oracle: Security)',
        'Inter-Service Dependency Impact (Aethelgard\'s Agora Network)',
        'Compliance & Governance Review (Aethelgard\'s Ethos Layer)',
        'Dynamic Simulation & "What-If" Scenarios (Aethelgard\'s Chronos Engine)',
        'Project Cohesion & Technical Debt Forecast (Aethelgard\'s Lumina Core & Agora Network)'
    ];

    let currentFullOutput = fullOutput; // Use a mutable copy
    let firstSectionFound = false;

    for (let i = 0; i < sections.length; i++) {
        const currentSectionTitle = `### ${sections[i]}`;
        const nextSectionTitle = i + 1 < sections.length ? `### ${sections[i+1]}` : null;

        const startIndex = currentFullOutput.indexOf(currentSectionTitle);

        if (startIndex !== -1) {
            firstSectionFound = true; // Mark that we've found at least one section
            let endIndex = -1;
            if (nextSectionTitle) {
                endIndex = currentFullOutput.indexOf(nextSectionTitle, startIndex + currentSectionTitle.length);
            }

            let sectionContent;
            if (endIndex !== -1) {
                sectionContent = currentFullOutput.substring(startIndex + currentSectionTitle.length, endIndex).trim();
            } else {
                sectionContent = currentFullOutput.substring(startIndex + currentSectionTitle.length).trim();
            }
            results[sections[i]] = sectionContent;
            currentFullOutput = currentFullOutput.substring(endIndex !== -1 ? endIndex : currentFullOutput.length); // Advance the pointer
        }
    }

    // If no specific section was found, or if there's preamble before the first section,
    // treat it as general analysis.
    if (!firstSectionFound && fullOutput.trim().length > 0) {
        results['Overall AI-Powered Debugging Analysis'] = fullOutput.trim();
    } else if (firstSectionFound) {
        // Capture any introductory text that comes before the very first ### section
        const firstRecognizedSectionHeader = sections.find(s => fullOutput.includes(`### ${s}`));
        if (firstRecognizedSectionHeader) {
            const preambleEndIndex = fullOutput.indexOf(`### ${firstRecognizedSectionHeader}`);
            if (preambleEndIndex > 0) {
                const preamble = fullOutput.substring(0, preambleEndIndex).trim();
                if (preamble) {
                    // Prepend to the overall analysis if it exists, otherwise create it.
                    results['Overall AI-Powered Debugging Analysis'] = (results['Overall AI-Powered Debugging Analysis'] || '') + '\n\n' + preamble;
                    results['Overall AI-Powered Debugging Analysis'] = results['Overall AI-Powered Debugging Analysis'].trim();
                }
            }
        }
    }

    return results;
};


export const AiPoweredCodeDebugger: React.FC = () => {
    const [code, setCode] = useState<string>(`function getUser(id) {\n  const data = fetchData(id);\n  return data.user.name;\n}`);
    const [errorLog, setErrorLog] = useState<string>(`TypeError: Cannot read properties of null (reading 'user')\n    at getUser (components/features/AiPoweredCodeDebugger.tsx:5:10)\n    at callHandler (pages/api/users.ts:23:5)`);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Aethelgard-specific states for enriched context and output
    const [projectContext, setProjectContext] = useState<ProjectContext>({
        repoUrl: 'https://github.com/aethelgard-project/aethelgard-core-services',
        branch: 'aethelgard-dev-main',
        commitId: 'abcdef1234567890abcdef1234567890abcdef',
        filePath: 'src/core/modules/user_management/getUserService.ts',
        projectName: 'Aethelgard User Services',
        lastDeployment: '2023-10-27T10:30:00Z',
    });
    const [dependencyTree, setDependencyTree] = useState<string>(`"lodash": "4.17.21"\n"react": "18.2.0"\n"next": "14.0.0"\n"prisma": "5.5.2"`);
    const [testResults, setTestResults] = useState<string>(`FAIL  src/core/modules/user_management/getUserService.test.ts\n  ✕ Should return user name for valid ID (30ms)\n  ✓ Should return 'Unknown User' for non-existent ID (5ms)\n  ● should warn when fetchData returns null (1ms)`);
    const [performanceMetrics, setPerformanceMetrics] = useState<string>(`Avg. Latency getUser: 250ms (Expected: <100ms)\nCPU Usage (getUserService): 15% (Peak: 30%)\nMemory Footprint (getUserService): 45MB`);
    const [securityScanReport, setSecurityScanReport] = useState<string>(`No critical vulnerabilities detected. Minor issue: Potential data exposure in log statements (Lumina Ethos Layer flagged).`);
    const [architecturalGuidelines, setArchitecturalGuidelines] = useState<string>(`Guideline AG-003: All external data access points must implement robust null/undefined checks and graceful degradation.\nGuideline AG-007: Sensitive PII must not be logged directly. Masking or anonymization required.`);
    const [historicalChanges, setHistoricalChanges] = useState<string>(`Commit 1a2b3c4d by John Doe (2023-10-25): "feat: integrate new external identity provider"\nCommit 5e6f7g8h by Jane Smith (2023-10-20): "refactor: update data fetching utility to version 2.1"`);
    const [userPersona, setUserPersona] = useState<'developer' | 'qa_engineer' | 'architect' | 'ops_engineer'>('developer');
    const [severityLevel, setSeverityLevel] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
    const [environment, setEnvironment] = useState<'development' | 'staging' | 'production'>('production');


    // Detailed analysis states for structured output
    const [rootCauseAnalysis, setRootCauseAnalysis] = useState<string>('');
    const [suggestedFixes, setSuggestedFixes] = useState<string>('');
    const [proactiveSuggestions, setProactiveSuggestions] = useState<string>('');
    const [ethicalReviewInsights, setEthicalReviewInsights] = useState<string>('');
    const [historicalContextOutput, setHistoricalContextOutput] = useState<string>(''); // Renamed to avoid conflict with input state
    const [semanticGraphAnalysis, setSemanticGraphAnalysis] = useState<string>('');
    const [perfBottleneckPrediction, setPerfBottleneckPrediction] = useState<string>('');
    const [securityVulnerabilityAssessment, setSecurityVulnerabilityAssessment] = useState<string>('');
    const [interServiceDependencyImpact, setInterServiceDependencyImpact] = useState<string>('');
    const [complianceGovernanceReview, setComplianceGovernanceReview] = useState<string>('');
    const [dynamicSimulationScenarios, setDynamicSimulationScenarios] = useState<string>('');
    const [projectCohesionForecast, setProjectCohesionForecast] = useState<string>('');

    // Tabs for displaying different aspects of the analysis
    const [activeTab, setActiveTab] = useState<string>('analysis'); // 'analysis', 'rootCause', 'fixes', 'proactive', 'ethical', 'history', etc.

    // A comprehensive mapping of tab names to their corresponding state setters
    const tabStateMap: { [key: string]: React.Dispatch<React.SetStateAction<string>> } = {
        'analysis': setAnalysis,
        'rootCause': setRootCauseAnalysis,
        'fixes': setSuggestedFixes,
        'proactive': setProactiveSuggestions,
        'ethical': setEthicalReviewInsights,
        'history': setHistoricalContextOutput,
        'semanticGraph': setSemanticGraphAnalysis,
        'performance': setPerfBottleneckPrediction,
        'security': setSecurityVulnerabilityAssessment,
        'dependencyImpact': setInterServiceDependencyImpact,
        'compliance': setComplianceGovernanceReview,
        'simulation': setDynamicSimulationScenarios,
        'cohesion': setProjectCohesionForecast,
    };

    const handleDebug = useCallback(async () => {
        if (!code.trim() || !errorLog.trim()) {
            setError('Please provide both code and an error log for Aethelgard to begin analysis.');
            return;
        }
        setIsLoading(true);
        setError('');
        // Clear all previous analysis outputs
        Object.values(tabStateMap).forEach(setter => setter(''));

        try {
            // Construct the rich input payload for the Aethelgard backend service
            const inputPayload: AethelgardDebuggingInput = {
                errorLog,
                codeSnippet: code,
                projectContext,
                dependencyTree,
                testResults,
                performanceMetrics,
                securityScanReport,
                architecturalGuidelines,
                historicalChanges,
                userPersona,
                severityLevel,
                environment,
            };

            // Call the enhanced debugFromErrorLog service.
            // We assume the service on the backend is "Aethelgard" and can process this rich payload
            // and return a comprehensive, structured markdown stream or string.
            // Due to "no imports" constraint, we're stringifying the payload and assuming `debugFromErrorLog`
            // on the backend is intelligent enough to parse it and return a single, large markdown string.
            const stream = debugFromErrorLog(JSON.stringify(inputPayload));

            let fullResponseAccumulator = '';
            for await (const chunk of stream) {
                fullResponseAccumulator += chunk;
                // As chunks arrive, update the main analysis view to show progress
                setAnalysis(fullResponseAccumulator);
            }

            // After receiving the full response (simulated as one large string),
            // parse it into different sections for display in respective tabs.
            const parsedSections = parseAethelgardAnalysisOutput(fullResponseAccumulator);

            // Update all specific analysis states
            tabStateMap['analysis'](parsedSections['Overall AI-Powered Debugging Analysis'] || '');
            tabStateMap['rootCause'](parsedSections['Root Cause Analysis (Aethelgard\'s Lumina Core & Chronos Engine)'] || '');
            tabStateMap['fixes'](parsedSections['Suggested Fixes (Aethelgard\'s Generative Synthesis)'] || '');
            tabStateMap['proactive'](parsedSections['Proactive Suggestions (Aethelgard\'s Chronos Engine & Ethos Layer)'] || '');
            tabStateMap['ethical'](parsedSections['Ethical & Compliance Insights (Aethelgard\'s Ethos Layer)'] || '');
            tabStateMap['history'](parsedSections['Historical Context (Aethelgard\'s Chronos Engine)'] || '');
            tabStateMap['semanticGraph'](parsedSections['Deep Semantic Code Graph Analysis (Aethelgard\'s Lumina Core)'] || '');
            tabStateMap['performance'](parsedSections['Performance Bottleneck Prediction (Aethelgard\'s Chronos Engine)'] || '');
            tabStateMap['security'](parsedSections['Security Vulnerability Assessment (Aethelgard\'s Ethos Layer / Agora Oracle: Security)'] || '');
            tabStateMap['dependencyImpact'](parsedSections['Inter-Service Dependency Impact (Aethelgard\'s Agora Network)'] || '');
            tabStateMap['compliance'](parsedSections['Compliance & Governance Review (Aethelgard\'s Ethos Layer)'] || '');
            tabStateMap['simulation'](parsedSections['Dynamic Simulation & "What-If" Scenarios (Aethelgard\'s Chronos Engine)'] || '');
            tabStateMap['cohesion'](parsedSections['Project Cohesion & Technical Debt Forecast (Aethelgard\'s Lumina Core & Agora Network)'] || '');

            // Set the active tab to a meaningful default after a successful analysis
            setActiveTab('rootCause');

        } catch (err) {
            setError(err instanceof Error ? `Aethelgard encountered an error: ${err.message}` : 'Aethelgard encountered an unknown error during analysis.');
            console.error('Aethelgard Debugger Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [
        code, errorLog, projectContext, dependencyTree, testResults, performanceMetrics,
        securityScanReport, architecturalGuidelines, historicalChanges, userPersona,
        severityLevel, environment, tabStateMap // tabStateMap is stable due to constant keys/setters
    ]);

    // Define the full list of tabs dynamically
    const allTabs = [
        { id: 'analysis', label: 'Overview', content: analysis },
        { id: 'rootCause', label: 'Root Cause', content: rootCauseAnalysis },
        { id: 'fixes', label: 'Suggested Fixes', content: suggestedFixes },
        { id: 'proactive', label: 'Proactive', content: proactiveSuggestions },
        { id: 'ethical', label: 'Ethical Review', content: ethicalReviewInsights },
        { id: 'history', label: 'History', content: historicalContextOutput },
        { id: 'semanticGraph', label: 'Code Graph', content: semanticGraphAnalysis },
        { id: 'performance', label: 'Performance', content: perfBottleneckPrediction },
        { id: 'security', label: 'Security', content: securityVulnerabilityAssessment },
        { id: 'dependencyImpact', label: 'Dependency Impact', content: interServiceDependencyImpact },
        { id: 'compliance', label: 'Compliance', content: complianceGovernanceReview },
        { id: 'simulation', label: 'Simulation', content: dynamicSimulationScenarios },
        { id: 'cohesion', label: 'Project Cohesion', content: projectCohesionForecast },
    ];

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary aethelgard-debugger-container">
            <header className="mb-6 aethelgard-header">
                <h1 className="text-3xl font-bold flex items-center aethelgard-title">
                    <BugAntIcon className="aethelgard-icon w-8 h-8 md:w-10 md:h-10 text-accent" />
                    <span className="ml-3 text-headline-primary">Aethelgard: Unified Cognitive Debugging Nexus</span>
                </h1>
                <p className="text-text-secondary mt-2 text-md leading-relaxed aethelgard-subtitle">
                    Aethelgard weaves together Lumina's semantic understanding, Agora's federated intelligence, Chronos' temporal reasoning, and Ethos' ethical alignment to provide an unparalleled debugging experience. Submit your code context to unlock deep insights and forge a more resilient future.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow min-h-0 aethelgard-main-grid">
                {/* Input Column: Enhanced Context Providers */}
                <div className="flex flex-col gap-6 aethelgard-input-column p-4 bg-surface rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-headline-secondary border-b border-border pb-3 mb-3">Contextual Input Providers (Lumina Core & Agora Network)</h2>

                    {/* Error Log */}
                    <div className="aethelgard-input-section">
                        <label htmlFor="error-input" className="text-sm font-medium text-text-secondary mb-2 block">Error Log / Message <span className="text-accent">(Lumina Core Input)</span></label>
                        <textarea id="error-input" value={errorLog} onChange={e => setErrorLog(e.target.value)} className="w-full p-3 bg-background border border-border rounded-md resize-y font-mono text-sm min-h-[100px] shadow-inner focus:ring-2 focus:ring-accent focus:border-transparent transition-all" rows={4} placeholder="Paste your error log here, including stack traces for maximum context..."/>
                    </div>

                    {/* Related Code */}
                    <div className="aethelgard-input-section">
                        <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2 block">Related Code Snippet <span className="text-accent">(Lumina Core Input)</span></label>
                        <textarea id="code-input" value={code} onChange={e => setCode(e.target.value)} className="w-full p-3 bg-background border border-border rounded-md resize-y font-mono text-sm h-48 min-h-[180px] shadow-inner focus:ring-2 focus:ring-accent focus:border-transparent transition-all" placeholder="Provide the code snippet relevant to the error..."/>
                    </div>

                    {/* Project & Version Control Context */}
                    <div className="aethelgard-input-section grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="text-md font-medium text-headline-tertiary col-span-full">Project & Version Control <span className="text-accent">(Chronos Engine & Agora Oracles)</span></h3>
                        <div>
                            <label htmlFor="repo-url-input" className="text-xs font-medium text-text-tertiary mb-1 block">Repository URL</label>
                            <input id="repo-url-input" type="text" value={projectContext.repoUrl} onChange={e => setProjectContext(prev => ({ ...prev, repoUrl: e.target.value }))} className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm shadow-inner focus:ring-1 focus:ring-accent" placeholder="e.g., https://github.com/org/repo"/>
                        </div>
                        <div>
                            <label htmlFor="branch-input" className="text-xs font-medium text-text-tertiary mb-1 block">Branch / Commit ID</label>
                            <input id="branch-input" type="text" value={projectContext.branch} onChange={e => setProjectContext(prev => ({ ...prev, branch: e.target.value }))} className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm shadow-inner focus:ring-1 focus:ring-accent" placeholder="e.g., main, feature/bug-fix, or full commit hash"/>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                             <label htmlFor="file-path-input" className="text-xs font-medium text-text-tertiary mb-1 block">Affected File Path</label>
                             <input id="file-path-input" type="text" value={projectContext.filePath} onChange={e => setProjectContext(prev => ({ ...prev, filePath: e.target.value }))} className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm shadow-inner focus:ring-1 focus:ring-accent" placeholder="e.g., src/components/MyComponent.tsx"/>
                         </div>
                        <div>
                             <label htmlFor="project-name-input" className="text-xs font-medium text-text-tertiary mb-1 block">Project Name</label>
                             <input id="project-name-input" type="text" value={projectContext.projectName} onChange={e => setProjectContext(prev => ({ ...prev, projectName: e.target.value }))} className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm shadow-inner focus:ring-1 focus:ring-accent" placeholder="e.g., Aethelgard Frontend"/>
                         </div>
                        <div>
                             <label htmlFor="last-deployment-input" className="text-xs font-medium text-text-tertiary mb-1 block">Last Deployment Time</label>
                             <input id="last-deployment-input" type="datetime-local" value={projectContext.lastDeployment ? new Date(projectContext.lastDeployment).toISOString().slice(0, 16) : ''} onChange={e => setProjectContext(prev => ({ ...prev, lastDeployment: e.target.value ? new Date(e.target.value).toISOString() : '' }))} className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm shadow-inner focus:ring-1 focus:ring-accent"/>
                         </div>
                    </div>

                    {/* Technical & Operational Context */}
                    <div className="aethelgard-input-section grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="text-md font-medium text-headline-tertiary col-span-full">Technical & Operational Context <span className="text-accent">(Agora Oracles & Chronos Engine)</span></h3>
                        <div>
                            <label htmlFor="dependencies-input" className="text-xs font-medium text-text-tertiary mb-1 block">Dependencies (Summary or snippet)</label>
                            <textarea id="dependencies-input" value={dependencyTree} onChange={e => setDependencyTree(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md resize-y font-mono text-sm min-h-[60px] shadow-inner focus:ring-1 focus:ring-accent" rows={2} placeholder="e.g., lodash: ^4.17.21&#10;react: ^18.2.0"/>
                        </div>
                        <div>
                            <label htmlFor="test-results-input" className="text-xs font-medium text-text-tertiary mb-1 block">Recent Test Results</label>
                            <textarea id="test-results-input" value={testResults} onChange={e => setTestResults(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md resize-y font-mono text-sm min-h-[60px] shadow-inner focus:ring-1 focus:ring-accent" rows={2} placeholder="e.g., FAIL: getUser for invalid id"/>
                        </div>
                        <div>
                            <label htmlFor="perf-metrics-input" className="text-xs font-medium text-text-tertiary mb-1 block">Performance Metrics</label>
                            <textarea id="perf-metrics-input" value={performanceMetrics} onChange={e => setPerformanceMetrics(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md resize-y font-mono text-sm min-h-[60px] shadow-inner focus:ring-1 focus:ring-accent" rows={2} placeholder="e.g., High latency on getUser(id), memory spikes"/>
                        </div>
                        <div>
                            <label htmlFor="security-scan-input" className="text-xs font-medium text-text-tertiary mb-1 block">Security Scan Report Snippets</label>
                            <textarea id="security-scan-input" value={securityScanReport} onChange={e => setSecurityScanReport(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md resize-y font-mono text-sm min-h-[60px] shadow-inner focus:ring-1 focus:ring-accent" rows={2} placeholder="e.g., XSS detected in line 42, no critical vulnerabilities"/>
                        </div>
                        <div className="col-span-full">
                            <label htmlFor="arch-guidelines-input" className="text-xs font-medium text-text-tertiary mb-1 block">Architectural Guidelines / Standards</label>
                            <textarea id="arch-guidelines-input" value={architecturalGuidelines} onChange={e => setArchitecturalGuidelines(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md resize-y font-mono text-sm min-h-[60px] shadow-inner focus:ring-1 focus:ring-accent" rows={2} placeholder="e.g., All external data access must be validated. Avoid deep nesting."/>
                        </div>
                        <div className="col-span-full">
                            <label htmlFor="historical-changes-input" className="text-xs font-medium text-text-tertiary mb-1 block">Relevant Historical Changes (Commits/Issues)</label>
                            <textarea id="historical-changes-input" value={historicalChanges} onChange={e => setHistoricalChanges(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md resize-y font-mono text-sm min-h-[60px] shadow-inner focus:ring-1 focus:ring-accent" rows={2} placeholder="e.g., Commit 1a2b3c4d: 'Updated user service API'"/>
                        </div>
                    </div>

                    {/* User & Environment Preferences */}
                    <div className="aethelgard-input-section grid grid-cols-1 md:grid-cols-3 gap-4">
                        <h3 className="text-md font-medium text-headline-tertiary col-span-full">Aethelgard Persona & Environment <span className="text-accent">(Ethos Layer & Lumina Core)</span></h3>
                        <div>
                            <label htmlFor="user-persona-select" className="text-xs font-medium text-text-tertiary mb-1 block">My Persona</label>
                            <select id="user-persona-select" value={userPersona} onChange={e => setUserPersona(e.target.value as typeof userPersona)} className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm shadow-inner focus:ring-1 focus:ring-accent">
                                <option value="developer">Developer</option>
                                <option value="qa_engineer">QA Engineer</option>
                                <option value="architect">Architect</option>
                                <option value="ops_engineer">Operations Engineer</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="severity-level-select" className="text-xs font-medium text-text-tertiary mb-1 block">Severity Level</label>
                            <select id="severity-level-select" value={severityLevel} onChange={e => setSeverityLevel(e.target.value as typeof severityLevel)} className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm shadow-inner focus:ring-1 focus:ring-accent">
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="environment-select" className="text-xs font-medium text-text-tertiary mb-1 block">Environment</label>
                            <select id="environment-select" value={environment} onChange={e => setEnvironment(e.target.value as typeof environment)} className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm shadow-inner focus:ring-1 focus:ring-accent">
                                <option value="development">Development</option>
                                <option value="staging">Staging</option>
                                <option value="production">Production</option>
                            </select>
                        </div>
                    </div>

                    <button onClick={handleDebug} disabled={isLoading} className="btn-primary w-full py-3 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-accent/50 aethelgard-debug-button">
                        {isLoading ? <LoadingSpinner /> : 'Engage Aethelgard: Orchestrate Deep Cognitive Debugging'}
                    </button>
                    {error && <p className="text-red-500 mt-3 text-center text-sm font-medium animate-pulse aethelgard-error-message">{error}</p>}
                </div>

                {/* Output Column: Aethelgard Analysis & Insights */}
                <div className="flex flex-col aethelgard-output-column p-4 bg-surface rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-headline-secondary border-b border-border pb-3 mb-3">Aethelgard Cognitive Analysis & Recommendations</h2>

                    <div className="flex flex-wrap border-b border-border aethelgard-tabs mb-4 -mx-2"> {/* Added negative margin to compensate for button padding */}
                        {allTabs.filter(tab => tab.content || activeTab === tab.id).map(tab => ( // Only show tabs with content or the currently active tab
                            <button
                                key={tab.id}
                                className={`px-3 py-2 text-xs md:text-sm font-medium rounded-t-md mx-1 mb-1 transition-colors duration-200
                                            ${activeTab === tab.id
                                                ? 'bg-background border-b-2 border-accent text-accent shadow-inner'
                                                : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                                            }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-grow p-4 bg-background border border-border rounded-b-md overflow-y-auto min-h-[300px] shadow-inner aethelgard-analysis-output">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full text-accent-light"><LoadingSpinner /><p className="ml-3">Aethelgard is synthesizing... Please wait.</p></div>
                        ) : (
                            <>
                                {allTabs.find(tab => tab.id === activeTab)?.content ? (
                                    <MarkdownRenderer content={allTabs.find(tab => tab.id === activeTab)!.content} />
                                ) : (
                                    <p className="text-text-secondary italic text-center py-8">
                                        {error ? `Aethelgard could not complete the analysis. ${error}` : 'Aethelgard\'s deep cognitive analysis will appear here. Submit your context to begin.'}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Aethelgard Global Nexus Insights Footer */}
            <footer className="mt-8 pt-6 border-t border-border aethelgard-footer bg-surface rounded-lg shadow-lg p-4">
                <h3 className="text-xl font-semibold text-headline-secondary mb-4 text-center">Aethelgard Global Nexus: Operational Synthesis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-sm text-text-tertiary">
                    {/* Lumina Core Status */}
                    <div className="bg-background p-4 rounded-md shadow-sm border border-border-light">
                        <p className="font-medium text-accent mb-1">Lumina Core Status:</p>
                        <p className="text-text-primary">Semantic processing active. Ontology refinement: <span className="text-green-400">+0.02%</span> since last hour, integrating <span className="font-mono text-xs">~2M</span> new relational entities. Contextual recall efficiency: <span className="text-green-400">99.8%</span>.</p>
                        <p className="text-xs text-text-secondary mt-1 italic">Interpreting universe of ideas, meticulously crafted.</p>
                    </div>
                    {/* Agora Network Load */}
                    <div className="bg-background p-4 rounded-md shadow-sm border border-border-light">
                        <p className="font-medium text-accent mb-1">Agora Network Load:</p>
                        <p className="text-text-primary"><span className="font-semibold">347</span> Specialized Oracles actively engaged in <span className="font-mono text-xs">1,200+</span> collaborative intelligence tasks. Distributed consensus latency: <span className="text-green-400">12ms</span>. Peak utilization: <span className="text-yellow-400">88%</span>.</p>
                        <p className="text-xs text-text-secondary mt-1 italic">Federated intelligence, dynamic resource allocation.</p>
                    </div>
                    {/* Chronos Engine Activity */}
                    <div className="bg-background p-4 rounded-md shadow-sm border border-border-light">
                        <p className="font-medium text-accent mb-1">Chronos Engine Activity:</p>
                        <p className="text-text-primary">Temporal reasoning models updating. Predictive accuracy: <span className="text-green-400">92.7%</span>. New event horizon forecasts: <span className="font-semibold">18</span> critical, <span className="font-semibold">45</span> high-impact. Counterfactual simulations run: <span className="font-mono text-xs">~50K</span>.</p>
                        <p className="text-xs text-text-secondary mt-1 italic">Temporal reasoning and predictive synthesis.</p>
                    </div>
                    {/* Ethos Layer Compliance */}
                    <div className="bg-background p-4 rounded-md shadow-sm border border-border-light">
                        <p className="font-medium text-accent mb-1">Ethos Layer Compliance:</p>
                        <p className="text-text-primary">All active processes are <span className="text-green-400">100% compliant</span> with Aethelgard's ethical guidelines. Bias detection mechanisms: <span className="text-orange-400">Active Monitoring (level 3)</span>. Human-in-loop interventions: <span className="font-semibold">0</span> critical overrides in last 24h.</p>
                        <p className="text-xs text-text-secondary mt-1 italic">Intrinsic alignment and ethical guidelines.</p>
                    </div>
                    {/* Human-AI Collaboration */}
                    <div className="bg-background p-4 rounded-md shadow-sm border border-border-light">
                        <p className="font-medium text-accent mb-1">Human-AI Collaboration:</p>
                        <p className="text-text-primary">Average human feedback score: <span className="text-green-400">4.9/5</span>. Active collaborative sessions: <span className="font-semibold">12</span>. AI-driven task augmentation rate: <span className="text-green-400">78%</span>. Learning from human context: <span className="font-semibold">Enabled</span>.</p>
                        <p className="text-xs text-text-secondary mt-1 italic">Profound symbiosis, empowering human creativity.</p>
                    </div>
                    {/* Cross-Disciplinary Synapses */}
                    <div className="bg-background p-4 rounded-md shadow-sm border border-border-light">
                        <p className="font-medium text-accent mb-1">Cross-Disciplinary Synapses:</p>
                        <p className="text-text-primary">New analogical connections identified by Generative Synthesis: <span className="font-semibold">17</span> (e.g., fluid dynamics to network routing, neural pathways to semantic graphs). Multi-domain hypothesis generation: <span className="font-semibold">Active</span>.</p>
                        <p className="text-xs text-text-secondary mt-1 italic">Unlocking universal knowledge, diverse perspectives.</p>
                    </div>
                    {/* Data Weaving & Semantic Fabric */}
                    <div className="bg-background p-4 rounded-md shadow-sm border border-border-light">
                        <p className="font-medium text-accent mb-1">Data Weaving & Semantic Fabric:</p>
                        <p className="text-text-primary">Heterogeneous source integration: <span className="text-green-400">99.9%</span> uptime. Data normalization throughput: <span className="font-mono text-xs">1.5 TB/hr</span>. Ontological alignment success: <span className="text-green-400">98.5%</span>. Confidence scoring enabled.</p>
                        <p className="text-xs text-text-secondary mt-1 italic">Beyond information silos, into unified understanding.</p>
                    </div>
                     {/* Predictive Refinement Cycles */}
                    <div className="bg-background p-4 rounded-md shadow-sm border border-border-light">
                        <p className="font-medium text-accent mb-1">Predictive Refinement Cycles:</p>
                        <p className="text-text-primary">Adaptive reasoning iterations: <span className="font-semibold">3,200+</span> daily. Targeted information seeking: <span className="text-blue-400">Optimized</span>. Self-correction mechanisms: <span className="text-green-400">Fully engaged</span>. Parameter recalibrations: <span className="font-semibold">67</span> in last 6 hours.</p>
                        <p className="text-xs text-text-secondary mt-1 italic">Learning in the wild, perpetual evolution.</p>
                    </div>
                </div>
                <p className="text-xs text-text-tertiary mt-6 text-center leading-relaxed">
                    Aethelgard v0.9.1.5 BETA - Collaborative Intelligence Framework: Architecting Tomorrow's Horizon. Forged by human ingenuity, augmented by digital intellect. This system is designed for deep understanding, ethical decision-making, and proactive problem-solving, guided by a commitment to human flourishing. <span className="font-semibold text-text-primary">A million ideas, meticulously crafted, ethically grounded, and perpetually evolving.</span>
                </p>
            </footer>
        </div>
    );
};