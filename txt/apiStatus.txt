// data/apiStatus.ts

// This is the report from the Engine Room, a real-time diagnostic of the vital
// connections that power Demo Bank. Each entry is a status check on a critical
// third-party API, from Plaid to Google Gemini itself. This data is not for show;
// it is a foundational element of the application's narrative, proving its
// architecture is that of a serious, enterprise-grade platform. It builds trust
// through transparency, showing the health of every gear in the great machine.

import type { APIStatus } from '../types';

/**
 * @description A list simulating the real-time status of various third-party APIs
 * that the application integrates with. This data is used in the `APIStatusView`
 * to create a realistic system status dashboard. Each entry includes the provider's
 * name, its current operational status, and a mock response time.
 */
export const MOCK_API_STATUS: APIStatus[] = [
    { provider: 'Plaid', status: 'Operational', responseTime: 120 },
    { provider: 'Stripe', status: 'Operational', responseTime: 85 },
    { provider: 'Marqeta', status: 'Operational', responseTime: 150 },
    { provider: 'Modern Treasury', status: 'Operational', responseTime: 110 },
    { provider: 'Google Gemini', status: 'Degraded Performance', responseTime: 450 },
];
