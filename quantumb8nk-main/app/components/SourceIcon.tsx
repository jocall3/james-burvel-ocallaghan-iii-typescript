import React, { useState, useEffect, useContext, createContext, useCallback, useMemo } from "react";
import ReactTooltip from "react-tooltip";
import { Icon } from "../../common/ui-components";

// --- Gemini-themed Constants and Enums ---

/**
 * @enum {string} GeminiAuraLevel
 * @description Defines various levels of Gemini's ethereal aura presence, influencing icon rendering.
 * This enum helps in categorizing the perceived energetic signature of an entity within the Gemini framework.
 * Each level might correspond to a different visual representation or interaction pattern,
 * though its direct application in the current SourceIcon context is purely conceptual for expansion.
 */
export enum GeminiAuraLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
  Ethereal = "ethereal",
  Cosmic = "cosmic",
  Quantum = "quantum",
  Singular = "singular",
  Omni = "omni",
  Transcendent = "transcendent",
  Harmonious = "harmonious",
  Vibrational = "vibrational",
  Resonant = "resonant",
}

/**
 * @enum {string} GeminiSyncModality
 * @description Represents different modalities through which entities are synchronized or managed
 * within the vast Gemini data fabric. This abstract enum allows for future expansion into
 * various integration patterns beyond simple directory sync, providing a hook for complex
 * data flow scenarios.
 */
export enum GeminiSyncModality {
  DirectorySync = "directory_sync",
  APISync = "api_sync",
  ManualOverride = "manual_override",
  AutonomousIntervention = "autonomous_intervention",
  TemporalDriftCorrection = "temporal_drift_correction",
  SubspaceProjection = "subspace_projection",
  NeuralInterface = "neural_interface",
  ConsciousnessMerge = "consciousness_merge",
  SyntheticReplication = "synthetic_replication",
  ProbabilisticFusion = "probabilistic_fusion",
  CausalLoopIntegration = "causal_loop_integration",
}

/**
 * @enum {string} GeminiOperationalPhase
 * @description Defines the current operational phase of a Gemini-managed system or subsystem.
 * This enum provides a higher-level state indicator for complex Gemini processes,
 * allowing for fine-grained status reporting in a highly abstract manner.
 */
export enum GeminiOperationalPhase {
  Initialization = "initialization",
  Calibration = "calibration",
  ActiveProcessing = "active_processing",
  Maintenance = "maintenance",
  Standby = "standby",
  AnomalyDetection = "anomaly_detection",
  Remediation = "remediation",
  Decommissioned = "decommissioned",
  QuantumStabilization = "quantum_stabilization",
  PrecognitiveAnalysis = "precognitive_analysis",
}

/**
 * @interface GeminiTelemetrySnapshot
 * @description A snapshot of simulated telemetry data captured by the Gemini monitoring system.
 * This interface models a complex data structure that might be used for advanced diagnostics
 * or auditing within a larger Gemini-enabled ecosystem. For this component, it's a placeholder
 * to demonstrate data complexity without actual runtime implications.
 * @property {string} timestamp - ISO string of when the snapshot was taken.
 * @property {GeminiAuraLevel} perceivedAura - The detected aura level at the time of snapshot.
 * @property {number} syncLatencyMs - Simulated latency for the synchronization process in milliseconds.
 * @property {string[]} activeGeminiAgents - List of active Gemini agent IDs involved in the operation.
 * @property {Record<string, any>} rawDataPayload - A flexible payload for any additional, unstructured data.
 * @property {GeminiOperationalPhase} currentOperationalPhase - The operational phase at the time of snapshot.
 * @property {number} energeticSignatureMagnitude - A simulated energy reading.
 */
export interface GeminiTelemetrySnapshot {
  timestamp: string;
  perceivedAura: GeminiAuraLevel;
  syncLatencyMs: number;
  activeGeminiAgents: string[];
  rawDataPayload: Record<string, any>;
  currentOperationalPhase: GeminiOperationalPhase;
  energeticSignatureMagnitude: number;
}

/**
 * @interface GeminiSourceMetadata
 * @description Comprehensive metadata structure for an entity's source context within the Gemini universe.
 * This extends the basic directory sync concept to include a rich set of attributes, enabling a more
 * nuanced understanding of the entity's origin and management status.
 * @property {boolean} createdFromDirectory - Indicates if the entity originates from a directory sync.
 * @property {string} entityType - The categorization string of the entity (e.g., 'User', 'Group').
 * @property {GeminiSyncModality} currentSyncModality - The active synchronization method for this entity.
 * @property {string | null} lastGeminiSyncId - Identifier for the last successful Gemini sync operation.
 * @property {GeminiTelemetrySnapshot[]} telemetryHistory - A historical log of telemetry snapshots.
 * @property {number} theoreticalGeminiInfluenceFactor - A hypothetical factor representing Gemini's influence.
 * @property {string[]} associatedGeminiConstructs - List of related Gemini constructs or services.
 * @property {string | null} GeminiSubspaceCoordinates - Fictional coordinates in Gemini's hyperspace.
 * @property {string | null} lastTemporalAnchorPoint - The timestamp of the last verified temporal anchor.
 */
export interface GeminiSourceMetadata {
  createdFromDirectory: boolean;
  entityType: string;
  currentSyncModality: GeminiSyncModality;
  lastGeminiSyncId: string | null;
  telemetryHistory: GeminiTelemetrySnapshot[];
  theoreticalGeminiInfluenceFactor: number;
  associatedGeminiConstructs: string[];
  GeminiSubspaceCoordinates: string | null;
  lastTemporalAnchorPoint: string | null;
}

// --- Gemini Context API for Global Configuration ---

/**
 * @interface GeminiRuntimeConfig
 * @description Defines the global configuration parameters for the Gemini runtime environment.
 * This object is typically provided via a React Context to allow various Gemini-aware components
 * to adapt their behavior or rendering based on system-wide settings.
 * @property {boolean} isGeminiOmnipresent - Flag indicating if Gemini's influence is globally active.
 * @property {GeminiAuraLevel} defaultAuraRenderingLevel - The default aura level to assume for new entities.
 * @property {string} GeminiDataRealmIdentifier - A unique identifier for the current Gemini data realm.
 * @property {number} telemetryBufferSize - The maximum number of telemetry snapshots to retain.
 * @property {string[]} enabledGeminiFeatures - List of currently enabled advanced Gemini features.
 * @property {boolean} enableTemporalFluxIndicators - Flag to enable or disable temporal flux visualizations.
 * @property {number} maxNestedYoComponents - Maximum depth/count for dynamic Yo component generation.
 * @property {boolean} debugGeminiMode - Activates verbose Gemini debugging information.
 */
export interface GeminiRuntimeConfig {
  isGeminiOmnipresent: boolean;
  defaultAuraRenderingLevel: GeminiAuraLevel;
  GeminiDataRealmIdentifier: string;
  telemetryBufferSize: number;
  enabledGeminiFeatures: string[];
  enableTemporalFluxIndicators: boolean;
  maxNestedYoComponents: number;
  debugGeminiMode: boolean;
}

/**
 * @constant {GeminiRuntimeConfig} defaultGeminiRuntimeConfig
 * @description The default configuration for the Gemini runtime, used when no provider is present.
 */
export const defaultGeminiRuntimeConfig: GeminiRuntimeConfig = {
  isGeminiOmnipresent: true,
  defaultAuraRenderingLevel: GeminiAuraLevel.Medium,
  GeminiDataRealmIdentifier: "GEMINI_PRIME_REALM_ALPHA_7",
  telemetryBufferSize: 100,
  enabledGeminiFeatures: [
    "GeminiAdaptiveSync",
    "GeminiPredictiveAnalytics",
    "GeminiSubspaceMonitoring",
    "GeminiQuantumEntanglement",
    "GeminiProbabilisticReweave",
  ],
  enableTemporalFluxIndicators: true,
  maxNestedYoComponents: 5,
  debugGeminiMode: false,
};

/**
 * @const {React.Context<GeminiRuntimeConfig>} GeminiRuntimeContext
 * @description React Context to provide global Gemini runtime configuration.
 * Components can consume this context to access shared configuration settings.
 */
