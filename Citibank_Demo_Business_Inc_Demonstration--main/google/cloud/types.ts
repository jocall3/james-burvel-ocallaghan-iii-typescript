// google/cloud/types.ts
// The Laws of Infrastructure Physics. Defines the fundamental particles of the cloud.

// EXISTING TYPES - DO NOT MODIFY OR REMOVE
export type VMStatus = 'RUNNING' | 'STOPPED' | 'PROVISIONING';

export interface VirtualMachine {
    id: string;
    name: string;
    status: VMStatus;
    region: string;
    type: string; // e.g., e2-medium
}

export interface StorageBucket {
    id: string;
    name: string;
    region: string;
    storageClass: 'Standard' | 'Archive';
}

// --- EXPANSION START ---

// Core Utilities & Primitives
export type Timestamp = string; // ISO 8601 string (e.g., "2023-10-27T10:00:00Z")
export type Duration = string;  // ISO 8601 duration string (e.g., "P1Y2M10DT2H30M")
export type UUID = string;
export type ResourceName = string; // Standardized resource path (e.g., "projects/p1/regions/r1/vms/vm1")

// General Resource States
export enum ResourceState {
    PROVISIONING = 'PROVISIONING',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED',
    SUSPENDED = 'SUSPENDED',
    DELETING = 'DELETING',
    DEGRADED = 'DEGRADED',
    HEALTHY = 'HEALTHY',
    UNHEALTHY = 'UNHEALTHY',
    UNKNOWN = 'UNKNOWN',
    UPDATING = 'UPDATING',
    MIGRATING = 'MIGRATING',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    SUCCEEDED = 'SUCCEEDED',
    DISABLED = 'DISABLED',
    READY = 'READY',
    ACTIVE = 'ACTIVE',
    MAINTENANCE = 'MAINTENANCE',
    TERMINATED = 'TERMINATED',
}

// General Configuration
export interface Tag {
    key: string;
    value: string;
}

export interface ResourceLabels {
    [key: string]: string;
}

export interface ResourceMetadata {
    creationTime: Timestamp;
    lastUpdateTime: Timestamp;
    labels?: ResourceLabels;
    tags?: Tag[];
    annotations?: { [key: string]: string };
    deletionTime?: Timestamp;
}

// Global Cloud Infrastructure Hierarchy
export interface Region {
    id: UUID;
    name: string;
    description: string;
    location: string; // e.g., 'us-central1'
    status: ResourceState;
    availableZones: string[]; // List of Zone IDs
    metadata: ResourceMetadata;
}

export interface Zone {
    id: UUID;
    name: string;
    regionId: UUID;
    status: ResourceState;
    features: string[]; // e.g., 'GPU_AVAILABLE', 'LOW_LATENCY_INTERCONNECT', 'TPU_V4_AVAILABLE'
    metadata: ResourceMetadata;
}

export interface Organization {
    id: UUID;
    name: string;
    displayName: string;
    billingAccountId: UUID;
    creationTime: Timestamp;
    adminUsers: UUID[]; // User IDs (links to IdentityUser)
    metadata: ResourceMetadata;
}

export interface CloudProject {
    id: UUID;
    name: string;
    projectId: string; // User-defined project ID (e.g., 'my-awesome-project-123')
    organizationId: UUID;
    status: ResourceState;
    metadata: ResourceMetadata;
    parentFolderId?: UUID; // Links to CloudFolder
}

export interface CloudFolder {
    id: UUID;
    name: string;
    displayName: string;
    organizationId: UUID;
    parentFolderId?: UUID; // Nested folders
    metadata: ResourceMetadata;
}

// --- COMPUTE SERVICES ---

// Machine Types & Configurations
export interface MachineType {
    name: string; // e.g., 'e2-standard-4', 'n2d-highcpu-8'
    region: string;
    cpuCores: number;
    memoryGb: number;
    description: string;
    supportedFeatures: string[]; // e.g., 'nested_virtualization', 'confidential_computing', 'simd_extensions'
    pricePerHourUsd: number;
    metadata: ResourceMetadata;
}

export enum GPUAcceleratorType {
    NVIDIA_TESLA_V100 = 'NVIDIA_TESLA_V100',
    NVIDIA_TESLA_T4 = 'NVIDIA_TESLA_T4',
    NVIDIA_TESLA_A100 = 'NVIDIA_TESLA_A100',
    AMD_INSTINCT_MI250X = 'AMD_INSTINCT_MI250X',
    NVIDIA_L4 = 'NVIDIA_L4',
}

export interface GPUAccelerator {
    type: GPUAcceleratorType;
    count: number;
    memoryGb: number;
}

export enum TPUAcceleratorType {
    TPU_V2 = 'TPU_V2',
    TPU_V3 = 'TPU_V3',
    TPU_V4 = 'TPU_V4',
    TPU_V5e = 'TPU_V5e',
}

export interface TPUAccelerator {
    type: TPUAcceleratorType;
    topology: string; // e.g., '2x2', '4x4', '8x8'
    cores: number;
    memoryGbPerCore: number;
    interconnectBandwidthGbps: number;
}

export enum OperatingSystemFamily {
    DEBIAN = 'DEBIAN',
    UBUNTU = 'UBUNTU',
    CENTOS = 'CENTOS',
    REDHAT = 'REDHAT',
    WINDOWS = 'WINDOWS',
    COREOS = 'COREOS',
    CUSTOM = 'CUSTOM',
}

export interface OperatingSystemImage {
    name: string; // e.g., 'debian-11', 'windows-server-2022-dc'
    version: string;
    family: OperatingSystemFamily;
    architecture: 'X86_64' | 'ARM64';
    creationTime: Timestamp;
    licenses: string[]; // e.g., 'gcp-public-licenses/debian-11'
    minDiskSizeGb: number;
    supportsUEFI: boolean;
    deprecated?: { state: 'DEPRECATED' | 'OBSOLETE' | 'DELETED'; replacement?: string; };
    metadata: ResourceMetadata;
}

export interface NetworkInterface {
    id: UUID;
    networkId: UUID; // Link to VirtualNetwork
    subnetId: UUID;  // Link to Subnet
    privateIpAddress: string;
    publicIpAddressId?: UUID; // Link to PublicIPAddress
    macAddress: string;
    description?: string;
    securityGroupIds: UUID[]; // Links to NetworkSecurityGroup
    metadata: ResourceMetadata;
}

// Enhanced Virtual Machine
export interface ExpandedVirtualMachine extends VirtualMachine { // Extends existing VM
    projectId: UUID;
    zone: string;
    machineTypeDetails: MachineType; // Embedded or linked details
    osImageName: string; // Reference to OperatingSystemImage name
    bootDiskSizeGb: number;
    attachedDiskIds: UUID[]; // Links to PersistentDisk
    networkInterfaces: NetworkInterface[];
    gpuAccelerators?: GPUAccelerator[];
    tpuAccelerators?: TPUAccelerator[];
    metadata: ResourceMetadata;
    lastBootTime?: Timestamp;
    preemptible: boolean;
    schedulingPolicy: 'STANDARD' | 'SPOT' | 'DEDICATED_HOST';
    tags?: string[]; // Simplified tags for networking rules etc.
    serviceAccountEmail?: string; // Links to ServiceAccount
}

// Containers & Orchestration
export enum ContainerRegistryStatus {
    ACTIVE = 'ACTIVE',
    DEGRADED = 'DEGRADED',
    PAUSED = 'PAUSED',
}

export interface ContainerImage {
    name: string; // e.g., 'my-app/backend:v1.0.0'
    repository: string;
    digest: string; // SHA256 digest (e.g., 'sha256:abcd...')
    creationTime: Timestamp;
    sizeBytes: number;
    tags: string[];
    vulnerabilities?: string[]; // CVE IDs or similar
    scanningStatus: 'SCANNED' | 'SCAN_PENDING' | 'SCAN_FAILED';
    metadata: ResourceMetadata;
}

export interface ContainerRegistry {
    id: UUID;
    name: string;
    region: string;
    status: ContainerRegistryStatus;
    imageCount: number;
    storageUsageBytes: number;
    metadata: ResourceMetadata;
}

export interface ContainerPort {
    name?: string;
    containerPort: number;
    protocol: 'TCP' | 'UDP';
    hostPort?: number;
}

export interface ContainerResourceRequests {
    cpuMillicores?: number;
    memoryMb?: number;
    gpuCount?: number;
}

export interface ContainerSpec {
    image: string; // Container image reference (e.g., "gcr.io/my-project/my-app:v1")
    name: string;
    command?: string[];
    args?: string[];
    environment?: { [key: string]: string };
    resources?: {
        requests?: ContainerResourceRequests;
        limits?: ContainerResourceResourceLimits;
    };
    ports?: ContainerPort[];
    volumeMounts?: { name: string; mountPath: string; readOnly?: boolean; }[];
    livenessProbe?: { httpGet?: { path: string; port: number; }; initialDelaySeconds?: number; periodSeconds?: number; };
    readinessProbe?: { httpGet?: { path: string; port: number; }; initialDelaySeconds?: number; periodSeconds?: number; };
}

export interface ContainerResourceResourceLimits extends ContainerResourceRequests {
    // Optionally add more specific limits here
}

