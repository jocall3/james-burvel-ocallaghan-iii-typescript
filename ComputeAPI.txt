// google/cloud/services/ComputeAPI.ts
// The Summoning Glyphs. A set of incantations for commanding the Golems (VMs) of the cloud.

import { VirtualMachine, VMStatus } from '../types';

// =====================================================================================================================
// === CORE API TYPES AND INTERFACES (Expanded to support an entire compute universe) ==================================
// =====================================================================================================================

export interface Disk {
    id: string;
    name: string;
    sizeGb: number;
    type: 'pd-standard' | 'pd-ssd' | 'local-ssd' | 'hyperdisk-extreme' | 'superdisk-quantum-weave'; // Added futuristic types
    zone: string;
    status: 'READY' | 'CREATING' | 'DELETING' | 'RESIZING' | 'REPLICATING' | 'SNAPSHOT_IN_PROGRESS';
    sourceImage?: string;
    attachedTo?: string; // VM ID
    encryptionKey?: string; // Reference to KMS key
    replicationPolicy?: 'NONE' | 'REGIONAL' | 'GLOBAL' | 'INTERSTELLAR'; // Data replication
}

export interface NetworkInterface {
    network: string; // VPC Network ID
    subnetwork: string; // Subnetwork ID
    primaryIpAddress: string;
    accessConfigs: Array<{
        type: 'ONE_TO_ONE_NAT' | 'SERVERLESS_VPC_ACCESS' | 'QUANTUM_ENCRYPTED_TUNNEL';
        name: string;
        natIp?: string;
    }>;
    dnsRecords?: Array<{ hostname: string; ipAddress: string; type: 'A' | 'AAAA' | 'CNAME' }>;
    securityPolicy?: string; // Reference to network security policy
}

export interface Network {
    id: string;
    name: string;
    description?: string;
    autoCreateSubnetworks: boolean;
    gatewayIPv4: string;
    creationTimestamp: string;
    routingMode: 'REGIONAL' | 'GLOBAL' | 'GALACTIC'; // Enhanced routing modes
    mtu: number;
    peeringConnections?: Array<{ peerNetwork: string; state: 'ACTIVE' | 'INACTIVE' | 'PENDING' }>;
    flowLogsEnabled: boolean;
}

export interface Subnet {
    id: string;
    name: string;
    network: string; // Parent network ID
    region: string;
    ipCidrRange: string;
    gatewayAddress: string;
    creationTimestamp: string;
    purpose?: 'PRIVATE_RFC_1918' | 'REGIONAL_MANAGED_PROXY' | 'HYPER_SEGMENT';
    privateIpGoogleAccess: boolean;
    ipv6CidrRange?: string;
}

export interface FirewallRule {
    id: string;
    name: string;
    network: string;
    direction: 'INGRESS' | 'EGRESS';
    priority: number;
    sourceRanges: string[];
    destinationRanges: string[];
    sourceTags?: string[]; // VM instance tags
    targetTags?: string[]; // VM instance tags
    allowed: Array<{
        protocol: string; // e.g., 'tcp', 'udp', 'icmp', 'all'
        ports?: string[]; // e.g., ['80', '443', '22', '10000-20000']
    }>;
    denied?: Array<{
        protocol: string;
        ports?: string[];
    }>;
    disabled: boolean;
    loggingEnabled: boolean;
}

export interface LoadBalancer {
    id: string;
    name: string;
    type: 'HTTP_EXTERNAL' | 'TCP_EXTERNAL' | 'INTERNAL' | 'GLOBAL_DISTRIBUTED';
    region: string; // Can be 'global' for global LBs
    ipAddress: string;
    targetPools?: string[]; // For TCP/UDP
    urlMap?: string; // For HTTP(S) - ID of the URL map
    backendServices: string[]; // IDs of backend services
    status: 'PROVISIONING' | 'SERVING' | 'DEPROVISIONING' | 'SCALING_UP' | 'SCALING_DOWN';
    sslCertificates?: string[];
    cdnEnabled: boolean;
    advancedHealthChecks?: Array<{ protocol: string; port: number; requestPath?: string }>;
}

export interface BackendService {
    id: string;
    name: string;
    protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'SSL' | 'UDP';
    loadBalancingScheme: 'EXTERNAL' | 'INTERNAL' | 'GLOBAL';
    backends: Array<{ group: string; balancingMode: 'UTILIZATION' | 'RATE' | 'CONNECTION' }>; // Instance group IDs
    healthCheck: string; // Health check ID
    timeoutSec: number;
    portName: string; // Name of the port on the instance group
    enableCDN: boolean;
    affinityCookieTtlSec?: number;
}

export interface InstanceTemplate {
    id: string;
    name: string;
    description?: string;
    properties: {
        machineType: string;
        minCpuPlatform?: string; // e.g., 'Intel Skylake', 'AMD Rome', 'Quantum Aether'
        disks: Array<{
            boot: boolean;
            autoDelete: boolean;
            initializeParams: {
                sourceImage: string;
                diskSizeGb: number;
                diskType: string;
                kmsKey?: string;
            };
        }>;
        networkInterfaces: Array<{
            network: string;
            subnetwork: string;
            accessConfigs?: Array<{ type: 'ONE_TO_ONE_NAT' | 'QUANTUM_ENCRYPTED_TUNNEL', natIp?: string }>;
        }>;
        metadata?: { [key: string]: string };
        tags?: string[];
        labels?: { [key: string]: string };
        scheduling?: {
            preemptible: boolean;
            onHostMaintenance: 'MIGRATE' | 'TERMINATE';
            automaticRestart: boolean;
            nodeAffinities?: Array<{ key: string; operator: 'IN' | 'NOT_IN'; values: string[] }>;
        };
        serviceAccounts?: Array<{ email: string; scopes: string[] }>;
        guestAccelerators?: Array<{
            acceleratorType: string; // e.g., 'nvidia-tesla-t4', 'tpu-v3-8', 'quantum-processor-x1'
            acceleratorCount: number;
        }>;
        shieldedInstanceConfig?: {
            enableSecureBoot: boolean;
            enableVtpm: boolean;
            enableIntegrityMonitoring: boolean;
        };
        confidentialInstanceConfig?: {
            enableConfidentialCompute: boolean;
        };
        reservationAffinity?: {
            consumeReservationType: 'ANY_SPECIFIC_RESERVATION' | 'NO_RESERVATION' | 'SPECIFIC_RESERVATION_ONLY';
            key?: string;
            values?: string[];
        };
    };
}

export interface InstanceGroup {
    id: string;
    name: string;
    zone?: string; // For zonal Migs, optional for regional
    region?: string; // For regional Migs
    instanceTemplate: string; // ID of the instance template
    targetSize: number;
    currentSize: number;
    status: 'PROVISIONING' | 'RUNNING' | 'STOPPED' | 'UPDATING' | 'ERROR';
    autoScalerId?: string;
    namedPorts?: Array<{ name: string; port: number }>; // For load balancing
    distributionPolicy?: { targetShape: 'ANY' | 'EVEN' | 'BALANCED'; zones: string[] }; // For regional Migs
    updatePolicy?: {
        type: 'OPPORTUNISTIC' | 'PROACTIVE';
        minimalAction: 'RESTART' | 'REPLACE';
        maxSurge: number;
        maxUnavailable: number;
    };
}

