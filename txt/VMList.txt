// google/cloud/components/VMList.tsx
// The Roster of Golems. A ledger of the tireless, virtual machines that form the backbone of the creator's power.
// This file has evolved into the ultimate Virtual Machine Operations Center, a universe unto itself.

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { ComputeAPI } from '../services/ComputeAPI'; // Assume ComputeAPI is vastly expanded
import { VirtualMachine as BaseVirtualMachine } from '../types'; // Rename to avoid conflict with expanded type

// --- UNIVERSAL TYPES & INTERFACES ---

// Expanded VirtualMachine type
export interface VirtualMachine extends BaseVirtualMachine {
    status: 'RUNNING' | 'STOPPED' | 'PROVISIONING' | 'STAGING' | 'SUSPENDED' | 'TERMINATED' | 'MAINTENANCE';
    machineType: string; // e.g., 'e2-standard-4'
    zone: string; // e.g., 'us-central1-a'
    internalIp: string;
    externalIp?: string;
    cpuCores: number;
    memoryGB: number;
    diskSizeGB: number;
    diskType: string; // e.g., 'pd-standard', 'pd-ssd'
    networkTags: string[];
    labels: { [key: string]: string };
    creationTimestamp: string;
    lastUpdatedTimestamp: string;
    bootDisk: {
        deviceName: string;
        diskSizeGb: number;
        diskType: string;
        sourceImage: string;
        autoDelete: boolean;
        encrypted: boolean;
    };
    attachedDisks: Array<{
        deviceName: string;
        diskSizeGb: number;
        diskType: string;
        autoDelete: boolean;
        readWriteIops?: number;
        readWriteThroughput?: number;
    }>;
    networkInterfaces: Array<{
        name: string;
        network: string;
        subnetwork: string;
        networkIp: string;
        accessConfigs: Array<{
            type: 'ONE_TO_ONE_NAT';
            natIP: string;
            setPublicPtr: boolean;
            publicPtrDomainName?: string;
        }>;
        aliasIpRanges: Array<{
            ipCidrRange: string;
            subnetworkRangeName: string;
        }>;
    }>;
    metadata: { [key: string]: string };
    scheduling: {
        preemptible: boolean;
        onHostMaintenance: 'MIGRATE' | 'TERMINATE';
        automaticRestart: boolean;
    };
    serviceAccounts: Array<{
        email: string;
        scopes: string[];
    }>;
    costEstimate: {
        monthlyEstimateUSD: number;
        currency: string;
        components: Array<{
            item: string;
            costUSD: number;
        }>;
    };
    healthChecks: Array<{
        status: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';
        lastChecked: string;
        details?: string;
    }>;
    alerts: VMAlert[];
    securityPosture: {
        score: number; // 0-100
        issues: Array<{ type: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; description: string }>;
        recommendations: string[];
    };
    complianceStatus: {
        iso27001: 'COMPLIANT' | 'NON_COMPLIANT' | 'N_A';
        soc2: 'COMPLIANT' | 'NON_COMPLIANT' | 'N_A';
        gdpr: 'COMPLIANT' | 'NON_COMPLIANT' | 'N_A';
    };
    resourceDependencies: Array<{
        type: 'STORAGE_BUCKET' | 'DATABASE' | 'LOAD_BALANCER' | 'NETWORK';
        id: string;
        name: string;
        status: string;
    }>;
}

export interface VMAlert {
    id: string;
    vmId: string;
    type: 'CRITICAL_CPU' | 'DISK_FULL' | 'NETWORK_ISSUE' | 'HEALTH_CHECK_FAILURE' | 'SECURITY_BREACH' | 'COST_OVERRUN';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    timestamp: string;
    isResolved: boolean;
    resolutionNotes?: string;
}

export interface VMMetric {
    timestamp: string;
    cpuUsage: number; // %
    memoryUsage: number; // %
    diskReadIops: number;
    diskWriteIops: number;
    networkBytesReceived: number;
    networkBytesSent: number;
}

export interface VMActionLog {
    id: string;
    vmId: string;
    action: string; // e.g., 'START', 'STOP', 'RESIZE', 'UPDATE_TAGS'
    initiator: string; // User email or service account
    timestamp: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    details?: string;
}

export interface VMRecommendation {
    id: string;
    vmId: string;
    type: 'RIGHTSIZE' | 'COST_OPTIMIZATION' | 'SECURITY_ENHANCEMENT' | 'PERFORMANCE_IMPROVEMENT';
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedSavingsUSD?: number;
    actionable: boolean;
}

export interface VMTemplate {
    id: string;
    name: string;
    description: string;
    machineType: string;
    sourceImage: string;
    diskSizeGb: number;
    networkTags: string[];
    labels: { [key: string]: string };
    startupScript?: string;
}

export interface ChaosExperiment {
    id: string;
    name: string;
    targetVMs: string[]; // VM IDs
    faultType: 'CPU_SPIKE' | 'NETWORK_LATENCY' | 'DISK_IO_FAILURE' | 'PROCESS_CRASH';
    durationSeconds: number;
    status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    results?: any;
}

// --- EXTENDED COMPUTE API (MOCKED) ---