export interface ContainerInstance {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    zone?: string;
    status: ResourceState; // e.g., RUNNING, STOPPED, PENDING, DEGRADED
    containerSpecs: ContainerSpec[];
    networkInterfaces: NetworkInterface[];
    ipAddress: string; // Primary IP
    metadata: ResourceMetadata;
    restartPolicy: 'ALWAYS' | 'ON_FAILURE' | 'NEVER';
    serviceAccountEmail?: string;
}

export enum KubernetesClusterStatus {
    PROVISIONING = 'PROVISIONING',
    RUNNING = 'RUNNING',
    UPGRADING = 'UPGRADING',
    RECONCILING = 'RECONCILING',
    ERROR = 'ERROR',
    DELETING = 'DELETING',
    STOPPED = 'STOPPED',
    MAINTENANCE = 'MAINTENANCE',
}

export enum KubernetesNodePoolStatus {
    PROVISIONING = 'PROVISIONING',
    RUNNING = 'RUNNING',
    UPGRADING = 'UPGRADING',
    ERROR = 'ERROR',
    DEGRADED = 'DEGRADED',
    REPAIRING = 'REPAIRING',
}

export interface NodePool {
    id: UUID;
    name: string;
    machineType: MachineType; // Linked MachineType
    minNodes: number;
    maxNodes: number;
    currentNodes: number;
    diskSizeGb: number;
    nodeImage: OperatingSystemImage; // Linked OS Image
    status: KubernetesNodePoolStatus;
    gpuAccelerators?: GPUAccelerator[];
    tpuAccelerators?: TPUAccelerator[];
    autoUpgrade: boolean;
    autoRepair: boolean;
    taints?: { key: string; value: string; effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute'; }[];
    labels?: ResourceLabels;
    metadata: ResourceMetadata;
}

export interface KubernetesCluster {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    status: KubernetesClusterStatus;
    version: string; // Kubernetes version (e.g., "1.27.3-gke.100")
    nodePools: NodePool[];
    endpoint: string; // API server endpoint
    description?: string;
    metadata: ResourceMetadata;
    privateCluster: boolean;
    masterAuthorizedNetworks?: { cidrBlock: string; displayName: string; }[];
    loggingService?: string; // e.g., 'logging.googleapis.com/kubernetes'
    monitoringService?: string; // e.g., 'monitoring.googleapis.com/kubernetes'
}

// Serverless Functions
export enum FunctionRuntime {
    NODEJS_16 = 'NODEJS_16',
    NODEJS_18 = 'NODEJS_18',
    NODEJS_20 = 'NODEJS_20',
    PYTHON_3_9 = 'PYTHON_3_9',
    PYTHON_3_10 = 'PYTHON_3_10',
    PYTHON_3_11 = 'PYTHON_3_11',
    GO_1_18 = 'GO_1_18',
    GO_1_19 = 'GO_1_19',
    JAVA_11 = 'JAVA_11',
    JAVA_17 = 'JAVA_17',
    DOTNET_6 = 'DOTNET_6',
    DOTNET_7 = 'DOTNET_7',
    PHP_8_1 = 'PHP_8_1',
    RUBY_3_1 = 'RUBY_3_1',
    CUSTOM_RUNTIME = 'CUSTOM_RUNTIME',
}

export enum FunctionTriggerType {
    HTTP = 'HTTP',
    CLOUD_STORAGE_OBJECT_FINALIZE = 'CLOUD_STORAGE_OBJECT_FINALIZE',
    CLOUD_STORAGE_OBJECT_DELETE = 'CLOUD_STORAGE_OBJECT_DELETE',
    PUBSUB_MESSAGE = 'PUBSUB_MESSAGE',
    CLOUD_FIRESTORE_DOCUMENT_CREATE = 'CLOUD_FIRESTORE_DOCUMENT_CREATE',
    CLOUD_FIRESTORE_DOCUMENT_UPDATE = 'CLOUD_FIRESTORE_DOCUMENT_UPDATE',
    CLOUD_AUDIT_LOG = 'CLOUD_AUDIT_LOG',
    CRON_SCHEDULE = 'CRON_SCHEDULE',
    EVENTARC_EVENT = 'EVENTARC_EVENT',
}

export interface FunctionTrigger {
    type: FunctionTriggerType;
    resource?: string; // e.g., bucket name, topic name, HTTP path, event type
    eventFilter?: { [key: string]: string }; // For event-driven triggers (e.g., { "serviceName": "storage.googleapis.com" })
    schedule?: string; // Cron expression for scheduled triggers (e.g., "0 8 * * *")
    topicId?: UUID; // Link to MessageQueueTopic for Pub/Sub triggers
}

export interface ServerlessFunction {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    runtime: FunctionRuntime;
    entryPoint: string; // Function name in the code (e.g., "myHandler")
    sourceUrl: string; // GCS URL or Git repo URI for source code
    availableMemoryMb: number;
    timeoutSeconds: number;
    status: ResourceState;
    triggers: FunctionTrigger[];
    environmentVariables?: { [key: string]: string };
    metadata: ResourceMetadata;
    maxInstances: number;
    minInstances: number;
    serviceAccountEmail?: string;
    vpcConnector?: UUID; // Link to ServerlessVPCConnector
    egressSettings: 'PRIVATE_RANGES_ONLY' | 'ALL_TRAFFIC';
}

export interface ServerlessVPCConnector {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    networkId: UUID; // Link to VirtualNetwork
    subnetId: UUID;  // Link to Subnet
    minThroughputMbps: number;
    maxThroughputMbps: number;
    minInstances: number;
    maxInstances: number;
    status: ResourceState;
    metadata: ResourceMetadata;
}

// Edge Compute
export enum EdgeDeviceStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    DEGRADED = 'DEGRADED',
    PROVISIONING = 'PROVISIONING',
    ERROR = 'ERROR',
    MAINTENANCE = 'MAINTENANCE',
}

export enum EdgeDeviceConnectivity {
    LTE = 'LTE',
    _5G = '5G',
    ETHERNET = 'ETHERNET',
    SATELLITE = 'SATELLITE',
    WIFI = 'WIFI',
}

export interface EdgeComputeUnit {
    id: UUID;
    name: string;
    location: string; // Physical location description or Geo-coordinate (e.g., "40.7128, -74.0060")
    status: EdgeDeviceStatus;
    cpuCores: number;
    memoryGb: number;
    storageGb: number;
    softwareVersion: string;
    connectedIoTGatewayId?: UUID; // Link to IoTGateway
    networkConnectivity: EdgeDeviceConnectivity;
    metadata: ResourceMetadata;
    supportedMLModels?: UUID[]; // Links to MLModel that can run on this unit
}

// --- STORAGE SERVICES ---

export enum StorageClass {
    STANDARD = 'STANDARD', // Existing 'Standard'
    NEARLINE = 'NEARLINE',
    COLDLINE = 'COLDLINE',
    ARCHIVE = 'ARCHIVE',   // Existing 'Archive'
    MULTI_REGIONAL = 'MULTI_REGIONAL',
    REGIONAL = 'REGIONAL',
    DURABLE_REDUCED_AVAILABILITY = 'DURABLE_REDUCED_AVAILABILITY', // Legacy
}

export enum AccessTier {
    HOT = 'HOT',
    COOL = 'COOL',
    COLD = 'COLD',
    ARCHIVED = 'ARCHIVED',
}

export interface DataLifecycleRule {
    action: 'DELETE' | 'SET_STORAGE_CLASS';
    condition: {
        ageDays?: number;
        numNewerVersions?: number;
        matchesStorageClass?: StorageClass[]; // Apply to specific current storage classes
        isLive?: boolean; // Apply to live or non-live versions
        createdBefore?: Timestamp;
    };
    targetStorageClass?: StorageClass; // If action is SET_STORAGE_CLASS
}

// Enhanced Storage Bucket
export interface ExpandedStorageBucket extends StorageBucket { // Extends existing Bucket
    projectId: UUID;
    locationType: 'REGION' | 'MULTI_REGION' | 'DUAL_REGION';
    storageClass: StorageClass; // Use new enum
    versioningEnabled: boolean;
    lifecycleRules: DataLifecycleRule[];
    defaultKmsKeyId?: UUID; // Link to KMSKey
    corsConfiguration?: { origin: string; method: string[]; header: string[]; maxAgeSeconds: number; }[];
    retentionPolicy?: {
        retentionPeriodSeconds: number;
        isLocked: boolean;
    };
    publicAccessPrevention: 'ENFORCED' | 'UNSPECIFIED';
    requesterPays: boolean;
    metadata: ResourceMetadata;
}

export enum PersistentDiskType {
    PD_STANDARD = 'PD_STANDARD', // Standard HDD
    PD_SSD = 'PD_SSD',           // SSD
    PD_BALANCED = 'PD_BALANCED', // Balanced Persistent Disk
    PD_EXTREME = 'PD_EXTREME',   // Extreme Persistent Disk
    LOCAL_SSD = 'LOCAL_SSD',     // Local SSD (ephemeral)
}

export interface PersistentDisk {
    id: UUID;
    name: string;
    projectId: UUID;
    zone: string;
    sizeGb: number;
    diskType: PersistentDiskType;
    status: ResourceState;
    attachedToVmId?: UUID; // Link to VirtualMachine
    encryptionKmsKeyId?: UUID; // Link to KMSKey
    sourceImageId?: UUID; // Link to OperatingSystemImage
    iops?: number; // Provisioned IOPS for Extreme/Balanced
    throughputMbps?: number; // Provisioned throughput
    metadata: ResourceMetadata;
}