export interface AutoScalingPolicy {
    id: string;
    name: string;
    instanceGroup: string; // ID of the instance group
    minNumReplicas: number;
    maxNumReplicas: number;
    coolDownPeriodSec: number;
    cpuUtilization?: { target: number }; // Target CPU utilization percentage (0.1 - 0.9)
    customMetrics?: Array<{
        name: string;
        target: number;
        metricType: 'GAUGE' | 'DELTA_PER_SECOND' | 'DELTA_PER_MINUTE';
        filter?: string; // Stackdriver metric filter
    }>;
    loadBalancingUtilization?: { target: number }; // Target utilization based on load balancer
    predictiveScaling?: 'OFF' | 'OPTIMIZE_AVAILABILITY' | 'OPTIMIZE_UTILIZATION';
    status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
}

export interface BackupPolicy {
    id: string;
    name: string;
    resourceType: 'VM' | 'DISK' | 'DATABASE' | 'FILE_SYSTEM' | 'CONTAINER_VOLUME';
    resourceId: string; // VM ID, Disk ID, etc.
    schedule: string; // e.g., 'daily', 'weekly', 'cron:0 2 * * *'
    retentionDays: number;
    targetLocation: string; // e.g., 'gs://my-backup-bucket'
    status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    encryptionEnabled: boolean;
    versioningEnabled: boolean;
    recoveryPointObjectiveHrs?: number; // RPO
    recoveryTimeObjectiveHrs?: number; // RTO
}

export interface QuantumCircuit {
    id: string;
    name: string;
    qubitCount: number;
    status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'QUEUED' | 'OPTIMIZING';
    gateSequence: string[]; // Simplified representation of a quantum program (e.g., ['H(0)', 'CNOT(0,1)', 'Measure(0,1)'])
    results?: any; // JSON object containing measurement outcomes, states, etc.
    targetProcessor: 'SIMULATOR' | 'QUANTUM_ANNEALER' | 'UNIVERSAL_GATE_MODEL' | 'TOPOLOGICAL_QUANTUM_COMPUTER';
    executionTimeMs?: number;
    costUsd?: number;
    fidelityScore?: number; // How accurate the quantum computation was
}

export interface EdgeDeviceDeployment {
    id: string;
    name: string;
    location: string; // Physical location or gateway identifier
    deviceType: string; // e.g., 'AIY Vision Kit', 'Coral Dev Board', 'Custom IoT Gateway'
    status: 'DEPLOYED' | 'PROVISIONING' | 'OFFLINE' | 'UPDATING' | 'FAULTY';
    deployedServices: string[]; // e.g., ['inference-engine', 'data-collector', 'local-data-store']
    resourceCapacity: {
        cpuCores: number;
        memoryGb: number;
        storageGb: number;
        gpuUnits?: number; // For AI at the edge
        tpuUnits?: number;
    };
    networkConnectivity: 'CELLULAR' | 'WIFI' | 'ETHERNET' | 'SATELLITE';
    softwareVersion: string;
    lastHeartbeat: string; // ISO string
}

export interface InterdimensionalGateway {
    id: string;
    name: string;
    sourceCloud: string; // e.g., 'GCP-us-central1', 'Azure-eastus', 'AWS-eu-west-1', 'OnPremise-DC1'
    targetCloud: string;
    status: 'ACTIVE' | 'CONFIGURING' | 'ERROR' | 'DEPROVISIONING' | 'UPGRADING';
    dataThroughputGbps: number;
    latencyMs: number;
    securityPolicies: string[]; // List of applied security policy IDs
    connectionType: 'VPN' | 'INTERCONNECT' | 'QUANTUM_ENTANGLEMENT_TUNNEL';
    costPerGbUsd?: number;
    uptimePercentage?: number;
}

export interface ServiceMeshGateway {
    id: string;
    name: string;
    vpcNetwork: string;
    namespace: string;
    ingressListeners: Array<{ port: number; protocol: 'HTTP' | 'HTTPS' | 'TCP' }>;
    egressRules: Array<{ host: string; port: number; protocol: 'HTTP' | 'TCP' }>;
    status: 'ACTIVE' | 'PROVISIONING' | 'ERROR';
    proxyVersion: string;
}

export interface BlockchainNode {
    id: string;
    name: string;
    blockchainType: 'ETHEREUM' | 'HYPERLEDGER_FABRIC' | 'QUANTUM_LEDGER';
    networkId: string; // e.g., 'mainnet', 'testnet'
    nodeType: 'FULL' | 'LIGHT' | 'VALIDATOR' | 'MINER';
    status: 'SYNCING' | 'ACTIVE' | 'OFFLINE' | 'ERROR';
    vmId: string; // Underlying VM running the node
    diskSizeGb: number;
    apiEndpoints: { rpc: string; websocket?: string };
}

export interface SustainabilityReport {
    resourceId: string;
    resourceType: 'VM' | 'DISK' | 'NETWORK' | 'PROJECT';
    carbonEmissionsKgCo2e: number;
    energyConsumptionKwh: number;
    regionEfficiencyScore: number; // 0-100, higher is better (PUE factor derived)
    optimizedRecommendations: string[]; // AI-driven suggestions for greener operations
    lastUpdated: string;
}

export type ExtendedVMStatus = VMStatus | 'PROVISIONING' | 'MAINTENANCE' | 'SNAPSHOT_CREATING' | 'MIGRATING' | 'REPAIRING' | 'SCALING_UP' | 'RECONFIGURING';
// Update VirtualMachine interface to reflect added details
declare module '../types' {
    interface VirtualMachine {
        zone?: string;
        creationTimestamp?: string;
        disks?: string[]; // IDs of attached disks
        networkInterfaces?: NetworkInterface[];
        metadata?: { [key: string]: string };
        tags?: string[];
        labels?: { [key: string]: string }; // For general tagging/classification
        machineFamily?: string; // e.g., 'e2', 'n2', 'c2', 't2d'
        cpuPlatform?: string; // e.g., 'Intel Haswell', 'AMD EPYC Milan'
        guestAccelerators?: Array<{
            acceleratorType: string; // e.g., 'nvidia-tesla-t4', 'tpu-v3-8'
            acceleratorCount: number;
        }>;
        scheduling?: {
            preemptible: boolean;
            onHostMaintenance: 'MIGRATE' | 'TERMINATE' | 'DEFAULT';
            automaticRestart: boolean;
            minNodeCpus?: number; // Minimum CPUs for specific scheduling
            nodeAffinities?: Array<{ key: string; operator: 'IN' | 'NOT_IN'; values: string[] }>;
        };
        reservationAffinity?: {
            consumeReservationType: 'ANY_SPECIFIC_RESERVATION' | 'NO_RESERVATION' | 'SPECIFIC_RESERVATION_ONLY';
            key?: string;
            values?: string[];
        };
        shieldedInstanceConfig?: {
            enableSecureBoot: boolean;
            enableVtpm: boolean;
            enableIntegrityMonitoring: boolean;
        };
        confidentialInstanceConfig?: {
            enableConfidentialCompute: boolean;
        };
        serviceAccount?: {
            email: string;
            scopes: string[];
        };
        lastMaintenanceEvent?: {
            type: 'LIVE_MIGRATION' | 'HOST_ERROR' | 'REPAIR';
            timestamp: string;
        };
        bootDiskSizeGb?: number; // Size of the primary boot disk
        canIpForward?: boolean; // If the VM can act as a router
        status: ExtendedVMStatus; // Use extended status
    }
}

