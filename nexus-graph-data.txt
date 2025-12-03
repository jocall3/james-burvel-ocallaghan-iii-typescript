// types/models/dashboard/nexus-graph-data.ts
import type { NexusNode } from './nexus-node';
import type { NexusLink } from './nexus-link';

export interface NexusGraphData {
    nodes: NexusNode[];
    links: NexusLink[];
}