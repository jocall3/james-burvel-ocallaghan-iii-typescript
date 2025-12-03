import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- ENUMERATIONS AND CONSTANTS (Expanding Scope) ---

/**
 * Enumeration of supported quantum circuit input formats.
 * This allows the debugger to handle various common representations.
 */
export enum QuantumInputFormat {
  QASM = 'OpenQASM 2.0',
  QASM3 = 'OpenQASM 3.0',
  QIR = 'Quantum Intermediate Representation',
  STATE_VECTOR_JSON = 'Final State Vector (JSON)',
  DENSITY_MATRIX_JSON = 'Final Density Matrix (JSON)',
  MEASUREMENT_RESULTS_JSON = 'Measurement Results (JSON)',
  PULSE_SEQUENCE_JSON = 'Pulse Sequence (JSON)',
  ERROR_MODEL_JSON = 'Custom Error Model (JSON)',
  CALIBRATION_DATA_JSON = 'Calibration Data (JSON)',
}

/**
 * Enumeration of different analysis modes for the debugger.
 * Each mode might trigger a different set of backend simulations or data processing.
 */
export enum AnalysisMode {
  STATIC_STATE_ANALYSIS = 'Static State Analysis',
  DYNAMIC_DECOHERENCE_SIMULATION = 'Dynamic Decoherence Simulation',
  FAULT_TOLERANCE_ESTIMATION = 'Fault Tolerance Estimation',
  RESOURCE_OPTIMIZATION = 'Resource Optimization',
  GATE_FIDELITY_CHECK = 'Gate Fidelity Check',
  CROSS_TALK_IDENTIFICATION = 'Cross-Talk Identification',
  PULSE_SEQUENCE_OPTIMIZATION = 'Pulse Sequence Optimization',
}

/**
 * Enumeration for severity levels of identified issues.
 */
export enum IssueSeverity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFORMATIONAL = 'Informational',
}

/**
 * Enumeration for different types of quantum errors.
 * This helps in classifying and suggesting targeted fixes.
 */
export enum QuantumErrorType {
  DECOHERENCE = 'Decoherence',
  THERMAL_NOISE = 'Thermal Noise',
  CONTROL_ERROR = 'Control Error',
  GATE_FIDELITY = 'Gate Fidelity',
  CROSS_TALK = 'Cross-Talk',
  MEASUREMENT_ERROR = 'Measurement Error',
  QUBIT_COUPLING = 'Qubit Coupling Misconfiguration',
  INITIALIZATION_ERROR = 'Qubit Initialization Error',
  ENVIRONMENTAL_INTERFERENCE = 'Environmental Interference',
  CALIBRATION_DRIFT = 'Calibration Drift',
  QUBIT_LOSS = 'Qubit Loss/Failure',
  SOFTWARE_BUG = 'Software/Firmware Bug',
  COMPILER_OPTIMIZATION_ISSUE = 'Compiler Optimization Issue',
}

/**
 * Defines a set of common quantum gate types.
 */
export enum QuantumGateType {
  H = 'Hadamard',
  X = 'Pauli-X',
  Y = 'Pauli-Y',
  Z = 'Pauli-Z',
  CNOT = 'Controlled-NOT',
  SWAP = 'SWAP',
  CCNOT = 'Toffoli (CCNOT)',
  RX = 'Rotation-X',
  RY = 'Rotation-Y',
  RZ = 'Rotation-Z',
  PHASE = 'Phase (S, T)',
  MEASURE = 'Measurement',
  RESET = 'Reset',
}

/**
 * Defines the status of a long-running analysis job.
 */
export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// --- INTERFACES (Significantly Expanded for Real-World Complexity) ---

/**
 * Basic interface for a point in a 2D coordinate system.
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Basic interface for a 3D vector, used for Bloch sphere coordinates.
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Represents a single qubit's state in a simplified manner, e.g., for visualization.
 */
export interface QubitState {
  id: string; // e.g., "q[0]"
  label: string;
  blochCoords: Vector3D; // (x, y, z) coordinates on the Bloch sphere
  populationZero: number; // Probability of being in |0> state
  populationOne: number; // Probability of being in |1> state
  phase: number; // Relative phase in radians
}

/**
 * Detailed information about an identified error source.
 */
export interface DetailedErrorSource {
  id: string; // Unique ID for this error instance
  type: QuantumErrorType;
  description: string;
  location: {
    qubits?: string[]; // e.g., ["q[0]", "q[1]"]
    gates?: { gateType: QuantumGateType; cycle?: number; name?: string; }[]; // Affected gates
    timeSlice?: { start: number; end: number; } // Time window in microseconds
    hardwareComponent?: string; // e.g., "CryoUnit-A", "MicrowaveGenerator-B"
  };
  severity: IssueSeverity;
  observedMagnitude: number; // e.g., probability of error, fidelity reduction
  confidence: number; // How sure the debugger is about this being the source
  potentialRootCauses: string[];
  mitigationStrategies: string[];
  referenceId?: string; // Link to an internal knowledge base entry
}

/**
 * Interface for a suggested fix, now with more detail.
 */
export interface SuggestedFix {
  fixId: string;
  description: string;
  priority: IssueSeverity; // How urgent is this fix
  estimatedImpact: number; // e.g., expected fidelity improvement (0-1)
  steps: string[]; // Step-by-step instructions
  toolsRequired?: string[]; // e.g., "Oscilloscope", "Calibration Software v2.1"
  relatedErrors?: string[]; // IDs of errors this fix might address
}

/**
 * Represents a full debugging report.
 */
export interface DebuggingReport {
  reportId: string;
  timestamp: string; // ISO string
  inputHash: string; // Hash of the input data for reproducibility
  analysisMode: AnalysisMode;
  overallStatus: 'Success' | 'Partial Success' | 'Failure';
  summary: string;
  identifiedErrors: DetailedErrorSource[];
  suggestedFixes: SuggestedFix[];
  performanceMetrics: QuantumPerformanceMetrics; // New complex metric
  entanglementAnalysis: EntanglementAnalysisResult; // New complex analysis
  decoherenceProfile: DecoherenceProfile; // New complex analysis
  faultToleranceEstimate?: FaultToleranceEstimate; // Optional, depending on mode
  resourceEstimate?: ResourceEstimate; // Optional, depending on mode
  circuitDiagramData?: CircuitDiagramData; // Optional, for visualization
  errorHeatmapData?: ErrorHeatmapData; // Optional, for visualization
  logs: DebugLogEntry[]; // Detailed log entries
}

/**
 * Interface for a log entry within the debugger.
 */
export interface DebugLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  details?: Record<string, any>;
}

/**
 * Defines various performance metrics for the quantum system.
 */
export interface QuantumPerformanceMetrics {
  totalQubitsAnalyzed: number;
  totalGatesAnalyzed: number;
  analysisDurationMs: number;
  averageQubitFidelity: number; // 0-1
  averageGateFidelity: Record<QuantumGateType, number>; // Fidelity per gate type
  measurementFidelity: number;
  readoutErrorRate: number;
  coherenceTimes: {
    t1: Record<string, number>; // T1 time in microseconds per qubit
    t2: Record<string, number>; // T2 time in microseconds per qubit
    t2Echo?: Record<string, number>; // T2 echo time in microseconds per qubit
  };
  qubitTemperatures?: Record<string, number>; // Temperature in mK per qubit
  controlPulseAmplitudes?: Record<string, Record<QuantumGateType, number>>; // Amplitude in V per qubit per gate
}

/**
 * Result of entanglement analysis.
 */
export interface EntanglementAnalysisResult {
  entangledPairs: Array<{
    qubits: [string, string];
    concurrence: number; // A measure of entanglement for two qubits (0-1)
    fidelityToBellState?: number; // How close to an ideal Bell state
    entanglementWitnessValue?: number; // Value from an entanglement witness
    bellInequalityViolation?: {
      chshValue: number; // CHSH inequality value
      maxTheoretical: number; // Max theoretical value (2*sqrt(2))
      isViolated: boolean;
    };
  }>;
  multiQubitEntanglementEntropy?: Record<string, number>; // Shannon entropy-like measure
  entanglementDiagramData?: EntanglementDiagramData; // For visualization
}

/**
 * Data structure for visualizing entanglement.
 */
export interface EntanglementDiagramData {
  nodes: Array<{ id: string; label: string; x: number; y: number; }>; // Qubits
  edges: Array<{
    source: string;
    target: string;
    strength: number; // Based on concurrence or other metric
    label?: string;
  }>;
}

/**
 * Describes the decoherence profile over time.
 */
export interface DecoherenceProfile {
  simulationStartTime: string; // ISO string
  simulationDurationMs: number;
  qubitProfiles: Array<{
    qubitId: string;
    t1DecayCurve: Array<{ time: number; populationOne: number; }>; // Time in us, population
    t2DecayCurve: Array<{ time: number; fidelity: number; }>; // Time in us, fidelity
    phaseErrorRateOverTime: Array<{ time: number; rate: number; }>; // Time in us, error rate
  }>;
  environmentalNoiseLevels: Array<{
    timestamp: string; // ISO string
    temperature: number; // mK
    magneticFieldFluctuation: number; // nT
    vibrationAmplitude: number; // nm
  }>;
}

/**
 * Estimate of fault tolerance capabilities.
 */
export interface FaultToleranceEstimate {
  errorCorrectionCodeUsed?: string; // e.g., "Surface Code", "Steane Code"
  logicalQubitsSupported: number;
  physicalQubitsRequired: number; // Per logical qubit
  thresholdErrorRate: number; // Max physical error rate for logical fidelity
  currentEffectiveErrorRate: number;
  isAboveThreshold: boolean; // True if current rate > threshold
  overheadFactor: {
    space: number; // Physical qubits / logical qubits
    time: number; // Physical operations / logical operations
  };
  resourceImpact: string; // e.g., "High", "Moderate", "Low"
  recommendations: string[];
}

/**
 * Resource estimation for a given quantum algorithm.
 */
export interface ResourceEstimate {
  estimatedLogicalQubits: number;
  estimatedPhysicalQubits: number;
  estimatedCircuitDepth: number;
  estimatedRuntimeMs: number;
  estimatedCryogenicPowerW: number;
  estimatedControlElectronicsCostUSD?: number;
  dominantResourceConstraint: string; // e.g., "Qubit Connectivity", "Coherence Time", "Gate Count"
  optimizationSuggestions: string[];
}

