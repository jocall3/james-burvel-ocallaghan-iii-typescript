import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// --- Core Data Models and Interfaces ---
// A goal that the self-rewriting codebase aims to achieve.
export interface Goal {
  id: string;
  text: string;
  status: 'PENDING' | 'PASSING' | 'FAILING' | 'BLOCKED' | 'IN_PROGRESS' | 'REVIEW_NEEDED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dependencies: string[]; // IDs of goals this goal depends on
  category: 'FEATURE' | 'PERFORMANCE' | 'SECURITY' | 'MAINTENANCE' | 'BUGFIX';
  assignedAgent?: string; // Which AI agent or human is working on it
  progressPercentage?: number;
  lastUpdated?: string;
  eta?: string; // Estimated time of arrival
  relatedTickets?: string[]; // IDs of related external tickets/issues
  metricImpact?: MetricImpact[]; // How this goal affects specific metrics
}

// Represents a specific task derived from a goal, performed by an AI agent.
export interface AIProcessTask {
  id: string;
  goalId: string;
  description: string;
  type: 'CODE_GEN' | 'CODE_REF_FACTOR' | 'TEST_GEN' | 'TEST_EXEC' | 'DEPLOY' | 'MONITOR' | 'SECURITY_SCAN' | 'COST_OPT' | 'DOCUMENTATION';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  startedAt?: string;
  completedAt?: string;
  logs: LogEntry[];
  estimatedDurationMs: number;
  actualDurationMs?: number;
  output?: string;
  artifacts?: { type: 'FILE_CHANGE' | 'REPORT' | 'METRIC_UPDATE', content: any }[];
}

// Represents a file within the simulated codebase.
export interface CodeFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust' | 'shell' | 'yaml' | 'json' | 'markdown';
  lastModified: string;
  version: number;
  linesOfCode: number;
  module?: string; // e.g., 'components/views/blueprints'
  isNew?: boolean;
  isDeleted?: boolean;
}

// Represents a change made by the AI.
export interface CodeChange {
  id: string;
  taskId: string; // The AI task that produced this change
  fileId: string; // The file being changed
  filePath: string;
  oldContent: string;
  newContent: string;
  diff: string; // Unified diff format
  timestamp: string;
  approved: boolean;
  reviewer?: string; // Human or another AI agent
  reviewComments?: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'APPLIED';
}

// Represents a commit in the simulated VCS.
export interface CodeCommit {
  id: string;
  message: string;
  author: 'AI_AGENT' | 'HUMAN';
  timestamp: string;
  changes: CodeChange[]; // IDs of CodeChange objects
  parentCommitId?: string;
  branch: string;
}

// Represents a test result.
export interface TestResult {
  id: string;
  name: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  suite: string;
  errorMessage?: string;
  stackTrace?: string;
  timestamp: string;
  relatedFileId?: string; // ID of the file the test covers
}

// Represents a metric value over time.
export interface Metric {
  id: string;
  name: string;
  category: 'PERFORMANCE' | 'RESOURCE_UTILIZATION' | 'AVAILABILITY' | 'SECURITY' | 'COST';
  unit: string; // e.g., 'ms', '%', '$', 'count'
  value: number;
  timestamp: string;
  threshold?: number; // Optional threshold for alerting
  isAlert?: boolean;
}

// How a goal is expected to impact a metric.
export interface MetricImpact {
  metricId: string; // Which metric is affected
  expectedChange: 'INCREASE' | 'DECREASE' | 'STABLE';
  targetValue?: number; // What is the target value for this metric
  actualValue?: number; // What is the actual value after the goal is achieved
}

// Log entry from an AI agent or system.
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string; // e.g., 'AI_AGENT_CODE_GEN', 'TEST_RUNNER', 'DEPLOYMENT_SERVICE'
  context?: Record<string, any>;
}

// Configuration for an AI agent.
export interface AIAgentConfig {
  agentId: string;
  name: string;
  model: string; // e.g., 'GPT-4o', 'Claude 3.5 Sonnet'
  creativity: number; // 0-10, how adventurous the code generation is
  refactoringStrategy: 'OPTIMIZE_PERFORMANCE' | 'IMPROVE_READABILITY' | 'REDUCE_COMPLEXITY';
  testCoverageTarget: number; // 0-100%
  costOptimizationBudget: number; // Max daily spend for cloud resources
  securityVulnerabilityThreshold: 'LOW' | 'MEDIUM' | 'HIGH';
  deploymentStrategy: 'AUTOMATIC' | 'MANUAL_APPROVAL';
  enabledFeatures: string[];
  maxParallelTasks: number;
}

// User feedback on AI-generated code or behavior.
export interface UserFeedback {
  id: string;
  goalId?: string;
  changeId?: string;
  comment: string;
  rating: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  timestamp: string;
  type: 'CODE_REVIEW' | 'PERFORMANCE_FEEDBACK' | 'BUG_REPORT' | 'GENERAL';
}

// Deployment status.
export interface DeploymentStatus {
  id: string;
  environment: 'DEV' | 'STAGING' | 'PRODUCTION';
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'ROLLBACK';
  version: string; // Version identifier, e.g., commit hash
  startedAt: string;
  completedAt?: string;
  logs: LogEntry[];
  deployedServices: string[];
  durationMs?: number;
}

// Security scan finding.
export interface SecurityFinding {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string; // e.g., 'XSS', 'SQL_INJECTION', 'HARDCODED_CREDENTIALS'
  filePath: string;
  lineNumber: number;
  description: string;
  recommendation: string;
  status: 'OPEN' | 'FIXED' | 'FALSE_POSITIVE' | 'MITIGATED';
  discoveredByTask?: string; // ID of the AI task that found it
  fixedByTask?: string; // ID of the AI task that fixed it
  timestamp: string;
}

// Cost analysis report.
export interface CostReport {
  id: string;
  period: string; // e.g., 'DAILY', 'WEEKLY', 'MONTHLY'
  timestamp: string;
  totalCost: number;
  estimatedSavings: number;
  breakdown: {
    service: string;
    cost: number;
    optimizationOpportunity: number;
  }[];
  recommendations: string[];
  relatedTasks?: string[]; // Tasks that address these costs
}

// Knowledge Graph Nodes and Edges
export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'FILE' | 'FUNCTION' | 'CLASS' | 'VARIABLE' | 'CONCEPT' | 'REQUIREMENT' | 'GOAL';
  data?: any; // Reference to CodeFile, Goal, etc.
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'CALLS' | 'USES' | 'DEPENDS_ON' | 'IMPLEMENTS' | 'DEFINES' | 'RELATED_TO';
}

// --- Utility Functions (Simulations and Data Generation) ---
export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const formatTimestamp = (date: Date): string => date.toISOString();

export const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateRandomString = (length: number): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateMockLogEntry = (source: string, level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'): LogEntry => ({
  id: generateUniqueId(),
  timestamp: formatTimestamp(new Date()),
  level: level || pickRandom(['INFO', 'WARN', 'ERROR', 'DEBUG']),
  message: `[${source}] ${generateRandomString(50)}`,
  source,
  context: {
    requestId: generateUniqueId(),
    operation: pickRandom(['read', 'write', 'delete', 'update']),
  }
});

