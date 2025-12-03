// data/accessLogs.ts
import { AccessLog } from '../types';

export const MOCK_ACCESS_LOGS: AccessLog[] = [
    { id: 'log1', user: 'visionary@demobank.com', ip: '192.168.1.1', location: 'New York, USA', timestamp: '2024-07-23 10:32 AM', status: 'Success', riskLevel: 'Low' },
    { id: 'log2', user: 'alex.c@quantum.corp', ip: '203.0.113.5', location: 'Tokyo, Japan', timestamp: '2024-07-23 10:30 AM', status: 'Success', riskLevel: 'Low' },
    { id: 'log3', user: 'brenda.r@quantum.corp', ip: '198.51.100.2', location: 'London, UK', timestamp: '2024-07-23 10:28 AM', status: 'Failed', riskLevel: 'Medium' },
    { id: 'log4', user: 'charles.d@quantum.corp', ip: '198.51.100.22', location: 'London, UK', timestamp: '2024-07-23 10:25 AM', status: 'Success', riskLevel: 'Low' },
    { id: 'log5', user: 'ian.w@quantum.corp', ip: '104.18.32.12', location: 'San Francisco, USA', timestamp: '2024-07-23 09:55 AM', status: 'Success', riskLevel: 'Low' },
    { id: 'log6', user: 'brenda.r@quantum.corp', ip: '8.8.8.8', location: 'Mountain View, USA', timestamp: '2024-07-23 09:40 AM', status: 'Success', riskLevel: 'High' },
    { id: 'log7', user: 'alex.c@quantum.corp', ip: '203.0.113.5', location: 'Tokyo, Japan', timestamp: '2024-07-22 08:15 PM', status: 'Success', riskLevel: 'Low' },
];