/**
 * Data for rendering a quantum circuit diagram.
 */
export interface CircuitDiagramData {
  numQubits: number;
  numClassicalBits: number;
  circuitLayers: Array<{
    id: string;
    type: 'barrier' | 'gate' | 'measurement';
    gates: Array<{
      type: QuantumGateType;
      targetQubits: number[]; // Qubit indices
      controlQubits?: number[]; // Qubit indices
      rotationAngle?: number; // For Rx, Ry, Rz
      label?: string;
      color?: string; // For visualization
      errorProbability?: number; // For error overlay
      fidelity?: number;
    }>;
  }>;
  // Metadata for rendering
  layoutConfig?: {
    qubitSpacing: number;
    gateSpacing: number;
    layerSpacing: number;
  };
}

/**
 * Data for an error heatmap visualization.
 * Can represent errors across qubits or across gates in a circuit.
 */
export interface ErrorHeatmapData {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  type: 'Qubit' | 'Gate' | 'TimeSlice';
  dataPoints: Array<{
    xLabel: string; // e.g., "q[0]", "H_0_q0"
    yLabel: string; // e.g., "q[1]", "CNOT_1_q0q1", "Time 100ns"
    value: number; // Error probability, fidelity loss, etc.
    details?: string;
  }>;
  minValue: number;
  maxValue: number;
  colorScheme: 'viridis' | 'plasma' | 'hot' | 'cool';
}

/**
 * Represents a historical debugging session.
 */
export interface DebugSessionHistoryEntry {
  sessionId: string;
  timestamp: string; // ISO string
  inputSummary: string; // e.g., "QASM circuit, 5 qubits"
  analysisMode: AnalysisMode;
  overallStatus: 'Success' | 'Failure';
  mostLikelyErrorSource: string;
  confidence: number;
  viewed: boolean;
}

/**
 * Configuration options for the debugger.
 */
export interface DebuggerConfig {
  preferredSimulator: 'qiskit' | 'cirq' | 'custom_backend_A';
  noiseModelEnabled: boolean;
  noiseModelParameters: Record<string, any>;
  entanglementThreshold: number; // Min concurrence to report entanglement
  reportingLevel: IssueSeverity; // Min severity to include in report
  autoApplySuggestedFixes: boolean; // DANGER!
  dataRetentionDays: number;
  developerMode: boolean;
}

interface DebugResponse {
  mostLikelyErrorSource: string; // e.g., "Qubit 3 decoherence"
  confidence: number;
  suggestedFix: string; // e.g., "Check microwave pulse calibration for CNOT gate between Q2 and Q3."
}

// --- MOCK DATA GENERATORS (Extensive for Line Count and Realism) ---

/**
 * Helper to generate random qubit IDs.
 */
const generateQubitIds = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => `q[${i}]`);
};

/**
 * Generates mock QubitState data.
 */
export const generateMockQubitState = (id: string): QubitState => ({
  id,
  label: `Qubit ${id.match(/\d+/)?.[0]}`,
  blochCoords: {
    x: parseFloat((Math.random() * 2 - 1).toFixed(3)),
    y: parseFloat((Math.random() * 2 - 1).toFixed(3)),
    z: parseFloat((Math.random() * 2 - 1).toFixed(3)),
  },
  populationZero: parseFloat(Math.random().toFixed(3)),
  populationOne: parseFloat(Math.random().toFixed(3)),
  phase: parseFloat((Math.random() * 2 * Math.PI).toFixed(3)),
});

/**
 * Generates mock DetailedErrorSource data.
 */
export const generateMockDetailedErrorSource = (qubitCount: number, errorIndex: number): DetailedErrorSource => {
  const qubitIds = generateQubitIds(qubitCount);
  const errorTypes = Object.values(QuantumErrorType);
  const severityLevels = Object.values(IssueSeverity);
  const randomQubits = Math.random() > 0.5 ? [qubitIds[Math.floor(Math.random() * qubitCount)]] : undefined;
  if (randomQubits && Math.random() > 0.7) {
    randomQubits.push(qubitIds[Math.floor(Math.random() * qubitCount)]);
  }

  const type = errorTypes[Math.floor(Math.random() * errorTypes.length)];
  const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];

  const descriptionMap: Record<QuantumErrorType, string> = {
    [QuantumErrorType.DECOHERENCE]: `Excessive decoherence observed on ${randomQubits ? randomQubits.join(', ') : 'multiple qubits'} during operations.`,
    [QuantumErrorType.THERMAL_NOISE]: `Elevated thermal noise affecting ${randomQubits ? randomQubits.join(', ') : 'system-wide'} coherence.`,
    [QuantumErrorType.CONTROL_ERROR]: `Misaligned control pulses detected, particularly for ${randomQubits ? randomQubits.join(', ') : 'a specific gate operation'}.`,
    [QuantumErrorType.GATE_FIDELITY]: `Sub-optimal fidelity for ${Math.random() > 0.5 ? QuantumGateType.CNOT : QuantumGateType.RX} gate.`,
    [QuantumErrorType.CROSS_TALK]: `Significant cross-talk between ${randomQubits ? randomQubits.join(' and ') : 'adjacent qubits'}.`,
    [QuantumErrorType.MEASUREMENT_ERROR]: `High measurement readout error rate on ${randomQubits ? randomQubits.join(', ') : 'select qubits'}.`,
    [QuantumErrorType.QUBIT_COUPLING]: `Incorrect coupling strength detected between ${randomQubits ? randomQubits.join(' and ') : 'qubit pairs'}.`,
    [QuantumErrorType.INITIALIZATION_ERROR]: `Qubit ${randomQubits ? randomQubits[0] : 'initialization'} state deviation detected.`,
    [QuantumErrorType.ENVIRONMENTAL_INTERFERENCE]: `External electromagnetic interference detected.`,
    [QuantumErrorType.CALIBRATION_DRIFT]: `Calibration parameters have drifted, requiring re-calibration.`,
    [QuantumErrorType.QUBIT_LOSS]: `Qubit ${randomQubits ? randomQubits[0] : 'a critical qubit'} shows signs of irreversible failure.`,
    [QuantumErrorType.SOFTWARE_BUG]: `Backend software processing error during pulse sequence generation.`,
    [QuantumErrorType.COMPILER_OPTIMIZATION_ISSUE]: `Compiler introduced an inefficient gate sequence causing increased error.`,
  };

  const potentialRootCausesMap: Record<QuantumErrorType, string[]> = {
    [QuantumErrorType.DECOHERENCE]: ['Inadequate shielding', 'Thermal fluctuations', 'Long circuit depth'],
    [QuantumErrorType.THERMAL_NOISE]: ['Cryogenic system instability', 'Insufficient cooling power'],
    [QuantumErrorType.CONTROL_ERROR]: ['Drift in microwave generator', 'Pulse shaping imperfections', 'Timing issues'],
    [QuantumErrorType.GATE_FIDELITY]: ['Improper gate calibration', 'Qubit-specific resonance shifts'],
    [QuantumErrorType.CROSS_TALK]: ['Close physical proximity', 'Frequency overlaps', 'Incomplete isolation'],
    [QuantumErrorType.MEASUREMENT_ERROR]: ['Readout resonator detuning', 'ADC noise'],
    [QuantumErrorType.QUBIT_COUPLING]: ['Physical fabrication imperfections', 'Drift in tunable couplers'],
    [QuantumErrorType.INITIALIZATION_ERROR]: ['Poor reset pulse efficiency', 'Residual excitations'],
    [QuantumErrorType.ENVIRONMENTAL_INTERFERENCE]: ['Unshielded cables', 'External RF sources'],
    [QuantumErrorType.CALIBRATION_DRIFT]: ['Aging hardware components', 'Temperature cycling effects'],
    [QuantumErrorType.QUBIT_LOSS]: ['Physical damage', 'Persistent parasitic coupling'],
    [QuantumErrorType.SOFTWARE_BUG]: ['Firmware bug', 'Control software logic error'],
    [QuantumErrorType.COMPILER_OPTIMIZATION_ISSUE]: ['Heuristic search limitations', 'Bug in transpiler pass'],
  };

  const mitigationStrategiesMap: Record<QuantumErrorType, string[]> = {
    [QuantumErrorType.DECOHERENCE]: ['Improve shielding', 'Optimize pulse sequences for robustness', 'Implement dynamic decoupling'],
    [QuantumErrorType.THERMAL_NOISE]: ['Service cryogenic system', 'Enhance vibration isolation'],
    [QuantumErrorType.CONTROL_ERROR]: ['Recalibrate control lines', 'Update arbitrary waveform generator firmware'],
    [QuantumErrorType.GATE_FIDELITY]: ['Run gate characterization routines', 'Adjust gate parameters (amplitude, duration, phase)'],
    [QuantumErrorType.CROSS_TALK]: ['Re-tune qubit frequencies', 'Implement dynamic cross-talk cancellation sequences'],
    [QuantumErrorType.MEASUREMENT_ERROR]: ['Optimize readout pulse parameters', 'Apply software-based error mitigation'],
    [QuantumErrorType.QUBIT_COUPLING]: ['Adjust coupler bias', 'Physical inspection (if applicable)'],
    [QuantumErrorType.INITIALIZATION_ERROR]: ['Refine reset pulse', 'Verify ground state population'],
    [QuantumErrorType.ENVIRONMENTAL_INTERFERENCE]: ['Add RF filtering', 'Improve Faraday cage'],
    [QuantumErrorType.CALIBRATION_DRIFT]: ['Automate periodic re-calibration', 'Monitor drift trends'],
    [QuantumErrorType.QUBIT_LOSS]: ['Schedule maintenance', 'Bypass qubit in future experiments'],
    [QuantumErrorType.SOFTWARE_BUG]: ['Review code for the identified module', 'Deploy patch'],
    [QuantumErrorType.COMPILER_OPTIMIZATION_ISSUE]: ['Report issue to compiler team', 'Try different compilation settings'],
  };


  return {
    id: `ERR-${Date.now()}-${errorIndex}`,
    type,
    description: descriptionMap[type],
    location: {
      qubits: randomQubits,
      gates: Math.random() > 0.6 && randomQubits ? [{
        gateType: QuantumGateType.CNOT,
        cycle: Math.floor(Math.random() * 10),
        name: `CNOT_${randomQubits.join('_')}`,
      }] : undefined,
      timeSlice: Math.random() > 0.5 ? { start: Math.random() * 100, end: Math.random() * 100 + 100 } : undefined,
      hardwareComponent: Math.random() > 0.7 ? (Math.random() > 0.5 ? "PulseGenerator-A" : "ReadoutResonator-B") : undefined,
    },
    severity,
    observedMagnitude: parseFloat(Math.random().toFixed(3)),
    confidence: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
    potentialRootCauses: potentialRootCausesMap[type],
    mitigationStrategies: mitigationStrategiesMap[type],
    referenceId: `KB-${Math.floor(Math.random() * 1000)}`,
  };
};