export const generateMockCodeFile = (path: string, content: string = generateRandomString(500)): CodeFile => ({
  id: generateUniqueId(),
  path,
  name: path.split('/').pop() || '',
  content,
  language: pickRandom(['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'shell', 'yaml', 'json', 'markdown']),
  lastModified: formatTimestamp(new Date()),
  version: 1,
  linesOfCode: content.split('\n').length
});

export const generateMockCodeChange = (taskId: string, file: CodeFile): CodeChange => {
  const oldContent = file.content;
  const newContent = `${oldContent}\n// Added by AI: ${generateRandomString(30)}`;
  const diff = `--- a/${file.path}\n+++ b/${file.path}\n@@ -1,3 +1,4 @@\n ${oldContent.split('\n').slice(0,2).join('\n')}\n+${newContent.split('\n').pop()}\n`;
  return {
    id: generateUniqueId(),
    taskId,
    fileId: file.id,
    filePath: file.path,
    oldContent,
    newContent,
    diff,
    timestamp: formatTimestamp(new Date()),
    approved: false,
    status: 'PENDING_REVIEW'
  };
};

export const generateMockTestResult = (fileId: string, status?: 'PASSED' | 'FAILED' | 'SKIPPED'): TestResult => ({
  id: generateUniqueId(),
  name: `test_${fileId.substring(0, 5)}_${generateRandomString(10).replace(/ /g, '_')}`,
  status: status || pickRandom(['PASSED', 'FAILED', 'SKIPPED']),
  durationMs: Math.floor(Math.random() * 500) + 10,
  suite: pickRandom(['unit', 'integration', 'e2e']),
  errorMessage: status === 'FAILED' ? `Assertion failed: expected X got Y at ${generateRandomString(15)}` : undefined,
  timestamp: formatTimestamp(new Date()),
  relatedFileId: fileId
});

export const generateMockMetric = (name: string, category: Metric['category'], unit: string, threshold?: number): Metric => ({
  id: generateUniqueId(),
  name,
  category,
  unit,
  value: parseFloat((Math.random() * 100).toFixed(2)),
  timestamp: formatTimestamp(new Date()),
  threshold
});

export const generateMockSecurityFinding = (filePath: string): SecurityFinding => ({
  id: generateUniqueId(),
  severity: pickRandom(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  type: pickRandom(['XSS', 'SQL_INJECTION', 'HARDCODED_CREDENTIALS', 'INSECURE_DEPENDENCY', 'MISSING_AUTH']),
  filePath,
  lineNumber: Math.floor(Math.random() * 100) + 1,
  description: `Potential security vulnerability: ${generateRandomString(50)}`,
  recommendation: `Apply patch, sanitize input, use environment variables: ${generateRandomString(40)}`,
  status: pickRandom(['OPEN', 'FIXED']),
  timestamp: formatTimestamp(new Date())
});

export const generateMockCostReport = (): CostReport => ({
  id: generateUniqueId(),
  period: 'DAILY',
  timestamp: formatTimestamp(new Date()),
  totalCost: parseFloat((Math.random() * 1000).toFixed(2)),
  estimatedSavings: parseFloat((Math.random() * 200).toFixed(2)),
  breakdown: [
    { service: 'AWS EC2', cost: parseFloat((Math.random() * 300).toFixed(2)), optimizationOpportunity: parseFloat((Math.random() * 50).toFixed(2)) },
    { service: 'AWS Lambda', cost: parseFloat((Math.random() * 150).toFixed(2)), optimizationOpportunity: parseFloat((Math.random() * 30).toFixed(2)) },
    { service: 'AWS S3', cost: parseFloat((Math.random() * 50).toFixed(2)), optimizationOpportunity: parseFloat((Math.random() * 10).toFixed(2)) },
  ],
  recommendations: Array(3).fill(0).map(() => generateRandomString(80)),
});

// --- Complex Mock Data Initialization ---
const initialFiles: CodeFile[] = [
  generateMockCodeFile('src/api/auth.ts', `import { User } from './types';\nexport function login(user: User) { /* ... */ }`),
  generateMockCodeFile('src/components/UserDashboard.tsx', `import React from 'react';\nconst Dashboard = () => <p>User Dashboard</p>;\nexport default Dashboard;`),
  generateMockCodeFile('src/services/dataService.ts', `export async function fetchData() { return []; }`),
  generateMockCodeFile('tests/api/auth.test.ts', `import { login } from '../../src/api/auth';\ndescribe('login', () => { it('should work', () => expect(true).toBe(true)); });`),
];

const initialMetrics: Metric[] = [
  generateMockMetric('API Latency p95', 'PERFORMANCE', 'ms', 50),
  generateMockMetric('CPU Utilization Avg', 'RESOURCE_UTILIZATION', '%', 70),
  generateMockMetric('Memory Usage Avg', 'RESOURCE_UTILIZATION', '%', 80),
  generateMockMetric('Error Rate', 'AVAILABILITY', '%', 1),
  generateMockMetric('Security Score', 'SECURITY', 'score', 90),
  generateMockMetric('Daily Infrastructure Cost', 'COST', '$', 100),
];

// --- React Components for AI-Driven Development Environment ---

/**
 * Renders a single goal with expanded details.
 * @param goal The goal object.
 * @param onUpdateStatus Callback to update goal status.
 */
export const GoalDetailsCard: React.FC<{ goal: Goal; onUpdateStatus: (id: string, status: Goal['status']) => void }> = ({ goal, onUpdateStatus }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-3 border border-gray-600">
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-xl font-semibold text-cyan-300">{goal.text}</h4>
      <span className={`px-3 py-1 text-sm rounded-full ${
        goal.status === 'PASSING' ? 'bg-green-600' :
        goal.status === 'FAILING' ? 'bg-red-600' :
        goal.status === 'IN_PROGRESS' ? 'bg-blue-600' :
        goal.status === 'REVIEW_NEEDED' ? 'bg-yellow-600' :
        'bg-gray-500'
      } text-white`}>{goal.status}</span>
    </div>
    <div className="text-sm text-gray-300 grid grid-cols-2 gap-2 mb-3">
      <p><strong>Priority:</strong> <span className={`font-medium ${
        goal.priority === 'CRITICAL' ? 'text-red-400' :
        goal.priority === 'HIGH' ? 'text-orange-400' :
        goal.priority === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
      }`}>{goal.priority}</span></p>
      <p><strong>Category:</strong> {goal.category}</p>
      <p><strong>Agent:</strong> {goal.assignedAgent || 'Unassigned'}</p>
      <p><strong>Progress:</strong> {goal.progressPercentage ? `${goal.progressPercentage.toFixed(0)}%` : 'N/A'}</p>
      <p><strong>Last Updated:</strong> {goal.lastUpdated ? new Date(goal.lastUpdated).toLocaleString() : 'N/A'}</p>
      <p><strong>ETA:</strong> {goal.eta || 'N/A'}</p>
    </div>
    {goal.dependencies.length > 0 && (
      <p className="text-sm text-gray-400 mb-2"><strong>Dependencies:</strong> {goal.dependencies.join(', ')}</p>
    )}
    {goal.metricImpact && goal.metricImpact.length > 0 && (
      <div className="mb-2">
        <p className="text-sm text-gray-400 font-semibold">Metric Impact:</p>
        <ul className="list-disc list-inside text-xs text-gray-400 ml-2">
          {goal.metricImpact.map((mi, idx) => (
            <li key={idx}>{mi.metricId}: Expected {mi.expectedChange}, Target: {mi.targetValue || 'N/A'}</li>
          ))}
        </ul>
      </div>
    )}
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => onUpdateStatus(goal.id, 'IN_PROGRESS')}
        className="px-3 py-1 text-sm bg-blue-700 hover:bg-blue-800 rounded transition-colors"
        disabled={goal.status === 'IN_PROGRESS'}
      >
        Start
      </button>
      <button
        onClick={() => onUpdateStatus(goal.id, 'REVIEW_NEEDED')}
        className="px-3 py-1 text-sm bg-yellow-700 hover:bg-yellow-800 rounded transition-colors"
        disabled={goal.status === 'REVIEW_NEEDED' || goal.status === 'PENDING'}
      >
        Needs Review
      </button>
      <button
        onClick={() => onUpdateStatus(goal.id, 'PASSING')}
        className="px-3 py-1 text-sm bg-green-700 hover:bg-green-800 rounded transition-colors"
        disabled={goal.status === 'PASSING'}
      >
        Mark Complete
      </button>
    </div>
  </div>
);

/**
 * Displays a list of AI process tasks.
 * @param tasks List of AIProcessTask objects.
 */
export const AIProcessTaskViewer: React.FC<{ tasks: AIProcessTask[] }> = ({ tasks }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">AI Task Queue / History</h3>
    {tasks.length === 0 ? (
      <p className="text-gray-400">No AI tasks in progress or recently completed.</p>
    ) : (
      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id} className="bg-gray-700 p-3 rounded-md shadow-sm border border-gray-600">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-white">{task.description}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                task.status === 'COMPLETED' ? 'bg-green-500' :
                task.status === 'FAILED' ? 'bg-red-500' :
                task.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' :
                'bg-gray-500'
              }`}>{task.status}</span>
            </div>
            <p className="text-xs text-gray-400">Type: <span className="font-mono">{task.type}</span> | Goal: {task.goalId.substring(0, 8)}</p>
            {task.startedAt && <p className="text-xs text-gray-500">Started: {new Date(task.startedAt).toLocaleTimeString()}</p>}
            {task.completedAt && <p className="text-xs text-gray-500">Completed: {new Date(task.completedAt).toLocaleTimeString()}</p>}
            {task.output && (
              <details className="text-xs text-gray-300 mt-2">
                <summary className="cursor-pointer text-blue-300 hover:text-blue-200">View Output</summary>
                <pre className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto text-gray-100 whitespace-pre-wrap">{task.output}</pre>
              </details>
            )}
            {task.logs.length > 0 && (
              <details className="text-xs text-gray-300 mt-2">
                <summary className="cursor-pointer text-blue-300 hover:text-blue-200">View Logs ({task.logs.length})</summary>
                <div className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto h-24 whitespace-pre-wrap text-gray-100">
                  {task.logs.map((log, idx) => (
                    <p key={idx} className={`font-mono text-[10px] ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-gray-300'}`}>
                      [{new Date(log.timestamp).toLocaleTimeString()}] [{log.level}] {log.message}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * A viewer for simulated code files, supporting content display and diff.
 * @param files Array of CodeFile objects.
 * @param codeChanges Array of CodeChange objects.
 * @param selectedFileId ID of the currently selected file.
 * @param onSelectFile Callback for when a file is selected.
 */
export const CodebaseExplorer: React.FC<{
  files: CodeFile[];
  codeChanges: CodeChange[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string | null) => void;
}> = ({ files, codeChanges, selectedFileId, onSelectFile }) => {
  const fileTree = useMemo(() => {
    const tree: Record<string, any> = {};
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      parts.forEach((part, i) => {
        if (!current[part]) {
          current[part] = { _isDir: i < parts.length - 1, _files: [], _path: parts.slice(0, i + 1).join('/'), _id: file.id };
        }
        current = current[part];
      });
      current._files.push(file); // Store file object directly on the leaf node
      current._id = file.id; // Also store the file ID on the leaf node
    });
    return tree;
  }, [files]);

  const renderTree = (node: any, path: string = '') => {
    return Object.keys(node).sort().map(key => {
      if (key.startsWith('_')) return null;

      const currentPath = path ? `${path}/${key}` : key;
      const item = node[key];
      const isDir = item._isDir;
      const fileId = item._id; // The ID of the file if this is a leaf node

      const hasPendingChanges = codeChanges.some(change => change.fileId === fileId && change.status === 'PENDING_REVIEW');
      const textColor = hasPendingChanges ? 'text-yellow-400' : (selectedFileId === fileId ? 'text-cyan-400' : 'text-gray-200');

      return (
        <div key={currentPath} className="ml-4">
          <div
            className={`cursor-pointer hover:text-blue-300 flex items-center ${textColor}`}
            onClick={() => isDir ? null : onSelectFile(fileId)}
          >
            {isDir ? (
              <span className="mr-1">📁</span>
            ) : (
              <span className="mr-1">📄</span>
            )}
            {key} {hasPendingChanges && <span className="ml-2 text-xs text-yellow-500">(Pending Review)</span>}
          </div>
          {isDir && renderTree(item, currentPath)}
        </div>
      );
    });
  };

  const selectedFile = useMemo(() => files.find(f => f.id === selectedFileId), [files, selectedFileId]);
  const filePendingChanges = useMemo(() => codeChanges.filter(c => c.fileId === selectedFileId && c.status === 'PENDING_REVIEW'), [codeChanges, selectedFileId]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col h-[700px]">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Codebase Explorer</h3>
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/3 bg-gray-900 p-2 rounded-md overflow-y-auto border border-gray-700 mr-2">
          {renderTree(fileTree)}
        </div>
        <div className="w-2/3 bg-gray-900 p-2 rounded-md overflow-y-auto border border-gray-700">
          {selectedFile ? (
            <>
              <h4 className="font-mono text-sm text-blue-300 mb-2">{selectedFile.path}</h4>
              {filePendingChanges.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-md">
                  <h5 className="text-yellow-400 font-semibold mb-2">Pending Changes ({filePendingChanges.length})</h5>
                  {filePendingChanges.map(change => (
                    <details key={change.id} className="mb-2 text-sm text-yellow-200">
                      <summary className="cursor-pointer hover:text-yellow-100">Change by task {change.taskId.substring(0, 8)}</summary>
                      <pre className="bg-gray-950 p-2 rounded mt-1 text-xs text-gray-100 overflow-x-auto whitespace-pre-wrap">{change.diff}</pre>
                    </details>
                  ))}
                </div>
              )}
              <pre className="text-xs text-gray-100 bg-gray-950 p-2 rounded overflow-x-auto whitespace-pre-wrap h-full">
                {selectedFile.content}
              </pre>
            </>
          ) : (
            <p className="text-gray-400">Select a file to view its content.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Displays a dashboard of key metrics with alert indicators.
 * @param metrics List of Metric objects.
 */
export const MetricsDashboard: React.FC<{ metrics: Metric[] }> = ({ metrics }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">System Metrics Dashboard</h3>
    <div className="grid grid-cols-2 gap-4">
      {metrics.map(metric => (
        <div key={metric.id} className={`p-4 rounded-md shadow-sm border ${
          metric.isAlert ? 'bg-red-900 border-red-700' : 'bg-gray-700 border-gray-600'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white font-medium">{metric.name}</h4>
            {metric.isAlert && (
              <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full animate-pulse">ALERT</span>
            )}
          </div>
          <p className="text-2xl font-bold text-blue-300">{metric.value.toFixed(2)} {metric.unit}</p>
          <p className="text-sm text-gray-400">Category: {metric.category}</p>
          {metric.threshold && (
            <p className="text-xs text-gray-500">Threshold: {metric.threshold.toFixed(2)} {metric.unit}</p>
          )}
          <p className="text-xs text-gray-500">Last updated: {new Date(metric.timestamp).toLocaleTimeString()}</p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Displays the status of deployment pipelines.
 * @param deployments List of DeploymentStatus objects.
 */
export const DeploymentPipelineStatusViewer: React.FC<{ deployments: DeploymentStatus[] }> = ({ deployments }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Deployment Pipelines</h3>
    {deployments.length === 0 ? (
      <p className="text-gray-400">No deployments have occurred yet.</p>
    ) : (
      <ul className="space-y-3">
        {deployments.map(dep => (
          <li key={dep.id} className={`p-3 rounded-md shadow-sm border ${
            dep.status === 'SUCCESS' ? 'bg-green-900 bg-opacity-30 border-green-700' :
            dep.status === 'FAILED' ? 'bg-red-900 bg-opacity-30 border-red-700' :
            dep.status === 'IN_PROGRESS' ? 'bg-blue-900 bg-opacity-30 border-blue-700 animate-pulse' :
            'bg-gray-700 border-gray-600'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-white">Version: {dep.version.substring(0, 8)}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                dep.status === 'SUCCESS' ? 'bg-green-500' :
                dep.status === 'FAILED' ? 'bg-red-500' :
                dep.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}>{dep.status}</span>
            </div>
            <p className="text-xs text-gray-400">Environment: {dep.environment}</p>
            <p className="text-xs text-gray-500">Started: {new Date(dep.startedAt).toLocaleString()}</p>
            {dep.completedAt && <p className="text-xs text-gray-500">Completed: {new Date(dep.completedAt).toLocaleString()} ({((new Date(dep.completedAt).getTime() - new Date(dep.startedAt).getTime()) / 1000).toFixed(1)}s)</p>}
            {dep.logs.length > 0 && (
              <details className="text-xs text-gray-300 mt-2">
                <summary className="cursor-pointer text-blue-300 hover:text-blue-200">Deployment Logs ({dep.logs.length})</summary>
                <div className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto h-24 whitespace-pre-wrap text-gray-100">
                  {dep.logs.map((log, idx) => (
                    <p key={idx} className={`font-mono text-[10px] ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-gray-300'}`}>
                      [{new Date(log.timestamp).toLocaleTimeString()}] [{log.level}] {log.message}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * Displays security scan findings.
 * @param findings List of SecurityFinding objects.
 * @param onUpdateFindingStatus Callback to update a finding's status.
 */
export const SecurityScanResultsViewer: React.FC<{ findings: SecurityFinding[]; onUpdateFindingStatus: (id: string, status: SecurityFinding['status']) => void }> = ({ findings, onUpdateFindingStatus }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Security Scan Results</h3>
    {findings.length === 0 ? (
      <p className="text-gray-400">No security findings.</p>
    ) : (
      <ul className="space-y-3">
        {findings.map(finding => (
          <li key={finding.id} className={`p-3 rounded-md shadow-sm border ${
            finding.status === 'OPEN' ? (
              finding.severity === 'CRITICAL' ? 'bg-red-900 border-red-700' :
              finding.severity === 'HIGH' ? 'bg-orange-900 border-orange-700' :
              'bg-yellow-900 border-yellow-700'
            ) : 'bg-green-900 bg-opacity-30 border-green-700'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-white">{finding.type}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                finding.severity === 'CRITICAL' ? 'bg-red-600' :
                finding.severity === 'HIGH' ? 'bg-orange-600' :
                finding.severity === 'MEDIUM' ? 'bg-yellow-600' :
                'bg-green-600'
              }`}>{finding.severity}</span>
            </div>
            <p className="text-xs text-gray-400">File: <span className="font-mono">{finding.filePath}:{finding.lineNumber}</span></p>
            <p className="text-xs text-gray-300">{finding.description}</p>
            <p className="text-xs text-gray-500 mt-1">Status: {finding.status}</p>
            {finding.status === 'OPEN' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onUpdateFindingStatus(finding.id, 'FIXED')}
                  className="px-3 py-1 text-sm bg-green-700 hover:bg-green-800 rounded transition-colors"
                >
                  Mark Fixed
                </button>
                <button
                  onClick={() => onUpdateFindingStatus(finding.id, 'FALSE_POSITIVE')}
                  className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                >
                  False Positive
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * Displays cost analysis and optimization recommendations.
 * @param reports List of CostReport objects.
 */
export const CostAnalysisViewer: React.FC<{ reports: CostReport[] }> = ({ reports }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Cost Analysis & Optimization</h3>
    {reports.length === 0 ? (
      <p className="text-gray-400">No cost reports available.</p>
    ) : (
      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="p-3 bg-gray-700 rounded-md shadow-sm border border-gray-600">
            <h4 className="font-medium text-white mb-2">Report for {report.period} - {new Date(report.timestamp).toLocaleDateString()}</h4>
            <p className="text-lg font-bold text-green-400">Total Cost: ${report.totalCost.toFixed(2)}</p>
            <p className="text-md text-blue-300">Estimated Savings: ${report.estimatedSavings.toFixed(2)}</p>
            <details className="mt-2 text-sm text-gray-300">
              <summary className="cursor-pointer text-blue-300 hover:text-blue-200">Cost Breakdown</summary>
              <ul className="list-disc list-inside mt-1 text-gray-400">
                {report.breakdown.map((item, idx) => (
                  <li key={idx}>{item.service}: ${item.cost.toFixed(2)} (Opportunity: ${item.optimizationOpportunity.toFixed(2)})</li>
                ))}
              </ul>
            </details>
            <details className="mt-2 text-sm text-gray-300">
              <summary className="cursor-pointer text-blue-300 hover:text-blue-200">Recommendations</summary>
              <ul className="list-disc list-inside mt-1 text-gray-400">
                {report.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
              </ul>
            </details>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * Allows configuration of AI agent parameters.
 * @param config The current AI agent configuration.
 * @param onUpdateConfig Callback to update the configuration.
 */
export const AIAgentConfigurator: React.FC<{ config: AIAgentConfig; onUpdateConfig: (newConfig: AIAgentConfig) => void }> = ({ config, onUpdateConfig }) => {
  const [currentConfig, setCurrentConfig] = useState<AIAgentConfig>(config);

  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentConfig(prev => {
      let newValue: any = value;
      if (type === 'number') newValue = parseFloat(value);
      if (type === 'checkbox') newValue = checked;
      if (name === 'enabledFeatures') {
        // Handle multi-select if needed, for now just a simple toggle for a specific feature
        const feature = value; // assuming value is the feature name
        newValue = prev.enabledFeatures.includes(feature)
          ? prev.enabledFeatures.filter(f => f !== feature)
          : [...prev.enabledFeatures, feature];
      }
      return { ...prev, [name]: newValue };
    });
  }, []);

  const handleSave = useCallback(() => {
    onUpdateConfig(currentConfig);
  }, [currentConfig, onUpdateConfig]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">AI Agent Configuration: {config.name}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-1">Model:</label>
          <input type="text" name="model" value={currentConfig.model} onChange={handleChange}
                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Creativity (0-10):</label>
          <input type="range" name="creativity" min="0" max="10" step="0.5" value={currentConfig.creativity} onChange={handleChange}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
          <span className="text-xs text-gray-400">{currentConfig.creativity}</span>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Refactoring Strategy:</label>
          <select name="refactoringStrategy" value={currentConfig.refactoringStrategy} onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
            <option value="OPTIMIZE_PERFORMANCE">Optimize Performance</option>
            <option value="IMPROVE_READABILITY">Improve Readability</option>
            <option value="REDUCE_COMPLEXITY">Reduce Complexity</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Test Coverage Target (%):</label>
          <input type="number" name="testCoverageTarget" value={currentConfig.testCoverageTarget} onChange={handleChange}
                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded" min="0" max="100" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Cost Optimization Budget ($/day):</label>
          <input type="number" name="costOptimizationBudget" value={currentConfig.costOptimizationBudget} onChange={handleChange}
                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded" min="0" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Security Vulnerability Threshold:</label>
          <select name="securityVulnerabilityThreshold" value={currentConfig.securityVulnerabilityThreshold} onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Deployment Strategy:</label>
          <select name="deploymentStrategy" value={currentConfig.deploymentStrategy} onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL_APPROVAL">Manual Approval</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Max Parallel Tasks:</label>
          <input type="number" name="maxParallelTasks" value={currentConfig.maxParallelTasks} onChange={handleChange}
                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded" min="1" />
        </div>
        {/* Example for enabledFeatures - could be more complex with a multi-select or checkboxes */}
        <div className="flex items-center">
          <input type="checkbox" id="featureA" name="enabledFeatures" value="FEATURE_A"
                 checked={currentConfig.enabledFeatures.includes('FEATURE_A')} onChange={handleChange}
                 className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500" />
          <label htmlFor="featureA" className="ml-2 text-gray-300">Enable Feature A (Experimental)</label>
        </div>

        <button onClick={handleSave} className="mt-4 p-2 bg-green-600 rounded hover:bg-green-700 transition-colors w-full">Save Configuration</button>
      </div>
    </div>
  );
};

/**
 * Displays recent user feedback and allows submitting new feedback.
 * @param feedbackItems List of UserFeedback objects.
 * @param onSubmitFeedback Callback for submitting new feedback.
 */
export const UserFeedbackPanel: React.FC<{ feedbackItems: UserFeedback[]; onSubmitFeedback: (feedback: Omit<UserFeedback, 'id' | 'timestamp'>) => void }> = ({ feedbackItems, onSubmitFeedback }) => {
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [newFeedbackRating, setNewFeedbackRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [newFeedbackType, setNewFeedbackType] = useState<UserFeedback['type']>('GENERAL');

  const handleSubmit = useCallback(() => {
    if (!newFeedbackText.trim()) return;
    onSubmitFeedback({
      comment: newFeedbackText,
      rating: newFeedbackRating,
      type: newFeedbackType,
    });
    setNewFeedbackText('');
    setNewFeedbackRating(5);
    setNewFeedbackType('GENERAL');
  }, [newFeedbackText, newFeedbackRating, newFeedbackType, onSubmitFeedback]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto flex flex-col">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">User Feedback</h3>

      <div className="mb-4 p-3 bg-gray-700 rounded-md border border-gray-600 flex-shrink-0">
        <h4 className="text-md font-semibold text-white mb-2">Submit New Feedback</h4>
        <textarea
          value={newFeedbackText}
          onChange={e => setNewFeedbackText(e.target.value)}
          placeholder="What do you think about the AI's recent changes or system behavior?"
          className="w-full p-2 bg-gray-600 rounded mb-2 text-white"
          rows={3}
        ></textarea>
        <div className="flex items-center gap-4 mb-2">
          <div>
            <label className="text-gray-300 text-sm mr-2">Rating:</label>
            <select value={newFeedbackRating} onChange={e => setNewFeedbackRating(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="p-1 bg-gray-600 rounded text-white">
              {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Star</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-300 text-sm mr-2">Type:</label>
            <select value={newFeedbackType} onChange={e => setNewFeedbackType(e.target.value as UserFeedback['type'])}
                    className="p-1 bg-gray-600 rounded text-white">
              <option value="GENERAL">General</option>
              <option value="CODE_REVIEW">Code Review</option>
              <option value="PERFORMANCE_FEEDBACK">Performance</option>
              <option value="BUG_REPORT">Bug Report</option>
            </select>
          </div>
        </div>
        <button onClick={handleSubmit} className="p-2 bg-cyan-600 rounded hover:bg-cyan-700 transition-colors w-full">Submit Feedback</button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {feedbackItems.length === 0 ? (
          <p className="text-gray-400">No feedback submitted yet.</p>
        ) : (
          <ul className="space-y-3">
            {feedbackItems.map(feedback => (
              <li key={feedback.id} className="p-3 bg-gray-700 rounded-md shadow-sm border border-gray-600">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-white">{feedback.type}</span>
                  <span className="text-sm text-yellow-400">{'⭐'.repeat(feedback.rating)}</span>
                </div>
                <p className="text-sm text-gray-300">{feedback.comment}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {feedback.goalId && `Goal: ${feedback.goalId.substring(0, 8)} - `}
                  {new Date(feedback.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * A detailed view for code changes, including approval workflow.
 * @param changes List of CodeChange objects.
 * @param onApproveChange Callback to approve a code change.
 * @param onRejectChange Callback to reject a code change.
 */
export const CodeReviewPanel: React.FC<{
  changes: CodeChange[];
  onApproveChange: (changeId: string) => void;
  onRejectChange: (changeId: string, reason: string) => void;
}> = ({ changes, onApproveChange, onRejectChange }) => {
  const [rejectReason, setRejectReason] = useState<string>('');
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);

  const pendingChanges = useMemo(() => changes.filter(c => c.status === 'PENDING_REVIEW'), [changes]);
  const reviewedChanges = useMemo(() => changes.filter(c => c.status !== 'PENDING_REVIEW'), [changes]);

  const selectedChange = useMemo(() => changes.find(c => c.id === selectedChangeId), [changes, selectedChangeId]);

  const handleReject = useCallback(() => {
    if (selectedChangeId && rejectReason.trim()) {
      onRejectChange(selectedChangeId, rejectReason);
      setSelectedChangeId(null);
      setRejectReason('');
    }
  }, [selectedChangeId, rejectReason, onRejectChange]);

  const handleApprove = useCallback(() => {
    if (selectedChangeId) {
      onApproveChange(selectedChangeId);
      setSelectedChangeId(null);
    }
  }, [selectedChangeId, onApproveChange]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[700px] flex flex-col">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Code Review & Approval</h3>
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/3 bg-gray-900 p-2 rounded-md overflow-y-auto border border-gray-700 mr-2">
          <h4 className="font-semibold text-yellow-400 mb-2">Pending ({pendingChanges.length})</h4>
          <ul className="space-y-2 mb-4">
            {pendingChanges.map(change => (
              <li key={change.id} className={`p-2 rounded-md cursor-pointer ${selectedChangeId === change.id ? 'bg-cyan-800' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setSelectedChangeId(change.id)}>
                <p className="text-sm font-medium text-white">{change.filePath.split('/').pop()}</p>
                <p className="text-xs text-gray-400">By Task: {change.taskId.substring(0, 8)} - {new Date(change.timestamp).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
          <h4 className="font-semibold text-gray-400 mb-2">Reviewed ({reviewedChanges.length})</h4>
          <ul className="space-y-2">
            {reviewedChanges.map(change => (
              <li key={change.id} className={`p-2 rounded-md cursor-pointer ${selectedChangeId === change.id ? 'bg-cyan-800' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setSelectedChangeId(change.id)}>
                <p className="text-sm font-medium text-white">{change.filePath.split('/').pop()}</p>
                <p className="text-xs text-gray-400">Status: <span className={change.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}>{change.status}</span></p>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 bg-gray-900 p-2 rounded-md overflow-y-auto border border-gray-700">
          {selectedChange ? (
            <>
              <h4 className="font-mono text-sm text-blue-300 mb-2">{selectedChange.filePath}</h4>
              <p className="text-xs text-gray-400 mb-2">Status: <span className={selectedChange.status === 'APPROVED' ? 'text-green-400' : selectedChange.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'}>{selectedChange.status}</span></p>
              {selectedChange.reviewComments && <p className="text-sm text-red-300 italic mb-2">Reviewer comments: {selectedChange.reviewComments}</p>}
              <pre className="text-xs text-gray-100 bg-gray-950 p-2 rounded overflow-x-auto whitespace-pre-wrap h-[calc(100%-120px)]">
                {selectedChange.diff}
              </pre>
              {selectedChange.status === 'PENDING_REVIEW' && (
                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={handleApprove} className="p-2 bg-green-600 rounded hover:bg-green-700 transition-colors">Approve Changes</button>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (required for rejection)"
                    className="w-full p-2 bg-gray-700 rounded text-white"
                  />
                  <button onClick={handleReject} disabled={!rejectReason.trim()} className="p-2 bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50">Reject Changes</button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400">Select a change to review its diff.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Visualizes the AI's internal knowledge graph (simplified).
 * @param nodes List of KnowledgeNode objects.
 * @param edges List of KnowledgeEdge objects.
 */
export const KnowledgeGraphViewer: React.FC<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> = ({ nodes, edges }) => {
  // This is a highly simplified placeholder. A real graph visualization would use D3, Cytoscape, etc.
  // We'll just list nodes and edges to demonstrate structure for line count.
  const [showNodes, setShowNodes] = useState(true);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">AI Knowledge Graph (Simplified)</h3>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setShowNodes(true)} className={`px-3 py-1 rounded ${showNodes ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}>Nodes</button>
        <button onClick={() => setShowNodes(false)} className={`px-3 py-1 rounded ${!showNodes ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}>Edges</button>
      </div>

      {showNodes ? (
        <details open className="text-gray-300">
          <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Nodes ({nodes.length})</summary>
          <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-400">
            {nodes.map(node => (
              <li key={node.id}><span className="font-bold text-white">{node.label}</span> (<span className="text-cyan-300">{node.type}</span>)</li>
            ))}
          </ul>
        </details>
      ) : (
        <details open className="text-gray-300">
          <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Edges ({edges.length})</summary>
          <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-400">
            {edges.map(edge => (
              <li key={edge.id}><span className="font-bold text-white">{edge.source.substring(0, 8)}</span> --<span className="text-orange-300">{edge.type}</span>--> <span className="font-bold text-white">{edge.target.substring(0, 8)}</span></li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

/**
 * A comprehensive view of the entire self-rewriting codebase system.
 */
const SelfRewritingCodebaseView: React.FC = () => {
  // --- Global State Management ---
  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", text: "API response time should be under 50ms p95.", status: 'PASSING', priority: 'CRITICAL', dependencies: [], category: 'PERFORMANCE', lastUpdated: formatTimestamp(new Date()) },
    { id: "g2", text: "Implement OAuth2 login for user authentication.", status: 'PENDING', priority: 'HIGH', dependencies: [], category: 'FEATURE', assignedAgent: 'AgentAlpha', progressPercentage: 0, eta: '2 days' },
    { id: "g3", text: "Refactor data access layer to use ORM.", status: 'IN_PROGRESS', priority: 'MEDIUM', dependencies: [], category: 'MAINTENANCE', assignedAgent: 'AgentBeta', progressPercentage: 40, lastUpdated: formatTimestamp(new Date(Date.now() - 3600000)) },
    { id: "g4", text: "Fix critical security vulnerability in user registration.", status: 'BLOCKED', priority: 'CRITICAL', dependencies: ['g2'], category: 'SECURITY', assignedAgent: 'AgentAlpha', progressPercentage: 0, eta: '5 days' },
    { id: "g5", text: "Reduce cloud infrastructure costs by 15%.", status: 'PENDING', priority: 'HIGH', dependencies: [], category: 'COST', assignedAgent: 'AgentGamma', progressPercentage: 0, eta: '7 days' },
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolvingGoalId, setEvolvingGoalId] = useState<string | null>(null);

  const [aiTasks, setAiTasks] = useState<AIProcessTask[]>([]);
  const [codebaseFiles, setCodebaseFiles] = useState<CodeFile[]>(initialFiles);
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([]);
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([]);
  const [costReports, setCostReports] = useState<CostReport[]>([]);
  const [aiConfig, setAiConfig] = useState<AIAgentConfig>({
    agentId: 'AgentAlpha',
    name: 'AutoDev AI',
    model: 'GPT-4o',
    creativity: 5,
    refactoringStrategy: 'OPTIMIZE_PERFORMANCE',
    testCoverageTarget: 90,
    costOptimizationBudget: 500,
    securityVulnerabilityThreshold: 'HIGH',
    deploymentStrategy: 'MANUAL_APPROVAL',
    enabledFeatures: ['CODE_GEN', 'TEST_GEN', 'METRIC_MONITORING'],
    maxParallelTasks: 3,
  });
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([]);
  const [selectedFileForExplorer, setSelectedFileForExplorer] = useState<string | null>(initialFiles[0]?.id || null);

  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>([]);
  const [knowledgeEdges, setKnowledgeEdges] = useState<KnowledgeEdge[]>([]);

  const mockApiDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- Core Logic & Event Handlers ---

  const handleAddGoal = useCallback(async () => {
    if (!newGoalText) return;

    const newGoalObj: Goal = {
      id: generateUniqueId(),
      text: newGoalText,
      status: 'PENDING',
      priority: 'MEDIUM',
      dependencies: [],
      category: pickRandom(['FEATURE', 'PERFORMANCE', 'SECURITY', 'MAINTENANCE', 'BUGFIX']),
      assignedAgent: 'AgentAlpha',
      progressPercentage: 0,
      lastUpdated: formatTimestamp(new Date()),
      eta: pickRandom(['1 day', '2 days', '1 week', '2 weeks']),
    };

    setGoals(prev => [...prev, newGoalObj]);
    setNewGoalText('');
    setIsEvolving(true);
    setEvolvingGoalId(newGoalObj.id);

    // Simulate AI processing the new goal
    const taskId = generateUniqueId();
    setAiTasks(prev => [...prev, {
      id: taskId,
      goalId: newGoalObj.id,
      description: `Analyzing new goal: "${newGoalObj.text}"`,
      type: 'CODE_GEN',
      status: 'RUNNING',
      startedAt: formatTimestamp(new Date()),
      logs: [generateMockLogEntry('AI_AGENT_ANALYSIS', 'INFO')],
      estimatedDurationMs: 5000,
    }]);

    await mockApiDelay(5000); // Simulate initial analysis

    setAiTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()), output: 'Goal analyzed. Initiating code generation...' } : task
    ));

    // Simulate code generation for the new goal
    const codeGenTaskId = generateUniqueId();
    setAiTasks(prev => [...prev, {
      id: codeGenTaskId,
      goalId: newGoalObj.id,
      description: `Generating code for goal: "${newGoalObj.text}"`,
      type: 'CODE_GEN',
      status: 'RUNNING',
      startedAt: formatTimestamp(new Date()),
      logs: [generateMockLogEntry('AI_AGENT_CODE_GEN', 'INFO')],
      estimatedDurationMs: 10000,
    }]);

    // Update goal status to in progress
    setGoals(prev => prev.map(g => g.id === newGoalObj.id ? { ...g, status: 'IN_PROGRESS', progressPercentage: 10, lastUpdated: formatTimestamp(new Date()) } : g));

    await mockApiDelay(10000); // Simulate code generation

    const newFile = generateMockCodeFile(`src/features/${newGoalObj.id}.tsx`, `// AI-generated code for goal: ${newGoalObj.text}\nimport React from 'react';\nexport const ${newGoalObj.id}Component = () => <div>Hello, World!</div>;`);
    setCodebaseFiles(prev => [...prev, newFile]);

    const newChange = generateMockCodeChange(codeGenTaskId, newFile);
    setCodeChanges(prev => [...prev, newChange]); // Add change for review

    setAiTasks(prev => prev.map(task =>
      task.id === codeGenTaskId ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()), output: `Code generated for ${newFile.path}. Awaiting review.`, artifacts: [{ type: 'FILE_CHANGE', content: newChange }] } : task
    ));

    // Simulate test generation
    const testGenTaskId = generateUniqueId();
    setAiTasks(prev => [...prev, {
      id: testGenTaskId,
      goalId: newGoalObj.id,
      description: `Generating tests for new code: ${newFile.name}`,
      type: 'TEST_GEN',
      status: 'RUNNING',
      startedAt: formatTimestamp(new Date()),
      logs: [generateMockLogEntry('AI_AGENT_TEST_GEN', 'INFO')],
      estimatedDurationMs: 3000,
    }]);

    setGoals(prev => prev.map(g => g.id === newGoalObj.id ? { ...g, progressPercentage: 30, lastUpdated: formatTimestamp(new Date()) } : g));
    await mockApiDelay(3000);

    const newTestFile = generateMockCodeFile(`tests/features/${newGoalObj.id}.test.ts`, `// AI-generated test for ${newFile.name}\ndescribe('${newGoalObj.id}Component', () => { it('should render', () => expect(true).toBe(true)); });`);
    setCodebaseFiles(prev => [...prev, newTestFile]);
    const newTestChange = generateMockCodeChange(testGenTaskId, newTestFile);
    setCodeChanges(prev => [...prev, newTestChange]);

    setAiTasks(prev => prev.map(task =>
      task.id === testGenTaskId ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()), output: `Tests generated for ${newFile.name}. Awaiting review.`, artifacts: [{ type: 'FILE_CHANGE', content: newTestChange }] } : task
    ));

    setGoals(prev => prev.map(g => g.id === newGoalObj.id ? { ...g, status: 'REVIEW_NEEDED', progressPercentage: 50, lastUpdated: formatTimestamp(new Date()) } : g));
    setIsEvolving(false);
    setEvolvingGoalId(null);
  }, [newGoalText]);

  const handleUpdateGoalStatus = useCallback((id: string, status: Goal['status']) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status, lastUpdated: formatTimestamp(new Date()) } : g));
  }, []);

  const handleUpdateFindingStatus = useCallback((id: string, status: SecurityFinding['status']) => {
    setSecurityFindings(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  }, []);

  const handleUpdateAiConfig = useCallback((newConfig: AIAgentConfig) => {
    setAiConfig(newConfig);
    // Simulate AI reacting to config change
    setAiTasks(prev => [...prev, {
      id: generateUniqueId(),
      goalId: 'SYSTEM',
      description: `AI configuration updated by user. Applying new parameters for ${newConfig.name}.`,
      type: 'MONITOR',
      status: 'COMPLETED',
      startedAt: formatTimestamp(new Date()),
      completedAt: formatTimestamp(new Date(Date.now() + 500)),
      logs: [generateMockLogEntry('AI_CONFIG_SERVICE', 'INFO')],
      estimatedDurationMs: 500,
    }]);
  }, []);

  const handleSubmitUserFeedback = useCallback((feedback: Omit<UserFeedback, 'id' | 'timestamp'>) => {
    const newFeedback = { ...feedback, id: generateUniqueId(), timestamp: formatTimestamp(new Date()) };
    setUserFeedback(prev => [...prev, newFeedback]);
    // Simulate AI processing feedback
    setAiTasks(prev => [...prev, {
      id: generateUniqueId(),
      goalId: newFeedback.goalId || 'N/A',
      description: `Processing user feedback (Rating: ${newFeedback.rating}/5, Type: ${newFeedback.type})`,
      type: 'DOCUMENTATION', // Or an 'ADAPTATION' type
      status: 'RUNNING',
      startedAt: formatTimestamp(new Date()),
      logs: [generateMockLogEntry('AI_FEEDBACK_PROCESSOR', 'INFO')],
      estimatedDurationMs: 2000,
    }]);
    setTimeout(() => {
      setAiTasks(prev => prev.map(task =>
        task.description.includes('Processing user feedback') && task.status === 'RUNNING'
          ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()) } : task
      ));
    }, 2000);
  }, []);

  const handleApproveChange = useCallback(async (changeId: string) => {
    setCodeChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: 'APPROVED', approved: true, reviewer: 'HUMAN', timestamp: formatTimestamp(new Date()) } : c));
    
    // Find the change and associated goal
    const approvedChange = codeChanges.find(c => c.id === changeId);
    if (!approvedChange) return;

    const relatedTask = aiTasks.find(t => t.id === approvedChange.taskId);
    const relatedGoalId = relatedTask?.goalId;

    if (relatedGoalId) {
      setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, progressPercentage: g.progressPercentage! + 20, lastUpdated: formatTimestamp(new Date()) } : g));

      // Simulate applying changes and running tests
      const applyTaskId = generateUniqueId();
      setAiTasks(prev => [...prev, {
        id: applyTaskId,
        goalId: relatedGoalId,
        description: `Applying approved code changes for goal ${relatedGoalId.substring(0, 8)}`,
        type: 'CODE_REF_FACTOR', // Can be 'DEPLOY' or 'CODE_APPLY'
        status: 'RUNNING',
        startedAt: formatTimestamp(new Date()),
        logs: [generateMockLogEntry('VCS_INTEGRATION', 'INFO')],
        estimatedDurationMs: 2000,
      }]);
      await mockApiDelay(2000);

      // Update codebaseFiles with the approved change
      setCodebaseFiles(prev => prev.map(file =>
        file.id === approvedChange.fileId ? { ...file, content: approvedChange.newContent, version: file.version + 1, lastModified: formatTimestamp(new Date()) } : file
      ));
      setCodeChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: 'APPLIED', timestamp: formatTimestamp(new Date()) } : c));

      setAiTasks(prev => prev.map(task =>
        task.id === applyTaskId ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()) } : task
      ));

      const testRunTaskId = generateUniqueId();
      setAiTasks(prev => [...prev, {
        id: testRunTaskId,
        goalId: relatedGoalId,
        description: `Running tests after applying changes for goal ${relatedGoalId.substring(0, 8)}`,
        type: 'TEST_EXEC',
        status: 'RUNNING',
        startedAt: formatTimestamp(new Date()),
        logs: [generateMockLogEntry('TEST_RUNNER', 'INFO')],
        estimatedDurationMs: 4000,
      }]);
      await mockApiDelay(4000);

      const testResults = [generateMockTestResult(approvedChange.fileId, pickRandom(['PASSED', 'PASSED', 'FAILED']))];
      // Here you'd update goal status based on test results
      const allTestsPassed = testResults.every(tr => tr.status === 'PASSED');

      setAiTasks(prev => prev.map(task =>
        task.id === testRunTaskId ? {
          ...task,
          status: 'COMPLETED',
          completedAt: formatTimestamp(new Date()),
          output: `Tests completed. Status: ${allTestsPassed ? 'PASSED' : 'FAILED'}`,
          artifacts: [{ type: 'REPORT', content: testResults }]
        } : task
      ));

      if (allTestsPassed) {
        setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, status: 'PASSING', progressPercentage: 100, lastUpdated: formatTimestamp(new Date()) } : g));

        // Simulate deployment
        if (aiConfig.deploymentStrategy === 'AUTOMATIC') {
          const deployTaskId = generateUniqueId();
          setAiTasks(prev => [...prev, {
            id: deployTaskId,
            goalId: relatedGoalId,
            description: `Automatic deployment to PRODUCTION for goal ${relatedGoalId.substring(0, 8)}`,
            type: 'DEPLOY',
            status: 'RUNNING',
            startedAt: formatTimestamp(new Date()),
            logs: [generateMockLogEntry('DEPLOYMENT_SERVICE', 'INFO')],
            estimatedDurationMs: 8000,
          }]);
          setDeployments(prev => [...prev, {
            id: generateUniqueId(),
            environment: 'PRODUCTION',
            status: 'IN_PROGRESS',
            version: approvedChange.id,
            startedAt: formatTimestamp(new Date()),
            logs: [],
            deployedServices: ['frontend', 'backend'],
          }]);
          await mockApiDelay(8000);
          setDeployments(prev => prev.map(d => d.version === approvedChange.id ? { ...d, status: 'SUCCESS', completedAt: formatTimestamp(new Date()) } : d));
          setAiTasks(prev => prev.map(task =>
            task.id === deployTaskId ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()), output: 'Deployment successful!' } : task
          ));
        } else {
          setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, status: 'REVIEW_NEEDED', progressPercentage: 90, lastUpdated: formatTimestamp(new Date()) } : g));
          setAiTasks(prev => [...prev, {
            id: generateUniqueId(),
            goalId: relatedGoalId,
            description: `Manual deployment approval required for goal ${relatedGoalId.substring(0, 8)}.`,
            type: 'DEPLOY',
            status: 'PAUSED',
            startedAt: formatTimestamp(new Date()),
            logs: [generateMockLogEntry('DEPLOYMENT_SERVICE', 'WARN', 'Manual approval pending.')],
            estimatedDurationMs: 0,
          }]);
        }

      } else {
        setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, status: 'FAILING', progressPercentage: 75, lastUpdated: formatTimestamp(new Date()) } : g));
        setAiTasks(prev => [...prev, {
          id: generateUniqueId(),
          goalId: relatedGoalId,
          description: `Tests failed for goal ${relatedGoalId.substring(0, 8)}. AI initiating debugging and refactoring.`,
          type: 'BUGFIX',
          status: 'RUNNING',
          startedAt: formatTimestamp(new Date()),
          logs: [generateMockLogEntry('AI_DEBUGGER', 'ERROR', 'Tests failed!')],
          estimatedDurationMs: 15000,
        }]);
      }
    }

  }, [codeChanges, aiTasks, aiConfig.deploymentStrategy]);

  const handleRejectChange = useCallback((changeId: string, reason: string) => {
    setCodeChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: 'REJECTED', approved: false, reviewer: 'HUMAN', reviewComments: reason, timestamp: formatTimestamp(new Date()) } : c));
    
    const rejectedChange = codeChanges.find(c => c.id === changeId);
    if (!rejectedChange) return;

    const relatedTask = aiTasks.find(t => t.id === rejectedChange.taskId);
    const relatedGoalId = relatedTask?.goalId;

    if (relatedGoalId) {
      setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, status: 'IN_PROGRESS', progressPercentage: g.progressPercentage! - 10, lastUpdated: formatTimestamp(new Date()) } : g));
      setAiTasks(prev => [...prev, {
        id: generateUniqueId(),
        goalId: relatedGoalId,
        description: `Code change rejected for goal ${relatedGoalId.substring(0, 8)}. AI initiating refactoring based on feedback.`,
        type: 'CODE_REF_FACTOR',
        status: 'RUNNING',
        startedAt: formatTimestamp(new Date()),
        logs: [generateMockLogEntry('AI_AGENT_REFACTOR', 'INFO', `Reason: ${reason}`)],
        estimatedDurationMs: 10000,
      }]);
    }
  }, [codeChanges, aiTasks]);

  // --- Knowledge Graph Population (simplified) ---
  useEffect(() => {
    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];
    const nodeMap = new Map<string, string>(); // path/id -> node_id

    codebaseFiles.forEach(file => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: file.name, type: 'FILE', data: file.id });
      nodeMap.set(file.path, nodeId);
    });

    goals.forEach(goal => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: goal.text.substring(0, 30) + '...', type: 'GOAL', data: goal.id });
      nodeMap.set(`goal-${goal.id}`, nodeId);

      if (goal.dependencies.length > 0) {
        goal.dependencies.forEach(depId => {
          const depNodeId = nodeMap.get(`goal-${depId}`);
          if (depNodeId) {
            edges.push({ id: generateUniqueId(), source: nodeId, target: depNodeId, type: 'DEPENDS_ON' });
          }
        });
      }
    });

    aiTasks.forEach(task => {
        const taskNodeId = generateUniqueId();
        nodes.push({id: taskNodeId, label: task.description.substring(0,30) + '...', type: 'REQUIREMENT'});
        
        const goalNodeId = nodeMap.get(`goal-${task.goalId}`);
        if(goalNodeId) {
            edges.push({id: generateUniqueId(), source: taskNodeId, target: goalNodeId, type: 'RELATED_TO'});
        }
    });

    // Add some random cross-references for more complexity
    if (nodes.length > 5) {
      for (let i = 0; i < 10; i++) {
        const sourceNode = pickRandom(nodes);
        const targetNode = pickRandom(nodes.filter(n => n.id !== sourceNode.id));
        if (sourceNode && targetNode) {
          edges.push({ id: generateUniqueId(), source: sourceNode.id, target: targetNode.id, type: pickRandom(['RELATED_TO', 'USES']) });
        }
      }
    }

    setKnowledgeNodes(nodes);
    setKnowledgeEdges(edges);
  }, [codebaseFiles, goals, aiTasks]);


  // --- Metric & Finding Simulation Effects ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => prevMetrics.map(metric => {
        let newValue = metric.value + (Math.random() - 0.5) * 5; // Random fluctuation
        newValue = Math.max(0, Math.min(100, newValue)); // Keep within 0-100 range for most metrics

        let isAlert = false;
        if (metric.threshold !== undefined) {
          if (metric.category === 'PERFORMANCE' || metric.category === 'AVAILABILITY' || metric.category === 'RESOURCE_UTILIZATION') {
            isAlert = newValue > metric.threshold;
          } else if (metric.category === 'SECURITY') {
            isAlert = newValue < metric.threshold; // Lower score is worse for security
          } else if (metric.category === 'COST') {
            isAlert = newValue > metric.threshold;
          }
        }

        // Simulate fixing a security finding for goal g4
        const g4Goal = goals.find(g => g.id === 'g4');
        if (g4Goal && g4Goal.status === 'IN_PROGRESS' && metric.name === 'Security Score') {
          newValue = Math.min(100, metric.value + Math.random() * 2); // Improve security score
          isAlert = newValue < (metric.threshold || 90);
        }

        return {
          ...metric,
          value: parseFloat(newValue.toFixed(2)),
          timestamp: formatTimestamp(new Date()),
          isAlert: isAlert
        };
      }));

      // Randomly generate new security findings
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const randomFile = pickRandom(codebaseFiles);
        if (randomFile) {
          setSecurityFindings(prev => [...prev, generateMockSecurityFinding(randomFile.path)]);
        }
      }

      // Randomly generate new cost report
      if (Math.random() < 0.05) { // 5% chance every 5 seconds
        setCostReports(prev => [...prev, generateMockCostReport()]);
      }

    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [codebaseFiles, goals]);

  // --- UI Structure ---
  return (
    <div className="bg-gray-900 text-white min-h-screen p-8 font-sans">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-cyan-400">Autonomous Codebase Evolution Dashboard</h1>

      {/* Top Section: Goal Input & Evolving Status */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Add New Development Goal</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newGoalText}
            onChange={e => setNewGoalText(e.target.value)}
            placeholder="Describe a new feature, improvement, or bugfix... (e.g., 'Implement user profile page with editable fields')"
            className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isEvolving}
          />
          <button
            onClick={handleAddGoal}
            disabled={isEvolving || !newGoalText.trim()}
            className="px-6 py-3 bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isEvolving ? `Evolving for ${evolvingGoalId?.substring(0,5)}...` : 'Add Goal & Auto-Evolve'}
          </button>
        </div>
        {isEvolving && (
          <p className="mt-4 text-blue-300 animate-pulse text-lg">
            <span className="mr-2">🚀</span> New goal accepted. AI agents are coordinating: analyzing requirements, generating code, creating tests, refactoring...
          </p>
        )}
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Column 1: Goals & AI Tasks */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 h-[700px] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">Development Goals</h2>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-gray-400">No goals defined yet. Add one above!</p>
              ) : (
                goals.map(g => (
                  <GoalDetailsCard key={g.id} goal={g} onUpdateStatus={handleUpdateGoalStatus} />
                ))
              )}
            </div>
          </div>
          <AIProcessTaskViewer tasks={aiTasks} />
        </div>

        {/* Column 2: Codebase & Code Review */}
        <div className="space-y-6">
          <CodebaseExplorer
            files={codebaseFiles}
            codeChanges={codeChanges}
            selectedFileId={selectedFileForExplorer}
            onSelectFile={setSelectedFileForExplorer}
          />
          <CodeReviewPanel
            changes={codeChanges}
            onApproveChange={handleApproveChange}
            onRejectChange={handleRejectChange}
          />
        </div>

        {/* Column 3: Metrics, Security, Cost, Config */}
        <div className="space-y-6">
          <MetricsDashboard metrics={metrics} />
          <SecurityScanResultsViewer findings={securityFindings} onUpdateFindingStatus={handleUpdateFindingStatus} />
          <CostAnalysisViewer reports={costReports} />
          <AIAgentConfigurator config={aiConfig} onUpdateConfig={handleUpdateAiConfig} />
          <UserFeedbackPanel feedbackItems={userFeedback} onSubmitFeedback={handleSubmitUserFeedback} />
          <KnowledgeGraphViewer nodes={knowledgeNodes} edges={knowledgeEdges} />
          <DeploymentPipelineStatusViewer deployments={deployments} />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 text-center text-gray-500 text-sm">
        <p>This is a simulated self-evolving codebase. All operations are mock and for demonstration purposes.</p>
        <p className="mt-2">Built with React and a vision for AI-native development. © 2024</p>
      </div>
    </div>
  );
};

export default SelfRewritingCodebaseView;