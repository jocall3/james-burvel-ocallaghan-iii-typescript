/**
 * This module implements the Multiverse Nexus Hub, a central command and control interface
 * for monitoring, managing, and interacting with interconnected realities within a multiversal
 * framework. It provides real-time oversight of reality shard stability, multiversal events,
 * and quantum signatures.
 *
 * Business Value: The Multiverse Nexus Hub is paramount for strategic enterprise growth and
 * operational resilience. It enables autonomous, AI-driven anomaly detection and remediation
 * across diverse computational or data environments, significantly reducing downtime and
 * operational costs. Its capacity for cross-reality resource balancing and simulated token
 * transfers lays the groundwork for unprecedented interdimensional economic models and
 * value exchange, unlocking vast new revenue streams and facilitating efficient,
 * high-throughput transactional guarantees across otherwise disparate systems.
 * The sophisticated monitoring and control mechanisms provide a competitive advantage
 * in managing complex, distributed, and highly dynamic digital ecosystems, ensuring
 * optimal performance, security, and governance for mission-critical operations.
 */
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import FeatureGuard from '../../../FeatureGuard';
import { View } from '../../../types';
import { DataContext } from '../../../context/DataContext';

interface RealityShard {
    id: string;
    name: string;
    status: 'Stable' | 'Volatile' | 'Anomaly Detected' | 'Dormant' | 'Initializing';
    dimension: string;
    populationEstimate: number;
    energySignature: string;
    temporalVariance: number;
    structuralIntegrity: number;
    anomalies: string[];
    lastObserved: string;
    activeMonitoringProtocols: string[];
    subRealms: SubRealm[];
}

interface SubRealm {
    id: string;
    name: string;
    threatLevel: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
    connectedEntities: number;
    resourceDrain: number; // Represents energy/resource consumption
}

interface MultiversalEvent {
    id: string;
    type: string;
    timestamp: string;
    description: string;
    severity: 'Minor' | 'Moderate' | 'Major' | 'Cataclysmic';
    affectedRealms: string[];
    resolutionStatus: 'Pending' | 'InProgress' | 'Resolved' | 'Failed';
}

interface QuantumSignature {
    id: string;
    emitterRealmId: string;
    signatureType: string;
    magnitude: number;
    frequency: number;
    decayRate: number;
}

interface NexusConfiguration {
    autoStabilizeAnomalies: boolean;
    priorityRealmFocus: string | null;
    notificationLevel: 'Minimal' | 'Standard' | 'Verbose';
    energyAllocationStrategy: 'Balanced' | 'Performance' | 'Conservation';
    crossRealityJumpsEnabled: boolean;
    agenticAutomationEnabled: boolean; // New config
}

// New Interfaces for Agentic AI and Token Rails
export interface NexusAgent {
    id: string;
    name: string;
    status: 'Idle' | 'Monitoring' | 'Executing Remediation' | 'Offline';
    assignedShardId: string | null;
    skills: string[];
    lastActivity: string;
    clearanceLevel: 'Standard' | 'Elevated' | 'Omega';
}

export interface MultiversalTokenAccount {
    realmId: string;
    balance: number;
    currencySymbol: string;
    lastUpdated: string;
}

export type InterdimensionalRouteIdentifier = 'QuantumTunnel_Fast' | 'GravitonChannel_Batch' | 'TemporalWarp_HighThroughput' | 'Standard_Relay';

export interface MultiversalTokenTransaction {
    id: string;
    senderRealmId: string;
    receiverRealmId: string;
    amount: number;
    currencySymbol: string;
    timestamp: string;
    status: 'Pending' | 'Completed' | 'Failed' | 'Reverted';
    route: InterdimensionalRouteIdentifier;
}

const generateRandomId = () => Math.random().toString(36).substring(2, 15);
const getRandomStatus = () => ['Stable', 'Volatile', 'Anomaly Detected', 'Dormant', 'Initializing'][Math.floor(Math.random() * 5)];
const getRandomDimension = () => `D-${Math.floor(Math.random() * 1000)}`;
const getRandomEnergySignature = () => `QS-${generateRandomId().toUpperCase()}`;
const getRandomThreatLevel = () => ['None', 'Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 5)];
const getRandomSeverity = () => ['Minor', 'Moderate', 'Major', 'Cataclysmic'][Math.floor(Math.random() * 4)];
const getRandomResolutionStatus = () => ['Pending', 'InProgress', 'Resolved', 'Failed'][Math.floor(Math.random() * 4)];
const getRandomNotificationLevel = () => ['Minimal', 'Standard', 'Verbose'][Math.floor(Math.random() * 3)];
const getRandomEnergyStrategy = () => ['Balanced', 'Performance', 'Conservation'][Math.floor(Math.random() * 3)];

export const generateSubRealm = (): SubRealm => ({
    id: generateRandomId(),
    name: `Sub-Realm ${Math.floor(Math.random() * 9999)}`,
    threatLevel: getRandomThreatLevel(),
    connectedEntities: Math.floor(Math.random() * 100000),
    resourceDrain: parseFloat((Math.random() * 1000).toFixed(2)),
});

export const generateRealityShard = (index: number): RealityShard => {
    const status = getRandomStatus();
    const anomalyCount = status === 'Anomaly Detected' ? Math.floor(Math.random() * 3) + 1 : 0;
    const anomalies = Array.from({ length: anomalyCount }, () => `Anomaly ${Math.floor(Math.random() * 1000)} detected`);
    const subRealmsCount = Math.floor(Math.random() * 5) + 1;
    const subRealms = Array.from({ length: subRealmsCount }, generateSubRealm);
    const structuralIntegrity = Math.floor(Math.random() * 100);

    return {
        id: generateRandomId(),
        name: `Reality Cluster ${index + 1} - ${getRandomDimension()}`,
        status: status,
        dimension: getRandomDimension(),
        populationEstimate: Math.floor(Math.random() * 1_000_000_000_000) + 1_000_000,
        energySignature: getRandomEnergySignature(),
        temporalVariance: parseFloat((Math.random() * 1000).toFixed(3)),
        structuralIntegrity: structuralIntegrity < 30 && status !== 'Stable' ? structuralIntegrity + 30 : structuralIntegrity, // Ensure some instability
        anomalies: anomalies,
        lastObserved: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        activeMonitoringProtocols: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => `Protocol Alpha-${i}`),
        subRealms: subRealms,
    };
};

export const generateRealityShards = (count: number): RealityShard[] => {
    return Array.from({ length: count }, (_, i) => generateRealityShard(i));
};