/**
 * Generates mock SuggestedFix data.
 */
export const generateMockSuggestedFix = (error: DetailedErrorSource): SuggestedFix => {
  const commonTools = ['Cryogenic monitoring software', 'Microwave pulse calibrator', 'RF spectrum analyzer', 'Qubit characterization suite'];
  const stepsBase = [
    `Verify integrity of ${error.location.hardwareComponent || 'affected subsystem'}.`,
    `Execute diagnostic protocol for ${error.type.toLowerCase()}.`,
    `Adjust ${error.type === QuantumErrorType.CALIBRATION_DRIFT ? 'calibration parameters' : 'control pulse timings'}.`,
    `Re-run full system calibration.`,
    `Monitor ${error.location.qubits?.join(', ') || 'affected qubits'} for ${error.type} after fix.`,
    `Log changes in the system maintenance journal.`,
  ];
  return {
    fixId: `FIX-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    description: `Address "${error.type}" identified on ${error.location.qubits?.join(', ') || 'multiple qubits'}.`,
    priority: error.severity,
    estimatedImpact: parseFloat((0.6 + Math.random() * 0.4).toFixed(2)),
    steps: stepsBase.map((step, i) => `${i + 1}. ${step}`),
    toolsRequired: Math.random() > 0.5 ? commonTools.slice(0, Math.floor(Math.random() * commonTools.length) + 1) : undefined,
    relatedErrors: [error.id],
  };
};

/**
 * Generates mock QuantumPerformanceMetrics.
 */
export const generateMockPerformanceMetrics = (qubitCount: number): QuantumPerformanceMetrics => {
  const qubitIds = generateQubitIds(qubitCount);
  const t1: Record<string, number> = {};
  const t2: Record<string, number> = {};
  const t2Echo: Record<string, number> = {};
  const temperatures: Record<string, number> = {};
  const controlPulseAmplitudes: Record<string, Record<QuantumGateType, number>> = {};

  qubitIds.forEach(id => {
    t1[id] = parseFloat((Math.random() * 1000 + 100).toFixed(1)); // 100-1100 us
    t2[id] = parseFloat((Math.random() * t1[id] * 0.8 + 50).toFixed(1)); // 50 - 0.8*T1 us
    if (Math.random() > 0.3) {
      t2Echo[id] = parseFloat((Math.random() * t2[id] * 1.2 + t2[id]).toFixed(1)); // T2Echo > T2
    }
    temperatures[id] = parseFloat((Math.random() * 20 + 10).toFixed(1)); // 10-30 mK

    controlPulseAmplitudes[id] = {};
    Object.values(QuantumGateType).forEach(gateType => {
      controlPulseAmplitudes[id][gateType] = parseFloat((Math.random() * 0.5 + 0.1).toFixed(3)); // 0.1-0.6 V
    });
  });

  const gateFidelities: Record<QuantumGateType, number> = {} as any;
  Object.values(QuantumGateType).forEach(gateType => {
    gateFidelities[gateType] = parseFloat((0.9 + Math.random() * 0.09).toFixed(4)); // 0.9 - 0.99
  });

  return {
    totalQubitsAnalyzed: qubitCount,
    totalGatesAnalyzed: Math.floor(Math.random() * 500) + 100,
    analysisDurationMs: Math.floor(Math.random() * 15000) + 5000,
    averageQubitFidelity: parseFloat((0.95 + Math.random() * 0.04).toFixed(4)),
    averageGateFidelity: gateFidelities,
    measurementFidelity: parseFloat((0.98 + Math.random() * 0.01).toFixed(4)),
    readoutErrorRate: parseFloat((0.005 + Math.random() * 0.02).toFixed(4)),
    coherenceTimes: { t1, t2, t2Echo },
    qubitTemperatures: temperatures,
    controlPulseAmplitudes: controlPulseAmplitudes,
  };
};

/**
 * Generates mock EntanglementAnalysisResult.
 */
export const generateMockEntanglementAnalysisResult = (qubitCount: number): EntanglementAnalysisResult => {
  const qubitIds = generateQubitIds(qubitCount);
  const entangledPairs: EntanglementAnalysisResult['entangledPairs'] = [];
  const numPairs = Math.floor(Math.random() * (qubitCount / 2)) + 1;

  for (let i = 0; i < numPairs; i++) {
    const q1Idx = Math.floor(Math.random() * qubitCount);
    let q2Idx = Math.floor(Math.random() * qubitCount);
    while (q1Idx === q2Idx) {
      q2Idx = Math.floor(Math.random() * qubitCount);
    }
    const qubits: [string, string] = [qubitIds[q1Idx], qubitIds[q2Idx]].sort() as [string, string];
    if (entangledPairs.some(p => p.qubits[0] === qubits[0] && p.qubits[1] === qubits[1])) continue;

    const concurrence = parseFloat((0.5 + Math.random() * 0.5).toFixed(3));
    const bellFidelity = parseFloat((0.7 + Math.random() * 0.3).toFixed(3));
    const chshValue = parseFloat((2.0 + Math.random() * 0.8 * 0.828).toFixed(3)); // max 2*sqrt(2) approx 2.828
    const isViolated = chshValue > 2.0;

    entangledPairs.push({
      qubits,
      concurrence,
      fidelityToBellState: bellFidelity,
      entanglementWitnessValue: parseFloat((Math.random() * 0.5 + 0.5).toFixed(3)),
      bellInequalityViolation: {
        chshValue,
        maxTheoretical: 2 * Math.SQRT2,
        isViolated,
      },
    });
  }

  const entanglementDiagramNodes: EntanglementDiagramData['nodes'] = qubitIds.map((id, i) => ({
    id,
    label: `Q${i}`,
    x: i * 50,
    y: Math.random() * 100,
  }));
  const entanglementDiagramEdges: EntanglementDiagramData['edges'] = entangledPairs.map(pair => ({
    source: pair.qubits[0],
    target: pair.qubits[1],
    strength: pair.concurrence,
    label: `C:${pair.concurrence.toFixed(2)}`,
  }));

  return {
    entangledPairs,
    multiQubitEntanglementEntropy: Math.random() > 0.7 ? qubitIds.reduce((acc, qid) => ({ ...acc, [qid]: parseFloat(Math.random().toFixed(3)) }), {}) : undefined,
    entanglementDiagramData: {
      nodes: entanglementDiagramNodes,
      edges: entanglementDiagramEdges,
    },
  };
};

/**
 * Generates mock DecoherenceProfile data.
 */
export const generateMockDecoherenceProfile = (qubitCount: number): DecoherenceProfile => {
  const qubitIds = generateQubitIds(qubitCount);
  const simulationDuration = Math.floor(Math.random() * 5000) + 1000; // 1-6 ms

  const qubitProfiles = qubitIds.map(id => {
    const t1Initial = Math.random() * 1000 + 500; // 500-1500 us
    const t2Initial = Math.random() * t1Initial * 0.7 + 200; // 200 - 0.7*T1 us

    const t1DecayCurve = Array.from({ length: 20 }, (_, i) => {
      const time = i * (simulationDuration / 20);
      return {
        time: parseFloat(time.toFixed(1)),
        populationOne: parseFloat((0.5 * Math.exp(-time / t1Initial) + Math.random() * 0.05).toFixed(3)),
      };
    });

    const t2DecayCurve = Array.from({ length: 20 }, (_, i) => {
      const time = i * (simulationDuration / 20);
      return {
        time: parseFloat(time.toFixed(1)),
        fidelity: parseFloat((Math.exp(-time / t2Initial) + Math.random() * 0.02).toFixed(3)),
      };
    });

    const phaseErrorRateOverTime = Array.from({ length: 20 }, (_, i) => {
      const time = i * (simulationDuration / 20);
      return {
        time: parseFloat(time.toFixed(1)),
        rate: parseFloat((0.001 + time / (t2Initial * 10) + Math.random() * 0.005).toFixed(4)),
      };
    });

    return { qubitId: id, t1DecayCurve, t2DecayCurve, phaseErrorRateOverTime };
  });

  const environmentalNoiseLevels = Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - (10 - i) * 60 * 1000).toISOString(), // Last 10 minutes
    temperature: parseFloat((Math.random() * 5 + 10).toFixed(1)), // 10-15 mK
    magneticFieldFluctuation: parseFloat((Math.random() * 0.5 + 0.1).toFixed(2)), // 0.1-0.6 nT
    vibrationAmplitude: parseFloat((Math.random() * 0.1 + 0.01).toFixed(3)), // 0.01-0.11 nm
  }));

  return {
    simulationStartTime: new Date().toISOString(),
    simulationDurationMs: simulationDuration,
    qubitProfiles,
    environmentalNoiseLevels,
  };
};

/**
 * Generates mock FaultToleranceEstimate.
 */
export const generateMockFaultToleranceEstimate = (qubitCount: number): FaultToleranceEstimate => {
  const code = Math.random() > 0.5 ? "Surface Code (D=5)" : "Steane Code";
  const logicalQubits = Math.floor(qubitCount / (Math.random() * 5 + 5)); // 5-10 physical per logical
  const physicalPerLogical = Math.floor(qubitCount / logicalQubits);
  const thresholdError = parseFloat((0.0001 + Math.random() * 0.0005).toFixed(6));
  const currentError = parseFloat((thresholdError * (0.8 + Math.random() * 0.4)).toFixed(6)); // +/- 20%
  const isAbove = currentError > thresholdError;

  return {
    errorCorrectionCodeUsed: code,
    logicalQubitsSupported: Math.max(1, logicalQubits),
    physicalQubitsRequired: physicalPerLogical,
    thresholdErrorRate: thresholdError,
    currentEffectiveErrorRate: currentError,
    isAboveThreshold: isAbove,
    overheadFactor: {
      space: physicalPerLogical,
      time: parseFloat((Math.random() * 100 + 10).toFixed(1)),
    },
    resourceImpact: isAbove ? "High" : "Moderate",
    recommendations: isAbove ? ["Improve physical error rates", "Consider a stronger error correction code"] : ["Maintain current parameters", "Optimize gate sequences"],
  };
};

/**
 * Generates mock ResourceEstimate.
 */
export const generateMockResourceEstimate = (qubitCount: number): ResourceEstimate => {
  const logicalQ = Math.max(1, Math.floor(qubitCount / (Math.random() * 3 + 2)));
  const physicalQ = logicalQ * Math.floor(Math.random() * 10 + 5);
  const circuitDepth = Math.floor(Math.random() * 1000) + 100;
  const runtime = Math.floor(Math.random() * 60000) + 10000; // 10s to 70s
  const power = parseFloat((Math.random() * 1000 + 500).toFixed(2)); // 500-1500W

  const constraints = ["Qubit Connectivity", "Coherence Time", "Gate Count", "Control Pulse Bandwidth"];
  const dominantConstraint = constraints[Math.floor(Math.random() * constraints.length)];

  return {
    estimatedLogicalQubits: logicalQ,
    estimatedPhysicalQubits: physicalQ,
    estimatedCircuitDepth: circuitDepth,
    estimatedRuntimeMs: runtime,
    estimatedCryogenicPowerW: power,
    estimatedControlElectronicsCostUSD: Math.random() > 0.5 ? parseFloat((Math.random() * 100000 + 50000).toFixed(2)) : undefined,
    dominantResourceConstraint: dominantConstraint,
    optimizationSuggestions: [
      `Reduce circuit depth by ${Math.floor(Math.random() * 20 + 5)}%.`,
      `Explore alternative qubit mapping strategies.`,
      `Investigate higher-fidelity ${dominantConstraint.includes('Coherence') ? 'qubits' : 'gates'}.`,
    ],
  };
};

/**
 * Generates mock CircuitDiagramData.
 */
export const generateMockCircuitDiagramData = (numQubits: number): CircuitDiagramData => {
  const circuitLayers: CircuitDiagramData['circuitLayers'] = [];
  const gateTypes = [QuantumGateType.H, QuantumGateType.X, QuantumGateType.CNOT, QuantumGateType.MEASURE, QuantumGateType.RX];

  for (let i = 0; i < numQubits * 3; i++) { // Generate layers
    const layerGates: CircuitDiagramData['circuitLayers'][0]['gates'] = [];
    const layerGateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];

    if (layerGateType === QuantumGateType.CNOT) {
      if (numQubits >= 2) {
        const q1 = Math.floor(Math.random() * numQubits);
        let q2 = Math.floor(Math.random() * numQubits);
        while (q1 === q2) { q2 = Math.floor(Math.random() * numQubits); }
        layerGates.push({
          type: QuantumGateType.CNOT,
          targetQubits: [q2],
          controlQubits: [q1],
          fidelity: parseFloat((0.95 + Math.random() * 0.04).toFixed(4)),
          errorProbability: parseFloat((0.001 + Math.random() * 0.005).toFixed(4)),
        });
      }
    } else if (layerGateType === QuantumGateType.RX) {
      const q = Math.floor(Math.random() * numQubits);
      layerGates.push({
        type: QuantumGateType.RX,
        targetQubits: [q],
        rotationAngle: parseFloat((Math.random() * 2 * Math.PI).toFixed(3)),
        fidelity: parseFloat((0.98 + Math.random() * 0.01).toFixed(4)),
      });
    } else if (layerGateType === QuantumGateType.MEASURE) {
      const q = Math.floor(Math.random() * numQubits);
      layerGates.push({
        type: QuantumGateType.MEASURE,
        targetQubits: [q],
        label: `M${q}`,
        errorProbability: parseFloat((0.005 + Math.random() * 0.01).toFixed(4)),
      });
    } else {
      // Single qubit gates
      const q = Math.floor(Math.random() * numQubits);
      layerGates.push({
        type: layerGateType,
        targetQubits: [q],
        fidelity: parseFloat((0.99 + Math.random() * 0.005).toFixed(4)),
      });
    }

    if (layerGates.length > 0) {
      circuitLayers.push({
        id: `layer-${i}`,
        type: 'gate',
        gates: layerGates,
      });
    }
    if (i % 5 === 0 && i > 0) { // Add some barriers
      circuitLayers.push({ id: `barrier-${i}`, type: 'barrier', gates: [] });
    }
  }

  return {
    numQubits,
    numClassicalBits: numQubits,
    circuitLayers,
    layoutConfig: {
      qubitSpacing: 40,
      gateSpacing: 30,
      layerSpacing: 60,
    },
  };
};

/**
 * Generates mock ErrorHeatmapData.
 */
export const generateMockErrorHeatmapData = (qubitCount: number): ErrorHeatmapData => {
  const qubitIds = generateQubitIds(qubitCount);
  const dataPoints: ErrorHeatmapData['dataPoints'] = [];

  for (let i = 0; i < qubitCount; i++) {
    for (let j = 0; j < qubitCount; j++) {
      if (i === j) continue; // No self-crosstalk usually reported this way
      const value = parseFloat((Math.random() * 0.05).toFixed(4)); // 0-5% error
      dataPoints.push({
        xLabel: qubitIds[i],
        yLabel: qubitIds[j],
        value: value,
        details: `Cross-talk probability: ${value * 100}%`,
      });
    }
  }

  return {
    title: 'Qubit Cross-Talk Error Heatmap',
    xAxisLabel: 'Source Qubit',
    yAxisLabel: 'Target Qubit',
    type: 'Qubit',
    dataPoints,
    minValue: 0,
    maxValue: 0.05,
    colorScheme: 'hot',
  };
};

/**
 * Generates a full mock DebuggingReport.
 */
export const generateMockDebuggingReport = (qubitCount: number = 5, mode: AnalysisMode = AnalysisMode.DYNAMIC_DECOHERENCE_SIMULATION): DebuggingReport => {
  const numErrors = Math.floor(Math.random() * 5) + 2; // 2-6 errors
  const identifiedErrors = Array.from({ length: numErrors }, (_, i) => generateMockDetailedErrorSource(qubitCount, i));
  const suggestedFixes = identifiedErrors.map(error => generateMockSuggestedFix(error));

  const logs: DebugLogEntry[] = [
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Starting quantum debugger analysis.' },
    { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Input format detected: ${QuantumInputFormat.QASM}` },
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Running noise model simulation.' },
    { timestamp: new Date().toISOString(), level: 'WARN', message: 'Minor phase error detected, within acceptable bounds.', details: { qubit: 'q[1]', magnitude: 0.01 } },
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Performing entanglement analysis.' },
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Generating performance metrics.' },
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Analysis complete.' },
  ];

  const report: DebuggingReport = {
    reportId: `RPT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: new Date().toISOString(),
    inputHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    analysisMode: mode,
    overallStatus: Math.random() > 0.1 ? 'Success' : 'Partial Success',
    summary: `Comprehensive debug report for ${qubitCount} qubits. Identified ${numErrors} potential issues.`,
    identifiedErrors,
    suggestedFixes,
    performanceMetrics: generateMockPerformanceMetrics(qubitCount),
    entanglementAnalysis: generateMockEntanglementAnalysisResult(qubitCount),
    decoherenceProfile: generateMockDecoherenceProfile(qubitCount),
    circuitDiagramData: generateMockCircuitDiagramData(qubitCount),
    errorHeatmapData: generateMockErrorHeatmapData(qubitCount),
    logs,
  };

  // Add optional reports based on analysis mode
  if (mode === AnalysisMode.FAULT_TOLERANCE_ESTIMATION) {
    report.faultToleranceEstimate = generateMockFaultToleranceEstimate(qubitCount);
  }
  if (mode === AnalysisMode.RESOURCE_OPTIMIZATION) {
    report.resourceEstimate = generateMockResourceEstimate(qubitCount);
  }

  return report;
};

/**
 * Generates mock DebugSessionHistoryEntry.
 */
export const generateMockHistoryEntry = (index: number): DebugSessionHistoryEntry => {
  const modes = Object.values(AnalysisMode);
  const mode = modes[Math.floor(Math.random() * modes.length)];
  const status = Math.random() > 0.2 ? 'Success' : 'Failure';
  const errors = ['Decoherence', 'Gate Fidelity', 'Cross-Talk', 'Thermal Noise'];
  const errorSource = errors[Math.floor(Math.random() * errors.length)];

  return {
    sessionId: `SESS-${Date.now()}-${index}`,
    timestamp: new Date(Date.now() - index * 3600 * 1000).toISOString(), // Older sessions
    inputSummary: `QASM (5 qubits) - ${mode}`,
    analysisMode: mode,
    overallStatus: status,
    mostLikelyErrorSource: status === 'Success' ? 'No critical errors' : `${errorSource} in Q${Math.floor(Math.random() * 5)}`,
    confidence: status === 'Success' ? 1.0 : parseFloat((0.6 + Math.random() * 0.3).toFixed(2)),
    viewed: Math.random() > 0.5,
  };
};

/**
 * Generates mock DebuggerConfig.
 */
export const generateMockDebuggerConfig = (): DebuggerConfig => ({
  preferredSimulator: Math.random() > 0.5 ? 'qiskit' : 'cirq',
  noiseModelEnabled: Math.random() > 0.5,
  noiseModelParameters: {
    t1_min_us: 100,
    t1_max_us: 1000,
    t2_min_us: 50,
    t2_max_us: 500,
    readout_error: 0.01,
    gate_error_rate: 0.001,
    amplitude_damping: 0.0001,
  },
  entanglementThreshold: parseFloat((0.5 + Math.random() * 0.2).toFixed(2)),
  reportingLevel: IssueSeverity.MEDIUM,
  autoApplySuggestedFixes: false,
  dataRetentionDays: 90,
  developerMode: Math.random() > 0.8,
});

// --- HELPER COMPONENTS (Exported for Top-Level requirement and structure) ---

/**
 * A simple display component for a QubitState.
 */
export const QubitStateDisplay: React.FC<{ qubit: QubitState }> = ({ qubit }) => (
  <div className="p-3 bg-gray-700 rounded-md mb-2 border border-gray-600">
    <h4 className="font-semibold text-lg">{qubit.label} ({qubit.id})</h4>
    <p className="text-sm"><strong>Bloch Coords:</strong> ({qubit.blochCoords.x}, {qubit.blochCoords.y}, {qubit.blochCoords.z})</p>
    <p className="text-sm"><strong>|0⟩ Pop:</strong> {(qubit.populationZero * 100).toFixed(1)}%</p>
    <p className="text-sm"><strong>|1⟩ Pop:</strong> {(qubit.populationOne * 100).toFixed(1)}%</p>
    <p className="text-sm"><strong>Phase:</strong> {qubit.phase.toFixed(2)} rad</p>
  </div>
);

/**
 * A display component for a DetailedErrorSource.
 */
export const ErrorSourceDisplay: React.FC<{ error: DetailedErrorSource }> = ({ error }) => {
  const severityColor = {
    [IssueSeverity.CRITICAL]: 'text-red-400',
    [IssueSeverity.HIGH]: 'text-orange-400',
    [IssueSeverity.MEDIUM]: 'text-yellow-400',
    [IssueSeverity.LOW]: 'text-green-400',
    [IssueSeverity.INFORMATIONAL]: 'text-blue-400',
  }[error.severity];

  return (
    <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
      <h4 className={`font-semibold text-lg mb-1 ${severityColor}`}>Error: {error.type} ({error.severity})</h4>
      <p className="text-sm mb-2">{error.description}</p>
      {error.location.qubits && <p className="text-xs"><strong>Affected Qubits:</strong> {error.location.qubits.join(', ')}</p>}
      {error.location.gates && <p className="text-xs"><strong>Affected Gates:</strong> {error.location.gates.map(g => `${g.gateType} on ${g.cycle}`).join(', ')}</p>}
      {error.location.hardwareComponent && <p className="text-xs"><strong>Hardware:</strong> {error.location.hardwareComponent}</p>}
      <p className="text-xs"><strong>Observed Magnitude:</strong> {error.observedMagnitude.toFixed(4)}</p>
      <p className="text-xs"><strong>Confidence:</strong> {(error.confidence * 100).toFixed(0)}%</p>
      <div className="mt-2">
        <p className="text-xs font-semibold">Potential Root Causes:</p>
        <ul className="list-disc list-inside text-xs ml-2">
          {error.potentialRootCauses.map((rc, i) => <li key={i}>{rc}</li>)}
        </ul>
      </div>
      <div className="mt-2">
        <p className="text-xs font-semibold">Mitigation Strategies:</p>
        <ul className="list-disc list-inside text-xs ml-2">
          {error.mitigationStrategies.map((ms, i) => <li key={i}>{ms}</li>)}
        </ul>
      </div>
    </div>
  );
};

/**
 * A display component for a SuggestedFix.
 */
export const SuggestedFixDisplay: React.FC<{ fix: SuggestedFix }> = ({ fix }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
    <h4 className="font-semibold text-lg mb-1">Suggested Fix: {fix.description}</h4>
    <p className="text-sm"><strong>Priority:</strong> {fix.priority}</p>
    <p className="text-sm"><strong>Estimated Impact:</strong> {(fix.estimatedImpact * 100).toFixed(1)}% improvement</p>
    <div className="mt-2">
      <p className="text-xs font-semibold">Steps:</p>
      <ol className="list-decimal list-inside text-xs ml-2">
        {fix.steps.map((step, i) => <li key={i}>{step}</li>)}
      </ol>
    </div>
    {fix.toolsRequired && fix.toolsRequired.length > 0 && (
      <div className="mt-2">
        <p className="text-xs font-semibold">Tools Required:</p>
        <ul className="list-disc list-inside text-xs ml-2">
          {fix.toolsRequired.map((tool, i) => <li key={i}>{tool}</li>)}
        </ul>
      </div>
    )}
  </div>
);

/**
 * Component to display QuantumPerformanceMetrics.
 */
export const PerformanceMetricsDisplay: React.FC<{ metrics: QuantumPerformanceMetrics }> = ({ metrics }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
    <h4 className="font-semibold text-lg mb-2">Performance Metrics</h4>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <p><strong>Qubits Analyzed:</strong> {metrics.totalQubitsAnalyzed}</p>
      <p><strong>Gates Analyzed:</strong> {metrics.totalGatesAnalyzed}</p>
      <p><strong>Analysis Duration:</strong> {metrics.analysisDurationMs} ms</p>
      <p><strong>Avg Qubit Fidelity:</strong> {(metrics.averageQubitFidelity * 100).toFixed(2)}%</p>
      <p><strong>Avg Gate Fidelity:</strong> {(metrics.averageGateFidelity[QuantumGateType.CNOT] * 100).toFixed(2)}% (CNOT)</p>
      <p><strong>Measurement Fidelity:</strong> {(metrics.measurementFidelity * 100).toFixed(2)}%</p>
      <p><strong>Readout Error Rate:</strong> {(metrics.readoutErrorRate * 100).toFixed(2)}%</p>
    </div>
    <div className="mt-3">
      <p className="font-semibold text-sm mb-1">Coherence Times (T1/T2 in µs):</p>
      <div className="grid grid-cols-3 gap-1 text-xs ml-2">
        {Object.entries(metrics.coherenceTimes.t1).map(([qubit, t1Val]) => (
          <p key={qubit}><strong>{qubit}:</strong> T1={t1Val} / T2={metrics.coherenceTimes.t2[qubit]} {metrics.coherenceTimes.t2Echo?.[qubit] ? `(T2e=${metrics.coherenceTimes.t2Echo[qubit]})` : ''}</p>
        ))}
      </div>
    </div>
    {metrics.qubitTemperatures && (
      <div className="mt-3">
        <p className="font-semibold text-sm mb-1">Qubit Temperatures (mK):</p>
        <div className="grid grid-cols-3 gap-1 text-xs ml-2">
          {Object.entries(metrics.qubitTemperatures).map(([qubit, temp]) => (
            <p key={qubit}><strong>{qubit}:</strong> {temp} mK</p>
          ))}
        </div>
      </div>
    )}
  </div>
);

/**
 * Component to display EntanglementAnalysisResult.
 */
export const EntanglementAnalysisDisplay: React.FC<{ result: EntanglementAnalysisResult }> = ({ result }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
    <h4 className="font-semibold text-lg mb-2">Entanglement Analysis</h4>
    {result.entangledPairs.length === 0 && <p className="text-sm">No significant entanglement detected above threshold.</p>}
    {result.entangledPairs.map((pair, idx) => (
      <div key={idx} className="mb-2 p-2 bg-gray-600 rounded-md">
        <p className="text-sm"><strong>Pair:</strong> {pair.qubits[0]} & {pair.qubits[1]}</p>
        <p className="text-xs ml-2"><strong>Concurrence:</strong> {pair.concurrence.toFixed(3)}</p>
        {pair.fidelityToBellState && <p className="text-xs ml-2"><strong>Bell State Fidelity:</strong> {(pair.fidelityToBellState * 100).toFixed(1)}%</p>}
        {pair.bellInequalityViolation && (
          <p className="text-xs ml-2"><strong>CHSH Value:</strong> {pair.bellInequalityViolation.chshValue.toFixed(3)} (Max Theo: {pair.bellInequalityViolation.maxTheoretical.toFixed(3)}) - <span className={pair.bellInequalityViolation.isViolated ? 'text-green-400' : 'text-red-400'}>{pair.bellInequalityViolation.isViolated ? 'Violation Detected' : 'No Violation'}</span></p>
        )}
      </div>
    ))}
    {result.entanglementDiagramData && (
      <div className="mt-3">
        <p className="font-semibold text-sm mb-1">Entanglement Graph (Simplified):</p>
        {/* In a real app, this would be an SVG/Canvas rendering of nodes and edges */}
        <div className="bg-gray-800 p-2 rounded-sm text-xs text-gray-400 font-mono">
          <p>Nodes: {result.entanglementDiagramData.nodes.map(n => n.id).join(', ')}</p>
          <p>Edges: {result.entanglementDiagramData.edges.map(e => `${e.source}-${e.target} (${e.strength.toFixed(2)})`).join(', ')}</p>
          <p className="italic">Graphical representation coming soon...</p>
        </div>
      </div>
    )}
  </div>
);

/**
 * Component to display DecoherenceProfile.
 */
export const DecoherenceProfileDisplay: React.FC<{ profile: DecoherenceProfile }> = ({ profile }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
    <h4 className="font-semibold text-lg mb-2">Decoherence Profile</h4>
    <p className="text-sm"><strong>Simulation Duration:</strong> {profile.simulationDurationMs} ms</p>
    <div className="mt-3">
      <p className="font-semibold text-sm mb-1">Environmental Noise Levels (Last Hour):</p>
      {profile.environmentalNoiseLevels.map((noise, idx) => (
        <div key={idx} className="text-xs p-1 ml-2 border-b border-gray-600 last:border-b-0">
          <p><strong>{new Date(noise.timestamp).toLocaleTimeString()}:</strong> Temp={noise.temperature}mK, MagField={noise.magneticFieldFluctuation}nT, Vib={noise.vibrationAmplitude}nm</p>
        </div>
      ))}
    </div>
    <div className="mt-3">
      <p className="font-semibold text-sm mb-1">Qubit Decay Curves (Simplified):</p>
      {profile.qubitProfiles.slice(0, 3).map((qProfile, idx) => ( // Show first 3 for brevity
        <div key={idx} className="p-2 bg-gray-600 rounded-md mb-2">
          <p className="text-sm font-medium">{qProfile.qubitId}</p>
          <p className="text-xs ml-2">T1 Decay (last point): Pop1={qProfile.t1DecayCurve[qProfile.t1DecayCurve.length - 1].populationOne.toFixed(3)}</p>
          <p className="text-xs ml-2">T2 Decay (last point): Fidelity={qProfile.t2DecayCurve[qProfile.t2DecayCurve.length - 1].fidelity.toFixed(3)}</p>
          <p className="text-xs ml-2">Phase Error (last point): Rate={qProfile.phaseErrorRateOverTime[qProfile.phaseErrorRateOverTime.length - 1].rate.toFixed(4)}</p>
          <p className="text-xs italic ml-2">Full curves available in detailed view...</p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Component to display FaultToleranceEstimate.
 */
export const FaultToleranceEstimateDisplay: React.FC<{ estimate: FaultToleranceEstimate }> = ({ estimate }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
    <h4 className="font-semibold text-lg mb-2">Fault Tolerance Estimate</h4>
    <p className="text-sm"><strong>Code Used:</strong> {estimate.errorCorrectionCodeUsed || 'N/A'}</p>
    <p className="text-sm"><strong>Logical Qubits:</strong> {estimate.logicalQubitsSupported}</p>
    <p className="text-sm"><strong>Physical Qubits / Logical:</strong> {estimate.physicalQubitsRequired}</p>
    <p className="text-sm"><strong>Threshold Error Rate:</strong> {estimate.thresholdErrorRate.toExponential(2)}</p>
    <p className="text-sm"><strong>Current Effective Rate:</strong> {estimate.currentEffectiveErrorRate.toExponential(2)}</p>
    <p className="text-sm">
      <strong>Status:</strong>{' '}
      <span className={estimate.isAboveThreshold ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
        {estimate.isAboveThreshold ? 'ABOVE THRESHOLD (CRITICAL)' : 'Below Threshold (Nominal)'}
      </span>
    </p>
    <div className="mt-2">
      <p className="text-xs font-semibold">Recommendations:</p>
      <ul className="list-disc list-inside text-xs ml-2">
        {estimate.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
      </ul>
    </div>
  </div>
);

/**
 * Component to display ResourceEstimate.
 */
export const ResourceEstimateDisplay: React.FC<{ estimate: ResourceEstimate }> = ({ estimate }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
    <h4 className="font-semibold text-lg mb-2">Resource Estimate</h4>
    <p className="text-sm"><strong>Logical Qubits:</strong> {estimate.estimatedLogicalQubits}</p>
    <p className="text-sm"><strong>Physical Qubits:</strong> {estimate.estimatedPhysicalQubits}</p>
    <p className="text-sm"><strong>Circuit Depth:</strong> {estimate.estimatedCircuitDepth}</p>
    <p className="text-sm"><strong>Estimated Runtime:</strong> {(estimate.estimatedRuntimeMs / 1000).toFixed(1)} s</p>
    <p className="text-sm"><strong>Cryogenic Power:</strong> {estimate.estimatedCryogenicPowerW.toFixed(1)} W</p>
    <p className="text-sm"><strong>Dominant Constraint:</strong> {estimate.dominantResourceConstraint}</p>
    <div className="mt-2">
      <p className="text-xs font-semibold">Optimization Suggestions:</p>
      <ul className="list-disc list-inside text-xs ml-2">
        {estimate.optimizationSuggestions.map((sug, i) => <li key={i}>{sug}</li>)}
      </ul>
    </div>
  </div>
);

/**
 * Component to display a simplified CircuitDiagram.
 */
export const CircuitDiagramDisplay: React.FC<{ circuit: CircuitDiagramData }> = ({ circuit }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
    <h4 className="font-semibold text-lg mb-2">Circuit Diagram (Simplified)</h4>
    <p className="text-sm"><strong>Qubits:</strong> {circuit.numQubits}, <strong>Classical Bits:</strong> {circuit.numClassicalBits}</p>
    <div className="bg-gray-800 p-2 rounded-sm font-mono text-xs overflow-x-auto">
      {/* This is a text-based representation, a real one would be SVG/Canvas */}
      {Array.from({ length: circuit.numQubits }, (_, qIdx) => (
        <div key={`qline-${qIdx}`} className="whitespace-nowrap mb-1">
          <span className="inline-block w-12 text-right text-cyan-400">q[{qIdx}]: </span>
          {circuit.circuitLayers.map((layer, lIdx) => (
            <span key={`${qIdx}-${lIdx}`} className="inline-block relative h-6 w-12 text-center">
              {layer.type === 'barrier' && <span className="absolute left-1/2 top-0 transform -translate-x-1/2 h-full w-px bg-gray-500"></span>}
              {layer.gates.map((gate, gIdx) => (
                gate.targetQubits.includes(qIdx) && (
                  <span key={`${lIdx}-${gIdx}`}
                        title={`${gate.type} (Fidelity: ${(gate.fidelity || 1).toFixed(3)})`}
                        className={`inline-block px-1 py-0.5 rounded ${gate.type === QuantumGateType.MEASURE ? 'bg-orange-600' : gate.controlQubits?.includes(qIdx) ? 'bg-indigo-600' : 'bg-blue-600'} text-white text-center text-xs mr-1`}
                        style={{ position: 'relative', top: '2px' }}
                  >
                    {gate.type.substring(0, 3)}{gate.targetQubits.length > 1 ? '+' : ''}
                    {gate.errorProbability && gate.errorProbability > 0.001 && <span className="absolute top-0 right-0 text-red-300 text-xxs leading-none">*</span>}
                  </span>
                )
              ))}
            </span>
          ))}
        </div>
      ))}
      <p className="mt-2 italic text-gray-400">Visualization represents gate operations across qubits and layers.</p>
    </div>
  </div>
);

/**
 * Component to display ErrorHeatmapData.
 */
export const ErrorHeatmapDisplay: React.FC<{ heatmap: ErrorHeatmapData }> = ({ heatmap }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
    <h4 className="font-semibold text-lg mb-2">{heatmap.title}</h4>
    <p className="text-sm"><strong>X-Axis:</strong> {heatmap.xAxisLabel}, <strong>Y-Axis:</strong> {heatmap.yAxisLabel}</p>
    <div className="bg-gray-800 p-2 rounded-sm mt-2 text-xs font-mono overflow-x-auto">
      {/* Simplified text grid representation. Real app would use D3/Canvas. */}
      <div className="flex">
        <div className="w-16 flex-shrink-0"></div> {/* Corner for Y-axis label */}
        {heatmap.dataPoints.filter((dp, i, self) => i === self.findIndex(d => d.xLabel === dp.xLabel))
          .map((dp, i) => (
            <div key={i} className="w-10 text-center text-gray-400 rotate-90 origin-bottom-left whitespace-nowrap -translate-x-1/2 translate-y-12 ml-4 mr-4">
              {dp.xLabel}
            </div>
          ))}
      </div>
      {heatmap.dataPoints.filter((dp, i, self) => i === self.findIndex(d => d.yLabel === dp.yLabel))
        .map((dpY, yIdx) => (
          <div key={`row-${yIdx}`} className="flex items-center">
            <div className="w-16 text-right pr-2 text-gray-400 flex-shrink-0">{dpY.yLabel}</div>
            {heatmap.dataPoints.filter(dpX => dpX.yLabel === dpY.yLabel).map((dp, xIdx) => {
              const hue = (1 - (dp.value - heatmap.minValue) / (heatmap.maxValue - heatmap.minValue)) * 240; // Green to Red
              const bgColor = `hsl(${hue}, 80%, 40%)`; // Dynamic color based on value
              return (
                <div key={`${yIdx}-${xIdx}`}
                     className="w-10 h-10 flex items-center justify-center text-white text-xxs font-bold border border-gray-700 mx-px my-px"
                     style={{ backgroundColor: bgColor }}
                     title={dp.details}
                >
                  {(dp.value * 100).toFixed(1)}%
                </div>
              );
            })}
          </div>
        ))}
      <p className="mt-2 italic text-gray-400">Heatmap shows error values; darker colors indicate higher error (scaled from min to max).</p>
    </div>
  </div>
);

/**
 * Component to display DebugLogEntry.
 */
export const DebugLogDisplay: React.FC<{ logs: DebugLogEntry[] }> = ({ logs }) => (
  <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600 max-h-96 overflow-y-auto">
    <h4 className="font-semibold text-lg mb-2">Analysis Logs</h4>
    {logs.map((log, idx) => (
      <div key={idx} className="mb-1 text-xs font-mono border-b border-gray-600 last:border-b-0 py-1">
        <span className={`font-bold mr-2 ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-gray-400'}`}>
          [{log.level}]
        </span>
        <span className="text-gray-500 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
        <span className="text-white">{log.message}</span>
        {log.details && <pre className="ml-8 text-gray-400 bg-gray-800 p-1 rounded-sm mt-1 overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>}
      </div>
    ))}
  </div>
);

