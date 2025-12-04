import { AITask, AIAgent, AIEvent, AIEventLogger, AutonomousAgentOrchestrator, GlobalKnowledgeGraph, EthicalAICompliance } from '../../AIWrapper';

export interface TaskReport {
    taskId: string;
    name: string;
    description: string;
    status: AITask['status'];
    priority: AITask['priority'];
    progress: number;
    assignedAgentId?: string;
    creationTimestamp: number;
    lastUpdateTimestamp: number;
    dependencies: string[];
    subTasks: string[];
    output?: any;
    error?: string;
    estimatedDurationMs?: number;
    actualDurationMs?: number;
    resourceUtilization?: { cpu: number; memory: number; network: number; };
    securityCheckResult?: { isSecure: boolean; reason?: string; };
    ethicalCheckResult?: { isEthical: boolean; reason?: string; };
    predictedSuccessConfidence?: number;
    historicalExecutionData?: AIEvent[];
}

export class AITaskManagerService {
    private tasks: Map<string, AITask>;
    private taskDependencies: Map<string, Set<string>>;
    private reverseDependencies: Map<string, Set<string>>;
    private subTaskRelationships: Map<string, Set<string>>;
    private parentTaskMap: Map<string, string>;
    private orchestrator: AutonomousAgentOrchestrator;
    private eventLogger: AIEventLogger;
    private knowledgeGraph: GlobalKnowledgeGraph;
    private ethicalAILayer: EthicalAICompliance;
    private activeTaskMonitoringInterval: NodeJS.Timeout | null;
    private simulationQueue: string[];
    private emergencyShutdownFlag: boolean;
    private internalHealthMetrics: {
        lastMonitorRun: number;
        scheduledTasksCount: number;
        failedSchedulesCount: number;
        completedTasksToday: number;
        totalTasksManaged: number;
        pendingTasks: number;
        inProgressTasks: number;
        pausedTasks: number;
        failedTasks: number;
        criticalPathLength: number;
    };
    private performanceLog: { timestamp: number; metric: string; value: any }[];
    private knownIssues: Map<string, { timestamp: number; severity: 'warning' | 'error' | 'critical'; message: string }>;

    constructor(
        orchestrator: AutonomousAgentOrchestrator,
        eventLogger: AIEventLogger,
        knowledgeGraph: GlobalKnowledgeGraph,
        ethicalAILayer: EthicalAICompliance
    ) {
        this.tasks = new Map();
        this.taskDependencies = new Map();
        this.reverseDependencies = new Map();
        this.subTaskRelationships = new Map();
        this.parentTaskMap = new Map();
        this.orchestrator = orchestrator;
        this.eventLogger = eventLogger;
        this.knowledgeGraph = knowledgeGraph;
        this.ethicalAILayer = ethicalAILayer;
        this.activeTaskMonitoringInterval = null;
        this.simulationQueue = [];
        this.emergencyShutdownFlag = false;
        this.internalHealthMetrics = {
            lastMonitorRun: Date.now(),
            scheduledTasksCount: 0,
            failedSchedulesCount: 0,
            completedTasksToday: 0,
            totalTasksManaged: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            pausedTasks: 0,
            failedTasks: 0,
            criticalPathLength: 0,
        };
        this.performanceLog = [];
        this.knownIssues = new Map();

        this.eventLogger.logEvent({
            type: 'system_alert',
            source: 'AITaskManagerService',
            payload: { message: 'AITaskManagerService initialized.' },
            severity: 'info'
        });

        this.startMonitoringPendingTasks(5000);
        this.startHealthMonitoring(30000);
    }

