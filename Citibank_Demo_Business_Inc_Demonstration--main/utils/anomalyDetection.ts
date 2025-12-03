// utils/anomalyDetection.ts
// AEGIS AI INTEGRATION: This utility provides advanced behavioral anomaly detection and threat pattern analysis
// capabilities. It is a core component of the AegisVault's proactive security framework,
// analyzing user activity, transaction patterns, and device telemetry in real-time.
// Leveraging machine learning principles, it establishes baselines and identifies deviations
// that may indicate sophisticated threats, ensuring the highest level of financial security.

/**
 * @description Represents the outcome of an anomaly detection analysis.
 * Contains information about whether an anomaly was detected, its score, reasons, and severity.
 */
export interface AnomalyDetectionResult {
    isAnomaly: boolean;
    score: number; // 0-100, higher means more anomalous
    reasons: string[];
    severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

/**
 * @description Input structure for user activity analysis.
 */
export interface UserActivityInput {
    userId: string;
    device: string;
    location: string;
    ip: string;
    timestamp: Date;
}

/**
 * @description Input structure for transaction analysis.
 */
export interface TransactionInput {
    userId: string;
    amount: number;
    currency: string;
    merchant: string;
    location: string;
    timestamp: Date;
    beneficiaryId?: string; // Optional: ID of the recipient
    accountId: string; // Account from which the transaction originated
}

/**
 * @description Input structure for device telemetry analysis.
 */
export interface DeviceTelemetryInput {
    userId: string;
    deviceId: string;
    type: string; // e.g., 'mobile', 'laptop', 'tablet'
    healthStatus: 'optimal' | 'warning' | 'critical';
    lastActivity: Date;
    accessCount: number; // Number of access attempts in a period
    dataTransferredMB: number; // MB of data transferred
}

// ================================================================================================
// MOCK HISTORICAL DATA (FOR DEMONSTRATION)
// In a real system, this would come from a persistent data store and ML models.
// ================================================================================================

const MOCK_HISTORICAL_USER_ACTIVITIES: UserActivityInput[] = [
    { userId: 'user123', device: 'Chrome on macOS', location: 'New York, USA', ip: '192.168.1.1', timestamp: new Date('2024-03-01T10:00:00Z') },
    { userId: 'user123', device: 'DemoBank App on iOS', location: 'New York, USA', ip: '172.16.0.1', timestamp: new Date('2024-02-28T14:30:00Z') },
    { userId: 'user123', device: 'Chrome on macOS', location: 'New York, USA', ip: '192.168.1.1', timestamp: new Date('2024-02-27T09:15:00Z') },
    { userId: 'user123', device: 'DemoBank App on iOS', location: 'New York, USA', ip: '172.16.0.1', timestamp: new Date('2024-02-26T20:00:00Z') },
    { userId: 'user123', device: 'Chrome on macOS', location: 'New York, USA', ip: '192.168.1.1', timestamp: new Date('2024-02-25T11:45:00Z') },
];

const MOCK_HISTORICAL_TRANSACTIONS: TransactionInput[] = [
    { userId: 'user123', accountId: 'acc1', amount: 50.00, currency: 'USD', merchant: 'Coffee Shop', location: 'New York, USA', timestamp: new Date('2024-03-01T11:00:00Z') },
    { userId: 'user123', accountId: 'acc1', amount: 120.50, currency: 'USD', merchant: 'Grocery Store', location: 'New York, USA', timestamp: new Date('2024-02-29T18:00:00Z') },
    { userId: 'user123', accountId: 'acc1', amount: 2500.00, currency: 'USD', merchant: 'Rent Payment', location: 'New York, USA', timestamp: new Date('2024-02-28T09:00:00Z'), beneficiaryId: 'landlord456' },
    { userId: 'user123', accountId: 'acc1', amount: 75.00, currency: 'USD', merchant: 'Online Retailer', location: 'New York, USA', timestamp: new Date('2024-02-27T15:30:00Z') },
    { userId: 'user123', accountId: 'acc1', amount: 150.00, currency: 'USD', merchant: 'Restaurant', location: 'New York, USA', timestamp: new Date('2024-02-26T19:00:00Z') },
    { userId: 'user123', accountId: 'acc1', amount: 350.00, currency: 'USD', merchant: 'Electronics Store', location: 'New York, USA', timestamp: new Date('2024-02-20T10:00:00Z') },
    { userId: 'user123', accountId: 'acc2', amount: 5000.00, currency: 'USD', merchant: 'Investment Broker', location: 'New York, USA', timestamp: new Date('2024-02-15T12:00:00Z'), beneficiaryId: 'broker789' },
];

const MOCK_HISTORICAL_DEVICE_TELEMETRIES: DeviceTelemetryInput[] = [
    { userId: 'user123', deviceId: 'dev1', type: 'laptop', healthStatus: 'optimal', lastActivity: new Date('2024-03-01T10:05:00Z'), accessCount: 15, dataTransferredMB: 100 },
    { userId: 'user123', deviceId: 'dev2', type: 'mobile', healthStatus: 'optimal', lastActivity: new Date('2024-03-01T08:30:00Z'), accessCount: 20, dataTransferredMB: 50 },
    { userId: 'user123', deviceId: 'dev1', type: 'laptop', healthStatus: 'optimal', lastActivity: new Date('2024-02-29T16:00:00Z'), accessCount: 12, dataTransferredMB: 80 },
];

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * @description Calculates the difference between two dates in hours.
 * @param date1 The first date.
 * @param date2 The second date.
 * @returns The difference in hours.
 */
function calculateTimeDifferenceInHours(date1: Date, date2: Date): number {
    const diffMillis = Math.abs(date1.getTime() - date2.getTime());
    return diffMillis / (1000 * 60 * 60);
}

/**
 * @description Calculates the average of a given array of numbers.
 * @param data An array of numbers.
 * @returns The average, or 0 if the array is empty.
 */
function calculateAverage(data: number[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
}

/**
 * @description Determines the severity level based on an anomaly score.
 * @param score The anomaly score (0-100).
 * @returns The corresponding severity level.
 */
function getSeverity(score: number): AnomalyDetectionResult['severity'] {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'none';
}

// ================================================================================================
// CORE ANOMALY DETECTION FUNCTIONS
// ================================================================================================

/**
 * @description Analyzes a user's current login activity for unusual patterns compared to historical data.
 * This function detects anomalies based on location, IP address, device, and login time.
 * @param currentActivity The most recent user activity data.
 * @param historicalActivities A collection of the user's past activities.
 * @returns An AnomalyDetectionResult indicating if an anomaly was found.
 */
export function analyzeUserActivity(
    currentActivity: UserActivityInput,
    historicalActivities: UserActivityInput[]
): AnomalyDetectionResult {
    let score = 0;
    const reasons: string[] = [];
    const userId = currentActivity.userId;
    const userHistoricalActivities = historicalActivities.filter(a => a.userId === userId);

    if (userHistoricalActivities.length === 0) {
        reasons.push('First activity recorded for this user, establishing baseline.');
        return { isAnomaly: false, score: 0, reasons: reasons, severity: 'none' };
    }

    const knownLocations = new Set(userHistoricalActivities.map(a => a.location));
    const knownIps = new Set(userHistoricalActivities.map(a => a.ip));
    const knownDevices = new Set(userHistoricalActivities.map(a => a.device));
    const averageLoginHour = calculateAverage(userHistoricalActivities.map(a => a.timestamp.getUTCHours()));

    // Rule 1: New IP Address
    if (!knownIps.has(currentActivity.ip)) {
        score += 30; // High impact
        reasons.push(`Unusual IP address detected: ${currentActivity.ip}.`);
    }

    // Rule 2: New Location
    if (!knownLocations.has(currentActivity.location)) {
        score += 40; // Critical impact
        reasons.push(`Login from an unrecognized location: ${currentActivity.location}.`);
    }

    // Rule 3: New Device
    if (!knownDevices.has(currentActivity.device)) {
        score += 25; // Medium impact
        reasons.push(`Login using an unregistered device: ${currentActivity.device}.`);
    }

    // Rule 4: Unusual Time of Day (e.g., more than 4 hours from average login hour)
    const currentHour = currentActivity.timestamp.getUTCHours();
    if (Math.abs(currentHour - averageLoginHour) > 4 && userHistoricalActivities.length > 5) { // Only apply if enough history
        score += 15; // Low impact
        reasons.push(`Login at an unusual time of day (${currentActivity.timestamp.toLocaleTimeString()}).`);
    }

    // Combine score and determine anomaly status
    const isAnomaly = score > 20; // A low threshold for flagging potential issues.
    if (!isAnomaly && reasons.length === 0) reasons.push('No significant anomalies detected in user activity.');

    return {
        isAnomaly,
        score: Math.min(score, 100), // Cap score at 100
        reasons,
        severity: getSeverity(score),
    };
}

/**
 * @description Analyzes a new transaction for suspicious patterns compared to historical transactions.
 * This function considers transaction amount, merchant, location, and beneficiary.
 * @param currentTransaction The transaction to be analyzed.
 * @param historicalTransactions A collection of the user's past transactions.
 * @returns An AnomalyDetectionResult indicating if an anomaly was found.
 */
export function analyzeTransaction(
    currentTransaction: TransactionInput,
    historicalTransactions: TransactionInput[]
): AnomalyDetectionResult {
    let score = 0;
    const reasons: string[] = [];
    const userId = currentTransaction.userId;
    const userHistoricalTransactions = historicalTransactions.filter(t => t.userId === userId && t.accountId === currentTransaction.accountId);

    if (userHistoricalTransactions.length === 0) {
        reasons.push('First transaction recorded for this account, establishing baseline.');
        return { isAnomaly: false, score: 0, reasons: reasons, severity: 'none' };
    }

    const historicalAmounts = userHistoricalTransactions.map(t => t.amount);
    const averageAmount = calculateAverage(historicalAmounts);
    const maxAmount = Math.max(...historicalAmounts);
    const knownMerchants = new Set(userHistoricalTransactions.map(t => t.merchant));
    const knownLocations = new Set(userHistoricalTransactions.map(t => t.location));
    const knownBeneficiaries = new Set(userHistoricalTransactions.map(t => t.beneficiaryId).filter(Boolean));

    // Rule 1: Unusually Large Transaction
    if (currentTransaction.amount > maxAmount * 1.5 && currentTransaction.amount > 1000) { // 50% higher than max, and above a certain threshold
        score += 40;
        reasons.push(`Transaction amount (${currentTransaction.amount} ${currentTransaction.currency}) significantly higher than usual.`);
    } else if (currentTransaction.amount > averageAmount * 2 && currentTransaction.amount > 500) { // 100% higher than average, and above a certain threshold
        score += 20;
        reasons.push(`Transaction amount (${currentTransaction.amount} ${currentTransaction.currency}) is higher than typical.`);
    }

    // Rule 2: New Merchant
    if (!knownMerchants.has(currentTransaction.merchant)) {
        score += 25;
        reasons.push(`Transaction with an unfamiliar merchant: ${currentTransaction.merchant}.`);
    }

    // Rule 3: Unusual Transaction Location (if different from typical user locations)
    if (!knownLocations.has(currentTransaction.location)) {
        score += 35; // High impact
        reasons.push(`Transaction from an unusual location: ${currentTransaction.location}.`);
    }

    // Rule 4: New Beneficiary (for transfers)
    if (currentTransaction.beneficiaryId && !knownBeneficiaries.has(currentTransaction.beneficiaryId)) {
        score += 30; // High impact
        reasons.push(`Funds transferred to a new beneficiary ID: ${currentTransaction.beneficiaryId}.`);
    }

    // Rule 5: Transaction at Unusual Hour (e.g., 3 standard deviations from average)
    // This requires more sophisticated statistical analysis but for simplicity, we can use a fixed deviation from the 'typical' hours.
    const currentHour = currentTransaction.timestamp.getUTCHours();
    const typicalOperatingHours = [7, 22]; // e.g., 7 AM to 10 PM UTC
    if (currentHour < typicalOperatingHours[0] || currentHour > typicalOperatingHours[1]) {
        score += 10;
        reasons.push(`Transaction initiated outside of typical operating hours (${currentTransaction.timestamp.toLocaleTimeString()}).`);
    }


    const isAnomaly = score > 20;
    if (!isAnomaly && reasons.length === 0) reasons.push('No significant anomalies detected in transaction.');

    return {
        isAnomaly,
        score: Math.min(score, 100),
        reasons,
        severity: getSeverity(score),
    };
}

/**
 * @description Analyzes a device's current telemetry for unusual health status or activity patterns.
 * This function detects anomalies based on device health, data transfer, and access counts.
 * @param currentTelemetry The most recent device telemetry data.
 * @param historicalTelemetries A collection of historical device telemetry for the user.
 * @returns An AnomalyDetectionResult indicating if an anomaly was found.
 */
export function analyzeDeviceTelemetry(
    currentTelemetry: DeviceTelemetryInput,
    historicalTelemetries: DeviceTelemetryInput[]
): AnomalyDetectionResult {
    let score = 0;
    const reasons: string[] = [];
    const userId = currentTelemetry.userId;
    const deviceId = currentTelemetry.deviceId;
    const userDeviceHistoricalTelemetries = historicalTelemetries.filter(t => t.userId === userId && t.deviceId === deviceId);

    if (userDeviceHistoricalTelemetries.length === 0) {
        reasons.push('First telemetry recorded for this device, establishing baseline.');
        return { isAnomaly: false, score: 0, reasons: reasons, severity: 'none' };
    }

    const historicalDataTransfers = userDeviceHistoricalTelemetries.map(t => t.dataTransferredMB);
    const averageDataTransfer = calculateAverage(historicalDataTransfers);
    const maxDataTransfer = Math.max(...historicalDataTransfers);

    // Rule 1: Critical Health Status
    if (currentTelemetry.healthStatus === 'critical') {
        score += 50; // High impact
        reasons.push(`Device reports critical health status.`);
    } else if (currentTelemetry.healthStatus === 'warning' && userDeviceHistoricalTelemetries.every(t => t.healthStatus === 'optimal')) {
        score += 20; // Medium impact, if previously optimal
        reasons.push(`Device reports warning health status, a deviation from optimal.`);
    }

    // Rule 2: Unusually High Data Transfer
    if (currentTelemetry.dataTransferredMB > maxDataTransfer * 2 && currentTelemetry.dataTransferredMB > 1000) { // 100% higher than max, and over 1GB
        score += 30;
        reasons.push(`Unusually high data transfer detected from device (${currentTelemetry.dataTransferredMB} MB).`);
    } else if (currentTelemetry.dataTransferredMB > averageDataTransfer * 3 && currentTelemetry.dataTransferredMB > 500) { // 200% higher than average, and over 500MB
        score += 15;
        reasons.push(`Higher than average data transfer detected from device (${currentTelemetry.dataTransferredMB} MB).`);
    }

    // Rule 3: Excessive Access Attempts (e.g., compared to average or a fixed high threshold)
    const historicalAccessCounts = userDeviceHistoricalTelemetries.map(t => t.accessCount);
    const averageAccessCount = calculateAverage(historicalAccessCounts);
    if (currentTelemetry.accessCount > averageAccessCount * 2 && currentTelemetry.accessCount > 50) { // More than double average, and over 50 attempts
        score += 25;
        reasons.push(`Excessive access attempts detected from device (${currentTelemetry.accessCount}).`);
    }

    const isAnomaly = score > 20;
    if (!isAnomaly && reasons.length === 0) reasons.push('No significant anomalies detected in device telemetry.');

    return {
        isAnomaly,
        score: Math.min(score, 100),
        reasons,
        severity: getSeverity(score),
    };
}

// ================================================================================================
// COMPREHENSIVE ANOMALY DETECTION ORCHESTRATOR
// ================================================================================================

/**
 * @description Runs a comprehensive suite of anomaly detection algorithms across various data points
 * for a given user. This function orchestrates calls to specific detection modules and aggregates results.
 * @param userId The ID of the user for whom to run the detection.
 * @param data An object containing potential user activity, transaction, and/or device telemetry data.
 * @returns An array of results from all applicable anomaly detection analyses.
 */
export function runAegisAnomalyDetection(
    userId: string,
    data: {
        userActivity?: UserActivityInput;
        transaction?: TransactionInput;
        deviceTelemetry?: DeviceTelemetryInput;
    }
): { type: string; result: AnomalyDetectionResult; }[] {
    const allResults: { type: string; result: AnomalyDetectionResult; }[] = [];

    // Ensure all timestamps are Date objects for internal consistency
    const processData = <T extends { timestamp?: string | Date; lastActivity?: string | Date }>(input: T): T => {
        if (typeof input.timestamp === 'string') {
            input.timestamp = new Date(input.timestamp);
        }
        if (typeof input.lastActivity === 'string') {
            input.lastActivity = new Date(input.lastActivity);
        }
        return input;
    };

    if (data.userActivity) {
        const processedActivity = processData({ ...data.userActivity, userId });
        const result = analyzeUserActivity(processedActivity, MOCK_HISTORICAL_USER_ACTIVITIES);
        if (result.isAnomaly || result.score > 0) {
            allResults.push({ type: 'User Activity', result });
        }
    }

    if (data.transaction) {
        const processedTransaction = processData({ ...data.transaction, userId });
        const result = analyzeTransaction(processedTransaction, MOCK_HISTORICAL_TRANSACTIONS);
        if (result.isAnomaly || result.score > 0) {
            allResults.push({ type: 'Transaction', result });
        }
    }

    if (data.deviceTelemetry) {
        const processedTelemetry = processData({ ...data.deviceTelemetry, userId });
        const result = analyzeDeviceTelemetry(processedTelemetry, MOCK_HISTORICAL_DEVICE_TELEMETRIES);
        if (result.isAnomaly || result.score > 0) {
            allResults.push({ type: 'Device Telemetry', result });
        }
    }

    // Sort results by severity, critical first
    allResults.sort((a, b) => {
        const severityOrder = { 'critical': 5, 'high': 4, 'medium': 3, 'low': 2, 'none': 1 };
        return severityOrder[b.result.severity] - severityOrder[a.result.severity];
    });

    if (allResults.length === 0) {
        console.info(`[Aegis AI] No anomalies detected for user ${userId}.`);
    }

    return allResults;
}

// Example of how it might be used (for internal testing/demonstration)
/*
if (require.main === module) { // Only run if executed directly
    console.log("--- Running Anomaly Detection Examples ---");

    const newLoginActivity: UserActivityInput = {
        userId: 'user123',
        device: 'Unknown Browser on Linux',
        location: 'Moscow, Russia', // New location
        ip: '8.8.8.8', // New IP
        timestamp: new Date(),
    };
    const activityResult = runAegisAnomalyDetection('user123', { userActivity: newLoginActivity });
    console.log("\n--- User Activity Anomaly ---");
    console.log(JSON.stringify(activityResult, null, 2));


    const newTransaction: TransactionInput = {
        userId: 'user123',
        accountId: 'acc1',
        amount: 25000.00, // Very large amount
        currency: 'USD',
        merchant: 'International Gold Exchange', // New merchant
        location: 'Zurich, Switzerland', // New location
        timestamp: new Date('2024-03-02T03:00:00Z'), // Unusual time
        beneficiaryId: 'goldinvestor123', // New beneficiary
    };
    const transactionResult = runAegisAnomalyDetection('user123', { transaction: newTransaction });
    console.log("\n--- Transaction Anomaly ---");
    console.log(JSON.stringify(transactionResult, null, 2));

    const normalTransaction: TransactionInput = {
        userId: 'user123',
        accountId: 'acc1',
        amount: 75.00,
        currency: 'USD',
        merchant: 'Coffee Shop',
        location: 'New York, USA',
        timestamp: new Date(),
    };
    const normalTransactionResult = runAegisAnomalyDetection('user123', { transaction: normalTransaction });
    console.log("\n--- Normal Transaction (Expected No Anomaly) ---");
    console.log(JSON.stringify(normalTransactionResult, null, 2));

    const newDeviceTelemetry: DeviceTelemetryInput = {
        userId: 'user123',
        deviceId: 'dev1',
        type: 'laptop',
        healthStatus: 'critical', // Critical health
        lastActivity: new Date(),
        accessCount: 150, // High access
        dataTransferredMB: 5000, // Very high data transfer
    };
    const deviceTelemetryResult = runAegisAnomalyDetection('user123', { deviceTelemetry: newDeviceTelemetry });
    console.log("\n--- Device Telemetry Anomaly ---");
    console.log(JSON.stringify(deviceTelemetryResult, null, 2));
}
*/