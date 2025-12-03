```typescript
import {
    ApiKeyMeta,
    ApiKeyStatus,
    KeyScope,
    UsageMetrics,
    AuditLogEntry,
    SecurityPolicy,
    AIRecommendation,
    UserPreferences,
    WebhookSubscription,
    QuantumSecureVaultConfig,
    DecentralizedIdentityProfile,
    // Note: Assuming these types are correctly exported from components/ApiKeyPrompt.tsx
    // If not, they would need to be defined here or sourced from a global types file.
} from '../components/ApiKeyPrompt';

// --- Core Internal Types for AI Governance Engine Operations ---

/**
 * Represents the outcome of evaluating an API key against a specific security policy.
 * Provides detailed information on compliance status, identified violations, and recommended actions.
 * Business Value: Enables automated, real-time compliance checks, reducing manual audit burdens,
 * mitigating regulatory fines, and ensuring continuous adherence to security standards, thus
 * safeguarding brand reputation and operational continuity.
 */
export interface PolicyEvaluationResult {
    policyId: string;
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
    score: number; // A compliance score from 0 (non-compliant) to 100 (fully compliant).
    evaluatedAt: string; // ISO 8601 timestamp of when the evaluation occurred.
    remediationEffortEstimate: 'low' | 'medium' | 'high' | 'critical'; // Estimated effort for remediation.
}

/**
 * Captures the results of an anomaly detection scan for a given entity (e.g., API key, user activity).
 * Includes details about the anomaly, its severity, and a confidence score.
 * Business Value: Provides an early warning system for potential security breaches, operational
 * inefficiencies, or fraudulent activities. This proactive detection capability minimizes
 * financial losses, prevents data exfiltration, and ensures system integrity, protecting
 * critical assets worth millions.
 */
export interface AnomalyDetectionResult {
    anomalyId: string;
    entityId: string; // The ID of the entity where the anomaly was detected (e.g., ApiKeyMeta.id).
    entityType: 'apiKey' | 'user' | 'system'; // Type of entity affected.
    anomalyType: 'usage_spike' | 'geo_deviation' | 'scope_misuse' | 'access_pattern' | 'config_drift' | 'credential_leak' | 'quantum_risk_escalation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string; // ISO 8601 timestamp of when the anomaly was detected.
    details: Record<string, any>; // Flexible JSON blob for specific anomaly details.
    confidence: number; // A confidence score from 0.0 to 1.0, indicating certainty of the anomaly.
    potentialThreatVectors: ThreatVector[]; // Potential underlying security threats.
}

/**
 * Defines an entry within a comprehensive compliance report, detailing an entity's status against a policy.
 * Business Value: Automates the generation of auditable compliance records, critical for regulatory
 * reporting and internal governance. This reduces compliance costs, accelerates audit cycles, and
 * provides irrefutable proof of adherence to mandates, avoiding penalties and bolstering trust.
 */
export interface ComplianceReportEntry {
    entityId: string; // User ID or ApiKey ID.
    entityType: 'user' | 'apiKey';
    policyId: string;
    policyName: string;
    complianceStatus: 'compliant' | 'non_compliant' | 'pending_review' | 'not_applicable';
    issues: string[]; // List of specific issues or violations.
    suggestedActions: string[]; // Recommended steps to achieve or maintain compliance.
    lastEvaluated: string; // ISO 8601 timestamp of the last compliance check.
    associatedRecommendations: string[]; // IDs of AIRecommendations generated.
}

/**
 * Represents a historical baseline for an API key's usage or activity metrics.
 * Used by anomaly detection algorithms to identify deviations from normal behavior.
 * Business Value: Provides the foundational data for intelligent anomaly detection, allowing the
 * system to differentiate normal operational fluctuations from genuine threats. This precision
 * reduces false positives, minimizing alert fatigue for security teams and focusing resources
 * on real risks.
 */
export interface HistoricalBaseline {
    keyId: string;
    metricType: 'requests' | 'data_transfer' | 'geo_distribution' | 'failed_requests' | 'rate_limit_hits' | 'latency';
    dailyAverage: number;
    dailyStdDev: number;
    peakHourAverage: Record<string, number>; // e.g., { "09": 1500, "10": 2000 }
    recentActivityVector: number[]; // A time-series vector, e.g., last 7 days of requests.
    lastRecalibrated: string; // ISO 8601 timestamp of the last baseline update.
    dataPointsCount: number; // Number of data points used to establish this baseline.
}

/**
 * Describes the typical behavioral profile of an actor (user or system).
 * Used for detecting deviations in audit logs.
 * Business Value: Establishes a behavioral fingerprint for every actor, enabling the detection
 * of compromised accounts or insider threats with high accuracy. This protects against unauthorized
 * access, data manipulation, and intellectual property theft, which can collectively amount
 * to millions in damages.
 */
export interface BehavioralProfile {
    actorId: string; // User ID or system ID.
    commonActions: KeyScope[]; // List of frequently performed actions by this actor.
    typicalIPRanges: string[]; // CIDR notations or exact IPs.
    typicalUserAgents: string[]; // Common user-agent strings.
    activityFrequency: 'low' | 'medium' | 'high' | 'bursty'; // Overall activity level.
    trustScoreModifier: number; // A factor (e.g., -0.5 to 0.5) influencing global trust scores.
    lastProfiled: string; // ISO 8601 timestamp of the last profile update.
    riskFactors: string[]; // Identified risk factors for this actor.
}

/**
 * Defines a Quantum Risk Assessment result, crucial for post-quantum cryptography readiness.
 * Business Value: Proactively identifies and quantifies cryptographic vulnerabilities in
 * the face of quantum computing advancements. This foresight allows organizations to
 * strategically migrate to post-quantum safe algorithms, ensuring the long-term security
 * of digital assets and transactions, preventing catastrophic breaches that could
 * undermine entire business models.
 */
export interface QuantumRiskAssessment {
    entityId: string; // API Key ID, System ID, or Transaction ID
    entityType: 'apiKey' | 'system' | 'data' | 'transaction';
    algorithmUsed: string; // e.g., 'RSA-2048', 'ECC-P256', 'PQC-Dilithium'
    currentSecurityStrength: number; // Bits of security (e.g., 112, 128, 256)
    quantumVulnerabilityScore: number; // 0-100, higher means more vulnerable to quantum attacks.
    estimatedTimeToBreak: 'immediate' | '1-5 years' | '5-10 years' | '10+ years' | 'unknown';
    recommendations: string[];
    lastAssessed: string; // ISO 8601 timestamp
    isQuantumSecure: boolean;
}


// --- General Purpose Utility Classes ---

/**
 * Provides static methods for generating various types of random data, useful for mocks and simulations.
 * Business Value: Accelerates development and testing cycles by providing robust, repeatable,
 * yet randomized data generation. This capability is essential for simulating complex, large-scale
 * production scenarios, enabling comprehensive stress testing and anomaly detection algorithm validation
 * without relying on sensitive real-world data, significantly reducing time-to-market and
 * ensuring solution robustness.
 */
export class RandomDataGenerator {
    /**
     * Generates a universally unique identifier (UUID) string.
     * @returns A string in UUID v4 format.
     */
    static uuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generates a random integer within a specified range (inclusive).
     * @param min The minimum value.
     * @param max The maximum value.
     * @returns A random integer.
     */
    static randomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generates a random floating-point number within a specified range, with a given number of decimal places.
     * @param min The minimum value.
     * @param max The maximum value.
     * @param decimals The number of decimal places for rounding.
     * @returns A random float.
     */
    static randomFloat(min: number, max: number, decimals: number = 2): number {
        const str = (Math.random() * (max - min) + min).toFixed(decimals);
        return parseFloat(str);
    }

    /**
     * Generates a random ISO 8601 date string between two given dates.
     * @param start The start date.
     * @param end The end date.
     * @returns An ISO 8601 date string.
     */
    static randomDate(start: Date, end: Date): string {
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date.toISOString();
    }

    /**
     * Selects a random element from an array.
     * @param arr The array to select from.
     * @returns A randomly selected element.
     */
    static selectRandom<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Generates a random boolean value.
     * @returns A random boolean (true or false).
     */
    static randomBoolean(): boolean {
        return Math.random() > 0.5;
    }

    /**
     * Generates a random sentence composed of predefined "universe-themed" words.
     * @param wordCount The number of words in the sentence.
     * @returns A random sentence string.
     */
    static randomSentence(wordCount: number): string {
        const words = ['quantum', 'stellar', 'galaxy', 'api', 'key', 'security', 'protocol', 'engine', 'analytics', 'data', 'universe', 'decentralized', 'vault', 'hyperloop', 'fusion', 'nexus', 'algorithm', 'blockchain', 'biometric', 'compliance', 'governance', 'sentient', 'intelligence', 'omni', 'global', 'cryptography', 'telemetry', 'interstellar', 'orbital', 'cosmic', 'nebula', 'anomaly', 'predictor', 'neural', 'network', 'subspace'];
        let sentence = '';
        for (let i = 0; i < wordCount; i++) {
            sentence += (i > 0 ? ' ' : '') + this.selectRandom(words);
        }
        return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    }

    /**
     * Generates a random IP address.
     * @returns A random IP address string.
     */
    static randomIpAddress(): string {
        return `${this.randomNumber(1, 254)}.${this.randomNumber(0, 255)}.${this.randomNumber(0, 255)}.${this.randomNumber(1, 254)}`;
    }

    /**
     * Generates a random user agent string.
     * @returns A random user agent string.
     */
    static randomUserAgent(): string {
        const agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
            'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
            'PostmanRuntime/7.30.0',
            'Python/3.9 aiohttp/3.8.3',
            'OmniBankGlobal-Service-Bot/1.0',
            'Node/18.12.0 (Linux x64)'
        ];
        return this.selectRandom(agents);
    }
}

/**
 * A simulated cryptographic utility for demonstration purposes, focusing on post-quantum readiness concepts.
 * Does not implement actual cryptographic functions but provides a framework for secure key management and data operations.
 * Business Value: Offers a critical simulation layer for cryptographic operations, particularly
 * in the context of emerging post-quantum threats. This module allows for early integration and
 * testing of quantum-safe migration strategies, ensuring that the platform's security remains
 * future-proof and resilient against advanced adversaries, thereby protecting billions in transactional value.
 */
export class CryptoSimulator {
    /**
     * Simulates hashing an input string.
     * @param input The string to hash.
     * @returns A promise resolving to a mock hash string.
     */
    static async pseudoHash(input: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 50 + RandomDataGenerator.randomNumber(0, 20))); // Simulate varying work
        return `hash_v${RandomDataGenerator.randomNumber(1, 5)}_${input.substring(0, Math.min(5, input.length))}_${RandomDataGenerator.uuid().substring(0, 8)}`;
    }

    /**
     * Simulates encrypting data with a given algorithm. Incorporates a quantum-safe flag.
     * @param data The data string to encrypt.
     * @param algorithm The simulated encryption algorithm (e.g., 'post_quantum_hybrid_aes', 'RSA-2048').
     * @returns A promise resolving to a mock encrypted string.
     */
    static async encryptData(data: string, algorithm: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 100 + RandomDataGenerator.randomNumber(0, 50)));
        const isQuantumSafe = algorithm.toLowerCase().includes('pqc') || algorithm.toLowerCase().includes('dilithium') || RandomDataGenerator.randomBoolean(); // Simulate for demo
        return `encrypted_${algorithm.replace(/[^a-zA-Z0-9]/g, '')}_${data.length}_${isQuantumSafe ? 'PQC_READY_' : ''}payload_${RandomDataGenerator.uuid()}`;
    }

    /**
     * Simulates decrypting encrypted data.
     * @param encryptedData The mock encrypted data string.
     * @param algorithm The simulated decryption algorithm.
     * @returns A promise resolving to a mock decrypted string.
     */
    static async decryptData(encryptedData: string, algorithm: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 100 + RandomDataGenerator.randomNumber(0, 50)));
        return `decrypted_content_from_${algorithm}_${encryptedData.length}_${RandomDataGenerator.randomSentence(3).replace('.', '')}`;
    }

    /**
     * Generates a simulated secure key, optionally indicating quantum resistance.
     * @param length The desired length of the key.
     * @param quantumSecure If true, generates a key with a 'PQC' prefix.
     * @returns A random string representing a key.
     */
    static generateSecureKey(length: number = 32, quantumSecure: boolean = false): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return quantumSecure ? `PQC_KEY_${result}` : result;
    }

    /**
     * Simulates signing data with a private key.
     * @param data The data to sign.
     * @param privateKey The simulated private key.
     * @returns A promise resolving to a mock signature.
     */
    static async signData(data: string, privateKey: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 70 + RandomDataGenerator.randomNumber(0, 30)));
        return `signature_${data.length}_${privateKey.substring(0, 5)}_${RandomDataGenerator.uuid().substring(0, 6)}`;
    }

    /**
     * Simulates verifying a signature with a public key.
     * @param data The original data.
     * @param signature The signature to verify.
     * @param publicKey The simulated public key.
     * @returns A promise resolving to a boolean indicating verification success.
     */
    static async verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 70 + RandomDataGenerator.randomNumber(0, 30)));
        // In a real scenario, this would involve complex cryptographic checks.
        // For simulation, we randomly determine success based on some factors.
        const isMatch = signature.includes(data.length.toString()) && signature.includes(publicKey.substring(0, 5));
        return RandomDataGenerator.randomBoolean() && isMatch;
    }
}

/**
 * Provides static methods for basic statistical calculations, used in anomaly detection.
 * Business Value: The robust statistical analysis capabilities within this module are fundamental
 * for accurately discerning patterns and anomalies in massive datasets. By providing precise
 * mean, standard deviation, and outlier detection, it powers sophisticated fraud detection,
 * performance monitoring, and security incident prediction, saving millions by preventing
 * critical system failures and financial theft.
 */
export class StatisticalAnalyzer {
    /**
     * Calculates the mean (average) of an array of numbers.
     * @param values An array of numbers.
     * @returns The mean of the values.
     */
    static calculateMean(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, current) => sum + current, 0) / values.length;
    }

    /**
     * Calculates the sample standard deviation of an array of numbers.
     * @param values An array of numbers.
     * @param mean Optional pre-calculated mean to avoid re-calculation.
     * @returns The standard deviation of the values. Returns 0 if less than 2 values.
     */
    static calculateStandardDeviation(values: number[], mean?: number): number {
        if (values.length < 2) return 0; // Standard deviation is undefined for less than 2 points (sample std dev)
        const avg = mean === undefined ? StatisticalAnalyzer.calculateMean(values) : mean;
        const variance = values.map(value => Math.pow(value - avg, 2)).reduce((sum, current) => sum + current, 0) / (values.length - 1);
        return Math.sqrt(variance);
    }

    /**
     * Detects if a given value is an outlier based on its deviation from the mean, scaled by standard deviation.
     * @param value The value to check.
     * @param mean The mean of the dataset.
     * @param stdDev The standard deviation of the dataset.
     * @param threshold The number of standard deviations from the mean to consider an outlier (e.g., 2 or 3 for Z-score).
     * @returns True if the value is an outlier, false otherwise.
     */
    static detectOutlier(value: number, mean: number, stdDev: number, threshold: number = 2.5): boolean {
        if (stdDev === 0) return false; // Cannot detect outliers if no variance
        return Math.abs(value - mean) > threshold * stdDev;
    }

    /**
     * Calculates the Jaccard Index (similarity coefficient) between two sets.
     * Used for comparing similarity of categorical data, e.g., geographic regions.
     * @param setA The first set.
     * @param setB The second set.
     * @returns The Jaccard Index, a value between 0.0 and 1.0.
     */
    static jaccardIndex<T>(setA: Set<T>, setB: Set<T>): number {
        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);
        if (union.size === 0) return 1; // Both empty, considered 100% similar
        return intersection.size / union.size;
    }
}

// --- Threat Intelligence Module (Sub-component of AIGovernanceEngine) ---

/**
 * Enumerates known categories of security threats or attack vectors.
 */
export enum ThreatVector {
    SQL_INJECTION = 'SQL Injection',
    XSS = 'Cross-Site Scripting',
    BROKEN_AUTH = 'Broken Authentication',
    DATA_EXPOSURE = 'Sensitive Data Exposure',
    SSRF = 'Server-Side Request Forgery',
    RATE_LIMITING_BYPASS = 'Rate Limiting Bypass',
    API_ABUSE = 'API Abuse',
    DDOS = 'Distributed Denial of Service',
    ZERO_DAY = 'Zero-Day Exploit',
    MALWARE_INJECTION = 'Malware Injection',
    CREDENTIAL_STUFFING = 'Credential Stuffing',
    SUPPLY_CHAIN_ATTACK = 'Supply Chain Attack',
    QUANTUM_DECRYPTION_RISK = 'Quantum Decryption Risk'
}

/**
 * Represents a security threat assessment for an API key or related system.
 * Business Value: This structure provides a standardized, actionable view of current and
 * emerging security risks. By clearly articulating threat vectors, risk scores, and mitigation
 * steps, it empowers security teams to prioritize responses, allocate resources effectively,
 * and minimize the window of vulnerability, directly protecting enterprise assets and
 * reputation from costly cyberattacks.
 */
export interface ThreatAssessment {
    keyId: string;
    threatVector: ThreatVector;
    riskScore: number; // 0-100, higher is more critical.
    potentialImpact: string;
    mitigationSteps: string[];
    lastAnalyzed: string; // ISO 8601 timestamp.
    detectedSignatures: string[]; // Specific patterns that triggered the detection.
    threatIntelligenceSource: string; // Source of the threat information.
}

/**
 * Manages global threat intelligence feeds and performs simulated threat assessments.
 * Business Value: This module acts as the digital immune system, continuously scanning
 * for and integrating external threat intelligence with internal system behaviors.
 * Its ability to proactively identify and assess threats, including emerging quantum risks,
 * provides unparalleled defense, reducing the likelihood of successful attacks and
 * securing critical financial operations worth billions.
 */
export class ThreatIntelligenceModule {
    private knownSignatures: Map<ThreatVector, string[]> = new Map();
    private globalThreatFeed: string[] = []; // Simulated real-time threat data.
    private recentAlerts: ThreatAssessment[] = [];

    /**
     * Constructs a new ThreatIntelligenceModule, initializing with mock data.
     */
    constructor() {
        this.knownSignatures.set(ThreatVector.SQL_INJECTION, ["'", "OR 1=1", "UNION SELECT", "DROP TABLE"]);
        this.knownSignatures.set(ThreatVector.XSS, ["<script>", "onload=", "onerror=", "data:text/html"]);
        this.knownSignatures.set(ThreatVector.RATE_LIMITING_BYPASS, ["X-Bypass-RateLimit: true", "burst_req=true", "delay=0", "concurrent_session"]);
        this.knownSignatures.set(ThreatVector.CREDENTIAL_STUFFING, ["failed_login_burst", "user_enum_attempt"]);
        this.knownSignatures.set(ThreatVector.QUANTUM_DECRYPTION_RISK, ["rsa-2048", "ecc-p256", "quantum_vulnerable_alg"]);
        this.globalThreatFeed = [
            "2023-10-26 - New RCE vulnerability identified in `omniauth-core` v2.3.1. Patch immediately.",
            "2023-10-26 - Phishing campaign targeting financial API users via deceptive SMS messages. Warn users.",
            "2023-10-25 - DDoS attack vector observed leveraging new HTTP/3 amplification techniques. Monitor traffic spikes.",
            "2023-10-24 - New variant of credential stuffing tools detected on dark web forums. Update login protections.",
            "2023-10-23 - Potential quantum decryption risk alert: Advances in Shor's algorithm for RSA-4096. Review PQC migration plans."
        ];
        console.log("ThreatIntelligenceModule: Initializing with global threat vectors and signatures.");
    }

    /**
     * Simulates the analysis of traffic patterns or request content for known threat signatures.
     * @param entityId The ID of the entity associated with the traffic/data.
     * @param entityType The type of entity (e.g., 'apiKey', 'system').
     * @param requestPattern A simulated request string or traffic pattern.
     * @returns A promise resolving to a ThreatAssessment if a threat is detected, otherwise null.
     */
    private async simulateTrafficAnalysis(entityId: string, entityType: 'apiKey' | 'system' | 'data', requestPattern: string): Promise<ThreatAssessment | null> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(50, 200))); // Simulate processing delay.

        // Check for SQL Injection signatures
        if (this.knownSignatures.get(ThreatVector.SQL_INJECTION)?.some(sig => requestPattern.includes(sig))) {
            return {
                keyId: entityId,
                threatVector: ThreatVector.SQL_INJECTION,
                riskScore: 90 + RandomDataGenerator.randomNumber(0, 5), // Slight variation
                potentialImpact: "Database compromise, sensitive data exfiltration, system integrity breach.",
                mitigationSteps: ["Implement parameterized queries", "Apply strong input validation and sanitization", "Configure Web Application Firewall (WAF) rules."],
                lastAnalyzed: new Date().toISOString(),
                detectedSignatures: this.knownSignatures.get(ThreatVector.SQL_INJECTION)?.filter(sig => requestPattern.includes(sig)) || [],
                threatIntelligenceSource: 'Internal Pattern Matching Engine',
            };
        }

        // Check for XSS signatures
        if (this.knownSignatures.get(ThreatVector.XSS)?.some(sig => requestPattern.includes(sig))) {
            return {
                keyId: entityId,
                threatVector: ThreatVector.XSS,
                riskScore: 85 + RandomDataGenerator.randomNumber(0, 5),
                potentialImpact: "Client-side attacks, session hijacking, data theft via browser.",
                mitigationSteps: ["Enforce strict output encoding for all user-supplied data", "Implement a robust Content Security Policy (CSP)", "Sanitize HTML inputs."],
                lastAnalyzed: new Date().toISOString(),
                detectedSignatures: this.knownSignatures.get(ThreatVector.XSS)?.filter(sig => requestPattern.includes(sig)) || [],
                threatIntelligenceSource: 'Internal Scripting Analysis Module',
            };
        }

        // Simulate detection of Quantum Decryption Risk based on algorithm identifiers
        if (entityType === 'data' && this.knownSignatures.get(ThreatVector.QUANTUM_DECRYPTION_RISK)?.some(sig => requestPattern.toLowerCase().includes(sig))) {
            return {
                keyId: entityId, // Can map to data ID or system ID
                threatVector: ThreatVector.QUANTUM_DECRYPTION_RISK,
                riskScore: 95, // High risk
                potentialImpact: "Future decryption of sensitive data by quantum computers, leading to data exposure and regulatory non-compliance.",
                mitigationSteps: ["Initiate Post-Quantum Cryptography (PQC) migration strategy", "Encrypt data with hybrid PQC algorithms", "Review data retention policies for quantum-vulnerable data."],
                lastAnalyzed: new Date().toISOString(),
                detectedSignatures: this.knownSignatures.get(ThreatVector.QUANTUM_DECRYPTION_RISK)?.filter(sig => requestPattern.toLowerCase().includes(sig)) || [],
                threatIntelligenceSource: 'Quantum Risk Assessment Engine',
            };
        }

        // Simulate random detection of other threats based on complex patterns
        if (RandomDataGenerator.randomBoolean() && RandomDataGenerator.randomNumber(1, 100) > 85) { // 15% chance for a random detection
            const randomThreat = RandomDataGenerator.selectRandom(Object.values(ThreatVector).filter(t => t !== ThreatVector.SQL_INJECTION && t !== ThreatVector.XSS && t !== ThreatVector.QUANTUM_DECRYPTION_RISK));
            return {
                keyId: entityId,
                threatVector: randomThreat,
                riskScore: RandomDataGenerator.randomNumber(50, 95),
                potentialImpact: RandomDataGenerator.randomSentence(7),
                mitigationSteps: [RandomDataGenerator.randomSentence(3), RandomDataGenerator.randomSentence(4), RandomDataGenerator.randomSentence(5)],
                lastAnalyzed: new Date().toISOString(),
                detectedSignatures: [`Simulated pattern for ${randomThreat.toLowerCase().replace(/ /g, '_')}`],
                threatIntelligenceSource: 'Generative Anomaly Detector',
            };
        }
        return null;
    }

    /**
     * Assesses a given API key for potential threats based on recent request patterns.
     * @param apiKey The API key metadata.
     * @param recentRequests An array of simulated recent request strings.
     * @returns A promise resolving to an array of ThreatAssessment objects.
     */
    public async assessApiKeyThreats(apiKey: ApiKeyMeta, recentRequests: string[]): Promise<ThreatAssessment[]> {
        console.log(`ThreatIntelligenceModule: Initiating advanced threat assessment for key '${apiKey.name}' (ID: ${apiKey.id}).`);
        const assessments: ThreatAssessment[] = [];
        for (const req of recentRequests) {
            const assessment = await this.simulateTrafficAnalysis(apiKey.id, 'apiKey', req);
            if (assessment) {
                assessments.push(assessment);
            }
        }

        // Simulate threat from global feed relevance, especially for enterprise or critical keys
        if (apiKey.usageTier === 'enterprise' || apiKey.scopes.includes(KeyScope.FULL_ACCESS) || apiKey.scopes.includes(KeyScope.QUANTUM_SECURE_VAULT)) {
            const relevantGlobalThreats = this.globalThreatFeed.filter(feed =>
                feed.includes('RCE') || feed.includes('DDoS') || feed.includes('quantum decryption') || feed.includes('Supply Chain')
            );
            if (relevantGlobalThreats.length > 0 && RandomDataGenerator.randomBoolean()) {
                assessments.push({
                    keyId: apiKey.id,
                    threatVector: RandomDataGenerator.selectRandom([ThreatVector.DDOS, ThreatVector.ZERO_DAY, ThreatVector.QUANTUM_DECRYPTION_RISK, ThreatVector.SUPPLY_CHAIN_ATTACK]),
                    riskScore: RandomDataGenerator.randomNumber(70, 99),
                    potentialImpact: `Elevated threat due to global threat intelligence feed. Relevant to critical infrastructure or quantum protocols.`,
                    mitigationSteps: [`Review system patches`, `Enhance network monitoring for specific attack vectors`, `Geo-blocking suspicious IPs`, `Accelerate PQC migration planning.`],
                    lastAnalyzed: new Date().toISOString(),
                    detectedSignatures: relevantGlobalThreats,
                    threatIntelligenceSource: 'Global Threat Feed Correlation',
                });
            }
        }
        this.recentAlerts.push(...assessments);
        return assessments;
    }

    /**
     * Assesses a data entity for quantum decryption risk based on its configuration.
     * @param dataId The ID of the data entity.
     * @param quantumConfig The QuantumSecureVaultConfig associated with the data.
     * @returns A promise resolving to a QuantumRiskAssessment.
     */
    public async assessQuantumRisk(dataId: string, quantumConfig: QuantumSecureVaultConfig): Promise<QuantumRiskAssessment> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(100, 250)));
        console.log(`ThreatIntelligenceModule: Performing quantum risk assessment for data entity '${dataId}'.`);

        let vulnerabilityScore = 0;
        let estimatedTimeToBreak: QuantumRiskAssessment['estimatedTimeToBreak'] = '10+ years';
        let recommendations: string[] = [];
        let isQuantumSecure = true;

        if (quantumConfig.encryptionAlgorithm.toLowerCase().includes('rsa') && parseInt(quantumConfig.encryptionAlgorithm.split('-')[1] || '0') < 4096) {
            vulnerabilityScore += 40;
            estimatedTimeToBreak = '1-5 years';
            recommendations.push("Upgrade RSA key length to at least 4096-bit or migrate to a quantum-resistant algorithm.");
            isQuantumSecure = false;
        }
        if (quantumConfig.encryptionAlgorithm.toLowerCase().includes('ecc') && parseInt(quantumConfig.encryptionAlgorithm.split('-')[1]?.substring(1) || '0') < 384) {
            vulnerabilityScore += 30;
            if (estimatedTimeToBreak !== '1-5 years') estimatedTimeToBreak = '5-10 years';
            recommendations.push("Upgrade ECC curve size to at least P-384 or migrate to a quantum-resistant algorithm.");
            isQuantumSecure = false;
        }

        if (!quantumConfig.isPostQuantumReady) {
            vulnerabilityScore += 50;
            estimatedTimeToBreak = '1-5 years'; // Assume higher risk if not explicitly PQC ready
            recommendations.push("Implement a certified Post-Quantum Cryptography (PQC) solution for this data.");
            isQuantumSecure = false;
        }

        if (vulnerabilityScore === 0) { // If no specific vulnerabilities detected
            vulnerabilityScore = RandomDataGenerator.randomNumber(5, 20); // Small background risk
        }

        if (isQuantumSecure && RandomDataGenerator.randomBoolean() && RandomDataGenerator.randomNumber(1, 100) > 90) { // Simulate small chance of quantum risk even for PQC
            vulnerabilityScore += 10;
            recommendations.push("Although PQC ready, continuous monitoring for new quantum algorithm breakthroughs is advised.");
        }


        const assessment: QuantumRiskAssessment = {
            entityId: dataId,
            entityType: 'data',
            algorithmUsed: quantumConfig.encryptionAlgorithm,
            currentSecurityStrength: quantumConfig.securityStrengthBits,
            quantumVulnerabilityScore: Math.min(100, vulnerabilityScore),
            estimatedTimeToBreak: estimatedTimeToBreak,
            recommendations: Array.from(new Set(recommendations)), // Remove duplicates
            lastAssessed: new Date().toISOString(),
            isQuantumSecure: isQuantumSecure,
        };
        console.log(`ThreatIntelligenceModule: Quantum risk assessment for '${dataId}' complete. Score: ${assessment.quantumVulnerabilityScore}, Secure: ${assessment.isQuantumSecure}.`);
        return assessment;
    }

    /**
     * Fetches updates from the simulated global threat feed, optionally filtered by category.
     * @param category An optional category string to filter the threat feed (e.g., 'DDoS', 'RCE').
     * @returns A promise resolving to an array of recent threat feed entries.
     */
    public async getThreatFeedUpdates(category?: string): Promise<string[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(100, 300)));
        let filteredFeed = this.globalThreatFeed;
        if (category) {
            filteredFeed = filteredFeed.filter(f => f.toLowerCase().includes(category.toLowerCase()));
        }
        return filteredFeed.map(f => `${new Date().toISOString().substring(0, 10)} - ${f}`);
    }

    /**
     * Submits a new threat signature to the module for future detection.
     * @param signature The new pattern or string to recognize as a threat.
     * @param vector The associated ThreatVector category.
     * @returns A promise resolving to true if the signature was added, false if it already exists.
     */
    public async submitNewThreatSignature(signature: string, vector: ThreatVector): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(50, 150)));
        const existingSignatures = this.knownSignatures.get(vector) || [];
        if (!existingSignatures.includes(signature)) {
            existingSignatures.push(signature);
            this.knownSignatures.set(vector, existingSignatures);
            console.log(`ThreatIntelligenceModule: New signature '${signature}' added for ${vector}.`);
            return true;
        }
        console.log(`ThreatIntelligenceModule: Signature '${signature}' for ${vector} already exists.`);
        return false;
    }

    /**
     * Retrieves recent threat alerts generated by this module.
     * @param count The maximum number of alerts to retrieve.
     * @returns A promise resolving to an array of recent ThreatAssessment alerts.
     */
    public async getRecentThreatAlerts(count: number = 5): Promise<ThreatAssessment[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(20, 80)));
        return this.recentAlerts.slice(-count);
    }
}

// --- AI Adaptive Response Module (Sub-component of AIGovernanceEngine) ---

/**
 * Defines a historical record of an incident and the adaptive responses taken.
 * Business Value: Serves as the memory for the AI's response system, capturing every
 * anomaly, action taken, and resolution. This detailed logging enables continuous
 * learning, system auditing, and post-incident analysis, transforming reactive
 * security into a proactive, intelligent defense mechanism that improves over time,
 * saving millions in incident response costs.
 */
export interface IncidentLogEntry {
    incidentId: string;
    anomalyDetected: AnomalyDetectionResult;
    responseActionsTaken: string[];
    timestamp: string; // ISO 8601 timestamp.
    status: 'open' | 'closed' | 'monitoring' | 'remediated';
    resolutionNotes?: string;
    actionOutcomes: { action: string; success: boolean; details: string; timestamp: string }[];
}

/**
 * Manages automated or semi-automated responses to detected anomalies and threats.
 * Implements adaptive strategies based on incident history and threat context.
 * Business Value: This module is the operational arm of the AI Governance Engine,
 * automatically executing predefined or AI-generated remediation actions. By providing
 * real-time, adaptive responses to threats and anomalies, it minimizes human intervention,
 * reduces the mean time to detect and respond (MTTD/MTTR), and prevents minor incidents
 * from escalating into catastrophic failures, leading to massive cost savings and
 * enhanced system resilience.
 */
export class AIAdaptiveResponseModule {
    private responseStrategies: Map<string, string[]> = new Map(); // anomalyType_severity -> [actions]
    private incidentHistory: IncidentLogEntry[] = [];
    private policyUpdateQueue: { policyId: string; updates: Partial<SecurityPolicy>; timestamp: string }[] = [];
    private knownRemediations: Map<string, string[]> = new Map(); // Store successful remediations for learning

    /**
     * Constructs a new AIAdaptiveResponseModule, initializing with default response strategies.
     */
    constructor() {
        this.responseStrategies.set('high_usage_spike', ['Initiate temporary rate limit adjustment', 'Notify key owner and relevant stakeholders', 'Trigger deep packet inspection and forensic analysis']);
        this.responseStrategies.set('critical_geo_deviation', ['Immediately suspend API key access', 'Alert security operations center', 'Mandate MFA re-authentication for the associated user', 'Block IP range temporarily']);
        this.responseStrategies.set('medium_scope_misuse', ['Flag key for manual security review', 'Recommend scope reduction or removal of sensitive permissions', 'Increase audit logging verbosity for key']);
        this.responseStrategies.set('low_config_drift', ['Suggest configuration review to align with best practices', 'Log for periodic check']);
        this.responseStrategies.set('critical_credential_leak', ['Force password reset for affected user', 'Revoke all associated API keys', 'Isolate user account for investigation', 'Notify external identity providers']);
        this.responseStrategies.set('critical_quantum_risk_escalation', ['Force data re-encryption with PQC algorithm', 'Rotate affected keys with quantum-secure keys', 'Alert compliance and security teams for PQC readiness review']);

        console.log("AIAdaptiveResponseModule: Initialized with core adaptive response strategies.");
    }

    /**
     * Determines the most appropriate response actions for a given anomaly.
     * @param anomaly The detected AnomalyDetectionResult.
     * @returns An array of recommended response actions.
     */
    private getRecommendedResponse(anomaly: AnomalyDetectionResult): string[] {
        // More sophisticated mapping, prioritize critical responses
        let strategyKey = `${anomaly.severity}_${anomaly.anomalyType}`;

        // Consolidate similar anomaly types for consistent responses
        if (anomaly.anomalyType === 'usage_spike' && (anomaly.severity === 'high' || anomaly.severity === 'critical')) {
            strategyKey = 'high_usage_spike';
        } else if (anomaly.anomalyType === 'geo_deviation' && (anomaly.severity === 'high' || anomaly.severity === 'critical')) {
            strategyKey = 'critical_geo_deviation';
        } else if (anomaly.anomalyType === 'scope_misuse' && anomaly.severity === 'medium') {
            strategyKey = 'medium_scope_misuse';
        } else if (anomaly.anomalyType === 'credential_leak' && anomaly.severity === 'critical') {
            strategyKey = 'critical_credential_leak';
        } else if (anomaly.anomalyType === 'config_drift' && anomaly.severity === 'low') {
            strategyKey = 'low_config_drift';
        } else if (anomaly.anomalyType === 'quantum_risk_escalation' && anomaly.severity === 'critical') {
            strategyKey = 'critical_quantum_risk_escalation';
        }


        const actions = this.responseStrategies.get(strategyKey);
        if (actions) {
            console.log(`AIAdaptiveResponseModule: Applying strategy '${strategyKey}' for anomaly '${anomaly.anomalyId}'.`);
            return actions;
        }

        // Fallback for unhandled anomalies
        console.warn(`AIAdaptiveResponseModule: No specific strategy found for anomaly type '${anomaly.anomalyType}' with severity '${anomaly.severity}'. Using generic response.`);
        return [`Generic response for ${anomaly.severity} ${anomaly.anomalyType}: Review and mitigate manually. Incident ID: ${anomaly.anomalyId}.`];
    }

    /**
     * Executes a given action and simulates its outcome.
     * @param action The action string to execute.
     * @param entityId The ID of the entity the action is for.
     * @returns A promise resolving to the outcome details.
     */
    private async executeAction(action: string, entityId: string): Promise<{ success: boolean; details: string }> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(100, 500))); // Simulate varying action execution time

        let success = RandomDataGenerator.randomBoolean();
        let details = `Simulated execution of action: '${action}'.`;

        if (action.includes('suspend API key')) {
            success = RandomDataGenerator.randomNumber(1, 100) > 10; // 90% success rate
            details = success ? `API key '${entityId}' successfully suspended.` : `Failed to suspend key '${entityId}', manual intervention needed.`;
        } else if (action.includes('force password reset')) {
            success = RandomDataGenerator.randomNumber(1, 100) > 5; // 95% success rate
            details = success ? `Password reset forced for user '${entityId}'.` : `Failed to force password reset, review user directory sync.`;
        } else if (action.includes('Initiate temporary rate limit adjustment')) {
            success = RandomDataGenerator.randomNumber(1, 100) > 5;
            details = success ? `Temporary rate limit applied to key '${entityId}'.` : `Rate limit adjustment failed for key '${entityId}'.`;
        } else if (action.includes('Force data re-encryption with PQC algorithm')) {
            success = RandomDataGenerator.randomNumber(1, 100) > 15; // Lower success rate for complex PQC migration
            details = success ? `Data re-encryption with PQC initiated for '${entityId}'.` : `PQC re-encryption failed for '${entityId}', fallback to manual review.`;
        } else if (action.includes('Rotate affected keys with quantum-secure keys')) {
            success = RandomDataGenerator.randomNumber(1, 100) > 10;
            details = success ? `Quantum-secure key rotation initiated for '${entityId}'.` : `Quantum-secure key rotation failed for '${entityId}'.`;
        } else if (action.includes('Block IP range')) {
            success = RandomDataGenerator.randomNumber(1, 100) > 8;
            details = success ? `IP range blocked for entity '${entityId}'.` : `Failed to block IP range for '${entityId}'.`;
        }
        return { success, details };
    }


    /**
     * Analyzes a detected anomaly and logs an incident, returning recommended response actions.
     * @param anomaly The detected AnomalyDetectionResult.
     * @returns A promise resolving to an object containing response actions and the new incident ID.
     */
    public async analyzeAndRespond(anomaly: AnomalyDetectionResult): Promise<{ responseActions: string[], incidentId: string }> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(100, 300)));
        console.log(`AIAdaptiveResponseModule: Analyzing anomaly '${anomaly.anomalyId}' for adaptive response mechanisms.`);

        const responseActions = this.getRecommendedResponse(anomaly);
        const incidentId = `inc_${RandomDataGenerator.uuid().substring(0, 8)}`;
        const actionOutcomes: IncidentLogEntry['actionOutcomes'] = [];

        for (const action of responseActions) {
            const outcome = await this.executeAction(action, anomaly.entityId);
            actionOutcomes.push({
                action: action,
                success: outcome.success,
                details: outcome.details,
                timestamp: new Date().toISOString()
            });
            if (!outcome.success && RandomDataGenerator.randomBoolean()) { // Sometimes, if an action fails, queue a policy update
                await this.queuePolicyUpdate(anomaly.entityId, {
                    name: `Emergency Policy for ${anomaly.entityId}`,
                    rules: { rateLimitPolicy: 'custom', dailyRequestLimit: 1000 }
                });
            }
        }

        const incidentStatus = actionOutcomes.every(a => a.success) ? 'remediated' : 'monitoring';

        this.incidentHistory.push({
            incidentId: incidentId,
            anomalyDetected: anomaly,
            responseActionsTaken: responseActions,
            timestamp: new Date().toISOString(),
            status: incidentStatus,
            resolutionNotes: incidentStatus === 'remediated' ? 'Automated remediation actions successfully applied.' : 'Automated actions taken, further monitoring required.',
            actionOutcomes: actionOutcomes,
        });

        if (incidentStatus === 'remediated') {
            this.knownRemediations.set(anomaly.anomalyType, [...(this.knownRemediations.get(anomaly.anomalyType) || []), ...responseActions]);
            console.log(`AIAdaptiveResponseModule: Incident ${incidentId} successfully remediated. Actions: ${responseActions.join(' | ')}.`);
        } else {
            console.log(`AIAdaptiveResponseModule: Incident ${incidentId} logged. Status: ${incidentStatus}. Recommended actions: ${responseActions.join(' | ')}.`);
        }

        return { responseActions, incidentId };
    }

    /**
     * Retrieves the history of incidents logged by this module.
     * @param entityId Optional. Filters incident history by an entity ID (e.g., API key ID, user ID).
     * @param status Optional. Filters incident history by status ('open', 'closed', 'monitoring', 'remediated').
     * @returns A promise resolving to an array of IncidentLogEntry objects.
     */
    public async getIncidentHistory(entityId?: string, status?: 'open' | 'closed' | 'monitoring' | 'remediated'): Promise<IncidentLogEntry[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(50, 150)));
        let filteredHistory = [...this.incidentHistory]; // Return a copy

        if (entityId) {
            filteredHistory = filteredHistory.filter(inc => inc.anomalyDetected.entityId === entityId);
        }
        if (status) {
            filteredHistory = filteredHistory.filter(inc => inc.status === status);
        }
        console.log(`AIAdaptiveResponseModule: Retrieved ${filteredHistory.length} incident entries.`);
        return filteredHistory;
    }

    /**
     * Updates an existing response strategy or adds a new one.
     * @param strategyKey The key identifying the strategy (e.g., 'high_usage_spike').
     * @param actions An array of new response actions for this strategy.
     * @returns A promise resolving to true if the strategy was updated/added.
     */
    public async updateStrategy(strategyKey: string, actions: string[]): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(50, 150)));
        this.responseStrategies.set(strategyKey, actions);
        console.log(`AIAdaptiveResponseModule: Strategy '${strategyKey}' updated with ${actions.length} actions.`);
        return true;
    }

    /**
     * Simulates the AI pushing a policy update to a queue for human review or automated application.
     * @param policyId The ID of the policy to update.
     * @param updates The partial updates to apply to the policy.
     * @returns A promise resolving when the update is queued.
     */
    public async queuePolicyUpdate(policyId: string, updates: Partial<SecurityPolicy>): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(30, 80)));
        this.policyUpdateQueue.push({ policyId, updates, timestamp: new Date().toISOString() });
        console.log(`AIAdaptiveResponseModule: Queued policy update for '${policyId}'.`);
    }

    /**
     * Processes the next policy update from the queue.
     * In a real system, this would interact with a policy management service.
     * @returns A promise resolving to the processed update, or null if the queue is empty.
     */
    public async processNextPolicyUpdate(): Promise<typeof this.policyUpdateQueue[0] | null> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(80, 200)));
        if (this.policyUpdateQueue.length > 0) {
            const nextUpdate = this.policyUpdateQueue.shift();
            console.log(`AIAdaptiveResponseModule: Processed policy update for '${nextUpdate?.policyId}'.`);
            return nextUpdate || null;
        }
        console.log("AIAdaptiveResponseModule: Policy update queue is empty.");
        return null;
    }

    /**
     * Provides insights into successful remediation patterns, informing future automated responses.
     * @returns A promise resolving to a map of anomaly types to successful remediation actions.
     */
    public async getRemediationInsights(): Promise<Map<string, string[]>> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(30, 80)));
        console.log("AIAdaptiveResponseModule: Generating insights from successful remediations.");
        return new Map(this.knownRemediations);
    }
}

// --- Main AI Governance Engine Service ---

/**
 * The AIGovernanceEngine provides advanced AI-driven capabilities for security, compliance,
 * and operational intelligence across the OmniBank Global platform. It integrates predictive
 * analytics, anomaly detection, automated compliance checks, and adaptive response systems.
 * This service acts as the core "brain" for intelligent risk management, safeguarding
 * the multi-billion dollar financial ecosystem. It continuously monitors, learns, and adapts,
 * enabling proactive threat mitigation, ensuring regulatory adherence, and optimizing
 * operational costs, thereby delivering unparalleled system reliability and security.
 */
export class AIGovernanceEngine {
    private historicalBaselines: Map<string, HistoricalBaseline> = new Map(); // Stores keyId -> baseline
    private behavioralProfiles: Map<string, BehavioralProfile> = new Map(); // Stores actorId -> profile
    private complianceScanLog: ComplianceReportEntry[] = [];
    private internalPolicyCache: Map<string, SecurityPolicy> = new Map(); // Cached policies for quick reference
    private recommendationQueue: AIRecommendation[] = []; // Queue for generated AI recommendations

    private threatIntelligence: ThreatIntelligenceModule; // Instance of the Threat Intelligence Module
    private adaptiveResponse: AIAdaptiveResponseModule;   // Instance of the AI Adaptive Response Module

    public static readonly QUANTUM_STABILITY_THRESHOLD: number = 0.85; // Static constant for quantum security assessment.
    public static readonly COMPLIANCE_SCORE_CRITICAL_THRESHOLD: number = 40; // Score below this is critical.
    public static readonly ANOMALY_CONFIDENCE_THRESHOLD_ALERT: number = 0.7; // Confidence above this triggers alert.

    /**
     * Initializes the AIGovernanceEngine, setting up its internal modules and mock data.
     */
    constructor() {
        console.log("AIGovernanceEngine: Initiating sentient threat intelligence protocols and quantum-secure analytics...");
        this.initializeMockData();
        this.threatIntelligence = new ThreatIntelligenceModule();
        this.adaptiveResponse = new AIAdaptiveResponseModule();
    }

    /**
     * Populates the engine with simulated historical baselines and behavioral profiles.
     * This method mimics loading complex historical data from persistent storage.
     */
    private async initializeMockData(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200 + RandomDataGenerator.randomNumber(0, 100)));
        console.log("AIGovernanceEngine: Loading vast historical data reservoirs and behavioral pattern libraries...");

        // Generate mock baselines for several keys
        for (let i = 0; i < 10; i++) { // Increase number of mocks
            const keyId = `key_${RandomDataGenerator.uuid().substring(0, 8)}`;
            const baseline: HistoricalBaseline = {
                keyId: keyId,
                metricType: RandomDataGenerator.selectRandom(['requests', 'data_transfer', 'geo_distribution', 'failed_requests', 'latency']),
                dailyAverage: RandomDataGenerator.randomNumber(1000, 150000),
                dailyStdDev: RandomDataGenerator.randomNumber(100, 15000),
                peakHourAverage: {
                    '00': RandomDataGenerator.randomNumber(50, 500), '01': RandomDataGenerator.randomNumber(50, 400),
                    '09': RandomDataGenerator.randomNumber(1000, 10000), '10': RandomDataGenerator.randomNumber(1200, 12000),
                    '14': RandomDataGenerator.randomNumber(800, 8000), '15': RandomDataGenerator.randomNumber(900, 9000),
                    '20': RandomDataGenerator.randomNumber(600, 6000), '21': RandomDataGenerator.randomNumber(500, 5000),
                },
                recentActivityVector: Array.from({ length: 30 }, () => RandomDataGenerator.randomNumber(500, 20000)), // Last 30 days of data
                lastRecalibrated: RandomDataGenerator.randomDate(new Date(Date.now() - 86400000 * 90), new Date()),
                dataPointsCount: RandomDataGenerator.randomNumber(300, 5000),
            };
            this.historicalBaselines.set(keyId, baseline);
            this.internalPolicyCache.set(`pol_${keyId.substring(4, 8)}`, { // Mock a policy for each key
                id: `pol_${keyId.substring(4, 8)}`,
                name: `Policy for ${keyId}`,
                description: RandomDataGenerator.randomSentence(6),
                isActive: RandomDataGenerator.randomBoolean(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rules: {
                    maxKeysPerUser: 5,
                    keyLifespanDays: RandomDataGenerator.selectRandom([90, 180, null]),
                    enforceMFAForActions: RandomDataGenerator.randomBoolean() ? [KeyScope.API_KEY_MANAGE, KeyScope.TRANSACTION_APPROVE] : [],
                    rateLimitPolicy: RandomDataGenerator.selectRandom(['default', 'custom', 'none']),
                    geoFencing: RandomDataGenerator.selectRandom(['none', 'whitelist', 'blacklist']),
                    allowedRegions: RandomDataGenerator.selectRandom([['US', 'EU'], ['US'], []]),
                    dailyRequestLimit: RandomDataGenerator.selectRandom([1000000, 5000000, null]),
                }
            });
        }

        // Generate mock behavioral profiles for several actors
        for (let i = 0; i < 7; i++) { // Increase number of mocks
            const actorId = `user_${RandomDataGenerator.uuid().substring(0, 6)}`;
            const profile: BehavioralProfile = {
                actorId: actorId,
                commonActions: RandomDataGenerator.randomBoolean() ? [KeyScope.API_KEY_MANAGE, KeyScope.USER_MANAGE, KeyScope.READ_ONLY] : [KeyScope.READ_ONLY, KeyScope.TRANSACTION_INITIATE, KeyScope.AI_ANALYTICS_VIEW],
                typicalIPRanges: [`192.168.${RandomDataGenerator.randomNumber(1, 255)}.0/24`, `10.${RandomDataGenerator.randomNumber(0, 255)}.0.0/16`, `172.16.${RandomDataGenerator.randomNumber(0, 31)}.0/20`, RandomDataGenerator.randomIpAddress()],
                typicalUserAgents: ['Chrome/latest', 'Firefox/latest', 'MobileApp/v2', 'Curl/7.8', 'CustomBot/1.0', RandomDataGenerator.randomUserAgent()],
                activityFrequency: RandomDataGenerator.selectRandom(['low', 'medium', 'high', 'bursty']),
                trustScoreModifier: RandomDataGenerator.randomFloat(-0.3, 0.6, 2),
                lastProfiled: RandomDataGenerator.randomDate(new Date(Date.now() - 86400000 * 60), new Date()),
                riskFactors: RandomDataGenerator.randomBoolean() ? ['high-privileged-role', 'remote-access-frequent', 'new-market-exposure'] : ['standard-privilege', 'limited-activity'],
            };
            this.behavioralProfiles.set(actorId, profile);
        }
        console.log(`AIGovernanceEngine: Successfully loaded ${this.historicalBaselines.size} baselines, ${this.behavioralProfiles.size} profiles, and ${this.internalPolicyCache.size} cached policies.`);
    }

    // --- Predictive Policy Evaluation ---

    /**
     * Evaluates a given API key against a specific security policy.
     * This is a core function for determining compliance and suggesting policy-driven improvements.
     * Business Value: Automates continuous compliance monitoring, reducing the need for costly
     * and error-prone manual audits. By providing immediate feedback on policy adherence, it
     * minimizes regulatory exposure, prevents costly fines, and ensures that all API interactions
     * meet stringent security and governance standards, translating to millions in risk avoidance.
     * @param apiKey The {@link ApiKeyMeta} object representing the API key to evaluate.
     * @param policy The {@link SecurityPolicy} to apply during evaluation.
     * @returns A promise resolving to a {@link PolicyEvaluationResult} object.
     */
    public async evaluatePolicyCompliance(apiKey: ApiKeyMeta, policy: SecurityPolicy): Promise<PolicyEvaluationResult> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(100, 300)));
        console.log(`AIGovernanceEngine: Initiating granular evaluation of key '${apiKey.name}' (ID: ${apiKey.id}) against policy '${policy.name}' (ID: ${policy.id}).`);

        const violations: string[] = [];
        const recommendations: string[] = [];
        let score = 100; // Start with perfect score, penalize for non-compliance.
        let remediationEffort: PolicyEvaluationResult['remediationEffortEstimate'] = 'low';

        // Rule 1: Key Lifespan Enforcement
        if (policy.rules.keyLifespanDays !== null && policy.rules.keyLifespanDays > 0) {
            const createdAt = new Date(apiKey.createdAt);
            const now = new Date();
            const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (ageDays > policy.rules.keyLifespanDays) {
                violations.push(`Key '${apiKey.name}' has exceeded maximum allowed lifespan of ${policy.rules.keyLifespanDays} days.`);
                recommendations.push(`Immediate rotation or revocation of key '${apiKey.name}' is required.`);
                score -= 30; // High penalty for critical violation
                remediationEffort = 'critical';
            } else if (ageDays > policy.rules.keyLifespanDays * 0.8) {
                recommendations.push(`Key '${apiKey.name}' is approaching its maximum lifespan (${policy.rules.keyLifespanDays} days). Plan for rotation.`);
                score -= 10;
                if (remediationEffort !== 'critical') remediationEffort = 'medium';
            }
        }

        // Rule 2: Enforce MFA for specific sensitive scopes
        const mfaProtectedScopes = new Set(policy.rules.enforceMFAForActions);
        const keyScopes = new Set(apiKey.scopes);
        const hasSensitiveScopes = [...keyScopes].some(scope => mfaProtectedScopes.has(scope));
        // Simulate checking actual user MFA status (in a real system, this would come from user context)
        const mockUserHasMFA = RandomDataGenerator.randomBoolean(); // For demo, assume random MFA status
        if (hasSensitiveScopes && !mockUserHasMFA) {
            violations.push(`Associated user lacks MFA for key '${apiKey.name}' which grants access to MFA-protected scopes.`);
            recommendations.push(`Ensure user '${apiKey.createdBy}' has MFA enabled and configured for critical actions.`);
            score -= 25;
            if (remediationEffort !== 'critical') remediationEffort = 'high';
        }

        // Rule 3: Geo-fencing compliance
        if (policy.rules.geoFencing === 'whitelist' && policy.rules.allowedRegions.length > 0) {
            // Simulate last usage location or infer from audit logs
            const lastUsedRegion = RandomDataGenerator.selectRandom(['US', 'EU', 'AS', 'CN', 'BR', 'CA', 'JP', 'IN']);
            if (!policy.rules.allowedRegions.includes(lastUsedRegion)) {
                violations.push(`Key '${apiKey.name}' was last observed operating from an unapproved region: ${lastUsedRegion}.`);
                recommendations.push(`Review recent audit logs for '${apiKey.name}'. Consider updating geo-fencing policy or investigating unauthorized access.`);
                score -= 20;
                if (remediationEffort === 'low' || remediationEffort === 'medium') remediationEffort = 'high';
            }
        } else if (policy.rules.geoFencing === 'blacklist' && policy.rules.allowedRegions.length > 0) {
            const lastUsedRegion = RandomDataGenerator.selectRandom(['US', 'EU', 'AS', 'CN', 'BR', 'CA', 'JP', 'IN']);
            if (policy.rules.allowedRegions.includes(lastUsedRegion)) {
                violations.push(`Key '${apiKey.name}' was last observed operating from a blacklisted region: ${lastUsedRegion}.`);
                recommendations.push(`Immediate investigation into key usage from '${lastUsedRegion}'.`);
                score -= 25;
                if (remediationEffort !== 'critical') remediationEffort = 'high';
            }
        }


        // Rule 4: Principle of Least Privilege (AI-driven scope analysis)
        // Simulate AI detecting potential over-privileging based on typical usage patterns.
        const sensitiveScopes = [KeyScope.FULL_ACCESS, KeyScope.API_KEY_MANAGE, KeyScope.TRANSACTION_APPROVE, KeyScope.USER_MANAGE, KeyScope.QUANTUM_SECURE_VAULT];
        const keyHasSensitiveScope = sensitiveScopes.some(scope => apiKey.scopes.includes(scope));
        const aiDetectsOverPrivilege = RandomDataGenerator.randomBoolean() && RandomDataGenerator.randomNumber(1, 100) > 70; // 30% chance for detection

        if (keyHasSensitiveScope && aiDetectsOverPrivilege) {
            recommendations.push(`AI suggests that key '${apiKey.name}' may have broader permissions than necessary. Review current usage to apply least privilege principles.`);
            score -= 10;
            if (remediationEffort === 'low') remediationEffort = 'medium';
        }

        // Rule 5: Daily Request Limit enforcement
        if (policy.rules.dailyRequestLimit !== null && policy.rules.dailyRequestLimit > 0) {
            // Simulate fetching recent 24h usage (would use getApiKeyUsage in real scenario)
            const mockDailyRequests = RandomDataGenerator.randomNumber(50000, 2000000); // Exaggerate for simulation
            if (mockDailyRequests > policy.rules.dailyRequestLimit) {
                violations.push(`Key '${apiKey.name}' exceeded daily request limit of ${policy.rules.dailyRequestLimit}. Current: ${mockDailyRequests}.`);
                recommendations.push(`Adjust rate limiting policy for '${apiKey.name}' or investigate potential burst attacks.`);
                score -= 15;
                if (remediationEffort !== 'critical' && remediationEffort !== 'high') remediationEffort = 'medium';
            }
        }

        score = Math.max(0, Math.min(100, score)); // Ensure score stays within 0-100 bounds

        console.log(`AIGovernanceEngine: Policy evaluation for '${apiKey.name}' complete. Score: ${score}, Violations: ${violations.length}.`);
        return {
            policyId: policy.id,
            isCompliant: violations.length === 0,
            violations,
            recommendations,
            score,
            evaluatedAt: new Date().toISOString(),
            remediationEffortEstimate: remediationEffort,
        };
    }

    /**
     * Predicts the potential impact of a proposed security policy (new or modified) on the entire API key portfolio.
     * This helps administrators understand the consequences before deployment.
     * Business Value: Provides an indispensable "what-if" analysis tool for policy changes,
     * preventing unintended operational disruptions and compliance gaps. By simulating the impact
     * across thousands of API keys, it enables informed decision-making, significantly reduces
     * deployment risks, and ensures business continuity, safeguarding millions in potential losses
     * from misconfigured policies.
     * @param proposedPolicy The new or updated {@link SecurityPolicy}.
     * @param allKeys A comprehensive list of all active {@link ApiKeyMeta} objects.
     * @returns A promise resolving to an object detailing potential impacts and estimated remediation effort.
     */
    public async predictPolicyImpact(proposedPolicy: SecurityPolicy, allKeys: ApiKeyMeta[]): Promise<{ affectedKeys: string[], nonCompliantCount: number, impactSummary: string, estimatedEffort: string, criticalImpactKeys: string[] }> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(300, 800)));
        console.log(`AIGovernanceEngine: Running predictive impact analysis for proposed policy '${proposedPolicy.name}' (ID: ${proposedPolicy.id}).`);

        let affectedKeys: string[] = [];
        let nonCompliantCount = 0;
        let potentialRevocations = 0;
        let potentialScopeChanges = 0;
        let criticalImpactKeys: string[] = [];
        let totalScoreSum = 0;

        for (const key of allKeys) {
            const evaluation = await this.evaluatePolicyCompliance(key, proposedPolicy);
            totalScoreSum += evaluation.score;
            if (!evaluation.isCompliant) {
                nonCompliantCount++;
                affectedKeys.push(key.id);
                if (evaluation.violations.some(v => v.includes('lifespan') || v.includes('unapproved region'))) potentialRevocations++;
                if (evaluation.recommendations.some(r => r.includes('scope'))) potentialScopeChanges++;
                if (evaluation.score < AIGovernanceEngine.COMPLIANCE_SCORE_CRITICAL_THRESHOLD) criticalImpactKeys.push(key.id);
            }
        }

        const avgComplianceScore = allKeys.length > 0 ? totalScoreSum / allKeys.length : 100;

        const impactSummary = `The proposed policy '${proposedPolicy.name}' would lead to ${nonCompliantCount} non-compliant keys out of ${allKeys.length} total.
        Approximately ${potentialRevocations} keys would require immediate rotation/revocation due to critical violations.
        An estimated ${potentialScopeChanges} keys would require scope adjustments for compliance.
        ${criticalImpactKeys.length} keys are identified as having critical non-compliance, severely impacting their operational status.
        The average compliance score across the portfolio would be approximately ${avgComplianceScore.toFixed(1)}.`;

        const estimatedEffort = nonCompliantCount > allKeys.length * 0.6 ? 'Extreme (Major overhaul of key management needed)' :
                                nonCompliantCount > allKeys.length * 0.3 ? 'High (Significant key adjustments and review)' :
                                nonCompliantCount > allKeys.length * 0.1 ? 'Medium (Moderate key adjustments expected)' :
                                'Low (Minimal key adjustments anticipated)';

        console.log(`AIGovernanceEngine: Policy impact prediction complete. Non-compliant keys: ${nonCompliantCount}, Estimated effort: ${estimatedEffort}.`);
        return {
            affectedKeys,
            nonCompliantCount,
            impactSummary,
            estimatedEffort,
            criticalImpactKeys,
        };
    }

    /**
     * Analyzes aggregated usage data and existing policies to proactively suggest improvements.
     * This helps in refining security posture and optimizing policy effectiveness over time.
     * Business Value: Leverages AI to continuously optimize security policies, ensuring they remain
     * effective and efficient against evolving threats. By proactively recommending policy
     * adjustments, it reduces attack surface, enhances operational resilience, and translates
     * directly to lower security costs and improved compliance posture over time.
     * @param usageData A collection of recent {@link UsageMetrics} from various API keys.
     * @param policies Current active {@link SecurityPolicy} objects.
     * @returns A promise resolving to an array of {@link AIRecommendation} for policy refinement.
     */
    public async suggestPolicyImprovements(usageData: UsageMetrics[], policies: SecurityPolicy[]): Promise<AIRecommendation[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(400, 1000)));
        console.log("AIGovernanceEngine: Initiating AI-driven analysis of aggregated usage data for policy improvement suggestions.");

        const recommendations: AIRecommendation[] = [];
        if (usageData.length === 0) {
            console.log("AIGovernanceEngine: No usage data provided for policy improvement analysis.");
            return [];
        }

        const totalRequestsMean = StatisticalAnalyzer.calculateMean(usageData.map(u => u.totalRequests));
        const avgRateLimitHits = StatisticalAnalyzer.calculateMean(usageData.map(u => u.rateLimitHits));
        const uniqueGeoLocations = new Set(usageData.flatMap(u => Object.keys(u.geolocationDistribution)).filter(Boolean));
        const avgCostEstimate = StatisticalAnalyzer.calculateMean(usageData.map(u => u.costEstimateUSD));

        // Suggest rate limit adjustments if hits are frequent
        if (avgRateLimitHits > 30 && policies.every(p => p.rules.rateLimitPolicy === 'default' || p.rules.rateLimitPolicy === 'none')) {
            recommendations.push({
                id: `ai_pol_rec_${RandomDataGenerator.uuid().substring(0, 8)}`,
                type: 'optimization_tip',
                severity: 'medium',
                message: `Frequent rate limit hits (average ${avgRateLimitHits.toFixed(0)}/period) detected across multiple keys. Consider implementing more granular custom rate limiting policies for specific high-traffic endpoints or usage tiers.`,
                actionableItems: ['Analyze API usage patterns to identify bottlenecked endpoints', 'Define new custom rate limit policies', 'Communicate new policies to API consumers'],
                isDismissed: false,
                createdAt: new Date().toISOString(),
            });
        }

        // Suggest stricter geo-fencing if usage is global without controls
        if (uniqueGeoLocations.size > 8 && policies.every(p => p.rules.geoFencing === 'none' || p.rules.allowedRegions.length === 0)) {
            recommendations.push({
                id: `ai_pol_rec_${RandomDataGenerator.uuid().substring(0, 8)}`,
                type: 'security_alert',
                severity: 'medium',
                message: `API keys are being actively used from a diverse set of ${uniqueGeoLocations.size} geographic regions without geo-fencing policies. Implementing geo-fencing for sensitive keys could reduce unauthorized access risk.`,
                actionableItems: ['Identify API keys with critical access and global usage', 'Define allowed or blacklisted regions in security policies', 'Review current geo-distribution of requests'],
                isDismissed: false,
                createdAt: new Date().toISOString(),
            });
        }

        // Suggest key lifespan policies for keys that are not expiring
        const policiesWithoutLifespan = policies.filter(p => p.rules.keyLifespanDays === null);
        if (policiesWithoutLifespan.length > 0 && RandomDataGenerator.randomBoolean()) { // Add randomness to avoid recommendation every time if not strictly critical
            recommendations.push({
                id: `ai_pol_rec_${RandomDataGenerator.uuid().substring(0, 8)}`,
                type: 'compliance_suggestion',
                severity: 'medium',
                message: `Some active security policies do not enforce a key lifespan. Implementing mandatory key rotation or expiration can significantly reduce the window of compromise.`,
                actionableItems: ['Update security policies to include a maximum key lifespan (e.g., 90-180 days)', 'Configure automated key rotation schedules for all new keys.'],
                isDismissed: false,
                createdAt: new Date().toISOString(),
            });
        }

        // Suggest cost optimization based on usage tiers if average cost is high for 'free' or 'pro' tier
        if (avgCostEstimate > 100 && usageData.some(u => u.costEstimateUSD > 500) && RandomDataGenerator.randomBoolean()) {
            recommendations.push({
                id: `ai_pol_rec_${RandomDataGenerator.uuid().substring(0, 8)}`,
                type: 'optimization_tip',
                severity: 'low',
                message: `High operational costs ($${avgCostEstimate.toFixed(2)} average per period) observed for some keys. Consider reviewing usage tiers and optimizing request patterns.`,
                actionableItems: ['Analyze cost distribution per API key', 'Identify high-cost usage scenarios', 'Optimize queries or consider caching strategies.'],
                isDismissed: false,
                createdAt: new Date().toISOString(),
            });
        }

        console.log(`AIGovernanceEngine: Policy improvement analysis yielded ${recommendations.length} recommendations.`);
        return recommendations;
    }

    // --- Anomaly Detection ---

    /**
     * Detects usage anomalies for a given API key by comparing current usage metrics against
     * its established historical baseline and a broader dataset of historical usage.
     * Business Value: Provides sophisticated, AI-powered real-time anomaly detection, which
     * is paramount for preventing financial fraud, detecting DDoS attacks, and identifying
     * unauthorized data access. This capability protects vast amounts of transactional value
     * and sensitive customer data, significantly reducing financial and reputational risks.
     * @param apiKey The {@link ApiKeyMeta} object for which to detect anomalies.
     * @param currentUsage Current {@link UsageMetrics} for the API key.
     * @param historicalUsage An array of past {@link UsageMetrics} for the API key.
     * @returns A promise resolving to an array of {@link AnomalyDetectionResult} objects.
     */
    public async detectUsageAnomalies(apiKey: ApiKeyMeta, currentUsage: UsageMetrics, historicalUsage: UsageMetrics[]): Promise<AnomalyDetectionResult[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(200, 500)));
        console.log(`AIGovernanceEngine: Initiating real-time usage anomaly detection for key '${apiKey.name}' (ID: ${apiKey.id}).`);

        const anomalies: AnomalyDetectionResult[] = [];
        const baseline = this.historicalBaselines.get(apiKey.id);

        if (!baseline || historicalUsage.length < 10) { // Require more data for a robust baseline
            anomalies.push({
                anomalyId: `anom_baseline_gap_${RandomDataGenerator.uuid().substring(0, 8)}`,
                entityId: apiKey.id,
                entityType: 'apiKey',
                anomalyType: 'access_pattern',
                severity: 'low',
                message: `Insufficient historical data to establish a robust usage baseline for key '${apiKey.name}'. Monitor usage closely.`,
                timestamp: new Date().toISOString(),
                details: { reason: "data_scarcity", historicalDataPoints: historicalUsage.length },
                confidence: 0.6,
                potentialThreatVectors: [],
            });
            console.warn(`AIGovernanceEngine: Cannot perform robust anomaly detection for key '${apiKey.id}' due to insufficient baseline data.`);
            return anomalies;
        }

        // Anomaly 1: Sudden Request Spike/Drop
        const historicalRequests = historicalUsage.map(u => u.totalRequests);
        const meanRequests = StatisticalAnalyzer.calculateMean(historicalRequests);
        const stdDevRequests = StatisticalAnalyzer.calculateStandardDeviation(historicalRequests, meanRequests);

        if (StatisticalAnalyzer.detectOutlier(currentUsage.totalRequests, meanRequests, stdDevRequests, 3.0)) { // 3 standard deviations for high severity
            const message = currentUsage.totalRequests > meanRequests ?
                `Extreme spike in API requests detected for key '${apiKey.name}'. Current: ${currentUsage.totalRequests}, Expected average: ~${meanRequests.toFixed(0)}.` :
                `Significant drop in API requests detected for key '${apiKey.name}'. Current: ${currentUsage.totalRequests}, Expected average: ~${meanRequests.toFixed(0)}.`;
            anomalies.push({
                anomalyId: `anom_req_spike_${RandomDataGenerator.uuid().substring(0, 8)}`,
                entityId: apiKey.id,
                entityType: 'apiKey',
                anomalyType: 'usage_spike',
                severity: 'high',
                message: message,
                timestamp: new Date().toISOString(),
                details: { currentRequests: currentUsage.totalRequests, mean: meanRequests, stdDev: stdDevRequests },
                confidence: 0.9,
                potentialThreatVectors: [ThreatVector.DDOS, ThreatVector.API_ABUSE],
            });
        }

        // Anomaly 2: Geographic Deviation from typical patterns
        const currentGeoKeys = new Set(Object.keys(currentUsage.geolocationDistribution));
        const baselineGeoKeys = new Set(Object.keys(baseline.peakHourAverage)); // Reusing peakHourAverage keys for mock geo distribution keys
        const geoSimilarity = StatisticalAnalyzer.jaccardIndex(currentGeoKeys, baselineGeoKeys);

        if (geoSimilarity < 0.2 && currentGeoKeys.size > 0 && baselineGeoKeys.size > 0) { // If very low overlap with baseline regions
            anomalies.push({
                anomalyId: `anom_geo_dev_${RandomDataGenerator.uuid().substring(0, 8)}`,
                entityId: apiKey.id,
                entityType: 'apiKey',
                anomalyType: 'geo_deviation',
                severity: 'critical',
                message: `Key '${apiKey.name}' used from completely new or highly unusual geographic regions. High deviation from established geo-distribution pattern.`,
                timestamp: new Date().toISOString(),
                details: { currentRegions: Array.from(currentGeoKeys), baselineRegions: Array.from(baselineGeoKeys), similarityScore: geoSimilarity.toFixed(2) },
                confidence: 0.95,
                potentialThreatVectors: [ThreatVector.BROKEN_AUTH, ThreatVector.API_ABUSE],
            });
        }

        // Anomaly 3: Abnormally High Failed Requests Ratio
        const currentFailedRatio = currentUsage.totalRequests > 0 ? currentUsage.failedRequests / currentUsage.totalRequests : 0;
        const historicalFailedRatios = historicalUsage.map(u => u.totalRequests > 0 ? u.failedRequests / u.totalRequests : 0);
        const meanFailedRatio = StatisticalAnalyzer.calculateMean(historicalFailedRatios);
        const stdDevFailedRatio = StatisticalAnalyzer.calculateStandardDeviation(historicalFailedRatios, meanFailedRatio);

        if (currentFailedRatio > 0.10 && StatisticalAnalyzer.detectOutlier(currentFailedRatio, meanFailedRatio, stdDevFailedRatio, 2.0)) { // 10% failed ratio and 2 std dev outlier
            anomalies.push({
                anomalyId: `anom_failed_ratio_${RandomDataGenerator.uuid().substring(0, 8)}`,
                entityId: apiKey.id,
                entityType: 'apiKey',
                anomalyType: 'access_pattern',
                severity: 'high',
                message: `Abnormally high failed request ratio (${(currentFailedRatio * 100).toFixed(2)}%) for key '${apiKey.name}'. May indicate brute-force attempts, misconfiguration, or malicious activity.`,
                timestamp: new Date().toISOString(),
                details: { currentRatio: currentFailedRatio.toFixed(3), meanRatio: meanFailedRatio.toFixed(3) },
                confidence: 0.8,
                potentialThreatVectors: [ThreatVector.BROKEN_AUTH, ThreatVector.API_ABUSE],
            });
        }

        // Anomaly 4: Rate Limit Hit Frequency
        const historicalRateLimitHits = historicalUsage.map(u => u.rateLimitHits);
        const meanRateLimitHits = StatisticalAnalyzer.calculateMean(historicalRateLimitHits);
        const stdDevRateLimitHits = StatisticalAnalyzer.calculateStandardDeviation(historicalRateLimitHits, meanRateLimitHits);

        if (currentUsage.rateLimitHits > 0 && StatisticalAnalyzer.detectOutlier(currentUsage.rateLimitHits, meanRateLimitHits, stdDevRateLimitHits, 2.5)) {
             anomalies.push({
                anomalyId: `anom_rate_limit_${RandomDataGenerator.uuid().substring(0, 8)}`,
                entityId: apiKey.id,
                entityType: 'apiKey',
                anomalyType: 'rate_limiting_bypass',
                severity: 'medium',
                message: `Unusual frequency of rate limit hits (${currentUsage.rateLimitHits}) for key '${apiKey.name}'. Could indicate attempts to bypass rate limits or misconfigured client.`,
                timestamp: new Date().toISOString(),
                details: { currentHits: currentUsage.rateLimitHits, meanHits: meanRateLimitHits.toFixed(0) },
                confidence: 0.7,
                potentialThreatVectors: [ThreatVector.RATE_LIMITING_BYPASS, ThreatVector.API_ABUSE],
            });
        }

        // Anomaly 5: Unexpected Cost Spike
        const historicalCosts = historicalUsage.map(u => u.costEstimateUSD);
        const meanCost = StatisticalAnalyzer.calculateMean(historicalCosts);
        const stdDevCost = StatisticalAnalyzer.calculateStandardDeviation(historicalCosts, meanCost);

        if (currentUsage.costEstimateUSD > 0 && StatisticalAnalyzer.detectOutlier(currentUsage.costEstimateUSD, meanCost, stdDevCost, 3.5)) {
            anomalies.push({
                anomalyId: `anom_cost_spike_${RandomDataGenerator.uuid().substring(0, 8)}`,
                entityId: apiKey.id,
                entityType: 'apiKey',
                anomalyType: 'config_drift', // Or 'usage_spike'
                severity: 'high',
                message: `Unexpected cost spike detected for key '${apiKey.name}'. Current cost: $${currentUsage.costEstimateUSD.toFixed(2)}, Expected average: ~$${meanCost.toFixed(2)}. This could indicate resource abuse or misconfiguration.`,
                timestamp: new Date().toISOString(),
                details: { currentCost: currentUsage.costEstimateUSD, meanCost: meanCost.toFixed(2), stdDevCost: stdDevCost.toFixed(2) },
                confidence: 0.85,
                potentialThreatVectors: [ThreatVector.API_ABUSE],
            });
        }

        console.log(`AIGovernanceEngine: Detected ${anomalies.length} usage anomalies for key '${apiKey.id}'.`);
        return anomalies;
    }

    /**
     * Detects anomalous activity patterns based on recent audit logs and the actor's behavioral profile.
     * This helps in identifying compromised accounts or insider threats.
     * Business Value: This module is a crucial defense against insider threats and account
     * compromises. By identifying deviations from normal user behavior in real-time, it
     * prevents unauthorized actions, data exfiltration, and privilege escalation, protecting
     * the integrity of the organization's core operations and proprietary information.
     * @param currentLogs A set of recent {@link AuditLogEntry} objects for an actor.
     * @param actorProfile The {@link BehavioralProfile} of the actor performing the actions.
     * @returns A promise resolving to an array of {@link AnomalyDetectionResult} objects.
     */
    public async detectActivityAnomalies(currentLogs: AuditLogEntry[], actorProfile: BehavioralProfile | undefined): Promise<AnomalyDetectionResult[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(150, 400)));
        console.log(`AIGovernanceEngine: Initiating behavioral anomaly detection for actor ${actorProfile?.actorId || 'unknown'}.`);

        const anomalies: AnomalyDetectionResult[] = [];

        if (!actorProfile) {
            // If no profile exists, flag all sensitive actions or a burst of activity.
            currentLogs.forEach(log => {
                if ([KeyScope.API_KEY_MANAGE, KeyScope.USER_MANAGE, KeyScope.TRANSACTION_APPROVE, KeyScope.QUANTUM_SECURE_VAULT].includes(log.action as KeyScope) && RandomDataGenerator.randomBoolean()) {
                    anomalies.push({
                        anomalyId: `anom_unprofiled_sensitive_${RandomDataGenerator.uuid().substring(0, 8)}`,
                        entityId: log.actorId,
                        entityType: 'user',
                        anomalyType: 'access_pattern',
                        severity: 'high',
                        message: `Sensitive action '${log.action}' from unprofiled actor '${log.actorId}'. Immediate investigation recommended.`,
                        timestamp: log.timestamp,
                        details: { action: log.action, ip: log.ipAddress, userAgent: log.userAgent },
                        confidence: 0.8,
                        potentialThreatVectors: [ThreatVector.BROKEN_AUTH, ThreatVector.API_ABUSE],
                    });
                }
            });
            console.warn(`AIGovernanceEngine: No behavioral profile found for actor ${currentLogs[0]?.actorId || 'unknown'}. Operating in heightened alert mode.`);
            return anomalies;
        }

        const profileActions = new Set(actorProfile.commonActions);
        const profileIPRanges = actorProfile.typicalIPRanges;
        const profileUserAgents = actorProfile.typicalUserAgents;

        for (const log of currentLogs) {
            // Anomaly 1: Uncommon Action for this actor
            if (!profileActions.has(log.action as KeyScope) && ![KeyScope.AUDIT_READ, KeyScope.AI_ANALYTICS_VIEW].includes(log.action as KeyScope) && RandomDataGenerator.randomBoolean()) { // Filter common read actions
                anomalies.push({
                    anomalyId: `anom_uncommon_action_${RandomDataGenerator.uuid().substring(0, 8)}`,
                    entityId: log.actorId,
                    entityType: 'user',
                    anomalyType: 'scope_misuse', // Or access_pattern, depending on context
                    severity: 'medium',
                    message: `Actor '${log.actorId}' performed an uncommon action: '${log.action}'. Review if this aligns with their role.`,
                    timestamp: log.timestamp,
                    details: { action: log.action, commonActions: Array.from(profileActions) },
                    confidence: 0.7,
                    potentialThreatVectors: [ThreatVector.API_ABUSE],
                });
            }

            // Anomaly 2: IP Address Deviation
            const isIpInProfile = profileIPRanges.some(range => {
                // Simplified CIDR check: Assumes /24 for simplicity, or direct match.
                if (range.includes('/')) {
                    const [ipPrefix, cidr] = range.split('/');
                    const logIpPrefix = log.ipAddress.split('.').slice(0, 3).join('.');
                    return ipPrefix.startsWith(logIpPrefix); // Basic prefix match for /24
                }
                return log.ipAddress === range; // Exact IP match
            });

            if (!isIpInProfile) {
                anomalies.push({
                    anomalyId: `anom_ip_deviation_${RandomDataGenerator.uuid().substring(0, 8)}`,
                    entityId: log.actorId,
                    entityType: 'user',
                    anomalyType: 'geo_deviation',
                    severity: 'high',
                    message: `Activity from unusual IP address '${log.ipAddress}' for actor '${log.actorId}'. This deviates from their typical access patterns.`,
                    timestamp: log.timestamp,
                    details: { ipAddress: log.ipAddress, typicalRanges: actorProfile.typicalIPRanges },
                    confidence: 0.9,
                    potentialThreatVectors: [ThreatVector.BROKEN_AUTH, ThreatVector.CREDENTIAL_STUFFING],
                });
            }

            // Anomaly 3: User Agent Deviation
            const isUserAgentInProfile = profileUserAgents.some(ua => log.userAgent.includes(ua));
            if (!isUserAgentInProfile && RandomDataGenerator.randomBoolean()) { // Add randomness for less critical alerts
                 anomalies.push({
                    anomalyId: `anom_ua_deviation_${RandomDataGenerator.uuid().substring(0, 8)}`,
                    entityId: log.actorId,
                    entityType: 'user',
                    anomalyType: 'access_pattern',
                    severity: 'low',
                    message: `Unusual user agent '${log.userAgent}' detected for actor '${log.actorId}'. Could be a new device or automated script.`,
                    timestamp: log.timestamp,
                    details: { userAgent: log.userAgent, typicalUserAgents: actorProfile.typicalUserAgents },
                    confidence: 0.5,
                    potentialThreatVectors: [],
                });
            }

            // Anomaly 4: Burst of activity (e.g., many sensitive actions in short period)
            const sensitiveActionsInLog = currentLogs.filter(l => [KeyScope.API_KEY_MANAGE, KeyScope.USER_MANAGE, KeyScope.TRANSACTION_APPROVE, KeyScope.QUANTUM_SECURE_VAULT].includes(l.action as KeyScope));
            if (sensitiveActionsInLog.length > 3 && currentLogs.length > 5 && RandomDataGenerator.randomNumber(1, 100) > 60) { // If many sensitive actions in a small batch of logs
                anomalies.push({
                    anomalyId: `anom_burst_activity_${RandomDataGenerator.uuid().substring(0, 8)}`,
                    entityId: log.actorId,
                    entityType: 'user',
                    anomalyType: 'access_pattern',
                    severity: 'medium',
                    message: `Detected burst of sensitive activity (${sensitiveActionsInLog.length} actions) for actor '${log.actorId}'. This deviates from typical activity frequency '${actorProfile.activityFrequency}'.`,
                    timestamp: log.timestamp,
                    details: { sensitiveActionCount: sensitiveActionsInLog.length, logsCount: currentLogs.length },
                    confidence: 0.75,
                    potentialThreatVectors: [ThreatVector.API_ABUSE, ThreatVector.BROKEN_AUTH],
                });
            }
        }
        console.log(`AIGovernanceEngine: Detected ${anomalies.length} behavioral anomalies for actor '${actorProfile?.actorId || 'unknown'}'.`);
        return anomalies;
    }


    // --- Quantum Security and Digital Identity Governance ---

    /**
     * Assesses the quantum security posture of a specific digital identity profile.
     * This method evaluates cryptographic algorithms used, key strengths, and PQC readiness.
     * Business Value: This cutting-edge capability proactively guards against the existential
     * threat of quantum computing, which could render current encryption methods obsolete.
     * By assessing and guiding the migration to Post-Quantum Cryptography (PQC), it
     * ensures the long-term integrity and confidentiality of all digital identities and
     * transactions, protecting the enterprise from future catastrophic breaches.
     * @param identityProfile The {@link DecentralizedIdentityProfile} to assess.
     * @returns A promise resolving to a {@link QuantumRiskAssessment} for the identity.
     */
    public async assessIdentityQuantumSecurity(identityProfile: DecentralizedIdentityProfile): Promise<QuantumRiskAssessment> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(150, 400)));
        console.log(`AIGovernanceEngine: Initiating quantum security assessment for identity profile '${identityProfile.id}'.`);

        let vulnerabilityScore = 0;
        let estimatedTimeToBreak: QuantumRiskAssessment['estimatedTimeToBreak'] = '10+ years';
        let recommendations: string[] = [];
        let isQuantumSecure = true;

        // Check key algorithm strength for classical vulnerability
        if (identityProfile.publicKeyAlgorithm.toLowerCase().includes('rsa') && parseInt(identityProfile.publicKeyAlgorithm.split('-')[1] || '0') < 4096) {
            vulnerabilityScore += 30;
            estimatedTimeToBreak = '5-10 years';
            recommendations.push("The public key uses RSA with a strength less than 4096-bits, which is increasingly vulnerable to classical attacks and will be easily broken by quantum computers.");
            isQuantumSecure = false;
        }
        if (identityProfile.publicKeyAlgorithm.toLowerCase().includes('ecc') && parseInt(identityProfile.publicKeyAlgorithm.split('-')[1]?.substring(1) || '0') < 384) {
            vulnerabilityScore += 25;
            if (estimatedTimeToBreak === '10+ years') estimatedTimeToBreak = '5-10 years';
            recommendations.push("The public key uses ECC with a curve size less than P-384, which is considered less robust against future quantum attacks.");
            isQuantumSecure = false;
        }

        // Check explicit PQC readiness
        if (!identityProfile.isPostQuantumReady) {
            vulnerabilityScore += 50;
            estimatedTimeToBreak = '1-5 years'; // Assume higher risk if not explicitly PQC ready
            recommendations.push("This identity profile is not explicitly marked as Post-Quantum Cryptography (PQC) ready. Immediate PQC migration planning is recommended.");
            isQuantumSecure = false;
        } else {
            // Even if PQC ready, a small random chance of residual risk or need for update
            if (RandomDataGenerator.randomBoolean() && RandomDataGenerator.randomNumber(1, 100) > 80) {
                vulnerabilityScore += 10;
                recommendations.push("Although PQC-ready, continuous monitoring and potential updates to new PQC standards are advised as the quantum threat evolves.");
            }
        }

        if (vulnerabilityScore === 0) {
            vulnerabilityScore = RandomDataGenerator.randomNumber(5, 15); // Baseline risk for all systems
        }

        const assessment: QuantumRiskAssessment = {
            entityId: identityProfile.id,
            entityType: 'system', // Identity profile is part of system security
            algorithmUsed: identityProfile.publicKeyAlgorithm,
            currentSecurityStrength: identityProfile.keyStrengthBits,
            quantumVulnerabilityScore: Math.min(100, vulnerabilityScore),
            estimatedTimeToBreak: estimatedTimeToBreak,
            recommendations: Array.from(new Set(recommendations)),
            lastAssessed: new Date().toISOString(),
            isQuantumSecure: isQuantumSecure,
        };
        console.log(`AIGovernanceEngine: Quantum risk assessment for identity '${identityProfile.id}' complete. Score: ${assessment.quantumVulnerabilityScore}, Secure: ${assessment.isQuantumSecure}.`);
        return assessment;
    }

    /**
     * Conducts a real-time compliance scan across all active API keys and relevant user profiles.
     * Business Value: This function aggregates compliance data into a single, comprehensive report,
     * simplifying complex auditing requirements. By automating the generation of these reports,
     * it drastically reduces operational overhead, ensures regulatory compliance, and provides
     * stakeholders with transparent, up-to-date insights into the organization's security posture,
     * minimizing legal and financial risks.
     * @param allApiKeys A list of all active {@link ApiKeyMeta} objects.
     * @param userProfiles A map of user IDs to {@link DecentralizedIdentityProfile} objects.
     * @param activePolicies A list of all active {@link SecurityPolicy} objects.
     * @returns A promise resolving to an array of {@link ComplianceReportEntry} objects.
     */
    public async conductComplianceScan(allApiKeys: ApiKeyMeta[], userProfiles: Map<string, DecentralizedIdentityProfile>, activePolicies: SecurityPolicy[]): Promise<ComplianceReportEntry[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(500, 1500)));
        console.log("AIGovernanceEngine: Initiating comprehensive compliance scan across API keys and identity profiles.");

        const reportEntries: ComplianceReportEntry[] = [];
        const now = new Date().toISOString();

        for (const apiKey of allApiKeys) {
            let keyIssues: string[] = [];
            let keySuggestedActions: string[] = [];
            let keyScore = 100;
            let associatedRecommendations: string[] = [];

            for (const policy of activePolicies) {
                const evaluation = await this.evaluatePolicyCompliance(apiKey, policy);
                if (!evaluation.isCompliant) {
                    keyIssues.push(...evaluation.violations.map(v => `[Policy ${policy.name}] ${v}`));
                    keySuggestedActions.push(...evaluation.recommendations.map(r => `[Policy ${policy.name}] ${r}`));
                    keyScore = Math.min(keyScore, evaluation.score);
                    // Generate AI recommendation for each violation/non-compliance
                    if (evaluation.violations.length > 0) {
                        const recId = `ai_comp_rec_${RandomDataGenerator.uuid().substring(0, 8)}`;
                        this.recommendationQueue.push({
                            id: recId,
                            type: 'compliance_action',
                            severity: evaluation.remediationEffortEstimate === 'critical' ? 'critical' : 'high',
                            message: `API Key '${apiKey.name}' (ID: ${apiKey.id}) is non-compliant with policy '${policy.name}'. Violations: ${evaluation.violations.join('; ')}.`,
                            actionableItems: evaluation.recommendations,
                            isDismissed: false,
                            createdAt: now,
                        });
                        associatedRecommendations.push(recId);
                    }
                }
            }

            reportEntries.push({
                entityId: apiKey.id,
                entityType: 'apiKey',
                policyId: 'N/A_Aggregated', // Indicate this is an aggregated report
                policyName: 'Overall Compliance',
                complianceStatus: keyIssues.length > 0 ? (keyScore < AIGovernanceEngine.COMPLIANCE_SCORE_CRITICAL_THRESHOLD ? 'non_compliant' : 'pending_review') : 'compliant',
                issues: keyIssues,
                suggestedActions: keySuggestedActions,
                lastEvaluated: now,
                associatedRecommendations: associatedRecommendations,
            });
        }

        for (const [userId, identityProfile] of userProfiles.entries()) {
            const quantumAssessment = await this.assessIdentityQuantumSecurity(identityProfile);
            if (!quantumAssessment.isQuantumSecure) {
                const recId = `ai_quantum_id_rec_${RandomDataGenerator.uuid().substring(0, 8)}`;
                this.recommendationQueue.push({
                    id: recId,
                    type: 'security_alert',
                    severity: quantumAssessment.quantumVulnerabilityScore > 70 ? 'critical' : 'high',
                    message: `Digital Identity '${identityProfile.id}' is at high risk of quantum decryption. Quantum vulnerability score: ${quantumAssessment.quantumVulnerabilityScore}.`,
                    actionableItems: quantumAssessment.recommendations,
                    isDismissed: false,
                    createdAt: now,
                });
                reportEntries.push({
                    entityId: userId,
                    entityType: 'user',
                    policyId: 'Quantum_Readiness_Policy',
                    policyName: 'Post-Quantum Cryptography Readiness',
                    complianceStatus: 'non_compliant',
                    issues: [`Identity's cryptographic algorithms are vulnerable to quantum attacks.`],
                    suggestedActions: quantumAssessment.recommendations,
                    lastEvaluated: now,
                    associatedRecommendations: [recId],
                });
            }
        }

        this.complianceScanLog.push(...reportEntries);
        console.log(`AIGovernanceEngine: Compliance scan complete. Generated ${reportEntries.length} report entries and ${this.recommendationQueue.length} new recommendations.`);
        return reportEntries;
    }


    /**
     * Triggers a comprehensive anomaly detection and adaptive response workflow for a given API key.
     * This function orchestrates calls to `detectUsageAnomalies`, `threatIntelligence`, and `adaptiveResponse`.
     * Business Value: This orchestrator function provides end-to-end autonomous threat management.
     * From detection to intelligent remediation, it significantly reduces manual security operations,
     * accelerates response times, and prevents costly security incidents from spiraling out of control.
     * This automation is a multi-million dollar asset in operational efficiency and risk reduction.
     * @param apiKey The {@link ApiKeyMeta} object to monitor.
     * @param currentUsage Current {@link UsageMetrics} for the key.
     * @param historicalUsage An array of past {@link UsageMetrics} for the key.
     * @param recentAuditLogs Recent {@link AuditLogEntry} for the associated user/actor.
     * @param quantumConfig The {@link QuantumSecureVaultConfig} for associated data.
     * @returns A promise resolving to an array of actions taken and generated anomalies.
     */
    public async monitorAndRespond(
        apiKey: ApiKeyMeta,
        currentUsage: UsageMetrics,
        historicalUsage: UsageMetrics[],
        recentAuditLogs: AuditLogEntry[],
        quantumConfig: QuantumSecureVaultConfig
    ): Promise<{ anomalies: AnomalyDetectionResult[], actions: string[], incidentId?: string }> {
        console.log(`AIGovernanceEngine: Initiating comprehensive monitor and respond cycle for key '${apiKey.name}' (ID: ${apiKey.id}).`);

        const allAnomalies: AnomalyDetectionResult[] = [];
        let allActionsTaken: string[] = [];
        let incidentId: string | undefined;

        // 1. Detect Usage Anomalies
        const usageAnomalies = await this.detectUsageAnomalies(apiKey, currentUsage, historicalUsage);
        allAnomalies.push(...usageAnomalies);

        // 2. Detect Activity Anomalies (assuming the apiKey.createdBy is the actorId)
        const actorProfile = this.behavioralProfiles.get(apiKey.createdBy);
        const activityAnomalies = await this.detectActivityAnomalies(recentAuditLogs, actorProfile);
        allAnomalies.push(...activityAnomalies);

        // 3. Assess API Key Threats based on raw requests
        const mockRecentRequests = Array.from({ length: RandomDataGenerator.randomNumber(5, 20) }, () => RandomDataGenerator.randomSentence(RandomDataGenerator.randomNumber(5, 15)));
        const threatAssessments = await this.threatIntelligence.assessApiKeyThreats(apiKey, mockRecentRequests);
        for (const threat of threatAssessments) {
            // Convert threat assessments into anomalies for adaptive response
            allAnomalies.push({
                anomalyId: `anom_threat_${RandomDataGenerator.uuid().substring(0, 8)}`,
                entityId: apiKey.id,
                entityType: 'apiKey',
                anomalyType: 'access_pattern', // General type for threat-based anomalies
                severity: threat.riskScore >= 90 ? 'critical' : threat.riskScore >= 70 ? 'high' : 'medium',
                message: `Threat detected for key '${apiKey.name}': ${threat.threatVector}. Potential impact: ${threat.potentialImpact}.`,
                timestamp: threat.lastAnalyzed,
                details: { threatVector: threat.threatVector, riskScore: threat.riskScore, detectedSignatures: threat.detectedSignatures },
                confidence: threat.riskScore / 100,
                potentialThreatVectors: [threat.threatVector],
            });
        }

        // 4. Assess Quantum Security Risk for associated data/vault config
        const quantumRisk = await this.threatIntelligence.assessQuantumRisk(apiKey.id, quantumConfig);
        if (quantumRisk.quantumVulnerabilityScore > AIGovernanceEngine.QUANTUM_STABILITY_THRESHOLD * 100) {
            allAnomalies.push({
                anomalyId: `anom_quantum_risk_${RandomDataGenerator.uuid().substring(0, 8)}`,
                entityId: apiKey.id,
                entityType: 'system',
                anomalyType: 'quantum_risk_escalation',
                severity: 'critical',
                message: `Quantum decryption risk for associated data is critical (${quantumRisk.quantumVulnerabilityScore}% vulnerable). Immediate PQC migration recommended.`,
                timestamp: quantumRisk.lastAssessed,
                details: { algorithm: quantumRisk.algorithmUsed, score: quantumRisk.quantumVulnerabilityScore, recommendations: quantumRisk.recommendations },
                confidence: quantumRisk.quantumVulnerabilityScore / 100,
                potentialThreatVectors: [ThreatVector.QUANTUM_DECRYPTION_RISK],
            });
        }


        // 5. Trigger Adaptive Response for each detected anomaly
        for (const anomaly of allAnomalies) {
            if (anomaly.confidence >= AIGovernanceEngine.ANOMALY_CONFIDENCE_THRESHOLD_ALERT) {
                console.log(`AIGovernanceEngine: Triggering adaptive response for high-confidence anomaly '${anomaly.anomalyId}'.`);
                const response = await this.adaptiveResponse.analyzeAndRespond(anomaly);
                allActionsTaken.push(...response.responseActions);
                if (!incidentId) incidentId = response.incidentId; // Store the first incident ID, or track multiple
            }
        }

        console.log(`AIGovernanceEngine: Monitor and respond cycle complete for key '${apiKey.id}'. Detected ${allAnomalies.length} anomalies, took ${allActionsTaken.length} actions.`);
        return { anomalies: allAnomalies, actions: allActionsTaken, incidentId };
    }


    /**
     * Retrieves a list of AI-generated recommendations that are pending review or action.
     * Business Value: Consolidates intelligent insights into actionable tasks for administrators,
     * prioritizing critical issues and guiding strategic improvements. This intelligent queuing
     * mechanism ensures that high-value recommendations are not missed, enhancing security
     * posture and operational efficiency without overwhelming human operators.
     * @param limit The maximum number of recommendations to retrieve.
     * @returns A promise resolving to an array of {@link AIRecommendation} objects.
     */
    public async getPendingRecommendations(limit: number = 10): Promise<AIRecommendation[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(50, 150)));
        console.log(`AIGovernanceEngine: Retrieving up to ${limit} pending AI recommendations.`);
        return this.recommendationQueue.filter(rec => !rec.isDismissed).slice(0, limit);
    }

    /**
     * Marks a specific AI recommendation as dismissed, indicating it has been reviewed or handled.
     * @param recommendationId The ID of the recommendation to dismiss.
     * @returns A promise resolving to true if the recommendation was found and dismissed, false otherwise.
     */
    public async dismissRecommendation(recommendationId: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(30, 80)));
        const rec = this.recommendationQueue.find(r => r.id === recommendationId);
        if (rec) {
            rec.isDismissed = true;
            console.log(`AIGovernanceEngine: Recommendation '${recommendationId}' dismissed.`);
            return true;
        }
        console.warn(`AIGovernanceEngine: Recommendation '${recommendationId}' not found for dismissal.`);
        return false;
    }

    /**
     * Updates an existing historical baseline for an API key.
     * @param baseline The updated {@link HistoricalBaseline} object.
     * @returns A promise resolving to true if the baseline was updated.
     */
    public async updateHistoricalBaseline(baseline: HistoricalBaseline): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(50, 150)));
        this.historicalBaselines.set(baseline.keyId, baseline);
        console.log(`AIGovernanceEngine: Historical baseline for key '${baseline.keyId}' updated.`);
        return true;
    }

    /**
     * Updates an existing behavioral profile for an actor.
     * @param profile The updated {@link BehavioralProfile} object.
     * @returns A promise resolving to true if the profile was updated.
     */
    public async updateBehavioralProfile(profile: BehavioralProfile): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(50, 150)));
        this.behavioralProfiles.set(profile.actorId, profile);
        console.log(`AIGovernanceEngine: Behavioral profile for actor '${profile.actorId}' updated.`);
        return true;
    }

    /**
     * Retrieves the compliance scan history.
     * @param entityId Optional. Filter by entity ID.
     * @returns A promise resolving to an array of {@link ComplianceReportEntry}.
     */
    public async getComplianceScanHistory(entityId?: string): Promise<ComplianceReportEntry[]> {
        await new Promise(resolve => setTimeout(resolve, RandomDataGenerator.randomNumber(50, 150)));
        if (entityId) {
            return this.complianceScanLog.filter(entry => entry.entityId === entityId);
        }
        return [...this.complianceScanLog];
    }
}
```