/**
 * Component for displaying and managing Debugger Configuration.
 */
export const DebuggerConfigPanel: React.FC<{ config: DebuggerConfig; onConfigChange: (newConfig: DebuggerConfig) => void }> = ({ config, onConfigChange }) => {
  const handleChange = (key: keyof DebuggerConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="p-4 bg-gray-700 rounded-md mb-3 border border-gray-600">
      <h4 className="text-xl font-semibold mb-3">Debugger Configuration</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Preferred Simulator</label>
          <select
            value={config.preferredSimulator}
            onChange={(e) => handleChange('preferredSimulator', e.target.value as 'qiskit' | 'cirq' | 'custom_backend_A')}
            className="w-full p-2 bg-gray-600 rounded text-sm"
          >
            <option value="qiskit">Qiskit Aer</option>
            <option value="cirq">Cirq Simulator</option>
            <option value="custom_backend_A">Custom Backend A</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Noise Model Enabled</label>
          <input
            type="checkbox"
            checked={config.noiseModelEnabled}
            onChange={(e) => handleChange('noiseModelEnabled', e.target.checked)}
            className="mt-2 h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Entanglement Threshold (Concurrence)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={config.entanglementThreshold}
            onChange={(e) => handleChange('entanglementThreshold', parseFloat(e.target.value))}
            className="w-full p-2 bg-gray-600 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Minimum Reporting Severity</label>
          <select
            value={config.reportingLevel}
            onChange={(e) => handleChange('reportingLevel', e.target.value as IssueSeverity)}
            className="w-full p-2 bg-gray-600 rounded text-sm"
          >
            {Object.values(IssueSeverity).map(sev => <option key={sev} value={sev}>{sev}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data Retention (Days)</label>
          <input
            type="number"
            min="7"
            max="365"
            value={config.dataRetentionDays}
            onChange={(e) => handleChange('dataRetentionDays', parseInt(e.target.value, 10))}
            className="w-full p-2 bg-gray-600 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Developer Mode</label>
          <input
            type="checkbox"
            checked={config.developerMode}
            onChange={(e) => handleChange('developerMode', e.target.checked)}
            className="mt-2 h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
          />
        </div>
        {config.noiseModelEnabled && (
          <div className="col-span-1 md:col-span-2 mt-4 p-3 bg-gray-600 rounded-md">
            <h5 className="font-semibold text-md mb-2">Noise Model Parameters</h5>
            {Object.entries(config.noiseModelParameters).map(([key, value]) => (
              <div key={key} className="flex items-center mb-2">
                <label className="w-1/3 text-sm">{key}:</label>
                <input
                  type="text" // Using text to handle various types in mock
                  value={String(value)}
                  onChange={(e) => {
                    const newParams = { ...config.noiseModelParameters, [key]: e.target.value };
                    handleChange('noiseModelParameters', newParams);
                  }}
                  className="w-2/3 p-1 bg-gray-500 rounded text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// --- MAIN COMPONENT (Vastly Expanded) ---

const QuantumEntanglementDebuggerView: React.FC = () => {
  // --- Original State (Expanded) ---
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugReport, setDebugReport] = useState<DebuggingReport | null>(null);

  // --- New State Variables for Enhanced Functionality ---
  const [selectedInputFormat, setSelectedInputFormat] = useState<QuantumInputFormat>(QuantumInputFormat.QASM);
  const [selectedAnalysisMode, setSelectedAnalysisMode] = useState<AnalysisMode>(AnalysisMode.DYNAMIC_DECOHERENCE_SIMULATION);
  const [qubitCountInput, setQubitCountInput] = useState<number>(5); // For mocking
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessionHistory, setSessionHistory] = useState<DebugSessionHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>('input'); // 'input', 'history', 'settings', 'results'
  const [resultsSubTab, setResultsSubTab] = useState<string>('summary'); // 'summary', 'errors', 'fixes', 'metrics', 'entanglement', 'decoherence', 'fault_tolerance', 'resources', 'circuit', 'heatmap', 'logs'

  const [debuggerConfig, setDebuggerConfig] = useState<DebuggerConfig>(generateMockDebuggerConfig());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Initial Setup and History Loading (Mock) ---
  useEffect(() => {
    // Mock loading history from local storage or an API
    const mockHistory = Array.from({ length: 10 }, (_, i) => generateMockHistoryEntry(i)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setSessionHistory(mockHistory);

    // Mock loading config
    setDebuggerConfig(generateMockDebuggerConfig());
  }, []);

  // --- Handlers for User Interactions ---

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadFile(file);
      // Read file content for display in textarea if applicable
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setInputCode(e.target.result);
        }
      };
      reader.readAsText(file);
      setErrorMessage(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setInputCode('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input value
    }
  };

  const handleDebug = useCallback(async () => {
    setIsLoading(true);
    setDebugReport(null);
    setErrorMessage(null);
    setResultsSubTab('summary'); // Reset sub-tab on new analysis

    // --- Input Validation (Expanded Mock) ---
    if (!inputCode && !uploadFile) {
      setErrorMessage("Please provide quantum input code or upload a file.");
      setIsLoading(false);
      return;
    }

    if (inputCode.length < 50 && selectedInputFormat !== QuantumInputFormat.MEASUREMENT_RESULTS_JSON) {
      // Very basic mock check for "meaningful" input
      setErrorMessage("Input code seems too short for a complex quantum circuit/state. Please provide more detailed input.");
      setIsLoading(false);
      return;
    }

    // Simulate complex parsing and API calls
    try {
      // MOCK API: Simulate various stages of complex quantum debugging
      await new Promise(res => setTimeout(res, 500)); // Simulate initial processing
      console.log(`Starting analysis with format: ${selectedInputFormat}, mode: ${selectedAnalysisMode}`);

      // Step 1: Input ingestion and basic validation
      setDebugReport((prev) => ({
        ...prev,
        logs: [...(prev?.logs || []), { timestamp: new Date().toISOString(), level: 'INFO', message: `Input ingestion for ${selectedInputFormat} started.` }]
      } as DebuggingReport));
      await new Promise(res => setTimeout(res, 700));

      // Step 2: Quantum circuit/state parsing and preliminary analysis
      setDebugReport((prev) => ({
        ...prev,
        logs: [...(prev?.logs || []), { timestamp: new Date().toISOString(), level: 'INFO', message: 'Parsing quantum data and identifying circuit topology.' }]
      } as DebuggingReport));
      await new Promise(res => setTimeout(res, 1000));

      if (Math.random() < 0.1 && debuggerConfig.developerMode) { // Simulate a parsing error occasionally
        throw new Error("Simulated QASM parsing error: unexpected token on line 42.");
      }

      // Step 3: Running selected analysis mode (e.g., decoherence simulation, fault tolerance)
      setDebugReport((prev) => ({
        ...prev,
        logs: [...(prev?.logs || []), { timestamp: new Date().toISOString(), level: 'INFO', message: `Executing ${selectedAnalysisMode} simulation.` }]
      } as DebuggingReport));
      await new Promise(res => setTimeout(res, 2000));

      // Step 4: Data interpretation and error identification
      setDebugReport((prev) => ({
        ...prev,
        logs: [...(prev?.logs || []), { timestamp: new Date().toISOString(), level: 'INFO', message: 'Interpreting simulation results and identifying potential errors.' }]
      } as DebuggingReport));
      await new Promise(res => setTimeout(res, 1500));

      // Step 5: Generating comprehensive report
      const response: DebuggingReport = await new Promise(res => setTimeout(() => res(
        generateMockDebuggingReport(qubitCountInput, selectedAnalysisMode)
      ), 3000)); // Simulate long computation for report generation

      setDebugReport(response);

      // Add to session history
      const newHistoryEntry: DebugSessionHistoryEntry = {
        sessionId: response.reportId,
        timestamp: response.timestamp,
        inputSummary: `${selectedInputFormat} (${qubitCountInput} qubits)`,
        analysisMode: selectedAnalysisMode,
        overallStatus: response.overallStatus,
        mostLikelyErrorSource: response.identifiedErrors[0]?.description || "No critical errors found.",
        confidence: response.identifiedErrors[0]?.confidence || 1.0,
        viewed: true,
      };
      setSessionHistory((prev) => [newHistoryEntry, ...prev].slice(0, 50)); // Keep last 50 sessions

      // Update the legacy `result` for the old display, if needed. This will be deprecated.
      const legacyResult: DebugResponse = {
        mostLikelyErrorSource: response.identifiedErrors[0]?.description || "No critical errors found.",
        confidence: response.identifiedErrors[0]?.confidence || 1.0,
        suggestedFix: response.suggestedFixes[0]?.description || "No specific fix needed.",
      };
      // For backwards compatibility with the original component structure
      // setOutputState(JSON.stringify(response, null, 2)); // Or some other summarized output
      // setResult(legacyResult); // Keeping this here to satisfy existing structure

    } catch (err: any) {
      console.error("Debugging failed:", err);
      setErrorMessage(`Analysis Failed: ${err.message || 'Unknown error.'}`);
      setDebugReport((prev) => ({
        ...prev,
        overallStatus: 'Failure',
        summary: `Analysis failed due to error: ${err.message}`,
        logs: [...(prev?.logs || []), { timestamp: new Date().toISOString(), level: 'ERROR', message: `Analysis failed: ${err.message}` }]
      } as DebuggingReport));
    } finally {
      setIsLoading(false);
      setActiveTab('results'); // Switch to results tab automatically
    }
  }, [inputCode, uploadFile, selectedInputFormat, selectedAnalysisMode, qubitCountInput, debuggerConfig.developerMode]);

  const handleLoadHistorySession = useCallback((sessionId: string) => {
    setIsLoading(true);
    // In a real app, this would fetch the full report from a backend.
    // For mock, we'll re-generate or find a matching mock report.
    const historyEntry = sessionHistory.find(s => s.sessionId === sessionId);
    if (historyEntry) {
      setDebugReport(generateMockDebuggingReport(Math.floor(Math.random() * 8) + 3, historyEntry.analysisMode)); // Regenerate with random qubits
      setSessionHistory(prev => prev.map(s => s.sessionId === sessionId ? { ...s, viewed: true } : s));
      setActiveTab('results');
    } else {
      setErrorMessage("Could not load session history. It might have expired or been deleted.");
    }
    setIsLoading(false);
  }, [sessionHistory]);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all session history?")) {
      setSessionHistory([]);
    }
  };

  const handleConfigChange = useCallback((newConfig: DebuggerConfig) => {
    setDebuggerConfig(newConfig);
    // In a real app, this would persist the config to backend/local storage
    console.log("Debugger configuration updated:", newConfig);
  }, []);


  // --- Render Logic (Highly detailed and structured) ---

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl min-h-screen flex flex-col">
      <h1 className="text-3xl font-extrabold mb-6 text-cyan-400">Quantum Entanglement Debugger (v2.0)</h1>

      {/* Main Navigation Tabs */}
      <div className="mb-6 border-b border-gray-600">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('input')}
            className={`${activeTab === 'input' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            aria-current={activeTab === 'input' ? 'page' : undefined}
          >
            Input & Analysis
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`${activeTab === 'results' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            aria-current={activeTab === 'results' ? 'page' : undefined}
            disabled={!debugReport && !isLoading}
          >
            Results
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${activeTab === 'history' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            Session History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`${activeTab === 'settings' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            aria-current={activeTab === 'settings' ? 'page' : undefined}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-900 text-red-200 p-3 rounded-md mb-4 flex items-center justify-between">
          <p className="font-medium text-sm">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="text-red-200 hover:text-white ml-4">
            &times;
          </button>
        </div>
      )}

      {/* Input & Analysis Tab Content */}
      {activeTab === 'input' && (
        <div className="flex-grow">
          <h2 className="text-xl font-bold mb-4">Provide Quantum Data & Configure Analysis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="inputFormat" className="block text-sm font-medium text-gray-300 mb-1">
                Input Data Format
              </label>
              <select
                id="inputFormat"
                value={selectedInputFormat}
                onChange={(e) => setSelectedInputFormat(e.target.value as QuantumInputFormat)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                {Object.values(QuantumInputFormat).map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="analysisMode" className="block text-sm font-medium text-gray-300 mb-1">
                Analysis Mode
              </label>
              <select
                id="analysisMode"
                value={selectedAnalysisMode}
                onChange={(e) => setSelectedAnalysisMode(e.target.value as AnalysisMode)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                {Object.values(AnalysisMode).map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="qubitCount" className="block text-sm font-medium text-gray-300 mb-1">
                Number of Qubits (for mock data generation)
              </label>
              <input
                id="qubitCount"
                type="number"
                min="2"
                max="100"
                value={qubitCountInput}
                onChange={(e) => setQubitCountInput(parseInt(e.target.value, 10))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <label htmlFor="quantumInput" className="block text-sm font-medium text-gray-300 mb-2">
            Quantum Input Data (Paste or Upload)
          </label>
          <textarea
            id="quantumInput"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            placeholder={`Paste your ${selectedInputFormat} here, or upload a file...`}
            rows={15}
            className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded font-mono text-sm resize-y focus:ring-cyan-500 focus:border-cyan-500"
          />

          <div className="flex items-center space-x-4 mb-6">
            <label className="w-1/2 md:w-1/4 flex items-center justify-center px-4 py-2 bg-gray-700 text-cyan-400 border border-cyan-400 rounded-md cursor-pointer hover:bg-gray-600 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Upload File
              <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            {uploadFile && (
              <div className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-700 p-2 rounded-md">
                <span>{uploadFile.name}</span>
                <button onClick={handleRemoveFile} className="text-red-400 hover:text-red-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleDebug}
            disabled={isLoading}
            className="w-full p-3 bg-cyan-600 text-white rounded-lg font-bold text-lg hover:bg-cyan-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing Quantum State...' : 'Start Quantum Debugging'}
          </button>
          {isLoading && debugReport?.logs && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Current Analysis Progress:</h3>
              <DebugLogDisplay logs={debugReport.logs.slice(-5)} /> {/* Show last 5 logs */}
            </div>
          )}
        </div>
      )}

      {/* Results Tab Content */}
      {activeTab === 'results' && (
        <div className="flex-grow">
          {isLoading && <p className="mt-4 text-center text-xl text-gray-400">Running advanced quantum simulations and analytics...</p>}
          {!isLoading && !debugReport && <p className="mt-4 text-center text-xl text-gray-400">No results to display. Please run a debug session.</p>}

          {!isLoading && debugReport && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-cyan-300">Debugging Report - Session ID: {debugReport.reportId}</h3>

              {/* Results Sub-Navigation Tabs */}
              <div className="mb-6 border-b border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Results Tabs">
                  <button onClick={() => setResultsSubTab('summary')} className={`${resultsSubTab === 'summary' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Summary</button>
                  <button onClick={() => setResultsSubTab('errors')} className={`${resultsSubTab === 'errors' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Errors ({debugReport.identifiedErrors.length})</button>
                  <button onClick={() => setResultsSubTab('fixes')} className={`${resultsSubTab === 'fixes' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Suggested Fixes ({debugReport.suggestedFixes.length})</button>
                  <button onClick={() => setResultsSubTab('metrics')} className={`${resultsSubTab === 'metrics' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Performance Metrics</button>
                  <button onClick={() => setResultsSubTab('entanglement')} className={`${resultsSubTab === 'entanglement' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Entanglement</button>
                  <button onClick={() => setResultsSubTab('decoherence')} className={`${resultsSubTab === 'decoherence' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Decoherence</button>
                  {debugReport.faultToleranceEstimate && <button onClick={() => setResultsSubTab('fault_tolerance')} className={`${resultsSubTab === 'fault_tolerance' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Fault Tolerance</button>}
                  {debugReport.resourceEstimate && <button onClick={() => setResultsSubTab('resources')} className={`${resultsSubTab === 'resources' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Resources</button>}
                  {debugReport.circuitDiagramData && <button onClick={() => setResultsSubTab('circuit')} className={`${resultsSubTab === 'circuit' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Circuit Diagram</button>}
                  {debugReport.errorHeatmapData && <button onClick={() => setResultsSubTab('heatmap')} className={`${resultsSubTab === 'heatmap' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Error Heatmap</button>}
                  <button onClick={() => setResultsSubTab('logs')} className={`${resultsSubTab === 'logs' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 text-sm`}>Logs ({debugReport.logs.length})</button>
                </nav>
              </div>

              {/* Render content based on resultsSubTab */}
              {resultsSubTab === 'summary' && (
                <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                  <p className="text-lg mb-2"><strong>Overall Status:</strong> <span className={debugReport.overallStatus === 'Success' ? 'text-green-400' : 'text-orange-400'}>{debugReport.overallStatus}</span></p>
                  <p className="text-md mb-2"><strong>Summary:</strong> {debugReport.summary}</p>
                  <p className="text-sm text-gray-400">Report Generated: {new Date(debugReport.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Analysis Mode: {debugReport.analysisMode}</p>
                  <h4 className="font-semibold text-lg mt-4 mb-2">Top Issues:</h4>
                  {debugReport.identifiedErrors.slice(0, 3).map((error, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="text-sm"><strong className="text-red-400">[{error.severity}]</strong> {error.description}</p>
                      <p className="text-xs ml-4 text-gray-400">Suggested: {debugReport.suggestedFixes.find(f => f.relatedErrors?.includes(error.id))?.description || 'N/A'}</p>
                    </div>
                  ))}
                  {debugReport.identifiedErrors.length === 0 && <p className="text-md text-green-400">No critical errors identified.</p>}
                </div>
              )}

              {resultsSubTab === 'errors' && (
                <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                  <h4 className="font-semibold text-lg mb-3">Identified Errors</h4>
                  {debugReport.identifiedErrors.length > 0 ? (
                    debugReport.identifiedErrors.map((error) => (
                      <ErrorSourceDisplay key={error.id} error={error} />
                    ))
                  ) : (
                    <p className="text-gray-400">No significant errors were identified in this analysis.</p>
                  )}
                </div>
              )}

              {resultsSubTab === 'fixes' && (
                <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                  <h4 className="font-semibold text-lg mb-3">Suggested Fixes</h4>
                  {debugReport.suggestedFixes.length > 0 ? (
                    debugReport.suggestedFixes.map((fix) => (
                      <SuggestedFixDisplay key={fix.fixId} fix={fix} />
                    ))
                  ) : (
                    <p className="text-gray-400">No specific fixes suggested at this time.</p>
                  )}
                </div>
              )}

              {resultsSubTab === 'metrics' && debugReport.performanceMetrics && (
                <PerformanceMetricsDisplay metrics={debugReport.performanceMetrics} />
              )}

              {resultsSubTab === 'entanglement' && debugReport.entanglementAnalysis && (
                <EntanglementAnalysisDisplay result={debugReport.entanglementAnalysis} />
              )}

              {resultsSubTab === 'decoherence' && debugReport.decoherenceProfile && (
                <DecoherenceProfileDisplay profile={debugReport.decoherenceProfile} />
              )}

              {resultsSubTab === 'fault_tolerance' && debugReport.faultToleranceEstimate && (
                <FaultToleranceEstimateDisplay estimate={debugReport.faultToleranceEstimate} />
              )}

              {resultsSubTab === 'resources' && debugReport.resourceEstimate && (
                <ResourceEstimateDisplay estimate={debugReport.resourceEstimate} />
              )}

              {resultsSubTab === 'circuit' && debugReport.circuitDiagramData && (
                <CircuitDiagramDisplay circuit={debugReport.circuitDiagramData} />
              )}

              {resultsSubTab === 'heatmap' && debugReport.errorHeatmapData && (
                <ErrorHeatmapDisplay heatmap={debugReport.errorHeatmapData} />
              )}

              {resultsSubTab === 'logs' && debugReport.logs && (
                <DebugLogDisplay logs={debugReport.logs} />
              )}

            </div>
          )}
        </div>
      )}

      {/* Session History Tab Content */}
      {activeTab === 'history' && (
        <div className="flex-grow">
          <h2 className="text-xl font-bold mb-4">Past Debugging Sessions</h2>
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 bg-red-700 text-white rounded-md text-sm hover:bg-red-800 transition-colors disabled:opacity-50"
              disabled={sessionHistory.length === 0}
            >
              Clear All History
            </button>
          </div>
          {sessionHistory.length === 0 ? (
            <p className="text-gray-400 text-center">No past sessions found. Run a debug session to see history here.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sessionHistory.map((session) => (
                <div key={session.sessionId} className={`p-4 bg-gray-700 rounded-lg shadow-md border ${session.viewed ? 'border-gray-600' : 'border-cyan-500'}`}>
                  <h4 className="font-semibold text-lg mb-1">{session.inputSummary} ({session.analysisMode})</h4>
                  <p className="text-sm text-gray-300">Run on: {new Date(session.timestamp).toLocaleString()}</p>
                  <p className="text-sm mt-1">
                    <strong>Status:</strong>{' '}
                    <span className={session.overallStatus === 'Success' ? 'text-green-400' : 'text-orange-400'}>{session.overallStatus}</span>
                  </p>
                  <p className="text-sm"><strong>Main Issue:</strong> {session.mostLikelyErrorSource} ({ (session.confidence * 100).toFixed(0)}% confidence)</p>
                  <button
                    onClick={() => handleLoadHistorySession(session.sessionId)}
                    className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm hover:bg-cyan-700 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="flex-grow">
          <DebuggerConfigPanel config={debuggerConfig} onConfigChange={handleConfigChange} />
          <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h4 className="text-xl font-semibold mb-3">API Integrations (Mock)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantum Hardware API Key</label>
                <input type="password" value="********************" readOnly className="w-full p-2 bg-gray-600 rounded text-sm text-gray-400" />
                <button className="mt-2 px-3 py-1 bg-gray-600 text-cyan-400 rounded-md text-xs hover:bg-gray-500">Manage Key</button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">External Data Source URL</label>
                <input type="text" value="https://api.quantumlab.com/telemetry" readOnly className="w-full p-2 bg-gray-600 rounded text-sm text-gray-400" />
                <button className="mt-2 px-3 py-1 bg-gray-600 text-cyan-400 rounded-md text-xs hover:bg-gray-500">Configure Source</button>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic mt-4">Note: Integrations are currently mocked for demonstration purposes.</p>
          </div>
        </div>
      )}

      {/* Global Debug Output (legacy placeholder for original component's state) */}
      {/* Keeping this part to potentially render the original `result` state for compatibility.
          In a full refactor, this would be removed or integrated into the new results view. */}
      {/* {result && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-xl font-semibold">Legacy Debugging Report</h3>
          <p className="mt-2"><strong>Most Likely Error:</strong> {result.mostLikelyErrorSource} (Confidence: {(result.confidence * 100).toFixed(0)}%)</p>
          <p className="mt-1"><strong>Suggested Fix:</strong> {result.suggestedFix}</p>
        </div>
      )} */}
    </div>
  );
};

export default QuantumEntanglementDebuggerView;