// This would typically be in '../services/ComputeAPI.ts' but expanded here for illustrative purposes
export class ExtendedComputeAPI extends ComputeAPI {
    static async listVMs(filters?: any): Promise<VirtualMachine[]> {
        // Simulate API call with more complex filtering
        await new Promise(resolve => setTimeout(resolve, 500));
        const allVms: VirtualMachine[] = [
            // Example extended VM data
            {
                id: 'vm-123', name: 'web-server-prod-001', status: 'RUNNING', region: 'us-central1', type: 'e2-standard-4',
                machineType: 'e2-standard-4', zone: 'us-central1-a', internalIp: '10.128.0.2', externalIp: '34.68.100.12',
                cpuCores: 4, memoryGB: 16, diskSizeGB: 100, diskType: 'pd-ssd', networkTags: ['web-server', 'prod'],
                labels: { env: 'prod', app: 'frontend' }, creationTimestamp: '2023-01-15T10:00:00Z', lastUpdatedTimestamp: '2024-04-20T14:30:00Z',
                bootDisk: { deviceName: 'boot', diskSizeGb: 100, diskType: 'pd-ssd', sourceImage: 'debian-cloud/debian-11', autoDelete: true, encrypted: true },
                attachedDisks: [],
                networkInterfaces: [{ name: 'nic0', network: 'projects/proj/global/networks/default', subnetwork: 'projects/proj/regions/us-central1/subnetworks/default', networkIp: '10.128.0.2', accessConfigs: [{ type: 'ONE_TO_ONE_NAT', natIP: '34.68.100.12', setPublicPtr: false }], aliasIpRanges: [] }],
                metadata: { 'startup-script': '#!/bin/bash\\necho Hello World' },
                scheduling: { preemptible: false, onHostMaintenance: 'MIGRATE', automaticRestart: true },
                serviceAccounts: [{ email: 'svc-frontend@proj.iam.gserviceaccount.com', scopes: ['https://www.googleapis.com/auth/cloud-platform'] }],
                costEstimate: { monthlyEstimateUSD: 250.75, currency: 'USD', components: [{ item: 'Compute', costUSD: 180 }, { item: 'Disk', costUSD: 30 }, { item: 'Network', costUSD: 40.75 }] },
                healthChecks: [{ status: 'HEALTHY', lastChecked: '2024-04-20T14:35:00Z' }],
                alerts: [],
                securityPosture: { score: 90, issues: [], recommendations: ['Enable OS patch management'] },
                complianceStatus: { iso27001: 'COMPLIANT', soc2: 'COMPLIANT', gdpr: 'COMPLIANT' },
                resourceDependencies: [{ type: 'LOAD_BALANCER', id: 'lb-1', name: 'web-lb', status: 'HEALTHY' }]
            },
            {
                id: 'vm-456', name: 'db-replica-002', status: 'STOPPED', region: 'us-west1', type: 'n2-standard-8',
                machineType: 'n2-standard-8', zone: 'us-west1-b', internalIp: '10.138.0.3',
                cpuCores: 8, memoryGB: 32, diskSizeGB: 500, diskType: 'pd-ssd', networkTags: ['database', 'replica'],
                labels: { env: 'dev', app: 'database' }, creationTimestamp: '2023-03-01T12:00:00Z', lastUpdatedTimestamp: '2024-04-19T09:00:00Z',
                bootDisk: { deviceName: 'boot', diskSizeGb: 50, diskType: 'pd-standard', sourceImage: 'ubuntu-os-cloud/ubuntu-2004-lts', autoDelete: true, encrypted: true },
                attachedDisks: [{ deviceName: 'data-disk', diskSizeGb: 500, diskType: 'pd-ssd', autoDelete: false, readWriteIops: 1000, readWriteThroughput: 100 }],
                networkInterfaces: [{ name: 'nic0', network: 'projects/proj/global/networks/db-vpc', subnetwork: 'projects/proj/regions/us-west1/subnetworks/db-subnet', networkIp: '10.138.0.3', accessConfigs: [], aliasIpRanges: [] }],
                metadata: {},
                scheduling: { preemptible: false, onHostMaintenance: 'TERMINATE', automaticRestart: true },
                serviceAccounts: [{ email: 'svc-database@proj.iam.gserviceaccount.com', scopes: ['https://www.googleapis.com/auth/cloud-platform'] }],
                costEstimate: { monthlyEstimateUSD: 700.50, currency: 'USD', components: [{ item: 'Compute', costUSD: 550 }, { item: 'Disk', costUSD: 100 }, { item: 'Network', costUSD: 50.50 }] },
                healthChecks: [{ status: 'UNHEALTHY', lastChecked: '2024-04-20T14:35:00Z', details: 'Database service not running' }],
                alerts: [{ id: 'alert-001', vmId: 'vm-456', type: 'HEALTH_CHECK_FAILURE', severity: 'CRITICAL', message: 'DB service down', timestamp: '2024-04-20T14:35:00Z', isResolved: false }],
                securityPosture: { score: 75, issues: [{ type: 'OPEN_PORTS', severity: 'HIGH', description: 'Port 3306 open to public internet' }], recommendations: ['Restrict firewall for 3306'] },
                complianceStatus: { iso27001: 'NON_COMPLIANT', soc2: 'COMPLIANT', gdpr: 'COMPLIANT' },
                resourceDependencies: [{ type: 'DATABASE', id: 'db-main', name: 'main-database', status: 'OPERATIONAL' }]
            },
            {
                id: 'vm-789', name: 'ml-worker-gpu-003', status: 'RUNNING', region: 'europe-west4', type: 'n1-standard-16-gpu',
                machineType: 'n1-standard-16', zone: 'europe-west4-c', internalIp: '10.140.0.4', externalIp: '35.200.50.60',
                cpuCores: 16, memoryGB: 64, diskSizeGB: 200, diskType: 'pd-ssd', networkTags: ['ml', 'gpu'],
                labels: { project: 'ai-research', team: 'data-science' }, creationTimestamp: '2024-02-10T08:00:00Z', lastUpdatedTimestamp: '2024-04-20T13:00:00Z',
                bootDisk: { deviceName: 'boot', diskSizeGb: 100, diskType: 'pd-ssd', sourceImage: 'ml-images/tf-gpu-2-10', autoDelete: true, encrypted: true },
                attachedDisks: [],
                networkInterfaces: [{ name: 'nic0', network: 'projects/proj/global/networks/ml-vpc', subnetwork: 'projects/proj/regions/europe-west4/subnetworks/ml-subnet', networkIp: '10.140.0.4', accessConfigs: [{ type: 'ONE_TO_ONE_NAT', natIP: '35.200.50.60', setPublicPtr: false }], aliasIpRanges: [] }],
                metadata: {},
                scheduling: { preemptible: false, onHostMaintenance: 'TERMINATE', automaticRestart: false },
                serviceAccounts: [{ email: 'svc-ml@proj.iam.gserviceaccount.com', scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/logging.write'] }],
                costEstimate: { monthlyEstimateUSD: 1500.20, currency: 'USD', components: [{ item: 'Compute', costUSD: 1000 }, { item: 'GPU', costUSD: 300 }, { item: 'Disk', costUSD: 100 }, { item: 'Network', costUSD: 100.20 }] },
                healthChecks: [{ status: 'HEALTHY', lastChecked: '2024-04-20T14:35:00Z' }],
                alerts: [],
                securityPosture: { score: 88, issues: [{ type: 'OUTDATED_OS', severity: 'MEDIUM', description: 'OS image is 6 months old' }], recommendations: ['Update OS image'] },
                complianceStatus: { iso27001: 'N_A', soc2: 'N_A', gdpr: 'COMPLIANT' },
                resourceDependencies: []
            },
            {
                id: 'vm-010', name: 'batch-processor-001', status: 'PROVISIONING', region: 'us-east1', type: 'e2-medium',
                machineType: 'e2-medium', zone: 'us-east1-b', internalIp: '10.142.0.5',
                cpuCores: 2, memoryGB: 4, diskSizeGB: 50, diskType: 'pd-standard', networkTags: ['batch'],
                labels: { env: 'staging', owner: 'data-team' }, creationTimestamp: '2024-04-20T14:00:00Z', lastUpdatedTimestamp: '2024-04-20T14:05:00Z',
                bootDisk: { deviceName: 'boot', diskSizeGb: 50, diskType: 'pd-standard', sourceImage: 'centos-cloud/centos-7', autoDelete: true, encrypted: false },
                attachedDisks: [],
                networkInterfaces: [{ name: 'nic0', network: 'projects/proj/global/networks/default', subnetwork: 'projects/proj/regions/us-east1/subnetworks/default', networkIp: '10.142.0.5', accessConfigs: [], aliasIpRanges: [] }],
                metadata: {},
                scheduling: { preemptible: true, onHostMaintenance: 'TERMINATE', automaticRestart: false },
                serviceAccounts: [{ email: 'svc-batch@proj.iam.gserviceaccount.com', scopes: ['https://www.googleapis.com/auth/devstorage.read_only'] }],
                costEstimate: { monthlyEstimateUSD: 35.00, currency: 'USD', components: [{ item: 'Compute', costUSD: 25 }, { item: 'Disk', costUSD: 5 }, { item: 'Network', costUSD: 5 }] },
                healthChecks: [],
                alerts: [],
                securityPosture: { score: 60, issues: [{ type: 'ENCRYPTION_DISABLED', severity: 'MEDIUM', description: 'Boot disk not encrypted' }], recommendations: ['Enable boot disk encryption'] },
                complianceStatus: { iso27001: 'N_A', soc2: 'N_A', gdpr: 'N_A' },
                resourceDependencies: [{ type: 'STORAGE_BUCKET', id: 'batch-data-bucket', name: 'batch-data', status: 'OPERATIONAL' }]
            },
        ];

        let filteredVms = allVms;
        if (filters) {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredVms = filteredVms.filter(vm =>
                    vm.name.toLowerCase().includes(searchLower) ||
                    vm.id.toLowerCase().includes(searchLower) ||
                    vm.internalIp.includes(searchLower) ||
                    (vm.externalIp && vm.externalIp.includes(searchLower)) ||
                    vm.labels && Object.values(vm.labels).some(v => v.toLowerCase().includes(searchLower)) ||
                    vm.networkTags && vm.networkTags.some(tag => tag.toLowerCase().includes(searchLower))
                );
            }
            if (filters.status && filters.status !== 'ALL') {
                filteredVms = filteredVms.filter(vm => vm.status === filters.status);
            }
            if (filters.region && filters.region !== 'ALL') {
                filteredVms = filteredVms.filter(vm => vm.region === filters.region);
            }
            if (filters.type && filters.type !== 'ALL') {
                filteredVms = filteredVms.filter(vm => vm.type === filters.type);
            }
            if (filters.minCpu) {
                filteredVms = filteredVms.filter(vm => vm.cpuCores >= parseInt(filters.minCpu));
            }
            if (filters.minMemory) {
                filteredVms = filteredVms.filter(vm => vm.memoryGB >= parseInt(filters.minMemory));
            }
        }
        return filteredVms;
    }

    static async getVMDetails(vmId: string): Promise<VirtualMachine | null> {
        const vms = await ExtendedComputeAPI.listVMs(); // Get a mock VM
        return vms.find(vm => vm.id === vmId) || null;
    }

    static async startVM(vmId: string): Promise<void> {
        console.log(`Starting VM: ${vmId}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In a real app, update VM status in a backend
    }

    static async stopVM(vmId: string): Promise<void> {
        console.log(`Stopping VM: ${vmId}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In a real app, update VM status in a backend
    }

    static async deleteVM(vmId: string): Promise<void> {
        console.log(`Deleting VM: ${vmId}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // In a real app, remove VM from backend
    }

    static async rebootVM(vmId: string): Promise<void> {
        console.log(`Rebooting VM: ${vmId}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    static async connectToVM(vmId: string, protocol: 'SSH' | 'RDP'): Promise<string> {
        console.log(`Connecting to VM: ${vmId} via ${protocol}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `Connection string/URL for ${protocol} to ${vmId}`;
    }

    static async getVMMetrics(vmId: string, durationHours: number = 24): Promise<VMMetric[]> {
        console.log(`Fetching metrics for VM: ${vmId}`);
        await new Promise(resolve => setTimeout(resolve, 700));
        const metrics: VMMetric[] = [];
        const now = Date.now();
        for (let i = 0; i < 24; i++) {
            metrics.push({
                timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
                cpuUsage: parseFloat((Math.random() * 80 + 10).toFixed(2)),
                memoryUsage: parseFloat((Math.random() * 60 + 20).toFixed(2)),
                diskReadIops: Math.floor(Math.random() * 500 + 50),
                diskWriteIops: Math.floor(Math.random() * 300 + 30),
                networkBytesReceived: Math.floor(Math.random() * 1000000 + 100000),
                networkBytesSent: Math.floor(Math.random() * 800000 + 80000),
            });
        }
        return metrics;
    }

    static async getVMActionLogs(vmId: string): Promise<VMActionLog[]> {
        console.log(`Fetching action logs for VM: ${vmId}`);
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            { id: 'log-001', vmId, action: 'START', initiator: 'user@example.com', timestamp: '2024-04-20T14:00:00Z', status: 'SUCCESS' },
            { id: 'log-002', vmId, action: 'UPDATE_TAGS', initiator: 'service-account@example.com', timestamp: '2024-04-19T10:00:00Z', status: 'SUCCESS', details: 'Added tag "monitoring"' },
            { id: 'log-003', vmId, action: 'STOP', initiator: 'user@example.com', timestamp: '2024-04-18T18:00:00Z', status: 'FAILED', details: 'Instance in use' },
        ];
    }

    static async listVMAlerts(vmId?: string): Promise<VMAlert[]> {
        console.log(`Fetching alerts for ${vmId || 'all'} VMs`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const allAlerts: VMAlert[] = [
            { id: 'alert-001', vmId: 'vm-456', type: 'HEALTH_CHECK_FAILURE', severity: 'CRITICAL', message: 'DB service down on db-replica-002', timestamp: '2024-04-20T14:35:00Z', isResolved: false },
            { id: 'alert-002', vmId: 'vm-123', type: 'CRITICAL_CPU', severity: 'HIGH', message: 'CPU usage over 95% for 15 mins on web-server-prod-001', timestamp: '2024-04-20T13:00:00Z', isResolved: true, resolutionNotes: 'Autoscaling triggered' },
            { id: 'alert-003', vmId: 'vm-789', type: 'DISK_FULL', severity: 'MEDIUM', message: 'Disk usage 90% on ml-worker-gpu-003', timestamp: '2024-04-19T10:00:00Z', isResolved: false },
        ];
        return vmId ? allAlerts.filter(alert => alert.vmId === vmId) : allAlerts;
    }

    static async resolveVMAlert(alertId: string, notes: string): Promise<void> {
        console.log(`Resolving alert ${alertId}: ${notes}`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    static async listVMRecommendations(vmId?: string): Promise<VMRecommendation[]> {
        console.log(`Fetching recommendations for ${vmId || 'all'} VMs`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const allRecommendations: VMRecommendation[] = [
            { id: 'rec-001', vmId: 'vm-123', type: 'RIGHTSIZE', description: 'web-server-prod-001 could use e2-medium (4vCPU, 4GB) for 20% cost savings.', impact: 'HIGH', estimatedSavingsUSD: 50, actionable: true },
            { id: 'rec-002', vmId: 'vm-456', type: 'SECURITY_ENHANCEMENT', description: 'Restrict public access to port 3306 on db-replica-002.', impact: 'CRITICAL', actionable: true },
            { id: 'rec-003', vmId: 'vm-789', type: 'PERFORMANCE_IMPROVEMENT', description: 'Consider upgrading GPU drivers on ml-worker-gpu-003.', impact: 'MEDIUM', actionable: false },
            { id: 'rec-004', vmId: 'vm-010', type: 'COST_OPTIMIZATION', description: 'batch-processor-001: Consider scheduling instance deletion after job completion to save costs.', impact: 'HIGH', estimatedSavingsUSD: 10, actionable: true }
        ];
        return vmId ? allRecommendations.filter(rec => rec.vmId === vmId) : allRecommendations;
    }

    static async applyRecommendation(recommendationId: string): Promise<void> {
        console.log(`Applying recommendation: ${recommendationId}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    static async createVM(config: any): Promise<VirtualMachine> {
        console.log('Creating new VM with config:', config);
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Simulate a new VM creation
        const newVm: VirtualMachine = {
            id: `vm-${Math.random().toString(36).substr(2, 9)}`,
            name: config.name,
            status: 'PROVISIONING',
            region: config.region,
            type: config.machineType,
            machineType: config.machineType,
            zone: `${config.region}-a`, // Simplified
            internalIp: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            cpuCores: config.cpuCores || 2,
            memoryGB: config.memoryGB || 4,
            diskSizeGB: config.bootDiskSizeGb || 50,
            diskType: config.bootDiskType || 'pd-standard',
            networkTags: config.networkTags || [],
            labels: config.labels || {},
            creationTimestamp: new Date().toISOString(),
            lastUpdatedTimestamp: new Date().toISOString(),
            bootDisk: { deviceName: 'boot', diskSizeGb: config.bootDiskSizeGb, diskType: config.bootDiskType, sourceImage: config.sourceImage, autoDelete: true, encrypted: config.encryptedBootDisk },
            attachedDisks: config.attachedDisks || [],
            networkInterfaces: [{
                name: 'nic0',
                network: 'projects/proj/global/networks/default',
                subnetwork: `projects/proj/regions/${config.region}/subnetworks/default`,
                networkIp: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                accessConfigs: config.externalIp ? [{ type: 'ONE_TO_ONE_NAT', natIP: `34.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, setPublicPtr: false }] : [],
                aliasIpRanges: []
            }],
            metadata: config.metadata || {},
            scheduling: config.scheduling || { preemptible: false, onHostMaintenance: 'MIGRATE', automaticRestart: true },
            serviceAccounts: config.serviceAccounts || [],
            costEstimate: { monthlyEstimateUSD: Math.random() * 500, currency: 'USD', components: [] }, // Simplified
            healthChecks: [],
            alerts: [],
            securityPosture: { score: 70, issues: [], recommendations: [] },
            complianceStatus: { iso27001: 'N_A', soc2: 'N_A', gdpr: 'N_A' },
            resourceDependencies: [],
            externalIp: config.externalIp ? `34.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined
        };
        return newVm;
    }

    static async listVMTemplates(): Promise<VMTemplate[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'tpl-web-server', name: 'Web Server Template', description: 'Basic web server with Nginx', machineType: 'e2-small', sourceImage: 'debian-cloud/debian-11', diskSizeGb: 30, networkTags: ['web'], labels: { role: 'web' } },
            { id: 'tpl-db-server', name: 'Database Template', description: 'PostgreSQL database server', machineType: 'n2-standard-4', sourceImage: 'ubuntu-os-cloud/ubuntu-2004-lts', diskSizeGb: 100, networkTags: ['db'], labels: { role: 'db' } },
        ];
    }

    static async scheduleVMAction(vmId: string, action: 'START' | 'STOP' | 'REBOOT', scheduleTime: string): Promise<string> {
        console.log(`Scheduling action ${action} for VM ${vmId} at ${scheduleTime}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        return `Scheduled-Action-${Math.random().toString(36).substr(2, 9)}`;
    }

    static async runChaosExperiment(experiment: ChaosExperiment): Promise<ChaosExperiment> {
        console.log(`Running chaos experiment: ${experiment.name} on VMs: ${experiment.targetVMs.join(', ')}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { ...experiment, status: 'RUNNING', results: { message: 'Experiment initiated.' } };
    }

    static async getComplianceReport(vmId?: string): Promise<any> {
        console.log(`Generating compliance report for ${vmId || 'all'} VMs`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            reportId: `comp-rpt-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            scope: vmId || 'All VMs',
            summary: {
                totalVms: vmId ? 1 : 4,
                compliant: vmId ? 1 : 2,
                nonCompliant: vmId ? 0 : 1, // Example only
                na: vmId ? 0 : 1, // Example only
            },
            details: [
                { vmId: 'vm-123', iso27001: 'COMPLIANT', soc2: 'COMPLIANT', gdpr: 'COMPLIANT', issues: [] },
                { vmId: 'vm-456', iso27001: 'NON_COMPLIANT', soc2: 'COMPLIANT', gdpr: 'COMPLIANT', issues: [{ standard: 'ISO27001', control: 'A.9.2.2', description: 'Weak password policy' }] },
                // ... more detailed compliance items
            ]
        };
    }

    static async listGlobalAlerts(): Promise<VMAlert[]> {
        return ExtendedComputeAPI.listVMAlerts(); // Re-use
    }
}

// --- UTILITY FUNCTIONS ---

export const getStatusColor = (status: VirtualMachine['status']): string => {
    switch (status) {
        case 'RUNNING': return 'text-green-400';
        case 'STOPPED': return 'text-red-400';
        case 'PROVISIONING':
        case 'STAGING': return 'text-blue-400';
        case 'SUSPENDED': return 'text-yellow-400';
        case 'TERMINATED': return 'text-gray-500';
        case 'MAINTENANCE': return 'text-purple-400';
        default: return 'text-gray-400';
    }
};

export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatCost = (cost: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cost);
};

// --- GLOBAL STATE CONTEXT FOR VM OPERATIONS ---
interface VMContextType {
    selectedVM: VirtualMachine | null;
    setSelectedVM: (vm: VirtualMachine | null) => void;
    refreshVMs: () => void;
    performVMAction: (vmId: string, action: string) => Promise<void>;
    isLoadingAction: boolean;
    vms: VirtualMachine[]; // Expose all VMs for components that need them (e.g., ChaosSimulator)
}

const VMContext = createContext<VMContextType | undefined>(undefined);

export const useVMContext = () => {
    const context = useContext(VMContext);
    if (!context) {
        throw new Error('useVMContext must be used within a VMProvider');
    }
    return context;
};

// --- SUB-COMPONENTS: THE UNIVERSE UNFOLDS ---

export const VMCreateWizard: React.FC<{ onClose: () => void; onCreateSuccess: () => void }> = ({ onClose, onCreateSuccess }) => {
    const [name, setName] = useState('');
    const [machineType, setMachineType] = useState('e2-medium');
    const [region, setRegion] = useState('us-central1');
    const [sourceImage, setSourceImage] = useState('debian-cloud/debian-11');
    const [bootDiskSizeGb, setBootDiskSizeGb] = useState(50);
    const [bootDiskType, setBootDiskType] = useState('pd-standard');
    const [externalIp, setExternalIp] = useState(false);
    const [networkTags, setNetworkTags] = useState('');
    const [labels, setLabels] = useState('');
    const [startupScript, setStartupScript] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const config = {
                name, machineType, region, sourceImage, bootDiskSizeGb, bootDiskType, externalIp,
                networkTags: networkTags.split(',').map(tag => tag.trim()).filter(Boolean),
                labels: Object.fromEntries(labels.split(',').map(l => l.trim().split(':')).filter(arr => arr.length === 2)),
                metadata: startupScript ? { 'startup-script': startupScript } : {},
            };
            await ExtendedComputeAPI.createVM(config);
            onCreateSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create VM:', error);
            alert('Failed to create VM.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-semibold mb-6 text-white">Create New Compute Instance</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Name:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Machine Type:</label>
                        <select value={machineType} onChange={(e) => setMachineType(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white">
                            <option value="e2-medium">e2-medium (2vCPU, 4GB)</option>
                            <option value="e2-standard-4">e2-standard-4 (4vCPU, 16GB)</option>
                            <option value="n2-standard-8">n2-standard-8 (8vCPU, 32GB)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Region:</label>
                        <select value={region} onChange={(e) => setRegion(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white">
                            <option value="us-central1">us-central1</option>
                            <option value="us-west1">us-west1</option>
                            <option value="us-east1">us-east1</option>
                            <option value="europe-west4">europe-west4</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Source Image:</label>
                        <input type="text" value={sourceImage} onChange={(e) => setSourceImage(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Boot Disk Size (GB):</label>
                            <input type="number" value={bootDiskSizeGb} onChange={(e) => setBootDiskSizeGb(parseInt(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white" min="10" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Boot Disk Type:</label>
                            <select value={bootDiskType} onChange={(e) => setBootDiskType(e.target.value)}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white">
                                <option value="pd-standard">Standard Persistent Disk</option>
                                <option value="pd-ssd">SSD Persistent Disk</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" checked={externalIp} onChange={(e) => setExternalIp(e.target.checked)}
                            className="mr-2 leading-tight" id="externalIp" />
                        <label htmlFor="externalIp" className="text-gray-300 text-sm">Assign External IP</label>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Network Tags (comma-separated):</label>
                        <input type="text" value={networkTags} onChange={(e) => setNetworkTags(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Labels (key:value, comma-separated):</label>
                        <input type="text" value={labels} onChange={(e) => setLabels(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Startup Script:</label>
                        <textarea value={startupScript} onChange={(e) => setStartupScript(e.target.value)} rows={5}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white font-mono" placeholder="#!/bin/bash&#10;echo Hello World"></textarea>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Cancel
                        </button>
                        <button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            {isCreating ? 'Creating...' : 'Create Instance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const VMFiltersAndSearch: React.FC<{
    filters: any;
    setFilters: (filters: any) => void;
    onSearch: (search: string) => void;
    regions: string[];
    machineTypes: string[];
}> = ({ filters, setFilters, onSearch, regions, machineTypes }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Debounce search input for performance on large datasets
        // This would typically use a custom debounce hook or utility
        // For now, we'll just call onSearch directly for simplicity in this massive file.
        onSearch(e.target.value);
    };

    return (
        <div className="bg-gray-700 p-4 rounded-lg flex flex-wrap gap-4 items-center">
            <input
                type="text"
                placeholder="Search VMs by name, IP, label, tag..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-grow min-w-[200px] bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
                value={filters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="ALL">All Statuses</option>
                <option value="RUNNING">Running</option>
                <option value="STOPPED">Stopped</option>
                <option value="PROVISIONING">Provisioning</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TERMINATED">Terminated</option>
            </select>
            <select
                value={filters.region || 'ALL'}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="ALL">All Regions</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
                value={filters.type || 'ALL'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="ALL">All Types</option>
                {machineTypes.map(mt => <option key={mt} value={mt}>{mt}</option>)}
            </select>
            <input
                type="number"
                placeholder="Min CPU"
                value={filters.minCpu || ''}
                onChange={(e) => handleFilterChange('minCpu', e.target.value)}
                className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
            />
            <input
                type="number"
                placeholder="Min Memory (GB)"
                value={filters.minMemory || ''}
                onChange={(e) => handleFilterChange('minMemory', e.target.value)}
                className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            />
            <button
                onClick={() => {
                    setFilters({}); // Reset all filters
                    setSearchTerm('');
                    onSearch('');
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Reset Filters
            </button>
        </div>
    );
};

export const VMActionsPanel: React.FC<{ selectedVMs: VirtualMachine[]; onCreateNewVM: () => void }> = ({ selectedVMs, onCreateNewVM }) => {
    const { performVMAction, isLoadingAction, refreshVMs } = useVMContext();
    const canStart = selectedVMs.some(vm => vm.status === 'STOPPED' || vm.status === 'SUSPENDED' || vm.status === 'TERMINATED');
    const canStop = selectedVMs.some(vm => vm.status === 'RUNNING');
    const canReboot = selectedVMs.some(vm => vm.status === 'RUNNING');
    const canDelete = selectedVMs.length > 0;

    const handleAction = async (action: string) => {
        if (!confirm(`Are you sure you want to ${action} ${selectedVMs.length} VM(s)?`)) return;
        for (const vm of selectedVMs) {
            await performVMAction(vm.id, action);
        }
        alert(`${action} action completed for selected VMs.`);
        refreshVMs();
    };

    return (
        <div className="bg-gray-700 p-4 rounded-lg flex gap-3 items-center">
            <span className="text-gray-300">Selected ({selectedVMs.length}):</span>
            <button onClick={() => handleAction('START')} disabled={!canStart || isLoadingAction}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoadingAction ? 'Processing...' : 'Start'}
            </button>
            <button onClick={() => handleAction('STOP')} disabled={!canStop || isLoadingAction}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoadingAction ? 'Processing...' : 'Stop'}
            </button>
            <button onClick={() => handleAction('REBOOT')} disabled={!canReboot || isLoadingAction}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoadingAction ? 'Processing...' : 'Reboot'}
            </button>
            <button onClick={() => handleAction('DELETE')} disabled={!canDelete || isLoadingAction}
                className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoadingAction ? 'Processing...' : 'Delete'}
            </button>
            <div className="flex-grow"></div>
            <button onClick={onCreateNewVM}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create New VM
            </button>
        </div>
    );
};

export const VMTable: React.FC<{
    vms: VirtualMachine[];
    onSelectVM: (vm: VirtualMachine | null) => void;
    selectedVMs: VirtualMachine[];
    toggleVMSelection: (vm: VirtualMachine) => void;
    toggleAllVMsSelection: (select: boolean) => void;
    isLoading: boolean;
    sortConfig: { key: keyof VirtualMachine; direction: 'ascending' | 'descending' } | null;
    requestSort: (key: keyof VirtualMachine) => void;
}> = ({ vms, onSelectVM, selectedVMs, toggleVMSelection, toggleAllVMsSelection, isLoading, sortConfig, requestSort }) => {

    const sortedVms = useMemo(() => {
        let sortableItems = [...vms];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending'
                        ? aValue - bValue
                        : bValue - aValue;
                }
                // Special handling for nested objects like costEstimate
                if (sortConfig.key === 'costEstimate' && typeof a.costEstimate === 'object' && typeof b.costEstimate === 'object') {
                    return sortConfig.direction === 'ascending'
                        ? a.costEstimate.monthlyEstimateUSD - b.costEstimate.monthlyEstimateUSD
                        : b.costEstimate.monthlyEstimateUSD - a.costEstimate.monthlyEstimateUSD;
                }
                return 0; // Fallback for other types
            });
        }
        return sortableItems;
    }, [vms, sortConfig]);

    const isAllSelected = vms.length > 0 && selectedVMs.length === vms.length;

    const getSortIndicator = (key: keyof VirtualMachine) => {
        if (!sortConfig || sortConfig.key !== key) return '';
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    if (isLoading) {
        return <div className="text-center py-8 text-gray-300">Loading Compute Instances...</div>;
    }

    if (vms.length === 0) {
        return <div className="text-center py-8 text-gray-300">No compute instances found matching your criteria.</div>;
    }

    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                    <tr>
                        <th scope="col" className="p-4">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                checked={isAllSelected}
                                onChange={(e) => toggleAllVMsSelection(e.target.checked)}
                                disabled={vms.length === 0}
                            />
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => requestSort('name')}>
                            Name {getSortIndicator('name')}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => requestSort('status')}>
                            Status {getSortIndicator('status')}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => requestSort('region')}>
                            Region {getSortIndicator('region')}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => requestSort('type')}>
                            Type {getSortIndicator('type')}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => requestSort('cpuCores')}>
                            CPU {getSortIndicator('cpuCores')}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => requestSort('memoryGB')}>
                            Memory (GB) {getSortIndicator('memoryGB')}
                        </th>
                        <th scope="col" className="py-3 px-6">Internal IP</th>
                        <th scope="col" className="py-3 px-6">External IP</th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => requestSort('costEstimate')}>
                            Monthly Cost {getSortIndicator('costEstimate')}
                        </th>
                        <th scope="col" className="py-3 px-6">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedVms.map(vm => (
                        <tr key={vm.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                            <td className="w-4 p-4">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    checked={selectedVMs.some(s => s.id === vm.id)}
                                    onChange={() => toggleVMSelection(vm)}
                                />
                            </td>
                            <td className="py-2 px-6 font-medium text-white whitespace-nowrap cursor-pointer hover:underline" onClick={() => onSelectVM(vm)}>
                                {vm.name}
                            </td>
                            <td className={`py-2 px-6 ${getStatusColor(vm.status)}`}>{vm.status}</td>
                            <td className="py-2 px-6">{vm.region}</td>
                            <td className="py-2 px-6">{vm.machineType}</td>
                            <td className="py-2 px-6">{vm.cpuCores}</td>
                            <td className="py-2 px-6">{vm.memoryGB}</td>
                            <td className="py-2 px-6">{vm.internalIp}</td>
                            <td className="py-2 px-6">{vm.externalIp || 'N/A'}</td>
                            <td className="py-2 px-6">{formatCost(vm.costEstimate.monthlyEstimateUSD)}</td>
                            <td className="py-2 px-6">
                                <button onClick={() => onSelectVM(vm)} className="font-medium text-blue-500 hover:underline mr-2">Details</button>
                                <button className="font-medium text-green-500 hover:underline">SSH</button> {/* Placeholder, would open new window/modal */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export const VMDetailPanel: React.FC<{ vm: VirtualMachine; onClose: () => void }> = ({ vm, onClose }) => {
    const { performVMAction, isLoadingAction, refreshVMs } = useVMContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'network' | 'storage' | 'security' | 'cost' | 'logs' | 'recommendations' | 'compliance'>('overview');
    const [metrics, setMetrics] = useState<VMMetric[]>([]);
    const [actionLogs, setActionLogs] = useState<VMActionLog[]>([]);
    const [recommendations, setRecommendations] = useState<VMRecommendation[]>([]);
    const [isMetricsLoading, setIsMetricsLoading] = useState(false);
    const [isLogsLoading, setIsLogsLoading] = useState(false);
    const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (activeTab === 'metrics') {
                setIsMetricsLoading(true);
                const fetchedMetrics = await ExtendedComputeAPI.getVMMetrics(vm.id);
                setMetrics(fetchedMetrics);
                setIsMetricsLoading(false);
            } else if (activeTab === 'logs') {
                setIsLogsLoading(true);
                const fetchedLogs = await ExtendedComputeAPI.getVMActionLogs(vm.id);
                setActionLogs(fetchedLogs);
                setIsLogsLoading(false);
            } else if (activeTab === 'recommendations') {
                setIsRecommendationsLoading(true);
                const fetchedRecommendations = await ExtendedComputeAPI.listVMRecommendations(vm.id);
                setRecommendations(fetchedRecommendations);
                setIsRecommendationsLoading(false);
            }
        };
        fetchData();
    }, [vm.id, activeTab]);

    const handleVMAction = async (action: string) => {
        if (!confirm(`Are you sure you want to ${action} VM ${vm.name}?`)) return;
        await performVMAction(vm.id, action);
        alert(`${action} action completed for ${vm.name}.`);
        refreshVMs();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">
                    &times;
                </button>
                <h3 className="text-3xl font-semibold mb-6 text-white">{vm.name} <span className={`text-xl ml-2 ${getStatusColor(vm.status)}`}>({vm.status})</span></h3>

                <div className="flex space-x-2 border-b border-gray-700 mb-4">
                    {['overview', 'metrics', 'network', 'storage', 'security', 'cost', 'logs', 'recommendations', 'compliance'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-2 px-4 text-sm font-medium ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="detail-content text-gray-300">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><strong>ID:</strong> {vm.id}</div>
                            <div><strong>Machine Type:</strong> {vm.machineType}</div>
                            <div><strong>Region/Zone:</strong> {vm.region}/{vm.zone}</div>
                            <div><strong>CPU Cores:</strong> {vm.cpuCores}</div>
                            <div><strong>Memory (GB):</strong> {vm.memoryGB}</div>
                            <div><strong>Creation Time:</strong> {new Date(vm.creationTimestamp).toLocaleString()}</div>
                            <div><strong>Last Updated:</strong> {new Date(vm.lastUpdatedTimestamp).toLocaleString()}</div>
                            <div><strong>Internal IP:</strong> {vm.internalIp}</div>
                            <div><strong>External IP:</strong> {vm.externalIp || 'N/A'}</div>
                            <div><strong>Network Tags:</strong> {vm.networkTags.join(', ') || 'None'}</div>
                            <div><strong>Labels:</strong> {Object.entries(vm.labels).map(([k, v]) => `${k}:${v}`).join(', ') || 'None'}</div>
                            <div><strong>Preemptible:</strong> {vm.scheduling.preemptible ? 'Yes' : 'No'}</div>
                            <div><strong>Automatic Restart:</strong> {vm.scheduling.automaticRestart ? 'Yes' : 'No'}</div>
                            <div className="col-span-2">
                                <strong>Health Checks:</strong> {vm.healthChecks.length > 0 ? vm.healthChecks.map((hc, idx) => (
                                    <span key={idx} className={`ml-2 ${hc.status === 'HEALTHY' ? 'text-green-400' : 'text-red-400'}`}>
                                        {hc.status} ({hc.details || 'OK'})
                                    </span>
                                )) : 'None configured'}
                            </div>
                        </div>
                    )}
                    {activeTab === 'metrics' && (
                        <div className="h-64 bg-gray-900 rounded-lg p-4 flex items-center justify-center text-gray-500">
                            {isMetricsLoading ? 'Loading metrics...' : (metrics.length > 0 ? '📊 Chart Placeholder: CPU, Memory, Disk I/O, Network Data' : 'No metrics available yet.')}
                            {/* In a real app, integrate a charting library like Chart.js or Recharts */}
                        </div>
                    )}
                    {activeTab === 'network' && (
                        <div>
                            <h4 className="text-xl font-semibold mb-2">Network Interfaces</h4>
                            {vm.networkInterfaces.map((nic, idx) => (
                                <div key={idx} className="mb-4 p-3 bg-gray-700 rounded-md">
                                    <p><strong>Name:</strong> {nic.name}</p>
                                    <p><strong>Network IP:</strong> {nic.networkIp}</p>
                                    <p><strong>Network:</strong> {nic.network.split('/').pop()}</p>
                                    <p><strong>Subnetwork:</strong> {nic.subnetwork.split('/').pop()}</p>
                                    {nic.accessConfigs.length > 0 && <p><strong>External IP:</strong> {nic.accessConfigs[0].natIP}</p>}
                                </div>
                            ))}
                            <h4 className="text-xl font-semibold mb-2 mt-4">Network Tags</h4>
                            <p>{vm.networkTags.join(', ') || 'No network tags'}</p>
                        </div>
                    )}
                    {activeTab === 'storage' && (
                        <div>
                            <h4 className="text-xl font-semibold mb-2">Boot Disk</h4>
                            <div className="mb-4 p-3 bg-gray-700 rounded-md">
                                <p><strong>Device:</strong> {vm.bootDisk.deviceName}</p>
                                <p><strong>Size:</strong> {vm.bootDisk.diskSizeGb} GB</p>
                                <p><strong>Type:</strong> {vm.bootDisk.diskType}</p>
                                <p><strong>Image:</strong> {vm.bootDisk.sourceImage.split('/').pop()}</p>
                                <p><strong>Encrypted:</strong> {vm.bootDisk.encrypted ? 'Yes' : 'No'}</p>
                            </div>
                            <h4 className="text-xl font-semibold mb-2 mt-4">Attached Disks</h4>
                            {vm.attachedDisks.length > 0 ? vm.attachedDisks.map((disk, idx) => (
                                <div key={idx} className="mb-4 p-3 bg-gray-700 rounded-md">
                                    <p><strong>Device:</strong> {disk.deviceName}</p>
                                    <p><strong>Size:</strong> {disk.diskSizeGb} GB</p>
                                    <p><strong>Type:</strong> {disk.diskType}</p>
                                    {disk.readWriteIops && <p><strong>Read/Write IOPS:</strong> {disk.readWriteIops}/{disk.readWriteThroughput} MB/s</p>}
                                </div>
                            )) : <p>No additional attached disks.</p>}
                        </div>
                    )}
                    {activeTab === 'security' && (
                        <div>
                            <h4 className="text-xl font-semibold mb-2">Security Posture (Score: {vm.securityPosture.score}/100)</h4>
                            {vm.securityPosture.issues.length > 0 ? (
                                vm.securityPosture.issues.map((issue, idx) => (
                                    <div key={idx} className="mb-2 p-3 bg-red-800 bg-opacity-30 border border-red-700 rounded-md">
                                        <p className="font-semibold text-red-300">Severity: {issue.severity} - {issue.type}</p>
                                        <p>{issue.description}</p>
                                    </div>
                                ))
                            ) : (<p className="text-green-400">No critical security issues detected.</p>)}
                            <h4 className="text-xl font-semibold mb-2 mt-4">Security Recommendations</h4>
                            {vm.securityPosture.recommendations.length > 0 ? (
                                <ul>
                                    {vm.securityPosture.recommendations.map((rec, idx) => (
                                        <li key={idx} className="list-disc ml-5">{rec}</li>
                                    ))}
                                </ul>
                            ) : (<p>No specific security recommendations at this time.</p>)}

                            <h4 className="text-xl font-semibold mb-2 mt-4">Service Accounts</h4>
                            {vm.serviceAccounts.length > 0 ? (
                                vm.serviceAccounts.map((sa, idx) => (
                                    <div key={idx} className="mb-2 p-3 bg-gray-700 rounded-md">
                                        <p><strong>Email:</strong> {sa.email}</p>
                                        <p><strong>Scopes:</strong> {sa.scopes.join(', ') || 'None'}</p>
                                    </div>
                                ))
                            ) : (<p>No service accounts attached.</p>)}
                        </div>
                    )}
                    {activeTab === 'cost' && (
                        <div>
                            <h4 className="text-xl font-semibold mb-2">Estimated Monthly Cost: {formatCost(vm.costEstimate.monthlyEstimateUSD, vm.costEstimate.currency)}</h4>
                            <ul className="list-disc ml-5">
                                {vm.costEstimate.components.map((comp, idx) => (
                                    <li key={idx}>{comp.item}: {formatCost(comp.costUSD, vm.costEstimate.currency)}</li>
                                ))}
                            </ul>
                            <p className="mt-4 text-sm text-gray-400">
                                This is an estimated cost and may vary based on actual usage and pricing changes.
                                Consider recommendations for potential savings.
                            </p>
                            <h4 className="text-xl font-semibold mb-2 mt-4">Cost Trend:</h4>
                            <div className="h-48 bg-gray-900 rounded-lg p-4 flex items-center justify-center text-gray-500">
                                {/* Chart Placeholder for Cost Trend */}
                                📊 Cost Trend Chart Here
                            </div>
                        </div>
                    )}
                    {activeTab === 'logs' && (
                        <div>
                            <h4 className="text-xl font-semibold mb-2">Recent Actions</h4>
                            {isLogsLoading ? <p>Loading logs...</p> : (
                                actionLogs.length > 0 ? (
                                    <ul className="space-y-2">
                                        {actionLogs.map(log => (
                                            <li key={log.id} className="p-3 bg-gray-700 rounded-md">
                                                <p><strong className="text-blue-300">{log.action}</strong> by {log.initiator} at {new Date(log.timestamp).toLocaleString()} - <span className={log.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>{log.status}</span></p>
                                                {log.details && <p className="text-sm text-gray-400 mt-1">Details: {log.details}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (<p>No recent action logs.</p>)
                            )}
                        </div>
                    )}
                    {activeTab === 'recommendations' && (
                        <div>
                            <h4 className="text-xl font-semibold mb-2">Recommendations for {vm.name}</h4>
                            {isRecommendationsLoading ? <p>Loading recommendations...</p> : (
                                recommendations.length > 0 ? (
                                    <ul className="space-y-3">
                                        {recommendations.map(rec => (
                                            <li key={rec.id} className="p-4 bg-gray-700 rounded-md border-l-4 border-blue-500">
                                                <p className="font-semibold text-white">{rec.description}</p>
                                                <p className="text-sm text-gray-400">Type: {rec.type} | Impact: {rec.impact}</p>
                                                {rec.estimatedSavingsUSD && <p className="text-sm text-green-400">Estimated Monthly Savings: {formatCost(rec.estimatedSavingsUSD)}</p>}
                                                {rec.actionable && (
                                                    <button onClick={() => ExtendedComputeAPI.applyRecommendation(rec.id).then(() => { alert('Recommendation applied!'); refreshVMs(); })}
                                                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded">
                                                        Apply Recommendation
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (<p>No specific recommendations for this VM at the moment.</p>)
                            )}
                        </div>
                    )}
                    {activeTab === 'compliance' && (
                        <div>
                            <h4 className="text-xl font-semibold mb-2">Compliance Status</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-700 rounded-md">
                                    <p className="font-semibold">ISO 27001</p>
                                    <p className={vm.complianceStatus.iso27001 === 'COMPLIANT' ? 'text-green-400' : vm.complianceStatus.iso27001 === 'NON_COMPLIANT' ? 'text-red-400' : 'text-gray-400'}>
                                        {vm.complianceStatus.iso27001}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700 rounded-md">
                                    <p className="font-semibold">SOC 2</p>
                                    <p className={vm.complianceStatus.soc2 === 'COMPLIANT' ? 'text-green-400' : vm.complianceStatus.soc2 === 'NON_COMPLIANT' ? 'text-red-400' : 'text-gray-400'}>
                                        {vm.complianceStatus.soc2}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700 rounded-md">
                                    <p className="font-semibold">GDPR</p>
                                    <p className={vm.complianceStatus.gdpr === 'COMPLIANT' ? 'text-green-400' : vm.complianceStatus.gdpr === 'NON_COMPLIANT' ? 'text-red-400' : 'text-gray-400'}>
                                        {vm.complianceStatus.gdpr}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-gray-400">
                                Detailed compliance reports can be generated via the Global Compliance Auditor.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => handleVMAction('START')} disabled={vm.status === 'RUNNING' || isLoadingAction}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        Start
                    </button>
                    <button onClick={() => handleVMAction('STOP')} disabled={vm.status !== 'RUNNING' || isLoadingAction}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        Stop
                    </button>
                    <button onClick={() => handleVMAction('REBOOT')} disabled={vm.status !== 'RUNNING' || isLoadingAction}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        Reboot
                    </button>
                    <button onClick={() => ExtendedComputeAPI.connectToVM(vm.id, 'SSH').then(alert)} disabled={vm.status !== 'RUNNING'}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        SSH
                    </button>
                    <button onClick={() => handleVMAction('DELETE')} disabled={isLoadingAction}
                        className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export const VMGlobalDashboardSummary: React.FC<{ vms: VirtualMachine[]; allAlerts: VMAlert[]; allRecommendations: VMRecommendation[] }> = ({ vms, allAlerts, allRecommendations }) => {
    const totalVms = vms.length;
    const runningVms = vms.filter(vm => vm.status === 'RUNNING').length;
    const stoppedVms = vms.filter(vm => vm.status === 'STOPPED').length;
    const criticalAlerts = allAlerts.filter(alert => alert.severity === 'CRITICAL' && !alert.isResolved).length;
    const highRecommendations = allRecommendations.filter(rec => rec.impact === 'HIGH' && rec.actionable).length;

    const totalEstimatedMonthlyCost = vms.reduce((sum, vm) => sum + vm.costEstimate.monthlyEstimateUSD, 0);

    return (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-gray-700 p-4 rounded-md text-center">
                <h4 className="text-sm text-gray-400 mb-1">Total VMs</h4>
                <p className="text-3xl font-bold text-white">{totalVms}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md text-center">
                <h4 className="text-sm text-gray-400 mb-1">Running VMs</h4>
                <p className="text-3xl font-bold text-green-400">{runningVms}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md text-center">
                <h4 className="text-sm text-gray-400 mb-1">Stopped VMs</h4>
                <p className="text-3xl font-bold text-red-400">{stoppedVms}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md text-center">
                <h4 className="text-sm text-gray-400 mb-1">Critical Alerts</h4>
                <p className="text-3xl font-bold text-orange-400">{criticalAlerts}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md text-center">
                <h4 className="text-sm text-gray-400 mb-1">Estimated Monthly Cost</h4>
                <p className="text-3xl font-bold text-blue-400">{formatCost(totalEstimatedMonthlyCost)}</p>
            </div>
        </div>
    );
};

export const VMAlertsCenter: React.FC<{ allAlerts: VMAlert[]; refreshAlerts: () => void }> = ({ allAlerts, refreshAlerts }) => {
    const [isResolving, setIsResolving] = useState(false);

    const handleResolve = async (alertId: string) => {
        if (!confirm('Are you sure you want to mark this alert as resolved?')) return;
        setIsResolving(true);
        try {
            await ExtendedComputeAPI.resolveVMAlert(alertId, 'Resolved from dashboard.');
            alert('Alert resolved!');
            refreshAlerts();
        } catch (error) {
            console.error('Failed to resolve alert:', error);
            alert('Failed to resolve alert.');
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Global Alerts ({allAlerts.filter(a => !a.isResolved).length} Unresolved)</h3>
            {allAlerts.length === 0 ? (
                <p className="text-gray-400">No active alerts at this time. All systems nominal.</p>
            ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                    {allAlerts.map(alert => (
                        <div key={alert.id} className={`p-4 rounded-md ${alert.isResolved ? 'bg-gray-700 border-l-4 border-gray-500' : alert.severity === 'CRITICAL' ? 'bg-red-900 bg-opacity-30 border-l-4 border-red-500' : 'bg-orange-900 bg-opacity-30 border-l-4 border-orange-500'}`}>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-white">
                                    <span className={`mr-2 ${alert.isResolved ? 'text-gray-400' : alert.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`}>
                                        [{alert.severity}]
                                    </span>
                                    {alert.message}
                                </p>
                                {!alert.isResolved && (
                                    <button
                                        onClick={() => handleResolve(alert.id)}
                                        disabled={isResolving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Resolve
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                                VM: {alert.vmId} | Type: {alert.type} | Time: {new Date(alert.timestamp).toLocaleString()}
                            </p>
                            {alert.isResolved && alert.resolutionNotes && <p className="text-sm text-gray-500 mt-1">Resolved: {alert.resolutionNotes}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const VMRecommendationsEngine: React.FC<{ allRecommendations: VMRecommendation[]; refreshRecommendations: () => void }> = ({ allRecommendations, refreshRecommendations }) => {
    const actionableRecommendations = allRecommendations.filter(rec => rec.actionable);

    const handleApply = async (id: string) => {
        if (!confirm('Are you sure you want to apply this recommendation?')) return;
        try {
            await ExtendedComputeAPI.applyRecommendation(id);
            alert('Recommendation applied!');
            refreshRecommendations();
        } catch (error) {
            console.error('Failed to apply recommendation:', error);
            alert('Failed to apply recommendation.');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">AI-Driven Recommendations ({actionableRecommendations.length} Actionable)</h3>
            {actionableRecommendations.length === 0 ? (
                <p className="text-gray-400">No actionable recommendations at this time. Great job!</p>
            ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                    {actionableRecommendations.map(rec => (
                        <div key={rec.id} className={`p-4 rounded-md border-l-4 ${rec.impact === 'HIGH' ? 'border-orange-500 bg-orange-900 bg-opacity-30' : rec.impact === 'CRITICAL' ? 'border-red-500 bg-red-900 bg-opacity-30' : 'border-blue-500 bg-blue-900 bg-opacity-30'}`}>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-white">
                                    <span className="mr-2 text-gray-400">[{rec.impact}]</span>
                                    {rec.description}
                                </p>
                                <button
                                    onClick={() => handleApply(rec.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded"
                                >
                                    Apply
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                                VM: {rec.vmId} | Type: {rec.type} {rec.estimatedSavingsUSD && `| Savings: ${formatCost(rec.estimatedSavingsUSD)}/month`}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const VMResourceMap: React.FC<{ vms: VirtualMachine[] }> = ({ vms }) => {
    // This component would ideally integrate with a mapping library (e.g., Google Maps API, Leaflet.js)
    // to display VMs geographically by region/zone, and potentially draw network connections.
    const regions = useMemo(() => {
        const counts: { [key: string]: number } = {};
        vms.forEach(vm => {
            counts[vm.region] = (counts[vm.region] || 0) + 1;
        });
        return Object.entries(counts).sort(([, countA], [, countB]) => countB - countA);
    }, [vms]);

    return (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Global Resource Map & Distribution</h3>
            <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center text-gray-500 relative">
                <p>🗺️ Interactive Geographical Map Placeholder</p>
                <div className="absolute bottom-4 left-4 text-sm text-gray-400">
                    <p>VMs by Region:</p>
                    {regions.map(([region, count]) => (
                        <p key={region} className="ml-2">{region}: {count} VMs</p>
                    ))}
                </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
                Visualize instance distribution, network latency hotspots, and resource dependencies across regions and zones.
            </p>
        </div>
    );
};

export const VMComplianceAuditor: React.FC<{ vms: VirtualMachine[] }> = ({ vms }) => {
    const [complianceReport, setComplianceReport] = useState<any>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    const generateReport = async () => {
        setIsLoadingReport(true);
        try {
            const report = await ExtendedComputeAPI.getComplianceReport();
            setComplianceReport(report);
        } catch (error) {
            console.error("Error generating compliance report:", error);
            alert("Failed to generate compliance report.");
        } finally {
            setIsLoadingReport(false);
        }
    };

    const compliantVms = complianceReport?.details.filter((d: any) => d.iso27001 === 'COMPLIANT' && d.soc2 === 'COMPLIANT' && d.gdpr === 'COMPLIANT').length || 0;
    const nonCompliantVms = complianceReport?.details.filter((d: any) => d.iso27001 === 'NON_COMPLIANT' || d.soc2 === 'NON_COMPLIANT' || d.gdpr === 'NON_COMPLIANT').length || 0;

    return (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Global Compliance Auditor</h3>
            <button
                onClick={generateReport}
                disabled={isLoadingReport}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoadingReport ? 'Generating Report...' : 'Generate Compliance Report'}
            </button>

            {complianceReport && (
                <div className="mt-4 p-4 bg-gray-700 rounded-md">
                    <p className="text-gray-300 mb-2">Report generated: {new Date(complianceReport.timestamp).toLocaleString()}</p>
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Total VMs</p>
                            <p className="text-2xl font-bold text-white">{complianceReport.summary.totalVms}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Compliant VMs</p>
                            <p className="text-2xl font-bold text-green-400">{compliantVms}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Non-Compliant VMs</p>
                            <p className="text-2xl font-bold text-red-400">{nonCompliantVms}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">N/A VMs</p>
                            <p className="text-2xl font-bold text-gray-400">{complianceReport.summary.na}</p>
                        </div>
                    </div>
                    <h4 className="text-lg font-semibold mb-2 text-white">Non-Compliant Details:</h4>
                    {complianceReport.details.filter((d: any) => d.iso27001 === 'NON_COMPLIANT' || d.soc2 === 'NON_COMPLIANT' || d.gdpr === 'NON_COMPLIANT').length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {complianceReport.details.filter((d: any) => d.iso27001 === 'NON_COMPLIANT' || d.soc2 === 'NON_COMPLIANT' || d.gdpr === 'NON_COMPLIANT').map((detail: any) => (
                                <div key={detail.vmId} className="p-3 bg-gray-800 rounded-md border-l-4 border-red-500">
                                    <p className="font-semibold text-red-300">VM: {detail.vmId}</p>
                                    {detail.issues.map((issue: any, i: number) => (
                                        <p key={i} className="text-sm text-gray-400 ml-2">{issue.standard}: {issue.description}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (<p className="text-green-400">All scanned VMs are compliant!</p>)}
                </div>
            )}
            <p className="text-sm text-gray-400 mt-3">
                Ensure your virtual infrastructure adheres to regulatory standards and internal policies.
            </p>
        </div>
    );
};

export const VMChaosSimulator: React.FC = () => {
    const [experiments, setExperiments] = useState<ChaosExperiment[]>([]);
    const [newExperimentName, setNewExperimentName] = useState('');
    const [selectedVmForChaos, setSelectedVmForChaos] = useState<string[]>([]); // This would interact with a VM picker
    const [faultType, setFaultType] = useState<ChaosExperiment['faultType']>('CPU_SPIKE');
    const [duration, setDuration] = useState(60);
    const [isScheduling, setIsScheduling] = useState(false);
    const { vms } = useVMContext(); // Assuming VMContext is updated to expose all VMs

    const handleRunExperiment = async () => {
        if (!newExperimentName || selectedVmForChaos.length === 0) {
            alert('Please provide an experiment name and select at least one VM.');
            return;
        }
        setIsScheduling(true);
        try {
            const newExp: ChaosExperiment = {
                id: `chaos-${Math.random().toString(36).substr(2, 9)}`,
                name: newExperimentName,
                targetVMs: selectedVmForChaos,
                faultType: faultType,
                durationSeconds: duration,
                status: 'SCHEDULED',
            };
            const result = await ExtendedComputeAPI.runChaosExperiment(newExp);
            setExperiments(prev => [...prev, result]);
            setNewExperimentName('');
            setSelectedVmForChaos([]);
            alert('Chaos experiment scheduled successfully!');
        } catch (error) {
            console.error('Failed to schedule chaos experiment:', error);
            alert('Failed to schedule chaos experiment.');
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Chaos Engineering Simulator</h3>
            <p className="text-gray-400 mb-4">
                Test your system's resilience by intentionally injecting faults into your virtual machines.
            </p>
            <div className="mb-4 p-4 bg-gray-700 rounded-md">
                <h4 className="text-lg font-semibold mb-2 text-white">Schedule New Experiment</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-1">Experiment Name:</label>
                        <input type="text" value={newExperimentName} onChange={(e) => setNewExperimentName(e.target.value)}
                            className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white placeholder-gray-400 w-full"
                            placeholder="e.g., 'CPU Spike Test Prod Frontend'" />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-1">Target VMs:</label>
                        {/* This would be a multi-select dropdown for VMs */}
                        <select multiple value={selectedVmForChaos} onChange={(e) => setSelectedVmForChaos(Array.from(e.target.selectedOptions, option => option.value))}
                            className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white placeholder-gray-400 w-full h-24 overflow-y-auto">
                            {vms.map(vm => <option key={vm.id} value={vm.id}>{vm.name} ({vm.id})</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-gray-300 text-sm font-bold mb-1">Fault Type:</label>
                            <select value={faultType} onChange={(e) => setFaultType(e.target.value as ChaosExperiment['faultType'])}
                                className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white w-full">
                                <option value="CPU_SPIKE">CPU Spike</option>
                                <option value="NETWORK_LATENCY">Network Latency</option>
                                <option value="DISK_IO_FAILURE">Disk I/O Failure</option>
                                <option value="PROCESS_CRASH">Process Crash</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-gray-300 text-sm font-bold mb-1">Duration (seconds):</label>
                            <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white w-full" min="10" max="3600" />
                        </div>
                    </div>
                    <button onClick={handleRunExperiment} disabled={isScheduling}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed">
                        {isScheduling ? 'Scheduling...' : 'Run Experiment'}
                    </button>
                </div>
            </div>

            <h4 className="text-lg font-semibold mt-6 mb-2 text-white">Active & Recent Experiments</h4>
            {experiments.length === 0 ? (
                <p className="text-gray-400">No chaos experiments have been run yet.</p>
            ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                    {experiments.map(exp => (
                        <div key={exp.id} className={`p-3 rounded-md border-l-4 ${exp.status === 'RUNNING' ? 'border-orange-500 bg-orange-900 bg-opacity-30' : exp.status === 'COMPLETED' ? 'border-green-500 bg-green-900 bg-opacity-30' : 'border-gray-500 bg-gray-700'}`}>
                            <p className="font-semibold text-white">{exp.name} - <span className={getStatusColor(exp.status as any)}>{exp.status}</span></p>
                            <p className="text-sm text-gray-400">Fault: {exp.faultType} | Targets: {exp.targetVMs.length} VMs | Duration: {exp.durationSeconds}s</p>
                            {exp.results && <p className="text-xs text-gray-500">Results: {JSON.stringify(exp.results)}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- MAIN VM OPERATIONS CENTER COMPONENT ---

export const VMList: React.FC = () => {
    const [allVms, setAllVms] = useState<VirtualMachine[]>([]);
    const [displayedVms, setDisplayedVms] = useState<VirtualMachine[]>([]); // VMs after filtering/searching
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateVMWizard, setShowCreateVMWizard] = useState(false);
    const [selectedVM, setSelectedVM] = useState<VirtualMachine | null>(null);
    const [selectedVMsForActions, setSelectedVMsForActions] = useState<VirtualMachine[]>([]); // For bulk actions
    const [filters, setFilters] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingAction, setIsLoadingAction] = useState(false); // Global action loading state
    const [globalAlerts, setGlobalAlerts] = useState<VMAlert[]>([]);
    const [globalRecommendations, setGlobalRecommendations] = useState<VMRecommendation[]>([]);

    const [sortConfig, setSortConfig] = useState<{ key: keyof VirtualMachine; direction: 'ascending' | 'descending' } | null>(null);

    const fetchVMs = useCallback(async () => {
        setIsLoading(true);
        try {
            const vmList = await ExtendedComputeAPI.listVMs(filters);
            setAllVms(vmList);
            // Re-apply search/filters if they were already active
            let currentVms = vmList;
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                currentVms = currentVms.filter(vm =>
                    vm.name.toLowerCase().includes(searchLower) ||
                    vm.id.toLowerCase().includes(searchLower) ||
                    vm.internalIp.includes(searchLower) ||
                    (vm.externalIp && vm.externalIp.includes(searchLower)) ||
                    vm.labels && Object.values(vm.labels).some(v => v.toLowerCase().includes(searchLower)) ||
                    vm.networkTags && vm.networkTags.some(tag => tag.toLowerCase().includes(searchLower))
                );
            }
            setDisplayedVms(currentVms);
        } catch (error) {
            console.error('Failed to fetch VMs:', error);
            // Optionally, display an error message in the UI
        } finally {
            setIsLoading(false);
        }
    }, [filters, searchTerm]);

    const fetchGlobalAlerts = useCallback(async () => {
        try {
            const alerts = await ExtendedComputeAPI.listGlobalAlerts();
            setGlobalAlerts(alerts);
        } catch (error) {
            console.error('Failed to fetch global alerts:', error);
        }
    }, []);

    const fetchGlobalRecommendations = useCallback(async () => {
        try {
            const recommendations = await ExtendedComputeAPI.listVMRecommendations();
            setGlobalRecommendations(recommendations);
        } catch (error) {
            console.error('Failed to fetch global recommendations:', error);
        }
    }, []);

    useEffect(() => {
        fetchVMs();
        fetchGlobalAlerts();
        fetchGlobalRecommendations();

        // Simulate real-time updates for status
        const intervalId = setInterval(() => {
            // In a real app, this would be a WebSocket listener or more intelligent polling
            // For now, let's just randomly update some statuses for demonstration
            setAllVms(prevVms => prevVms.map(vm => {
                if (Math.random() < 0.1) { // 10% chance to change status
                    const statuses: VirtualMachine['status'][] = ['RUNNING', 'STOPPED', 'MAINTENANCE', 'PROVISIONING'];
                    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    return { ...vm, status: newStatus, lastUpdatedTimestamp: new Date().toISOString() };
                }
                return vm;
            }));
        }, 10000); // Every 10 seconds

        return () => clearInterval(intervalId); // Cleanup
    }, [fetchVMs, fetchGlobalAlerts, fetchGlobalRecommendations]);

    useEffect(() => {
        // Apply search term to currently filtered VMs
        let currentVms = [...allVms];
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            currentVms = currentVms.filter(vm =>
                vm.name.toLowerCase().includes(searchLower) ||
                vm.id.toLowerCase().includes(searchLower) ||
                vm.internalIp.includes(searchLower) ||
                (vm.externalIp && vm.externalIp.includes(searchLower)) ||
                (vm.labels && Object.values(vm.labels).some(v => v.toLowerCase().includes(searchLower))) ||
                (vm.networkTags && vm.networkTags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }
        setDisplayedVms(currentVms);
        setSelectedVMsForActions(prevSelected => prevSelected.filter(sVm => currentVms.some(dVm => dVm.id === sVm.id))); // Keep selected VMs in sync with displayed ones
    }, [allVms, searchTerm]);


    const handleSearch = (search: string) => {
        setSearchTerm(search);
    };

    const toggleVMSelection = (vmToToggle: VirtualMachine) => {
        setSelectedVMsForActions(prev =>
            prev.some(vm => vm.id === vmToToggle.id)
                ? prev.filter(vm => vm.id !== vmToToggle.id)
                : [...prev, vmToToggle]
        );
    };

    const toggleAllVMsSelection = (select: boolean) => {
        if (select) {
            setSelectedVMsForActions([...displayedVms]);
        } else {
            setSelectedVMsForActions([]);
        }
    };

    const performVMAction = useCallback(async (vmId: string, action: string) => {
        setIsLoadingAction(true);
        try {
            switch (action) {
                case 'START':
                    await ExtendedComputeAPI.startVM(vmId);
                    break;
                case 'STOP':
                    await ExtendedComputeAPI.stopVM(vmId);
                    break;
                case 'REBOOT':
                    await ExtendedComputeAPI.rebootVM(vmId);
                    break;
                case 'DELETE':
                    await ExtendedComputeAPI.deleteVM(vmId);
                    // If deleted, remove from selected
                    setSelectedVMsForActions(prev => prev.filter(vm => vm.id !== vmId));
                    if (selectedVM?.id === vmId) {
                        setSelectedVM(null);
                    }
                    break;
                default:
                    console.warn(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Failed to perform action ${action} on VM ${vmId}:`, error);
            alert(`Failed to perform ${action} on VM ${vmId}. See console for details.`);
        } finally {
            setIsLoadingAction(false);
            fetchVMs(); // Refresh the list to show updated status
        }
    }, [fetchVMs, selectedVM]);

    const vmContextValue = useMemo(() => ({
        selectedVM,
        setSelectedVM,
        refreshVMs: fetchVMs,
        performVMAction,
        isLoadingAction,
        vms: allVms, // Expose allVms for components like ChaosSimulator
    }), [selectedVM, setSelectedVM, fetchVMs, performVMAction, isLoadingAction, allVms]);

    const regions = useMemo(() => [...new Set(allVms.map(vm => vm.region))], [allVms]);
    const machineTypes = useMemo(() => [...new Set(allVms.map(vm => vm.machineType))], [allVms]);

    const requestSort = (key: keyof VirtualMachine) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <VMContext.Provider value={vmContextValue as VMContextType}>
            <div className="bg-gray-900 text-white min-h-screen p-8 font-sans">
                <h1 className="text-4xl font-bold mb-8 text-blue-300">GCP Virtual Machine Operations Center</h1>

                {/* Global Dashboard Summary */}
                <VMGlobalDashboardSummary vms={allVms} allAlerts={globalAlerts} allRecommendations={globalRecommendations} />

                {/* Alerts and Recommendations (side-by-side or stacked) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <VMAlertsCenter allAlerts={globalAlerts} refreshAlerts={fetchGlobalAlerts} />
                    <VMRecommendationsEngine allRecommendations={globalRecommendations} refreshRecommendations={fetchGlobalRecommendations} />
                </div>

                {/* Resource Map and Compliance Auditor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <VMResourceMap vms={allVms} />
                    <VMComplianceAuditor vms={allVms} />
                </div>

                {/* Chaos Engineering Simulator */}
                <VMChaosSimulator />

                <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
                    <h3 className="text-2xl font-semibold mb-4 text-blue-300">Compute Instances Ledger</h3>

                    {/* Filters and Search */}
                    <VMFiltersAndSearch
                        filters={filters}
                        setFilters={setFilters}
                        onSearch={handleSearch}
                        regions={regions}
                        machineTypes={machineTypes}
                    />

                    {/* Actions Panel */}
                    <VMActionsPanel
                        selectedVMs={selectedVMsForActions}
                        onCreateNewVM={() => setShowCreateVMWizard(true)}
                    />

                    {/* VM Table */}
                    <div className="mt-6">
                        <VMTable
                            vms={displayedVms}
                            onSelectVM={setSelectedVM}
                            selectedVMs={selectedVMsForActions}
                            toggleVMSelection={toggleVMSelection}
                            toggleAllVMsSelection={toggleAllVMsSelection}
                            isLoading={isLoading}
                            sortConfig={sortConfig}
                            requestSort={requestSort}
                        />
                    </div>
                </div>

                {/* VM Creation Wizard */}
                {showCreateVMWizard && (
                    <VMCreateWizard
                        onClose={() => setShowCreateVMWizard(false)}
                        onCreateSuccess={() => {
                            setShowCreateVMWizard(false);
                            fetchVMs(); // Refresh VM list after creation
                            alert('VM created successfully! It will appear shortly.');
                        }}
                    />
                )}

                {/* VM Detail Panel */}
                {selectedVM && (
                    <VMDetailPanel
                        vm={selectedVM}
                        onClose={() => setSelectedVM(null)}
                    />
                )}
            </div>
        </VMContext.Provider>
    );
};

export default VMList;