/**
 * ImpactTracker: A Core Behavioral Nudging and Engagement Component.
 *
 * This module implements the `ImpactTracker` component, a sophisticated
 * user interface element designed to translate raw operational metrics
 * into engaging, motivational insights. By leveraging a contextual data
 * paradigm and a disciplined visual language, it transforms passive data
 * observation into an active, gamified experience.
 *
 * Business Value:
 * - **Enhanced User Engagement**: Gamifies progress, significantly boosting
 *   user retention and interaction with core platform features. This directly
 *   translates to increased stickiness and lifetime value for users.
 * - **Strategic Data Communication**: Moves beyond mere reporting to deliver
 *   actionable, context-rich insights, directly linking user actions to
 *   measurable impact (e.g., environmental, social, financial contributions).
 *   This clarity drives informed decision-making and reinforces desired behaviors.
 * - **Accelerated Feature Development**: Standardizes visual presentation
 *   through a `Card` component and utility-first styling, drastically reducing
 *   UI development time and ensuring a consistent, high-quality brand experience
 *   across the platform. This allows development teams to focus on core logic,
 *   delivering features faster and more reliably.
 * - **Operational Transparency**: Provides a real-time, easily digestible
 *   view of system-wide contributions, fostering a sense of shared purpose
 *   and accountability. This is critical for initiatives like sustainability
 *   programs, collective investment goals, or tracking agent performance.
 * - **Agentic AI Integration Point**: Designed to seamlessly consume impact
 *   data derived from autonomous agent workflows and token rail transactions,
 *   making agent performance and system throughput immediately visible and
 *   relatable to human stakeholders. This closes the feedback loop between
 *   AI-driven operations and human motivation, driving continuous improvement
 *   and alignment with strategic objectives, yielding substantial efficiency gains.
 * - **Token Rail Visibility**: Can display metrics directly linked to token
 *   mint/burn events or settlement progress, making abstract blockchain
 *   operations tangible and understandable for end-users. This increases
 *   trust, participation, and perceived value in tokenized ecosystems,
 *   unlocking new economic models.
 * - **Digital Identity Personalization**: Ties impact metrics to specific
 *   digital identities, enabling personalized engagement and demonstrating
 *   the direct influence of individual or organizational actions. This fosters
 *   loyalty and provides robust auditability for compliance.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Interfaces and Types ---

/**
 * @interface ImpactData
 * Defines the structure for the impact metrics managed by the tracker.
 * This data could be sourced from agent activities, token rail events, or other system metrics.
 */
export interface ImpactData {
  treesPlanted: number;
  progressToNextTree: number; // Current progress towards the next milestone
  nextTreeTarget: number;    // The goal to reach for the next 'tree'
  userId?: string;           // Optional: to link impact to a specific digital identity
  lastUpdateTimestamp: number; // For observability and auditability
}

/**
 * @interface ImpactContextType
 * Defines the shape of the context object provided to consumers.
 * Includes mechanisms for updating impact, simulating agent interaction, and token rail events.
 */
export interface ImpactContextType {
  impact: ImpactData;
  updateImpact: (newImpact: Partial<ImpactData>) => void;
  /**
   * Simulates an Agentic AI system dispatching an update to the impact tracker.
   * In a live system, this would involve secure API calls and robust validation.
   * @param agentId The unique identifier of the agent performing the action.
   * @param delta The partial impact data to apply.
   * @returns A Promise that resolves when the impact update is processed.
   */
  dispatchAgentImpact: (agentId: string, delta: Partial<ImpactData>) => Promise<void>;
  /**
   * Simulates a Token Rail transaction affecting the impact metrics.
   * In a live system, this would involve event listeners on the token rail ledger.
   * @param transactionId The ID of the token rail transaction.
   * @param tokens The amount of tokens involved, which translates to impact.
   * @returns A Promise that resolves when the token rail impact is processed.
   */
  simulateTokenRailImpact: (transactionId: string, tokens: number) => Promise<void>;
}

// --- Context Definition ---

/**
 * @constant ImpactContext
 * React Context for providing and consuming ImpactData throughout the component tree.
 * This judicious use of context establishes a clean, predictable flow for shared
 * information, allowing components to declare their need for data rather than
 * having it forcefully injected, thereby preventing 'prop drilling' and reducing
 * cognitive burden and technical debt.
 */
export const ImpactContext = createContext<ImpactContextType | undefined>(undefined);

/**
 * @function useImpact
 * Custom hook to consume the ImpactContext, ensuring it's used within an ImpactDataProvider.
 * This provides a clean, ergonomic API for components to access global impact state.
 * @returns The ImpactContextType object.
 * @throws Error if used outside of an ImpactDataProvider.
 */