export interface DiskSnapshot {
    id: UUID;
    name: string;
    projectId: UUID;
    sourceDiskId: UUID; // Link to PersistentDisk
    creationTime: Timestamp;
    storageBytes: string; // "1073741824"
    status: ResourceState;
    location?: string; // Stored location (e.g., 'MULTI_REGIONAL', 'us-central1')
    metadata: ResourceMetadata;
}

export enum FileSystemProtocol {
    NFS = 'NFS',
    SMB = 'SMB',
    WEBDAV = 'WEBDAV',
}

export interface FileSystem {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    zone?: string; // Optional for regional file systems
    capacityGb: number;
    protocol: FileSystemProtocol;
    status: ResourceState;
    mountTargets: {
        ipAddress: string;
        exportPath: string;
        description?: string;
    }[];
    networkId: UUID; // Link to VirtualNetwork
    metadata: ResourceMetadata;
    tier: 'STANDARD' | 'PREMIUM' | 'BASIC_HDD';
}

// Databases
export enum DatabaseEngineType {
    POSTGRESQL = 'POSTGRESQL',
    MYSQL = 'MYSQL',
    SQLSERVER = 'SQLSERVER',
    ORACLE = 'ORACLE',
    MONGODB = 'MONGODB',
    REDIS = 'REDIS',
    CASSANDRA = 'CASSANDRA',
    ELASTICSEARCH = 'ELASTICSEARCH',
    SPARK = 'SPARK',
    BIGQUERY = 'BIGQUERY',
    FIRESTORE = 'FIRESTORE',
    CLOUDSQL = 'CLOUDSQL',
    SPANNER = 'SPANNER',
    ALLOYDB = 'ALLOYDB',
    COCKROACHDB = 'COCKROACHDB',
    MARIADB = 'MARIADB',
    MEMCACHE = 'MEMCACHE',
}

export enum DatabaseEdition {
    STANDARD = 'STANDARD',
    ENTERPRISE = 'ENTERPRISE',
    HIGH_AVAILABILITY = 'HIGH_AVAILABILITY',
    SERVERLESS = 'SERVERLESS',
}

export interface DatabaseInstance {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    zone?: string;
    engine: DatabaseEngineType;
    engineVersion: string; // e.g., "PostgreSQL 14", "MySQL 8.0"
    status: ResourceState;
    edition: DatabaseEdition;
    tier: string; // e.g., 'db-f1-micro', 'enterprise-4-8'
    storageGb: number;
    memoryGb: number;
    cpuCores: number;
    publicIpAddress?: string;
    privateIpAddress: string;
    maintenanceWindow: { dayOfWeek: number; hourOfDay: number; }; // 1-7 (Mon-Sun), 0-23
    backupsEnabled: boolean;
    highAvailability: boolean;
    replicaCount: number;
    readReplicaIds: UUID[]; // Links to other DatabaseInstances
    metadata: ResourceMetadata;
    autoResizeDisk: boolean;
}

export interface TableSchema {
    tableName: string;
    columns: {
        name: string;
        dataType: string; // e.g., "VARCHAR(255)", "INT", "TIMESTAMP"
        nullable: boolean;
        isPrimaryKey?: boolean;
        defaultValue?: string;
        description?: string;
    }[];
    primaryKeyColumns: string[];
    indexes: {
        name: string;
        columns: string[];
        isUnique: boolean;
        indexType?: 'B_TREE' | 'HASH' | 'GIN' | 'GIST';
    }[];
    partitioningScheme?: {
        type: 'RANGE' | 'LIST' | 'HASH';
        column: string;
    };
    metadata: ResourceMetadata;
}

export interface NoSQLCollection {
    id: UUID;
    name: string;
    projectId: UUID;
    databaseId: UUID; // Link to DatabaseInstance (e.g., Firestore instance or MongoDB cluster)
    documentCount: number;
    estimatedSizeBytes: number;
    readCapacityUnits?: number; // For provisioned throughput databases
    writeCapacityUnits?: number;
    indexes: {
        fields: { fieldPath: string; order: 'ASCENDING' | 'DESCENDING'; }[];
        collectionGroup?: string; // For Firestore collection group indexes
    }[];
    metadata: ResourceMetadata;
}

export interface DataWarehouse {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    capacityBytes: string; // "1099511627776"
    processingUnits: number; // For query capacity
    status: ResourceState;
    queryEngine: 'SQL' | 'SPARK' | 'PRESTO';
    dataLocationType: 'SINGLE_REGION' | 'MULTI_REGION';
    metadata: ResourceMetadata;
    linkedDatasetIds: UUID[]; // Links to Dataset
}

export interface DataLake {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    linkedBucketIds: UUID[]; // Links to StorageBucket
    metadata: ResourceMetadata;
    ingestionEndpoints: {
        type: 'STREAMING' | 'BATCH';
        url: string;
        authMethod: AuthMethod;
    }[];
    dataCatalogIntegrationEnabled: boolean;
}

// --- NETWORKING SERVICES ---

export enum NetworkProtocol {
    TCP = 'TCP',
    UDP = 'UDP',
    ICMP = 'ICMP',
    SCTP = 'SCTP',
    ESP = 'ESP', // For IPSec
    AH = 'AH',   // For IPSec
    IP_IN_IP = 'IP_IN_IP',
    ALL = 'ALL',
}

export enum LoadBalancerType {
    EXTERNAL_HTTP_S = 'EXTERNAL_HTTP_S',
    EXTERNAL_TCP_UDP = 'EXTERNAL_TCP_UDP',
    INTERNAL_TCP_UDP = 'INTERNAL_TCP_UDP',
    INTERNAL_HTTP_S = 'INTERNAL_HTTP_S',
    NETWORK_PROXY = 'NETWORK_PROXY', // For advanced L4-L7 proxying (e.g., Envoy-based)
    GLOBAL_EXTERNAL_HTTP_S = 'GLOBAL_EXTERNAL_HTTP_S',
    REGIONAL_EXTERNAL_HTTP_S = 'REGIONAL_EXTERNAL_HTTP_S',
    PRIVATE_SERVICE_CONNECT = 'PRIVATE_SERVICE_CONNECT',
}

export interface VirtualNetwork {
    id: UUID;
    name: string;
    projectId: UUID;
    description?: string;
    ipv4CidrBlock: string; // e.g., '10.0.0.0/16'
    ipv6CidrBlock?: string;
    autoCreateSubnets: boolean;
    globalDynamicRouting: boolean;
    status: ResourceState;
    metadata: ResourceMetadata;
    mtu: number; // Maximum Transmission Unit
}

export interface Subnet {
    id: UUID;
    name: string;
    projectId: UUID;
    networkId: UUID; // Link to VirtualNetwork
    region: string;
    ipv4CidrBlock: string;
    ipv6CidrBlock?: string;
    gatewayIp: string;
    privateIpGoogleAccess: boolean; // Enables private access to Google APIs
    purpose: 'PRIVATE' | 'REGIONAL_MANAGED_PROXY' | 'INTERNAL_HTTPS_LOAD_BALANCER';
    status: ResourceState;
    metadata: ResourceMetadata;
}

export interface FirewallRule {
    id: UUID;
    name: string;
    projectId: UUID;
    networkId: UUID; // Link to VirtualNetwork
    direction: 'INGRESS' | 'EGRESS';
    priority: number; // 0-65535, lower is higher priority
    action: 'ALLOW' | 'DENY';
    sourceRanges?: string[]; // CIDR ranges
    destinationRanges?: string[];
    sourceTags?: string[]; // VM instance tags
    destinationTags?: string[];
    sourceServiceAccounts?: UUID[]; // Service account IDs
    destinationServiceAccounts?: UUID[];
    protocolPorts: { protocol: NetworkProtocol; ports?: string[]; }[]; // e.g., [{protocol: 'TCP', ports: ['80', '443']}, {protocol: 'ICMP'}]
    disabled: boolean;
    metadata: ResourceMetadata;
    targetServiceAccounts?: UUID[]; // Applies to VMs with these service accounts
    targetTags?: string[]; // Applies to VMs with these tags
}

export interface Route {
    id: UUID;
    name: string;
    projectId: UUID;
    networkId: UUID;
    destinationRange: string; // CIDR range
    nextHop: 'GATEWAY' | 'IP_ADDRESS' | 'INSTANCE' | 'VPN_TUNNEL' | 'INTERCONNECT_ATTACHMENT' | 'PEERING';
    nextHopIpAddress?: string; // If nextHop is IP_ADDRESS
    nextHopInstanceId?: UUID; // If nextHop is INSTANCE
    nextHopVpnTunnelId?: UUID; // If nextHop is VPN_TUNNEL
    priority: number;
    metadata: ResourceMetadata;
    description?: string;
}

