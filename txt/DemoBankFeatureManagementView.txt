// components/views/platform/DemoBankFeatureManagementView.tsx
import React, { useState, useReducer, useEffect, useCallback, useMemo, FC, ReactNode } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// SECTION: Type Definitions for a Real-World Application
// ==========================================================

export type FeatureFlagStatus = 'enabled' | 'disabled' | 'archived';
export type Environment = 'development' | 'staging' | 'production';
export type TargetingRuleOperator = 'is' | 'is_not' | 'contains' | 'does_not_contain' | 'is_one_of' | 'is_not_one_of' | 'greater_than' | 'less_than';
export type RolloutStrategy = 'percentage' | 'ring' | 'canary';
export type AiModelType = 'gemini-2.5-flash' | 'gemini-pro' | 'gemini-advanced';

export interface TargetingRule {
    id: string;
    property: string; // e.g., 'user.country', 'user.email', 'app.version'
    operator: TargetingRuleOperator;
    value: string | string[] | number;
}

export interface TargetingGroup {
    id:string;
    rules: TargetingRule[];
    condition: 'AND' | 'OR'; // How rules within this group are combined
}

export interface FeatureFlag {
    id: string;
    key: string; // The programmatic key for the flag
    name: string;
    description: string;
    status: Record<Environment, FeatureFlagStatus>;
    tags: string[];
    ownerTeam: string;
    createdAt: string;
    updatedAt: string;
    rolloutPercentage: Record<Environment, number>;
    targetingRules: Record<Environment, TargetingGroup[]>;
    rolloutStrategy: RolloutStrategy;
    isTemporary: boolean;
    expiryDate?: string;
}