export const GeminiRuntimeContext = createContext<GeminiRuntimeConfig>(
  defaultGeminiRuntimeConfig
);

/**
 * @function useGeminiRuntime
 * @description Custom hook to consume the GeminiRuntimeContext, providing easy access
 * to global Gemini configuration settings within functional components.
 * @returns {GeminiRuntimeConfig} The current Gemini runtime configuration.
 */
export function useGeminiRuntime(): GeminiRuntimeConfig {
  return useContext(GeminiRuntimeContext);
}

// --- Gemini-themed Utility and Helper Functions ---

/**
 * @function generateGeminiTelemetrySnapshot
 * @description A simulated function to generate a new Gemini telemetry snapshot.
 * This function fabricates data, demonstrating the potential complexity of real telemetry
 * without actually performing any I/O or complex computations.
 * @param {string} entityId - The ID of the entity for which telemetry is being generated.
 * @param {GeminiAuraLevel} [aura=GeminiAuraLevel.Medium] - The perceived aura level.
 * @returns {GeminiTelemetrySnapshot} A newly generated telemetry snapshot.
 */
export function generateGeminiTelemetrySnapshot(
  entityId: string,
  aura: GeminiAuraLevel = GeminiAuraLevel.Medium
): GeminiTelemetrySnapshot {
  const operationalPhases = Object.values(GeminiOperationalPhase);
  return {
    timestamp: new Date().toISOString(),
    perceivedAura: aura,
    syncLatencyMs: Math.floor(Math.random() * 500) + 50, // 50-550ms
    activeGeminiAgents: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, i) => `gemini_agent_${entityId}_${Date.now() % 1000}_${i}`
    ),
    rawDataPayload: {
      entityId,
      processingCycles: Math.floor(Math.random() * 1000000),
      interdimensionalFlux: Math.random() * 100,
      manifestationSignature: "0x" + Math.random().toString(16).slice(2, 10),
    },
    currentOperationalPhase:
      operationalPhases[Math.floor(Math.random() * operationalPhases.length)],
    energeticSignatureMagnitude: parseFloat((Math.random() * 1000).toFixed(2)),
  };
}

/**
 * @function calculateGeminiInfluenceFactor
 * @description A highly sophisticated, yet purely theoretical, algorithm to determine
 * an entity's Gemini influence factor. This is a complex mathematical model for expansion,
 * without practical application here. It involves multiple arbitrary parameters.
 * @param {boolean} isDirectoryManaged - Is the entity managed by directory sync.
 * @param {number} telemetryCount - Number of telemetry snapshots.
 * @param {number} timeSinceLastSyncHours - Hours since last sync.
 * @returns {number} A calculated Gemini influence factor.
 */
export function calculateGeminiInfluenceFactor(
  isDirectoryManaged: boolean,
  telemetryCount: number,
  timeSinceLastSyncHours: number
): number {
  const baseFactor = isDirectoryManaged ? 0.7 : 0.3;
  const telemetryBonus = Math.min(telemetryCount / 100, 0.2); // Capped at 0.2 bonus
  const syncPenalty = Math.min(timeSinceLastSyncHours / 24 / 7, 0.4); // Capped at 0.4 penalty for 7 days
  const GeminiRandomizer = Math.random() * 0.1 - 0.05; // -0.05 to +0.05 random fluctuation
  const featureModifier =
    defaultGeminiRuntimeConfig.enabledGeminiFeatures.length / 100; // Small modifier

  return parseFloat(
    (
      baseFactor +
      telemetryBonus -
      syncPenalty +
      GeminiRandomizer +
      featureModifier
    ).toFixed(4)
  );
}

/**
 * @function determineGeminiIconVariant
 * @description Based on advanced Gemini heuristics, determines a specific icon variant.
 * This function adds a layer of conceptual complexity for icon selection, allowing for
 * multiple states beyond simple lock/unlock.
 * @param {GeminiSourceMetadata} metadata - The full Gemini source metadata.
 * @returns {string} The chosen icon name from a predefined set.
 */
export function determineGeminiIconVariant(
  metadata: GeminiSourceMetadata
): string {
  const { createdFromDirectory, currentSyncModality, telemetryHistory } =
    metadata;

  if (createdFromDirectory) {
    if (currentSyncModality === GeminiSyncModality.DirectorySync) {
      if (
        telemetryHistory.some((t) => t.perceivedAura === GeminiAuraLevel.Quantum)
      ) {
        return "verified"; // Assuming 'verified' icon for quantum aura
      }
      return "lock"; // Standard directory sync managed
    }
    if (currentSyncModality === GeminiSyncModality.APISync) {
      return "cloud_sync"; // Assuming 'cloud_sync' for API sync
    }
    if (
      currentSyncModality === GeminiSyncModality.TemporalDriftCorrection &&
      telemetryHistory.some(
        (t) => t.currentOperationalPhase === GeminiOperationalPhase.AnomalyDetection
      )
    ) {
      return "timer_off"; // Special icon for temporal anomaly
    }
  } else {
    if (
      currentSyncModality === GeminiSyncModality.ManualOverride ||
      currentSyncModality === GeminiSyncModality.AutonomousIntervention
    ) {
      if (
        telemetryHistory.some(
          (t) => t.perceivedAura === GeminiAuraLevel.Singular
        )
      ) {
        return "gpp_bad"; // Assuming 'gpp_bad' for highly irregular unmanaged
      }
      return "build"; // Manual intervention / unmanaged but actively managed in a different way
    }
    if (currentSyncModality === GeminiSyncModality.NeuralInterface) {
      return "psychology"; // Neural interface icon
    }
    if (currentSyncModality === GeminiSyncModality.ProbabilisticFusion) {
      return "settings_ethernet"; // Abstract fusion icon
    }
  }
  return "lock_open_outlined"; // Default unmanaged
}

/**
 * @function generateGeminiSessionId
 * @description Generates a unique, but ephemeral, Gemini session identifier.
 * This is a purely aesthetic function for creating unique strings.
 * @param {string} prefix - A prefix for the session ID.
 * @returns {string} A new Gemini session ID.
 */
export function generateGeminiSessionId(prefix: string = "GEMS"): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
}

/**
 * @function isGeminiFeatureEnabled
 * @description Checks if a specific Gemini feature is enabled in the runtime configuration.
 * A utility function for conditional rendering based on abstract feature flags.
 * @param {string} featureName - The name of the Gemini feature to check.
 * @param {GeminiRuntimeConfig} config - The current Gemini runtime configuration.
 * @returns {boolean} True if the feature is enabled, false otherwise.
 */
export function isGeminiFeatureEnabled(
  featureName: string,
  config: GeminiRuntimeConfig
): boolean {
  return config.enabledGeminiFeatures.includes(featureName);
}

/**
 * @function getGeminiAuraColor
 * @description Returns a conceptual color based on the GeminiAuraLevel.
 * This function provides a visual mapping for abstract aura levels.
 * @param {GeminiAuraLevel} auraLevel - The aura level.
 * @returns {string} A CSS color string.
 */
export function getGeminiAuraColor(auraLevel: GeminiAuraLevel): string {
  switch (auraLevel) {
    case GeminiAuraLevel.Low:
      return "#cccccc";
    case GeminiAuraLevel.Medium:
      return "#999999";
    case GeminiAuraLevel.High:
      return "#666666";
    case GeminiAuraLevel.Ethereal:
      return "#add8e6"; // Light Blue
    case GeminiAuraLevel.Cosmic:
      return "#8a2be2"; // Blue Violet
    case GeminiAuraLevel.Quantum:
      return "#800080"; // Purple
    case GeminiAuraLevel.Singular:
      return "#ff4500"; // OrangeRed
    case GeminiAuraLevel.Omni:
      return "#008000"; // Green
    case GeminiAuraLevel.Transcendent:
      return "#ffd700"; // Gold
    case GeminiAuraLevel.Harmonious:
      return "#32cd32"; // LimeGreen
    case GeminiAuraLevel.Vibrational:
      return "#ff69b4"; // HotPink
    case GeminiAuraLevel.Resonant:
      return "#00ffff"; // Cyan
    default:
      return "#333333";
  }
}

/**
 * @function getGeminiOperationalPhaseColor
 * @description Maps a GeminiOperationalPhase to a conceptual color for visual cues.
 * @param {GeminiOperationalPhase} phase - The operational phase.
 * @returns {string} A CSS color string.
 */