export interface PublicIPAddress {
    id: UUID;
    name: string;
    projectId: UUID;
    region?: string; // Or global for global resources
    ipAddress: string;
    status: ResourceState; // e.g., RESERVED, IN_USE, DELETING
    attachedResourceId?: UUID; // ID of VM, Load Balancer, etc.
    attachedResourceType?: 'VIRTUAL_MACHINE' | 'LOAD_BALANCER' | 'VPN_GATEWAY' | 'NAT_GATEWAY' | 'FORWARDING_RULE';
    networkTier: 'PREMIUM' | 'STANDARD';
    metadata: ResourceMetadata;
}

export enum LoadBalancerProtocol {
    HTTP = 'HTTP',
    HTTPS = 'HTTPS',
    TCP = 'TCP',
    UDP = 'UDP',
    SSL = 'SSL',
}

export interface LoadBalancer {
    id: UUID;
    name: string;
    projectId: UUID;
    region?: string; // Global or regional
    type: LoadBalancerType;
    frontendIpAddress: string; // Public or Private IP
    frontendPorts: string[]; // e.g., ['80', '443', '8080']
    targetGroupId: UUID; // Link to TargetGroup or BackendService
    healthCheckPath: string; // e.g., /healthz or custom probe
    healthCheckPort: number;
    protocol: LoadBalancerProtocol;
    status: ResourceState;
    sslPolicyId?: UUID; // Link to SSLPolicy
    metadata: ResourceMetadata;
    ipAddressType: 'IPV4' | 'IPV6' | 'IPV4_IPV6';
    securityPolicyId?: UUID; // Link to SecurityPolicy (WAF)
}

export interface TargetGroup {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    instances: { instanceId: UUID; instanceType: 'VIRTUAL_MACHINE' | 'CONTAINER_INSTANCE' | 'SERVERLESS_FUNCTION' | 'KUBERNETES_SERVICE' }[];
    healthCheckProtocol: 'HTTP' | 'HTTPS' | 'TCP' | 'SSL' | 'UDP';
    healthCheckIntervalSeconds: number;
    unhealthyThreshold: number;
    healthyThreshold: number;
    port: number; // Port on target instances
    metadata: ResourceMetadata;
    sessionAffinity: 'NONE' | 'CLIENT_IP' | 'GENERATED_COOKIE';
}

export interface VPNConnection {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    gatewayId: UUID; // Link to VPNGateway
    peerExternalGatewayIp: string;
    tunnelStatus: ResourceState; // e.g., CONNECTED, DISCONNECTED, NEGOTIATING
    encryptionAlgorithm: 'AES256' | 'AES128' | 'CHACHA20_POLY1305';
    ikeVersion: 'IKEv1' | 'IKEv2';
    sharedSecretId: UUID; // Link to Secret
    metadata: ResourceMetadata;
    routingType: 'ROUTE_BASED' | 'POLICY_BASED' | 'BGP';
    peerExternalGatewayInterface?: number;
}

export interface VPNGateway {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    networkId: UUID; // Link to VirtualNetwork
    gatewayIpAddress: string; // Cloud side IP
    status: ResourceState;
    metadata: ResourceMetadata;
    vpnInterfaceIds: UUID[]; // Links to VpnGatewayInterface
}

export interface VpnGatewayInterface {
    id: UUID;
    ipAddress: string;
    vpnGatewayId: UUID;
    metadata: ResourceMetadata;
}

export interface DNSZone {
    id: UUID;
    name: string;
    projectId: UUID;
    dnsName: string; // e.g., 'example.com.'
    description?: string;
    nameServers: string[]; // Google's authoritative name servers
    metadata: ResourceMetadata;
    visibility: 'PUBLIC' | 'PRIVATE';
    privateViewNetworkIds?: UUID[]; // Links to VirtualNetwork for private zones
}

export enum DNSRecordType {
    A = 'A',
    AAAA = 'AAAA',
    CNAME = 'CNAME',
    MX = 'MX',
    TXT = 'TXT',
    SRV = 'SRV',
    NS = 'NS',
    PTR = 'PTR',
    CAA = 'CAA',
    DS = 'DS',
    SPF = 'SPF',
    NAPTR = 'NAPTR',
    SVCB = 'SVCB',
    HTTPS = 'HTTPS',
}

export interface DNSRecordSet {
    id: UUID;
    name: string; // e.g., 'www.example.com.', 'mail.example.com.'
    dnsZoneId: UUID; // Link to DNSZone
    type: DNSRecordType;
    ttlSeconds: number;
    rrdatas: string[]; // List of record data (e.g., IP addresses for A, CNAME target for CNAME)
    metadata: ResourceMetadata;
    routingPolicy?: {
        type: 'ROUND_ROBIN' | 'WEIGHTED' | 'GEOLOCATION' | 'FAILOVER';
        details?: { [key: string]: any; }; // Policy specific details
    };
}

export interface APIGateway {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    status: ResourceState;
    endpoint: string; // Gateway URL (e.g., "https://my-gateway.apigee.net")
    managedServices: UUID[]; // Links to ServerlessFunction, KubernetesCluster services, App Engine versions, etc.
    apiKeyRequired: boolean;
    metadata: ResourceMetadata;
    securityPolicyId?: UUID; // Link to SecurityPolicy
    corsPolicy?: {
        allowOrigins: string[];
        allowMethods: string[];
        allowHeaders: string[];
        exposeHeaders: string[];
        maxAgeSeconds: number;
        allowCredentials: boolean;
    };
    authenticationPolicy?: {
        jwtAudience?: string[];
        jwtIssuer?: string;
        backendAuthMechanism: 'NONE' | 'IAM' | 'API_KEY';
    };
}

export interface CDNService {
    id: UUID;
    name: string;
    projectId: UUID;
    originBucketId?: UUID; // Link to StorageBucket
    originLoadBalancerId?: UUID; // Link to LoadBalancer
    cacheMode: 'CACHE_ALL_STATIC_CONTENT' | 'USE_ORIGIN_HEADERS' | 'FORCE_CACHE_ALL';
    maxAgeSeconds: number;
    signedUrlsEnabled: boolean;
    status: ResourceState;
    metadata: ResourceMetadata;
    cacheKeyPolicy?: {
        includeHost: boolean;
        includeProtocol: boolean;
        includeQueryString: boolean;
        queryStringBlacklist?: string[];
        queryStringWhitelist?: string[];
    };
    cdnPolicy?: {
        defaultTtl?: Duration;
        clientTtl?: Duration;
        maxTtl?: Duration;
        negativeCaching: boolean;
        serveWhileStale?: Duration;
    };
}

// --- IDENTITY & SECURITY SERVICES ---

export enum AuthMethod {
    PASSWORD = 'PASSWORD',
    MFA_TOKEN = 'MFA_TOKEN',
    OAUTH2 = 'OAUTH2',
    SAML = 'SAML',
    API_KEY = 'API_KEY',
    SERVICE_ACCOUNT_KEY = 'SERVICE_ACCOUNT_KEY',
    OPENID_CONNECT = 'OPENID_CONNECT',
}

export enum PolicyEffect {
    ALLOW = 'ALLOW',
    DENY = 'DENY',
}

export interface IdentityUser {
    id: UUID;
    username: string;
    email: string;
    displayName: string;
    status: ResourceState; // e.g., ACTIVE, SUSPENDED, DISABLED
    authMethods: AuthMethod[];
    lastLoginTime?: Timestamp;
    creationTime: Timestamp;
    metadata: ResourceMetadata;
    mfaEnabled: boolean;
    externalIdP?: { provider: string; userId: string; }; // For federated identities
}

export interface ServiceAccount {
    id: UUID;
    name: string;
    projectId: UUID;
    email: string; // Standard email format: <name>@<project-id>.iam.gserviceaccount.com
    description?: string;
    privateKeyAvailable: boolean; // Indicates if keys can be created/managed
    metadata: ResourceMetadata;
    oauth2ClientId?: string; // If used for OAuth2
    disabled: boolean;
}

export interface IAMRole {
    id: UUID;
    name: string; // e.g., 'roles/compute.viewer'
    title: string;
    description: string;
    permissions: string[]; // List of specific permissions (e.g., 'compute.instances.get', 'storage.buckets.list')
    custom: boolean; // True if it's a custom role
    metadata: ResourceMetadata;
    stage: 'ALPHA' | 'BETA' | 'GA' | 'DEPRECATED'; // Lifecycle stage for predefined roles
}

export interface IAMPolicyBinding {
    id: UUID;
    resourceName: ResourceName; // Full resource path (e.g., "//cloudresourcemanager.googleapis.com/projects/123/buckets/my-bucket")
    roleId: UUID; // Link to IAMRole
    members: string[]; // List of user/service account emails or member identifiers (e.g., "user:test@example.com", "serviceAccount:my-sa@project.iam.gserviceaccount.com")
    condition?: {
        expression: string; // CEL expression (e.g., "resource.type == 'storage.googleapis.com/Bucket' && resource.name.startsWith('my-bucket-')")
        title?: string;
        description?: string;
    };
    metadata: ResourceMetadata;
}

export interface SecretVersion {
    id: UUID;
    secretId: UUID; // Link to Secret
    version: number;
    status: ResourceState; // e.g., ENABLED, DISABLED, DESTROYED
    createTime: Timestamp;
    destroyTime?: Timestamp;
    payloadChecksum: string; // SHA256 checksum of the secret payload
    metadata: ResourceMetadata;
    etag?: string; // For optimistic locking
}