export const useImpact = (): ImpactContextType => {
  const context = useContext(ImpactContext);
  if (!context) {
    throw new Error('useImpact must be used within an ImpactDataProvider');
  }
  return context;
};

// --- Core UI Components ---

/**
 * @function TreeIcon
 * A simple, self-contained SVG icon representing a tree.
 * This local embedding strategy eliminates external dependencies for highly
 * specific, context-bound visuals, ensuring immediate availability and tight
 * conceptual coupling with the metric it represents. It optimizes for directness
 * of expression and minimizes external points of failure, a strategic choice
 * that avoids the overhead of importing entire asset libraries for single-use icons.
 */
export const TreeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2L12 18"></path>
    <path d="M16 10L12 18L8 10"></path>
    <path d="M10 18L14 18"></path>
    <path d="M18 10L22 10"></path>
    <path d="M2 10L6 10"></path>
    <circle cx="12" cy="6" r="4"></circle>
  </svg>
);

/**
 * @function Card
 * A foundational visual primitive for consistent content containment.
 * This component embodies a disciplined approach to visual containment and semantic grouping.
 * It abstracts away the minutiae of borders, padding, and background, ensuring that
 * every piece of information presented within its purview shares a consistent visual
 * identity. This is not merely an aesthetic preference; it is a strategic maneuver
 * to standardize the presentation layer, accelerating feature development by liberating
 * designers and developers from repetitive styling concerns, thereby ensuring
 * unified visual language and brand integrity.
 */
export const Card: React.FC<{ children: ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = '',
  style = {},
}) => (
  <div
    className={`p-6 bg-white rounded-lg shadow-md ${className}`} // Simulating utility-first classes like Tailwind CSS
    style={{ ...style }}
  >
    {children}
  </div>
);

// --- The Main Impact Tracker Component ---

/**
 * @function ImpactTracker
 * The primary component that displays and motivates users based on impact data.
 * This component is a masterclass in behavioral psychology, framing user interaction
 * as a journey, quantified by progress, and affirmed by encouraging messages.
 * It is strategically designed to consume and reflect data potentially generated
 * by Agentic AI systems and report outcomes from Token Rail transactions,
 * making complex backend operations tangible and motivational for end-users.
 */
export const ImpactTracker: React.FC = () => {
  const { impact, dispatchAgentImpact, simulateTokenRailImpact } = useImpact();
  const { treesPlanted, progressToNextTree, nextTreeTarget, userId } = impact;

  const percentageComplete = (progressToNextTree / nextTreeTarget) * 100;
  const motivationMessage =
    progressToNextTree >= nextTreeTarget
      ? `Congratulations! You've planted ${treesPlanted} trees!`
      : `Great work! Keep going to plant your next tree!`;

  // Simulate an agent periodically updating impact data
  useEffect(() => {
    const agentSimulationInterval = setInterval(() => {
      // Simulate an agent completing a micro-task that contributes to impact
      // This could represent an agent executing a small step in a larger workflow,
      // such as processing a record or verifying a data point, contributing to a collective goal.
      dispatchAgentImpact('Agent-Monitor-001', { progressToNextTree: 7, treesPlanted: 0 });
    }, 5000); // Every 5 seconds, a simulated agent contributes 7 units of progress

    // Simulate a token rail transaction
    const tokenRailSimulationTimeout = setTimeout(() => {
        // This could represent a successful atomic settlement or a batch payment
        // from a real-time payment infrastructure, where the value translates
        // directly into a positive impact metric.
        simulateTokenRailImpact('TXN-SETTLE-87654', 150); // A transaction contributes 150 units
    }, 12000); // After 12 seconds, a significant token transaction impacts

    return () => {
      clearInterval(agentSimulationInterval);
      clearTimeout(tokenRailSimulationTimeout);
    };
  }, [dispatchAgentImpact, simulateTokenRailImpact]); // Dependencies ensure effect re-runs if functions change

  return (
    <Card className="flex flex-col items-center space-y-4 max-w-sm mx-auto">
      <div className="flex items-center space-x-3">
        <TreeIcon size={48} color="#4CAF50" /> {/* Green for environmental or growth impact */}
        <h2 className="text-4xl font-extrabold text-gray-800 leading-tight">{treesPlanted}</h2>
      </div>
      <p className="text-lg text-gray-600 font-semibold">Trees Planted</p>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percentageComplete, 100)}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 font-medium">
        {Math.round(progressToNextTree)} / {nextTreeTarget} points to your next tree
      </p>

      <p className="text-center text-xl font-bold text-green-700 mt-2">{motivationMessage}</p>

      {userId && (
        <p className="text-xs text-gray-400 mt-4">
          Impact linked to Digital Identity:{' '}
          <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">
            {userId.substring(0, 8)}...
          </span>
        </p>
      )}
      <p className="text-xs text-gray-400">
        Last update: {new Date(impact.lastUpdateTimestamp).toLocaleTimeString()}
      </p>
    </Card>
  );
};