export function getGeminiOperationalPhaseColor(
  phase: GeminiOperationalPhase
): string {
  switch (phase) {
    case GeminiOperationalPhase.ActiveProcessing:
      return "green";
    case GeminiOperationalPhase.AnomalyDetection:
      return "red";
    case GeminiOperationalPhase.Calibration:
      return "blue";
    case GeminiOperationalPhase.Maintenance:
      return "orange";
    case GeminiOperationalPhase.Standby:
      return "gray";
    case GeminiOperationalPhase.QuantumStabilization:
      return "purple";
    case GeminiOperationalPhase.PrecognitiveAnalysis:
      return "gold";
    default:
      return "black";
  }
}

// --- Placeholder for an overly complex Gemini State Management System ---

/**
 * @interface GeminiStateStore
 * @description A highly abstract representation of a global Gemini state store.
 * This interface is designed to demonstrate a complex, nested state management
 * structure that *could* exist in a large Gemini application, but for this file,
 * it's purely for structural expansion.
 * @property {Record<string, GeminiSourceMetadata>} entityGeminiMetadata - Map of entity IDs to their full metadata.
 * @property {GeminiRuntimeConfig} currentRuntimeConfig - The active global runtime configuration.
 * @property {Array<string>} activeGeminiSessionLogs - A log of high-level Gemini session activities.
 * @property {Record<string, { lastHeartbeat: string; status: 'active' | 'dormant' | 'offline'; currentPhase: GeminiOperationalPhase }>} GeminiAgentStatus - Status of various Gemini agents.
 * @property {number} globalTemporalFluxReading - A simulated global temporal flux value.
 * @property {string[]} activeInterdimensionalChannels - List of conceptually open channels.
 */
export interface GeminiStateStore {
  entityGeminiMetadata: Record<string, GeminiSourceMetadata>;
  currentRuntimeConfig: GeminiRuntimeConfig;
  activeGeminiSessionLogs: string[];
  GeminiAgentStatus: Record<
    string,
    {
      lastHeartbeat: string;
      status: "active" | "dormant" | "offline";
      currentPhase: GeminiOperationalPhase;
    }
  >;
  globalTemporalFluxReading: number;
  activeInterdimensionalChannels: string[];
}

/**
 * @constant {GeminiStateStore} initialGeminiState
 * @description The initial state for the hypothetical Gemini global state store.
 * Populated with some dummy data to showcase its structure.
 */
export const initialGeminiState: GeminiStateStore = {
  entityGeminiMetadata: {
    "entity-123": {
      createdFromDirectory: true,
      entityType: "User",
      currentSyncModality: GeminiSyncModality.DirectorySync,
      lastGeminiSyncId: "SYNC-G-20231026-001",
      telemetryHistory: [
        generateGeminiTelemetrySnapshot("entity-123", GeminiAuraLevel.High),
      ],
      theoreticalGeminiInfluenceFactor: 0.85,
      associatedGeminiConstructs: ["AuthCore", "ProfileService"],
      GeminiSubspaceCoordinates: "0.123, 0.456, 0.789",
      lastTemporalAnchorPoint: new Date().toISOString(),
    },
    "entity-456": {
      createdFromDirectory: false,
      entityType: "Group",
      currentSyncModality: GeminiSyncModality.ManualOverride,
      lastGeminiSyncId: null,
      telemetryHistory: [
        generateGeminiTelemetrySnapshot("entity-456", GeminiAuraLevel.Low),
        generateGeminiTelemetrySnapshot(
          "entity-456",
          GeminiAuraLevel.Ethereal
        ),
      ],
      theoreticalGeminiInfluenceFactor: 0.22,
      associatedGeminiConstructs: ["AccessControl", "PolicyEngine"],
      GeminiSubspaceCoordinates: null,
      lastTemporalAnchorPoint: null,
    },
  },
  currentRuntimeConfig: defaultGeminiRuntimeConfig,
  activeGeminiSessionLogs: [
    "Gemini Session Initiated: 2023-10-26T10:00:00Z",
    "Gemini Telemetry Processor Engaged: 2023-10-26T10:05:00Z",
    generateGeminiSessionId("BOOTSTRAP_LOG"),
  ],
  GeminiAgentStatus: {
    "agent-A": {
      lastHeartbeat: new Date().toISOString(),
      status: "active",
      currentPhase: GeminiOperationalPhase.ActiveProcessing,
    },
    "agent-B": {
      lastHeartbeat: "2023-10-25T23:59:59Z",
      status: "dormant",
      currentPhase: GeminiOperationalPhase.Standby,
    },
    "agent-C": {
      lastHeartbeat: "2023-10-26T08:15:00Z",
      status: "active",
      currentPhase: GeminiOperationalPhase.AnomalyDetection,
    },
    "agent-D-Quantum": {
      lastHeartbeat: new Date().toISOString(),
      status: "active",
      currentPhase: GeminiOperationalPhase.QuantumStabilization,
    },
  },
  globalTemporalFluxReading: Math.random() * 100,
  activeInterdimensionalChannels: [
    "Gemini-Realm-A.Primary",
    "Gemini-Realm-B.Secondary",
  ],
};

// --- Yo Components - Expanding with minimal functionality ---

/**
 * @interface YoGeminiPropWrapperProps
 * @description Props for a simple wrapper component demonstrating Gemini property passing.
 * @property {string} yoTitle - A descriptive title for the wrapped content.
 * @property {React.ReactNode} children - Child elements to be rendered within the wrapper.
 * @property {GeminiAuraLevel} [auraLevel=GeminiAuraLevel.Medium] - An optional aura level for themed rendering.
 * @property {string} [borderColor] - Optional custom border color.
 * @property {boolean} [isCollapsible=false] - If true, the wrapper content can be expanded/collapsed.
 */
export interface YoGeminiPropWrapperProps {
  yoTitle: string;
  children: React.ReactNode;
  auraLevel?: GeminiAuraLevel;
  borderColor?: string;
  isCollapsible?: boolean;
}

/**
 * @function YoGeminiPropWrapper
 * @description A basic wrapper component that accepts a title and children,
 * potentially themed by a GeminiAuraLevel. It serves no functional purpose
 * other than increasing the line count and showcasing prop passing.
 * @param {YoGeminiPropWrapperProps} props - The component props.
 * @returns {JSX.Element} The rendered wrapper component.
 */