export interface Secret {
    id: UUID;
    name: string;
    projectId: UUID;
    replicationPolicy: 'AUTOMATIC' | 'USER_MANAGED';
    userManagedReplicas?: { location: string; }[]; // If USER_MANAGED, specifies regions
    expiration?: Timestamp;
    latestVersionId?: UUID; // Link to latest SecretVersion
    metadata: ResourceMetadata;
    labels?: ResourceLabels;
    ttl?: Duration; // Time-to-live for versions
}

export interface KMSKeyRing {
    id: UUID;
    name: string;
    projectId: UUID;
    location: string; // Region or Global
    metadata: ResourceMetadata;
}

export enum KMSKeyPurpose {
    ENCRYPT_DECRYPT = 'ENCRYPT_DECRYPT',
    ASYMMETRIC_SIGN = 'ASYMMETRIC_SIGN',
    ASYMMETRIC_DECRYPT = 'ASYMMETRIC_DECRYPT',
    MAC = 'MAC',
    ENCRYPT_DECRYPT_RAW_AES = 'ENCRYPT_DECRYPT_RAW_AES',
    ENCRYPT_DECRYPT_RAW_DES = 'ENCRYPT_DECRYPT_RAW_DES',
}

export enum KMSKeyProtectionLevel {
    SOFTWARE = 'SOFTWARE',
    HSM = 'HSM',
    EXTERNAL = 'EXTERNAL', // Cloud EKM
    EXTERNAL_VPC = 'EXTERNAL_VPC', // Cloud EKM over VPC
}

export interface KMSKey {
    id: UUID;
    name: string;
    keyRingId: UUID; // Link to KMSKeyRing
    purpose: KMSKeyPurpose;
    protectionLevel: KMSKeyProtectionLevel;
    rotationPeriod?: Duration;
    nextRotationTime?: Timestamp;
    primaryKeyVersionId?: UUID; // Link to KMSKeyVersion
    metadata: ResourceMetadata;
    labels?: ResourceLabels;
    destroyScheduledDuration?: Duration; // Time period after which a key version will be destroyed
}

export interface KMSKeyVersion {
    id: UUID;
    keyId: UUID; // Link to KMSKey
    version: number;
    state: ResourceState; // e.g., ENABLED, DISABLED, DESTROYED, PENDING_GENERATION, PENDING_DESTRUCTION
    creationTime: Timestamp;
    destroyEventTime?: Timestamp;
    attestation?: {
        type: 'ATTESTATION_NONE' | 'ATTESTATION_UNSPECIFIED' | 'ATTESTATION_MANUAL' | 'ATTESTATION_GENERATED_EXTERNAL';
        certChain?: string[]; // PEM encoded cert chain
        externalProtectionLevelOptions?: { ekmConnectionId: UUID; ekmConnectionKeyPath: string; };
    };
    metadata: ResourceMetadata;
}

export interface SecurityPolicy {
    id: UUID;
    name: string;
    projectId: UUID;
    description: string;
    defaultAction: 'ALLOW' | 'DENY';
    rules: {
        priority: number;
        description?: string;
        match: {
            versionedExpr: string; // e.g., 'google.protobuf.UInt32Value(value=1)' (predefined WAF rules)
            srcIpRanges?: string[];
            destIpRanges?: string[];
            expr?: { expression: string; }; // Custom CEL expression for advanced matching
            config?: { [key: string]: any; }; // For specific WAF rules like SQLi, XSS
        };
        action: 'ALLOW' | 'DENY' | 'REDIRECT' | 'THROTTLE' | 'RATE_LIMIT' | 'ADAPTIVE_PROTECTION';
        redirectTarget?: string; // If action is REDIRECT
        rateLimitOptions?: {
            threshold: number; // requests per unit
            intervalSeconds: number;
            target: 'ALL' | 'IP' | 'HTTP_HEADER'; // Target for rate limiting
            targetHttpHeader?: string; // If target is HTTP_HEADER
        };
        enforceOnKey?: 'IP' | 'HTTP_HEADER' | 'QUERY_PARAM'; // For Adaptive Protection
    }[];
    metadata: ResourceMetadata;
    fingerprint?: string; // Used for optimistic locking
}

export interface SecurityHealthCheck {
    id: UUID;
    name: string;
    projectId: UUID;
    status: ResourceState; // e.g., PASSED, FAILED, WARNING
    category: string; // e.g., 'IAM', 'NETWORK', 'STORAGE'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendation: string; // Actionable advice
    affectedResources: ResourceName[];
    lastRunTime: Timestamp;
    metadata: ResourceMetadata;
}

// --- MONITORING & LOGGING SERVICES ---

export enum MetricAggregationType {
    NONE = 'NONE',
    MEAN = 'MEAN',
    SUM = 'SUM',
    MAX = 'MAX',
    MIN = 'MIN',
    COUNT = 'COUNT',
    GAUGE = 'GAUGE',
    DELTA = 'DELTA',
    CUMULATIVE = 'CUMULATIVE',
    PERCENTILE_05 = 'PERCENTILE_05',
    PERCENTILE_50 = 'PERCENTILE_50',
    PERCENTILE_95 = 'PERCENTILE_95',
    PERCENTILE_99 = 'PERCENTILE_99',
}

export enum LogSeverity {
    DEFAULT = 'DEFAULT',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    NOTICE = 'NOTICE',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL',
    ALERT = 'ALERT',
    EMERGENCY = 'EMERGENCY',
}

export interface MonitoringMetricDescriptor {
    name: string; // e.g., 'compute.googleapis.com/instance/cpu/utilization'
    metricKind: 'GAUGE' | 'DELTA' | 'CUMULATIVE';
    valueType: 'INT64' | 'DOUBLE' | 'MONEY' | 'BOOL' | 'STRING' | 'DISTRIBUTION';
    unit: string; // e.g., 'percent', 'bytes', 'count', 'ns'
    description: string;
    displayName: string;
    labels: { key: string; valueType: 'STRING' | 'BOOL'; description?: string; }[];
    metadata: ResourceMetadata;
    monitoredResourceTypes: string[]; // e.g., 'gce_instance', 'k8s_container'
}

export interface MonitoringTimeSeries {
    metric: {
        type: string; // MetricDescriptor name
        labels: { [key: string]: string; };
    };
    resource: {
        type: string; // e.g., 'gce_instance'
        labels: { [key: string]: string; };
    };
    points: {
        interval: {
            startTime: Timestamp;
            endTime: Timestamp;
        };
        value: {
            int64Value?: string;
            doubleValue?: number;
            boolValue?: boolean;
            stringValue?: string;
            distributionValue?: {
                count: string;
                mean: number;
                sumOfSquaredDeviation?: number;
                bucketOptions: {
                    linearBuckets?: { numFiniteBuckets: number; width: number; offset: number; };
                    exponentialBuckets?: { numFiniteBuckets: number; growthFactor: number; scale: number; };
                    explicitBuckets?: { bounds: number[]; };
                };
                bucketCounts?: string[]; // counts for each bucket
            };
        };
    }[];
}

export interface LogEntry {
    insertId: string; // Unique ID for the entry
    logName: string; // Name of the log (e.g., 'projects/my-project/logs/appengine.googleapis.com%2Frequest_log')
    resource: {
        type: string; // e.g., 'gce_instance', 'cloud_function'
        labels: { [key: string]: string; };
    };
    timestamp: Timestamp;
    severity: LogSeverity;
    textPayload?: string;
    jsonPayload?: { [key: string]: any; };
    protoPayload?: { [key: string]: any; }; // For structured logs like audit logs
    operation?: {
        id: string;
        producer: string; // e.g., 'compute.googleapis.com'
        first?: boolean;
        last?: boolean;
        cancellable?: boolean;
        progress?: number;
    };
    trace?: string; // Trace ID (e.g., 'projects/p1/traces/trace-id')
    spanId?: string; // Span ID within the trace
    receiveTimestamp: Timestamp;
    metadata: ResourceMetadata;
    httpRequest?: {
        requestMethod: string;
        requestUrl: string;
        requestSize: string;
        status: number;
        responseSize: string;
        userAgent?: string;
        remoteIp?: string;
        serverIp?: string;
        referer?: string;
        latency?: Duration;
        cacheHit?: boolean;
        cacheValidatedWithOriginServer?: boolean;
    };
    sourceLocation?: {
        file: string;
        line: string;
        functionName: string;
    };
}

export interface LogSink {
    id: UUID;
    name: string;
    projectId: UUID;
    destination: string; // e.g., 'pubsub.googleapis.com/projects/my-project/topics/my-log-topic', 'bigquery.googleapis.com/projects/my-project/datasets/my_logs'
    filter: string; // Logging query language filter (e.g., 'severity = ERROR AND protoPayload.@type = "type.googleapis.com/google.cloud.audit.AuditLog"')
    includeChildren: boolean; // Whether to include logs from child resources
    writerIdentity: string; // Service account used to write to the destination
    metadata: ResourceMetadata;
    disabled: boolean;
}