    public startMonitoringPendingTasks(intervalMs: number = 5000): void {
        if (this.activeTaskMonitoringInterval) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Task monitoring already active.' }, severity: 'warning' });
            return;
        }
        this.activeTaskMonitoringInterval = setInterval(() => this.monitorPendingTasks(), intervalMs);
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Started monitoring pending tasks.', interval: intervalMs }, severity: 'info' });
    }

    public stopMonitoringPendingTasks(): void {
        if (this.activeTaskMonitoringInterval) {
            clearInterval(this.activeTaskMonitoringInterval);
            this.activeTaskMonitoringInterval = null;
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Stopped monitoring pending tasks.' }, severity: 'info' });
        } else {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Task monitoring is not active.' }, severity: 'warning' });
        }
    }

    private startHealthMonitoring(intervalMs: number = 30000): void {
        setInterval(() => this.updateHealthMetrics(), intervalMs);
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Started health metrics monitoring.', interval: intervalMs }, severity: 'info' });
    }

    private updateHealthMetrics(): void {
        this.internalHealthMetrics.lastMonitorRun = Date.now();
        this.internalHealthMetrics.totalTasksManaged = this.tasks.size;
        this.internalHealthMetrics.pendingTasks = this.getTasksByStatus(['pending']).length;
        this.internalHealthMetrics.inProgressTasks = this.getTasksByStatus(['in_progress']).length;
        this.internalHealthMetrics.pausedTasks = this.getTasksByStatus(['paused']).length;
        this.internalHealthMetrics.failedTasks = this.getTasksByStatus(['failed', 'failed_scheduling', 'error']).length;
        const criticalPath = this.findCriticalPathTasksInternal();
        this.internalHealthMetrics.criticalPathLength = criticalPath.length;

        this.eventLogger.logEvent({
            type: 'system_alert',
            source: 'AITaskManagerService',
            payload: { action: 'update_internal_health_metrics', metrics: this.internalHealthMetrics },
            severity: 'debug'
        });

        if (this.internalHealthMetrics.failedTasks > 5 && this.internalHealthMetrics.failedTasks / this.internalHealthMetrics.totalTasksManaged > 0.1) {
            this.reportIssue('high_failure_rate', 'High task failure rate detected.', 'critical');
        }
    }

    private reportIssue(id: string, message: string, severity: 'warning' | 'error' | 'critical'): void {
        const issue = { timestamp: Date.now(), severity, message };
        this.knownIssues.set(id, issue);
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { action: 'reported_issue', issueId: id, message, severity }, severity });
    }

    public async createTask(
        name: string,
        description: string,
        options?: {
            priority?: AITask['priority'];
            requiredResources?: AITask['requiredResources'];
            securityContext?: AITask['securityContext'];
            dependencies?: string[];
            subTasks?: { name: string; description: string; priority?: AITask['priority']; }[];
            parentTaskId?: string;
            metadata?: Record<string, any>;
            executionEnvironment?: AITask['environmentalContext'];
            executionDeadline?: number;
        }
    ): Promise<AITask> {
        if (this.emergencyShutdownFlag) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'System in emergency shutdown mode. Cannot create new tasks.' }, severity: 'critical' });
            throw new Error('System is in emergency shutdown mode. Cannot create new tasks.');
        }

        const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const creationTimestamp = Date.now();

        const newTask: AITask = {
            id: taskId,
            name,
            description,
            status: 'pending',
            priority: options?.priority || 'medium',
            progress: 0,
            creationTimestamp,
            lastUpdateTimestamp: creationTimestamp,
            requiredResources: options?.requiredResources || {},
            securityContext: options?.securityContext || {
                encryptionLevel: 'aes256',
                accessControlList: [],
                dataSensitivity: 'internal'
            },
            dependencies: options?.dependencies || [],
            subTasks: [],
            environmentalContext: options?.executionEnvironment,
            metadata: options?.metadata || {},
            deadline: options?.executionDeadline
        };

        if (options?.parentTaskId) {
            const parentTask = this.tasks.get(options.parentTaskId);
            if (!parentTask) {
                this.eventLogger.logEvent({
                    type: 'system_alert',
                    source: 'AITaskManagerService',
                    payload: { message: `Parent task ${options.parentTaskId} not found for subtask ${taskId}.`, taskId, parentId: options.parentTaskId },
                    severity: 'warning'
                });
            } else {
                this.parentTaskMap.set(taskId, options.parentTaskId);
                parentTask.subTasks = parentTask.subTasks || [];
                parentTask.subTasks.push(newTask);
                if (!this.subTaskRelationships.has(options.parentTaskId)) {
                    this.subTaskRelationships.set(options.parentTaskId, new Set());
                }
                this.subTaskRelationships.get(options.parentTaskId)?.add(taskId);
            }
        }

        this.tasks.set(taskId, newTask);

        if (newTask.dependencies && newTask.dependencies.length > 0) {
            this.taskDependencies.set(taskId, new Set(newTask.dependencies));
            for (const depId of newTask.dependencies) {
                if (!this.reverseDependencies.has(depId)) {
                    this.reverseDependencies.set(depId, new Set());
                }
                this.reverseDependencies.get(depId)?.add(taskId);
            }
        }

        if (options?.subTasks && options.subTasks.length > 0) {
            for (const subTaskDef of options.subTasks) {
                const createdSubTask = await this.createTask(
                    subTaskDef.name,
                    subTaskDef.description,
                    { ...options, priority: subTaskDef.priority, dependencies: [...(options?.dependencies || []), taskId], parentTaskId: taskId }
                );
                newTask.subTasks?.push(createdSubTask);
            }
        }

        this.eventLogger.logEvent({
            type: 'data_update',
            source: 'AITaskManagerService',
            payload: { action: 'create_task', taskId, name, priority: newTask.priority, dependencies: newTask.dependencies, parentTaskId: options?.parentTaskId },
            severity: 'info'
        });

        const integrityCheck = await this._validateTaskIntegrity(newTask);
        if (!integrityCheck.isValid) {
            this.eventLogger.logEvent({ type: 'ethical_violation_flag', source: 'AITaskManagerService', payload: { taskId, issues: integrityCheck.issues, reason: 'Task integrity check failed at creation' }, severity: 'error' });
            this.markTaskStatus(taskId, 'failed', { error: 'Integrity check failed during creation.' });
            throw new Error(`Task creation failed: Integrity check issues - ${integrityCheck.issues.join(', ')}`);
        }

        this._tryScheduleTask(taskId);
        return newTask;
    }

    public getTask(taskId: string): AITask | undefined {
        return this.tasks.get(taskId);
    }

    public async updateTaskProgress(
        taskId: string,
        progress: number,
        output?: any,
        status?: AITask['status']
    ): Promise<AITask | undefined> {
        const task = this.tasks.get(taskId);
        if (!task) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} not found for progress update.`, taskId }, severity: 'warning' });
            return undefined;
        }

        if (progress < 0 || progress > 100) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Invalid progress value for task ${taskId}: ${progress}.`, taskId, progress }, severity: 'warning' });
            return undefined;
        }

        const oldStatus = task.status;
        task.progress = progress;
        task.lastUpdateTimestamp = Date.now();
        if (status) {
            task.status = status;
        } else if (progress === 100) {
            task.status = 'completed';
        } else if (task.status === 'pending' || task.status === 'paused') {
            task.status = 'in_progress';
        }

        if (output) {
            task.output = output;
        }

        this.eventLogger.logEvent({
            type: 'data_update',
            source: 'AITaskManagerService',
            payload: { action: 'update_task_progress', taskId, progress, newStatus: task.status, oldStatus },
            severity: 'info'
        });

        await this._handleTaskStatusChange(taskId, oldStatus, task.status, output);
        return task;
    }

    public async markTaskStatus(
        taskId: string,
        status: AITask['status'],
        output?: any,
        error?: string
    ): Promise<AITask | undefined> {
        const task = this.tasks.get(taskId);
        if (!task) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} not found for status update.`, taskId }, severity: 'warning' });
            return undefined;
        }

        const oldStatus = task.status;
        task.status = status;
        task.lastUpdateTimestamp = Date.now();
        task.output = output;
        if (error && (status === 'failed' || status === 'failed_scheduling')) {
            task.output = { ...task.output, error };
        }

        if (status === 'completed' && task.progress !== 100) {
            task.progress = 100;
            const today = new Date().toDateString();
            if (new Date(task.lastUpdateTimestamp).toDateString() === today) {
                this.internalHealthMetrics.completedTasksToday++;
            }
        } else if (status === 'failed' || status === 'paused' || status === 'failed_scheduling') {
            task.progress = task.progress;
        } else if (status === 'in_progress' && task.progress === 100) {
            task.progress = 99;
        }

        this.eventLogger.logEvent({
            type: 'data_update',
            source: 'AITaskManagerService',
            payload: { action: 'mark_task_status', taskId, newStatus: status, oldStatus, error },
            severity: (status === 'failed' || status === 'error' || status === 'failed_scheduling') ? 'error' : 'info'
        });

        await this._handleTaskStatusChange(taskId, oldStatus, status, output, error);
        return task;
    }

    public async cancelTask(taskId: string, reason: string = 'Cancelled by system or user'): Promise<AITask | undefined> {
        const task = this.tasks.get(taskId);
        if (!task) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} not found for cancellation.`, taskId }, severity: 'warning' });
            return undefined;
        }

        if (task.status === 'completed' || task.status === 'failed' || task.status === 'decommissioned' || task.status === 'failed_scheduling') {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Cannot cancel task ${taskId} in status ${task.status}.`, taskId, status: task.status }, severity: 'warning' });
            return undefined;
        }

        this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'cancel_task', taskId, reason }, severity: 'warning' });
        return this.markTaskStatus(taskId, 'failed', { reason, cancelledBy: 'system/user' });
    }

    private _checkDependenciesMet(taskId: string): boolean {
        const dependencies = this.taskDependencies.get(taskId);
        if (!dependencies || dependencies.size === 0) {
            return true;
        }

        for (const depId of dependencies) {
            const depTask = this.tasks.get(depId);
            if (!depTask || depTask.status !== 'completed') {
                return false;
            }
        }
        return true;
    }

    private async _tryScheduleTask(taskId: string): Promise<boolean> {
        if (this.emergencyShutdownFlag) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'System in emergency shutdown. Skipping task scheduling.', taskId }, severity: 'warning' });
            return false;
        }
        const task = this.tasks.get(taskId);
        if (!task || task.status !== 'pending') {
            return false;
        }

        if (!this._checkDependenciesMet(taskId)) {
            return false;
        }

        if (task.deadline && Date.now() > task.deadline) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} missed its deadline.`, taskId, deadline: task.deadline }, severity: 'warning' });
            await this.markTaskStatus(taskId, 'failed', { error: 'Task missed its deadline.' });
            return false;
        }

        const ethicalCheckResult = await this.ethicalAILayer.evaluateTask(task);
        if (!ethicalCheckResult.isEthical) {
            this.eventLogger.logEvent({ type: 'ethical_violation_flag', source: 'AITaskManagerService', payload: { taskId: task.id, reason: ethicalCheckResult.reason, action: 'prevented_scheduling' }, severity: 'critical' });
            await this.markTaskStatus(taskId, 'failed', { error: `Ethical violation: ${ethicalCheckResult.reason}` });
            return false;
        }

        const securityCheckResult = await this._performSecurityCheck(task);
        if (!securityCheckResult.isSecure) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} failed security check.`, taskId, reason: securityCheckResult.reason }, severity: 'error' });
            await this.markTaskStatus(taskId, 'failed', { error: `Security check failed: ${securityCheckResult.reason}` });
            return false;
        }

        try {
            const recommendedAgent = await this.recommendAgentForTask(taskId);
            if (!recommendedAgent) {
                throw new Error('No suitable agent found for assignment.');
            }
            const assignedTask = await this.orchestrator.assignTask(recommendedAgent.id, task);
            task.assignedAgentId = assignedTask.assignedAgentId;
            task.status = 'in_progress';
            task.lastUpdateTimestamp = Date.now();
            this.eventLogger.logEvent({
                type: 'agent_action',
                source: 'AITaskManagerService',
                payload: { action: 'task_scheduled', taskId, agentId: task.assignedAgentId, agentName: recommendedAgent.name },
                severity: 'info'
            });
            this.internalHealthMetrics.scheduledTasksCount++;
            await this._allocateSimulatedResources(task);
            return true;
        } catch (error) {
            this.eventLogger.logEvent({
                type: 'system_alert',
                source: 'AITaskManagerService',
                payload: { message: `Failed to schedule task ${taskId}: ${(error as Error).message}`, taskId, error: (error as Error).message },
                severity: 'error'
            });
            this.internalHealthMetrics.failedSchedulesCount++;
            await this.markTaskStatus(taskId, 'failed_scheduling', { error: (error as Error).message });
            return false;
        }
    }

    private async _handleTaskStatusChange(
        taskId: string,
        oldStatus: AITask['status'],
        newStatus: AITask['status'],
        output?: any,
        error?: string
    ): Promise<void> {
        this._auditTaskModification(taskId, { status: newStatus, progress: this.tasks.get(taskId)?.progress, output, lastUpdateTimestamp: Date.now() });

        if (newStatus === 'completed') {
            await this._processTaskCompletion(taskId, output);
        } else if (newStatus === 'failed' || newStatus === 'failed_scheduling' || newStatus === 'error') {
            await this._processTaskFailure(taskId, error || 'Task failed without specific error message.');
        } else if (newStatus === 'in_progress' && oldStatus === 'pending') {
            this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { message: `Task ${taskId} transitioned to in_progress.`, taskId }, severity: 'info' });
        } else if (newStatus === 'paused') {
            this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { message: `Task ${taskId} has been paused.`, taskId }, severity: 'warning' });
        }
        this._capturePerformanceMetric(`task_status_${newStatus}`, { taskId, oldStatus, newStatus });
    }

    private async _processTaskCompletion(completedTaskId: string, taskOutput: any): Promise<void> {
        this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'task_completion_processing', taskId: completedTaskId }, severity: 'info' });
        const completedTask = this.tasks.get(completedTaskId);
        if (completedTask) {
            this.knowledgeGraph.addKnowledge({
                id: `kg_task_result_${completedTaskId}`,
                type: 'task_outcome',
                label: `Result for Task: ${completedTask.name}`,
                description: `Outcome of AI Task ${completedTaskId}.`,
                properties: { taskId: completedTaskId, agentId: completedTask.assignedAgentId, output: taskOutput },
                relationships: [{ targetNodeId: completedTaskId, type: 'is_outcome_of' }],
                sourceReferences: ['AITaskManagerService'],
                timestamp: Date.now(),
                provenance: 'AI_TaskExecution',
                confidenceScore: 1.0
            });

            const dependents = this.reverseDependencies.get(completedTaskId);
            if (dependents) {
                for (const dependentTaskId of dependents) {
                    const dependentTask = this.tasks.get(dependentTaskId);
                    if (dependentTask && dependentTask.status === 'pending') {
                        this.eventLogger.logEvent({
                            type: 'data_update',
                            source: 'AITaskManagerService',
                            payload: { message: `Attempting to schedule dependent task ${dependentTaskId} after ${completedTaskId} completion.`, completedTaskId, dependentTaskId },
                            severity: 'info'
                        });
                        this._tryScheduleTask(dependentTaskId);
                    } else if (dependentTask && dependentTask.status === 'paused') {
                        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Dependent task ${dependentTaskId} is paused, not automatically scheduling.`, dependentTaskId }, severity: 'warning' });
                    }
                }
            }

            const parentTaskId = this.parentTaskMap.get(completedTaskId);
            if (parentTaskId) {
                await this._updateParentTaskProgress(parentTaskId);
            }
        }
    }

    private async _processTaskFailure(failedTaskId: string, error: string): Promise<void> {
        this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'task_failure_processing', taskId: failedTaskId, error }, severity: 'error' });
        const dependents = this.reverseDependencies.get(failedTaskId);
        if (dependents) {
            for (const dependentTaskId of dependents) {
                const dependentTask = this.tasks.get(dependentTaskId);
                if (dependentTask && (dependentTask.status === 'pending' || dependentTask.status === 'in_progress' || dependentTask.status === 'paused')) {
                    this.eventLogger.logEvent({
                        type: 'system_alert',
                        source: 'AITaskManagerService',
                        payload: { message: `Marking dependent task ${dependentTaskId} as failed due to dependency ${failedTaskId} failure.`, dependentTaskId, failedDependency: failedTaskId },
                        severity: 'error'
                    });
                    await this.markTaskStatus(dependentTaskId, 'failed', { error: `Dependency ${failedTaskId} failed: ${error}` });
                }
            }
        }

        const parentTaskId = this.parentTaskMap.get(failedTaskId);
        if (parentTaskId) {
            await this.markTaskStatus(parentTaskId, 'failed', { error: `Subtask ${failedTaskId} failed: ${error}` });
        }
    }

    private async _updateParentTaskProgress(parentTaskId: string): Promise<void> {
        const parentTask = this.tasks.get(parentTaskId);
        if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) {
            return;
        }

        const completedSubTasks = parentTask.subTasks.filter(st => st.status === 'completed').length;
        const failedSubTasks = parentTask.subTasks.filter(st => st.status === 'failed' || st.status === 'failed_scheduling' || st.status === 'error').length;
        const totalSubTasks = parentTask.subTasks.length;

        if (failedSubTasks > 0) {
            await this.markTaskStatus(parentTaskId, 'failed', { error: 'One or more subtasks failed.' });
            return;
        }

        const newParentProgress = (completedSubTasks / totalSubTasks) * 100;
        await this.updateTaskProgress(parentTaskId, newParentProgress);
    }

    public async monitorPendingTasks(): Promise<void> {
        if (this.emergencyShutdownFlag) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'System in emergency shutdown. Skipping pending task monitoring.' }, severity: 'warning' });
            return;
        }
        this.internalHealthMetrics.lastMonitorRun = Date.now();
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Running pending task monitor cycle.' }, severity: 'debug' });
        for (const taskId of this.tasks.keys()) {
            const task = this.tasks.get(taskId);
            if (task && task.status === 'pending' && this._checkDependenciesMet(taskId)) {
                this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { message: `Found pending task ${taskId} with dependencies met. Attempting to schedule.`, taskId }, severity: 'info' });
                this._tryScheduleTask(taskId);
            }
        }
    }

    public getTasksByStatus(statuses: AITask['status'][]): AITask[] {
        return Array.from(this.tasks.values()).filter(task => statuses.includes(task.status));
    }

    public getTasksByAgent(agentId: string): AITask[] {
        return Array.from(this.tasks.values()).filter(task => task.assignedAgentId === agentId);
    }

    public getDependentTasks(taskId: string): AITask[] {
        const dependents = this.reverseDependencies.get(taskId);
        if (!dependents) {
            return [];
        }
        return Array.from(dependents).map(depId => this.tasks.get(depId)).filter(Boolean) as AITask[];
    }

    public async getTaskExecutionHistory(taskId: string, limit: number = 20): Promise<AIEvent[]> {
        return this.eventLogger.queryEvents('agent_action', undefined, undefined)
            .filter(event => (event.payload as any)?.taskId === taskId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    public calculateTaskCompletionRate(sinceTimestamp?: number): number {
        const filteredTasks = Array.from(this.tasks.values()).filter(task => !sinceTimestamp || task.creationTimestamp >= sinceTimestamp);
        if (filteredTasks.length === 0) return 0;
        const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
        return (completedTasks / filteredTasks.length) * 100;
    }

    public getAverageTaskLatency(status: 'completed' | 'failed' = 'completed'): number {
        const relevantTasks = Array.from(this.tasks.values()).filter(task => task.status === status && task.creationTimestamp && task.lastUpdateTimestamp);
        if (relevantTasks.length === 0) return 0;
        const totalLatency = relevantTasks.reduce((sum, task) => sum + (task.lastUpdateTimestamp - task.creationTimestamp), 0);
        return totalLatency / relevantTasks.length;
    }

    public async _validateTaskIntegrity(task: AITask): Promise<{ isValid: boolean; issues: string[] }> {
        const issues: string[] = [];
        if (!task.name || task.name.trim() === '') {
            issues.push('Task name cannot be empty.');
        }
        if (!task.description || task.description.trim() === '') {
            issues.push('Task description cannot be empty.');
        }
        if (task.dependencies && task.dependencies.some(depId => !this.tasks.has(depId) && depId !== task.id)) {
            issues.push('One or more dependencies do not exist or refer to self.');
        }
        if (task.securityContext.dataSensitivity === 'top_secret' && !task.requiredResources?.compute) {
            issues.push('Top-secret tasks require specified compute resources for security auditing.');
        }
        const ethicalEval = await this.ethicalAILayer.evaluateTask(task);
        if (!ethicalEval.isEthical) {
            issues.push(`Ethical violation detected: ${ethicalEval.reason}`);
        }
        return { isValid: issues.length === 0, issues };
    }

    private async _performSecurityCheck(task: AITask): Promise<{ isSecure: boolean; reason?: string }> {
        if (!task.securityContext) {
            return { isSecure: true };
        }
        const aclCheck = task.securityContext.accessControlList.length > 0;
        const encryptionCheck = task.securityContext.encryptionLevel !== 'none';
        const sensitivityCheck = task.securityContext.dataSensitivity;

        if (!aclCheck && sensitivityCheck !== 'public' && sensitivityCheck !== 'internal') {
            return { isSecure: false, reason: 'Task requires access control list for its data sensitivity.' };
        }
        if (!encryptionCheck && sensitivityCheck !== 'public' && sensitivityCheck !== 'internal') {
            return { isSecure: false, reason: `Encryption is required for data sensitivity ${sensitivityCheck}.` };
        }

        const agent = task.assignedAgentId ? this.orchestrator.getAgent(task.assignedAgentId) : undefined;
        if (agent && !this.ethicalAILayer.checkDataSensitivity(sensitivityCheck, agent.securityClearance)) {
            return { isSecure: false, reason: `Assigned agent ${agent.name} lacks sufficient security clearance for data sensitivity ${sensitivityCheck}.` };
        }

        return { isSecure: true };
    }

    private async _estimateTaskDuration(task: AITask): Promise<number> {
        await new Promise(resolve => setTimeout(resolve, 50));
        let baseDuration = 0;
        switch (task.priority) {
            case 'critical': baseDuration = 1000; break;
            case 'high': baseDuration = 3000; break;
            case 'medium': baseDuration = 8000; break;
            case 'low': baseDuration = 15000; break;
            default: baseDuration = 10000; break;
        }
        let resourceFactor = 1;
        switch (task.requiredResources?.compute) {
            case 'critical': resourceFactor = 0.5; break;
            case 'high': resourceFactor = 0.7; break;
            case 'medium': resourceFactor = 0.9; break;
            case 'low': resourceFactor = 1.2; break;
            default: resourceFactor = 1; break;
        }
        return baseDuration * resourceFactor * (1 + Math.random() * 0.2); // Add some randomness
    }

    private async _allocateSimulatedResources(task: AITask): Promise<boolean> {
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { action: 'simulate_resource_allocation', taskId: task.id, resources: task.requiredResources }, severity: 'info' });
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
        const success = Math.random() > 0.05;
        if (!success) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { action: 'resource_allocation_failed', taskId: task.id }, severity: 'error' });
            this.reportIssue('resource_allocation_failure', `Simulated resource allocation failed for task ${task.id}.`, 'error');
        }
        this._capturePerformanceMetric('resource_allocation_status', { taskId: task.id, success });
        return success;
    }

    private _auditTaskModification(taskId: string, changes: Partial<AITask>, actorId: string = 'system'): void {
        this.eventLogger.logEvent({
            type: 'data_update',
            source: 'AITaskManagerService',
            payload: { action: 'audit_task_modification', taskId, actorId, changes: Object.keys(changes), changedValues: changes },
            severity: 'trace'
        });
    }

    public async optimizeTaskSchedule(criteria: 'cost' | 'speed' | 'resource_utilization' = 'speed'): Promise<string[]> {
        this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'optimize_schedule', criteria }, severity: 'info' });
        const pendingTasks = this.getTasksByStatus(['pending']);
        if (pendingTasks.length < 2) {
            return pendingTasks.map(t => t.id);
        }

        pendingTasks.sort(async (a, b) => {
            if (criteria === 'speed') {
                const durationA = await this._estimateTaskDuration(a);
                const durationB = await this._estimateTaskDuration(b);
                return durationA - durationB;
            }
            if (criteria === 'cost') {
                const costA = (a.requiredResources?.compute === 'critical' ? 10 : a.requiredResources?.compute === 'high' ? 5 : 1) + (a.subTasks?.length || 0);
                const costB = (b.requiredResources?.compute === 'critical' ? 10 : b.requiredResources?.compute === 'high' ? 5 : 1) + (b.subTasks?.length || 0);
                return costA - costB;
            }
            if (criteria === 'resource_utilization') {
                const resA = (a.requiredResources?.memoryGB || 0) + (a.requiredResources?.networkBandwidthMbps || 0) / 10;
                const resB = (b.requiredResources?.memoryGB || 0) + (b.requiredResources?.networkBandwidthMbps || 0) / 10;
                return resA - resB;
            }
            return 0;
        });

        const optimizedOrder = pendingTasks.map(t => t.id);
        this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'schedule_optimized', order: optimizedOrder, criteria }, severity: 'info' });
        this._capturePerformanceMetric('schedule_optimization', { criteria, order: optimizedOrder.length });
        return optimizedOrder;
    }

    public async predictTaskSuccess(taskId: string): Promise<number> {
        this.eventLogger.logEvent({ type: 'model_inference', source: 'AITaskManagerService', payload: { action: 'predict_task_success', taskId }, severity: 'info' });
        await new Promise(resolve => setTimeout(resolve, 150));
        const task = this.tasks.get(taskId);
        if (!task) return 0;
        let baseSuccess = 0.95;
        const dependencyFactor = this._checkDependenciesMet(taskId) ? 0 : 0.2;
        const agentAvailabilityFactor = Math.random() < 0.8 ? 0 : 0.1;
        const ethicalComplianceFactor = (await this.ethicalAILayer.evaluateTask(task)).isEthical ? 0 : 0.15;
        const deadlineMissFactor = (task.deadline && Date.now() > task.deadline) ? 0.3 : 0;
        return Math.max(0, baseSuccess - dependencyFactor - agentAvailabilityFactor - ethicalComplianceFactor - deadlineMissFactor - Math.random() * 0.05);
    }

    public async generateTaskReport(taskId: string, format: 'json' | 'markdown' = 'json'): Promise<string> {
        const task = this.tasks.get(taskId);
        if (!task) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Cannot generate report for non-existent task ${taskId}.`, taskId }, severity: 'warning' });
            throw new Error(`Task ${taskId} not found.`);
        }

        const report: TaskReport = {
            taskId: task.id,
            name: task.name,
            description: task.description,
            status: task.status,
            priority: task.priority,
            progress: task.progress,
            assignedAgentId: task.assignedAgentId,
            creationTimestamp: task.creationTimestamp,
            lastUpdateTimestamp: task.lastUpdateTimestamp,
            dependencies: Array.from(this.taskDependencies.get(taskId) || []),
            subTasks: task.subTasks?.map(st => st.id) || [],
            output: task.output,
            error: (task.output as any)?.error,
            estimatedDurationMs: await this._estimateTaskDuration(task),
            actualDurationMs: task.status === 'completed' || task.status === 'failed' ? (task.lastUpdateTimestamp - task.creationTimestamp) : undefined,
            securityCheckResult: await this._performSecurityCheck(task),
            ethicalCheckResult: await this.ethicalAILayer.evaluateTask(task),
            predictedSuccessConfidence: await this.predictTaskSuccess(taskId),
            historicalExecutionData: await this.getTaskExecutionHistory(taskId),
        };

        this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'generate_task_report', taskId, format }, severity: 'info' });
        this._capturePerformanceMetric('report_generation', { taskId, format });

        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else {
            let markdown = `# Task Report: ${report.name} (${report.taskId})\n\n`;
            markdown += `**Status:** ${report.status} (Progress: ${report.progress}%)\n`;
            markdown += `**Priority:** ${report.priority}\n`;
            markdown += `**Description:** ${report.description}\n\n`;
            markdown += `**Assigned Agent:** ${report.assignedAgentId || 'N/A'}\n`;
            markdown += `**Created:** ${new Date(report.creationTimestamp).toLocaleString()}\n`;
            markdown += `**Last Updated:** ${new Date(report.lastUpdateTimestamp).toLocaleString()}\n\n`;
            markdown += `### Execution Metrics\n`;
            markdown += `- Estimated Duration: ${report.estimatedDurationMs ? (report.estimatedDurationMs / 1000).toFixed(2) + 's' : 'N/A'}\n`;
            markdown += `- Actual Duration: ${report.actualDurationMs ? (report.actualDurationMs / 1000).toFixed(2) + 's' : 'N/A'}\n`;
            markdown += `- Predicted Success Confidence: ${(report.predictedSuccessConfidence * 100).toFixed(2)}%\n\n`;
            markdown += `### Dependencies\n`;
            if (report.dependencies.length > 0) {
                report.dependencies.forEach(dep => markdown += `- ${dep}\n`);
            } else {
                markdown += `None\n`;
            }
            markdown += `\n### Sub-Tasks\n`;
            if (report.subTasks.length > 0) {
                report.subTasks.forEach(sub => markdown += `- ${sub}\n`);
            } else {
                markdown += `None\n`;
            }
            markdown += `\n### Security & Ethical Compliance\n`;
            markdown += `- Security Check: ${report.securityCheckResult?.isSecure ? 'Passed' : 'Failed'}${report.securityCheckResult?.reason ? ` (${report.securityCheckResult.reason})` : ''}\n`;
            markdown += `- Ethical Check: ${report.ethicalCheckResult?.isEthical ? 'Passed' : 'Failed'}${report.ethicalCheckResult?.reason ? ` (${report.ethicalCheckResult.reason})` : ''}\n\n`;
            if (report.output) {
                markdown += `### Output\n\`\`\`json\n${JSON.stringify(report.output, null, 2)}\n\`\`\`\n`;
            }
            if (report.error) {
                markdown += `### Error\n\`\`\`text\n${report.error}\n\`\`\`\n`;
            }
            if (report.historicalExecutionData && report.historicalExecutionData.length > 0) {
                markdown += `\n### Recent Execution History\n`;
                report.historicalExecutionData.forEach(event => {
                    markdown += `- [${new Date(event.timestamp).toLocaleString()}] ${event.type}: ${JSON.stringify(event.payload).substring(0, 100)}...\n`;
                });
            }
            return markdown;
        }
    }

    public async recommendAgentForTask(taskId: string): Promise<AIAgent | undefined> {
        const task = this.tasks.get(taskId);
        if (!task) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Cannot recommend agent for non-existent task ${taskId}.`, taskId }, severity: 'warning' });
            return undefined;
        }
        this.eventLogger.logEvent({ type: 'model_inference', source: 'AITaskManagerService', payload: { action: 'recommend_agent', taskId, taskName: task.name }, severity: 'info' });

        const allAgents = this.orchestrator.getAllAgents();
        const suitableAgents = allAgents.filter(agent =>
            agent.status === 'idle' &&
            agent.capabilities.some(cap => task.description.toLowerCase().includes(cap.toLowerCase().replace(/_/g, ' '))) &&
            this.ethicalAILayer.checkDataSensitivity(task.securityContext.dataSensitivity, agent.securityClearance)
        );

        if (suitableAgents.length === 0) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `No suitable idle agent found for task ${taskId}.`, taskId }, severity: 'warning' });
            return undefined;
        }

        suitableAgents.sort((a, b) => {
            const priorityFactorA = (a.trustScore || 0) * (a.resourceAllocation.computeUnits || 1) + (a.learningRate === 'fast' ? 10 : 0);
            const priorityFactorB = (b.trustScore || 0) * (b.resourceAllocation.computeUnits || 1) + (b.learningRate === 'fast' ? 10 : 0);
            return priorityFactorB - priorityFactorA;
        });

        return suitableAgents[0];
    }

    public async implementDynamicResourceScaling(taskId: string, currentUsage: { cpu: number; memory: number; network: number }): Promise<void> {
        const task = this.tasks.get(taskId);
        if (!task || task.status !== 'in_progress') {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} not in progress or not found for resource scaling.`, taskId }, severity: 'warning' });
            return;
        }
        this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'dynamic_resource_scaling', taskId, currentUsage }, severity: 'info' });

        const oldResources = { ...task.requiredResources };

        if (currentUsage.cpu > 80 || currentUsage.memory > 80 || (task.deadline && task.deadline < Date.now() + 60000 && task.progress < 70)) { // Deadline nearing, scale up
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `High resource usage or deadline pressure for task ${taskId}. Scaling up.`, taskId, usage: currentUsage }, severity: 'warning' });
            task.requiredResources = {
                compute: 'critical',
                memoryGB: Math.ceil((task.requiredResources.memoryGB || 8) * 1.5),
                networkBandwidthMbps: Math.ceil((task.requiredResources.networkBandwidthMbps || 100) * 1.2)
            };
            this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'resources_scaled_up', taskId, oldResources, newResources: task.requiredResources }, severity: 'info' });
        } else if (currentUsage.cpu < 20 && currentUsage.memory < 20 && !task.deadline) { // No deadline pressure, scale down conservatively
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Low resource usage for task ${taskId}. Scaling down.`, taskId, usage: currentUsage }, severity: 'info' });
            task.requiredResources = {
                compute: 'low',
                memoryGB: Math.floor((task.requiredResources.memoryGB || 8) * 0.7),
                networkBandwidthMbps: Math.floor((task.requiredResources.networkBandwidthMbps || 100) * 0.8)
            };
            this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'resources_scaled_down', taskId, oldResources, newResources: task.requiredResources }, severity: 'info' });
        }
        this._capturePerformanceMetric('dynamic_resource_scaling_event', { taskId, oldResources, newResources: task.requiredResources, currentUsage });
    }

    public async simulateTaskExecution(taskId: string, environmentId: string = 'default_simulation_env'): Promise<any> {
        const task = this.tasks.get(taskId);
        if (!task) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} not found for simulation.`, taskId }, severity: 'warning' });
            throw new Error(`Task ${taskId} not found.`);
        }
        this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'initiate_task_simulation', taskId, environmentId }, severity: 'info' });

        this.simulationQueue.push(taskId);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        const simulationResult = {
            simulatedDuration: await this._estimateTaskDuration(task),
            simulatedOutcome: Math.random() > 0.1 ? 'success' : 'failure',
            riskFactors: Math.random() < 0.2 ? ['high_resource_contention', 'data_inconsistency', 'agent_misinterpretation'] : [],
            predictedEthicalViolations: Math.random() < 0.03 ? ['data_breach_risk'] : []
        };
        this.simulationQueue = this.simulationQueue.filter(id => id !== taskId);

        this.eventLogger.logEvent({ type: 'model_inference', source: 'AITaskManagerService', payload: { action: 'task_simulation_completed', taskId, environmentId, simulationResult }, severity: 'info' });

        this.knowledgeGraph.addKnowledge({
            id: `kg_sim_task_${taskId}_${Date.now()}`,
            type: 'simulation_run',
            label: `Simulation for Task: ${task.name}`,
            description: `Simulated execution of Task ${taskId} in ${environmentId}.`,
            properties: { taskId, environmentId, ...simulationResult },
            relationships: [{ targetNodeId: taskId, type: 'simulated_for' }],
            sourceReferences: ['AITaskManagerService'],
            timestamp: Date.now(),
            provenance: 'AI_Simulation',
            confidenceScore: 0.8
        });
        this._capturePerformanceMetric('task_simulation', { taskId, outcome: simulationResult.simulatedOutcome });

        return simulationResult;
    }

    public async rollbackTaskState(taskId: string, targetTimestamp: number): Promise<boolean> {
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { action: 'rollback_task_state', taskId, targetTimestamp }, severity: 'warning' });
        const task = this.tasks.get(taskId);
        if (!task) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} not found for rollback.`, taskId }, severity: 'warning' });
            return false;
        }

        const taskHistory = await this.eventLogger.queryEvents('data_update')
            .filter(event => (event.payload as any)?.taskId === taskId && event.timestamp <= targetTimestamp)
            .sort((a, b) => b.timestamp - a.timestamp);

        if (taskHistory.length === 0) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `No suitable state found for rollback of task ${taskId} to ${targetTimestamp}.`, taskId }, severity: 'warning' });
            return false;
        }

        const lastStateEvent = taskHistory[0];
        const payload = lastStateEvent.payload as any;
        const rolledBackStatus = payload?.newStatus || payload?.status;
        const rolledBackProgress = payload?.progress || 0;
        const rolledBackOutput = payload?.output;

        if (rolledBackStatus) {
            await this.markTaskStatus(taskId, rolledBackStatus, rolledBackOutput);
            await this.updateTaskProgress(taskId, rolledBackProgress);
            this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'task_state_rolled_back', taskId, toStatus: rolledBackStatus, toProgress: rolledBackProgress, targetTimestamp }, severity: 'info' });
            this._capturePerformanceMetric('task_rollback', { taskId, targetTimestamp, success: true });
            return true;
        }
        this._capturePerformanceMetric('task_rollback', { taskId, targetTimestamp, success: false });
        return false;
    }

    public getTaskGraph(): { nodes: AITask[]; edges: { source: string; target: string; type: string }[] } {
        const nodes: AITask[] = Array.from(this.tasks.values());
        const edges: { source: string; target: string; type: string }[] = [];

        this.taskDependencies.forEach((deps, taskId) => {
            deps.forEach(depId => edges.push({ source: depId, target: taskId, type: 'dependency' }));
        });

        this.subTaskRelationships.forEach((subTasks, parentId) => {
            subTasks.forEach(subId => edges.push({ source: parentId, target: subId, type: 'sub_task' }));
        });

        this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'generate_task_graph', nodeCount: nodes.length, edgeCount: edges.length }, severity: 'debug' });
        this._capturePerformanceMetric('task_graph_generated', { nodeCount: nodes.length, edgeCount: edges.length });
        return { nodes, edges };
    }

    public triggerEmergencyShutdown(reason: string): void {
        this.emergencyShutdownFlag = true;
        this.stopMonitoringPendingTasks();
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Emergency shutdown triggered for AITaskManagerService.', reason }, severity: 'critical' });
        this.reportIssue('emergency_shutdown', `System-wide emergency shutdown initiated: ${reason}`, 'critical');

        for (const task of this.tasks.values()) {
            if (task.status === 'in_progress' || task.status === 'pending' || task.status === 'paused') {
                this.markTaskStatus(task.id, 'failed', { error: `Emergency shutdown: ${reason}` });
            }
        }
    }

    public resumeOperations(): void {
        if (!this.emergencyShutdownFlag) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Operations already resumed or never shut down.', }, severity: 'warning' });
            return;
        }
        this.emergencyShutdownFlag = false;
        this.startMonitoringPendingTasks();
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'AITaskManagerService operations resumed.', }, severity: 'info' });
        this.knownIssues.delete('emergency_shutdown');
        for (const task of this.tasks.values()) {
            if (task.status === 'failed' && (task.output as any)?.error?.includes('Emergency shutdown')) {
                this.markTaskStatus(task.id, 'pending', { error: 'Restarted after emergency shutdown. Re-evaluate.' });
            }
        }
    }

    public async getTaskComplexityScore(taskId: string): Promise<number> {
        const task = this.tasks.get(taskId);
        if (!task) return 0;
        let score = 0;
        score += (task.description.length / 100);
        score += (task.subTasks?.length || 0) * 5;
        score += (this.taskDependencies.get(taskId)?.size || 0) * 3;
        if (task.priority === 'critical') score += 10;
        if (task.securityContext.dataSensitivity === 'top_secret') score += 7;
        score += Math.random() * 2;
        this.eventLogger.logEvent({ type: 'model_inference', source: 'AITaskManagerService', payload: { action: 'calculate_complexity_score', taskId, score }, severity: 'debug' });
        this._capturePerformanceMetric('task_complexity', { taskId, score });
        return score;
    }

    public async distributeLoadAcrossAgents(agentIds?: string[]): Promise<void> {
        this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'distribute_agent_load', targetAgents: agentIds || 'all' }, severity: 'info' });
        const allAgents = agentIds ? agentIds.map(id => this.orchestrator.getAgent(id)).filter(Boolean) as AIAgent[] : this.orchestrator.getAllAgents();
        const pendingTasks = this.getTasksByStatus(['pending']).sort((a, b) => (this.getTaskComplexityScore(b.id) as any) - (this.getTaskComplexityScore(a.id) as any));

        if (allAgents.length === 0 || pendingTasks.length === 0) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'No agents or pending tasks for load distribution.' }, severity: 'warning' });
            return;
        }

        let agentIndex = 0;
        for (const task of pendingTasks) {
            if (this.emergencyShutdownFlag) {
                this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Emergency shutdown active, stopping load distribution.' }, severity: 'critical' });
                break;
            }
            const targetAgent = allAgents[agentIndex % allAgents.length];
            if (targetAgent && this._checkDependenciesMet(task.id)) {
                try {
                    await this.orchestrator.assignTask(targetAgent.id, task);
                    this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { message: `Load distributed: task ${task.id} assigned to ${targetAgent.id}`, taskId: task.id, agentId: targetAgent.id }, severity: 'info' });
                    task.status = 'in_progress';
                    task.assignedAgentId = targetAgent.id;
                    agentIndex++;
                    this.internalHealthMetrics.scheduledTasksCount++;
                } catch (error) {
                    this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Failed to assign task ${task.id} to agent ${targetAgent.id} during load distribution: ${(error as Error).message}`, taskId: task.id, agentId: targetAgent.id }, severity: 'error' });
                    this.internalHealthMetrics.failedSchedulesCount++;
                }
            }
        }
        this._capturePerformanceMetric('load_distribution', { pendingTasks: pendingTasks.length, agents: allAgents.length });
    }

    public async batchCreateTasks(taskDefinitions: { name: string; description: string; options?: Parameters<AITaskManagerService['createTask']>[2] }[]): Promise<AITask[]> {
        this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'batch_create_tasks', count: taskDefinitions.length }, severity: 'info' });
        const createdTasks: AITask[] = [];
        for (const def of taskDefinitions) {
            if (this.emergencyShutdownFlag) {
                this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Emergency shutdown active, stopping batch task creation.' }, severity: 'critical' });
                break;
            }
            try {
                const task = await this.createTask(def.name, def.description, def.options);
                createdTasks.push(task);
            } catch (error) {
                this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Failed to create task in batch: ${def.name}, error: ${(error as Error).message}` }, severity: 'error' });
            }
        }
        this._capturePerformanceMetric('batch_task_creation', { count: taskDefinitions.length, created: createdTasks.length });
        return createdTasks;
    }

    public async deleteCompletedTasks(olderThanDays: number = 30): Promise<number> {
        this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'delete_completed_tasks', olderThanDays }, severity: 'info' });
        const cutoffTimestamp = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
        let deletedCount = 0;
        for (const [taskId, task] of this.tasks.entries()) {
            if ((task.status === 'completed' || task.status === 'failed') && task.lastUpdateTimestamp < cutoffTimestamp && !(this.reverseDependencies.get(taskId)?.size || 0)) {
                this.tasks.delete(taskId);
                this.taskDependencies.delete(taskId);
                this.reverseDependencies.forEach(deps => deps.delete(taskId));
                this.subTaskRelationships.delete(taskId);
                this.parentTaskMap.delete(taskId);
                deletedCount++;
                this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'task_purged', taskId }, severity: 'debug' });
            }
        }
        this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { message: `Purged ${deletedCount} completed/failed tasks older than ${olderThanDays} days.`, deletedCount }, severity: 'info' });
        this._capturePerformanceMetric('task_purge', { deletedCount, olderThanDays });
        return deletedCount;
    }

    public async archiveTask(taskId: string, archiveTarget: 'long_term_storage' | 'knowledge_graph_only' = 'long_term_storage'): Promise<boolean> {
        const task = this.tasks.get(taskId);
        if (!task) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} not found for archival.`, taskId }, severity: 'warning' });
            return false;
        }

        if (task.status !== 'completed' && task.status !== 'failed') {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Task ${taskId} cannot be archived in current status ${task.status}.`, taskId, status: task.status }, severity: 'warning' });
            return false;
        }

        this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'archive_task', taskId, archiveTarget }, severity: 'info' });

        if (archiveTarget === 'knowledge_graph_only' || archiveTarget === 'long_term_storage') {
            const report = await this.generateTaskReport(taskId, 'json');
            this.knowledgeGraph.addKnowledge({
                id: `kg_archive_${taskId}`,
                type: 'archived_task_report',
                label: `Archived Report for Task: ${task.name}`,
                description: `Full report of AI Task ${taskId} for long-term knowledge retention.`,
                properties: { taskId, report: JSON.parse(report) },
                relationships: [{ targetNodeId: taskId, type: 'archived_record_of' }],
                sourceReferences: ['AITaskManagerService_Archive'],
                timestamp: Date.now(),
                provenance: 'AI_TaskArchival',
                confidenceScore: 0.99
            });
        }
        if (archiveTarget === 'long_term_storage') {
            this.tasks.delete(taskId);
            this.taskDependencies.delete(taskId);
            this.reverseDependencies.forEach(deps => deps.delete(taskId));
            this.subTaskRelationships.delete(taskId);
            this.parentTaskMap.delete(taskId);
            this.eventLogger.logEvent({ type: 'data_update', source: 'AITaskManagerService', payload: { action: 'task_removed_from_active_memory', taskId, reason: 'archived' }, severity: 'debug' });
        }
        this._capturePerformanceMetric('task_archival', { taskId, archiveTarget });
        return true;
    }

    public async getActiveSimulationsCount(): Promise<number> {
        return this.simulationQueue.length;
    }

    public async getSystemLoadMetric(): Promise<{ activeTasks: number; pendingTasks: number; failedTasks: number; inProgressTasks: number; totalTasks: number; simulationLoad: number; criticalPathTasks: number }> {
        const activeTasks = this.getTasksByStatus(['in_progress', 'paused']).length;
        const pendingTasks = this.getTasksByStatus(['pending']).length;
        const failedTasks = this.getTasksByStatus(['failed', 'failed_scheduling', 'error']).length;
        const inProgressTasks = this.getTasksByStatus(['in_progress']).length;
        const totalTasks = this.tasks.size;
        const simulationLoad = this.simulationQueue.length;
        const criticalPathTasks = (await this.findCriticalPathTasks()).length;
        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { action: 'system_load_metric', activeTasks, pendingTasks, failedTasks, simulationLoad, criticalPathTasks }, severity: 'debug' });
        return { activeTasks, pendingTasks, failedTasks, inProgressTasks, totalTasks, simulationLoad, criticalPathTasks };
    }

    public async generateSyntheticTask(purpose: string, difficulty: 'easy' | 'medium' | 'hard' | 'extreme'): Promise<AITask> {
        this.eventLogger.logEvent({ type: 'model_inference', source: 'AITaskManagerService', payload: { action: 'generate_synthetic_task', purpose, difficulty }, severity: 'info' });
        await new Promise(resolve => setTimeout(resolve, 300));

        const baseDesc = `Perform a complex AI operation for ${purpose} with ${difficulty} difficulty.`;
        const generatedName = `Synthetic Task ${Math.random().toString(36).substring(2, 8)}`;
        let dependencies: string[] = [];
        let subTasks: { name: string; description: string }[] = [];
        let resources: AITask['requiredResources'] = {};
        let priority: AITask['priority'] = 'low';

        switch (difficulty) {
            case 'easy':
                priority = 'low';
                resources.compute = 'low';
                break;
            case 'medium':
                priority = 'medium';
                resources.compute = 'medium';
                break;
            case 'hard':
                priority = 'high';
                resources.compute = 'high';
                const existingTaskIds = Array.from(this.tasks.keys());
                if (existingTaskIds.length > 0) {
                    dependencies.push(existingTaskIds[Math.floor(Math.random() * existingTaskIds.length)]);
                }
                subTasks.push({ name: `Subtask 1 for ${generatedName}`, description: `Detailed sub-component for ${purpose}.` });
                break;
            case 'extreme':
                priority = 'critical';
                resources.compute = 'critical';
                resources.memoryGB = 64;
                resources.networkBandwidthMbps = 500;
                const existingTasksForExtreme = Array.from(this.tasks.keys());
                if (existingTasksForExtreme.length > 1) {
                    dependencies.push(existingTasksForExtreme[Math.floor(Math.random() * existingTasksForExtreme.length)]);
                    dependencies.push(existingTasksForExtreme[Math.floor(Math.random() * existingTasksForExtreme.length)]);
                }
                for (let i = 0; i < 3; i++) {
                    subTasks.push({ name: `Subtask ${i+1} for ${generatedName}`, description: `Critical part ${i+1} for ${purpose}.` });
                }
                break;
        }

        const newTask = await this.createTask(generatedName, baseDesc, {
            priority,
            dependencies,
            subTasks,
            requiredResources: resources,
            executionDeadline: Date.now() + (difficulty === 'extreme' ? 1 : difficulty === 'hard' ? 2 : difficulty === 'medium' ? 5 : 10) * 3600 * 1000
        });
        this._capturePerformanceMetric('synthetic_task_generation', { taskId: newTask.id, purpose, difficulty });
        return newTask;
    }

    public async findCriticalPathTasks(): Promise<AITask[]> {
        return this.findCriticalPathTasksInternal();
    }

    private findCriticalPathTasksInternal(): AITask[] {
        this.eventLogger.logEvent({ type: 'agent_action', source: 'AITaskManagerService', payload: { action: 'find_critical_path_tasks_internal' }, severity: 'info' });
        const nodes = this.tasks;
        const entryNodes = Array.from(nodes.values()).filter(task => (this.taskDependencies.get(task.id)?.size || 0) === 0);
        const exitNodes = Array.from(nodes.values()).filter(task => (this.reverseDependencies.get(task.id)?.size || 0) === 0);

        if (entryNodes.length === 0 || exitNodes.length === 0) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Could not determine critical path: no clear entry or exit nodes.', entryCount: entryNodes.length, exitCount: exitNodes.length }, severity: 'warning' });
            return [];
        }

        const taskDurations: Map<string, number> = new Map();
        for (const task of nodes.values()) {
            // Note: _estimateTaskDuration is async. For an internal sync method, we use a cached or simplified value.
            // For true critical path, this would involve awaiting all durations, which is expensive in hot path.
            // For demonstration, we'll use a placeholder or average value.
            taskDurations.set(task.id, 1000 + (task.description.length * 10));
        }

        const earliestStart: Map<string, number> = new Map();
        const latestFinish: Map<string, number> = new Map();

        for (const task of nodes.values()) {
            earliestStart.set(task.id, 0);
            latestFinish.set(task.id, Infinity);
        }

        const topologicalOrder: string[] = [];
        const inDegree: Map<string, number> = new Map();
        for (const task of nodes.values()) {
            inDegree.set(task.id, this.taskDependencies.get(task.id)?.size || 0);
        }

        const queue: string[] = entryNodes.map(t => t.id);
        while (queue.length > 0) {
            const uId = queue.shift()!;
            topologicalOrder.push(uId);

            for (const vId of (this.reverseDependencies.get(uId) || new Set())) {
                inDegree.set(vId, (inDegree.get(vId) || 0) - 1);
                if ((inDegree.get(vId) || 0) === 0) {
                    queue.push(vId);
                }
            }
        }

        if (topologicalOrder.length !== nodes.size) {
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: 'Cyclic dependencies detected in task graph. Critical path cannot be accurately determined.', totalNodes: nodes.size, topoNodes: topologicalOrder.length }, severity: 'error' });
            this._capturePerformanceMetric('critical_path_cycle_detection', { cyclic: true });
            this.reportIssue('cyclic_dependencies', 'Cyclic dependencies detected in task graph, critical path calculation impaired.', 'error');
            return [];
        }

        for (const uId of topologicalOrder) {
            const uDuration = taskDurations.get(uId) || 0;
            earliestStart.set(uId, Math.max(earliestStart.get(uId) || 0, 0));
            for (const vId of (this.reverseDependencies.get(uId) || new Set())) {
                const currentES = earliestStart.get(vId) || 0;
                earliestStart.set(vId, Math.max(currentES, (earliestStart.get(uId) || 0) + uDuration));
            }
        }

        let maxProjectDuration = 0;
        for (const exitNode of exitNodes) {
            maxProjectDuration = Math.max(maxProjectDuration, (earliestStart.get(exitNode.id) || 0) + (taskDurations.get(exitNode.id) || 0));
        }

        for (const uId of [...topologicalOrder].reverse()) {
            const uDuration = taskDurations.get(uId) || 0;
            if ((this.reverseDependencies.get(uId)?.size || 0) === 0) { // Exit nodes
                latestFinish.set(uId, maxProjectDuration);
            }
            for (const vId of (this.reverseDependencies.get(uId) || new Set())) {
                latestFinish.set(uId, Math.min(latestFinish.get(uId) || 0, (latestFinish.get(vId) || 0) - (taskDurations.get(vId) || 0)));
            }
        }

        const criticalPathTasks: AITask[] = [];
        for (const task of nodes.values()) {
            const es = earliestStart.get(task.id) || 0;
            const lf = latestFinish.get(task.id) || 0;
            const duration = taskDurations.get(task.id) || 0;
            const totalFloat = lf - es - duration;
            if (totalFloat === 0) {
                criticalPathTasks.push(task);
            }
        }

        this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { message: `Critical path identified with ${criticalPathTasks.length} tasks.`, criticalPathLength: maxProjectDuration }, severity: 'info' });
        this._capturePerformanceMetric('critical_path_found', { pathLength: criticalPathTasks.length, totalDuration: maxProjectDuration });
        return criticalPathTasks.sort((a, b) => (earliestStart.get(a.id) || 0) - (earliestStart.get(b.id) || 0));
    }

    private _capturePerformanceMetric(metric: string, value: any): void {
        this.performanceLog.push({ timestamp: Date.now(), metric, value });
        if (this.performanceLog.length > 1000) {
            this.performanceLog.shift();
        }
    }

    public getPerformanceMetrics(metricName?: string, fromTimestamp?: number): { timestamp: number; metric: string; value: any }[] {
        return this.performanceLog.filter(entry => {
            let match = true;
            if (metricName && entry.metric !== metricName) match = false;
            if (fromTimestamp && entry.timestamp < fromTimestamp) match = false;
            return match;
        });
    }

    public getKnownIssues(severity?: 'warning' | 'error' | 'critical'): { id: string; timestamp: number; severity: 'warning' | 'error' | 'critical'; message: string }[] {
        return Array.from(this.knownIssues.entries())
            .map(([id, issue]) => ({ id, ...issue }))
            .filter(issue => !severity || issue.severity === severity);
    }

    public resolveIssue(issueId: string): boolean {
        if (this.knownIssues.has(issueId)) {
            this.knownIssues.delete(issueId);
            this.eventLogger.logEvent({ type: 'system_alert', source: 'AITaskManagerService', payload: { action: 'issue_resolved', issueId }, severity: 'info' });
            return true;
        }
        return false;
    }
}