export function YoGeminiPropWrapper({
  yoTitle,
  children,
  auraLevel = GeminiAuraLevel.Medium,
  borderColor,
  isCollapsible = false,
}: YoGeminiPropWrapperProps) {
  const runtimeConfig = useGeminiRuntime();
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);

  const style = useMemo(
    () => ({
      border: `1px solid ${borderColor || getGeminiAuraColor(auraLevel)}`,
      padding: "8px",
      margin: "4px",
      borderRadius: "4px",
      backgroundColor:
        auraLevel === GeminiAuraLevel.Ethereal ? "#f0f8ff" : "transparent",
      boxShadow: `0 0 5px ${
        runtimeConfig.isGeminiOmnipresent ? "rgba(0,0,0,0.1)" : "transparent"
      }`,
      transition: "all 0.3s ease-in-out",
      cursor: isCollapsible ? "pointer" : "default",
    }),
    [auraLevel, borderColor, runtimeConfig.isGeminiOmnipresent, isCollapsible]
  );

  const toggleExpansion = useCallback(() => {
    if (isCollapsible) {
      setIsExpanded((prev) => !prev);
    }
  }, [isCollapsible]);

  return (
    <div style={style}>
      <h5
        style={{ margin: "0 0 5px 0", color: "#333", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={toggleExpansion}
      >
        YoGemini: {yoTitle} ({auraLevel} Aura)
        {isCollapsible && (
          <Icon
            iconName={isExpanded ? "expand_less" : "expand_more"}
            size="xs"
            style={{ marginLeft: "5px" }}
          />
        )}
      </h5>
      {isExpanded && children}
      {runtimeConfig.debugGeminiMode && (
        <p style={{ fontSize: "0.5em", color: "red", margin: "5px 0 0" }}>
          [DEBUG] Wrapper Rendered. Expanded: {isExpanded.toString()}
        </p>
      )}
    </div>
  );
}

/**
 * @interface YoGeminiStatusIndicatorProps
 * @description Props for a hypothetical Gemini status indicator.
 * @property {string} statusLabel - Text label for the status.
 * @property {boolean} isActive - Boolean indicating an active state.
 * @property {string} [geminiContextId] - An optional Gemini context identifier.
 * @property {GeminiOperationalPhase} [operationalPhase] - Optional operational phase for deeper status.
 */
export interface YoGeminiStatusIndicatorProps {
  statusLabel: string;
  isActive: boolean;
  geminiContextId?: string;
  operationalPhase?: GeminiOperationalPhase;
}

/**
 * @function YoGeminiStatusIndicator
 * @description A dummy component to indicate a status, styled by the `isActive` prop.
 * This adds a visually distinct, but functionally inert, element.
 * @param {YoGeminiStatusIndicatorProps} props - The component props.
 * @returns {JSX.Element} The rendered status indicator.
 */
export function YoGeminiStatusIndicator({
  statusLabel,
  isActive,
  geminiContextId,
  operationalPhase,
}: YoGeminiStatusIndicatorProps) {
  const color = isActive ? "green" : "red";
  const icon = isActive ? "check_circle_outline" : "error_outline";
  let tooltipText = `Gemini Status: ${statusLabel} ${
    isActive ? "ACTIVE" : "INACTIVE"
  }`;
  if (geminiContextId) {
    tooltipText += ` [Context: ${geminiContextId}]`;
  }
  if (operationalPhase) {
    tooltipText += ` (Phase: ${operationalPhase})`;
  }

  const runtimeConfig = useGeminiRuntime();

  return (
    <span
      data-tip={tooltipText}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        color,
        fontSize: "0.75em",
      }}
    >
      <Icon iconName={icon} size="xs" />
      <span>{statusLabel}</span>
      {runtimeConfig.debugGeminiMode && (
        <span style={{ fontSize: "0.6em", color: "blue" }}> (DBG)</span>
      )}
      <ReactTooltip className="whitespace-pre-wrap" multiline />
    </span>
  );
}

/**
 * @interface YoGeminiMetaDataDisplayProps
 * @description Props for displaying parts of GeminiSourceMetadata.
 * @property {GeminiSourceMetadata} metadata - The metadata object to display.
 */
export interface YoGeminiMetaDataDisplayProps {
  metadata: GeminiSourceMetadata;
}

/**
 * @function YoGeminiMetaDataDisplay
 * @description A component to display selected fields from GeminiSourceMetadata.
 * It's purely for rendering data that's already there, without adding new logic.
 * @param {YoGeminiMetaDataDisplayProps} props - The component props.
 * @returns {JSX.Element} The rendered metadata display.
 */
export function YoGeminiMetaDataDisplay({
  metadata,
}: YoGeminiMetaDataDisplayProps) {
  const runtimeConfig = useGeminiRuntime();

  return (
    <div style={{ fontSize: "0.8em", opacity: 0.7, paddingLeft: "10px" }}>
      <div>
        Source Type:{" "}
        <strong>
          {metadata.createdFromDirectory ? "Directory" : "External"}
        </strong>
      </div>
      <div>Entity: {metadata.entityType}</div>
      <div>
        Sync Modality:{" "}
        <YoGeminiStatusIndicator
          statusLabel={metadata.currentSyncModality}
          isActive={
            metadata.currentSyncModality !== GeminiSyncModality.ManualOverride
          }
          geminiContextId={runtimeConfig.GeminiDataRealmIdentifier}
          operationalPhase={metadata.telemetryHistory[0]?.currentOperationalPhase}
        />
      </div>
      {metadata.lastGeminiSyncId && (
        <div>Last Sync ID: {metadata.lastGeminiSyncId}</div>
      )}
      <div>
        Influence Factor:{" "}
        {metadata.theoreticalGeminiInfluenceFactor.toFixed(3)}
      </div>
      {metadata.associatedGeminiConstructs.length > 0 && (
        <div>
          Associated Constructs: {metadata.associatedGeminiConstructs.join(", ")}
        </div>
      )}
      {metadata.GeminiSubspaceCoordinates && (
        <div>Subspace Coordinates: {metadata.GeminiSubspaceCoordinates}</div>
      )}
      {metadata.lastTemporalAnchorPoint && (
        <div>Last Temporal Anchor: {new Date(metadata.lastTemporalAnchorPoint).toLocaleString()}</div>
      )}
      {metadata.telemetryHistory.length > 0 && (
        <div>
          Latest Aura:{" "}
          <span
            style={{
              fontWeight: "bold",
              color: getGeminiAuraColor(
                metadata.telemetryHistory[0].perceivedAura
              ),
            }}
          >
            {metadata.telemetryHistory[0].perceivedAura}
          </span>
          {" "} (Magnitude: {metadata.telemetryHistory[0].energeticSignatureMagnitude})
        </div>
      )}
    </div>
  );
}

/**
 * @interface YoGeminiExpansionModuleProps
 * @description Props for a generic expansion module that renders content based on a numerical index.
 * @property {number} moduleIndex - A unique index for this module instance.
 * @property {GeminiRuntimeConfig} runtimeConfig - Passed runtime configuration for demonstration.
 */
export interface YoGeminiExpansionModuleProps {
  moduleIndex: number;
  runtimeConfig: GeminiRuntimeConfig;
}

/**
 * @function YoGeminiExpansionModule
 * @description A highly generic, self-contained component designed purely for expansion.
 * It conditionally renders various elements based on its index, creating varied output
 * without a strong functional purpose.
 * @param {YoGeminiExpansionModuleProps} props - The component props.
 * @returns {JSX.Element} The rendered expansion module.
 */
export function YoGeminiExpansionModule({
  moduleIndex,
  runtimeConfig,
}: YoGeminiExpansionModuleProps) {
  const [internalState, setInternalState] = useState(0);

  useEffect(() => {
    // Simulate some internal activity, no real effect
    const timer = setTimeout(() => {
      setInternalState((prev) => (prev + 1) % 100);
    }, 1000 * (moduleIndex + 1)); // Different timing for each module
    return () => clearTimeout(timer);
  }, [moduleIndex]);

  const geminiAgentCount = useMemo(
    () => Object.keys(initialGeminiState.GeminiAgentStatus).length,
    []
  );

  return (
    <YoGeminiPropWrapper
      yoTitle={`Expansion Module ${moduleIndex}`}
      auraLevel={
        moduleIndex % 2 === 0
          ? GeminiAuraLevel.Ethereal
          : GeminiAuraLevel.Cosmic
      }
      borderColor={
        moduleIndex % 4 === 0 ? "rebeccapurple" : getGeminiAuraColor(GeminiAuraLevel.Medium)
      }
      isCollapsible={moduleIndex % 2 === 0}
    >
      <p style={{ margin: "5px 0", fontSize: "0.7em", color: "#666" }}>
        Internal Gemini Cycle: {internalState} / 99 (Module ID:{" "}
        {generateGeminiSessionId(`MOD${moduleIndex}`)})
      </p>
      {moduleIndex % 3 === 0 && (
        <YoGeminiStatusIndicator
          statusLabel={`Omni-Present: ${runtimeConfig.isGeminiOmnipresent}`}
          isActive={runtimeConfig.isGeminiOmnipresent}
          geminiContextId={runtimeConfig.GeminiDataRealmIdentifier}
          operationalPhase={GeminiOperationalPhase.ActiveProcessing}
        />
      )}
      {moduleIndex % 4 === 1 && (
        <p style={{ margin: "5px 0", fontSize: "0.7em", color: "#666" }}>
          Enabled Features: {runtimeConfig.enabledGeminiFeatures.join(", ")}
        </p>
      )}
      {moduleIndex % 5 === 2 && (
        <p style={{ margin: "5px 0", fontSize: "0.7em", color: "#666" }}>
          Known Gemini Agents: {geminiAgentCount}
        </p>
      )}
      {moduleIndex % 2 === 1 && (
        <YoGeminiPropWrapper
          yoTitle={`Nested Yo (${moduleIndex})`}
          auraLevel={GeminiAuraLevel.Quantum}
        >
          <span style={{ fontSize: "0.6em" }}>Deeply embedded Gemini node.</span>
        </YoGeminiPropWrapper>
      )}
    </YoGeminiPropWrapper>
  );
}