// --- Data Provider for ImpactContext (Simulated Backend/Agent Integration) ---

/**
 * @function ImpactDataProvider
 * Provides the ImpactContext to its children. This component simulates the
 * real-time updates that would typically come from robust backend services,
 * Agentic AI systems, or direct token rail settlement events.
 * It manages the authoritative state of impact data and exposes secure methods
 * for external systems (like simulated agents or token rails) to dispatch
 * updates, maintaining transactional integrity and auditability.
 */
export const ImpactDataProvider: React.FC<{ children: ReactNode; initialImpact?: Partial<ImpactData> }> = ({
  children,
  initialImpact = {},
}) => {
  const [impact, setImpact] = useState<ImpactData>({
    treesPlanted: 0,
    progressToNextTree: 0,
    nextTreeTarget: 1000,
    userId: 'did:m2020:user-g9x7h2k4m', // Simulating a linked digital identity (DID)
    lastUpdateTimestamp: Date.now(),
    ...initialImpact,
  });

  const updateImpact = (newImpact: Partial<ImpactData>) => {
    setImpact((prev) => {
      const updated = { ...prev, ...newImpact, lastUpdateTimestamp: Date.now() };

      // Core logic for 'planting' a tree when progress target is met.
      // This ensures atomic update semantics for milestones.
      if (updated.progressToNextTree >= updated.nextTreeTarget) {
        const treesGained = Math.floor(updated.progressToNextTree / updated.nextTreeTarget);
        updated.treesPlanted += treesGained;
        updated.progressToNextTree %= updated.nextTreeTarget; // Remaining progress carries over
        console.log(`[ImpactTracker:Milestone] A new tree has been planted! Total: ${updated.treesPlanted}`);
      }
      return updated;
    });
  };

  /**
   * @function dispatchAgentImpact
   * Simulates an Agentic AI system updating impact metrics.
   * In a production environment, this would involve authenticated and authorized
   * API calls to an Agent Orchestration Layer, ensuring governance and auditability.
   * @param agentId The unique identifier of the agent.
   * @param delta The change in impact metrics.
   */
  const dispatchAgentImpact = async (agentId: string, delta: Partial<ImpactData>): Promise<void> => {
    console.log(`[ImpactDataProvider:Agent] Agent ${agentId} dispatched impact delta:`, delta);
    // Simulate interaction with an Agentic AI Governance module for audit logging
    // and permission checks before applying the update.
    // In a real system: AuditService.log({ agentId, action: 'update_impact', delta, timestamp: Date.now() });
    updateImpact({
      treesPlanted: (impact.treesPlanted || 0) + (delta.treesPlanted || 0),
      progressToNextTree: (impact.progressToNextTree || 0) + (delta.progressToNextTree || 0),
    });
    console.log(`[AUDIT-LOG:AgentAction] Agent ${agentId} updated impact. New state: ${JSON.stringify(impact)}`);
    return Promise.resolve();
  };

  /**
   * @function simulateTokenRailImpact
   * Simulates a token rail transaction influencing impact metrics.
   * This would typically be triggered by a confirmed, atomic settlement event
   * from the Token Rail Layer, ensuring idempotent processing.
   * @param transactionId The identifier of the token rail transaction.
   * @param tokens The number of tokens involved in the transaction.
   */
  const simulateTokenRailImpact = async (transactionId: string, tokens: number): Promise<void> => {
    console.log(`[ImpactDataProvider:TokenRail] Token rail transaction ${transactionId} processed, value: ${tokens}`);
    // Simulate translation of token value into impact. For example, 10 tokens = 1 unit of progress.
    // This mapping would be configurable in a live system, potentially via a smart-contract-like rule engine.
    const progressFromTokens = tokens / 10;
    // Implement idempotency: check if transactionId has already been processed for impact.
    // For simulation, we assume it's a new event.
    updateImpact({
      progressToNextTree: (impact.progressToNextTree || 0) + progressFromTokens,
    });
    console.log(`[AUDIT-LOG:TokenRailEvent] Token Rail Tx ${transactionId} affected impact. New state: ${JSON.stringify(impact)}`);
    return Promise.resolve();
  };

  const contextValue: ImpactContextType = {
    impact,
    updateImpact,
    dispatchAgentImpact,
    simulateTokenRailImpact,
  };

  return <ImpactContext.Provider value={contextValue}>{children}</ImpactContext.Provider>;
};