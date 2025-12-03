import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
  KpiMetricDefinition,
  KpiGoal,
} from '../../DynamicKpiLoader';
import { UserRole } from '../KpiAnalyticsPanels'; // Import UserRole from the seed file

/**
 * Defines the structure for a key initiative contributing to a strategic goal.
 */
export interface StrategicInitiative {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'deferred';
  progress: number; // Percentage, 0-100
  owner: string; // e.g., "AI Ops Team", "Product Lead"
  startDate: Date;
  endDate: Date;
}

/**
 * Defines the structure for an audacious, multi-year strategic goal.
 */
export interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date; // Multi-year target, e.g., end of 2028
  status: 'on_track' | 'at_risk' | 'achieved' | 'deferred';
  linkedKpiIds: string[]; // IDs of KpiMetricDefinition
  initiatives: StrategicInitiative[];
  ownerRole: UserRole; // Role responsible for managing this goal
  createdAt: Date;
  lastUpdatedAt: Date;
}

/**
 * Props for the StrategicGoalRoadmap component.
 */
interface StrategicGoalRoadmapProps {
  currentUserRole: UserRole;
  metrics: KpiMetricDefinition[]; // To show available KPIs for linking
  goals: KpiGoal[]; // To show detailed goals for context/linking if needed, though not directly used in this view
}

/**
 * StrategicGoalRoadmap Component
 * Enables leadership teams to visualize and interactively map out audacious multi-year
 * strategic goals, directly linking them to visionary KPIs and key initiatives.
 * It provides a high-level strategic overview, complementing the operational KPIs
 * in KpiAnalyticsPanels, serving as the strategic blueprint for the future.
 *
 * @param {StrategicGoalRoadmapProps} props The properties for the component.
 * @returns {React.FC} The StrategicGoalRoadmap component.
 */