// =====================================================================================================================
// === MOCK DATA STORES (Simulating a persistent backend for billions of resources) ====================================
// =====================================================================================================================
let MOCK_VMS: VirtualMachine[] = [
    {
        id: 'vm-1', name: 'web-server-prod-1', status: 'RUNNING', region: 'us-central1', zone: 'us-central1-a', type: 'e2-medium', creationTimestamp: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
        disks: ['disk-1'],
        networkInterfaces: [{ network: 'vpc-prod', subnetwork: 'subnet-us-central1-prod', primaryIpAddress: '10.0.1.10', accessConfigs: [{ type: 'ONE_TO_ONE_NAT', name: 'External NAT', natIp: '34.X.X.1' }] }],
        metadata: { 'env': 'prod', 'role': 'webserver' }, tags: ['web', 'prod'], labels: { 'app': 'frontend' }
    },
    {
        id: 'vm-2', name: 'db-server-prod-1', status: 'RUNNING', region: 'us-central1', zone: 'us-central1-a', type: 'n2-standard-4', creationTimestamp: new Date(Date.now() - 3600000 * 24 * 45).toISOString(),
        disks: ['disk-2'],
        networkInterfaces: [{ network: 'vpc-prod', subnetwork: 'subnet-us-central1-prod', primaryIpAddress: '10.0.1.11', accessConfigs: [{ type: 'ONE_TO_ONE_NAT', name: 'External NAT', natIp: '34.X.X.2' }] }],
        metadata: { 'env': 'prod', 'role': 'database' }, tags: ['db', 'prod'], labels: { 'app': 'backend' }
    },
    {
        id: 'vm-3', name: 'batch-processor-1', status: 'STOPPED', region: 'europe-west1', zone: 'europe-west1-b', type: 'c2-standard-8', creationTimestamp: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
        disks: [],
        networkInterfaces: [{ network: 'vpc-prod', subnetwork: 'subnet-eu-west1-prod', primaryIpAddress: '10.0.2.10', accessConfigs: [] }],
        metadata: { 'env': 'staging', 'role': 'batch' }, tags: ['batch', 'staging'], labels: { 'workflow': 'etl' }
    },
    {
        id: 'vm-4', name: 'gpu-trainer-alpha', status: 'RUNNING', region: 'us-west1', zone: 'us-west1-a', type: 'n1-standard-8', guestAccelerators: [{ acceleratorType: 'nvidia-tesla-t4', acceleratorCount: 1 }], creationTimestamp: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        disks: ['disk-ml-data-1'],
        networkInterfaces: [{ network: 'vpc-dev', subnetwork: 'subnet-us-west1-dev', primaryIpAddress: '192.168.1.5', accessConfigs: [] }],
        metadata: { 'env': 'dev', 'role': 'ml-trainer', 'gpu-type': 't4' }, tags: ['ml', 'gpu'], labels: { 'project': 'ai-research' }
    },
    {
        id: 'vm-5', name: 'quantum-interface-node', status: 'PROVISIONING', region: 'us-east1', zone: 'us-east1-b', type: 'e2-small', creationTimestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        disks: [],
        networkInterfaces: [{ network: 'vpc-quantum-net', subnetwork: 'subnet-us-east1-quantum', primaryIpAddress: '172.16.0.10', accessConfigs: [{ type: 'QUANTUM_ENCRYPTED_TUNNEL', name: 'Quantum Tunnel' }] }],
        metadata: { 'env': 'experimental', 'role': 'quantum-gateway' }, tags: ['quantum', 'experimental'], labels: { 'area': 'futuristic-compute' }
    },
];

let MOCK_DISKS: Disk[] = [
    { id: 'disk-1', name: 'boot-disk-vm1', sizeGb: 50, type: 'pd-ssd', zone: 'us-central1-a', status: 'READY', attachedTo: 'vm-1', encryptionKey: 'kms-key-1' },
    { id: 'disk-2', name: 'data-disk-db1', sizeGb: 200, type: 'pd-standard', zone: 'us-central1-a', status: 'READY', attachedTo: 'vm-2', replicationPolicy: 'REGIONAL' },
    { id: 'disk-ml-data-1', name: 'ml-data-disk', sizeGb: 500, type: 'pd-ssd', zone: 'us-west1-a', status: 'READY', attachedTo: 'vm-4' },
    { id: 'disk-orphan-123', name: 'orphaned-volume', sizeGb: 100, type: 'pd-standard', zone: 'us-central1-b', status: 'READY', attachedTo: undefined },
];

let MOCK_NETWORKS: Network[] = [
    { id: 'vpc-prod', name: 'production-vpc', description: 'Main production network', autoCreateSubnetworks: true, gatewayIPv4: '10.0.0.1', creationTimestamp: new Date().toISOString(), routingMode: 'GLOBAL', mtu: 1460, flowLogsEnabled: true },
    { id: 'vpc-dev', name: 'development-vpc', description: 'Development network', autoCreateSubnetworks: false, gatewayIPv4: '192.168.0.1', creationTimestamp: new Date().toISOString(), routingMode: 'REGIONAL', mtu: 1500, flowLogsEnabled: false },
    { id: 'vpc-quantum-net', name: 'quantum-secure-network', description: 'Isolated network for quantum compute interfaces', autoCreateSubnetworks: false, gatewayIPv4: '172.16.0.1', creationTimestamp: new Date().toISOString(), routingMode: 'GLOBAL', mtu: 1460, flowLogsEnabled: true },
];

let MOCK_SUBNETS: Subnet[] = [
    { id: 'subnet-us-central1-prod', name: 'prod-us-central1', network: 'vpc-prod', region: 'us-central1', ipCidrRange: '10.0.1.0/24', gatewayAddress: '10.0.1.1', creationTimestamp: new Date().toISOString(), privateIpGoogleAccess: true },
    { id: 'subnet-eu-west1-prod', name: 'prod-eu-west1', network: 'vpc-prod', region: 'europe-west1', ipCidrRange: '10.0.2.0/24', gatewayAddress: '10.0.2.1', creationTimestamp: new Date().toISOString(), privateIpGoogleAccess: true },
    { id: 'subnet-us-west1-dev', name: 'dev-us-west1', network: 'vpc-dev', region: 'us-west1', ipCidrRange: '192.168.1.0/24', gatewayAddress: '192.168.1.1', creationTimestamp: new Date().toISOString(), privateIpGoogleAccess: false },
    { id: 'subnet-us-east1-quantum', name: 'quantum-us-east1', network: 'vpc-quantum-net', region: 'us-east1', ipCidrRange: '172.16.0.0/28', gatewayAddress: '172.16.0.1', creationTimestamp: new Date().toISOString(), purpose: 'HYPER_SEGMENT', privateIpGoogleAccess: true },
];