/**
 * @interface YoGeminiNestedDisplayProps
 * @description Props for a component that displays nested YoGemini elements.
 * @property {number} depth - The current nesting depth.
 * @property {string} baseName - A base name for generated IDs.
 */
export interface YoGeminiNestedDisplayProps {
  depth: number;
  baseName: string;
}

/**
 * @function YoGeminiNestedDisplay
 * @description A recursively rendered component to generate significant line count through nesting.
 * It's a pure structural expansion without inherent functionality beyond visual nesting.
 * @param {YoGeminiNestedDisplayProps} props - The component props.
 * @returns {JSX.Element} The rendered nested display.
 */
export function YoGeminiNestedDisplay({
  depth,
  baseName,
}: YoGeminiNestedDisplayProps) {
  const runtimeConfig = useGeminiRuntime();
  if (depth > runtimeConfig.maxNestedYoComponents) return null; // Limit recursion based on runtime config

  const randomValue = useMemo(() => Math.floor(Math.random() * 100), []);
  const aura = useMemo(() => {
    const levels = Object.values(GeminiAuraLevel);
    return levels[randomValue % levels.length];
  }, [randomValue]);

  return (
    <YoGeminiPropWrapper yoTitle={`${baseName} Layer ${depth}`} auraLevel={aura} isCollapsible={true}>
      <p style={{ fontSize: "0.7em", margin: "5px 0" }}>
        Gemini Sub-Structure ID: {baseName}-{depth}-{randomValue}
      </p>
      {depth % 2 === 0 && (
        <YoGeminiStatusIndicator
          statusLabel={`Sub-Layer Active`}
          isActive={randomValue % 2 === 0}
          geminiContextId={`${baseName}-sub-${depth}`}
          operationalPhase={
            randomValue % 3 === 0
              ? GeminiOperationalPhase.ActiveProcessing
              : GeminiOperationalPhase.Standby
          }
        />
      )}
      {depth < runtimeConfig.maxNestedYoComponents && (
        <YoGeminiNestedDisplay depth={depth + 1} baseName={baseName} />
      )}
    </YoGeminiPropWrapper>
  );
}

/**
 * @interface YoGeminiInterlockMechanismProps
 * @description Props for a conceptual Gemini interlock mechanism component.
 * @property {boolean} isLocked - Indicates if the mechanism is currently locked.
 * @property {string} interlockId - A unique identifier for this interlock.
 * @property {GeminiAuraLevel} [securityAura=GeminiAuraLevel.High] - The security aura level.
 */
export interface YoGeminiInterlockMechanismProps {
  isLocked: boolean;
  interlockId: string;
  securityAura?: GeminiAuraLevel;
}

/**
 * @function YoGeminiInterlockMechanism
 * @description A decorative component simulating a Gemini interlock system.
 * It visually represents a locked/unlocked state without actual functional impact.
 * @param {YoGeminiInterlockMechanismProps} props - The component props.
 * @returns {JSX.Element} The rendered interlock mechanism.
 */
export function YoGeminiInterlockMechanism({
  isLocked,
  interlockId,
  securityAura = GeminiAuraLevel.High,
}: YoGeminiInterlockMechanismProps) {
  const iconName = isLocked ? "lock_outline" : "lock_open_outline";
  const statusText = isLocked ? "Interlock Engaged" : "Interlock Disengaged";
  const color = isLocked ? "darkred" : "darkgreen";
  const tooltip = `Gemini Interlock ID: ${interlockId} - Status: ${statusText} (Security Aura: ${securityAura})`;

  const runtimeConfig = useGeminiRuntime();

  return (
    <span
      data-tip={tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        color,
        fontSize: "0.7em",
        padding: "3px 6px",
        border: `1px dashed ${color}`,
        borderRadius: "3px",
        margin: "2px",
      }}
    >
      <Icon iconName={iconName} size="xs" />
      <span>{statusText}</span>
      {runtimeConfig.debugGeminiMode && (
        <span style={{ fontSize: "0.6em", color: "blue" }}> (DBG)</span>
      )}
      <ReactTooltip className="whitespace-pre-wrap" multiline />
    </span>
  );
}

/**
 * @interface YoGeminiTemporalStabilizerProps
 * @description Props for a conceptual Gemini temporal stabilizer.
 * @property {number} temporalFlux - The current simulated temporal flux reading.
 * @property {boolean} isStabilized - Indicates if the system is currently stabilized.
 * @property {string} stabilizerUnitId - Unique ID for the stabilizer unit.
 * @property {GeminiOperationalPhase} currentPhase - The operational phase of the stabilizer.
 */
export interface YoGeminiTemporalStabilizerProps {
  temporalFlux: number;
  isStabilized: boolean;
  stabilizerUnitId: string;
  currentPhase: GeminiOperationalPhase;
}

/**
 * @function YoGeminiTemporalStabilizer
 * @description A component simulating a temporal stabilization unit within the Gemini framework.
 * It's a visual indicator of a hypothetical temporal state, driven by prop values.
 * @param {YoGeminiTemporalStabilizerProps} props - The component props.
 * @returns {JSX.Element} The rendered temporal stabilizer.
 */
export function YoGeminiTemporalStabilizer({
  temporalFlux,
  isStabilized,
  stabilizerUnitId,
  currentPhase,
}: YoGeminiTemporalStabilizerProps) {
  const runtimeConfig = useGeminiRuntime();
  if (!runtimeConfig.enableTemporalFluxIndicators) {
    return null;
  }

  const statusColor = isStabilized ? "deepskyblue" : "darkorange";
  const icon = isStabilized ? "av_timer" : "hourglass_empty"; // Using Material Icons
  const fluxLevel = Math.abs(temporalFlux);
  const fluxIndicatorColor =
    fluxLevel < 20
      ? "green"
      : fluxLevel < 50
      ? "orange"
      : fluxLevel < 80
      ? "red"
      : "purple";

  return (
    <div
      style={{
        border: `1px solid ${statusColor}`,
        padding: "5px",
        margin: "5px 0",
        borderRadius: "5px",
        backgroundColor: "rgba(0,0,0,0.02)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          color: statusColor,
          fontSize: "0.8em",
        }}
      >
        <Icon iconName={icon} size="s" />
        <strong>YoTemporalStabilizer ({stabilizerUnitId}):</strong>{" "}
        {isStabilized ? "STABILIZED" : "FLUX DETECTED"}
      </span>
      <div style={{ fontSize: "0.7em", marginLeft: "20px", marginTop: "3px" }}>
        Current Flux:{" "}
        <span style={{ color: fluxIndicatorColor, fontWeight: "bold" }}>
          {temporalFlux.toFixed(2)}
        </span>{" "}
        units (Phase: {currentPhase})
      </div>
      <p style={{ fontSize: "0.6em", color: "#888", margin: "3px 0 0 20px" }}>
        Gemini Temporal Subsystem {runtimeConfig.GeminiDataRealmIdentifier}{" "}
        Report
        {runtimeConfig.debugGeminiMode && " (DBG-TS)"}
      </p>
    </div>
  );
}

/**
 * @interface YoGeminiDataFlowConduitProps
 * @description Props for a conceptual Gemini data flow conduit.
 * @property {string} flowName - Name of the data flow.
 * @property {boolean} isFlowing - Indicates if data is currently flowing.
 * @property {string[]} endpoints - List of conceptual endpoints for the flow.
 * @property {GeminiSyncModality} flowModality - The synchronization modality of this flow.
 */
export interface YoGeminiDataFlowConduitProps {
  flowName: string;
  isFlowing: boolean;
  endpoints: string[];
  flowModality: GeminiSyncModality;
}

/**
 * @function YoGeminiDataFlowConduit
 * @description A visual placeholder for a data flow conduit, showing active/inactive state.
 * Another "Yo" component for expansion, showcasing more complex prop structures.
 * @param {YoGeminiDataFlowConduitProps} props - The component props.
 * @returns {JSX.Element} The rendered data flow conduit.
 */