export interface AlertPolicy {
    id: UUID;
    name: string;
    projectId: UUID;
    displayName: string;
    documentation?: {
        content: string; // Markdown content for alert details
        mimeType: 'text/markdown';
    };
    combiner: 'AND' | 'OR' | 'AND_WITH_MATCHING_RESOURCES';
    conditions: {
        name: string;
        displayName: string;
        conditionMatchedTimeSeries: { // For metric-based alerts
            filter: string; // Monitoring Query Language filter
            aggregation?: {
                alignmentPeriod: Duration;
                perSeriesAligner: MetricAggregationType;
                crossSeriesReducer: MetricAggregationType;
                groupByFields?: string[];
            };
            threshold: number;
            comparison: 'COMPARISON_UNSPECIFIED' | 'COMPARISON_GT' | 'COMPARISON_GE' | 'COMPARISON_LT' | 'COMPARISON_LE' | 'COMPARISON_EQ' | 'COMPARISON_NE';
            trigger?: {
                count?: number; // Number of consecutive periods
                percent?: number; // Percent of total
            };
            duration: Duration; // How long the condition must hold true
        };
        conditionAbsent?: { // For uptime checks / resource absence
            filter: string;
            duration: Duration;
            trigger?: { count?: number; percent?: number; };
        };
        conditionPrometheusQuery?: { // For Prometheus-style queries
            query: string;
            duration: Duration;
            evaluationInterval: Duration;
            alertRule: string;
            noDataState: 'NO_DATA' | 'ALERT' | 'OK';
        };
    }[];
    enabled: boolean;
    alertStrategy: {
        autoClose?: Duration; // e.g., 'PT1H' (duration to auto-resolve incidents)
        notificationChannels: UUID[]; // Links to NotificationChannel
        notificationRateLimit?: Duration; // Minimum time between notifications for the same incident
    };
    metadata: ResourceMetadata;
    severity: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';
}

export enum NotificationChannelType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PAGERDUTY = 'PAGERDUTY',
    SLACK = 'SLACK',
    WEBHOOK = 'WEBHOOK',
    MOBILE_APP = 'MOBILE_APP',
    GOOGLE_CHAT = 'GOOGLE_CHAT',
    JIRA = 'JIRA',
}

export interface NotificationChannel {
    id: UUID;
    name: string;
    projectId: UUID;
    type: NotificationChannelType;
    displayName: string;
    description: string;
    enabled: boolean;
    labels?: ResourceLabels; // e.g., email_address: 'admin@example.com', slack_channel: '#ops'
    webhookUrl?: string; // If type is WEBHOOK
    metadata: ResourceMetadata;
}

export interface DashboardConfiguration {
    id: UUID;
    name: string;
    projectId: UUID;
    displayName: string;
    layout: 'GRID' | 'COLUMN' | 'ROW' | 'MOSAIC';
    widgets: {
        id: UUID;
        title: string;
        type: 'TEXT' | 'METRIC_CHART' | 'LOGS_PANEL' | 'INCIDENT_LIST' | 'ALERT_CHART' | 'GAUGE' | 'SCORECARD' | 'TABLE';
        properties: { [key: string]: any }; // Widget-specific properties (e.g., MQL query for charts, log filter for panels)
        xPos: number; // For grid layout
        yPos: number;
        width: number;
        height: number;
    }[];
    metadata: ResourceMetadata;
    etag?: string; // For optimistic locking
}

export interface TraceSpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    name: string; // Name of the operation
    kind: 'CLIENT' | 'SERVER' | 'PRODUCER' | 'CONSUMER' | 'INTERNAL';
    startTime: Timestamp;
    endTime: Timestamp;
    attributes: { [key: string]: string; }; // Key-value pairs like http.method, http.status_code
    stackTrace?: {
        stackFrames: {
            functionName: string;
            originalFunctionName?: string;
            fileName: string;
            lineNumber: string;
            columnNumber: string;
            loadModule?: { name: string; buildId?: string; };
        }[];
        stackFramesTruncated?: boolean;
    };
    timeEvents?: {
        time: Timestamp;
        value: {
            annotation?: { description: string; attributes?: { [key: string]: string; }; };
            messageEvent?: {
                type: 'SENT' | 'RECEIVED';
                id: string;
                uncompressedSizeBytes?: string;
                compressedSizeBytes?: string;
            };
        };
    }[];
    links?: {
        traceId: string;
        spanId: string;
        type: 'UNSPECIFIED' | 'CHILD_LINKED_SPAN' | 'PARENT_LINKED_SPAN';
        attributes?: { [key: string]: string; };
    }[];
    status?: {
        code: number; // gRPC status code
        message?: string;
    };
    sameProcessAsParentSpan?: boolean;
    childSpanCount?: number;
}


// --- AI/MACHINE LEARNING SERVICES ---

export enum MLModelType {
    CUSTOM = 'CUSTOM',
    IMAGE_CLASSIFICATION = 'IMAGE_CLASSIFICATION',
    OBJECT_DETECTION = 'OBJECT_DETECTION',
    NATURAL_LANGUAGE_CLASSIFICATION = 'NATURAL_LANGUAGE_CLASSIFICATION',
    NATURAL_LANGUAGE_ENTITY_EXTRACTION = 'NATURAL_LANGUAGE_ENTITY_EXTRACTION',
    TRANSLATION = 'TRANSLATION',
    SPEECH_TO_TEXT = 'SPEECH_TO_TEXT',
    TEXT_TO_SPEECH = 'TEXT_TO_SPEECH',
    RECOMMENDER = 'RECOMMENDER',
    TIME_SERIES_FORECAST = 'TIME_SERIES_FORECAST',
    GENERATIVE_AI_TEXT = 'GENERATIVE_AI_TEXT',
    GENERATIVE_AI_IMAGE = 'GENERATIVE_AI_IMAGE',
    GENERATIVE_AI_CODE = 'GENERATIVE_AI_CODE',
    EMBEDDING = 'EMBEDDING',
}

export enum MLModelFramework {
    TENSORFLOW = 'TENSORFLOW',
    PYTORCH = 'PYTORCH',
    JAX = 'JAX',
    SCIKIT_LEARN = 'SCIKIT_LEARN',
    XGBOOST = 'XGBOOST',
    ONNX = 'ONNX',
    HUGGING_FACE = 'HUGGING_FACE',
    TENSORFLOW_LITE = 'TENSORFLOW_LITE',
}

export interface MLModel {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    type: MLModelType;
    framework: MLModelFramework;
    version: string;
    status: ResourceState; // e.g., READY, TRAINING, FAILED, DEPLOYING
    sourceUri: string; // GCS URI to model artifacts (e.g., "gs://my-bucket/models/my-model-v1/")
    description?: string;
    inputSchema?: { [key: string]: string; }; // e.g., { "feature1": "float", "feature2": "string" }
    outputSchema?: { [key: string]: string; }; // e.g., { "prediction": "float", "confidence": "float" }
    metadata: ResourceMetadata;
    trainingDatasetId?: UUID; // Link to Dataset
    metrics?: {
        accuracy?: number;
        precision?: number;
        recall?: number;
        f1Score?: number;
        auc?: number;
        rmse?: number;
        rSquared?: number;
        mape?: number;
        perplexity?: number; // For language models
    };
    defaultDeployedVersionId?: UUID; // Link to ModelVersion for default inference
}

export interface Dataset {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    sourceUri: string; // GCS URI to data (e.g., "gs://my-bucket/datasets/my-data/")
    dataType: 'IMAGE' | 'TEXT' | 'TABULAR' | 'VIDEO' | 'AUDIO' | 'TIME_SERIES';
    dataSizeGb: number;
    rowCount?: number; // For tabular data
    metadata: ResourceMetadata;
    labels?: ResourceLabels;
    schemaUri?: string; // GCS URI to schema definition (e.g., Avro, Parquet)
    exampleCount?: number;
    dataPreprocessingConfig?: {
        splitMethod: 'RANDOM' | 'STRATIFIED' | 'TIMESTAMP';
        trainingFraction?: number;
        validationFraction?: number;
        testFraction?: number;
    };
}

export interface TrainingJob {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    modelId?: UUID; // Link to MLModel (if fine-tuning an existing model or creating new version)
    datasetId?: UUID; // Link to Dataset
    status: ResourceState;
    startTime: Timestamp;
    endTime?: Timestamp;
    workerPoolSpecs: {
        replicaCount: number;
        machineType: MachineType; // Linked MachineType
        gpuAccelerators?: GPUAccelerator[];
        containerSpec: ContainerSpec; // Docker image for training code
    }[];
    hyperparameters?: { [key: string]: string; }; // e.g., { "learning_rate": "0.01", "epochs": "10" }
    outputModelUri?: string; // GCS URI to trained model artifacts
    logsUri?: string; // GCS URI to job logs
    metadata: ResourceMetadata;
    serviceAccountEmail?: string;
    customJobSpec?: {
        pythonPackageUri?: string; // GCS URI to Python package
        executorImageUri?: string; // Custom base image for Python package
    };
}

export interface InferenceEndpoint {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    modelId: UUID; // Link to MLModel
    status: ResourceState;
    endpointUrl: string; // URL for predictions
    deployedModelCount: number;
    trafficSplit: { [version: string]: number; }; // e.g., { "v1": 0.8, "v2": 0.2 } for different model versions
    minReplicaCount: number;
    maxReplicaCount: number;
    autoscalingMetric: 'CPU_UTILIZATION' | 'GPU_UTILIZATION' | 'REQUEST_COUNT_PER_SECOND' | 'LATENCY';
    metadata: ResourceMetadata;
    privateEndpoint: boolean;
    networkId?: UUID; // Link to VirtualNetwork for private endpoint
    monitoringConfig?: {
        enableLatencyLogging: boolean;
        enableInputLogging: boolean;
        sampleRate?: number; // For input logging
        logSinkId?: UUID; // Link to LogSink for logging inference requests
    };
}