let MOCK_FIREWALL_RULES: FirewallRule[] = [
    { id: 'fw-allow-ssh', name: 'allow-ssh', network: 'vpc-prod', direction: 'INGRESS', priority: 1000, sourceRanges: ['0.0.0.0/0'], destinationRanges: [], allowed: [{ protocol: 'tcp', ports: ['22'] }], disabled: false, loggingEnabled: true },
    { id: 'fw-allow-http', name: 'allow-http', network: 'vpc-prod', direction: 'INGRESS', priority: 1000, sourceRanges: ['0.0.0.0/0'], destinationRanges: [], allowed: [{ protocol: 'tcp', ports: ['80', '443'] }], disabled: false, loggingEnabled: true },
    { id: 'fw-internal-db', name: 'internal-db-access', network: 'vpc-prod', direction: 'INGRESS', priority: 600, sourceTags: ['web-server'], targetTags: ['db'], allowed: [{ protocol: 'tcp', ports: ['5432', '3306'] }], destinationRanges: [], disabled: false, loggingEnabled: false },
];

let MOCK_BACKEND_SERVICES: BackendService[] = [
    { id: 'bs-web-prod', name: 'web-prod-backend', protocol: 'HTTP', loadBalancingScheme: 'EXTERNAL', backends: [{ group: 'ig-web-prod', balancingMode: 'UTILIZATION' }], healthCheck: 'hc-http-80', timeoutSec: 30, portName: 'http', enableCDN: true },
];

let MOCK_LOAD_BALANCERS: LoadBalancer[] = [
    { id: 'lb-web-prod', name: 'prod-web-lb', type: 'HTTP_EXTERNAL', region: 'global', ipAddress: '35.X.Y.Z', backendServices: ['bs-web-prod'], status: 'SERVING', cdnEnabled: true, sslCertificates: ['cert-prod-web'] },
];

let MOCK_INSTANCE_TEMPLATES: InstanceTemplate[] = [
    {
        id: 'it-web-prod-v1',
        name: 'web-server-template-v1',
        description: 'Template for production web servers',
        properties: {
            machineType: 'e2-medium',
            disks: [{ boot: true, autoDelete: true, initializeParams: { sourceImage: 'projects/debian-cloud/global/images/debian-11-bullseye-v20230306', diskSizeGb: 30, diskType: 'pd-ssd' } }],
            networkInterfaces: [{ network: 'vpc-prod', subnetwork: 'subnet-us-central1-prod' }],
            metadata: { 'startup-script': 'sudo apt update && sudo apt install nginx -y' },
            tags: ['web-server', 'prod'],
            labels: { 'app': 'frontend' },
        },
    },
    {
        id: 'it-ml-worker-gpu',
        name: 'ml-worker-gpu-template',
        description: 'Template for ML training workers with GPU',
        properties: {
            machineType: 'n1-standard-8',
            guestAccelerators: [{ acceleratorType: 'nvidia-tesla-v100', acceleratorCount: 1 }],
            disks: [{ boot: true, autoDelete: true, initializeParams: { sourceImage: 'projects/ubuntu-os-cloud/global/images/ubuntu-2004-lts', diskSizeGb: 50, diskType: 'pd-ssd' } }],
            networkInterfaces: [{ network: 'vpc-dev', subnetwork: 'subnet-us-west1-dev' }],
            labels: { 'task': 'ml-training' },
        },
    },
];

let MOCK_INSTANCE_GROUPS: InstanceGroup[] = [
    { id: 'ig-web-prod', name: 'web-prod-group', zone: 'us-central1-a', instanceTemplate: 'it-web-prod-v1', targetSize: 2, currentSize: 2, status: 'RUNNING', namedPorts: [{ name: 'http', port: 80 }] },
    { id: 'ig-ml-workers', name: 'ml-worker-group', region: 'us-west1', instanceTemplate: 'it-ml-worker-gpu', targetSize: 1, currentSize: 1, status: 'RUNNING', distributionPolicy: { targetShape: 'ANY', zones: ['us-west1-a', 'us-west1-b'] } },
];

let MOCK_AUTOSCALING_POLICIES: AutoScalingPolicy[] = [
    { id: 'asp-web-prod', name: 'web-prod-autoscaler', instanceGroup: 'ig-web-prod', minNumReplicas: 1, maxNumReplicas: 5, coolDownPeriodSec: 300, cpuUtilization: { target: 0.6 }, predictiveScaling: 'OPTIMIZE_AVAILABILITY', status: 'ACTIVE' },
    { id: 'asp-ml-workers', name: 'ml-worker-autoscaler', instanceGroup: 'ig-ml-workers', minNumReplicas: 0, maxNumReplicas: 3, coolDownPeriodSec: 600, customMetrics: [{ name: 'custom.googleapis.com/queue_depth', target: 10, metricType: 'GAUGE' }], status: 'ACTIVE' },
];

let MOCK_BACKUP_POLICIES: BackupPolicy[] = [
    { id: 'bp-vm1-daily', name: 'vm-1-daily-backup', resourceType: 'VM', resourceId: 'vm-1', schedule: 'daily', retentionDays: 7, targetLocation: 'gs://compute-backups', status: 'ACTIVE', encryptionEnabled: true },
    { id: 'bp-db1-hourly', name: 'db-1-hourly-backup', resourceType: 'DISK', resourceId: 'disk-2', schedule: 'cron:0 * * * *', retentionDays: 30, targetLocation: 'gs://db-backups', status: 'ACTIVE', encryptionEnabled: true, recoveryPointObjectiveHrs: 1 },
];

let MOCK_QUANTUM_CIRCUITS: QuantumCircuit[] = [];
let MOCK_EDGE_DEPLOYMENTS: EdgeDeviceDeployment[] = [];
let MOCK_INTERDIMENSIONAL_GATEWAYS: InterdimensionalGateway[] = [];
let MOCK_SERVICE_MESH_GATEWAYS: ServiceMeshGateway[] = [];
let MOCK_BLOCKCHAIN_NODES: BlockchainNode[] = [];
let MOCK_SUSTAINABILITY_REPORTS: SustainabilityReport[] = [];

// =====================================================================================================================
// === HELPER FUNCTIONS (for Mocking Asynchronous Operations) ==========================================================
// =====================================================================================================================

const mockAsync = <T>(result: T, delay: number = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(result), delay));
};

const generateUniqueId = (prefix: string = 'res') => `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`;

// =====================================================================================================================
// === MAIN COMPUTE API OBJECT (The Universe of Compute Glyphs) =======================================================
// =====================================================================================================================