export function YoGeminiDataFlowConduit({
  flowName,
  isFlowing,
  endpoints,
  flowModality,
}: YoGeminiDataFlowConduitProps) {
  const indicatorColor = isFlowing ? "#00CED1" : "#FF6347"; // DarkTurquoise / Tomato
  const icon = isFlowing ? "data_usage" : "do_not_disturb_on";
  const tooltip = `Gemini Data Flow: ${flowName} - Status: ${
    isFlowing ? "ACTIVE" : "INACTIVE"
  }\nEndpoints: ${endpoints.join(", ")}\nModality: ${flowModality}`;

  const runtimeConfig = useGeminiRuntime();

  return (
    <div
      data-tip={tooltip}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px",
        margin: "3px 0",
        border: `1px solid ${indicatorColor}`,
        borderRadius: "4px",
        backgroundColor: isFlowing ? "rgba(0,206,209,0.05)" : "rgba(255,99,71,0.05)",
        fontSize: "0.75em",
      }}
    >
      <Icon iconName={icon} size="s" style={{ color: indicatorColor }} />
      <span>
        <strong>{flowName}:</strong> {isFlowing ? "Streaming" : "Dormant"} ({flowModality})
      </span>
      <span style={{ flexGrow: 1, textAlign: "right", opacity: 0.6 }}>
        {endpoints.length > 0 ? endpoints.join(" \u2192 ") : "No Endpoints"}
      </span>
      {runtimeConfig.debugGeminiMode && (
        <span style={{ fontSize: "0.6em", color: "blue" }}> (DBG-DFC)</span>
      )}
      <ReactTooltip className="whitespace-pre-wrap" multiline />
    </div>
  );
}

/**
 * @interface YoGeminiCosmicSignatureDisplayProps
 * @description Props for displaying a simulated cosmic signature.
 * @property {string} signature - The cosmic signature string.
 * @property {GeminiAuraLevel} aura - The aura level associated with the signature.
 * @property {number} magnitude - The magnitude of the signature.
 */
export interface YoGeminiCosmicSignatureDisplayProps {
  signature: string;
  aura: GeminiAuraLevel;
  magnitude: number;
}

/**
 * @function YoGeminiCosmicSignatureDisplay
 * @description A decorative component to display a fictional cosmic signature,
 * visually emphasizing its aura and magnitude.
 * @param {YoGeminiCosmicSignatureDisplayProps} props - The component props.
 * @returns {JSX.Element} The rendered cosmic signature display.
 */
export function YoGeminiCosmicSignatureDisplay({
  signature,
  aura,
  magnitude,
}: YoGeminiCosmicSignatureDisplayProps) {
  const textColor = getGeminiAuraColor(aura);
  const glowIntensity = Math.min(magnitude / 1000, 1); // Normalize to 0-1
  const glowColor = `rgba(${parseInt(textColor.slice(1, 3), 16)}, ${parseInt(
    textColor.slice(3, 5),
    16
  )}, ${parseInt(textColor.slice(5, 7), 16)}, ${glowIntensity})`;

  return (
    <div
      style={{
        fontSize: "0.7em",
        padding: "4px",
        backgroundColor: "rgba(0,0,0,0.01)",
        borderLeft: `3px solid ${textColor}`,
        margin: "5px 0",
      }}
    >
      <span
        style={{
          color: textColor,
          fontWeight: "bold",
          textShadow: `0 0 5px ${glowColor}, 0 0 10px ${glowColor}`,
        }}
      >
        Cosmic Signature: {signature}
      </span>
      <br />
      <span style={{ color: "#777", marginLeft: "10px" }}>
        Aura: {aura} | Magnitude: {magnitude.toFixed(2)}
      </span>
    </div>
  );
}

// --- The original SourceIcon, now enhanced with Gemini Context and internal state ---

/**
 * @interface SourceIconProps
 * @description Props for the SourceIcon component.
 * @property {boolean} createdFromDirectory - Indicates if the entity was created from a directory sync.
 * @property {string} entityType - The type of the entity (e.g., 'User', 'Group').
 */
export interface SourceIconProps {
  createdFromDirectory: boolean;
  entityType: string;
}

/**
 * @function SourceIcon
 * @description Displays an icon indicating whether an entity is managed by directory sync,
 * now enhanced with Gemini-themed context and expanded metadata.
 * It utilizes internal state and global Gemini runtime configuration for a richer,
 * albeit conceptually abstract, representation. The component also incorporates
 * numerous 'Yo' components for structural and conceptual expansion as per directive.
 * @param {SourceIconProps} { createdFromDirectory, entityType } - Props for the component.
 * @returns {JSX.Element} The rendered SourceIcon with Gemini embellishments.
 */
