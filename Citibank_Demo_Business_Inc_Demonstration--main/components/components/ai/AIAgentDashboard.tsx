/**
 * This module implements a comprehensive dashboard for managing and monitoring the lifecycle and performance
 * of autonomous AI agents within a sophisticated enterprise ecosystem. It provides real-time insights into agent
 * health, task execution, resource allocation, and ethical compliance.
 *
 * Business value: This dashboard is a critical control plane for an agentic AI system, enabling rapid
 * operational oversight, anomaly detection, and intervention. It directly contributes to millions in value by:
 * - **Ensuring operational resilience**: Provides immediate visibility into agent status and performance,
 *   reducing downtime and accelerating resolution of issues.
 * - **Optimizing resource utilization**: Facilitates efficient allocation and monitoring of computational
 *   resources, leading to significant cost savings.
 * - **Enhancing ethical governance**: Offers tools to track ethical compliance and intervene in case of
 *   violations, safeguarding brand reputation and ensuring regulatory adherence.
 * - **Improving decision velocity**: Allows human operators to quickly understand agent activities and
 *   intervene, augmenting human decision-making and accelerating business processes.
 * - **Enabling new service models**: By providing robust management for autonomous agents, it underpins the
 *   development and scaling of innovative, agent-driven financial services and operational efficiencies,
 *   generating new revenue streams.
 * - **Security and auditability**: Integrates with system-wide logging and identity frameworks to provide
 *   a tamper-evident audit trail for all agent actions and system changes, critical for compliance and trust.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAI, AIContextValue, AIAgent, AITask, AIModelConfig, AIUserProfile, AIEvent } from '../AIWrapper';

/**
 * Generates a unique, random ID for various entities within the system.
 */
const generateRandomId = (prefix: string = 'id'): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

/**
 * Represents a specific system health metric.
 */
export type AISystemHealthMetric = {
    id: string;
    name: string;
    value: number | string;
    unit?: string;
    timestamp: number;
    status: 'ok' | 'warning' | 'critical';
};

/**
 * Describes an ethical violation detected in an AI agent's operation.
 */
export type AIEthicalViolation = {
    id: string;
    agentId: string;
    rule: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    actionTaken: string;
    context: any; // Additional contextual data
};

/**
 * Represents an entry in the system-wide audit log.
 */
export type AIAuditLogEntry = {
    id: string;
    timestamp: number;
    actorId: string; // User ID or Agent ID
    action: string;
    targetId?: string; // ID of the entity acted upon (e.g., agent, task)
    details: any;
    isTamperEvident: boolean; // Simulation of tamper-evident property (e.g., chained hash)
    previousHash?: string; // For chained hash simulation
};

/**
 * Summarizes an agent's financial activities.
 */
export type AIAgentFinancialSummary = {
    agentId: string;
    totalTransactionsInitiated: number;
    totalValueTransacted: string; // e.g., "USD 12345.67"
    pendingTransactions: number;
    fraudFlagsRaised: number;
    lastReconciliationStatus: 'ok' | 'pending' | 'error';
};

/**
 * Defines possible user roles for access control.
 */
export type UserRole = 'admin' | 'operator' | 'viewer';

/**
 * Determines if a user has permission for a specific action.
 */