export const generateMultiversalEvent = (realms: RealityShard[]): MultiversalEvent => {
    const affectedCount = Math.floor(Math.random() * 3) + 1;
    const affectedRealms = Array.from({ length: affectedCount }, () => realms[Math.floor(Math.random() * realms.length)].id);
    return {
        id: generateRandomId(),
        type: ['Temporal Flux', 'Dimensional Incursion', 'Energy Cascade', 'Reality Drift', 'Cognitive Echo'][Math.floor(Math.random() * 5)],
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Description for a ${getRandomSeverity()} event.`,
        severity: getRandomSeverity(),
        affectedRealms: affectedRealms,
        resolutionStatus: getRandomResolutionStatus(),
    };
};

export const generateMultiversalEvents = (count: number, realms: RealityShard[]): MultiversalEvent[] => {
    return Array.from({ length: count }, () => generateMultiversalEvent(realms));
};

export const generateQuantumSignature = (realms: RealityShard[]): QuantumSignature => {
    const emitterRealm = realms[Math.floor(Math.random() * realms.length)];
    return {
        id: generateRandomId(),
        emitterRealmId: emitterRealm.id,
        signatureType: ['Gravitational Wave', 'Dark Matter Emission', 'Temporal Echo', 'Psionic Resonance', 'Exotic Particle Flux'][Math.floor(Math.random() * 5)],
        magnitude: parseFloat((Math.random() * 10000).toFixed(2)),
        frequency: parseFloat((Math.random() * 500).toFixed(3)),
        decayRate: parseFloat((Math.random() * 0.5).toFixed(4)),
    };
};

export const generateQuantumSignatures = (count: number, realms: RealityShard[]): QuantumSignature[] => {
    return Array.from({ length: count }, () => generateQuantumSignature(realms));
};

// New helper functions for Agents and Tokens
export const generateNexusAgent = (id: number, realms: RealityShard[]): NexusAgent => {
    const randomShard = realms.length > 0 ? realms[Math.floor(Math.random() * realms.length)] : null;
    const skills = ['Anomaly Detection', 'Temporal Stabilization', 'Resource Rebalancing', 'Diplomacy', 'Quantum Signature Analysis'];
    return {
        id: `AGENT-${generateRandomId().substring(0, 8).toUpperCase()}`,
        name: `Sentinel-AI-${id}`,
        status: Math.random() < 0.7 ? 'Monitoring' : 'Idle',
        assignedShardId: randomShard ? randomShard.id : null,
        skills: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => skills[Math.floor(Math.random() * skills.length)]),
        lastActivity: new Date(Date.now() - Math.random() * 5 * 60 * 1000).toISOString(),
        clearanceLevel: Math.random() < 0.1 ? 'Omega' : Math.random() < 0.4 ? 'Elevated' : 'Standard',
    };
};

export const generateInterdimensionalRoute = (): InterdimensionalRouteIdentifier => {
    const routes: InterdimensionalRouteIdentifier[] = ['QuantumTunnel_Fast', 'GravitonChannel_Batch', 'TemporalWarp_HighThroughput', 'Standard_Relay'];
    return routes[Math.floor(Math.random() * routes.length)];
};


interface MultiverseNexusViewProps {
    openModal?: (view: View) => void;
}

const MultiverseNexusView: React.FC<MultiverseNexusViewProps> = ({ openModal }) => {
    const { userPreferences, updatePreferences, currentTheme, setGlobalAlert } = useContext(DataContext);

    const [realityShards, setRealityShards] = useState<RealityShard[]>([]);
    const [multiversalEvents, setMultiversalEvents] = useState<MultiversalEvent[]>([]);
    const [quantumSignatures, setQuantumSignatures] = useState<QuantumSignature[]>([]);
    const [activeTab, setActiveTab] = useState<'realms' | 'events' | 'signatures' | 'config' | 'agents' | 'economy'>('realms');
    const [selectedShardId, setSelectedShardId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loadingNexusData, setLoadingNexusData] = useState<boolean>(true);
    const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
    const [nexusConfiguration, setNexusConfiguration] = useState<NexusConfiguration>(() => ({
        autoStabilizeAnomalies: userPreferences?.multiverse?.autoStabilizeAnomalies ?? false,
        priorityRealmFocus: userPreferences?.multiverse?.priorityRealmFocus ?? null,
        notificationLevel: userPreferences?.multiverse?.notificationLevel ?? 'Standard',
        energyAllocationStrategy: userPreferences?.multiverse?.energyAllocationStrategy ?? 'Balanced',
        crossRealityJumpsEnabled: userPreferences?.multiverse?.crossRealityJumpsEnabled ?? true,
        agenticAutomationEnabled: userPreferences?.multiverse?.agenticAutomationEnabled ?? true, // New config state
    }));
    const [recentAlerts, setRecentAlerts] = useState<string[]>([]);
    const [systemHealthIndex, setSystemHealthIndex] = useState<number>(100);

    // New states for Agentic AI and Token Rails
    export const [nexusAgents, setNexusAgents] = useState<NexusAgent[]>([]);
    export const [multiversalTokenLedger, setMultiversalTokenLedger] = useState<Record<string, MultiversalTokenAccount>>({});
    export const [nexusTokenTransactions, setNexusTokenTransactions] = useState<MultiversalTokenTransaction[]>([]);
    export const [operatorClearance, setOperatorClearance] = useState<'Standard' | 'Elevated' | 'Omega'>('Standard'); // Simulated identity context


    useEffect(() => {
        setLoadingNexusData(true);
        setErrorLoadingData(null);
        const timer = setTimeout(() => {
            try {
                const initialShards = generateRealityShards(50);
                setRealityShards(initialShards);
                setMultiversalEvents(generateMultiversalEvents(20, initialShards));
                setQuantumSignatures(generateQuantumSignatures(30, initialShards));
                setSystemHealthIndex(Math.floor(Math.random() * 20) + 80);

                // Initialize Nexus Agents
                const initialAgents = Array.from({ length: 5 }, (_, i) => generateNexusAgent(i, initialShards));
                setNexusAgents(initialAgents);

                // Initialize Token Ledger for each shard
                const initialLedger: Record<string, MultiversalTokenAccount> = {};
                initialShards.forEach(shard => {
                    initialLedger[shard.id] = {
                        realmId: shard.id,
                        balance: parseFloat((Math.random() * 1000000).toFixed(2)), // Random initial balance (Quantum Credits)
                        currencySymbol: 'QCR',
                        lastUpdated: new Date().toISOString(),
                    };
                });
                setMultiversalTokenLedger(initialLedger);

                // Simulate user role from preferences for operator clearance
                setOperatorClearance(userPreferences?.user?.role === 'admin' ? 'Omega' : userPreferences?.user?.role === 'operator' ? 'Elevated' : 'Standard');

            } catch (err) {
                setErrorLoadingData("Failed to load initial multiversal data.");
                setGlobalAlert && setGlobalAlert({ message: "Multiverse Nexus data initialization failed.", type: "error" });
            } finally {
                setLoadingNexusData(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [setGlobalAlert, userPreferences]); // Added userPreferences to dependency array

    useEffect(() => {
        const simulationInterval = setInterval(() => {
            // Existing anomaly generation
            setRealityShards(prevShards => prevShards.map(shard => {
                if (Math.random() < 0.05 && shard.status === 'Stable') {
                    return {
                        ...shard,
                        status: 'Anomaly Detected',
                        anomalies: [...shard.anomalies, `Spontaneous Singularity Flux ${Math.floor(Math.random() * 999)}`],
                        structuralIntegrity: Math.max(0, shard.structuralIntegrity - Math.floor(Math.random() * 15)),
                    };
                }
                return shard;
            }));

            // Auto-stabilize Anomalies (can be done by Nexus itself or agents if automation is on)
            setRealityShards(prevShards => {
                let updated = false;
                const newShards = prevShards.map(shard => {
                    if (shard.status === 'Anomaly Detected' && shard.anomalies.length > 0) {
                        if (nexusConfiguration.autoStabilizeAnomalies) {
                            updated = true;
                            setRecentAlerts(prev => [`Automated stabilization initiated for ${shard.name} at ${new Date().toLocaleTimeString()}`, ...prev.slice(0, 4)]);
                            return {
                                ...shard,
                                status: 'Stable',
                                anomalies: [],
                                structuralIntegrity: Math.min(100, shard.structuralIntegrity + Math.floor(Math.random() * 10)),
                            };
                        } else if (nexusConfiguration.agenticAutomationEnabled) {
                            // If auto-stabilize is off but agentic automation is on, agents might pick it up
                            const activeAgent = nexusAgents.find(agent =>
                                agent.assignedShardId === shard.id &&
                                agent.status === 'Monitoring' &&
                                agent.skills.includes('Temporal Stabilization')
                            );
                            if (activeAgent && Math.random() < 0.8) { // Simulate agent success rate
                                updated = true;
                                setRecentAlerts(prev => [`Agent ${activeAgent.name} initiated stabilization for ${shard.name} at ${new Date().toLocaleTimeString()}`, ...prev.slice(0, 4)]);
                                return {
                                    ...shard,
                                    status: 'Stable',
                                    anomalies: [],
                                    structuralIntegrity: Math.min(100, shard.structuralIntegrity + Math.floor(Math.random() * 15)),
                                };
                            }
                        }
                    }
                    return shard;
                });
                if (updated && !nexusConfiguration.autoStabilizeAnomalies && nexusConfiguration.agenticAutomationEnabled) {
                    setGlobalAlert && setGlobalAlert({ message: "Anomalies resolved by Nexus AI Agents.", type: "info" });
                } else if (updated && nexusConfiguration.autoStabilizeAnomalies) {
                    setGlobalAlert && setGlobalAlert({ message: "Anomalies auto-stabilized by Nexus Core.", type: "info" });
                }
                return newShards;
            });

            // Agentic AI: Agents perform monitoring/remediation
            setNexusAgents(prevAgents => {
                let updatedAgents = false;
                const newAgents = prevAgents.map(agent => {
                    if (nexusConfiguration.agenticAutomationEnabled) {
                        if (agent.status === 'Monitoring' && agent.assignedShardId) {
                            const assignedShard = realityShards.find(s => s.id === agent.assignedShardId);
                            if (assignedShard && assignedShard.status === 'Anomaly Detected' && assignedShard.anomalies.length > 0) {
                                if (agent.skills.includes('Anomaly Detection')) {
                                    if (nexusConfiguration.notificationLevel === 'Verbose') {
                                        setRecentAlerts(prev => [`Agent ${agent.name} detected anomaly in ${assignedShard.name}.`, ...prev.slice(0, 4)]);
                                    }
                                }
                            }
                        }
                        // Simulate general activity
                        if (Math.random() < 0.1) { // 10% chance to update agent status
                            agent.lastActivity = new Date().toISOString();
                            const statuses: NexusAgent['status'][] = ['Idle', 'Monitoring', 'Executing Remediation', 'Offline'];
                            agent.status = statuses[Math.floor(Math.random() * statuses.length)];
                            updatedAgents = true;
                        }
                    }
                    return agent;
                });
                return updatedAgents ? newAgents : prevAgents;
            });

            // Token Rail Layer: Simulate resource drain/distribution
            setMultiversalTokenLedger(prevLedger => {
                const newLedger = { ...prevLedger };
                let ledgerUpdated = false;
                realityShards.forEach(shard => {
                    if (newLedger[shard.id]) {
                        let drainAmount = shard.subRealms.reduce((sum, sr) => sum + sr.resourceDrain, 0) / 5000; // Convert to tokens, scale down for QCR
                        if (shard.status !== 'Stable') {
                            drainAmount *= (1 + (100 - shard.structuralIntegrity) / 100); // Higher drain for unstable realms
                        }
                        if (shard.populationEstimate > 500_000_000) {
                            drainAmount += Math.random() * 5; // Large realms consume more
                        }
                        drainAmount = parseFloat(drainAmount.toFixed(2));

                        if (newLedger[shard.id].balance >= drainAmount) {
                            newLedger[shard.id].balance -= drainAmount;
                            newLedger[shard.id].balance = parseFloat(newLedger[shard.id].balance.toFixed(2));
                            newLedger[shard.id].lastUpdated = new Date().toISOString();
                            ledgerUpdated = true;
                        } else {
                            // Shard running out of resources
                            if (newLedger[shard.id].balance > 0) {
                                newLedger[shard.id].balance = 0;
                                setRecentAlerts(prev => [`Resource depletion warning for ${shard.name}! (Balance: 0 QCR)`, ...prev.slice(0, 4)]);
                                setGlobalAlert && setGlobalAlert({ message: `Resource critical: ${shard.name} at 0 QCR!`, type: "warning" });
                                ledgerUpdated = true;
                            }
                        }
                    }
                });
                return ledgerUpdated ? newLedger : prevLedger;
            });


            setSystemHealthIndex(prev => {
                const newHealth = prev + (Math.random() * 10 - 5);
                return Math.min(100, Math.max(0, newHealth));
            });
        }, 10000); // Run every 10 seconds

        return () => clearInterval(simulationInterval);
    }, [nexusConfiguration.autoStabilizeAnomalies, nexusConfiguration.agenticAutomationEnabled, nexusConfiguration.notificationLevel, setGlobalAlert, realityShards, nexusAgents]);

    useEffect(() => {
        if (updatePreferences) {
            updatePreferences(prev => ({
                ...prev,
                multiverse: {
                    autoStabilizeAnomalies: nexusConfiguration.autoStabilizeAnomalies,
                    priorityRealmFocus: nexusConfiguration.priorityRealmFocus,
                    notificationLevel: nexusConfiguration.notificationLevel,
                    energyAllocationStrategy: nexusConfiguration.energyAllocationStrategy,
                    crossRealityJumpsEnabled: nexusConfiguration.crossRealityJumpsEnabled,
                    agenticAutomationEnabled: nexusConfiguration.agenticAutomationEnabled, // Save new config
                }
            }));
        }
    }, [nexusConfiguration, updatePreferences]);

    const filteredRealms = useMemo(() => {
        let filtered = realityShards;
        if (filterStatus !== 'All') {
            filtered = filtered.filter(shard => shard.status === filterStatus);
        }
        if (searchQuery) {
            filtered = filtered.filter(shard =>
                shard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                shard.dimension.toLowerCase().includes(searchQuery.toLowerCase()) ||
                shard.anomalies.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        return filtered.sort((a, b) => {
            if (a.status === 'Anomaly Detected' && b.status !== 'Anomaly Detected') return -1;
            if (b.status === 'Anomaly Detected' && a.status !== 'Anomaly Detected') return 1;
            return b.populationEstimate - a.populationEstimate;
        });
    }, [realityShards, filterStatus, searchQuery]);

    const selectedShard = useMemo(() => {
        return realityShards.find(shard => shard.id === selectedShardId);
    }, [realityShards, selectedShardId]);

    const handleSelectShard = useCallback((id: string) => {
        setSelectedShardId(id);
        setActiveTab('realms');
    }, []);

    const handleStabilizeShard = useCallback((id: string) => {
        setRealityShards(prevShards => prevShards.map(shard =>
            shard.id === id ? { ...shard, status: 'Stable', anomalies: [], structuralIntegrity: Math.min(100, shard.structuralIntegrity + 20) } : shard
        ));
        setRecentAlerts(prev => [`Manual stabilization initiated for shard ${id} at ${new Date().toLocaleTimeString()}`, ...prev.slice(0, 4)]);
        setGlobalAlert && setGlobalAlert({ message: `Reality Shard ${id} stabilization initiated.`, type: "success" });
    }, [setGlobalAlert]);

    const handleJumpToReality = useCallback((id: string) => {
        if (!nexusConfiguration.crossRealityJumpsEnabled) {
            setGlobalAlert && setGlobalAlert({ message: "Cross-Reality Jumps are currently disabled in Nexus Configuration.", type: "warning" });
            return;
        }
        setGlobalAlert && setGlobalAlert({ message: `Initiating jump sequence to Reality Shard ${id}...`, type: "info" });
        const jumpSteps = [
            "Calculating quantum entanglement vectors...",
            "Synchronizing temporal frequencies...",
            "Bending spacetime fabric...",
            "Traversing dimensional rift...",
            "Reality interface establishing connection...",
            "Jump complete."
        ];
        let step = 0;
        const jumpInterval = setInterval(() => {
            if (step < jumpSteps.length) {
                setGlobalAlert && setGlobalAlert({ message: jumpSteps[step], type: "info" });
                step++;
            } else {
                clearInterval(jumpInterval);
                setGlobalAlert && setGlobalAlert({ message: `Successfully jumped to Reality Shard ${id}.`, type: "success" });
            }
        }, 1000);
    }, [setGlobalAlert, nexusConfiguration.crossRealityJumpsEnabled]);

    const handleUpdateNexusConfig = useCallback((key: keyof NexusConfiguration, value: any) => {
        setNexusConfiguration(prev => ({ ...prev, [key]: value }));
        setGlobalAlert && setGlobalAlert({ message: `Nexus configuration updated: ${key} set to ${String(value)}.`, type: "info" });
    }, [setGlobalAlert]);

    const calculateInterdimensionalFlux = useCallback((shards: RealityShard[], signatures: QuantumSignature[]): number => {
        let totalFlux = 0;
        if (shards.length === 0 || signatures.length === 0) return 0;

        for (let i = 0; i < shards.length; i++) {
            const shard = shards[i];
            let shardFlux = 0;
            for (let j = 0; j < signatures.length; j++) {
                const signature = signatures[j];
                if (signature.emitterRealmId === shard.id) {
                    shardFlux += (signature.magnitude * signature.frequency) / (signature.decayRate + 1);
                }
            }
            totalFlux += (shardFlux * (100 - shard.structuralIntegrity)) / 1000;
        }
        totalFlux = Math.sqrt(totalFlux) * Math.log(totalFlux > 1 ? totalFlux : 1);
        if (isNaN(totalFlux) || !isFinite(totalFlux)) return 0;
        return parseFloat(totalFlux.toFixed(4));
    }, []);

    const currentInterdimensionalFlux = useMemo(() => {
        return calculateInterdimensionalFlux(realityShards, quantumSignatures);
    }, [realityShards, quantumSignatures, calculateInterdimensionalFlux]);

    // New handlers for Agents and Tokens
    const handleDeployNewAgent = useCallback(() => {
        if (realityShards.length === 0) {
            setGlobalAlert && setGlobalAlert({ message: "Cannot deploy agent: no reality shards available.", type: "warning" });
            return;
        }
        const newAgent = generateNexusAgent(nexusAgents.length, realityShards);
        setNexusAgents(prev => [...prev, newAgent]);
        setGlobalAlert && setGlobalAlert({ message: `New Agent ${newAgent.name} deployed and initiated.`, type: "success" });
    }, [nexusAgents.length, realityShards, setGlobalAlert]);

    const handleAssignAgentToShard = useCallback((agentId: string, shardId: string | null) => {
        setNexusAgents(prev => prev.map(agent =>
            agent.id === agentId ? { ...agent, assignedShardId: shardId, status: shardId ? 'Monitoring' : 'Idle', lastActivity: new Date().toISOString() } : agent
        ));
        setGlobalAlert && setGlobalAlert({ message: `Agent ${agentId} assigned to shard ${shardId || 'none'}.`, type: "info" });
    }, [setGlobalAlert]);

    const handleInitiateTokenTransfer = useCallback((senderId: string, receiverId: string, amount: number) => {
        if (senderId === receiverId) {
            setGlobalAlert && setGlobalAlert({ message: "Sender and receiver realms cannot be the same.", type: "warning" });
            return;
        }
        if (amount <= 0) {
            setGlobalAlert && setGlobalAlert({ message: "Transfer amount must be positive.", type: "warning" });
            return;
        }
        setMultiversalTokenLedger(prevLedger => {
            const newLedger = { ...prevLedger };
            const senderAccount = newLedger[senderId];
            const receiverAccount = newLedger[receiverId];

            if (!senderAccount || !receiverAccount) {
                setGlobalAlert && setGlobalAlert({ message: "Invalid sender or receiver realm for token transfer.", type: "error" });
                return prevLedger;
            }

            if (senderAccount.balance < amount) {
                setGlobalAlert && setGlobalAlert({ message: `Insufficient balance in ${senderAccount.realmId} for transfer.`, type: "error" });
                return prevLedger;
            }

            // Simulate transaction processing (e.g., latency, potential failure, multi-rail)
            const transactionId = `TXN-${generateRandomId().substring(0, 8).toUpperCase()}`;
            const route = generateInterdimensionalRoute(); // Select a rail

            setNexusTokenTransactions(prev => [...prev, {
                id: transactionId,
                senderRealmId: senderId,
                receiverRealmId: receiverId,
                amount: amount,
                currencySymbol: 'QCR',
                timestamp: new Date().toISOString(),
                status: 'Pending',
                route: route,
            }]);

            const processingTime = route === 'QuantumTunnel_Fast' ? 1000 : route === 'GravitonChannel_Batch' ? 5000 : 2000; // Simulate rail speed
            // Simulate fraud/risk detection based on structural integrity and random chance
            const senderShard = realityShards.find(s => s.id === senderId);
            const isHighRisk = senderShard && senderShard.structuralIntegrity < 40 && Math.random() < 0.3; // 30% risk if low integrity
            const successChance = isHighRisk ? 0.6 : 0.95; // Lower success for high risk
            const isSuccess = Math.random() < successChance;

            setTimeout(() => {
                setMultiversalTokenLedger(currentLedger => {
                    const updatedLedger = { ...currentLedger };
                    if (isSuccess) {
                        updatedLedger[senderId].balance -= amount;
                        updatedLedger[receiverId].balance += amount;
                        updatedLedger[senderId].lastUpdated = new Date().toISOString();
                        updatedLedger[receiverId].lastUpdated = new Date().toISOString();
                        setGlobalAlert && setGlobalAlert({ message: `Token transfer ${transactionId} via ${route} completed successfully!`, type: "success" });
                    } else {
                        setGlobalAlert && setGlobalAlert({ message: `Token transfer ${transactionId} via ${route} failed! Funds reverted. ${isHighRisk ? '(Risk Flagged)' : ''}`, type: "error" });
                        // For failed transactions, funds are implicitly reverted as ledger is not updated.
                    }
                    return updatedLedger;
                });

                setNexusTokenTransactions(prev => prev.map(txn =>
                    txn.id === transactionId ? { ...txn, status: isSuccess ? 'Completed' : 'Failed', timestamp: new Date().toISOString() } : txn
                ));
            }, processingTime);

            setGlobalAlert && setGlobalAlert({ message: `Initiating token transfer of ${amount} QCR from ${senderId} to ${receiverId} via ${route}.`, type: "info" });
            return newLedger; // Return current ledger before async update
        });
    }, [realityShards, setGlobalAlert]);


    if (loadingNexusData) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-20 h-20 border-4 border-purple-400 border-double rounded-full animate-spin"></div>
                <p className="ml-4 text-purple-300 text-xl">Accessing Multiverse Nexus...</p>
            </div>
        );
    }

    if (errorLoadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-red-500">
                <p className="text-2xl font-semibold mb-4">Error: Failed to connect to Multiverse Nexus.</p>
                <p className="text-lg">{errorLoadingData}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <FeatureGuard view={View.MultiverseNexus}>
            <div className="p-8 bg-gray-900 rounded-lg shadow-xl min-h-[90vh] flex flex-col space-y-6 max-w-full mx-auto relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: `url('/assets/multiverse_pattern.svg')`, backgroundSize: 'cover' }}></div>
                <div className="relative z-10">
                    <div className="absolute top-8 right-8 text-gray-400 text-sm flex items-center">
                        <span className="mr-2">Operator: <strong className="text-white">{userPreferences?.user?.name || 'Unidentified'}</strong></span>
                        <span className="mr-2">Clearance Level:</span>
                        <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                            operatorClearance === 'Omega' ? 'bg-red-700 text-red-200' :
                            operatorClearance === 'Elevated' ? 'bg-orange-700 text-orange-200' :
                            'bg-green-700 text-green-200'
                        }`}>
                            {operatorClearance}
                        </span>
                    </div>
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4 text-center">
                        Multiverse Nexus Hub
                    </h1>
                    <p className="text-gray-300 text-xl text-center max-w-3xl mx-auto mb-8">
                        Central command for navigating, monitoring, and managing all interconnected realities and their intricate dynamics within the multiversal fabric.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
                            <h2 className="text-lg font-semibold text-purple-300 mb-2">Total Realities Monitored</h2>
                            <p className="text-4xl font-bold text-white text-right">{realityShards.length}</p>
                            <p className="text-sm text-gray-500 text-right">Active / Total</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
                            <h2 className="text-lg font-semibold text-cyan-300 mb-2">Anomalies Detected</h2>
                            <p className="text-4xl font-bold text-red-400 text-right">
                                {realityShards.filter(s => s.status === 'Anomaly Detected').length}
                            </p>
                            <p className="text-sm text-gray-500 text-right">Critical / Total</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
                            <h2 className="text-lg font-semibold text-green-300 mb-2">System Health Index</h2>
                            <p className="text-4xl font-bold text-green-400 text-right">{systemHealthIndex.toFixed(1)}%</p>
                            <p className="text-sm text-gray-500 text-right">Current Stability</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
                            <h2 className="text-lg font-semibold text-yellow-300 mb-2">Interdimensional Flux</h2>
                            <p className="text-4xl font-bold text-orange-400 text-right">{currentInterdimensionalFlux.toFixed(2)} GW</p>
                            <p className="text-sm text-gray-500 text-right">Avg Temporal Variance</p>
                        </div>
                    </div>

                    <div className="flex border-b border-gray-700 mb-6 overflow-x-auto custom-scrollbar-horizontal">
                        <button
                            className={`flex-shrink-0 px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'realms' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('realms')}
                        >
                            Reality Shards
                        </button>
                        <button
                            className={`flex-shrink-0 px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'events' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('events')}
                        >
                            Multiversal Events
                        </button>
                        <button
                            className={`flex-shrink-0 px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'signatures' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('signatures')}
                        >
                            Quantum Signatures
                        </button>
                        <button
                            className={`flex-shrink-0 px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'config' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('config')}
                        >
                            Nexus Configuration
                        </button>
                        <button
                            className={`flex-shrink-0 px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'agents' ? 'border-b-2 border-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('agents')}
                        >
                            Nexus Agents
                        </button>
                        <button
                            className={`flex-shrink-0 px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'economy' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('economy')}
                        >
                            Multiversal Economy
                        </button>
                    </div>

                    {activeTab === 'realms' && (
                        <div className="bg-gray-850 p-6 rounded-lg shadow-lg">
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                                <input
                                    type="text"
                                    placeholder="Search realities..."
                                    className="flex-1 p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <select
                                    className="p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Stable">Stable</option>
                                    <option value="Volatile">Volatile</option>
                                    <option value="Anomaly Detected">Anomaly Detected</option>
                                    <option value="Dormant">Dormant</option>
                                    <option value="Initializing">Initializing</option>
                                </select>
                                <button className="p-3 bg-purple-600 rounded-md text-white hover:bg-purple-700 transition-colors"
                                    onClick={() => setGlobalAlert && setGlobalAlert({ message: "Initiating deep scan of all reality shards...", type: "info" })}>
                                    Deep Scan
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className={`col-span-1 ${selectedShard ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                                    <h2 className="text-3xl font-bold text-white mb-4">Reality Shard Overview ({filteredRealms.length})</h2>
                                    <div className="overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                                        {filteredRealms.length === 0 ? (
                                            <p className="text-gray-400 text-center py-8">No reality shards match your criteria.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {filteredRealms.map((shard) => (
                                                    <div
                                                        key={shard.id}
                                                        className={`bg-gray-800 p-5 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${selectedShardId === shard.id ? 'border-2 border-purple-500' : 'border border-gray-700 hover:border-purple-600'}`}
                                                        onClick={() => handleSelectShard(shard.id)}
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h3 className="text-xl font-semibold text-cyan-200">{shard.name}</h3>
                                                            <span className={`px-3 py-1 text-sm rounded-full ${
                                                                shard.status === 'Stable' ? 'bg-green-700 text-green-200' :
                                                                shard.status === 'Volatile' ? 'bg-yellow-700 text-yellow-200' :
                                                                shard.status === 'Anomaly Detected' ? 'bg-red-700 text-red-200' :
                                                                'bg-gray-700 text-gray-200'
                                                            }`}>
                                                                {shard.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-400 text-sm mb-1">Dimension: <span className="text-purple-300">{shard.dimension}</span></p>
                                                        <p className="text-gray-400 text-sm mb-1">Population: <span className="text-white">{shard.populationEstimate.toLocaleString()}</span></p>
                                                        <p className="text-gray-400 text-sm mb-1">Integrity: <span className={shard.structuralIntegrity < 50 ? 'text-red-400' : 'text-green-400'}>{shard.structuralIntegrity}%</span></p>
                                                        {shard.anomalies.length > 0 && (
                                                            <div className="mt-2 text-red-300 text-sm">
                                                                <span className="font-medium">Anomalies:</span> {shard.anomalies.join(', ')}
                                                            </div>
                                                        )}
                                                        <div className="mt-3 flex space-x-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleJumpToReality(shard.id); }}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                                            >
                                                                Jump To
                                                            </button>
                                                            {shard.status === 'Anomaly Detected' && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleStabilizeShard(shard.id); }}
                                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                                                >
                                                                    Stabilize
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openModal && openModal(View.AIAdvisor); }}
                                                                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                                                            >
                                                                Consult AI
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {selectedShard && (
                                    <div className="col-span-1 bg-gray-800 p-6 rounded-lg shadow-md border border-purple-600">
                                        <h2 className="text-3xl font-bold text-white mb-4">Shard Details: {selectedShard.name}</h2>
                                        <div className="space-y-3 text-gray-300">
                                            <p><strong className="text-purple-300">ID:</strong> {selectedShard.id}</p>
                                            <p><strong className="text-purple-300">Status:</strong> <span className={
                                                selectedShard.status === 'Stable' ? 'text-green-400' :
                                                selectedShard.status === 'Volatile' ? 'text-yellow-400' :
                                                selectedShard.status === 'Anomaly Detected' ? 'text-red-400' :
                                                'text-gray-400'
                                            }>{selectedShard.status}</span></p>
                                            <p><strong className="text-purple-300">Dimension:</strong> {selectedShard.dimension}</p>
                                            <p><strong className="text-purple-300">Population:</strong> {selectedShard.populationEstimate.toLocaleString()}</p>
                                            <p><strong className="text-purple-300">Energy Signature:</strong> {selectedShard.energySignature}</p>
                                            <p><strong className="text-purple-300">Temporal Variance:</strong> {selectedShard.temporalVariance.toFixed(3)} ps</p>
                                            <p><strong className="text-purple-300">Structural Integrity:</strong> <span className={selectedShard.structuralIntegrity < 50 ? 'text-red-400' : 'text-green-400'}>{selectedShard.structuralIntegrity}%</span></p>
                                            <p><strong className="text-purple-300">Last Observed:</strong> {new Date(selectedShard.lastObserved).toLocaleString()}</p>
                                            <p><strong className="text-purple-300">Monitoring Protocols:</strong> {selectedShard.activeMonitoringProtocols.join(', ')}</p>

                                            {selectedShard.anomalies.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-red-300 mt-4 mb-2">Active Anomalies:</h4>
                                                    <ul className="list-disc list-inside text-red-200">
                                                        {selectedShard.anomalies.map((anomaly, idx) => (
                                                            <li key={idx}>{anomaly}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {selectedShard.subRealms.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-purple-300 mt-4 mb-2">Sub-Realms:</h4>
                                                    <div className="space-y-2">
                                                        {selectedShard.subRealms.map((subRealm) => (
                                                            <div key={subRealm.id} className="bg-gray-700 p-3 rounded-md text-sm border border-gray-600">
                                                                <p><strong className="text-cyan-300">Name:</strong> {subRealm.name}</p>
                                                                <p><strong className="text-cyan-300">Threat Level:</strong> <span className={
                                                                    subRealm.threatLevel === 'Critical' ? 'text-red-400' :
                                                                    subRealm.threatLevel === 'High' ? 'text-orange-400' :
                                                                    subRealm.threatLevel === 'Medium' ? 'text-yellow-400' :
                                                                    'text-green-400'
                                                                }>{subRealm.threatLevel}</span></p>
                                                                <p><strong className="text-cyan-300">Connected Entities:</strong> {subRealm.connectedEntities.toLocaleString()}</p>
                                                                <p><strong className="text-cyan-300">Resource Drain:</strong> {subRealm.resourceDrain.toFixed(2)} Exawatts</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="mt-6 flex flex-col space-y-3">
                                                <button
                                                    onClick={() => handleJumpToReality(selectedShard.id)}
                                                    className="w-full px-5 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors font-medium"
                                                >
                                                    Direct Jump
                                                </button>
                                                {selectedShard.status === 'Anomaly Detected' && (
                                                    <button
                                                        onClick={() => handleStabilizeShard(selectedShard.id)}
                                                        className="w-full px-5 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors font-medium"
                                                    >
                                                        Initiate Emergency Stabilization
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setGlobalAlert && setGlobalAlert({ message: `Running comprehensive diagnostic for ${selectedShard.name}...`, type: "info" })}
                                                    className="w-full px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                                                >
                                                    Run Comprehensive Diagnostic
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="bg-gray-850 p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-white mb-4">Multiversal Event Log ({multiversalEvents.length})</h2>
                            <div className="overflow-y-auto max-h-[700px] pr-4 custom-scrollbar space-y-4">
                                {multiversalEvents.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No multiversal events recorded.</p>
                                ) : (
                                    multiversalEvents.map((event) => (
                                        <div key={event.id} className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:border-orange-600 transition-colors">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-xl font-semibold text-orange-300">{event.type}</h3>
                                                <span className={`px-3 py-1 text-sm rounded-full ${
                                                    event.severity === 'Cataclysmic' ? 'bg-red-700 text-red-200' :
                                                    event.severity === 'Major' ? 'bg-orange-700 text-orange-200' :
                                                    event.severity === 'Moderate' ? 'bg-yellow-700 text-yellow-200' :
                                                    'bg-green-700 text-green-200'
                                                }`}>
                                                    {event.severity}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-1"><strong className="text-orange-300">Timestamp:</strong> {new Date(event.timestamp).toLocaleString()}</p>
                                            <p className="text-gray-400 text-sm mb-1"><strong className="text-orange-300">Description:</strong> {event.description}</p>
                                            <p className="text-gray-400 text-sm mb-1"><strong className="text-orange-300">Affected Realms:</strong> {event.affectedRealms.map(id => realityShards.find(s => s.id === id)?.name || id).join(', ')}</p>
                                            <p className="text-gray-400 text-sm mb-1"><strong className="text-orange-300">Resolution Status:</strong> <span className={
                                                event.resolutionStatus === 'Resolved' ? 'text-green-400' :
                                                event.resolutionStatus === 'Failed' ? 'text-red-400' :
                                                'text-yellow-400'
                                            }>{event.resolutionStatus}</span></p>
                                            <div className="mt-3 flex space-x-2">
                                                {event.resolutionStatus === 'Pending' && (
                                                    <button
                                                        onClick={() => {
                                                            setMultiversalEvents(prev => prev.map(e => e.id === event.id ? { ...e, resolutionStatus: 'InProgress' } : e));
                                                            setGlobalAlert && setGlobalAlert({ message: `Initiating response protocol for event ${event.id}...`, type: "info" });
                                                        }}
                                                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                                                    >
                                                        Initiate Response
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setGlobalAlert && setGlobalAlert({ message: `Analyzing event ${event.id} data...`, type: "info" })}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                                                >
                                                    View Diagnostics
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'signatures' && (
                        <div className="bg-gray-850 p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-white mb-4">Quantum Signature Stream ({quantumSignatures.length})</h2>
                            <p className="text-gray-400 mb-6">Monitoring interdimensional energy fluctuations and exotic particle emissions.</p>
                            <div className="overflow-y-auto max-h-[700px] pr-4 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quantumSignatures.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8 col-span-full">No quantum signatures detected.</p>
                                ) : (
                                    quantumSignatures.map((signature) => (
                                        <div key={signature.id} className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:border-cyan-600 transition-colors">
                                            <h3 className="text-xl font-semibold text-cyan-300 mb-2">{signature.signatureType}</h3>
                                            <p className="text-gray-400 text-sm"><strong className="text-cyan-300">Emitter Realm:</strong> {realityShards.find(s => s.id === signature.emitterRealmId)?.name || signature.emitterRealmId}</p>
                                            <p className="text-gray-400 text-sm"><strong className="text-cyan-300">Magnitude:</strong> {signature.magnitude.toFixed(2)} units</p>
                                            <p className="text-gray-400 text-sm"><strong className="text-cyan-300">Frequency:</strong> {signature.frequency.toFixed(3)} THz</p>
                                            <p className="text-gray-400 text-sm"><strong className="text-cyan-300">Decay Rate:</strong> {signature.decayRate.toFixed(4)} /Âµs</p>
                                            <button
                                                onClick={() => {
                                                    setSelectedShardId(signature.emitterRealmId);
                                                    setActiveTab('realms');
                                                    setGlobalAlert && setGlobalAlert({ message: `Tracing signature ${signature.id} to emitter realm.`, type: "info" });
                                                }}
                                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                Trace Emitter
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'config' && (
                        <div className="bg-gray-850 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-4">Nexus Configuration</h2>
                            <p className="text-gray-400 mb-6">Adjust global parameters for multiversal interaction and monitoring protocols.</p>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-md border border-gray-700">
                                    <label htmlFor="autoStabilizeAnomalies" className="text-lg font-medium text-purple-300">Auto-Stabilize Anomalies:</label>
                                    <input
                                        type="checkbox"
                                        id="autoStabilizeAnomalies"
                                        checked={nexusConfiguration.autoStabilizeAnomalies}
                                        onChange={(e) => handleUpdateNexusConfig('autoStabilizeAnomalies', e.target.checked)}
                                        className="h-6 w-6 rounded text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600"
                                    />
                                </div>

                                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-md border border-gray-700">
                                    <label htmlFor="agenticAutomationEnabled" className="text-lg font-medium text-purple-300">Agentic Automation Enabled:</label>
                                    <input
                                        type="checkbox"
                                        id="agenticAutomationEnabled"
                                        checked={nexusConfiguration.agenticAutomationEnabled}
                                        onChange={(e) => handleUpdateNexusConfig('agenticAutomationEnabled', e.target.checked)}
                                        className="h-6 w-6 rounded text-green-600 focus:ring-green-500 bg-gray-700 border-gray-600"
                                    />
                                </div>

                                <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                                    <label htmlFor="priorityRealmFocus" className="block text-lg font-medium text-purple-300 mb-2">Priority Realm Focus:</label>
                                    <select
                                        id="priorityRealmFocus"
                                        value={nexusConfiguration.priorityRealmFocus || ''}
                                        onChange={(e) => handleUpdateNexusConfig('priorityRealmFocus', e.target.value || null)}
                                        className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">None</option>
                                        {realityShards.map(shard => (
                                            <option key={shard.id} value={shard.id}>{shard.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-sm text-gray-500 mt-2">Designates a reality shard for enhanced monitoring and resource allocation.</p>
                                </div>

                                <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                                    <label htmlFor="notificationLevel" className="block text-lg font-medium text-purple-300 mb-2">Notification Level:</label>
                                    <select
                                        id="notificationLevel"
                                        value={nexusConfiguration.notificationLevel}
                                        onChange={(e) => handleUpdateNexusConfig('notificationLevel', e.target.value as NexusConfiguration['notificationLevel'])}
                                        className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="Minimal">Minimal (Critical Alerts Only)</option>
                                        <option value="Standard">Standard (Anomalies & Major Events)</option>
                                        <option value="Verbose">Verbose (All Events & Signatures)</option>
                                    </select>
                                    <p className="text-sm text-gray-500 mt-2">Sets the verbosity of system alerts and event notifications.</p>
                                </div>

                                <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                                    <label htmlFor="energyAllocationStrategy" className="block text-lg font-medium text-purple-300 mb-2">Energy Allocation Strategy:</label>
                                    <select
                                        id="energyAllocationStrategy"
                                        value={nexusConfiguration.energyAllocationStrategy}
                                        onChange={(e) => handleUpdateNexusConfig('energyAllocationStrategy', e.target.value as NexusConfiguration['energyAllocationStrategy'])}
                                        className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="Balanced">Balanced (Optimal Stability)</option>
                                        <option value="Performance">Performance (Maximize Jump & Processing Power)</option>
                                        <option value="Conservation">Conservation (Minimize Energy Footprint)</option>
                                    </select>
                                    <p className="text-sm text-gray-500 mt-2">Determines how energy resources are distributed across the nexus.</p>
                                </div>

                                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-md border border-gray-700">
                                    <label htmlFor="crossRealityJumpsEnabled" className="text-lg font-medium text-purple-300">Cross-Reality Jumps Enabled:</label>
                                    <input
                                        type="checkbox"
                                        id="crossRealityJumpsEnabled"
                                        checked={nexusConfiguration.crossRealityJumpsEnabled}
                                        onChange={(e) => handleUpdateNexusConfig('crossRealityJumpsEnabled', e.target.checked)}
                                        className="h-6 w-6 rounded text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600"
                                    />
                                </div>

                                <button
                                    onClick={() => setGlobalAlert && setGlobalAlert({ message: "Applying nexus configuration changes globally...", type: "success" })}
                                    className="w-full px-6 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors font-semibold mt-4"
                                >
                                    Apply Configuration Globally
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'agents' && (
                        <div className="bg-gray-850 p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-white mb-4">Nexus AI Agents ({nexusAgents.length})</h2>
                            <p className="text-gray-400 mb-6">Autonomous entities monitoring, managing, and intervening across the multiversal fabric. Automation is {nexusConfiguration.agenticAutomationEnabled ? 'Active' : 'Disabled'}.</p>

                            <div className="mb-6 flex justify-between items-center">
                                <button
                                    onClick={handleDeployNewAgent}
                                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                                >
                                    Deploy New Agent
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[700px] pr-4 custom-scrollbar">
                                {nexusAgents.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8 col-span-full">No agents currently deployed.</p>
                                ) : (
                                    nexusAgents.map(agent => (
                                        <div key={agent.id} className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:border-green-600 transition-colors">
                                            <h3 className="text-xl font-semibold text-green-300 mb-2">{agent.name}</h3>
                                            <p className="text-gray-400 text-sm"><strong className="text-green-300">ID:</strong> {agent.id}</p>
                                            <p className="text-gray-400 text-sm"><strong className="text-green-300">Status:</strong> <span className={
                                                agent.status === 'Executing Remediation' ? 'text-red-400' :
                                                agent.status === 'Monitoring' ? 'text-blue-400' :
                                                agent.status === 'Offline' ? 'text-gray-400' :
                                                'text-green-400'
                                            }>
                                                {agent.status} {agent.status === 'Executing Remediation' && "(Anomaly Detected)"}
                                            </span></p>
                                            <p className="text-gray-400 text-sm"><strong className="text-green-300">Assigned Shard:</strong> {realityShards.find(s => s.id === agent.assignedShardId)?.name || 'Unassigned'}</p>
                                            <p className="text-gray-400 text-sm"><strong className="text-green-300">Skills:</strong> {agent.skills.join(', ')}</p>
                                            <p className="text-gray-400 text-sm"><strong className="text-green-300">Last Activity:</strong> {new Date(agent.lastActivity).toLocaleTimeString()}</p>
                                            <p className="text-gray-400 text-sm"><strong className="text-green-300">Clearance:</strong> <span className={
                                                agent.clearanceLevel === 'Omega' ? 'text-red-400' : agent.clearanceLevel === 'Elevated' ? 'text-orange-400' : 'text-green-400'
                                            }>{agent.clearanceLevel}</span></p>

                                            <div className="mt-4">
                                                <label htmlFor={`assign-${agent.id}`} className="block text-sm font-medium text-gray-300 mb-1">Assign to Shard:</label>
                                                <select
                                                    id={`assign-${agent.id}`}
                                                    className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                                                    value={agent.assignedShardId || ''}
                                                    onChange={(e) => handleAssignAgentToShard(agent.id, e.target.value || null)}
                                                >
                                                    <option value="">Unassign</option>
                                                    {realityShards.map(shard => (
                                                        <option key={`assign-opt-${agent.id}-${shard.id}`} value={shard.id}>{shard.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => setGlobalAlert && setGlobalAlert({ message: `Requesting Agent ${agent.name} to perform deep scan...`, type: "info" })}
                                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm mt-2"
                                                >
                                                    Request Deep Scan
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'economy' && (
                        <div className="bg-gray-850 p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-white mb-4">Multiversal Economic Overview</h2>
                            <p className="text-gray-400 mb-6">Monitor inter-reality resource flow, token balances, and transactional history across the nexus. Currency: Quantum Credits (QCR).</p>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-yellow-700">
                                    <h3 className="text-2xl font-semibold text-yellow-300 mb-3">Realm Token Ledgers</h3>
                                    <div className="overflow-y-auto max-h-[400px] pr-4 custom-scrollbar space-y-3">
                                        {Object.values(multiversalTokenLedger).length === 0 ? (
                                            <p className="text-gray-400">No token accounts active.</p>
                                        ) : (
                                            Object.values(multiversalTokenLedger).sort((a,b) => b.balance - a.balance).map(account => (
                                                <div key={account.realmId} className="bg-gray-700 p-3 rounded-md text-sm border border-gray-600">
                                                    <p><strong className="text-yellow-300">Realm:</strong> {realityShards.find(s => s.id === account.realmId)?.name || account.realmId}</p>
                                                    <p><strong className="text-yellow-300">Balance:</strong> <span className={account.balance < 1000 ? 'text-red-400' : 'text-white'}>{account.balance.toFixed(2)} {account.currencySymbol}</span></p>
                                                    <p className="text-xs text-gray-500">Last Update: {new Date(account.lastUpdated).toLocaleString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-orange-700">
                                    <h3 className="text-2xl font-semibold text-orange-300 mb-3">Simulate Token Transfer</h3>
                                    <p className="text-gray-400 mb-4">Initiate a secure, atomic value transfer between two reality shards.</p>
                                    <div className="flex flex-col space-y-3">
                                        <label htmlFor="transferSender" className="block text-sm font-medium text-gray-300">Sender Realm:</label>
                                        <select
                                            id="transferSender"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            defaultValue=""
                                        >
                                            <option value="">Select Sender</option>
                                            {Object.values(multiversalTokenLedger).map(account => (
                                                <option key={`sender-${account.realmId}`} value={account.realmId}>{realityShards.find(s => s.id === account.realmId)?.name || account.realmId} ({account.balance.toFixed(2)} QCR)</option>
                                            ))}
                                        </select>
                                        <label htmlFor="transferReceiver" className="block text-sm font-medium text-gray-300">Receiver Realm:</label>
                                        <select
                                            id="transferReceiver"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            defaultValue=""
                                        >
                                            <option value="">Select Receiver</option>
                                            {Object.values(multiversalTokenLedger).filter(account => account.realmId !== (document.getElementById('transferSender') as HTMLSelectElement)?.value).map(account => (
                                                <option key={`receiver-${account.realmId}`} value={account.realmId}>{realityShards.find(s => s.id === account.realmId)?.name || account.realmId} ({account.balance.toFixed(2)} QCR)</option>
                                            ))}
                                        </select>
                                        <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-300">Amount (QCR):</label>
                                        <input
                                            type="number"
                                            id="transferAmount"
                                            placeholder="e.g., 1000.00"
                                            min="0.01"
                                            step="0.01"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                        <button
                                            onClick={() => {
                                                const senderId = (document.getElementById('transferSender') as HTMLSelectElement).value;
                                                const receiverId = (document.getElementById('transferReceiver') as HTMLSelectElement).value;
                                                const amountStr = (document.getElementById('transferAmount') as HTMLInputElement).value;
                                                const amount = parseFloat(amountStr);
                                                if (senderId && receiverId && !isNaN(amount)) {
                                                    handleInitiateTokenTransfer(senderId, receiverId, amount);
                                                } else {
                                                    setGlobalAlert && setGlobalAlert({ message: "Please fill all transfer details correctly.", type: "warning" });
                                                }
                                            }}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
                                        >
                                            Execute Atomic Transfer
                                        </button>
                                        <p className="text-sm text-gray-500 mt-2">Simulates multi-rail routing based on current nexus conditions, with risk assessment.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 bg-gray-800 p-5 rounded-lg shadow-md border border-blue-700">
                                <h3 className="text-2xl font-semibold text-blue-300 mb-3">Multiversal Transaction Log ({nexusTokenTransactions.length})</h3>
                                <div className="overflow-y-auto max-h-[300px] pr-4 custom-scrollbar space-y-3">
                                    {nexusTokenTransactions.length === 0 ? (
                                        <p className="text-gray-400">No transactions recorded.</p>
                                    ) : (
                                        nexusTokenTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(txn => (
                                            <div key={txn.id} className="bg-gray-700 p-3 rounded-md text-sm border border-gray-600">
                                                <p><strong className="text-blue-300">TXN ID:</strong> {txn.id}</p>
                                                <p><strong className="text-blue-300">From:</strong> {realityShards.find(s => s.id === txn.senderRealmId)?.name || txn.senderRealmId}</p>
                                                <p><strong className="text-blue-300">To:</strong> {realityShards.find(s => s.id === txn.receiverRealmId)?.name || txn.receiverRealmId}</p>
                                                <p><strong className="text-blue-300">Amount:</strong> <span className="text-white">{txn.amount.toFixed(2)} {txn.currencySymbol}</span></p>
                                                <p><strong className="text-blue-300">Route:</strong> <span className="text-cyan-400">{txn.route}</span></p>
                                                <p><strong className="text-blue-300">Status:</strong> <span className={
                                                    txn.status === 'Completed' ? 'text-green-400' :
                                                    txn.status === 'Failed' ? 'text-red-400' :
                                                    'text-yellow-400'
                                                }>{txn.status}</span></p>
                                                <p className="text-xs text-gray-500">Timestamp: {new Date(txn.timestamp).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="mt-8 bg-gray-850 p-6 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold text-white mb-4">Recent Nexus Alerts</h2>
                        <div className="overflow-y-auto max-h-48 custom-scrollbar space-y-2">
                            {recentAlerts.length === 0 ? (
                                <p className="text-gray-500">No recent alerts.</p>
                            ) : (
                                recentAlerts.map((alert, index) => (
                                    <div key={index} className="bg-gray-800 p-3 rounded-md border border-gray-700 text-sm text-red-300">
                                        {alert}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="mt-8 bg-gray-850 p-6 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold text-white mb-4">Multiversal Topology Map (Simulation)</h2>
                        <p className="text-gray-400 mb-6">Visual representation of interconnected reality strands and potential wormhole junctions. (Graphical interface pending development - displaying text representation for now)</p>
                        <div className="overflow-x-auto p-4 bg-gray-900 rounded-md border border-gray-700 text-green-400 font-mono text-sm max-h-96">
                            <pre className="whitespace-pre-wrap">
                                {`
Graph G = (V, E) // V = Reality Shards, E = Interdimensional Links

Nodes (V):
${realityShards.slice(0, 10).map(shard => `  - ${shard.id} (${shard.name}) [Status: ${shard.status}, Integrity: ${shard.structuralIntegrity}%]`).join('\n')}
... (showing first 10 for brevity, total ${realityShards.length} shards)

Edges (E) - Sample Interconnections:
${Array.from({ length: 15 }, (_, i) => {
    const s1 = realityShards[Math.floor(Math.random() * realityShards.length)];
    const s2 = realityShards[Math.floor(Math.random() * realityShards.length)];
    if (!s1 || !s2 || s1.id === s2.id) return null;
    const connectionType = ['Stable Wormhole', 'Temporal Bridge', 'Singularity Conduit', 'Unstable Rift'][Math.floor(Math.random() * 4)];
    const latency = parseFloat((Math.random() * 100).toFixed(2));
    const throughput = parseFloat((Math.random() * 1000).toFixed(2));
    return `  - ${s1.id} <-> ${s2.id} [Type: ${connectionType}, Latency: ${latency}ms, Throughput: ${throughput} PB/s]`;
}).filter(Boolean).join('\n')}
... (more complex interconnections omitted)

Current Nexus Power Flow:
  - Core Singularity Reactor: ${parseFloat((Math.random() * 100000).toFixed(2))} GW (98.5% capacity)
  - Ancillary Graviton Converters: ${parseFloat((Math.random() * 50000).toFixed(2))} GW (Operational)
  - Reserve Capacitors: ${parseFloat((Math.random() * 20000).toFixed(2))} GW (75% charged)
  - Total Output: ${parseFloat((Math.random() * 150000).toFixed(2))} GW

Active Power Sinks:
  - Reality Stabilization Arrays: ${parseFloat((Math.random() * 30000).toFixed(2))} GW (Nominal)
  - Temporal Distortion Correctors: ${parseFloat((Math.random() * 15000).toFixed(2))} GW (${realityShards.filter(s => s.status === 'Volatile').length} realms affected)
  - Dimensional Gateway Operations: ${parseFloat((Math.random() * 25000).toFixed(2))} GW (${nexusConfiguration.crossRealityJumpsEnabled ? 'Active' : 'Dormant'})
  - Nexus Core Processing: ${parseFloat((Math.random() * 10000).toFixed(2))} GW (Optimal Load)

Resource Distribution Analysis:
  - Etheric Matter Flow: ${parseFloat((Math.random() * 500).toFixed(2))} exa-units/cycle
  - Chronon Density Flux: ${parseFloat((Math.random() * 10).toFixed(4))} attoseconds/cm³
  - Quantum Entanglement Index: ${parseFloat((Math.random() * 1).toFixed(6))} (High Cohesion)

Multiversal Threat Assessment:
  - Temporal Anomalies: ${multiversalEvents.filter(e => e.type === 'Temporal Flux').length} active
  - Dimensional Incursions: ${multiversalEvents.filter(e => e.type === 'Dimensional Incursion').length} active
  - Unknown Signatures: ${quantumSignatures.filter(s => s.signatureType === 'Exotic Particle Flux').length} awaiting classification
  - Current Threat Level: ${getRandomThreatLevel()}

Anomaly Prediction Engine:
  - Probable Anomalies Next 24h: ${Math.floor(Math.random() * 5)}
  - High-Risk Realms: ${realityShards.filter(s => s.structuralIntegrity < 60).map(s => s.name).slice(0, 3).join(', ') || 'None'}
  - Predictive Confidence: ${parseFloat((Math.random() * 20) + 70).toFixed(2)}%

Operational Log - Last 10 Entries:
${Array.from({ length: 10 }, (_, i) => {
    const action = ['Realm Monitored', 'Signature Analyzed', 'Event Logged', 'Config Update', 'System Check'][Math.floor(Math.random() * 5)];
    const target = realityShards[Math.floor(Math.random() * realityShards.length)]?.name || 'Nexus Core';
    const outcome = ['Success', 'Partial Success', 'Warning', 'Failure'][Math.floor(Math.random() * 4)];
    return `  - [${new Date(Date.now() - (i * 3600000)).toISOString().substring(11, 19)}] ${action} on ${target} - Outcome: ${outcome}`;
}).join('\n')}

System Diagnostics Report:
  - Quantum Processor Load: ${parseFloat((Math.random() * 80) + 10).toFixed(2)}%
  - Memory Matrix Utilization: ${parseFloat((Math.random() * 70) + 15).toFixed(2)}%
  - Hyperdimensional Cache Hit Rate: ${parseFloat((Math.random() * 10) + 85).toFixed(2)}%
  - Network Fabric Latency: ${parseFloat((Math.random() * 20)).toFixed(2)} ms (avg)
  - Power Grid Stability: ${parseFloat((Math.random() * 10) + 90).toFixed(2)}%
  - Thermal Regulation: Optimal (42.5°C avg)

Protocol Status:
  - SENTINEL Protocol (Threat Detection): Active (99.8% Coverage)
  - CHRONOS Protocol (Temporal Integrity): Active (No Major Deviations)
  - ODYSSEY Protocol (Exploration & Mapping): Active (67% Multiverse Mapped)
  - VANGUARD Protocol (Anomaly Response): ${nexusConfiguration.autoStabilizeAnomalies ? 'Automated by Core' : nexusConfiguration.agenticAutomationEnabled ? 'Agent-Assisted' : 'Manual Intervention Required'}
  - HARMONY Protocol (Inter-Reality Diplomacy): Active (Low Conflict Index)

Next Scheduled Maintenance:
  - Global Nexus Reboot: In 7 days (Minor Disruption Expected)
  - Quantum Core Calibration: In 3 days (High Priority)
  - Reality Fabric Patching: Ongoing (Distributed Micro-Patches)

Active Administrative Overrides:
  - No Overrides Active.
`}
                            </pre>
                        </div>
                    </div>
                    <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-xl min-h-[50vh] flex flex-col space-y-6 max-w-full mx-auto relative overflow-hidden">
                        <div className="absolute inset-0 opacity-0.5 pointer-events-none z-0" style={{ backgroundImage: `url('/assets/multiverse_grid_subtle.svg')`, backgroundSize: 'cover' }}></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-4 text-center">
                                Advanced Multiversal Operations Console
                            </h2>
                            <p className="text-gray-300 text-lg text-center max-w-2xl mx-auto mb-8">
                                Direct control interfaces for advanced functions, cross-reality resource management, and temporal-spatial manipulation.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-blue-700">
                                    <h3 className="text-2xl font-semibold text-blue-300 mb-3">Temporal Anomaly Resolution</h3>
                                    <p className="text-gray-400 mb-4">Identify and rectify chronological inconsistencies across reality strands.</p>
                                    <div className="flex flex-col space-y-3">
                                        <label htmlFor="temporalTargetShard" className="block text-sm font-medium text-gray-300">Target Reality Shard:</label>
                                        <select
                                            id="temporalTargetShard"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            defaultValue=""
                                        >
                                            <option value="">Select a Shard</option>
                                            {realityShards.filter(s => s.status !== 'Stable').map(shard => (
                                                <option key={`temp-${shard.id}`} value={shard.id}>{shard.name} ({shard.temporalVariance.toFixed(2)} ps)</option>
                                            ))}
                                        </select>
                                        <label htmlFor="temporalDeviation" className="block text-sm font-medium text-gray-300">Temporal Deviation (ps):</label>
                                        <input
                                            type="number"
                                            id="temporalDeviation"
                                            placeholder="Enter deviation"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => setGlobalAlert && setGlobalAlert({ message: "Initiating temporal recalibration protocol...", type: "warning" })}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Start Recalibration
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-green-700">
                                    <h3 className="text-2xl font-semibold text-green-300 mb-3">Resource Harmonic Balancing</h3>
                                    <p className="text-gray-400 mb-4">Optimize resource flow and prevent energy drain cascades by token transfer.</p>
                                    <div className="flex flex-col space-y-3">
                                        <label htmlFor="resourceSourceShard" className="block text-sm font-medium text-gray-300">Resource Source:</label>
                                        <select
                                            id="resourceSourceShard"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                            defaultValue=""
                                        >
                                            <option value="">Select Source Shard</option>
                                            {Object.values(multiversalTokenLedger).filter(a => a.balance > 0).map(account => (
                                                <option key={`res-src-${account.realmId}`} value={account.realmId}>{realityShards.find(s => s.id === account.realmId)?.name || account.realmId} ({account.balance.toFixed(2)} QCR)</option>
                                            ))}
                                        </select>
                                        <label htmlFor="resourceTargetShard" className="block text-sm font-medium text-gray-300">Resource Target:</label>
                                        <select
                                            id="resourceTargetShard"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                            defaultValue=""
                                        >
                                            <option value="">Select Target Shard</option>
                                            {Object.values(multiversalTokenLedger).filter(a => a.realmId !== (document.getElementById('resourceSourceShard') as HTMLSelectElement)?.value).map(account => (
                                                <option key={`res-tgt-${account.realmId}`} value={account.realmId}>{realityShards.find(s => s.id === account.realmId)?.name || account.realmId}</option>
                                            ))}
                                        </select>
                                        <label htmlFor="resourceAmount" className="block text-sm font-medium text-gray-300">Transfer Amount (QCR):</label>
                                        <input
                                            type="number"
                                            id="resourceAmount"
                                            placeholder="Enter amount"
                                            min="0.01"
                                            step="0.01"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <button
                                            onClick={() => {
                                                const senderId = (document.getElementById('resourceSourceShard') as HTMLSelectElement).value;
                                                const receiverId = (document.getElementById('resourceTargetShard') as HTMLSelectElement).value;
                                                const amountStr = (document.getElementById('resourceAmount') as HTMLInputElement).value;
                                                const amount = parseFloat(amountStr);
                                                if (senderId && receiverId && !isNaN(amount)) {
                                                    handleInitiateTokenTransfer(senderId, receiverId, amount);
                                                } else {
                                                    setGlobalAlert && setGlobalAlert({ message: "Please select source, target, and amount for resource balancing.", type: "warning" });
                                                }
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                                        >
                                            Initiate Harmonic Balance
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-red-700">
                                    <h3 className="text-2xl font-semibold text-red-300 mb-3">Dimensional Incursion Shield</h3>
                                    <p className="text-gray-400 mb-4">Deploy prophylactic shields against unauthorized dimensional breaches.</p>
                                    <div className="flex flex-col space-y-3">
                                        <label htmlFor="shieldTargetShard" className="block text-sm font-medium text-gray-300">Target Reality Shard:</label>
                                        <select
                                            id="shieldTargetShard"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            defaultValue=""
                                        >
                                            <option value="">Select a Shard</option>
                                            {realityShards.map(shard => (
                                                <option key={`shield-${shard.id}`} value={shard.id}>{shard.name}</option>
                                            ))}
                                        </select>
                                        <label htmlFor="shieldStrength" className="block text-sm font-medium text-gray-300">Shield Strength (%):</label>
                                        <input
                                            type="number"
                                            id="shieldStrength"
                                            placeholder="0-100"
                                            min="0" max="100"
                                            className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        <button
                                            onClick={() => setGlobalAlert && setGlobalAlert({ message: "Deploying dimensional integrity fields...", type: "danger" })}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                                        >
                                            Deploy Shield
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 p-6 bg-gray-850 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold text-white mb-4">Cognitive Resonance Monitor (CRM)</h2>
                                <p className="text-gray-400 mb-6">Real-time analysis of the collective cognitive resonance across monitored reality shards, identifying potential ideological drifts or emergent collective consciousness patterns.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {realityShards.slice(0, 8).map(shard => (
                                        <div key={`crm-${shard.id}`} className="bg-gray-800 p-4 rounded-md border border-gray-700">
                                            <h4 className="text-xl font-semibold text-purple-300 mb-2">{shard.name}</h4>
                                            <p className="text-gray-400 text-sm">Collective Cohesion Index: <span className="text-green-400">{(Math.random() * 0.3 + 0.7).toFixed(3)}</span> ({(Math.random() * 10).toFixed(2)}% vs. avg)</p>
                                            <p className="text-gray-400 text-sm">Sentience Baseline Fluctuation: <span className="text-yellow-400">{(Math.random() * 0.05 + 0.95).toFixed(4)}</span> ÂµHz</p>
                                            <p className="text-gray-400 text-sm">Emergent Thought-Form Detected: <span className={Math.random() > 0.8 ? 'text-red-400' : 'text-gray-400'}>{Math.random() > 0.8 ? 'True' : 'False'}</span></p>
                                            <p className="text-gray-400 text-sm">Dominant Emotional Spectrum: <span className="text-cyan-400">{['Neutral', 'Hopeful', 'Anxious', 'Curious'][Math.floor(Math.random() * 4)]}</span></p>
                                            <button
                                                onClick={() => setGlobalAlert && setGlobalAlert({ message: `Initiating deep cognitive scan for ${shard.name}...`, type: "info" })}
                                                className="mt-3 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs"
                                            >
                                                Deep Scan Cognitive Fabric
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-6 text-right">Note: Comprehensive CRM data requires significant processing; displaying summarized metrics.</p>
                            </div>

                            <div className="mt-8 p-6 bg-gray-850 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold text-white mb-4">Inter-Reality Diplomatic Interface</h2>
                                <p className="text-gray-400 mb-6">Facilitate communication and negotiation between autonomous entities or collective consciousnesses inhabiting different reality shards.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                                        <h4 className="text-xl font-semibold text-orange-300 mb-2">Initiate Diplomatic Channel</h4>
                                        <label htmlFor="diplomacySource" className="block text-sm font-medium text-gray-300">Originating Reality:</label>
                                        <select id="diplomacySource" className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white mb-3">
                                            {realityShards.slice(0, 5).map(shard => (<option key={`dipl-src-${shard.id}`} value={shard.id}>{shard.name}</option>))}
                                        </select>
                                        <label htmlFor="diplomacyTarget" className="block text-sm font-medium text-gray-300">Target Reality:</label>
                                        <select id="diplomacyTarget" className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white mb-3">
                                            {realityShards.slice(5, 10).map(shard => (<option key={`dipl-tgt-${shard.id}`} value={shard.id}>{shard.name}</option>))}
                                        </select>
                                        <label htmlFor="messageBody" className="block text-sm font-medium text-gray-300">Message (Encrypted Quantum Entangled Protocol):</label>
                                        <textarea id="messageBody" rows={4} className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white mb-3" placeholder="Enter diplomatic message..."></textarea>
                                        <button
                                            onClick={() => setGlobalAlert && setGlobalAlert({ message: "Transmitting diplomatic overture via QEP...", type: "info" })}
                                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
                                        >
                                            Send Diplomatic Transmission
                                        </button>
                                    </div>
                                    <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                                        <h4 className="text-xl font-semibold text-purple-300 mb-2">Active Diplomatic Engagements</h4>
                                        <div className="space-y-3 overflow-y-auto max-h-64 custom-scrollbar">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div key={`engagement-${i}`} className="bg-gray-700 p-3 rounded-md border border-gray-600 text-sm">
                                                    <p><strong className="text-purple-300">Engagement ID:</strong> ENG-{generateRandomId().substring(0, 8).toUpperCase()}</p>
                                                    <p><strong className="text-purple-300">Realms:</strong> {realityShards[i]?.name || 'Unknown'} & {realityShards[i+5]?.name || 'Unknown'}</p>
                                                    <p><strong className="text-purple-300">Status:</strong> <span className={i % 2 === 0 ? 'text-green-400' : 'text-yellow-400'}>{i % 2 === 0 ? 'Negotiating' : 'Awaiting Response'}</span></p>
                                                    <p className="text-xs text-gray-500 mt-1">Last Update: {new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setGlobalAlert && setGlobalAlert({ message: "Refreshing diplomatic status logs...", type: "info" })}
                                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium mt-4"
                                        >
                                            Refresh Engagements
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-gray-850 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold text-white mb-4">Omni-Dimensional Data Stream Monitor</h2>
                                <p className="text-gray-400 mb-6">Live feed of data packets traversing the interdimensional nexus, with real-time integrity and threat assessment.</p>
                                <div className="overflow-y-auto max-h-80 custom-scrollbar p-4 bg-gray-900 rounded-md border border-gray-700 font-mono text-sm">
                                    {Array.from({ length: 20 }).map((_, i) => {
                                        const source = realityShards[Math.floor(Math.random() * realityShards.length)]?.name || 'UNKNOWN_SOURCE';
                                        const dest = realityShards[Math.floor(Math.random() * realityShards.length)]?.name || 'UNKNOWN_DEST';
                                        const packetType = ['Quantum Data Burst', 'Temporal Signature Payload', 'Cognitive Resonance Packet', 'Resource Transfer Manifest'][Math.floor(Math.random() * 4)];
                                        const integrity = Math.random();
                                        const threat = Math.random();
                                        const timestamp = new Date(Date.now() - (i * 1000 + Math.random() * 500)).toISOString().substring(11, 23);
                                        return (
                                            <p key={`data-stream-${i}`} className={`mb-1 ${threat > 0.7 ? 'text-red-400' : integrity < 0.8 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                [{timestamp}] {source} {'->'} {dest} | {packetType} | Integrity: {(integrity * 100).toFixed(1)}% | Threat: {(threat * 100).toFixed(1)}%
                                            </p>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 flex justify-between items-center text-gray-400">
                                    <span>Total Data Throughput: {parseFloat((Math.random() * 500000).toFixed(2))} Exabytes/s</span>
                                    <button
                                        onClick={() => setGlobalAlert && setGlobalAlert({ message: "Initiating data integrity scan on active streams...", type: "info" })}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                                    >
                                        Initiate Integrity Scan
                                    </button>
                                </div>
                            </div>
                            <div className="mt-8 p-6 bg-gray-850 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold text-white mb-4">Interdimensional Event Horizon Controller</h2>
                                <p className="text-gray-400 mb-6">Advanced controls for managing and initiating event horizons for reality isolation, merging, or pruning protocols. Use with extreme caution.</p>
                                <div className="flex flex-col space-y-4">
                                    <label htmlFor="horizonTarget" className="block text-lg font-medium text-red-300">Target Reality Set:</label>
                                    <textarea
                                        id="horizonTarget"
                                        rows={3}
                                        className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Enter Reality Shard IDs for target set (comma-separated)..."
                                    ></textarea>
                                    <label htmlFor="horizonType" className="block text-lg font-medium text-red-300">Event Horizon Type:</label>
                                    <select
                                        id="horizonType"
                                        className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="Isolation">Isolation Protocol (Containment)</option>
                                        <option value="Fusion">Fusion Protocol (Reality Merging)</option>
                                        <option value="Pruning">Pruning Protocol (Reality Deletion) - EXTREME CAUTION</option>
                                        <option value="Reversal">Temporal Reversal Horizon (Undo Changes)</option>
                                    </select>
                                    <div className="flex items-center space-x-3">
                                        <input type="checkbox" id="confirmAuthorization" className="h-5 w-5 rounded text-red-600 focus:ring-red-500 bg-gray-700 border-gray-600" />
                                        <label htmlFor="confirmAuthorization" className="text-red-400 text-sm">I understand the irreversible consequences and confirm authorization.</label>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (operatorClearance !== 'Omega') {
                                                setGlobalAlert && setGlobalAlert({ message: "Insufficient clearance for Event Horizon activation. Omega-level authorization required.", type: "error" });
                                                return;
                                            }
                                            setGlobalAlert && setGlobalAlert({ message: "Critical Warning: Initiating Event Horizon protocol. This action is irreversible without Temporal Reversal Horizon.", type: "critical" });
                                        }}
                                        className={`w-full px-6 py-3 rounded-md transition-colors font-bold text-xl uppercase tracking-wider ${
                                            operatorClearance === 'Omega' ? 'bg-red-800 hover:bg-red-900 text-white' : 'bg-gray-600 cursor-not-allowed text-gray-400'
                                        }`}
                                        disabled={operatorClearance !== 'Omega'}
                                    >
                                        Activate Event Horizon
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-gray-850 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold text-white mb-4">Multiversal Economic Synthesizer</h2>
                                <p className="text-gray-400 mb-6">Simulate and predict economic interactions and value transfers across diverse reality constructs and their unique resource models.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                                        <h4 className="text-xl font-semibold text-yellow-300 mb-2">Simulate Trade Route</h4>
                                        <label htmlFor="tradeOrigin" className="block text-sm font-medium text-gray-300">Origin Realm:</label>
                                        <select id="tradeOrigin" className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white mb-3">
                                            {realityShards.slice(0, 5).map(shard => (<option key={`trade-src-${shard.id}`} value={shard.id}>{shard.name}</option>))}
                                        </select>
                                        <label htmlFor="tradeDestination" className="block text-sm font-medium text-gray-300">Destination Realm:</label>
                                        <select id="tradeDestination" className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white mb-3">
                                            {realityShards.slice(5, 10).map(shard => (<option key={`trade-dest-${shard.id}`} value={shard.id}>{shard.name}</option>))}
                                        </select>
                                        <label htmlFor="commodity" className="block text-sm font-medium text-gray-300">Commodity:</label>
                                        <input type="text" id="commodity" placeholder="e.g., Chronos Crystals, Exa-Energy" className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white mb-3" />
                                        <button
                                            onClick={() => setGlobalAlert && setGlobalAlert({ message: "Running inter-reality trade simulation...", type: "info" })}
                                            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium"
                                        >
                                            Run Trade Simulation
                                        </button>
                                    </div>
                                    <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                                        <h4 className="text-xl font-semibold text-green-300 mb-2">Economic Health Indicators</h4>
                                        <div className="space-y-2">
                                            <p><strong className="text-green-300">Global Market Index:</strong> <span className="text-white">{(Math.random() * 2000 + 1000).toFixed(2)}</span> ({Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)}%)</p>
                                            <p><strong className="text-green-300">Cross-Reality Liquidity:</strong> <span className="text-white">{Object.values(multiversalTokenLedger).reduce((sum, acc) => sum + acc.balance, 0).toFixed(2)} QCR ({(Math.random() * 10).toFixed(2)}% vs. peak)</span></p>
                                            <p><strong className="text-green-300">Inflationary Pressure:</strong> <span className={Math.random() > 0.6 ? 'text-red-400' : 'text-green-400'}>{(Math.random() * 8).toFixed(2)}% ({Math.random() > 0.5 ? 'Rising' : 'Stable'})</span></p>
                                            <p><strong className="text-green-300">Deflationary Risk:</strong> <span className={Math.random() > 0.8 ? 'text-yellow-400' : 'text-green-400'}>{(Math.random() * 3).toFixed(2)}%</span></p>
                                            <p><strong className="text-green-300">Interdimensional Debt Ratio:</strong> <span className="text-white">{(Math.random() * 0.5 + 0.5).toFixed(2)}</span></p>
                                        </div>
                                        <button
                                            onClick={() => setGlobalAlert && setGlobalAlert({ message: "Generating comprehensive economic forecast...", type: "info" })}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium mt-4"
                                        >
                                            Generate Forecast
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureGuard>
    );
};

export default MultiverseNexusView;