export interface FeatureStore {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    status: ResourceState;
    onlineServingConfig: {
        fixedNodeCount?: number;
        autoscalingMinNodes?: number;
        autoscalingMaxNodes?: number;
    };
    metadata: ResourceMetadata;
    entityTypes: {
        id: UUID;
        name: string;
        description?: string;
        features: {
            name: string;
            valueType: 'BOOL' | 'INT64' | 'DOUBLE' | 'STRING' | 'BYTES' | 'BOOL_ARRAY' | 'INT64_ARRAY' | 'DOUBLE_ARRAY' | 'STRING_ARRAY' | 'BYTES_ARRAY';
            description?: string;
            valueSource?: 'STREAMING' | 'BATCH'; // How feature values are ingested
        }[];
    }[];
    labels?: ResourceLabels;
}

export interface VertexAISearchEngine {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    status: ResourceState;
    dataStoreIds: UUID[]; // Links to DataStore (for unstructured data like PDFs, HTML)
    documentCount: number;
    indexSizeGb: number;
    metadata: ResourceMetadata;
    servingEndpoint: string;
    queryCapacityUnits: number;
    languageCode?: string; // e.g., 'en-US'
    solutionType: 'SEARCH' | 'RECOMMENDATION' | 'CONVERSATIONAL';
}

// --- DATA ANALYTICS & STREAMING ---

export interface DataPipeline {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    status: ResourceState;
    sourceIds: ResourceName[]; // Links to StorageBucket, DatabaseInstance, MessageQueueTopic, DataLake
    sinkIds: ResourceName[]; // Links to DataWarehouse, StorageBucket, MessageQueueTopic, DatabaseInstance
    transformationLogicUri: string; // GCS URI or Git URL to transformation code (e.g., Dataflow template, Spark job)
    schedule?: string; // Cron expression
    metadata: ResourceMetadata;
    lastRunTime?: Timestamp;
    nextRunTime?: Timestamp;
    pipelineType: 'BATCH' | 'STREAMING';
    monitoringUrl?: string; // Link to monitoring dashboard
}

export interface MessageQueueTopic {
    id: UUID;
    name: string;
    projectId: UUID;
    region?: string; // Can be global or regional
    messageRetentionDuration: Duration;
    status: ResourceState;
    metadata: ResourceMetadata;
    labels?: ResourceLabels;
    kmsKeyId?: UUID; // Link to KMSKey for message encryption
    schemaId?: UUID; // Link to Schema for message validation
}

export enum SubscriptionDeliveryType {
    PULL = 'PULL',
    PUSH = 'PUSH',
    BIGQUERY = 'BIGQUERY',
    CLOUD_STORAGE = 'CLOUD_STORAGE',
}

export interface MessageQueueSubscription {
    id: UUID;
    name: string;
    projectId: UUID;
    topicId: UUID; // Link to MessageQueueTopic
    ackDeadlineSeconds: number;
    expirationPolicy?: Duration; // If subscription expires
    deliveryType: SubscriptionDeliveryType;
    pushConfig?: {
        pushEndpoint: string; // URL for push endpoint
        attributes?: { [key: string]: string; }; // Custom headers
        authServiceAccountEmail?: string; // Service account for push authentication
    };
    pullConfig?: {
        maxMessages: number; // Max messages to pull in one request
    };
    bigQueryConfig?: {
        tableId: UUID; // Link to BigQuery Table
        writeMetadata: boolean;
        useTopicSchema: boolean;
    };
    cloudStorageConfig?: {
        bucketId: UUID; // Link to StorageBucket
        filenamePrefix?: string;
        filenameSuffix?: string;
        maxBytes: string;
        maxDuration: Duration;
    };
    filter?: string; // Filter for messages (e.g., 'attributes.severity = "ERROR" AND has(attributes.traceId)')
    status: ResourceState;
    metadata: ResourceMetadata;
    retainAcknowledgedMessages: boolean;
}

export interface StreamProcessingJob {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    status: ResourceState;
    jobType: 'DATAFLOW' | 'SPARK_STREAMING' | 'FLINK' | 'KAFKA_STREAMS';
    templateUri: string; // GCS URI to job template or source code
    parameters?: { [key: string]: string; };
    inputSources: ResourceName[]; // Links to MessageQueueTopic, DataLake, StorageBucket
    outputSinks: ResourceName[]; // Links to MessageQueueTopic, DataWarehouse, StorageBucket, DatabaseInstance
    metadata: ResourceMetadata;
    minWorkers: number;
    maxWorkers: number;
    machineType: MachineType; // Linked machine type for workers
    dataDiskSizeGb: number;
    serviceAccountEmail?: string;
    flexResourceSchedulingEnabled: boolean;
    streamingEngineEnabled: boolean;
}

// --- IoT & Blockchain ---

export enum IoTDeviceProtocol {
    MQTT = 'MQTT',
    HTTP = 'HTTP',
    COAP = 'COAP',
    AMQP = 'AMQP',
}

export interface IoTDevice {
    id: UUID;
    name: string;
    projectId: UUID;
    registryId: UUID; // Link to IoTRegistry
    lastHeartbeatTime?: Timestamp;
    lastEventTime?: Timestamp;
    lastStateTime?: Timestamp;
    blocked: boolean;
    credentials: { publicKeyFormat: 'RSA_PEM' | 'ES256_PEM'; publicKey: string; }[];
    metadata: ResourceMetadata;
    numIdiotEvents?: number; // Example of a custom metric for IoT devices
    gatewayAuthRequired: boolean;
    logLevel: 'NONE' | 'ERROR' | 'INFO' | 'DEBUG';
}

export interface IoTRegistry {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    eventNotificationConfigs: {
        pubsubTopicId: UUID; // Link to MessageQueueTopic
        subfolder?: string;
    }[];
    stateNotificationConfig?: {
        pubsubTopicId: UUID; // Link to MessageQueueTopic
    };
    logLevel: 'NONE' | 'ERROR' | 'INFO' | 'DEBUG';
    metadata: ResourceMetadata;
    httpConfig?: {
        httpEnabledState: 'HTTP_ENABLED' | 'HTTP_DISABLED';
    };
    mqttConfig?: {
        mqttEnabledState: 'MQTT_ENABLED' | 'MQTT_DISABLED';
    };
}

export interface IoTGateway {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    gatewayType: 'MQTT' | 'HTTP' | 'COAP';
    deviceRegistryId: UUID; // Link to IoTRegistry this gateway manages
    status: EdgeDeviceStatus; // Using general edge device status
    lastAccessedTime: Timestamp;
    metadata: ResourceMetadata;
    supportedProtocols: IoTDeviceProtocol[];
    gatewayConfig?: {
        gatewayAuthMethod: 'ASSOCIATION_ONLY' | 'DEVICE_AUTH_TOKEN_OR_ASSOCIATION';
        mqttEnabledState: 'MQTT_ENABLED' | 'MQTT_DISABLED';
        httpEnabledState: 'HTTP_ENABLED' | 'HTTP_DISABLED';
    };
}

export enum BlockchainType {
    ETHEREUM = 'ETHEREUM',
    HYPERLEDGER_FABRIC = 'HYPERLEDGER_FABRIC',
    BITCOIN = 'BITCOIN',
    POLYGON = 'POLYGON',
    SOLANA = 'SOLANA',
    AVALANCHE = 'AVALANCHE',
}

export enum BlockchainNodeType {
    FULL = 'FULL',
    ARCHIVAL = 'ARCHIVAL',
    VALIDATOR = 'VALIDATOR',
    LIGHT = 'LIGHT',
    MINER = 'MINER',
}

export interface BlockchainNode {
    id: UUID;
    name: string;
    projectId: UUID;
    region: string;
    blockchainType: BlockchainType;
    network: string; // e.g., 'mainnet', 'testnet', 'goerli'
    nodeType: BlockchainNodeType;
    status: ResourceState;
    endpoint: string; // RPC endpoint
    metadata: ResourceMetadata;
    machineType: MachineType; // Linked MachineType for node
    diskSizeGb: number;
    apiEndpoint?: string;
    p2pEndpoint?: string;
    privateEndpoint: boolean;
    autodeleteDisk: boolean;
}

// --- QUANTUM COMPUTING (Future-proofing) ---
export enum QuantumProcessorType {
    SYCAMORE = 'SYCAMORE',
    ZUCHONGZHI = 'ZUCHONGZHI',
    EAGLE = 'EAGLE',
    OSPREY = 'OSPREY',
    CONDOR = 'CONDOR',
    HERON = 'HERON',
}