const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
    const roleHierarchy = {
        'viewer': 0,
        'operator': 1,
        'admin': 2,
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Renders a compact display of an agent's current health and performance metrics,
 * including a feedback mechanism for operators.
 */
const AgentHealthMonitor: React.FC<{ agent: AIAgent; onFeedbackSubmit: (agentId: string, feedback: string) => void }> = ({ agent, onFeedbackSubmit }) => {
    const [feedback, setFeedback] = useState<string>('');
    const [showAdvancedMetrics, setShowAdvancedMetrics] = useState<boolean>(false);

    const memoryUsage = agent.resourceAllocation?.memoryGB ? (agent.memoryCapacity / agent.resourceAllocation.memoryGB * 100).toFixed(2) : 'N/A';
    const cpuUsage = (Math.random() * 100).toFixed(2);
    const networkLatency = (Math.random() * 50 + 10).toFixed(0);

    const handleSubmitFeedback = () => {
        if (feedback.trim()) {
            onFeedbackSubmit(agent.id, feedback);
            setFeedback('');
        }
    };

    return (
        <div style={{ border: '1px solid #555', borderRadius: '5px', padding: '15px', marginBottom: '20px', background: '#3c404c' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#61dafb' }}>Agent Health & Performance</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                    <strong>Status:</strong> <span style={{ color: agent.status === 'idle' ? 'lightgreen' : agent.status === 'busy' ? 'orange' : 'gray' }}>{agent.status.toUpperCase()}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <strong>Trust Score:</strong> <span style={{ color: agent.trustScore > 0.7 ? 'lightgreen' : agent.trustScore > 0.4 ? 'orange' : 'red' }}>{(agent.trustScore * 100).toFixed(1)}%</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <strong>Emotional State:</strong> <span style={{ color: agent.emotionalState === 'calm' ? 'lightgreen' : agent.emotionalState === 'stressed' ? 'orange' : 'red' }}>{agent.emotionalState}</span>
                </div>
            </div>
            <button
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                style={{ ...buttonStyle, background: '#555', fontSize: '0.85em', padding: '8px 12px', margin: '0 0 10px 0' }}
            >
                {showAdvancedMetrics ? 'Hide Advanced Metrics' : 'Show Advanced Metrics'}
            </button>
            {showAdvancedMetrics && (
                <div style={{ background: '#4a4f5c', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                    <p><strong>Memory Usage:</strong> {memoryUsage}%</p>
                    <p><strong>CPU Usage:</strong> {cpuUsage}%</p>
                    <p><strong>Network Latency:</strong> {networkLatency}ms</p>
                    <p><strong>Learning Rate:</strong> {(agent.learningRate * 100).toFixed(2)}%</p>
                    <p><strong>Memory Capacity:</strong> {agent.memoryCapacity} units</p>
                    {agent.hardwareIntegration && (
                        <div>
                            <strong>Hardware Integration:</strong> {agent.hardwareIntegration.deviceType} (Enabled: {agent.hardwareIntegration.isEnabled ? 'Yes' : 'No'})
                        </div>
                    )}
                </div>
            )}
            <div style={{ marginTop: '15px' }}>
                <textarea
                    placeholder="Provide feedback or instructions..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    style={inputStyle}
                />
                <button
                    onClick={handleSubmitFeedback}
                    style={{ ...buttonStyle, background: '#61dafb', width: '100%', marginTop: '5px' }}
                >
                    Submit Feedback
                </button>
            </div>
        </div>
    );
};

/**
 * Displays a filtered list of recent activity logs for a specific agent.
 */
const AgentLogsDisplay: React.FC<{ agentId: string; logs: AIEvent[] }> = ({ agentId, logs }) => {
    const filteredLogs = useMemo(() => logs.filter(log => log.payload?.agentId === agentId || log.payload?.targetAgentId === agentId), [agentId, logs]);

    return (
        <div style={{ border: '1px solid #555', borderRadius: '5px', padding: '15px', marginBottom: '20px', background: '#3c404c' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#61dafb' }}>Recent Activity Log</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#282c34', padding: '10px', borderRadius: '4px' }}>
                {filteredLogs.length === 0 ? (
                    <p style={{ color: '#bbb' }}>No recent logs for this agent.</p>
                ) : (
                    filteredLogs.map((log, index) => (
                        <div key={index} style={{ marginBottom: '8px', borderBottom: '1px dashed #4a4f5c', paddingBottom: '8px' }}>
                            <div style={{ fontSize: '0.8em', color: '#999' }}>{new Date(log.timestamp || Date.now()).toLocaleTimeString()} - {log.type}</div>
                            <div style={{ fontSize: '0.9em', color: '#ddd' }}>Source: {log.source}</div>
                            <div style={{ fontSize: '0.9em', color: '#ccc', wordBreak: 'break-all' }}>Payload: {JSON.stringify(log.payload, null, 2)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

/**
 * Provides an overview of an agent's digital identity and security posture.
 */
const AgentIdentitySecurityDisplay: React.FC<{ agent: AIAgent }> = ({ agent }) => {
    // In a real system, this would fetch actual identity details (e.g., public key hash)
    // from an Identity Management service using the agent.id
    const mockPublicKeyHash = useMemo(() => {
        const hash = agent.id.split('').reduce((acc, char) => (acc + char.charCodeAt(0)), 0).toString(16);
        return `0x${hash.padEnd(64, '0').substring(0,64)}`;
    }, [agent.id]);

    return (
        <div style={{ border: '1px solid #555', borderRadius: '5px', padding: '15px', marginBottom: '20px', background: '#3c404c' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#61dafb' }}>Digital Identity & Security</h4>
            <p><strong>Public Key Hash:</strong> <span style={{fontFamily: 'monospace'}}>{mockPublicKeyHash}</span></p>
            <p><strong>Security Clearance:</strong> <span style={{color: agent.securityClearance === 'level_5' ? 'red' : agent.securityClearance === 'level_1' ? 'lightgreen' : 'orange'}}>{agent.securityClearance?.toUpperCase() || 'N/A'}</span></p>
            <p><strong>Ethical Guidelines:</strong> {agent.ethicalGuidelines || 'N/A'}</p>
            <p><strong>Is Autonomous:</strong> {agent.isAutonomous ? 'Yes' : 'No'}</p>
            <p><strong>Associated User ID (Owner):</strong> {agent.ownerUserId || 'System'}</p>
            {/* Further details like last audit, security incidents, RBAC capabilities */}
        </div>
    );
};

/**
 * Simulates and displays an agent's financial summary.
 */
const AgentFinancialSummaryDisplay: React.FC<{ summary: AIAgentFinancialSummary | null }> = ({ summary }) => {
    if (!summary) return null;

    return (
        <div style={{ border: '1px solid #555', borderRadius: '5px', padding: '15px', marginBottom: '20px', background: '#3c404c' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#61dafb' }}>Financial Activity Overview</h4>
            <p><strong>Transactions Initiated:</strong> {summary.totalTransactionsInitiated}</p>
            <p><strong>Total Value Transacted:</strong> {summary.totalValueTransacted}</p>
            <p><strong>Pending Transactions:</strong> {summary.pendingTransactions}</p>
            <p><strong>Fraud Flags Raised:</strong> <span style={{color: summary.fraudFlagsRaised > 0 ? 'red' : 'lightgreen'}}>{summary.fraudFlagsRaised}</span></p>
            <p><strong>Last Reconciliation:</strong> <span style={{color: summary.lastReconciliationStatus === 'ok' ? 'lightgreen' : 'red'}}>{summary.lastReconciliationStatus.toUpperCase()}</span></p>
        </div>
    );
};

/**
 * A React component providing a user interface to monitor, configure, and interact with various AI agents
 * managed by the AutonomousAgentOrchestrator. This dashboard is a central hub for operators to maintain
 * system stability, ethical compliance, and overall performance.
 */
const AIAgentDashboard: React.FC = () => {
    const ai: AIContextValue = useAI();
    const {
        agentOrchestrator,
        modelManager,
        ethicalAILayer,
        aiEventLogger,
        userProfile,
    } = ai;

    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [allTasks, setAllTasks] = useState<AITask[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
    const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'agents' | 'tasks' | 'system'>('agents');
    const [showNewAgentModal, setShowNewAgentModal] = useState<boolean>(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
    const [agentToDelete, setAgentToDelete] = useState<AIAgent | null>(null);

    const currentUserRole: UserRole = (userProfile?.role as UserRole) || 'viewer';

    // State for new task creation
    const [newTaskData, setNewTaskData] = useState<{
        name: string;
        description: string;
        priority: AITask['priority'];
        dataSensitivity: AITask['securityContext']['dataSensitivity'];
        assignToAgentId: string;
        requiredModelId: string;
        rewardBounty: number; // New field for token rail integration
    }>({
        name: '',
        description: '',
        priority: 'medium',
        dataSensitivity: 'internal',
        assignToAgentId: '',
        requiredModelId: '',
        rewardBounty: 0,
    });

    // State for new agent creation
    const [newAgentData, setNewAgentData] = useState<Partial<AIAgent>>({
        name: '',
        persona: '',
        role: 'planner',
        capabilities: [],
        status: 'idle',
        isAutonomous: true,
        memoryCapacity: 100,
        learningRate: 0.05,
        emotionalState: 'calm',
        ethicalGuidelines: 'adaptive',
        securityClearance: 'level_1',
        resourceAllocation: {
            computeUnits: 1,
            memoryGB: 2,
            networkBandwidthMbps: 100,
        },
        trustScore: 0.5,
        ownerUserId: userProfile?.userId, // Assign current user as owner
    });
    const [newAgentCapabilitiesInput, setNewAgentCapabilitiesInput] = useState<string>('');

    // State for updating selected agent
    const [updatedAgentConfig, setUpdatedAgentConfig] = useState<Partial<AIAgent>>({});
    const [currentAgentLogs, setCurrentAgentLogs] = useState<AIEvent[]>([]);
    const [systemEvents, setSystemEvents] = useState<AIEvent[]>([]);
    const [availableModels, setAvailableModels] = useState<AIModelConfig[]>([]);
    const [systemMetrics, setSystemMetrics] = useState<AISystemHealthMetric[]>([]);
    const [ethicalViolations, setEthicalViolations] = useState<AIEthicalViolation[]>([]);
    const [auditLogEntries, setAuditLogEntries] = useState<AIAuditLogEntry[]>([]);
    const [selectedAgentFinancialSummary, setSelectedAgentFinancialSummary] = useState<AIAgentFinancialSummary | null>(null);

    useEffect(() => {
        aiEventLogger.logEvent({
            type: 'ai_dashboard_view_update',
            source: 'AIAgentDashboard',
            payload: { viewName: 'AIAgentDashboard', userId: ai.userId }
        });
        fetchData();
        fetchAvailableModels();
        // Set an interval to refresh agents and tasks periodically, simulating real-time updates
        const refreshInterval = setInterval(fetchData, 10000);
        return () => clearInterval(refreshInterval);
    }, [aiEventLogger, ai.userId, agentOrchestrator, modelManager, ethicalAILayer]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedAgents = agentOrchestrator.getAllAgents();
            setAgents(fetchedAgents);

            const fetchedTasks = agentOrchestrator.getAllTasks();
            setAllTasks(fetchedTasks);

            if (selectedAgent) {
                const updatedSelectedAgent = fetchedAgents.find(a => a.id === selectedAgent.id);
                setSelectedAgent(updatedSelectedAgent || null);
                // Simulate fetching financial summary for the selected agent
                setSelectedAgentFinancialSummary(ethicalAILayer.getAgentFinancialSummary(selectedAgent.id));
            } else {
                 setSelectedAgentFinancialSummary(null);
            }
            if (selectedTask) {
                const updatedSelectedTask = fetchedTasks.find(t => t.id === selectedTask.id);
                setSelectedTask(updatedSelectedTask || null);
            }

            setCurrentAgentLogs(aiEventLogger.getRecentEvents().slice(-100));
            setSystemEvents(aiEventLogger.getRecentEvents().filter(e => e.severity === 'error' || e.type === 'system_alert' || e.type === 'ethical_violation').slice(-50));

            // Simulate fetching new system metrics, ethical violations, and audit logs
            const mockSystemMetrics: AISystemHealthMetric[] = [
                { id: generateRandomId('metric'), name: 'Orchestrator CPU Load', value: (Math.random() * 20 + 5).toFixed(2), unit: '%', timestamp: Date.now(), status: 'ok' },
                { id: generateRandomId('metric'), name: 'Orchestrator Memory Use', value: (Math.random() * 100 + 500).toFixed(0), unit: 'MB', timestamp: Date.now(), status: 'ok' },
                { id: generateRandomId('metric'), name: 'Total Active Agents', value: fetchedAgents.filter(a => a.status === 'busy').length, unit: '', timestamp: Date.now(), status: 'ok' },
                { id: generateRandomId('metric'), name: 'Pending Tasks', value: fetchedTasks.filter(t => t.status === 'pending').length, unit: '', timestamp: Date.now(), status: 'warning' },
                { id: generateRandomId('metric'), name: 'Critical Alerts', value: systemEvents.filter(e => e.severity === 'critical').length, unit: '', timestamp: Date.now(), status: systemEvents.filter(e => e.severity === 'critical').length > 0 ? 'critical' : 'ok' },
            ];
            setSystemMetrics(mockSystemMetrics);

            // Ethical AI Layer: Simulate fetching violations
            setEthicalViolations(ethicalAILayer.getRecentEthicalViolations().slice(-20));

            // Simulate fetching audit logs. In a real scenario, this would involve a dedicated audit log service.
            // aiEventLogger.getAuditLogs() is a placeholder for this.
            setAuditLogEntries(aiEventLogger.getAuditLogs().slice(-50));

            aiEventLogger.logEvent({
                type: 'data_update',
                source: 'AIAgentDashboard',
                payload: { action: 'fetch_dashboard_data', agentCount: fetchedAgents.length, taskCount: fetchedTasks.length }
            });
        } catch (err) {
            setError(`Failed to fetch dashboard data: ${(err as Error).message}`);
            aiEventLogger.logEvent({
                type: 'system_alert',
                source: 'AIAgentDashboard',
                payload: { message: `Failed to fetch dashboard data: ${(err as Error).message}` },
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [agentOrchestrator, selectedAgent, selectedTask, aiEventLogger, ethicalAILayer]);

    const fetchAvailableModels = useCallback(() => {
        const models = modelManager.getAllModels();
        setAvailableModels(models);
    }, [modelManager]);

    useEffect(() => {
        if (selectedAgent) {
            setUpdatedAgentConfig({
                persona: selectedAgent.persona,
                role: selectedAgent.role,
                status: selectedAgent.status,
                currentGoal: selectedAgent.currentGoal,
                memoryCapacity: selectedAgent.memoryCapacity,
                learningRate: selectedAgent.learningRate,
                emotionalState: selectedAgent.emotionalState,
                ethicalGuidelines: selectedAgent.ethicalGuidelines,
                securityClearance: selectedAgent.securityClearance,
                resourceAllocation: { ...selectedAgent.resourceAllocation },
                isAutonomous: selectedAgent.isAutonomous,
                trustScore: selectedAgent.trustScore,
                hardwareIntegration: selectedAgent.hardwareIntegration ? { ...selectedAgent.hardwareIntegration } : undefined,
                modelConfig: selectedAgent.modelConfig ? { ...selectedAgent.modelConfig } : undefined,
                ownerUserId: selectedAgent.ownerUserId,
            });
            setNewTaskData(prev => ({ ...prev, assignToAgentId: selectedAgent.id }));
            // Also fetch financial summary when agent is selected
            setSelectedAgentFinancialSummary(ethicalAILayer.getAgentFinancialSummary(selectedAgent.id));
        } else {
            setUpdatedAgentConfig({});
            setNewTaskData(prev => ({ ...prev, assignToAgentId: '' }));
            setSelectedAgentFinancialSummary(null);
        }
    }, [selectedAgent, ethicalAILayer]);

    const handleTabChange = useCallback((tab: 'agents' | 'tasks' | 'system') => {
        setActiveTab(tab);
        aiEventLogger.logEvent({
            type: 'user_interaction',
            source: 'AIAgentDashboard',
            payload: { action: 'change_tab', newTab: tab }
        });
    }, [aiEventLogger]);

    const handleSelectAgent = useCallback((agent: AIAgent) => {
        setSelectedAgent(agent);
        setSelectedTask(null);
        setNewTaskData(prev => ({ ...prev, assignToAgentId: agent.id }));
        aiEventLogger.logEvent({
            type: 'user_interaction',
            source: 'AIAgentDashboard',
            payload: { action: 'select_agent', agentId: agent.id, agentName: agent.name }
        });
    }, [aiEventLogger]);

    const handleSelectTask = useCallback((task: AITask) => {
        setSelectedTask(task);
        setSelectedAgent(null);
        aiEventLogger.logEvent({
            type: 'user_interaction',
            source: 'AIAgentDashboard',
            payload: { action: 'select_task', taskId: task.id, taskName: task.name }
        });
    }, [aiEventLogger]);

    const handleNewTaskChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setNewTaskData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const handleCreateTask = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasPermission(currentUserRole, 'operator')) {
            setError('Permission denied: You do not have the required role to create tasks.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const task: AITask = {
            id: generateRandomId('task'),
            name: newTaskData.name,
            description: newTaskData.description,
            status: 'pending',
            priority: newTaskData.priority,
            progress: 0,
            creationTimestamp: Date.now(),
            lastUpdateTimestamp: Date.now(),
            requiredResources: newTaskData.requiredModelId ? { modelId: newTaskData.requiredModelId } : {},
            securityContext: {
                encryptionLevel: 'aes256',
                accessControlList: userProfile ? [userProfile.userId] : [],
                dataSensitivity: newTaskData.dataSensitivity
            },
            environmentalContext: {
                deviceType: 'desktop'
            },
            rewardBounty: newTaskData.rewardBounty, // Add reward bounty
        };

        try {
            if (newTaskData.assignToAgentId) {
                await agentOrchestrator.assignTask(newTaskData.assignToAgentId, task);
                setSuccessMessage(`Task "${task.name}" created and assigned to ${newTaskData.assignToAgentId}.`);
            } else {
                await agentOrchestrator.createTask(task);
                setSuccessMessage(`Task "${task.name}" created (awaiting agent assignment).`);
            }
            setNewTaskData({ name: '', description: '', priority: 'medium', dataSensitivity: 'internal', assignToAgentId: selectedAgent?.id || '', requiredModelId: '', rewardBounty: 0 });
            fetchData();
            aiEventLogger.logAudit({
                action: 'create_task',
                actorId: userProfile?.userId || 'system',
                targetId: task.id,
                details: { taskName: task.name, assignedAgent: newTaskData.assignToAgentId }
            });
        } catch (err) {
            setError(`Failed to create task: ${(err as Error).message}`);
            aiEventLogger.logEvent({
                type: 'system_alert',
                source: 'AIAgentDashboard',
                payload: { message: `Failed to create task: ${(err as Error).message}`, taskName: task.name },
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [newTaskData, selectedAgent, agentOrchestrator, userProfile, fetchData, aiEventLogger, currentUserRole]);

    const handleUpdateTask = useCallback(async (task: AITask) => {
        if (!hasPermission(currentUserRole, 'operator')) {
            setError('Permission denied: You do not have the required role to update tasks.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await agentOrchestrator.updateTask(task.id, task);
            setSuccessMessage(`Task "${task.name}" updated successfully.`);
            setSelectedTask(task);
            fetchData();
            aiEventLogger.logAudit({
                action: 'update_task',
                actorId: userProfile?.userId || 'system',
                targetId: task.id,
                details: { taskName: task.name, status: task.status }
            });
        } catch (err) {
            setError(`Failed to update task: ${(err as Error).message}`);
            aiEventLogger.logEvent({
                type: 'system_alert',
                source: 'AIAgentDashboard',
                payload: { message: `Failed to update task: ${(err as Error).message}`, taskId: task.id },
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [agentOrchestrator, fetchData, aiEventLogger, currentUserRole, userProfile]);

    const handleDeleteTask = useCallback(async (taskId: string) => {
        if (!hasPermission(currentUserRole, 'admin')) { // Only admin can delete tasks
            setError('Permission denied: You do not have the required role to delete tasks.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await agentOrchestrator.deleteTask(taskId);
            setSuccessMessage(`Task ${taskId} deleted successfully.`);
            setSelectedTask(null);
            fetchData();
            aiEventLogger.logAudit({
                action: 'delete_task',
                actorId: userProfile?.userId || 'system',
                targetId: taskId,
                details: { message: `Task ${taskId} deleted` }
            });
        } catch (err) {
            setError(`Failed to delete task: ${(err as Error).message}`);
            aiEventLogger.logEvent({
                type: 'system_alert',
                source: 'AIAgentDashboard',
                payload: { message: `Failed to delete task: ${(err as Error).message}`, taskId: taskId },
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [agentOrchestrator, fetchData, aiEventLogger, currentUserRole, userProfile]);

    const handleUpdateAgentConfigChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setUpdatedAgentConfig(prev => {
            if (name.startsWith('resourceAllocation.')) {
                const resourceKey = name.split('.')[1] as keyof AIAgent['resourceAllocation'];
                return {
                    ...prev,
                    resourceAllocation: {
                        ...prev.resourceAllocation,
                        [resourceKey]: type === 'number' ? parseFloat(value) : parseInt(value, 10)
                    }
                };
            }
            if (name.startsWith('hardwareIntegration.')) {
                const hardwareKey = name.split('.')[1] as keyof AIAgent['hardwareIntegration'];
                return {
                    ...prev,
                    hardwareIntegration: {
                        ...prev.hardwareIntegration,
                        [hardwareKey]: type === 'checkbox' ? checked : value
                    }
                };
            }
            if (name.startsWith('modelConfig.')) {
                const modelConfigKey = name.split('.')[1] as keyof AIModelConfig;
                return {
                    ...prev,
                    modelConfig: {
                        ...prev.modelConfig,
                        [modelConfigKey]: value
                    }
                };
            }
            return { ...prev, [name]: type === 'checkbox' ? checked : value };
        });
    }, []);

    const handleUpdateAgent = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgent) return;
        if (!hasPermission(currentUserRole, 'operator')) {
            setError('Permission denied: You do not have the required role to update agents.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const updatedAgent: AIAgent = {
            ...selectedAgent,
            ...updatedAgentConfig,
            resourceAllocation: {
                ...selectedAgent.resourceAllocation,
                ...updatedAgentConfig.resourceAllocation
            },
            hardwareIntegration: updatedAgentConfig.hardwareIntegration ? {
                ...selectedAgent.hardwareIntegration,
                ...updatedAgentConfig.hardwareIntegration
            } : selectedAgent.hardwareIntegration,
            modelConfig: updatedAgentConfig.modelConfig ? {
                ...selectedAgent.modelConfig,
                ...updatedAgentConfig.modelConfig,
            } : selectedAgent.modelConfig,
            lastActivityTimestamp: Date.now(), // Update last activity on config change
        };

        try {
            agentOrchestrator.registerAgent(updatedAgent);
            setSuccessMessage(`Agent "${updatedAgent.name}" updated successfully.`);
            setSelectedAgent(updatedAgent);
            fetchData();
            aiEventLogger.logAudit({
                action: 'update_agent_config',
                actorId: userProfile?.userId || 'system',
                targetId: updatedAgent.id,
                details: { agentName: updatedAgent.name, changes: updatedAgentConfig }
            });
        } catch (err) {
            setError(`Failed to update agent: ${(err as Error).message}`);
            aiEventLogger.logEvent({
                type: 'system_alert',
                source: 'AIAgentDashboard',
                payload: { message: `Failed to update agent: ${(err as Error).message}`, agentId: selectedAgent.id },
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedAgent, updatedAgentConfig, agentOrchestrator, fetchData, aiEventLogger, currentUserRole, userProfile]);

    const handleNewAgentChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setNewAgentData(prev => {
            if (name.startsWith('resourceAllocation.')) {
                const resourceKey = name.split('.')[1] as keyof AIAgent['resourceAllocation'];
                return {
                    ...prev,
                    resourceAllocation: {
                        ...(prev.resourceAllocation || {}),
                        [resourceKey]: type === 'number' ? parseFloat(value) : parseInt(value, 10)
                    }
                };
            }
            if (name.startsWith('hardwareIntegration.')) {
                const hardwareKey = name.split('.')[1] as keyof AIAgent['hardwareIntegration'];
                return {
                    ...prev,
                    hardwareIntegration: {
                        ...(prev.hardwareIntegration || {}),
                        [hardwareKey]: type === 'checkbox' ? checked : value
                    }
                };
            }
            return { ...prev, [name]: type === 'checkbox' ? checked : value };
        });
    }, []);

    const handleNewAgentCapabilityAdd = useCallback(() => {
        if (newAgentCapabilitiesInput.trim() && !newAgentData.capabilities?.includes(newAgentCapabilitiesInput.trim())) {
            setNewAgentData(prev => ({
                ...prev,
                capabilities: [...(prev.capabilities || []), newAgentCapabilitiesInput.trim()]
            }));
            setNewAgentCapabilitiesInput('');
        }
    }, [newAgentCapabilitiesInput, newAgentData.capabilities]);

    const handleNewAgentCapabilityRemove = useCallback((capabilityToRemove: string) => {
        setNewAgentData(prev => ({
            ...prev,
            capabilities: (prev.capabilities || []).filter(c => c !== capabilityToRemove)
        }));
    }, []);

    const handleCreateNewAgent = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasPermission(currentUserRole, 'operator')) {
            setError('Permission denied: You do not have the required role to create agents.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!newAgentData.name || !newAgentData.persona || !newAgentData.role) {
            setError("Agent Name, Persona, and Role are required.");
            setIsLoading(false);
            return;
        }

        const agent: AIAgent = {
            id: generateRandomId('agent'),
            name: newAgentData.name,
            persona: newAgentData.persona,
            role: newAgentData.role,
            capabilities: newAgentData.capabilities || [],
            status: newAgentData.status || 'idle',
            currentGoal: newAgentData.currentGoal || 'Awaiting instructions',
            memoryCapacity: newAgentData.memoryCapacity || 100,
            learningRate: newAgentData.learningRate || 0.05,
            emotionalState: newAgentData.emotionalState || 'calm',
            ethicalGuidelines: newAgentData.ethicalGuidelines || 'adaptive',
            securityClearance: newAgentData.securityClearance || 'level_1',
            resourceAllocation: newAgentData.resourceAllocation || { computeUnits: 1, memoryGB: 2, networkBandwidthMbps: 100 },
            isAutonomous: newAgentData.isAutonomous ?? true,
            trustScore: newAgentData.trustScore || 0.5,
            assignedTasks: [],
            hardwareIntegration: newAgentData.hardwareIntegration,
            modelConfig: newAgentData.modelConfig,
            creationTimestamp: Date.now(),
            lastActivityTimestamp: Date.now(),
            ownerUserId: newAgentData.ownerUserId || userProfile?.userId || 'system',
        };

        try {
            agentOrchestrator.registerAgent(agent);
            setSuccessMessage(`Agent "${agent.name}" created successfully.`);
            setNewAgentData({
                name: '', persona: '', role: 'planner', capabilities: [], status: 'idle', isAutonomous: true,
                memoryCapacity: 100, learningRate: 0.05, emotionalState: 'calm', ethicalGuidelines: 'adaptive',
                securityClearance: 'level_1', resourceAllocation: { computeUnits: 1, memoryGB: 2, networkBandwidthMbps: 100 },
                trustScore: 0.5, ownerUserId: userProfile?.userId,
            });
            setNewAgentCapabilitiesInput('');
            setShowNewAgentModal(false);
            fetchData();
            aiEventLogger.logAudit({
                action: 'create_agent',
                actorId: userProfile?.userId || 'system',
                targetId: agent.id,
                details: { agentName: agent.name, role: agent.role }
            });
        } catch (err) {
            setError(`Failed to create agent: ${(err as Error).message}`);
            aiEventLogger.logEvent({
                type: 'system_alert',
                source: 'AIAgentDashboard',
                payload: { message: `Failed to create agent: ${(err as Error).message}`, agentName: agent.name },
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [newAgentData, agentOrchestrator, fetchData, aiEventLogger, userProfile, currentUserRole]);

    const confirmDeleteAgent = useCallback((agent: AIAgent) => {
        if (!hasPermission(currentUserRole, 'admin')) {
            setError('Permission denied: You do not have the required role to delete agents.');
            return;
        }
        setAgentToDelete(agent);
        setShowDeleteConfirmModal(true);
    }, [currentUserRole]);

    const handleDeleteAgent = useCallback(async () => {
        if (!agentToDelete) return;

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await agentOrchestrator.deregisterAgent(agentToDelete.id);
            setSuccessMessage(`Agent "${agentToDelete.name}" deleted successfully.`);
            setAgentToDelete(null);
            setShowDeleteConfirmModal(false);
            setSelectedAgent(null);
            fetchData();
            aiEventLogger.logAudit({
                action: 'delete_agent',
                actorId: userProfile?.userId || 'system',
                targetId: agentToDelete.id,
                details: { agentName: agentToDelete.name }
            });
        } catch (err) {
            setError(`Failed to delete agent: ${(err as Error).message}`);
            aiEventLogger.logEvent({
                type: 'system_alert',
                source: 'AIAgentDashboard',
                payload: { message: `Failed to delete agent: ${(err as Error).message}`, agentId: agentToDelete.id },
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [agentToDelete, agentOrchestrator, fetchData, aiEventLogger, userProfile]);

    const handleAgentFeedback = useCallback((agentId: string, feedback: string) => {
        aiEventLogger.logEvent({
            type: 'user_feedback',
            source: 'AIAgentDashboard',
            payload: { agentId, feedback },
            severity: 'info'
        });
        setSuccessMessage(`Feedback submitted for agent ${agentId}: "${feedback}"`);
    }, [aiEventLogger]);


    // Simplified styling based on AIWrapper's companion box
    const dashboardStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        color: '#e0e0e0',
        background: '#282c34',
        minHeight: '100vh',
        padding: '20px',
        gap: '20px',
    };

    const panelStyle: React.CSSProperties = {
        flex: 1,
        background: '#3c404c',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        overflowY: 'auto',
    };

    const agentListItemStyle: React.CSSProperties = {
        padding: '10px 15px',
        margin: '5px 0',
        background: '#4a4f5c',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background-color 0.2s',
        position: 'relative',
    };

    const selectedAgentListItemStyle: React.CSSProperties = {
        ...agentListItemStyle,
        background: '#6a6f7c',
        borderLeft: '4px solid #61dafb',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px',
        margin: '5px 0 10px 0',
        borderRadius: '4px',
        border: '1px solid #555',
        background: '#4a4f5c',
        color: '#e0e0e0',
        boxSizing: 'border-box',
    };

    const buttonStyle: React.CSSProperties = {
        padding: '10px 15px',
        background: '#61dafb',
        color: '#282c34',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.2s',
        marginTop: '10px',
    };

    const dangerButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        background: '#dc3545',
        color: 'white',
    };

    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const modalContentStyle: React.CSSProperties = {
        background: '#282c34',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
        width: '500px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflowY: 'auto',
        color: '#e0e0e0',
    };

    const statusColors = {
        'idle': 'green',
        'busy': 'orange',
        'offline': 'gray',
        'error': 'red',
        'learning': 'purple',
        'meditating': 'blue'
    };

    return (
        <div style={dashboardStyle}>
            {showNewAgentModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>Create New AI Agent</h3>
                        <form onSubmit={handleCreateNewAgent}>
                            <label>
                                Agent Name:
                                <input
                                    type="text"
                                    name="name"
                                    value={newAgentData.name || ''}
                                    onChange={handleNewAgentChange}
                                    style={inputStyle}
                                    required
                                />
                            </label>
                            <label>
                                Persona:
                                <input
                                    type="text"
                                    name="persona"
                                    value={newAgentData.persona || ''}
                                    onChange={handleNewAgentChange}
                                    style={inputStyle}
                                    required
                                />
                            </label>
                            <label>
                                Role:
                                <select
                                    name="role"
                                    value={newAgentData.role || ''}
                                    onChange={handleNewAgentChange}
                                    style={inputStyle}
                                >
                                    {['planner', 'executor', 'monitor', 'collaborator', 'sentient_entity', 'financial_analyst', 'security_auditor'].map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Capabilities (comma-separated or add one by one):
                                <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                    <input
                                        type="text"
                                        value={newAgentCapabilitiesInput}
                                        onChange={(e) => setNewAgentCapabilitiesInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleNewAgentCapabilityAdd();
                                            }
                                        }}
                                        style={{ ...inputStyle, flex: 1, margin: 0 }}
                                        placeholder="e.g., natural_language_processing"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleNewAgentCapabilityAdd}
                                        style={{ ...buttonStyle, marginTop: 0, padding: '8px 12px', background: '#4CAF50' }}
                                    >
                                        Add
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '5px 0 10px 0' }}>
                                    {(newAgentData.capabilities || []).map((cap, index) => (
                                        <span key={index} style={{ background: '#555', color: '#eee', padding: '5px 10px', borderRadius: '15px', fontSize: '0.9em', display: 'flex', alignItems: 'center' }}>
                                            {cap}
                                            <button
                                                type="button"
                                                onClick={() => handleNewAgentCapabilityRemove(cap)}
                                                style={{ background: 'transparent', border: 'none', color: '#ff7777', marginLeft: '5px', cursor: 'pointer', fontSize: '1em', padding: 0 }}
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </label>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Resource Allocation:</strong>
                                <div>Compute Units: <input type="number" name="resourceAllocation.computeUnits" value={newAgentData.resourceAllocation?.computeUnits ?? 1} onChange={handleNewAgentChange} style={{...inputStyle, width: 'auto'}} /></div>
                                <div>Memory (GB): <input type="number" name="resourceAllocation.memoryGB" value={newAgentData.resourceAllocation?.memoryGB ?? 2} onChange={handleNewAgentChange} style={{...inputStyle, width: 'auto'}} /></div>
                                <div>Network (Mbps): <input type="number" name="resourceAllocation.networkBandwidthMbps" value={newAgentData.resourceAllocation?.networkBandwidthMbps ?? 100} onChange={handleNewAgentChange} style={{...inputStyle, width: 'auto'}} /></div>
                            </div>
                            <label>
                                Initial Model:
                                <select
                                    name="modelConfig.id"
                                    value={newAgentData.modelConfig?.id || ''}
                                    onChange={handleNewAgentChange}
                                    style={inputStyle}
                                >
                                    <option value="">(No specific model)</option>
                                    {availableModels.map(model => (
                                        <option key={model.id} value={model.id}>{model.name} ({model.version})</option>
                                    ))}
                                </select>
                            </label>
                             <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                Is Autonomous:
                                <input
                                    type="checkbox"
                                    name="isAutonomous"
                                    checked={newAgentData.isAutonomous ?? true}
                                    onChange={handleNewAgentChange}
                                    style={{ marginLeft: '10px', width: 'auto' }}
                                />
                            </label>
                             <label>
                                Security Clearance:
                                <select
                                    name="securityClearance"
                                    value={newAgentData.securityClearance || ''}
                                    onChange={handleNewAgentChange}
                                    style={inputStyle}
                                >
                                    {['level_1', 'level_2', 'level_3', 'level_4', 'level_5'].map(clearance => (
                                        <option key={clearance} value={clearance}>{clearance}</option>
                                    ))}
                                </select>
                            </label>
                             <label>
                                Ethical Guidelines:
                                <select
                                    name="ethicalGuidelines"
                                    value={newAgentData.ethicalGuidelines || ''}
                                    onChange={handleNewAgentChange}
                                    style={inputStyle}
                                >
                                    {['strict', 'adaptive', 'flexible'].map(guideline => (
                                        <option key={guideline} value={guideline}>{guideline}</option>
                                    ))}
                                </select>
                            </label>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowNewAgentModal(false)}
                                    style={{ ...buttonStyle, background: '#555', color: '#e0e0e0' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" style={buttonStyle} disabled={isLoading || !hasPermission(currentUserRole, 'operator')}>
                                    {isLoading ? 'Creating...' : 'Create Agent'}
                                </button>
                            </div>
                            {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}
                            {successMessage && <p style={{ color: 'lightgreen', marginTop: '10px' }}>{successMessage}</p>}
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirmModal && agentToDelete && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>Confirm Agent Deletion</h3>
                        <p>Are you sure you want to delete agent "<strong>{agentToDelete.name}</strong>" ({agentToDelete.id})?</p>
                        <p style={{color: 'orange'}}>This action is irreversible and will remove the agent and unassign any tasks.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirmModal(false)}
                                style={{ ...buttonStyle, background: '#555', color: '#e0e0e0' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAgent}
                                style={dangerButtonStyle}
                                disabled={isLoading || !hasPermission(currentUserRole, 'admin')}
                            >
                                {isLoading ? 'Deleting...' : 'Delete Agent'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #4a4f5c', paddingBottom: '10px' }}>
                <button
                    onClick={() => handleTabChange('agents')}
                    style={{ ...buttonStyle, background: activeTab === 'agents' ? '#61dafb' : '#4a4f5c', color: activeTab === 'agents' ? '#282c34' : '#e0e0e0' }}
                >
                    Agent Management
                </button>
                <button
                    onClick={() => handleTabChange('tasks')}
                    style={{ ...buttonStyle, background: activeTab === 'tasks' ? '#61dafb' : '#4a4f5c', color: activeTab === 'tasks' ? '#282c34' : '#e0e0e0' }}
                >
                    Task Overview
                </button>
                <button
                    onClick={() => handleTabChange('system')}
                    style={{ ...buttonStyle, background: activeTab === 'system' ? '#61dafb' : '#4a4f5c', color: activeTab === 'system' ? '#282c34' : '#e0e0e0' }}
                >
                    System Health & Audit
                </button>
            </div>
            <div style={{ marginBottom: '10px', color: '#bbb' }}>
                Logged in as: <strong>{userProfile?.name || 'Guest'}</strong> (Role: <span style={{fontWeight: 'bold', color: currentUserRole === 'admin' ? 'red' : currentUserRole === 'operator' ? 'orange' : 'white'}}>{currentUserRole.toUpperCase()}</span>)
            </div>

            <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
                {/* Left Panel: List based on active tab */}
                <div style={{ ...panelStyle, flex: 0.8 }}>
                    {activeTab === 'agents' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2>AI Agents</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setShowNewAgentModal(true)}
                                        style={{ ...buttonStyle, background: '#4CAF50', marginBottom: '0' }}
                                        disabled={!hasPermission(currentUserRole, 'operator')}
                                    >
                                        + New Agent
                                    </button>
                                    <button
                                        onClick={fetchData}
                                        style={{ ...buttonStyle, background: '#555', marginBottom: '0' }}
                                        disabled={isLoading}
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            {isLoading && <p>Loading agents...</p>}
                            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                            <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                                {agents.length === 0 && !isLoading && <p>No agents registered.</p>}
                                {agents.map(agent => (
                                    <div
                                        key={agent.id}
                                        style={selectedAgent?.id === agent.id ? selectedAgentListItemStyle : agentListItemStyle}
                                        onClick={() => handleSelectAgent(agent)}
                                    >
                                        <div>
                                            <strong>{agent.name}</strong> ({agent.id.substring(0, 8)}...)
                                            <div style={{ fontSize: '0.9em', color: '#bbb' }}>{agent.persona} - {agent.role}</div>
                                            <div style={{ fontSize: '0.8em', color: '#999' }}>Owner: {agent.ownerUserId || 'System'}</div>
                                        </div>
                                        <span style={{ color: (statusColors as any)[agent.status] || 'white', fontWeight: 'bold' }}>{agent.status.toUpperCase()}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); confirmDeleteAgent(agent); }}
                                            style={{ ...dangerButtonStyle, padding: '5px 8px', fontSize: '0.8em', marginLeft: '10px', marginTop: '0' }}
                                            title="Delete Agent"
                                            disabled={!hasPermission(currentUserRole, 'admin')}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'tasks' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2>All Tasks</h2>
                                <button
                                    onClick={fetchData}
                                    style={{ ...buttonStyle, background: '#555', marginBottom: '0' }}
                                    disabled={isLoading}
                                >
                                    Refresh
                                </button>
                            </div>
                            {isLoading && <p>Loading tasks...</p>}
                            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                            <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                                {allTasks.length === 0 && !isLoading && <p>No tasks created.</p>}
                                {allTasks.map(task => (
                                    <div
                                        key={task.id}
                                        style={selectedTask?.id === task.id ? selectedAgentListItemStyle : agentListItemStyle}
                                        onClick={() => handleSelectTask(task)}
                                    >
                                        <div>
                                            <strong>{task.name}</strong> ({task.id.substring(0, 8)}...)
                                            <div style={{ fontSize: '0.9em', color: '#bbb' }}>{task.description.substring(0, Math.min(task.description.length, 50))}...</div>
                                        </div>
                                        <span style={{ color: task.status === 'completed' ? 'lightgreen' : task.status === 'error' ? 'red' : 'orange', fontWeight: 'bold' }}>{task.status.toUpperCase()} ({task.progress.toFixed(0)}%)</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                            style={{ ...dangerButtonStyle, padding: '5px 8px', fontSize: '0.8em', marginLeft: '10px', marginTop: '0' }}
                                            title="Delete Task"
                                            disabled={!hasPermission(currentUserRole, 'admin')}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'system' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2>System Overview & Alerts</h2>
                                <button
                                    onClick={fetchData}
                                    style={{ ...buttonStyle, background: '#555', marginBottom: '0' }}
                                    disabled={isLoading}
                                >
                                    Refresh
                                </button>
                            </div>
                            {isLoading && <p>Loading system data...</p>}
                            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                            <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Performance Metrics</h3>
                                    {systemMetrics.map(metric => (
                                        <p key={metric.id}>
                                            <strong>{metric.name}:</strong> <span style={{color: metric.status === 'critical' ? 'red' : metric.status === 'warning' ? 'orange' : 'lightgreen'}}>{metric.value}{metric.unit}</span>
                                        </p>
                                    ))}
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Ethical Violations ({ethicalViolations.length})</h3>
                                    <div style={{ background: '#282c34', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {ethicalViolations.length === 0 && <p style={{ color: '#bbb' }}>No recent ethical violations.</p>}
                                        {ethicalViolations.map((violation, index) => (
                                            <div key={index} style={{ marginBottom: '8px', borderBottom: '1px dashed #4a4f5c', paddingBottom: '8px', color: violation.severity === 'critical' || violation.severity === 'high' ? 'red' : violation.severity === 'medium' ? 'orange' : '#ddd' }}>
                                                <div style={{ fontSize: '0.8em', color: '#999' }}>{new Date(violation.timestamp).toLocaleString()}</div>
                                                <strong>[{violation.severity.toUpperCase()}]</strong> Agent {violation.agentId.substring(0,8)}: {violation.rule} - {violation.description}
                                                <div style={{ fontSize: '0.8em', color: '#bbb' }}>Action Taken: {violation.actionTaken}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Recent System Alerts ({systemEvents.length})</h3>
                                    <div style={{ background: '#282c34', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {systemEvents.length === 0 && <p style={{ color: '#bbb' }}>No recent system alerts.</p>}
                                        {systemEvents.map((event, index) => (
                                            <div key={index} style={{ marginBottom: '8px', borderBottom: '1px dashed #4a4f5c', paddingBottom: '8px', color: event.severity === 'error' || event.severity === 'critical' ? 'red' : event.severity === 'warning' ? 'orange' : '#ddd' }}>
                                                <div style={{ fontSize: '0.8em', color: '#999' }}>{new Date(event.timestamp || Date.now()).toLocaleString()}</div>
                                                <strong>[{event.severity?.toUpperCase() || 'INFO'}]</strong> {event.payload?.message || event.type}
                                                {event.payload?.agentId && <span style={{fontSize: '0.9em', marginLeft: '10px'}}> (Agent: {event.payload.agentId.substring(0,8)})</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Audit Trail Summary ({auditLogEntries.length})</h3>
                                    <div style={{ background: '#282c34', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {auditLogEntries.length === 0 && <p style={{ color: '#bbb' }}>No recent audit entries.</p>}
                                        {auditLogEntries.map((log, index) => (
                                            <div key={index} style={{ marginBottom: '8px', borderBottom: '1px dashed #4a4f5c', paddingBottom: '8px' }}>
                                                <div style={{ fontSize: '0.8em', color: '#999' }}>{new Date(log.timestamp).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.9em', color: '#ddd' }}><strong>Actor:</strong> {log.actorId.substring(0,8)}... | <strong>Action:</strong> {log.action} | <strong>Target:</strong> {log.targetId?.substring(0,8) || 'N/A'}</div>
                                                <div style={{ fontSize: '0.8em', color: '#bbb' }}>Tamper-Evident: {log.isTamperEvident ? 'Yes' : 'No'} {log.previousHash && `(Prev Hash: ${log.previousHash.substring(0, 8)}...)`}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Panel: Details & Actions based on selection */}
                <div style={{ ...panelStyle, flex: 2 }}>
                    {successMessage && <p style={{ color: 'lightgreen' }}>{successMessage}</p>}
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                    {selectedAgent && activeTab === 'agents' && (
                        <>
                            <h2>Agent Details: {selectedAgent.name}</h2>
                            <AgentHealthMonitor agent={selectedAgent} onFeedbackSubmit={handleAgentFeedback} />
                            <AgentIdentitySecurityDisplay agent={selectedAgent} />
                            {selectedAgentFinancialSummary && <AgentFinancialSummaryDisplay summary={selectedAgentFinancialSummary} />}
                            <form onSubmit={handleUpdateAgent}>
                                <h3>Configuration</h3>
                                <label>
                                    Persona:
                                    <input
                                        type="text"
                                        name="persona"
                                        value={updatedAgentConfig.persona || ''}
                                        onChange={handleUpdateAgentConfigChange}
                                        style={inputStyle}
                                    />
                                </label>
                                <label>
                                    Role:
                                    <select
                                        name="role"
                                        value={updatedAgentConfig.role || ''}
                                        onChange={handleUpdateAgentConfigChange}
                                        style={inputStyle}
                                    >
                                        {['planner', 'executor', 'monitor', 'collaborator', 'sentient_entity', 'financial_analyst', 'security_auditor'].map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Status:
                                    <select
                                        name="status"
                                        value={updatedAgentConfig.status || ''}
                                        onChange={handleUpdateAgentConfigChange}
                                        style={inputStyle}
                                    >
                                        {['idle', 'busy', 'offline', 'error', 'learning', 'meditating'].map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Current Goal:
                                    <textarea
                                        name="currentGoal"
                                        value={updatedAgentConfig.currentGoal || ''}
                                        onChange={handleUpdateAgentConfigChange}
                                        rows={3}
                                        style={inputStyle}
                                    />
                                </label>
                                <label>
                                    Ethical Guidelines:
                                    <select
                                        name="ethicalGuidelines"
                                        value={updatedAgentConfig.ethicalGuidelines || ''}
                                        onChange={handleUpdateAgentConfigChange}
                                        style={inputStyle}
                                    >
                                        {['strict', 'adaptive', 'flexible'].map(guideline => (
                                            <option key={guideline} value={guideline}>{guideline}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Security Clearance:
                                    <select
                                        name="securityClearance"
                                        value={updatedAgentConfig.securityClearance || ''}
                                        onChange={handleUpdateAgentConfigChange}
                                        style={inputStyle}
                                    >
                                        {['level_1', 'level_2', 'level_3', 'level_4', 'level_5'].map(clearance => (
                                            <option key={clearance} value={clearance}>{clearance}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    AI Model Configuration:
                                    <select
                                        name="modelConfig.id"
                                        value={updatedAgentConfig.modelConfig?.id || ''}
                                        onChange={handleUpdateAgentConfigChange}
                                        style={inputStyle}
                                    >
                                        <option value="">(None / Default)</option>
                                        {availableModels.map(model => (
                                            <option key={model.id} value={model.id}>{model.name} ({model.version})</option>
                                        ))}
                                    </select>
                                </label>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Capabilities:</strong> {selectedAgent.capabilities.length > 0 ? selectedAgent.capabilities.join(', ') : 'None'}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Assigned Tasks:</strong> {selectedAgent.assignedTasks.length > 0 ? selectedAgent.assignedTasks.map(taskId => <span key={taskId} style={{background: '#555', padding: '3px 8px', borderRadius: '3px', marginRight: '5px', display: 'inline-block', marginBottom: '5px'}}>{taskId.substring(0,8)}</span>) : 'None'}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Resource Allocation:</strong>
                                    <div>Compute Units: <input type="number" name="resourceAllocation.computeUnits" value={updatedAgentConfig.resourceAllocation?.computeUnits ?? 0} onChange={handleUpdateAgentConfigChange} style={{...inputStyle, width: 'auto'}} /></div>
                                    <div>Memory (GB): <input type="number" name="resourceAllocation.memoryGB" value={updatedAgentConfig.resourceAllocation?.memoryGB ?? 0} onChange={handleUpdateAgentConfigChange} style={{...inputStyle, width: 'auto'}} /></div>
                                    <div>Network (Mbps): <input type="number" name="resourceAllocation.networkBandwidthMbps" value={updatedAgentConfig.resourceAllocation?.networkBandwidthMbps ?? 0} onChange={handleUpdateAgentConfigChange} style={{...inputStyle, width: 'auto'}} /></div>
                                </div>
                                <label>
                                    Is Autonomous:
                                    <input
                                        type="checkbox"
                                        name="isAutonomous"
                                        checked={updatedAgentConfig.isAutonomous ?? false}
                                        onChange={handleUpdateAgentConfigChange}
                                        style={{ marginLeft: '10px' }}
                                    />
                                </label>
                                <button type="submit" style={buttonStyle} disabled={isLoading || !hasPermission(currentUserRole, 'operator')}>
                                    {isLoading ? 'Updating...' : 'Update Agent'}
                                </button>
                            </form>

                            <hr style={{ margin: '30px 0', borderColor: '#4a4f5c' }} />
                            <AgentLogsDisplay agentId={selectedAgent.id} logs={currentAgentLogs} />
                            <hr style={{ margin: '30px 0', borderColor: '#4a4f5c' }} />

                            <h3>Create New Task for {selectedAgent.name}</h3>
                            <form onSubmit={handleCreateTask}>
                                <label>
                                    Task Name:
                                    <input
                                        type="text"
                                        name="name"
                                        value={newTaskData.name}
                                        onChange={handleNewTaskChange}
                                        style={inputStyle}
                                        required
                                    />
                                </label>
                                <label>
                                    Description:
                                    <textarea
                                        name="description"
                                        value={newTaskData.description}
                                        onChange={handleNewTaskChange}
                                        rows={5}
                                        style={inputStyle}
                                        required
                                    />
                                </label>
                                <label>
                                    Priority:
                                    <select
                                        name="priority"
                                        value={newTaskData.priority}
                                        onChange={handleNewTaskChange}
                                        style={inputStyle}
                                    >
                                        {['low', 'medium', 'high', 'critical'].map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Data Sensitivity:
                                    <select
                                        name="dataSensitivity"
                                        value={newTaskData.dataSensitivity}
                                        onChange={handleNewTaskChange}
                                        style={inputStyle}
                                    >
                                        {['public', 'internal', 'confidential', 'secret', 'top_secret'].map(ds => (
                                            <option key={ds} value={ds}>{ds}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Required Model:
                                    <select
                                        name="requiredModelId"
                                        value={newTaskData.requiredModelId}
                                        onChange={handleNewTaskChange}
                                        style={inputStyle}
                                    >
                                        <option value="">(Any compatible model)</option>
                                        {availableModels.map(model => (
                                            <option key={model.id} value={model.id}>{model.name} ({model.version})</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Reward Bounty (Tokens):
                                    <input
                                        type="number"
                                        name="rewardBounty"
                                        value={newTaskData.rewardBounty}
                                        onChange={handleNewTaskChange}
                                        style={inputStyle}
                                        min="0"
                                    />
                                </label>
                                <label>
                                    Assign To Agent:
                                    <select
                                        name="assignToAgentId"
                                        value={newTaskData.assignToAgentId}
                                        onChange={handleNewTaskChange}
                                        style={inputStyle}
                                    >
                                        <option value="">(Unassigned)</option>
                                        {agents.map(agent => (
                                            <option key={agent.id} value={agent.id}>
                                                {agent.name} ({agent.status})
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <button type="submit" style={buttonStyle} disabled={isLoading || !hasPermission(currentUserRole, 'operator')}>
                                    {isLoading ? 'Creating Task...' : 'Create & Assign Task'}
                                </button>
                            </form>
                        </>
                    )}

                    {selectedTask && activeTab === 'tasks' && (
                        <>
                            <h2>Task Details: {selectedTask.name}</h2>
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdateTask(selectedTask); }}>
                                <label>
                                    Task Name:
                                    <input
                                        type="text"
                                        name="name"
                                        value={selectedTask.name}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, name: e.target.value })}
                                        style={inputStyle}
                                        required
                                    />
                                </label>
                                <label>
                                    Description:
                                    <textarea
                                        name="description"
                                        value={selectedTask.description}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                                        rows={5}
                                        style={inputStyle}
                                        required
                                    />
                                </label>
                                <label>
                                    Status:
                                    <select
                                        name="status"
                                        value={selectedTask.status}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value as AITask['status'] })}
                                        style={inputStyle}
                                    >
                                        {['pending', 'in_progress', 'completed', 'failed', 'cancelled', 'paused'].map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Progress:
                                    <input
                                        type="range"
                                        name="progress"
                                        min="0"
                                        max="100"
                                        value={selectedTask.progress}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, progress: parseInt(e.target.value, 10) })}
                                        style={{ ...inputStyle, padding: '0', height: 'auto', WebkitAppearance: 'none', background: '#555' }}
                                    />
                                    <span style={{ marginLeft: '10px' }}>{selectedTask.progress}%</span>
                                </label>
                                <label>
                                    Priority:
                                    <select
                                        name="priority"
                                        value={selectedTask.priority}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value as AITask['priority'] })}
                                        style={inputStyle}
                                    >
                                        {['low', 'medium', 'high', 'critical'].map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Data Sensitivity:
                                    <select
                                        name="dataSensitivity"
                                        value={selectedTask.securityContext.dataSensitivity}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, securityContext: { ...selectedTask.securityContext, dataSensitivity: e.target.value as AITask['securityContext']['dataSensitivity'] } })}
                                        style={inputStyle}
                                    >
                                        {['public', 'internal', 'confidential', 'secret', 'top_secret'].map(ds => (
                                            <option key={ds} value={ds}>{ds}</option>
                                        ))}
                                    </select>
                                </label>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Assigned Agent:</strong> {selectedTask.assignedToAgentId ? (agents.find(a => a.id === selectedTask.assignedToAgentId)?.name || selectedTask.assignedToAgentId) : 'Unassigned'}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Required Model:</strong> {selectedTask.requiredResources?.modelId ? (availableModels.find(m => m.id === selectedTask.requiredResources?.modelId)?.name || selectedTask.requiredResources.modelId) : 'None Specified'}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Reward Bounty:</strong> {selectedTask.rewardBounty || 0} Tokens
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" style={buttonStyle} disabled={isLoading || !hasPermission(currentUserRole, 'operator')}>
                                        {isLoading ? 'Updating Task...' : 'Update Task'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteTask(selectedTask.id)}
                                        style={dangerButtonStyle}
                                        disabled={isLoading || !hasPermission(currentUserRole, 'admin')}
                                    >
                                        Delete Task
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {!selectedAgent && !selectedTask && <p>Select an agent or task from the list to view details and manage.</p>}
                </div>
            </div>
        </div>
    );
};

export default AIAgentDashboard;