export const ComputeAPI = {
    // --- Core VM Lifecycle Management ---
    listVMs: (): Promise<VirtualMachine[]> => {
        console.log('Listing all Virtual Machines across the cosmos...');
        return mockAsync(MOCK_VMS.map(vm => ({ ...vm, status: Math.random() < 0.05 ? 'PROVISIONING' : vm.status } as VirtualMachine)));
    },

    getVM: (id: string): Promise<VirtualMachine | undefined> => {
        console.log(`Summoning VM details for id: ${id}`);
        const vm = MOCK_VMS.find(v => v.id === id);
        return mockAsync(vm ? { ...vm, status: Math.random() < 0.02 ? 'MAINTENANCE' : vm.status } as VirtualMachine : undefined);
    },

    createVM: (vmConfig: Omit<VirtualMachine, 'id' | 'status' | 'creationTimestamp'>): Promise<VirtualMachine> => {
        console.log(`Incanting a new Golem (VM): ${vmConfig.name}`);
        const newVm: VirtualMachine = {
            ...vmConfig,
            id: generateUniqueId('vm'),
            status: 'PROVISIONING',
            creationTimestamp: new Date().toISOString(),
            bootDiskSizeGb: vmConfig.disks?.[0] ? MOCK_DISKS.find(d => d.id === vmConfig.disks![0])?.sizeGb : 30, // Default boot disk size
        };
        MOCK_VMS.push(newVm);
        setTimeout(() => newVm.status = 'RUNNING', 3000); // Simulate provisioning
        return mockAsync(newVm);
    },

    updateVM: (id: string, updates: Partial<Omit<VirtualMachine, 'id' | 'status' | 'creationTimestamp'>>): Promise<VirtualMachine | undefined> => {
        console.log(`Re-scribing the glyphs (updating VM) for id: ${id}`);
        const vmIndex = MOCK_VMS.findIndex(v => v.id === id);
        if (vmIndex !== -1) {
            MOCK_VMS[vmIndex] = { ...MOCK_VMS[vmIndex], ...updates, status: 'RECONFIGURING' };
            setTimeout(() => MOCK_VMS[vmIndex].status = 'RUNNING', 1500); // Simulate reconfiguration
            return mockAsync(MOCK_VMS[vmIndex]);
        }
        return mockAsync(undefined);
    },

    deleteVM: (id: string): Promise<{ success: boolean }> => {
        console.log(`Banishing Golem (deleting VM) with id: ${id}`);
        const initialLength = MOCK_VMS.length;
        MOCK_VMS = MOCK_VMS.filter(v => v.id !== id);
        return mockAsync({ success: MOCK_VMS.length < initialLength });
    },

    startVM: (id: string): Promise<{ success: boolean; newStatus?: ExtendedVMStatus }> => {
        console.log(`Awakening Golem (starting VM) with id: ${id}`);
        const vm = MOCK_VMS.find(v => v.id === id);
        if (vm) {
            vm.status = 'RUNNING';
            return mockAsync({ success: true, newStatus: 'RUNNING' });
        }
        return mockAsync({ success: false });
    },

    stopVM: (id: string): Promise<{ success: boolean; newStatus?: ExtendedVMStatus }> => {
        console.log(`Commanding Golem to rest (stopping VM) with id: ${id}`);
        const vm = MOCK_VMS.find(v => v.id === id);
        if (vm) {
            vm.status = 'STOPPED';
            return mockAsync({ success: true, newStatus: 'STOPPED' });
        }
        return mockAsync({ success: false });
    },

    restartVM: (id: string): Promise<{ success: boolean; newStatus?: ExtendedVMStatus }> => {
        console.log(`Re-energizing Golem (restarting VM) with id: ${id}`);
        const vm = MOCK_VMS.find(v => v.id === id);
        if (vm) {
            vm.status = 'MAINTENANCE';
            setTimeout(() => vm.status = 'RUNNING', 1000);
            return mockAsync({ success: true, newStatus: 'RUNNING' });
        }
        return mockAsync({ success: false });
    },

    resizeVM: (id: string, newType: string): Promise<{ success: boolean; oldType?: string; newType?: string }> => {
        console.log(`Resizing Golem ${id} to machine type ${newType}`);
        const vm = MOCK_VMS.find(v => v.id === id);
        if (vm) {
            const oldType = vm.type;
            vm.type = newType;
            vm.status = 'MAINTENANCE';
            setTimeout(() => vm.status = 'RUNNING', 2000);
            return mockAsync({ success: true, oldType, newType });
        }
        return mockAsync({ success: false });
    },

    migrateVM: (id: string, targetZone: string): Promise<{ success: boolean; oldZone?: string; newZone?: string }> => {
        console.log(`Translocating Golem ${id} to zone ${targetZone}`);
        const vm = MOCK_VMS.find(v => v.id === id);
        if (vm) {
            const oldZone = vm.zone;
            vm.status = 'MIGRATING';
            setTimeout(() => {
                vm.zone = targetZone;
                vm.status = 'RUNNING';
            }, 3000);
            return mockAsync({ success: true, oldZone, newZone: targetZone });
        }
        return mockAsync({ success: false });
    },

    createVMSnapshot: (vmId: string, snapshotName: string): Promise<{ success: boolean; snapshotId?: string }> => {
        console.log(`Imprinting Golem's state (snapshot) '${snapshotName}' for VM ${vmId}`);
        const vm = MOCK_VMS.find(v => v.id === vmId);
        if (vm) {
            vm.status = 'SNAPSHOT_CREATING';
            setTimeout(() => vm.status = 'RUNNING', 1500);
            return mockAsync({ success: true, snapshotId: generateUniqueId('vm-snap') });
        }
        return mockAsync({ success: false });
    },

    // --- Disk Management & Storage Arrays ---
    listDisks: (): Promise<Disk[]> => {
        console.log('Cataloging all Persistent Disks...');
        return mockAsync(MOCK_DISKS);
    },

    getDisk: (id: string): Promise<Disk | undefined> => {
        console.log(`Inspecting Disk details for id: ${id}`);
        return mockAsync(MOCK_DISKS.find(d => d.id === id));
    },

    createDisk: (diskConfig: Omit<Disk, 'id' | 'status'>): Promise<Disk> => {
        console.log(`Forging new Disk: ${diskConfig.name}`);
        const newDisk: Disk = {
            ...diskConfig,
            id: generateUniqueId('disk'),
            status: 'CREATING',
        };
        MOCK_DISKS.push(newDisk);
        setTimeout(() => newDisk.status = 'READY', 1000);
        return mockAsync(newDisk);
    },

    updateDisk: (id: string, updates: Partial<Omit<Disk, 'id' | 'status'>>): Promise<Disk | undefined> => {
        console.log(`Modifying Disk ${id}`);
        const diskIndex = MOCK_DISKS.findIndex(d => d.id === id);
        if (diskIndex !== -1) {
            MOCK_DISKS[diskIndex] = { ...MOCK_DISKS[diskIndex], ...updates, status: 'RECONFIGURING' };
            setTimeout(() => MOCK_DISKS[diskIndex].status = 'READY', 1000);
            return mockAsync(MOCK_DISKS[diskIndex]);
        }
        return mockAsync(undefined);
    },

    deleteDisk: (id: string): Promise<{ success: boolean }> => {
        console.log(`Disintegrating Disk with id: ${id}`);
        const initialLength = MOCK_DISKS.length;
        MOCK_DISKS = MOCK_DISKS.filter(d => d.id !== id);
        return mockAsync({ success: MOCK_DISKS.length < initialLength });
    },

    attachDisk: (vmId: string, diskId: string): Promise<{ success: boolean }> => {
        console.log(`Binding disk ${diskId} to VM ${vmId}`);
        const vm = MOCK_VMS.find(v => v.id === vmId);
        const disk = MOCK_DISKS.find(d => d.id === diskId);
        if (vm && disk && !disk.attachedTo) {
            disk.attachedTo = vmId;
            vm.disks = [...(vm.disks || []), diskId];
            return mockAsync({ success: true });
        }
        return mockAsync({ success: false, message: 'VM or Disk not found, or disk already attached.' });
    },

    detachDisk: (vmId: string, diskId: string): Promise<{ success: boolean }> => {
        console.log(`Unbinding disk ${diskId} from VM ${vmId}`);
        const vm = MOCK_VMS.find(v => v.id === vmId);
        const disk = MOCK_DISKS.find(d => d.id === diskId);
        if (vm && disk && disk.attachedTo === vmId) {
            disk.attachedTo = undefined;
            vm.disks = vm.disks?.filter(d => d !== diskId);
            return mockAsync({ success: true });
        }
        return mockAsync({ success: false, message: 'VM or Disk not found, or disk not attached to this VM.' });
    },

    createDiskSnapshot: (diskId: string, snapshotName: string): Promise<{ success: boolean; snapshotId?: string }> => {
        console.log(`Capturing a moment (disk snapshot) '${snapshotName}' for disk ${diskId}`);
        const disk = MOCK_DISKS.find(d => d.id === diskId);
        if (disk) {
            disk.status = 'SNAPSHOT_IN_PROGRESS';
            setTimeout(() => disk.status = 'READY', 1500);
            return mockAsync({ success: true, snapshotId: generateUniqueId('disk-snap') });
        }
        return mockAsync({ success: false });
    },

    replicateDisk: (diskId: string, targetRegion: string, policy: 'REGIONAL' | 'GLOBAL' | 'INTERSTELLAR'): Promise<{ success: boolean; replicationJobId?: string }> => {
        console.log(`Initiating replication of disk ${diskId} to ${targetRegion} with ${policy} policy.`);
        const disk = MOCK_DISKS.find(d => d.id === diskId);
        if (disk) {
            disk.status = 'REPLICATING';
            disk.replicationPolicy = policy;
            setTimeout(() => disk.status = 'READY', 5000); // Simulate replication time
            return mockAsync({ success: true, replicationJobId: generateUniqueId('disk-repl') });
        }
        return mockAsync({ success: false });
    },

    // --- Networking Nexus (VPC, Subnets, Firewalls, Load Balancers, Service Mesh) ---
    listNetworks: (): Promise<Network[]> => {
        console.log('Mapping the Network Fabric (VPC Networks)...');
        return mockAsync(MOCK_NETWORKS);
    },

    createNetwork: (networkConfig: Omit<Network, 'id' | 'creationTimestamp' | 'gatewayIPv4'>): Promise<Network> => {
        console.log(`Weaving a new Network: ${networkConfig.name}`);
        const newNetwork: Network = {
            ...networkConfig,
            id: generateUniqueId('net'),
            gatewayIPv4: `10.${MOCK_NETWORKS.length + 1}.0.1`,
            creationTimestamp: new Date().toISOString(),
        };
        MOCK_NETWORKS.push(newNetwork);
        return mockAsync(newNetwork);
    },

    deleteNetwork: (id: string): Promise<{ success: boolean }> => {
        console.log(`Unraveling Network with id: ${id}`);
        const initialLength = MOCK_NETWORKS.length;
        MOCK_NETWORKS = MOCK_NETWORKS.filter(n => n.id !== id);
        return mockAsync({ success: MOCK_NETWORKS.length < initialLength });
    },

    listSubnets: (networkId?: string): Promise<Subnet[]> => {
        console.log(`Charting all Subnets for network ${networkId || 'all'}...`);
        const subnets = networkId ? MOCK_SUBNETS.filter(s => s.network === networkId) : MOCK_SUBNETS;
        return mockAsync(subnets);
    },

    createSubnet: (subnetConfig: Omit<Subnet, 'id' | 'creationTimestamp' | 'gatewayAddress'>): Promise<Subnet> => {
        console.log(`Segmenting a new Subnet: ${subnetConfig.name} in network ${subnetConfig.network}`);
        const newSubnet: Subnet = {
            ...subnetConfig,
            id: generateUniqueId('snet'),
            gatewayAddress: subnetConfig.ipCidrRange.split('/')[0].split('.').slice(0, 3).join('.') + '.1',
            creationTimestamp: new Date().toISOString(),
        };
        MOCK_SUBNETS.push(newSubnet);
        return mockAsync(newSubnet);
    },

    deleteSubnet: (id: string): Promise<{ success: boolean }> => {
        console.log(`Dissolving Subnet with id: ${id}`);
        const initialLength = MOCK_SUBNETS.length;
        MOCK_SUBNETS = MOCK_SUBNETS.filter(s => s.id !== id);
        return mockAsync({ success: MOCK_SUBNETS.length < initialLength });
    },

    listFirewallRules: (networkId?: string): Promise<FirewallRule[]> => {
        console.log(`Scanning Firewall Rules for network ${networkId || 'all'}...`);
        const rules = networkId ? MOCK_FIREWALL_RULES.filter(r => r.network === networkId) : MOCK_FIREWALL_RULES;
        return mockAsync(rules);
    },

    createFirewallRule: (ruleConfig: Omit<FirewallRule, 'id'>): Promise<FirewallRule> => {
        console.log(`Enchanting a new Firewall Rule: ${ruleConfig.name}`);
        const newRule: FirewallRule = {
            ...ruleConfig,
            id: generateUniqueId('fw'),
        };
        MOCK_FIREWALL_RULES.push(newRule);
        return mockAsync(newRule);
    },

    deleteFirewallRule: (id: string): Promise<{ success: boolean }> => {
        console.log(`Dispelling Firewall Rule with id: ${id}`);
        const initialLength = MOCK_FIREWALL_RULES.length;
        MOCK_FIREWALL_RULES = MOCK_FIREWALL_RULES.filter(r => r.id !== id);
        return mockAsync({ success: MOCK_FIREWALL_RULES.length < initialLength });
    },

    listLoadBalancers: (): Promise<LoadBalancer[]> => {
        console.log('Orchestrating all Load Balancers...');
        return mockAsync(MOCK_LOAD_BALANCERS);
    },

    createLoadBalancer: (lbConfig: Omit<LoadBalancer, 'id' | 'status' | 'ipAddress'>): Promise<LoadBalancer> => {
        console.log(`Constructing Load Balancer: ${lbConfig.name}`);
        const newLB: LoadBalancer = {
            ...lbConfig,
            id: generateUniqueId('lb'),
            ipAddress: `35.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            status: 'PROVISIONING',
        };
        MOCK_LOAD_BALANCERS.push(newLB);
        setTimeout(() => newLB.status = 'SERVING', 2000);
        return mockAsync(newLB);
    },

    deleteLoadBalancer: (id: string): Promise<{ success: boolean }> => {
        console.log(`Deconstructing Load Balancer with id: ${id}`);
        const initialLength = MOCK_LOAD_BALANCERS.length;
        MOCK_LOAD_BALANCERS = MOCK_LOAD_BALANCERS.filter(lb => lb.id !== id);
        return mockAsync({ success: MOCK_LOAD_BALANCERS.length < initialLength });
    },

    listBackendServices: (): Promise<BackendService[]> => {
        console.log('Listing all Backend Services...');
        return mockAsync(MOCK_BACKEND_SERVICES);
    },

    createBackendService: (bsConfig: Omit<BackendService, 'id'>): Promise<BackendService> => {
        console.log(`Creating Backend Service: ${bsConfig.name}`);
        const newBS: BackendService = {
            ...bsConfig,
            id: generateUniqueId('bs'),
        };
        MOCK_BACKEND_SERVICES.push(newBS);
        return mockAsync(newBS);
    },

    deleteBackendService: (id: string): Promise<{ success: boolean }> => {
        console.log(`Deleting Backend Service with id: ${id}`);
        const initialLength = MOCK_BACKEND_SERVICES.length;
        MOCK_BACKEND_SERVICES = MOCK_BACKEND_SERVICES.filter(bs => bs.id !== id);
        return mockAsync({ success: MOCK_BACKEND_SERVICES.length < initialLength });
    },

    listServiceMeshGateways: (): Promise<ServiceMeshGateway[]> => {
        console.log('Querying Service Mesh Gateways...');
        return mockAsync(MOCK_SERVICE_MESH_GATEWAYS);
    },

    createServiceMeshGateway: (gatewayConfig: Omit<ServiceMeshGateway, 'id' | 'status' | 'proxyVersion'>): Promise<ServiceMeshGateway> => {
        console.log(`Establishing Service Mesh Gateway: ${gatewayConfig.name}`);
        const newGateway: ServiceMeshGateway = {
            ...gatewayConfig,
            id: generateUniqueId('smg'),
            status: 'PROVISIONING',
            proxyVersion: '1.20.0', // Mock version
        };
        MOCK_SERVICE_MESH_GATEWAYS.push(newGateway);
        setTimeout(() => newGateway.status = 'ACTIVE', 2500);
        return mockAsync(newGateway);
    },

    // --- Orchestration & Automation (Instance Groups, Auto Scaling, Workloads) ---
    listInstanceTemplates: (): Promise<InstanceTemplate[]> => {
        console.log('Consulting the Schematics (Instance Templates)...');
        return mockAsync(MOCK_INSTANCE_TEMPLATES);
    },

    createInstanceTemplate: (templateConfig: Omit<InstanceTemplate, 'id'>): Promise<InstanceTemplate> => {
        console.log(`Drawing new Instance Template: ${templateConfig.name}`);
        const newTemplate: InstanceTemplate = {
            ...templateConfig,
            id: generateUniqueId('it'),
        };
        MOCK_INSTANCE_TEMPLATES.push(newTemplate);
        return mockAsync(newTemplate);
    },

    deleteInstanceTemplate: (id: string): Promise<{ success: boolean }> => {
        console.log(`Erasing Instance Template with id: ${id}`);
        const initialLength = MOCK_INSTANCE_TEMPLATES.length;
        MOCK_INSTANCE_TEMPLATES = MOCK_INSTANCE_TEMPLATES.filter(it => it.id !== id);
        return mockAsync({ success: MOCK_INSTANCE_TEMPLATES.length < initialLength });
    },

    listInstanceGroups: (): Promise<InstanceGroup[]> => {
        console.log('Muster all Golem Legions (Instance Groups)...');
        return mockAsync(MOCK_INSTANCE_GROUPS);
    },

    createInstanceGroup: (groupConfig: Omit<InstanceGroup, 'id' | 'currentSize' | 'status'>): Promise<InstanceGroup> => {
        console.log(`Forming Instance Group: ${groupConfig.name}`);
        const newGroup: InstanceGroup = {
            ...groupConfig,
            id: generateUniqueId('ig'),
            currentSize: 0,
            status: 'PROVISIONING',
        };
        MOCK_INSTANCE_GROUPS.push(newGroup);
        setTimeout(() => {
            newGroup.currentSize = newGroup.targetSize;
            newGroup.status = 'RUNNING';
        }, 3000);
        return mockAsync(newGroup);
    },

    deleteInstanceGroup: (id: string): Promise<{ success: boolean }> => {
        console.log(`Disbanding Instance Group with id: ${id}`);
        const initialLength = MOCK_INSTANCE_GROUPS.length;
        MOCK_INSTANCE_GROUPS = MOCK_INSTANCE_GROUPS.filter(ig => ig.id !== id);
        return mockAsync({ success: MOCK_INSTANCE_GROUPS.length < initialLength });
    },

    updateInstanceGroupSize: (id: string, newSize: number): Promise<{ success: boolean; oldSize?: number; newSize?: number }> => {
        console.log(`Adjusting Instance Group ${id} target size to ${newSize}`);
        const ig = MOCK_INSTANCE_GROUPS.find(g => g.id === id);
        if (ig) {
            const oldSize = ig.targetSize;
            ig.targetSize = newSize;
            ig.status = 'SCALING_UP'; // Or SCALING_DOWN
            setTimeout(() => {
                ig.currentSize = newSize;
                ig.status = 'RUNNING';
            }, 2000);
            return mockAsync({ success: true, oldSize, newSize });
        }
        return mockAsync({ success: false });
    },

    listAutoScalingPolicies: (): Promise<AutoScalingPolicy[]> => {
        console.log('Reviewing Auto Scaling Directives...');
        return mockAsync(MOCK_AUTOSCALING_POLICIES);
    },

    createAutoScalingPolicy: (policyConfig: Omit<AutoScalingPolicy, 'id' | 'status'>): Promise<AutoScalingPolicy> => {
        console.log(`Enacting Auto Scaling Policy: ${policyConfig.name}`);
        const newPolicy: AutoScalingPolicy = {
            ...policyConfig,
            id: generateUniqueId('asp'),
            status: 'ACTIVE',
        };
        MOCK_AUTOSCALING_POLICIES.push(newPolicy);
        return mockAsync(newPolicy);
    },

    deleteAutoScalingPolicy: (id: string): Promise<{ success: boolean }> => {
        console.log(`Revoking Auto Scaling Policy with id: ${id}`);
        const initialLength = MOCK_AUTOSCALING_POLICIES.length;
        MOCK_AUTOSCALING_POLICIES = MOCK_AUTOSCALING_POLICIES.filter(p => p.id !== id);
        return mockAsync({ success: MOCK_AUTOSCALING_POLICIES.length < initialLength });
    },

    deployManagedWorkload: (workloadConfig: { name: string, type: 'KUBERNETES_CLUSTER' | 'SERVERLESS_FUNCTION' | 'DATA_PIPELINE' | 'BLOCKCHAIN_NETWORK', definition: string }): Promise<{ success: boolean; deploymentId?: string }> => {
        console.log(`Manifesting managed workload: ${workloadConfig.name} of type ${workloadConfig.type}`);
        return mockAsync({ success: true, deploymentId: generateUniqueId('deploy') });
    },

    // --- Monitoring, Logging & Observability (The All-Seeing Eye) ---
    getVMMetrics: (vmId: string, metricType: 'CPU_UTILIZATION' | 'MEMORY_USAGE' | 'NETWORK_BYTES_IN' | 'NETWORK_BYTES_OUT' | 'DISK_IOPS' | 'GPU_TEMPERATURE'): Promise<{ timestamp: string; value: number }[]> => {
        console.log(`Extracting ${metricType} for VM ${vmId}`);
        const data = Array.from({ length: 10 }, (_, i) => ({
            timestamp: new Date(Date.now() - (9 - i) * 60 * 1000).toISOString(),
            value: Math.random() * (metricType.includes('CPU') ? 100 : (metricType.includes('GPU') ? 80 : 1000)),
        }));
        return mockAsync(data);
    },

    streamVMLogs: (vmId: string, filter?: string): Promise<{ success: boolean; subscriptionId?: string }> => {
        console.log(`Initiating log stream for VM ${vmId} with filter: ${filter || 'none'}`);
        return mockAsync({ success: true, subscriptionId: generateUniqueId('logsub') });
    },

    createAlertPolicy: (policyConfig: { name: string, metric: string, threshold: number, duration: string, notificationChannels: string[], severity: 'CRITICAL' | 'WARNING' | 'INFORMATIONAL' }): Promise<{ success: boolean; policyId?: string }> => {
        console.log(`Forging alert policy: ${policyConfig.name}`);
        return mockAsync({ success: true, policyId: generateUniqueId('alert') });
    },

    // --- Security & IAM (Guardians of the Gates) ---
    grantVMAccess: (vmId: string, userId: string, role: string): Promise<{ success: boolean }> => {
        console.log(`Granting role '${role}' to user '${userId}' on VM '${vmId}'`);
        return mockAsync({ success: true });
    },

    revokeVMAccess: (vmId: string, userId: string, role: string): Promise<{ success: boolean }> => {
        console.log(`Revoking role '${role}' from user '${userId}' on VM '${vmId}'`);
        return mockAsync({ success: true });
    },

    runVulnerabilityScan: (vmId: string): Promise<{ success: boolean; scanId?: string; findingsCount?: number }> => {
        console.log(`Initiating vulnerability scan for VM ${vmId}`);
        return mockAsync({ success: true, scanId: generateUniqueId('scan'), findingsCount: Math.floor(Math.random() * 5) });
    },

    rotateKMSKey: (keyId: string, resourceType: 'DISK' | 'VM_ENCRYPTION'): Promise<{ success: boolean; newKeyVersionId?: string }> => {
        console.log(`Rotating KMS key '${keyId}' for ${resourceType}.`);
        return mockAsync({ success: true, newKeyVersionId: generateUniqueId('kms-ver') });
    },

    // --- Cost Management & Resource Optimization (The Exchequer's Wisdom) ---
    getProjectCostEstimate: (projectId: string, period: 'DAILY' | 'MONTHLY' | 'YEARLY'): Promise<{ totalCost: number; breakdown: { service: string; cost: number }[] }> => {
        console.log(`Estimating cost for project ${projectId} for ${period}`);
        return mockAsync({
            totalCost: Math.random() * 50000 + 1000,
            breakdown: [
                { service: 'Compute Engine', cost: Math.random() * 20000 },
                { service: 'Persistent Disk', cost: Math.random() * 5000 },
                { service: 'Networking', cost: Math.random() * 3000 },
                { service: 'GPU Accelerators', cost: Math.random() * 8000 },
                { service: 'Quantum Computing', cost: Math.random() * 1000 },
                { service: 'Edge Compute', cost: Math.random() * 1500 },
            ],
        });
    },

    getOptimizationRecommendations: (projectId: string): Promise<string[]> => {
        console.log(`Consulting the Oracle for optimization recommendations for project ${projectId}`);
        return mockAsync([
            'Right-size vm-1 to e2-small (20% cost savings, projected annual savings: $500)',
            'Delete orphaned disk disk-orphan-123 (10% storage savings, projected annual savings: $50)',
            'Enable auto-scaling for ig-batch-workers (improve efficiency, 15% cost/performance optimization)',
            'Convert n1-standard-8 to e2-standard-8 for vm-4 (30% cost savings for general compute, without GPU impact)',
            'Implement cold storage tiering for old snapshots.',
            'Migrate batch processor vm-3 to preemptible VMs for 80% cost reduction.',
        ]);
    },

    // --- Disaster Recovery & Business Continuity (Resurrection Protocol) ---
    listBackupPolicies: (): Promise<BackupPolicy[]> => {
        console.log('Accessing the Archive of Backup Policies...');
        return mockAsync(MOCK_BACKUP_POLICIES);
    },

    createBackupPolicy: (policyConfig: Omit<BackupPolicy, 'id' | 'status'>): Promise<BackupPolicy> => {
        console.log(`Enscribing a new Backup Policy: ${policyConfig.name}`);
        const newPolicy: BackupPolicy = {
            ...policyConfig,
            id: generateUniqueId('bp'),
            status: 'ACTIVE',
        };
        MOCK_BACKUP_POLICIES.push(newPolicy);
        return mockAsync(newPolicy);
    },

    restoreVMFromBackup: (vmId: string, backupId: string, targetZone?: string): Promise<{ success: boolean; newVmId?: string }> => {
        console.log(`Initiating restoration of VM ${vmId} from backup ${backupId}`);
        return mockAsync({ success: true, newVmId: generateUniqueId(`restored-${vmId}`) });
    },

    activateDisasterRecoveryPlan: (planId: string, region: string): Promise<{ success: boolean; activatedResources: string[] }> => {
        console.log(`Activating DR plan '${planId}' in region '${region}'. This is a full-scale cosmic event!`);
        // This would be a highly complex operation in reality
        return mockAsync({ success: true, activatedResources: ['vm-1-dr-replica', 'db-1-dr-replica', 'lb-dr-replica'] }, 10000); // Very long delay
    },

    // --- Futuristic & "Universe" Expansion Features (Beyond the Horizon) ---
    // Quantum Computing Integration (Harnessing the fabric of reality)
    executeQuantumCircuit: (circuitConfig: Omit<QuantumCircuit, 'id' | 'status' | 'results' | 'executionTimeMs' | 'costUsd' | 'fidelityScore'>): Promise<QuantumCircuit> => {
        console.log(`Initiating quantum computation for circuit: ${circuitConfig.name} on ${circuitConfig.targetProcessor}`);
        const newCircuit: QuantumCircuit = {
            ...circuitConfig,
            id: generateUniqueId('qc'),
            status: 'QUEUED',
            results: null,
        };
        MOCK_QUANTUM_CIRCUITS.push(newCircuit);
        setTimeout(() => {
            newCircuit.status = 'RUNNING';
            setTimeout(() => {
                newCircuit.status = 'COMPLETED';
                newCircuit.executionTimeMs = Math.floor(Math.random() * 5000) + 100;
                newCircuit.costUsd = parseFloat((Math.random() * 1000).toFixed(2));
                newCircuit.fidelityScore = parseFloat((Math.random()).toFixed(3));
                newCircuit.results = { qubits: circuitConfig.qubitCount, outputDistribution: Array.from({ length: 1 << circuitConfig.qubitCount }, () => Math.random()) };
            }, Math.random() * 5000 + 1000); // Simulate quantum computation time
        }, 500); // Simulate queueing
        return mockAsync(newCircuit);
    },

    getQuantumCircuitStatus: (id: string): Promise<QuantumCircuit | undefined> => {
        console.log(`Retrieving status for quantum circuit: ${id}`);
        return mockAsync(MOCK_QUANTUM_CIRCUITS.find(qc => qc.id === id));
    },

    // Edge Computing Management (Extending the cloud's reach)
    deployEdgeDeviceService: (deploymentConfig: Omit<EdgeDeviceDeployment, 'id' | 'status' | 'lastHeartbeat'>): Promise<EdgeDeviceDeployment> => {
        console.log(`Deploying edge service '${deploymentConfig.name}' to ${deploymentConfig.location}`);
        const newDeployment: EdgeDeviceDeployment = {
            ...deploymentConfig,
            id: generateUniqueId('edge