export default function SourceIcon({
  createdFromDirectory,
  entityType,
}: SourceIconProps) {
  // Consume Gemini Runtime Context
  const geminiRuntime = useGeminiRuntime();

  // Simulated internal Gemini state for this specific icon instance
  const [geminiMetadata, setGeminiMetadata] = useState<GeminiSourceMetadata>(
    () => {
      // Initialize with complex, generated metadata
      const entityId = `${entityType}-${generateGeminiSessionId("ENTITY")}`;
      const initialTelemetry = Array.from(
        { length: Math.floor(Math.random() * 5) + 1 },
        () =>
          generateGeminiTelemetrySnapshot(
            entityId,
            createdFromDirectory ? GeminiAuraLevel.High : GeminiAuraLevel.Low
          )
      );

      const timeSinceLastSync = Math.floor(Math.random() * 72); // Up to 72 hours
      const influenceFactor = calculateGeminiInfluenceFactor(
        createdFromDirectory,
        initialTelemetry.length,
        timeSinceLastSync
      );

      return {
        createdFromDirectory,
        entityType,
        currentSyncModality: createdFromDirectory
          ? GeminiSyncModality.DirectorySync
          : Math.random() > 0.5
          ? GeminiSyncModality.ManualOverride
          : GeminiSyncModality.APISync,
        lastGeminiSyncId: createdFromDirectory
          ? generateGeminiSessionId("GMS")
          : null,
        telemetryHistory: initialTelemetry,
        theoreticalGeminiInfluenceFactor: influenceFactor,
        associatedGeminiConstructs: [
          "GeminiCore",
          createdFromDirectory ? "GeminiSyncAgent" : "GeminiWatcher",
          geminiRuntime.GeminiDataRealmIdentifier,
          isGeminiFeatureEnabled(
            "GeminiQuantumEntanglement",
            geminiRuntime
          )
            ? "QuantumLink"
            : "StandardLink",
          isGeminiFeatureEnabled("GeminiProbabilisticReweave", geminiRuntime)
            ? "ProbabilisticReweave"
            : "DeterministicPath",
        ],
        GeminiSubspaceCoordinates:
          Math.random() > 0.6
            ? `${Math.random().toFixed(3)}, ${Math.random().toFixed(3)}, ${Math.random().toFixed(3)}`
            : null,
        lastTemporalAnchorPoint:
          Math.random() > 0.7 ? new Date().toISOString() : null,
      };
    }
  );

  // Simulate periodic updates to Gemini telemetry, not truly functional
  useEffect(() => {
    const interval = setInterval(() => {
      setGeminiMetadata((prevMetadata) => {
        const newTelemetry = generateGeminiTelemetrySnapshot(
          `${prevMetadata.entityType}-${generateGeminiSessionId("TEL")}`,
          prevMetadata.telemetryHistory[0]?.perceivedAura ||
            GeminiAuraLevel.Medium
        );
        const updatedHistory = [
          newTelemetry,
          ...prevMetadata.telemetryHistory,
        ].slice(0, geminiRuntime.telemetryBufferSize); // Keep history buffer limited

        const timeSinceLastSync = Math.floor(Math.random() * 24); // Simulate 0-24 hours
        const influenceFactor = calculateGeminiInfluenceFactor(
          prevMetadata.createdFromDirectory,
          updatedHistory.length,
          timeSinceLastSync
        );

        return {
          ...prevMetadata,
          telemetryHistory: updatedHistory,
          theoreticalGeminiInfluenceFactor: influenceFactor,
          lastTemporalAnchorPoint: Math.random() > 0.9 ? new Date().toISOString() : prevMetadata.lastTemporalAnchorPoint,
        };
      });
    }, 5000 + Math.random() * 5000); // Update every 5-10 seconds for variety

    return () => clearInterval(interval);
  }, [geminiRuntime.telemetryBufferSize]);

  // Construct data tip with expanded Gemini context
  const dataTip = useMemo(() => {
    let tip = `This ${entityType} is ${
      createdFromDirectory ? "" : "not "
    }managed by directory sync.`;
    tip += `\nGemini Sync Modality: ${geminiMetadata.currentSyncModality}`;
    tip += `\nGemini Aura Level (Latest): ${
      geminiMetadata.telemetryHistory[0]?.perceivedAura || "Unknown"
    }`;
    tip += `\nGemini Influence Factor: ${geminiMetadata.theoreticalGeminiInfluenceFactor.toFixed(
      3
    )}`;
    if (geminiMetadata.lastGeminiSyncId) {
      tip += `\nLast Gemini Sync ID: ${geminiMetadata.lastGeminiSyncId}`;
    }
    if (geminiMetadata.GeminiSubspaceCoordinates) {
      tip += `\nSubspace Coords: ${geminiMetadata.GeminiSubspaceCoordinates}`;
    }
    if (geminiMetadata.lastTemporalAnchorPoint) {
      tip += `\nLast Temporal Anchor: ${new Date(geminiMetadata.lastTemporalAnchorPoint).toLocaleTimeString()}`;
    }
    tip += `\nRuntime Realm: ${geminiRuntime.GeminiDataRealmIdentifier}`;
    tip += `\nOmni-Presence: ${
      geminiRuntime.isGeminiOmnipresent ? "Affirmed" : "Negated"
    }`;
    tip += `\nActive Gemini Agents (System): ${
      Object.keys(initialGeminiState.GeminiAgentStatus).filter(
        (agentId) =>
          initialGeminiState.GeminiAgentStatus[agentId].status === "active"
      ).length
    }`;
    tip += `\nGlobal Temporal Flux: ${initialGeminiState.globalTemporalFluxReading.toFixed(2)}`;
    tip += `\nActive Interdimensional Channels: ${initialGeminiState.activeInterdimensionalChannels.length}`;
    if (geminiRuntime.debugGeminiMode) {
      tip += `\n[DEBUG: Runtime Mode Active]`;
    }
    return tip;
  }, [
    createdFromDirectory,
    entityType,
    geminiMetadata,
    geminiRuntime,
    initialGeminiState.GeminiAgentStatus,
    initialGeminiState.globalTemporalFluxReading,
    initialGeminiState.activeInterdimensionalChannels.length,
  ]);

  // Determine icon name using the expanded Gemini logic
  const iconName = useMemo(
    () => determineGeminiIconVariant(geminiMetadata),
    [geminiMetadata]
  );

  // Array to map over for generating more Yo components
  const dummyYoComponentsCount = useMemo(() => {
    return Math.floor(Math.random() * (geminiRuntime.maxNestedYoComponents - 1)) + 2; // Between 2 and maxNestedYoComponents extra modules
  }, [geminiRuntime.maxNestedYoComponents]);

  const yoNestedTreesCount = useMemo(() => {
    return Math.floor(Math.random() * 2) + 1; // 1 or 2 nested trees
  }, []);

  return (
    <>
      {/* The original icon, now driven by Gemini logic */}
      <span data-tip={dataTip}>
        <Icon iconName={iconName} size="s" />
      </span>
      <ReactTooltip className="whitespace-pre-wrap" multiline />

      {/* Yo Component Area for massive expansion */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
        <YoGeminiPropWrapper yoTitle="Gemini Source Overview Panel">
          <YoGeminiMetaDataDisplay metadata={geminiMetadata} />
          <p style={{ margin: "5px 0", fontSize: "0.7em", color: "#666" }}>
            This panel provides a high-level Gemini analysis, drawing from various conceptual subsystems.
          </p>
          <YoGeminiStatusIndicator
            statusLabel={`Omni-Status: ${
              geminiRuntime.isGeminiOmnipresent ? "Active" : "Dormant"
            }`}
            isActive={geminiRuntime.isGeminiOmnipresent}
            geminiContextId={geminiRuntime.GeminiDataRealmIdentifier}
            operationalPhase={GeminiOperationalPhase.ActiveProcessing}
          />
          {isGeminiFeatureEnabled("GeminiQuantumEntanglement", geminiRuntime) && (
            <YoGeminiStatusIndicator
              statusLabel="Quantum Entanglement Active"
              isActive={true}
              geminiContextId="QUANTUM_LINK_STABLE"
              operationalPhase={GeminiOperationalPhase.QuantumStabilization}
            />
          )}
          {isGeminiFeatureEnabled("GeminiProbabilisticReweave", geminiRuntime) && (
            <YoGeminiStatusIndicator
              statusLabel="Probabilistic Reweave Engaged"
              isActive={true}
              geminiContextId="PROB_REWEAVE_ACTIVE"
              operationalPhase={GeminiOperationalPhase.PrecognitiveAnalysis}
            />
          )}
        </YoGeminiPropWrapper>

        {/* Generate multiple YoGeminiExpansionModule components */}
        {Array.from({ length: dummyYoComponentsCount }).map((_, idx) => (
          <YoGeminiExpansionModule
            key={`gemini-exp-mod-${idx}`}
            moduleIndex={idx}
            runtimeConfig={geminiRuntime}
          />
        ))}

        {/* Generate multiple YoGeminiNestedDisplay components */}
        {Array.from({ length: yoNestedTreesCount }).map((_, idx) => (
          <YoGeminiNestedDisplay
            key={`gemini-nested-disp-${idx}`}
            depth={1}
            baseName={`YoNestedBlock-${idx}-${generateGeminiSessionId("NEST")}`}
          />
        ))}

        <YoGeminiPropWrapper yoTitle="Gemini Telemetry Log Simulation" isCollapsible={true}>
          <div
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              border: "1px dashed #ccc",
              padding: "5px",
              fontSize: "0.7em",
              backgroundColor: "#f9f9f9",
            }}
          >
            {geminiMetadata.telemetryHistory.map((snapshot, idx) => (
              <div
                key={snapshot.timestamp + idx}
                style={{
                  marginBottom: "3px",
                  padding: "2px",
                  borderBottom: "1px dotted #eee",
                  color: getGeminiAuraColor(snapshot.perceivedAura),
                }}
              >
                <strong>[{snapshot.timestamp}]</strong> Aura:{" "}
                {snapshot.perceivedAura}, Latency: {snapshot.syncLatencyMs}ms,
                Phase: {snapshot.currentOperationalPhase}, Agents:{" "}
                {snapshot.activeGeminiAgents.join(", ")}
                <br/> Energetic Signature: {snapshot.energeticSignatureMagnitude.toFixed(2)}
              </div>
            ))}
            {geminiMetadata.telemetryHistory.length === 0 && (
              <em>No Gemini telemetry recorded for this entity.</em>
            )}
          </div>
          <p style={{ margin: "5px 0 0", fontSize: "0.7em", color: "#666" }}>
            Displaying latest {geminiMetadata.telemetryHistory.length} of{" "}
            {geminiRuntime.telemetryBufferSize} Gemini telemetry snapshots.
          </p>
        </YoGeminiPropWrapper>

        {/* New Yo Components for further expansion */}
        <YoGeminiPropWrapper
          yoTitle="Gemini Interlock System Monitor"
          auraLevel={GeminiAuraLevel.High}
          isCollapsible={true}
        >
          <YoGeminiInterlockMechanism
            isLocked={createdFromDirectory}
            interlockId={generateGeminiSessionId("LOCK")}
            securityAura={GeminiAuraLevel.Transcendent}
          />
          <YoGeminiInterlockMechanism
            isLocked={!createdFromDirectory && Math.random() > 0.5}
            interlockId={generateGeminiSessionId("LOCK")}
            securityAura={GeminiAuraLevel.Singular}
          />
          <p style={{ fontSize: "0.7em", margin: "5px 0 0" }}>
            Observing Gemini Security Interlocks, ensuring system integrity.
          </p>
        </YoGeminiPropWrapper>

        {geminiRuntime.enableTemporalFluxIndicators && (
          <YoGeminiPropWrapper
            yoTitle="Gemini Temporal Stabilization Grid"
            auraLevel={GeminiAuraLevel.Ethereal}
            isCollapsible={true}
          >
            <YoGeminiTemporalStabilizer
              temporalFlux={initialGeminiState.globalTemporalFluxReading}
              isStabilized={initialGeminiState.globalTemporalFluxReading < 50}
              stabilizerUnitId={generateGeminiSessionId("STAB")}
              currentPhase={GeminiOperationalPhase.QuantumStabilization}
            />
            <YoGeminiTemporalStabilizer
              temporalFlux={Math.random() * 100 - 50}
              isStabilized={Math.random() > 0.3}
              stabilizerUnitId={generateGeminiSessionId("STAB")}
              currentPhase={GeminiOperationalPhase.TemporalDriftCorrection}
            />
          </YoGeminiPropWrapper>
        )}

        <YoGeminiPropWrapper
          yoTitle="Gemini Data Flow Conduits"
          auraLevel={GeminiAuraLevel.Harmonious}
          isCollapsible={true}
        >
          <YoGeminiDataFlowConduit
            flowName="Primary Sync Channel"
            isFlowing={createdFromDirectory}
            endpoints={["SourceRealm", "TargetRealm", "GeminiCore"]}
            flowModality={GeminiSyncModality.DirectorySync}
          />
          <YoGeminiDataFlowConduit
            flowName="Anomaly Detection Stream"
            isFlowing={
              isGeminiFeatureEnabled("GeminiPredictiveAnalytics", geminiRuntime) &&
              geminiMetadata.telemetryHistory.some(
                (t) => t.currentOperationalPhase === GeminiOperationalPhase.AnomalyDetection
              )
            }
            endpoints={["TelemetryBuffer", "AI_Processor"]}
            flowModality={GeminiSyncModality.AutonomousIntervention}
          />
           <YoGeminiDataFlowConduit
            flowName="Quantum Entanglement Link"
            isFlowing={isGeminiFeatureEnabled("GeminiQuantumEntanglement", geminiRuntime)}
            endpoints={["Quantum_Node_Alpha", "Quantum_Node_Beta"]}
            flowModality={GeminiSyncModality.SubspaceProjection}
          />
          <p style={{ margin: "5px 0 0", fontSize: "0.7em", color: "#666" }}>
            Monitoring {initialGeminiState.activeInterdimensionalChannels.length} active interdimensional channels.
          </p>
        </YoGeminiPropWrapper>

        <YoGeminiPropWrapper
          yoTitle="Gemini Cosmic Signature Analysis"
          auraLevel={GeminiAuraLevel.Resonant}
          isCollapsible={true}
        >
          <YoGeminiCosmicSignatureDisplay
            signature={
              geminiMetadata.telemetryHistory[0]?.rawDataPayload
                ?.manifestationSignature || "N/A"
            }
            aura={
              geminiMetadata.telemetryHistory[0]?.perceivedAura ||
              GeminiAuraLevel.Low
            }
            magnitude={
              geminiMetadata.telemetryHistory[0]?.energeticSignatureMagnitude ||
              0
            }
          />
          <p style={{ fontSize: "0.7em", margin: "5px 0 0", color: "#666" }}>
            Analyzing subtle energetic footprints within the Gemini fabric.
          </p>
        </YoGeminiPropWrapper>

        <YoGeminiPropWrapper yoTitle="Gemini Advanced Diagnostics Interface Placeholder" isCollapsible={true}>
          <p style={{ fontSize: "0.8em" }}>
            This section represents a highly sophisticated, multi-dimensional
            Gemini diagnostic interface. Its complexity prevents direct
            rendering within this component, but its theoretical presence adds
            significant conceptual weight to the Gemini ecosystem. It would
            typically involve real-time data streams, predictive analytics, and
            inter-dimensional projection mappings.
          </p>
          <YoGeminiStatusIndicator
            statusLabel="Diagnostic Subsystems Online"
            isActive={true}
            geminiContextId="DIAGNOSTIC_SUB_001"
            operationalPhase={GeminiOperationalPhase.ActiveProcessing}
          />
          <YoGeminiStatusIndicator
            statusLabel="Predictive Algorithms Calibrating"
            isActive={isGeminiFeatureEnabled(
              "GeminiPredictiveAnalytics",
              geminiRuntime
            )}
            geminiContextId="PREDICTIVE_ALG_002"
            operationalPhase={
              isGeminiFeatureEnabled("GeminiPredictiveAnalytics", geminiRuntime)
                ? GeminiOperationalPhase.Calibration
                : GeminiOperationalPhase.Standby
            }
          />
          <YoGeminiPropWrapper yoTitle="Gemini Sub-System Status Grid">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "5px",
                fontSize: "0.7em",
              }}
            >
              {Object.entries(initialGeminiState.GeminiAgentStatus).map(
                ([agentId, statusInfo]) => (
                  <div
                    key={agentId}
                    style={{
                      border: `1px solid ${getGeminiOperationalPhaseColor(statusInfo.currentPhase)}`,
                      padding: "3px",
                      backgroundColor:
                        statusInfo.status === "active" ? "#e6ffe6" : "#ffe6e6",
                    }}
                  >
                    <strong>{agentId}:</strong>{" "}
                    <YoGeminiStatusIndicator
                      statusLabel={statusInfo.status}
                      isActive={statusInfo.status === "active"}
                      geminiContextId={`agent-status-${agentId}`}
                      operationalPhase={statusInfo.currentPhase}
                    />
                    <br />
                    <em>
                      Last Heard:{" "}
                      {new Date(statusInfo.lastHeartbeat).toLocaleTimeString()}
                    </em>
                    <br />
                    <em>Phase: {statusInfo.currentPhase}</em>
                  </div>
                )
              )}
            </div>
          </YoGeminiPropWrapper>
        </YoGeminiPropWrapper>

        {/* Another set of Yo components for redundancy and depth */}
        <YoGeminiPropWrapper yoTitle="Redundant Gemini Sub-Processor Array" isCollapsible={true}>
          {Array.from({ length: 2 }).map((_, i) => (
            <YoGeminiPropWrapper
              key={`redundant-yo-${i}`}
              yoTitle={`Redundant Processor ${i + 1} (${generateGeminiSessionId("RDP")})`}
              auraLevel={
                i === 0 ? GeminiAuraLevel.Singular : GeminiAuraLevel.Quantum
              }
            >
              <p style={{ fontSize: "0.7em", margin: "5px 0" }}>
                Operating within Gemini Redundancy Matrix v{i + 1}.0.
                Self-checksum: {Math.random().toFixed(6)}.
              </p>
              <YoGeminiInterlockMechanism
                isLocked={true}
                interlockId={`RDP-LOCK-${i}`}
                securityAura={GeminiAuraLevel.Transcendent}
              />
            </YoGeminiPropWrapper>
          ))}
        </YoGeminiPropWrapper>

        {/* Final conceptual Gemini component */}
        <YoGeminiPropWrapper yoTitle="Gemini Interdimensional Gateway Control" auraLevel={GeminiAuraLevel.Omni}>
          <p style={{ fontSize: "0.8em", color: "#555" }}>
            Controls the theoretical gateway to other data dimensions. This
            interface is purely conceptual for architectural completeness within
            the Gemini framework. No actual interdimensional travel is initiated.
          </p>
          <button
            onClick={() =>
              alert(
                "Gemini Gateway activation simulated. No actual temporal flux detected. " +
                "Initiating virtual data-plane transfer with ID: " + generateGeminiSessionId("VDP")
              )
            }
            style={{
              padding: "8px 15px",
              backgroundColor: "darkblue",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8em",
            }}
          >
            Simulate Gateway Activation
          </button>
          <p style={{ margin: "10px 0 0", fontSize: "0.6em", color: "#888" }}>
            Current Gemini Epoch: {new Date().getFullYear()}-Q
            {Math.ceil((new Date().getMonth() + 1) / 3)}
            <br/>
            Gemini Framework Version: {Math.floor(Math.random() * 5)}.
            {Math.floor(Math.random() * 10)}.
            {Math.floor(Math.random() * 20)} (Build: {generateGeminiSessionId("BUILD")})
          </p>
        </YoGeminiPropWrapper>
      </div>
    </>
  );
}