export const StrategicGoalRoadmap: React.FC<StrategicGoalRoadmapProps> = ({
  currentUserRole,
  metrics,
}) => {
  // Mock data for strategic goals, demonstrating diverse scenarios and statuses.
  const [strategicGoals, setStrategicGoals] = useState<StrategicGoal[]>([
    {
      id: 'sg-001',
      title: 'Achieve Global Tokenized Payments Dominance by 2030',
      description: 'Expand our tokenized payment rail network to cover 80% of major global economies, processing over $1 Trillion in annual volume, ensuring frictionless, instant settlements worldwide.',
      targetDate: new Date(2030, 11, 31), // Dec 31, 2030
      status: 'on_track',
      linkedKpiIds: ['kpi-transaction-volume', 'kpi-market-share', 'kpi-settlement-speed', 'kpi-fraud-rate'],
      initiatives: [
        {
          id: 'si-001a',
          title: 'Launch "Hyper-Rail" in APAC',
          description: 'Deploy next-gen low-latency token rail infrastructure across key Asian markets, boosting regional transaction throughput.',
          status: 'in_progress',
          progress: 75,
          owner: 'Infrastructure Team',
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2025, 6, 30),
        },
        {
          id: 'si-001b',
          title: 'Secure 50 Tier-1 Bank Partnerships',
          description: 'Onboard major financial institutions globally to our tokenized payment network, integrating our rails deeply into existing financial systems.',
          status: 'at_risk',
          progress: 40,
          owner: 'Partnerships & Sales',
          startDate: new Date(2024, 3, 1),
          endDate: new Date(2027, 3, 1),
        },
      ],
      ownerRole: 'admin',
      createdAt: new Date(2023, 1, 15),
      lastUpdatedAt: new Date(2024, 5, 20),
    },
    {
      id: 'sg-002',
      title: 'Pioneer AI-Driven Autonomous Financial Agents by 2028',
      description: 'Develop and deploy a suite of self-optimizing AI agents capable of managing complex financial operations, from risk assessment to automated trading, with minimal human oversight and maximum efficiency.',
      targetDate: new Date(2028, 11, 31),
      status: 'on_track',
      linkedKpiIds: ['kpi-agent-autonomy-score', 'kpi-cost-reduction-ai', 'kpi-anomaly-resolution-time'],
      initiatives: [
        {
          id: 'si-002a',
          title: 'Agentic Core Platform v3 Release',
          description: 'Upgrade core AI platform to support advanced multi-agent coordination and emergent intelligence, enabling sophisticated decision-making.',
          status: 'completed',
          progress: 100,
          owner: 'AI R&D',
          startDate: new Date(2022, 8, 1),
          endDate: new Date(2024, 0, 15),
        },
        {
          id: 'si-002b',
          title: 'Regulatory Sandbox for AI Compliance',
          description: 'Establish a framework and obtain initial approvals for agent autonomy in regulated environments, ensuring ironclad compliance.',
          status: 'in_progress',
          progress: 60,
          owner: 'Legal & Compliance',
          startDate: new Date(2023, 10, 1),
          endDate: new Date(2025, 9, 30),
        },
      ],
      ownerRole: 'admin',
      createdAt: new Date(2022, 10, 1),
      lastUpdatedAt: new Date(2024, 5, 22),
    },
    {
      id: 'sg-003',
      title: 'Achieve Net-Zero Operational Carbon Footprint by 2027',
      description: 'Implement sustainable practices and carbon offsetting strategies across all data centers and operational facilities, leading the industry in environmental stewardship.',
      targetDate: new Date(2027, 11, 31),
      status: 'at_risk',
      linkedKpiIds: ['kpi-carbon-emissions', 'kpi-renewable-energy-usage'],
      initiatives: [
        {
          id: 'si-003a',
          title: 'Transition to Renewable Energy Sources for Data Centers',
          description: 'Negotiate and switch to 100% renewable energy providers for primary data centers, dramatically reducing our energy footprint.',
          status: 'in_progress',
          progress: 30,
          owner: 'Operations & Sustainability',
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2026, 6, 30),
        },
        {
          id: 'si-003b',
          title: 'Optimize Infrastructure Energy Efficiency',
          description: 'Implement hardware and software optimizations to reduce energy consumption across our tech stack, squeezing every watt of efficiency.',
          status: 'not_started',
          progress: 0,
          owner: 'Engineering',
          startDate: new Date(2025, 3, 1),
          endDate: new Date(2027, 3, 1),
        },
      ],
      ownerRole: 'admin',
      createdAt: new Date(2024, 0, 1),
      lastUpdatedAt: new Date(2024, 5, 10),
    },
  ]);

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState(''); // YYYY-MM-DD string
  const [newGoalLinkedKpiIds, setNewGoalLinkedKpiIds] = useState<string[]>([]);

  // RBAC control for managing strategic goals
  const canManageStrategicGoals = currentUserRole === 'admin';

  /**
   * Handles the creation of a new strategic goal from the modal input.
   */
  const handleAddStrategicGoal = useCallback(() => {
    if (!newGoalTitle.trim() || !newGoalDescription.trim() || !newGoalTargetDate.trim()) {
      alert('Please fill in all required fields for this visionary goal.');
      return;
    }

    const newGoal: StrategicGoal = {
      id: `sg-${Date.now()}`, // Unique ID for the new goal
      title: newGoalTitle,
      description: newGoalDescription,
      targetDate: new Date(newGoalTargetDate),
      status: 'on_track', // Default status for fresh initiatives
      linkedKpiIds: newGoalLinkedKpiIds,
      initiatives: [], // Strategic goals start with a blank slate for initiatives
      ownerRole: currentUserRole, // The current user role who created it
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    };

    setStrategicGoals((prev) => [...prev, newGoal]);
    setShowAddGoalModal(false);
    // Reset form fields after creation
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalTargetDate('');
    setNewGoalLinkedKpiIds([]);
  }, [newGoalTitle, newGoalDescription, newGoalTargetDate, newGoalLinkedKpiIds, currentUserRole]);

  /**
   * Retrieves the human-readable name of a KPI from its ID.
   * @param {string} kpiId The ID of the KPI.
   * @returns {string} The name of the KPI, or its ID if not found.
   */
  const getKpiName = useCallback((kpiId: string) => {
    const metric = metrics.find(m => m.id === kpiId);
    return metric ? metric.name : kpiId;
  }, [metrics]);

  /**
   * Returns Tailwind CSS classes for a strategic goal's status color.
   * @param {StrategicGoal['status']} status The status of the strategic goal.
   * @returns {string} Tailwind CSS class string for text color.
   */
  const getGoalStatusColor = (status: StrategicGoal['status']) => {
    switch (status) {
      case 'on_track': return 'text-green-400';
      case 'at_risk': return 'text-yellow-400';
      case 'achieved': return 'text-blue-400'; // Distinct color for monumental achievement
      case 'deferred': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  /**
   * Returns Tailwind CSS classes for an initiative's status color.
   * @param {StrategicInitiative['status']} status The status of the initiative.
   * @returns {string} Tailwind CSS class string for text color.
   */
  const getInitiativeStatusColor = (status: StrategicInitiative['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-indigo-400';
      case 'at_risk': case 'blocked': return 'text-red-400';
      case 'not_started': return 'text-gray-400';
      case 'deferred': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <h1 className="text-3xl font-extrabold text-indigo-300 mb-6 flex items-center">
        <svg className="w-8 h-8 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        Audacious Strategic Goal Roadmap
      </h1>
      <p className="text-gray-400 mb-8 text-lg leading-relaxed">
        This roadmap is where vision meets execution. We're not just predicting the future; we're architecting it. Track our multi-year strategic goals, connect them to the visionary KPIs that define success, and monitor the relentless progress of our key initiatives. It's the blueprint for building the future, twice.
      </p>

      {canManageStrategicGoals && (
        <button
          onClick={() => setShowAddGoalModal(true)}
          className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-md text-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
        >
          Define New Audacious Goal
        </button>
      )}

      {/* Modal for adding a new strategic goal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-indigo-300 mb-5">Define a New Strategic Goal</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="goal-title" className="block text-sm font-medium text-gray-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  id="goal-title"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Achieve Global Tokenized Payments Dominance by 2030"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="goal-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  id="goal-description"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Elaborate on the vision and scope of this game-changing goal."
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                ></textarea>
              </div>
              <div>
                <label htmlFor="goal-target-date" className="block text-sm font-medium text-gray-300 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  id="goal-target-date"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newGoalTargetDate}
                  onChange={(e) => setNewGoalTargetDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="linked-kpis" className="block text-sm font-medium text-gray-300 mb-1">Link Visionary KPIs (Select multiple)</label>
                <select
                  multiple
                  id="linked-kpis"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                  size={5}
                  value={newGoalLinkedKpiIds}
                  onChange={(e) =>
                    setNewGoalLinkedKpiIds(
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                >
                  {metrics.map((metric) => (
                    <option key={metric.id} value={metric.id}>
                      {metric.name} ({metric.category})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple KPIs that will define this goal's success.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddGoalModal(false)}
                className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStrategicGoal}
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display of Strategic Goals */}
      <div className="space-y-8">
        {strategicGoals.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No audacious goals defined yet. Let's seize the future and articulate our vision!</p>
        ) : (
          strategicGoals.map((goal) => (
            <div key={goal.id} className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600 transition-all duration-300 hover:border-indigo-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-indigo-400 leading-tight">{goal.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {format(goal.createdAt, 'MMM d, yyyy')} | Last Updated: {format(goal.lastUpdatedAt, 'MMM d, yyyy')}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getGoalStatusColor(goal.status).replace('text-', 'bg-').replace('400', '700')} ${getGoalStatusColor(goal.status)}`}>
                  {goal.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{goal.description}</p>
              <p className="text-gray-400 text-sm mb-4">
                Target Completion: <span className="font-semibold text-indigo-300">{format(goal.targetDate, 'MMMM yyyy')}</span>
              </p>

              {/* Linked KPIs Section */}
              {goal.linkedKpiIds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-200 mb-2">Visionary KPIs Aligned:</h4>
                  <div className="flex flex-wrap gap-2">
                    {goal.linkedKpiIds.map((kpiId) => (
                      <span key={kpiId} className="px-3 py-1 bg-indigo-800 text-indigo-200 text-xs rounded-full font-medium">
                        {getKpiName(kpiId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Initiatives Section */}
              <div className="mt-6 pt-4 border-t border-gray-600">
                <h4 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Key Initiatives:
                </h4>
                {goal.initiatives.length === 0 ? (
                  <p className="text-gray-500 text-sm">No initiatives defined yet for this goal. Time to strategize our next move!</p>
                ) : (
                  <div className="space-y-3">
                    {goal.initiatives.map((initiative) => (
                      <div key={initiative.id} className="p-4 bg-gray-800 rounded-md border border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-grow">
                          <p className="font-medium text-gray-200">{initiative.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{initiative.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Owner: {initiative.owner} | Duration: {format(initiative.startDate, 'MMM yy')} - {format(initiative.endDate, 'MMM yy')}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:ml-4 text-right">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getInitiativeStatusColor(initiative.status).replace('text-', 'bg-').replace('400', '700')} ${getInitiativeStatusColor(initiative.status)}`}>
                            {initiative.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">Progress: <span className="font-semibold text-indigo-300">{initiative.progress}%</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {canManageStrategicGoals && (
                  <button className="mt-4 px-4 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                    Add Initiative
                  </button>
                )}
              </div>
              {canManageStrategicGoals && (
                <div className="mt-6 pt-4 border-t border-gray-600 flex justify-end space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Edit Goal</button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete Goal</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StrategicGoalRoadmap;