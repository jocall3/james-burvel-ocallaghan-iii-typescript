// types/models/dashboard/nexus-node.ts
export interface NexusNode {
    id: string;
    label: string;
    type: string; // e.g., 'Transaction', 'Goal', 'Anomaly'
    value: number; // For sizing the node
    color: string;
}