export interface QuantumComputeUnit {
    id: UUID;
    name: string;
    location: string; // Specific lab location (e.g., 'Google_Santa_Barbara_Quantum_AI_Lab')
    processorType: QuantumProcessorType;
    qubitCount: number;
    connectivityMap: string; // e.g., graph representation of qubit connectivity
    coherenceTimeMillis: number; // T2 coherence time
    readoutFidelityPercent: number;
    singleQubitGateFidelityPercent: number;
    twoQubitGateFidelityPercent: number;
    status: ResourceState; // e.g., AVAILABLE, RESERVED, MAINTENANCE, OFFLINE
    supportedGates: string[]; // e.g., 'H', 'CNOT', 'RX(theta)', 'SWAP', 'SQRT_SWAP'
    metadata: ResourceMetadata;
    temperatureKelvin: number; // Operating temperature
    coolingMethod: 'DILUTION_REFRIGERATOR' | 'SUPERCONDUCTING_MAGNET';
    accessPolicy: 'PUBLIC' | 'PRIVATE' | 'SHARED';
}

export enum QuantumCircuitLanguage {
    QASM = 'QASM',
    CIRQC = 'CIRQC',
    QISKIT = 'QISKIT',
    OPENQASM3 = 'OPENQASM3',
}

export interface QuantumCircuit {
    id: UUID;
    name: string;
    projectId: UUID;
    qpuId?: UUID; // Link to specific QuantumComputeUnit, or type of QPU required
    status: ResourceState; // e.g., SUBMITTED, RUNNING, COMPLETED, FAILED, QUEUED
    programSource: string; // QASM or Cirq/Qiskit code
    language: QuantumCircuitLanguage;
    shots: number; // Number of times to run the circuit
    resultDataUri?: string; // GCS URI for raw measurement results
    metadata: ResourceMetadata;
    parameters?: { [key: string]: string; }; // Parameters for parametric circuits
    estimatedExecutionTimeMillis?: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

// --- Management & Billing ---

export interface QuotaMetric {
    metric: string; // e.g., 'compute.googleapis.com/cpus'
    limit: string; // Quota limit name (e.g., 'CPUS_PER_PROJECT_PER_REGION')
    region?: string; // If regional
    unit: string; // e.g., 'count', 'bytes', 'requests/s'
}

export interface QuotaPolicy {
    id: UUID;
    name: string;
    projectId: UUID;
    consumerId: string; // e.g., 'project:my-project', 'folder:123'
    quotaMetrics: QuotaMetric[];
    enforcementMode: 'DEFAULT' | 'ENABLED' | 'DISABLED_IN_FORCE' | 'NOT_ENFORCED_FOR_FREE_TIER';
    metadata: ResourceMetadata;
    desiredLimit: string; // The desired limit value for a specific metric
    reasonForChange?: string;
    status: ResourceState; // e.g., PENDING_APPROVAL, APPROVED, DENIED
}

export interface BillingAccount {
    id: UUID;
    name: string;
    displayName: string;
    open: boolean; // Whether the billing account is open or closed
    creationTime: Timestamp;
    currencyCode: string; // e.g., 'USD', 'EUR'
    currentBalance?: number; // In currencyCode, represents amount owed or credit
    projectsLinked: UUID[]; // Project IDs linked to this billing account
    metadata: ResourceMetadata;
    paymentMethods?: { type: 'CREDIT_CARD' | 'BANK_TRANSFER'; lastDigits?: string; }[];
    billingCountryCode?: string;
}

export enum BudgetPeriod {
    DAILY = 'DAILY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    ANNUALLY = 'ANNUALLY',
    CALENDAR_MONTH = 'CALENDAR_MONTH', // Specific to Google Cloud Billing
}

export interface Budget {
    id: UUID;
    name: string;
    projectId: UUID; // Applies to a specific project
    billingAccountId: UUID;
    amount: {
        currencyCode: string;
        units: string; // e.g., "500" for 500 USD, or "1000000000000000000" for 1 unit if units are in atto-units
        nanos?: number; // e.g., 500.00 -> units: "500", nanos: 0, 500.50 -> units: "500", nanos: 500000000
    };
    budgetFilter: {
        projects?: UUID[]; // Filter by specific project IDs
        creditTypes?: ('ALL' | 'MAJOR_DISCOUNTS' | 'FREE_TIER' | 'PROMOTIONS')[];
        services?: string[]; // e.g., ['compute.googleapis.com', 'storage.googleapis.com']
        resourceAncestors?: string[]; // e.g., ['organizations/123', 'folders/456']
        labels?: ResourceLabels; // Filter by resource labels
        creditTypesTreatment: 'INCLUDE_ALL_CREDITS' | 'EXCLUDE_ALL_CREDITS' | 'INCLUDE_SPECIFIED_CREDITS';
    };
    thresholdRules: {
        thresholdPercent: number; // 0.0 - 1.0 (e.g., 0.5 for 50%)
        spendBasis: 'CURRENT_SPEND' | 'FORECASTED_SPEND';
        alertSpendOnlyOwner: boolean; // Only alert billing account owners
        alertPubsubTopicId?: UUID; // Link to MessageQueueTopic for custom notifications
        thresholdType: 'ACTUAL' | 'FORECASTED'; // Type of threshold
    }[];
    allUpdatesRule: {
        pubsubTopicId?: UUID; // Link to MessageQueueTopic for all budget notifications
        monitoringNotificationChannels?: UUID[]; // Link to NotificationChannel (e.g., email, Slack)
        disableDefaultNotifications: boolean;
        schemaVersion?: string; // e.g., '1.0' for Pub/Sub message schema
    };
    metadata: ResourceMetadata;
    displayPeriod: BudgetPeriod;
    lastPeriodAmount?: { currencyCode: string; units: string; nanos?: number; }; // Amount from the previous period
    projectDisplayName?: string;
    effectivePeriodEndDate?: Timestamp; // When the budget period ends
}

// Resource Configuration & Deployment

export interface DeploymentConfiguration {
    id: UUID;
    name: string;
    projectId: UUID;
    templateUri: string; // GCS URI or Git URL to deployment template (e.g., Terraform, Cloud Deployment Manager, Pulumi)
    templateParameters?: { [key: string]: string; };
    lastDeployedTime: Timestamp;
    status: ResourceState;
    deployedResources: ResourceName[]; // List of resource names created by this deployment
    metadata: ResourceMetadata;
    templateVersion?: string; // Version of the template used
    rollbackToDeploymentId?: UUID; // Link to a previous successful deployment for rollback
    previewMode: boolean; // If this configuration is for a dry-run
    targetEnvironment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
}

export interface ManagedServiceConfiguration {
    id: UUID;
    name: string;
    projectId: UUID;
    serviceType: string; // e.g., 'AppEngine', 'CloudRun', 'Dataflow', 'CloudSQL'
    region: string;
    status: ResourceState;
    settings: { [key: string]: any }; // Service-specific settings (e.g., App Engine app.yaml content, Cloud Run service definition)
    metadata: ResourceMetadata;
    version?: string; // Version of the managed service (e.g., App Engine service version)
    trafficSplit?: { [version: string]: number; }; // Traffic splitting for App Engine/Cloud Run
    domainMappings?: { domainName: string; certificateId: UUID; }[]; // Custom domain mappings
}

export interface AssetInventorySnapshot {
    id: UUID;
    name: string;
    projectId: UUID;
    creationTime: Timestamp;
    resourceCount: number;
    policyBindingCount: number;
    bigqueryExportTableId?: UUID; // Link to a BigQuery table containing the snapshot data
    gcsExportBucketId?: UUID; // Link to a StorageBucket containing the snapshot data
    status: ResourceState; // e.g., COMPLETED, FAILED, IN_PROGRESS
    metadata: ResourceMetadata;
}

export interface ComplianceStandard {
    id: UUID;
    name: string;
    description: string;
    version: string;
    controls: {
        id: string;
        description: string;
        securityControls: string[]; // e.g., 'NIST_SP_800_53_AC_2'
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    }[];
    metadata: ResourceMetadata;
}

export interface ComplianceReport {
    id: UUID;
    name: string;
    projectId: UUID;
    standardId: UUID; // Link to ComplianceStandard
    reportTime: Timestamp;
    status: ResourceState; // e.g., PASSED, FAILED, WARNING
    findings: {
        controlId: string; // Link to ComplianceStandard control
        resourceName: ResourceName;
        status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
        details?: string; // Explanation of compliance status
        remediationRecommendation?: string;
    }[];
    metadata: ResourceMetadata;
}

// Utility functions (examples, not full implementation)
export function getResourceFullName(projectId: string, resourceType: string, resourceId: UUID): ResourceName {
    return `projects/${projectId}/${resourceType}/${resourceId}`;
}

export function generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        // eslint-disable-next-line no-bitwise
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Calculates a simplified cost estimate for a VM instance.
 * This is a placeholder for a much more complex billing calculation.
 * @param vm The ExpandedVirtualMachine instance.
 * @returns A string representing the estimated cost per hour.
 */
export function estimateVmCostPerHour(vm: ExpandedVirtualMachine): string {
    if (!vm.machineTypeDetails || !vm.machineTypeDetails.pricePerHourUsd) {
        return 'N/A';
    }
    let cost = vm.machineTypeDetails.pricePerHourUsd;
    if (vm.gpuAccelerators) {
        vm.gpuAccelerators.forEach(gpu => {
            // Placeholder: Assume a fixed cost per GPU
            cost += gpu.count * 0.5; // Example: $0.5/hour per GPU
        });
    }
    // Add more complex logic for storage, network, etc.
    return `$${cost.toFixed(2)}/hr`;
}

// --- EXPANSION END ---