export interface RolloutStage {
    name: string;
    target: string;
    duration: string;
    kpis: string[];
    rollback_criteria: string;
    communication_plan: string;
    required_teams: string[];
    status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface GeneratedRolloutPlan {
    feature_name: string;
    risk_assessment: 'low' | 'medium' | 'high';
    suggested_strategy: RolloutStrategy;
    stages: RolloutStage[];
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    featureFlagKey: string;
    environment: Environment;
    action: string;
    details: string;
    beforeState: Partial<FeatureFlag>;
    afterState: Partial<FeatureFlag>;
}

export interface ABTestVariant {
    id: string;
    name: string;
    trafficSplit: number; // 0-100
}

export interface ABTest {
    id: string;
    name: string;
    featureFlagKey: string;
    status: 'draft' | 'running' | 'completed';
    variants: ABTestVariant[];
    goalMetric: string; // e.g., 'conversion_rate', 'user_retention'
    startDate: string;
    endDate?: string;
    results?: Record<string, { conversions: number; visitors: number; rate: number }>;
}

// SECTION: Mock Data Generation & API Simulation
// ==========================================================

const MOCK_TEAMS = ['Core Banking', 'Mobile App', 'Growth & Marketing', 'Platform Infrastructure', 'Data Science'];
const MOCK_TAGS = ['q1-2024', 'mobile', 'web', 'internal-tool', 'performance', 'new-feature', 'beta'];
const MOCK_USERS = ['dev-team@demobank.com', 'product-manager-jane', 'qa-tester-bob', 'release-engineer-sara'];
const MOCK_USER_PROPERTIES = ['country', 'email', 'subscriptionTier', 'internalTester', 'appVersion'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateMockFeatureFlag = (id: number): FeatureFlag => {
    const key = `feature-${id}-${Math.random().toString(36).substring(2, 8)}`;
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    return {
        id: `ff-${id}`,
        key,
        name: `Feature Flag ${id}`,
        description: `This is a detailed description for the feature flag with key: ${key}. It controls a critical part of the application.`,
        status: {
            development: getRandomElement(['enabled', 'disabled']),
            staging: getRandomElement(['enabled', 'disabled']),
            production: 'disabled',
        },
        tags: [getRandomElement(MOCK_TAGS), getRandomElement(MOCK_TAGS)],
        ownerTeam: getRandomElement(MOCK_TEAMS),
        createdAt,
        updatedAt: new Date(new Date(createdAt).getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        rolloutPercentage: {
            development: 100,
            staging: 50,
            production: 0,
        },
        targetingRules: {
            development: [],
            staging: [{
                id: `tg-staging-${id}`,
                condition: 'AND',
                rules: [{ id: `rule-${id}-1`, property: 'internalTester', operator: 'is', value: 'true' }]
            }],
            production: [],
        },
        rolloutStrategy: getRandomElement(['percentage', 'ring', 'canary']),
        isTemporary: Math.random() > 0.8,
    };
};

export const generateMockAuditLog = (flag: FeatureFlag): AuditLogEntry => {
    return {
        id: `log-${Math.random().toString(36).substring(2, 10)}`,
        timestamp: new Date().toISOString(),
        user: getRandomElement(MOCK_USERS),
        featureFlagKey: flag.key,
        environment: 'staging',
        action: 'UPDATE_ROLLOUT_PERCENTAGE',
        details: `Changed rollout percentage in staging from 25% to 50%`,
        beforeState: { rolloutPercentage: { development: 100, staging: 25, production: 0 } },
        afterState: { rolloutPercentage: { development: 100, staging: 50, production: 0 } },
    };
};

export class MockFeatureManagementAPI {
    private static _instance: MockFeatureManagementAPI;
    private featureFlags: FeatureFlag[];
    private auditLogs: AuditLogEntry[];
    private abTests: ABTest[];

    private constructor() {
        this.featureFlags = Array.from({ length: 150 }, (_, i) => generateMockFeatureFlag(i + 1));
        this.auditLogs = this.featureFlags.slice(0, 50).map(generateMockAuditLog);
        this.abTests = [{
            id: 'ab-test-1',
            name: 'New Checkout Button Color',
            featureFlagKey: this.featureFlags[0].key,
            status: 'running',
            variants: [
                { id: 'v1', name: 'Control (Blue)', trafficSplit: 50 },
                { id: 'v2', name: 'Variant A (Green)', trafficSplit: 50 },
            ],
            goalMetric: 'checkout_conversion_rate',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            results: {
                'v1': { conversions: 1024, visitors: 10000, rate: 10.24 },
                'v2': { conversions: 1150, visitors: 10000, rate: 11.50 },
            }
        }];
    }

    public static getInstance(): MockFeatureManagementAPI {
        if (!MockFeatureManagementAPI._instance) {
            MockFeatureManagementAPI._instance = new MockFeatureManagementAPI();
        }
        return MockFeatureManagementAPI._instance;
    }

    private simulateLatency = <T>(data: T): Promise<T> => {
        return new Promise(resolve => setTimeout(() => resolve(data), 300 + Math.random() * 500));
    };

    public async getFeatureFlags(): Promise<FeatureFlag[]> {
        return this.simulateLatency([...this.featureFlags]);
    }

    public async getFeatureFlag(id: string): Promise<FeatureFlag | undefined> {
        const flag = this.featureFlags.find(f => f.id === id);
        return this.simulateLatency(flag ? { ...flag } : undefined);
    }
    
    public async updateFeatureFlag(updatedFlag: FeatureFlag): Promise<FeatureFlag> {
        const index = this.featureFlags.findIndex(f => f.id === updatedFlag.id);
        if (index !== -1) {
            const oldFlag = this.featureFlags[index];
            this.featureFlags[index] = { ...updatedFlag, updatedAt: new Date().toISOString() };
            // Create an audit log entry
            this.auditLogs.unshift({
                id: `log-${Math.random().toString(36).substring(2, 10)}`,
                timestamp: new Date().toISOString(),
                user: 'api-user@demobank.com',
                featureFlagKey: updatedFlag.key,
                environment: 'production', // Assume change is for prod for simplicity
                action: 'UPDATE_FLAG',
                details: `Flag ${updatedFlag.key} was updated.`,
                beforeState: oldFlag,
                afterState: updatedFlag,
            });
            return this.simulateLatency(this.featureFlags[index]);
        }
        throw new Error("Feature flag not found");
    }

    public async getAuditLogs(): Promise<AuditLogEntry[]> {
        return this.simulateLatency([...this.auditLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }

    public async getABTests(): Promise<ABTest[]> {
        return this.simulateLatency([...this.abTests]);
    }
}

export const api = MockFeatureManagementAPI.getInstance();

// SECTION: UI Helper Components
// ==========================================================

export const Pill: FC<{ color: string; children: ReactNode }> = ({ color, children }) => {
    const colorClasses = {
        green: 'bg-green-800 text-green-200',
        blue: 'bg-blue-800 text-blue-200',
        yellow: 'bg-yellow-800 text-yellow-200',
        red: 'bg-red-800 text-red-200',
        gray: 'bg-gray-700 text-gray-300',
    }[color] || 'bg-gray-700 text-gray-300';
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
            {children}
        </span>
    );
};

export const LoadingSpinner: FC<{ size?: number }> = ({ size = 24 }) => (
    <svg className="animate-spin text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{width: size, height: size}}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const Tab: FC<{ active: boolean; onClick: () => void; children: ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${
            active
                ? 'border-b-2 border-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
        }`}
    >
        {children}
    </button>
);

// SECTION: AI Rollout Plan Generator (Enhanced)
// ==========================================================

export const AiRolloutPlanner: FC = () => {
    const [prompt, setPrompt] = useState("the new AI Ad Studio feature");
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedRolloutPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiModel, setAiModel] = useState<AiModelType>('gemini-2.5-flash');

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedPlan(null);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    feature_name: { type: Type.STRING },
                    risk_assessment: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    suggested_strategy: { type: Type.STRING, enum: ['percentage', 'ring', 'canary']},
                    stages: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                target: { type: Type.STRING },
                                duration: { type: Type.STRING },
                                kpis: { type: Type.ARRAY, items: { type: Type.STRING } },
                                rollback_criteria: { type: Type.STRING },
                                communication_plan: { type: Type.STRING },
                                required_teams: { type: Type.ARRAY, items: { type: Type.STRING } },
                                status: { type: Type.STRING, default: 'pending'}
                            },
                            required: ['name', 'target', 'duration', 'kpis', 'rollback_criteria']
                        }
                    }
                },
                required: ['feature_name', 'risk_assessment', 'stages']
            };
            const fullPrompt = `You are a principal release engineer at a major financial institution. Generate a safe, detailed, 4-stage progressive rollout plan for this new banking feature: "${prompt}". 
            The plan must include stages for internal staff, a small percentage of beta users, a larger percentage of general users, and finally a full release.
            For each stage, provide a name, target audience, duration, key performance indicators (KPIs) to monitor, specific rollback criteria, a communication plan, and a list of required teams.
            Also provide an overall risk assessment (low, medium, or high) and a suggested rollout strategy (percentage, ring, or canary).
            The output must be a valid JSON object strictly conforming to the provided schema.`;

            const response = await ai.models.generateContent({ model: aiModel, contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            const parsedPlan = JSON.parse(response.text) as GeneratedRolloutPlan;
            
            // Ensure status is initialized for each stage
            parsedPlan.stages = parsedPlan.stages.map(stage => ({ ...stage, status: 'pending' }));
            
            setGeneratedPlan(parsedPlan);
        } catch (err: any) {
            console.error(err);
            setError(`Failed to generate plan. Please check your API key and network connection. Details: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const RiskPill: FC<{ risk: 'low' | 'medium' | 'high' }> = ({ risk }) => {
        const color = risk === 'low' ? 'green' : risk === 'medium' ? 'yellow' : 'red';
        return <Pill color={color}>{risk.toUpperCase()}</Pill>;
    };
    
    return (
         <div className="space-y-6">
            <Card title="AI Rollout Strategy Generator">
                <p className="text-gray-400 mb-4">Describe the feature you want to release, and our AI will generate a safe, progressive rollout plan with risk assessment and KPIs.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Feature Description</label>
                        <input
                            type="text"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., A new international money transfer feature"
                        />
                    </div>
                    <div>
                         <label className="text-sm font-medium text-gray-300 block mb-1">AI Model</label>
                         <select
                            value={aiModel}
                            onChange={e => setAiModel(e.target.value as AiModelType)}
                            className="w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="gemini-2.5-flash">Gemini Flash (Fast)</option>
                            <option value="gemini-pro">Gemini Pro (Balanced)</option>
                            <option value="gemini-advanced">Gemini Advanced (High Quality)</option>
                        </select>
                    </div>
                </div>

                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors flex items-center justify-center">
                    {isLoading ? <><LoadingSpinner size={20} /> <span className="ml-2">Generating Plan...</span></> : 'Generate Rollout Plan'}
                </button>
            </Card>
            
            {error && (
                <Card title="Error">
                    <p className="text-red-400">{error}</p>
                </Card>
            )}

            {(isLoading || generatedPlan) && (
                <Card title="Generated Rollout Plan">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <LoadingSpinner size={48} />
                        </div>
                    ) : generatedPlan && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-900/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{generatedPlan.feature_name}</h3>
                                    <p className="text-gray-400">Strategy: <span className="font-semibold text-cyan-400">{generatedPlan.suggested_strategy}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400 mb-1">Risk Assessment</p>
                                    <RiskPill risk={generatedPlan.risk_assessment} />
                                </div>
                            </div>
                            <div className="relative pl-6">
                                {/* Timeline line */}
                                <div className="absolute top-0 left-[34px] w-0.5 h-full bg-gray-700" />

                                {generatedPlan.stages.map((stage: RolloutStage, index: number) => (
                                    <div key={index} className="relative mb-8">
                                        <div className="absolute -left-1.5 top-1.5 w-6 h-6 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                            <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                                        </div>
                                        <div className="ml-12 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-lg text-white">{index + 1}. {stage.name}</h4>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider">{stage.duration}</p>
                                                </div>
                                                <Pill color="gray">{stage.status}</Pill>
                                            </div>
                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <strong className="text-gray-400 block">Target Audience:</strong>
                                                    <p className="text-gray-300">{stage.target}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-gray-400 block">Rollback Criteria:</strong>
                                                    <p className="text-gray-300">{stage.rollback_criteria}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-gray-400 block">Key Performance Indicators (KPIs):</strong>
                                                    <ul className="list-disc list-inside text-gray-300">
                                                        {stage.kpis.map((kpi, i) => <li key={i}>{kpi}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <strong className="text-gray-400 block">Communication Plan:</strong>
                                                    <p className="text-gray-300">{stage.communication_plan}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <strong className="text-gray-400 block">Required Teams:</strong>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {stage.required_teams.map((team, i) => <Pill key={i} color="blue">{team}</Pill>)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <button className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded">Approve Stage</button>
                                                <button className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded">Request Changes</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};


// SECTION: Feature Flag List View
// ==========================================================
type SortConfig = { key: keyof FeatureFlag; direction: 'ascending' | 'descending' };

export const FeatureFlagTable: FC<{ flags: FeatureFlag[], onSelectFlag: (flag: FeatureFlag) => void }> = ({ flags, onSelectFlag }) => {
    const [filter, setFilter] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const sortedAndFilteredFlags = useMemo(() => {
        let filteredFlags = flags.filter(flag =>
            flag.name.toLowerCase().includes(filter.toLowerCase()) ||
            flag.key.toLowerCase().includes(filter.toLowerCase()) ||
            flag.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        );

        if (sortConfig.key) {
            filteredFlags.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredFlags;
    }, [flags, filter, sortConfig]);
    
    const paginatedFlags = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAndFilteredFlags.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAndFilteredFlags, currentPage]);

    const totalPages = Math.ceil(sortedAndFilteredFlags.length / itemsPerPage);

    const requestSort = (key: keyof FeatureFlag) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const StatusIndicator: FC<{ status: FeatureFlagStatus }> = ({ status }) => {
        const color = status === 'enabled' ? 'bg-green-500' : status === 'disabled' ? 'bg-gray-500' : 'bg-red-500';
        return <span className={`w-3 h-3 rounded-full inline-block mr-2 ${color}`} title={status}></span>;
    };
    
    return (
        <Card title={`All Feature Flags (${flags.length})`}>
            <input
                type="text"
                placeholder="Filter by name, key, or tag..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full bg-gray-800 p-2 rounded mb-4 text-white placeholder-gray-500"
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            {['name', 'key', 'status', 'rolloutPercentage', 'ownerTeam', 'updatedAt'].map(key => (
                                <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    <button onClick={() => requestSort(key as keyof FeatureFlag)} className="flex items-center">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        {sortConfig.key === key && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900/50 divide-y divide-gray-800">
                        {paginatedFlags.map(flag => (
                            <tr key={flag.id} className="hover:bg-gray-800 cursor-pointer" onClick={() => onSelectFlag(flag)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{flag.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{flag.key}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="flex items-center"><StatusIndicator status={flag.status.production} /> Prod: {flag.status.production}</div>
                                    <div className="flex items-center text-xs text-gray-500"><StatusIndicator status={flag.status.staging} /> Staging: {flag.status.staging}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div>Prod: {flag.rolloutPercentage.production}%</div>
                                    <div className="text-xs text-gray-500">Staging: {flag.rolloutPercentage.staging}%</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{flag.ownerTeam}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(flag.updatedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-400">
                    Showing {paginatedFlags.length} of {sortedAndFilteredFlags.length} flags
                </span>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">Prev</button>
                    <span className="px-3 py-1 text-sm">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">Next</button>
                </div>
            </div>
        </Card>
    );
};

// SECTION: Feature Flag Detail View
// ==========================================================

export const FeatureFlagDetailView: FC<{ flag: FeatureFlag, onBack: () => void }> = ({ flag, onBack }) => {
    const [currentEnv, setCurrentEnv] = useState<Environment>('production');
    
    // This would be a real state management solution in a real app
    const [localFlag, setLocalFlag] = useState(flag);

    const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setLocalFlag(f => ({...f, rolloutPercentage: {...f.rolloutPercentage, [currentEnv]: value}}));
    };

    return (
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 text-sm mb-2">&larr; Back to all flags</button>
                    <h3 className="text-2xl font-bold text-white">{localFlag.name}</h3>
                    <p className="text-gray-400 font-mono text-sm">{localFlag.key}</p>
                    <p className="text-gray-300 mt-2">{localFlag.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {localFlag.tags.map(tag => <Pill key={tag} color="gray">{tag}</Pill>)}
                    </div>
                </div>
                <div>
                    <Pill color="blue">{localFlag.ownerTeam}</Pill>
                </div>
            </div>
            
            {/* Environment Tabs */}
            <div className="border-b border-gray-700 mb-4">
                {(['production', 'staging', 'development'] as Environment[]).map(env => (
                    <Tab key={env} active={currentEnv === env} onClick={() => setCurrentEnv(env)}>
                        {env.charAt(0).toUpperCase() + env.slice(1)}
                    </Tab>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Status & Rollout */}
                <div className="md:col-span-2 space-y-6">
                    <Card title="Status & Rollout">
                        <div className="flex items-center space-x-4 mb-4">
                            <span className="font-medium text-gray-300">Status:</span>
                            <button className={`px-4 py-2 rounded text-sm ${localFlag.status[currentEnv] === 'enabled' ? 'bg-green-600' : 'bg-gray-600'}`}>Enabled</button>
                            <button className={`px-4 py-2 rounded text-sm ${localFlag.status[currentEnv] === 'disabled' ? 'bg-red-600' : 'bg-gray-600'}`}>Disabled</button>
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium text-gray-300 block">Rollout Percentage: {localFlag.rolloutPercentage[currentEnv]}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={localFlag.rolloutPercentage[currentEnv]}
                                onChange={handlePercentageChange}
                                className="w-full"
                            />
                        </div>
                    </Card>

                    <Card title="Targeting Rules">
                        <p className="text-sm text-gray-400 mb-4">Apply this feature to specific user segments. Rules within a group are combined with the selected condition.</p>
                        {localFlag.targetingRules[currentEnv].length === 0 && <p className="text-gray-500">No targeting rules for this environment.</p>}
                        {/* Rule Builder UI would go here */}
                    </Card>
                </div>
                
                {/* Right Column: Info & Actions */}
                <div className="space-y-6">
                     <Card title="Information">
                         <ul className="text-sm space-y-2">
                            <li><strong>Created:</strong> <span className="text-gray-300">{new Date(localFlag.createdAt).toLocaleString()}</span></li>
                            <li><strong>Last Updated:</strong> <span className="text-gray-300">{new Date(localFlag.updatedAt).toLocaleString()}</span></li>
                            <li><strong>Strategy:</strong> <span className="text-gray-300">{localFlag.rolloutStrategy}</span></li>
                         </ul>
                     </Card>
                     <Card title="Actions">
                         <div className="flex flex-col space-y-2">
                             <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors text-sm">Save Changes</button>
                             <button className="w-full py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors text-sm">View History</button>
                             <button className="w-full py-2 bg-red-800 hover:bg-red-900 rounded transition-colors text-sm text-red-200">Archive Flag</button>
                         </div>
                     </Card>
                </div>
            </div>
        </Card>
    );
};

// SECTION: Audit Log View
// ==========================================================

export const AuditLogView: FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getAuditLogs().then(data => {
            setLogs(data);
            setIsLoading(false);
        });
    }, []);

    if(isLoading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size={48} /></div>;

    return (
        <Card title="Global Audit Log">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Timestamp</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Feature Flag</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900/50 divide-y divide-gray-800">
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td className="px-4 py-3 text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-white font-medium">{log.user}</td>
                                <td className="px-4 py-3 text-sm text-cyan-400 font-mono">{log.featureFlagKey}</td>
                                <td className="px-4 py-3 text-sm">
                                    <Pill color="yellow">{log.action}</Pill>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


// SECTION: Main View Component
// ==========================================================

type View = 'ai_planner' | 'feature_flags_list' | 'feature_flag_detail' | 'audit_log';

interface AppState {
    currentView: View;
    featureFlags: FeatureFlag[];
    selectedFlag: FeatureFlag | null;
    isLoading: boolean;
}

type AppAction =
    | { type: 'SET_VIEW'; payload: View }
    | { type: 'SET_FLAGS'; payload: FeatureFlag[] }
    | { type: 'SELECT_FLAG'; payload: FeatureFlag | null }
    | { type: 'START_LOADING' };

const initialState: AppState = {
    currentView: 'feature_flags_list',
    featureFlags: [],
    selectedFlag: null,
    isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_VIEW':
            return { ...state, currentView: action.payload };
        case 'SET_FLAGS':
            return { ...state, featureFlags: action.payload, isLoading: false };
        case 'SELECT_FLAG':
            return { ...state, selectedFlag: action.payload, currentView: action.payload ? 'feature_flag_detail' : 'feature_flags_list' };
        case 'START_LOADING':
            return { ...state, isLoading: true };
        default:
            return state;
    }
}

const DemoBankFeatureManagementView: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        dispatch({ type: 'START_LOADING' });
        api.getFeatureFlags().then(flags => {
            dispatch({ type: 'SET_FLAGS', payload: flags });
        });
    }, []);
    
    const handleSelectFlag = useCallback((flag: FeatureFlag) => {
        dispatch({ type: 'SELECT_FLAG', payload: flag });
    }, []);
    
    const handleBackToList = useCallback(() => {
        dispatch({ type: 'SELECT_FLAG', payload: null });
    }, []);

    const renderContent = () => {
        if (state.isLoading && state.currentView !== 'ai_planner') {
            return (
                <div className="flex justify-center items-center h-96">
                    <LoadingSpinner size={64} />
                </div>
            );
        }

        switch (state.currentView) {
            case 'ai_planner':
                return <AiRolloutPlanner />;
            case 'feature_flags_list':
                return <FeatureFlagTable flags={state.featureFlags} onSelectFlag={handleSelectFlag} />;
            case 'feature_flag_detail':
                return state.selectedFlag ? <FeatureFlagDetailView flag={state.selectedFlag} onBack={handleBackToList} /> : <p>No flag selected.</p>;
            case 'audit_log':
                return <AuditLogView />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Feature Management</h2>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors font-semibold">
                    + New Feature Flag
                </button>
            </div>

            {/* Main Navigation */}
            <div className="border-b border-gray-700">
                <Tab active={state.currentView === 'feature_flags_list' || state.currentView === 'feature_flag_detail'} onClick={() => dispatch({type: 'SET_VIEW', payload: 'feature_flags_list'})}>Feature Flags</Tab>
                <Tab active={state.currentView === 'ai_planner'} onClick={() => dispatch({type: 'SET_VIEW', payload: 'ai_planner'})}>AI Rollout Planner</Tab>
                <Tab active={state.currentView === 'audit_log'} onClick={() => dispatch({type: 'SET_VIEW', payload: 'audit_log'})}>Audit Log</Tab>
                <Tab active={false} onClick={() => {}}>A/B Testing</Tab>
            </div>
            
            {renderContent()}
        </div>
    );
};

export default DemoBankFeatureManagementView;