// Copyright James Burvel Oâ€™Callaghan III
// President cdbi Demo Business Inc.

import React, { useState, useEffect, useCallback } from "react";
import ReduxInputField from "../../common/deprecated_redux/ReduxInputField";
import { Button, Icon, Spinner } from "../../common/ui-components"; // Assuming Spinner exists in ui-components

// --- Utility Functions for IP Management ---
/**
 * Validates if a string is in a basic IPv4 or IPv6 format.
 * This is a preliminary check; AI will provide deeper validation.
 * @param {string} ip - The IP address string to validate.
 * @returns {boolean} - True if the format is valid, false otherwise.
 */
export const isValidIPFormat = (ip: string): boolean => {
  if (!ip || typeof ip !== 'string') return false;
  // Basic IPv4 format validation
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  // Basic IPv6 format validation (simplified for common cases, not fully exhaustive)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){0,4}::[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){0,1}$|^[0-9a-fA-F]{1,4}::|^::[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){6}((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// --- AI Service Simulation (Internal to this file, conceptually self-contained) ---

/**
 * @typedef {object} AIValidationResult
 * @property {boolean} isValid - Is the IP format and common usage valid?
 * @property {string | null} suggestion - A suggestion for correction or improvement.
 * @property {string | null} reason - Why it's invalid or a suggestion is made.
 * @property {number} confidence - AI model's confidence in its assessment (0-1).
 */
export type AIValidationResult = {
  isValid: boolean;
  suggestion: string | null;
  reason: string | null;
  confidence: number;
};

/**
 * Simulates an AI service for advanced IP validation.
 * Checks for format, common misuse patterns, and provides suggestions for secure allowlisting.
 * @param {string} ipAddress - The IP address to validate.
 * @returns {Promise<AIValidationResult>} - AI-powered validation result.
 */
export async function AIPredictiveIPValidation(
  ipAddress: string,
): Promise<AIValidationResult> {
  // Simulate API call delay for a real-world AI service
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200)); // 200-700ms delay

  if (!ipAddress.trim()) {
    return {
      isValid: false,
      suggestion: "Enter a valid IP address.",
      reason: "Empty input. AI requires an IP to analyze.",
      confidence: 1.0,
    };
  }

  // Basic format check first, AI refines this.
  if (!isValidIPFormat(ipAddress)) {
    return {
      isValid: false,
      suggestion: "Review IP format. e.g., 192.168.1.1 or 2001:0db8::1.",
      reason: "Invalid IP format detected by AI pattern matching heuristics.",
      confidence: 0.98,
    };
  }

  // Simulate AI checks for common security issues or best practices
  if (ipAddress.startsWith("127.") || ipAddress === "::1") {
    return {
      isValid: false,
      suggestion: "Consider removing localhost IPs from external allowlists for security.",
      reason: "Local loopback IP detected, usually for internal testing, not external access.",
      confidence: 0.9,
    };
  }
  if (ipAddress.startsWith("10.") || ipAddress.startsWith("172.16.") || ipAddress.startsWith("192.168.")) {
    return {
      isValid: true, // Format is valid
      suggestion: "This is a private network IP. Ensure it's intended for internal access (e.g., VPN) and not exposed externally.",
      reason: "Private IP range detected. AI recommends careful review for external-facing systems.",
      confidence: 0.8,
    };
  }
  if (ipAddress === "0.0.0.0" || ipAddress === "::") {
    return {
      isValid: false,
      suggestion: "0.0.0.0 (or ::) typically means 'all interfaces'. This is often insecure for an allowlist. Consider specific IPs or CIDR blocks.",
      reason: "Wildcard/default route IP detected. AI flags this for potential security vulnerability.",
      confidence: 0.95,
    };
  }
  if (ipAddress.endsWith(".255") && ipAddress.split('.').length === 4) { // IPv4 broadcast
      return {
          isValid: false,
          suggestion: "Broadcast IP addresses are not suitable for point-to-point allowlists. Use specific host IPs.",
          reason: "IPv4 Broadcast address detected.",
          confidence: 0.85,
      };
  }
  // Simulate a random "suspicious" finding based on AI pattern
  if (ipAddress.endsWith(".1") && Math.random() > 0.7) {
    return {
      isValid: true, // It's format valid, but might be less secure
      suggestion: "AI notes this IP ends in '.1', a common gateway address. Verify this is intentional and secure.",
      reason: "Common gateway IP pattern. Often indicates network infrastructure, not client endpoint.",
      confidence: 0.65,
    };
  }

  return {
    isValid: true,
    suggestion: null,
    reason: "IP appears valid and without immediate AI-identified security or format concerns.",
    confidence: 0.99,
  };
}

/**
 * @typedef {object} AIThreatIntelResult
 * @property {boolean} isMalicious - Is the IP associated with known threats?
 * @property {string | null} threatType - Type of threat, if any (e.g., "Botnet C2", "Malware Host", "Phishing").
 * @property {string | null} lastSeen - Timestamp or description of when threat was last observed.
 * @property {number} score - A threat score (0-100), higher indicates more severe threat.
 */
export type AIThreatIntelResult = {
  isMalicious: boolean;
  threatType: string | null;
  lastSeen: string | null;
  score: number;
};

/**
 * Simulates an AI-powered threat intelligence check for an IP.
 * Integrates with simulated cdbi threat feeds and global intelligence databases.
 * @param {string} ipAddress - The IP address to check.
 * @returns {Promise<AIThreatIntelResult>} - AI-powered threat intelligence result.
 */
export async function AIThreatIntelligenceCheck(
  ipAddress: string,
): Promise<AIThreatIntelResult> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 800 + 300)); // 300-1100ms delay

  if (!ipAddress.trim() || !isValidIPFormat(ipAddress)) {
    return {
      isMalicious: false,
      threatType: null,
      lastSeen: null,
      score: 0,
    };
  }

  // Simulate known malicious IPs from a cdbi-specific threat feed or public sources
  // These are examples; in a real system, this would query a backend service.
  if (ipAddress === "1.1.1.1" && Math.random() < 0.05) { // Cloudflare DNS, but occasionally simulate a false positive for demo
      return {
          isMalicious: true,
          threatType: "Simulated Botnet C2",
          lastSeen: "2023-10-26T10:00:00Z",
          score: 85,
      };
  }
  if (ipAddress.startsWith("5.6.7.") && Math.random() < 0.5) { // Another simulated threat range
      return {
          isMalicious: true,
          threatType: "Simulated Phishing Host",
          lastSeen: "2023-10-25T14:30:00Z",
          score: 70,
      };
  }
  if (ipAddress === "8.8.8.8" && Math.random() < 0.1) { // Google DNS, simulate a low-confidence flag
      return {
          isMalicious: true,
          threatType: "Simulated Low-Confidence Malicious Activity",
          lastSeen: "2023-10-20T08:00:00Z",
          score: 30,
      };
  }
  if (ipAddress.startsWith("144.132.") && Math.random() < 0.6) { // Simulate a known malicious range from cdbi intel
    return {
      isMalicious: true,
      threatType: "cdbi Internal Watchlist - Ransomware C2",
      lastSeen: "2023-10-27T05:00:00Z",
      score: 95,
    };
  }

  return {
    isMalicious: false,
    threatType: null,
    lastSeen: null,
    score: Math.floor(Math.random() * 10), // Low random score for non-malicious IPs
  };
}

/**
 * @typedef {object} AISuggestionResult
 * @property {string[]} suggestions - A list of suggested IP addresses or CIDR blocks.
 * @property {string | null} reason - Why these IPs are suggested.
 */
export type AISuggestionResult = {
  suggestions: string[];
  reason: string | null;
};

/**
 * Simulates an AI service for suggesting IP addresses based on context (e.g., common CDN IPs, trusted partners, regional data centers).
 * The AI analyzes the current allowlist and corporate network policies to provide optimal suggestions.
 * @param {string[]} currentAllowlist - The current list of IPs to provide context for AI analysis.
 * @returns {Promise<AISuggestionResult>} - AI-powered suggestions for optimization.
 */
export async function AIAllowlistOptimizer(
  currentAllowlist: string[],
): Promise<AISuggestionResult> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500)); // 500-1500ms delay

  const suggestions: string[] = [];
  let reason: string | null = "AI couldn't identify specific patterns for tailored suggestions. Here are general trusted ranges or your detected public IP.";

  const hasCloudflare = currentAllowlist.some(ip => ip.startsWith("104.28.") || ip.startsWith("172.67."));
  const hasAzure = currentAllowlist.some(ip => ip.startsWith("20.") || ip.startsWith("52."));
  const hasAWS = currentAllowlist.some(ip => ip.startsWith("3.") || ip.startsWith("18."));
  const hasGoogleCloud = currentAllowlist.some(ip => ip.startsWith("34.") || ip.startsWith("35."));
  const hasEmptyEntry = currentAllowlist.some(ip => !ip.trim());

  if (hasEmptyEntry) {
      reason = "AI detected an empty entry. Please fill it or remove it before optimization.";
      return { suggestions: [], reason };
  }

  // Simulate context-aware suggestions
  if (hasCloudflare) {
    suggestions.push("1.1.1.1/32 (Cloudflare DNS - if necessary for DNS resolution)", "1.0.0.1/32 (Secondary Cloudflare DNS)");
    reason = "Recognized Cloudflare IPs. Suggesting related trusted DNS resolvers.";
  }
  if (hasAzure) {
    suggestions.push("20.0.0.0/8 (Broad Azure Public IP range, use with specific subnets)", "52.0.0.0/8 (Broad Azure Public IP range)");
    reason = "Azure IPs detected. Suggesting broader Azure ranges for potential expansion or specific service IPs.";
  }
  if (hasAWS) {
    suggestions.push("3.0.0.0/8 (Broad AWS Public IP range, use with specific subnets)", "18.0.0.0/8 (Broad AWS Public IP range)");
    reason = "AWS IPs detected. Suggesting broader AWS ranges for potential expansion or specific service IPs.";
  }
  if (hasGoogleCloud) {
    suggestions.push("34.0.0.0/8 (Broad Google Cloud IP range)", "35.0.0.0/8 (Broad Google Cloud IP range)");
    reason = "Google Cloud IPs detected. Suggesting broader GCP ranges for potential expansion.";
  }

  // General suggestions if no specific patterns or to augment existing ones.
  if (currentAllowlist.length === 0 || suggestions.length === 0) {
    suggestions.push("198.51.100.0/24 (Example office/corporate VPN subnet)", "203.0.113.1/32 (Trusted partner gateway example)");
    if (currentAllowlist.length === 0) {
        suggestions.unshift("YOUR_PUBLIC_IP/32 (Replace with your actual public IP for initial setup)"); // Add as first suggestion
        reason = "Empty allowlist detected. AI suggests starting with your public IP and common secure ranges.";
    } else if (suggestions.length === 0) {
        reason = "No specific patterns found in your current list for tailored suggestions. Here are some general secure ranges.";
    }
  }

  // Simulate AI recognizing a tight range and suggesting a CIDR block
  const sortedIps = [...currentAllowlist].sort();
  if (sortedIps.length > 2) {
    for (let i = 0; i <= sortedIps.length - 3; i++) {
        // Simplified check: if three consecutive IPs are very close
        const ip1 = sortedIps[i].split('.').map(Number);
        const ip2 = sortedIps[i+1].split('.').map(Number);
        const ip3 = sortedIps[i+2].split('.').map(Number);

        if (ip1.length === 4 && ip2.length === 4 && ip3.length === 4) { // Only for IPv4 for this simplified demo
            if (ip1[0] === ip2[0] && ip1[0] === ip3[0] &&
                ip1[1] === ip2[1] && ip1[1] === ip3[1] &&
                ip1[2] === ip2[2] && ip1[2] === ip3[2] &&
                ip3[3] - ip1[3] <= 2) { // e.g., .1, .2, .3
                const cidrBlock = `${ip1[0]}.${ip1[1]}.${ip1[2]}.0/24`;
                if (!suggestions.includes(cidrBlock) && !currentAllowlist.includes(cidrBlock)) {
                    suggestions.push(cidrBlock);
                    reason = "AI detected a cluster of IPs and suggested a CIDR block for efficiency.";
                }
            }
        }
    }
  }


  // Filter out suggestions already in the current allowlist to avoid duplicates
  const uniqueSuggestions = suggestions.filter(sug => !currentAllowlist.includes(sug));

  return {
    suggestions: uniqueSuggestions,
    reason: reason,
  };
}

// --- KPI & Chart Integration (Gemini Platform) ---
// This section defines how performance and security metrics for AI functions
// are collected and linked to the Gemini analytics platform.

export type KPIEvent = {
  name: string;
  value: number | string | boolean;
  timestamp: string;
  metadata?: Record<string, any>; // Additional context for the KPI
};

/**
 * Simulates sending a Key Performance Indicator (KPI) event to the Gemini analytics platform.
 * In a real-world scenario, this would be an API call to a telemetry service.
 * @param {KPIEvent} event - The KPI event to send.
 * @returns {Promise<void>}
 */
export async function sendKPIToGemini(event: KPIEvent): Promise<void> {
  // Simulate network delay for sending data
  await new Promise((resolve) => setTimeout(resolve, 50));
  console.log(`[Gemini KPI - ${event.name}]`, event);

  // Example of a real API call (commented out for self-contained file demo):
  /*
  fetch('https://gemini.cdbi.com/api/telemetry/kpi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_API_KEY' },
      body: JSON.stringify(event),
  }).catch(error => console.error('Failed to send KPI to Gemini:', error));
  */
}

/**
 * Defines various AI-related KPIs, their purpose, recommended chart types,
 * and their corresponding Gemini dashboard links.
 */
export const AI_KPI_DEFINITIONS = {
  ipValidationSuccessRate: {
    name: "AI IP Validation Success Rate",
    description: "Percentage of AI-powered IP validation attempts that result in a 'valid' status.",
    chartType: "Line Chart / Gauge",
    dataPoints: ["timestamp", "success_count", "total_count", "ip_type (IPv4/IPv6)", "confidence_average"],
    geminiDashboard: "Security Operations Dashboard",
    link: "https://gemini.cdbi.com/dashboards/security#ip-validation",
  },
  ipValidationSuggestionAdoptionRate: {
    name: "AI IP Validation Suggestion Adoption Rate",
    description: "Percentage of AI-suggested IP corrections or improvements that are adopted by the user.",
    chartType: "Bar Chart / Funnel",
    dataPoints: ["timestamp", "adopted_count", "suggested_count", "suggestion_type"],
    geminiDashboard: "User Experience & Security Insights",
    link: "https://gemini.cdbi.com/dashboards/ux-security#ip-suggestion-adoption",
  },
  threatIntelligenceHitRate: {
    name: "AI Threat Intelligence Hit Rate",
    description: "Percentage of IP allowlist entries that trigger an AI-powered threat intelligence alert.",
    chartType: "Pie Chart / Trend Line",
    dataPoints: ["timestamp", "malicious_count", "total_checked_count", "threat_type_breakdown"],
    geminiDashboard: "Security Threat Monitoring",
    link: "https://gemini.cdbi.com/dashboards/threat-monitoring#ip-hits",
  },
  allowlistOptimizationSuggestionRate: {
    name: "AI Allowlist Optimization Suggestion Rate",
    description: "Frequency and quantity of AI-provided optimization suggestions for the IP allowlist.",
    chartType: "Histogram / Event Log",
    dataPoints: ["timestamp", "suggestion_count", "reason_category", "adoption_rate"],
    geminiDashboard: "Operational Efficiency & Security Posture",
    link: "https://gemini.cdbi.com/dashboards/operational-efficiency#allowlist-optimizations",
  },
  aiProcessingTime: {
    name: "AI Service Processing Time (ms)",
    description: "Average latency for AI service responses (validation, threat intel, optimization). Critical for UX.",
    chartType: "Line Chart / Heatmap",
    dataPoints: ["timestamp", "service_name", "duration_ms", "request_size_bytes"],
    geminiDashboard: "AI Service Performance",
    link: "https://gemini.cdbi.com/dashboards/ai-performance#latency",
  },
  ipAllowlistEntryAdded: {
    name: "IP Allowlist Entry Added",
    description: "Tracks when an IP is added to the allowlist.",
    chartType: "Event Log / Count Over Time",
    dataPoints: ["timestamp", "ip_address", "source (user/AI suggestion)"],
    geminiDashboard: "Configuration Change Audit",
    link: "https://gemini.cdbi.com/dashboards/audit#ip-added",
  },
  ipAllowlistEntryRemoved: {
    name: "IP Allowlist Entry Removed",
    description: "Tracks when an IP is removed from the allowlist.",
    chartType: "Event Log / Count Over Time",
    dataPoints: ["timestamp", "ip_address", "reason"],
    geminiDashboard: "Configuration Change Audit",
    link: "https://gemini.cdbi.com/dashboards/audit#ip-removed",
  },
};

// --- Sub-Components for AI Feedback ---

export type IPStatus = {
  validation: AIValidationResult | null;
  threatIntel: AIThreatIntelResult | null;
  isLoading: boolean;
};

export const AIPAllowlistEntryStatus: React.FC<{
  ip: string;
  status: IPStatus;
  onApplySuggestion: (originalIp: string, suggestion: string, index: number) => void;
  index: number;
}> = ({ ip, status, onApplySuggestion, index }) => {
  if (status.isLoading) {
    return (
      <div className="flex items-center text-sm text-gray-500 mt-1">
        <Spinner size="xs" className="mr-2" />
        AI Analyzing: Performing deep validation and threat intelligence scan...
      </div>
    );
  }

  const validation = status.validation;
  const threatIntel = status.threatIntel;

  const validationColor = validation?.isValid === false ? "text-red-600" : "text-green-600";
  const threatColor = threatIntel?.isMalicious ? "text-red-700 font-bold" : "text-gray-600";

  return (
    <div className="mt-1 text-xs space-y-0.5">
      {validation && (
        <div className={`flex items-start ${validationColor}`}>
          <Icon
            iconName={validation.isValid ? "check_circle_outline" : "error_outline"}
            size="xs"
            className="mr-1 mt-0.5"
          />
          <div>
            AI Validation:{" "}
            <span className="font-semibold">
              {validation.isValid ? "Valid" : "Warning"}
            </span>
            . {validation.reason}{" "}
            {validation.suggestion && (
              <Button
                onClick={() => onApplySuggestion(ip, validation.suggestion!, index)}
                variant="link"
                className="text-xs p-0 h-auto underline"
                title="Apply AI suggested correction"
              >
                (Apply Suggestion: {validation.suggestion})
              </Button>
            )}
          </div>
        </div>
      )}
      {threatIntel && (
        <div className={`flex items-start ${threatColor}`}>
          <Icon
            iconName={threatIntel.isMalicious ? "report_problem" : "security"}
            size="xs"
            className="mr-1 mt-0.5"
          />
          <div>
            AI Threat Intel:{" "}
            <span className="font-semibold">
              {threatIntel.isMalicious ? `Malicious (Score: ${threatIntel.score})` : "Clean"}
            </span>
            {threatIntel.threatType && ` - ${threatIntel.threatType}`}.{" "}
            {threatIntel.lastSeen && `Last seen: ${new Date(threatIntel.lastSeen).toLocaleDateString()}`}.
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component: IPAllowlistForm (AI-Enhanced) ---

export function IPAllowlistForm({
  enabled,
  ipAllowlist,
  setIpAllowlist,
}: {
  enabled: boolean;
  ipAllowlist: string[];
  setIpAllowlist: (data: string[]) => void;
}) {
  const [ipStatusMap, setIpStatusMap] = useState<Record<string, IPStatus>>({});
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);
  const [optimizerReason, setOptimizerReason] = useState<string | null>(null);

  /**
   * Memoized function to run AI predictive validation and threat intelligence checks for a given IP.
   * Also sends relevant KPIs to Gemini.
   */
  const runAIPValidation = useCallback(
    async (ip: string, index: number) => {
      const currentIpKey = `${ip}_${index}`;

      // If already loading or if no IP to validate, do nothing.
      if (!ip.trim()) {
        setIpStatusMap((prev) => ({
            ...prev,
            [currentIpKey]: { validation: null, threatIntel: null, isLoading: false },
        }));
        return;
      }
      if (ipStatusMap[currentIpKey]?.isLoading) { // Prevent re-triggering if already loading
          return;
      }

      const start = performance.now();
      setIpStatusMap((prev) => ({
        ...prev,
        [currentIpKey]: {
          ...prev[currentIpKey], // Preserve existing if any
          isLoading: true,
        },
      }));

      try {
        const validationResult = await AIPredictiveIPValidation(ip);
        const threatIntelResult = await AIThreatIntelligenceCheck(ip);

        setIpStatusMap((prev) => ({
          ...prev,
          [currentIpKey]: {
            validation: validationResult,
            threatIntel: threatIntelResult,
            isLoading: false,
          },
        }));

        const end = performance.now();
        sendKPIToGemini({
          name: AI_KPI_DEFINITIONS.aiProcessingTime.name,
          value: end - start,
          timestamp: new Date().toISOString(),
          metadata: { service: "IP_Validation_Threat_Intel", ip: ip, ip_type: isValidIPFormat(ip) ? (ip.includes(':') ? 'IPv6' : 'IPv4') : 'Invalid' },
        });

        sendKPIToGemini({
          name: AI_KPI_DEFINITIONS.ipValidationSuccessRate.name,
          value: validationResult.isValid ? 1 : 0, // 1 for success, 0 for failure
          timestamp: new Date().toISOString(),
          metadata: { ip: ip, confidence: validationResult.confidence, reason: validationResult.reason },
        });
        sendKPIToGemini({
            name: AI_KPI_DEFINITIONS.threatIntelligenceHitRate.name,
            value: threatIntelResult.isMalicious ? 1 : 0, // 1 for malicious hit, 0 for clean
            timestamp: new Date().toISOString(),
            metadata: { ip: ip, threatType: threatIntelResult.threatType, score: threatIntelResult.score },
        });

      } catch (error) {
        console.error(`AI IP validation/threat intel failed for ${ip}:`, error);
        setIpStatusMap((prev) => ({
          ...prev,
          [currentIpKey]: {
            validation: {
              isValid: false,
              suggestion: null,
              reason: "AI service error. Try again.",
              confidence: 0.0,
            },
            threatIntel: {
              isMalicious: false,
              threatType: "AI service error",
              lastSeen: null,
              score: 0,
            },
            isLoading: false,
          },
        }));
        // Send KPI for AI service error
        sendKPIToGemini({
            name: AI_KPI_DEFINITIONS.aiProcessingTime.name,
            value: -1, // Indicate error
            timestamp: new Date().toISOString(),
            metadata: { service: "IP_Validation_Threat_Intel_Error", ip: ip, error: (error as Error).message },
        });
      }
    },
    [ipStatusMap], // `ipStatusMap` is a dependency here because `runAIPValidation` needs to check `prev[currentIpKey]` and `ipStatusMap[currentIpKey]?.isLoading`
  );

  /**
   * Effect hook to synchronize AI validation with changes in the IP allowlist.
   * It cleans up statuses for removed IPs and triggers validation for new/changed ones.
   */
  useEffect(() => {
    const newIpStatusMap: Record<string, IPStatus> = {};
    const currentIpKeys = new Set(ipAllowlist.map((ip, idx) => `${ip}_${idx}`));

    // Preserve existing statuses for IPs that are still in the list
    for (const key in ipStatusMap) {
      if (currentIpKeys.has(key)) {
        newIpStatusMap[key] = ipStatusMap[key];
      }
    }
    setIpStatusMap(newIpStatusMap);

    // Trigger validation for IPs that are new or whose status needs to be re-evaluated
    ipAllowlist.forEach((ip, index) => {
      const currentIpKey = `${ip}_${index}`;
      // Only run if the IP is not empty, not currently loading, and has no prior validation results
      if (ip.trim() && (!newIpStatusMap[currentIpKey] || (!newIpStatusMap[currentIpKey].isLoading && (!newIpStatusMap[currentIpKey].validation && !newIpStatusMap[currentIpKey].threatIntel)))) {
        runAIPValidation(ip, index);
      }
    });
  }, [ipAllowlist, runAIPValidation]); // Re-run when the list changes or the validation logic itself changes

  /**
   * Handles changes to an individual IP input field.
   * Clears existing AI status for that IP to trigger re-validation.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   * @param {number} index - The index of the IP in the allowlist.
   */
  function onIPAllowlistChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    const {
      target: { value },
    } = e;

    const oldIp = ipAllowlist[index]; // Get the IP value before the change
    const oldKey = `${oldIp}_${index}`;

    const newData = [...ipAllowlist];
    newData.splice(index, 1, value); // Update the IP value

    setIpAllowlist(newData);

    // Clear previous AI status for this IP (if it was different) to ensure re-validation
    // If the IP value itself changed, or even if it's the same but we want fresh validation.
    setIpStatusMap(prev => {
        const newMap = { ...prev };
        delete newMap[oldKey]; // Remove status associated with the old value/index
        // Optionally, if the new value is the same as old, we might still want to clear for re-validation:
        // delete newMap[`${value}_${index}`];
        return newMap;
    });

    // `useEffect` will pick up the `setIpAllowlist` change and re-validate.
    // No need to explicitly call `runAIPValidation` here.
  }

  /**
   * Applies an AI-suggested IP correction to the allowlist.
   * @param {string} originalIp - The original IP address.
   * @param {string} suggestion - The AI-suggested IP address.
   * @param {number} index - The index of the IP in the allowlist.
   */
  const handleApplySuggestion = useCallback((originalIp: string, suggestion: string, index: number) => {
    const newData = [...ipAllowlist];
    // Ensure the IP at this specific index is still the one we're applying a suggestion for.
    if (index >= 0 && index < newData.length && newData[index] === originalIp) {
      newData.splice(index, 1, suggestion);
      setIpAllowlist(newData); // This will trigger `useEffect` to re-validate the new IP

      sendKPIToGemini({
        name: AI_KPI_DEFINITIONS.ipValidationSuggestionAdoptionRate.name,
        value: 1, // 1 for adopted
        timestamp: new Date().toISOString(),
        metadata: { original_ip: originalIp, suggested_ip: suggestion, index: index, outcome: "adopted" },
      });
    } else {
        console.warn(`Attempted to apply suggestion for IP at index ${index} but original IP (${originalIp}) no longer matches current list state.`);
        sendKPIToGemini({
            name: AI_KPI_DEFINITIONS.ipValidationSuggestionAdoptionRate.name,
            value: 0, // 0 for not adopted due to mismatch
            timestamp: new Date().toISOString(),
            metadata: { original_ip: originalIp, suggested_ip: suggestion, index: index, outcome: "not_adopted_mismatch" },
        });
    }
  }, [ipAllowlist, setIpAllowlist]);


  /**
   * Adds an AI-suggested optimization IP to the allowlist if it's not already present.
   * @param {string} suggestion - The IP or CIDR block suggested by the optimizer.
   */
  const handleAddOptimizationSuggestion = (suggestion: string) => {
    if (!ipAllowlist.includes(suggestion)) {
      setIpAllowlist([...ipAllowlist, suggestion]);
      sendKPIToGemini({
        name: AI_KPI_DEFINITIONS.ipAllowlistEntryAdded.name,
        value: suggestion,
        timestamp: new Date().toISOString(),
        metadata: { source: "AI_Optimization_Suggestion", original_list_size: ipAllowlist.length },
      });
    }
  };

  /**
   * Initiates the AI allowlist optimization process.
   * Fetches suggestions and sends KPIs to Gemini.
   */
  const runAIOptimizer = useCallback(async () => {
    setOptimizerLoading(true);
    setOptimizationSuggestions([]);
    setOptimizerReason(null);
    const start = performance.now();
    try {
      const result = await AIAllowlistOptimizer(ipAllowlist);
      setOptimizationSuggestions(result.suggestions);
      setOptimizerReason(result.reason);

      const end = performance.now();
      sendKPIToGemini({
        name: AI_KPI_DEFINITIONS.aiProcessingTime.name,
        value: end - start,
        timestamp: new Date().toISOString(),
        metadata: { service: "Allowlist_Optimizer", current_list_size: ipAllowlist.length, suggestions_count: result.suggestions.length },
      });
      sendKPIToGemini({
        name: AI_KPI_DEFINITIONS.allowlistOptimizationSuggestionRate.name,
        value: result.suggestions.length, // Number of suggestions provided
        timestamp: new Date().toISOString(),
        metadata: { reason: result.reason, type: "optimization_run_success", current_list_size: ipAllowlist.length },
      });

    } catch (error) {
      console.error("AI Allowlist optimizer failed:", error);
      setOptimizerReason("AI Optimizer service encountered an error. Please try again.");
      sendKPIToGemini({
        name: AI_KPI_DEFINITIONS.aiProcessingTime.name,
        value: -1, // Indicate error
        timestamp: new Date().toISOString(),
        metadata: { service: "Allowlist_Optimizer_Error", error: (error as Error).message },
      });
      sendKPIToGemini({
        name: AI_KPI_DEFINITIONS.allowlistOptimizationSuggestionRate.name,
        value: 0, // No suggestions due to error
        timestamp: new Date().toISOString(),
        metadata: { reason: "Service error", type: "optimization_run_error" },
      });
    } finally {
      setOptimizerLoading(false);
    }
  }, [ipAllowlist]); // Optimizer needs current ipAllowlist to generate context-aware suggestions


  return (
    <div className="form-subsection bg-gray-50 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Icon iconName="vpn_key" className="mr-2 text-cdbi-primary" />
        <span>Allowed IPs (AI-Enhanced Security & Efficiency)</span>
        <div className="header-hint text-sm text-gray-600 font-normal ml-auto p-2 border-l border-gray-200">
          If enabled, only requests from these IPs will be accepted. Our AI provides real-time predictive validation, threat intelligence, and optimization suggestions to enhance your security posture.
        </div>
      </h3>
      <div className="space-y-4">
        {ipAllowlist.map((value, index) => {
          const currentIpKey = `${value}_${index}`;
          const status = ipStatusMap[currentIpKey] || {
            validation: null,
            threatIntel: null,
            isLoading: false,
          };

          const isMalicious = status.threatIntel?.isMalicious;
          const isWarning = status.validation?.isValid === false;
          const inputBorderClass = isMalicious ? "border-red-500 ring-red-200" : (isWarning ? "border-yellow-500 ring-yellow-200" : "border-gray-300");

          return (
            <div
              className="subsection-row subsection-row-with-action flex flex-col items-stretch p-3 border border-gray-200 rounded-md bg-white hover:shadow-sm transition-shadow duration-150"
              key={`ipAllowlist-${index.toString()}`}
            >
              <div className="flex items-center w-full">
                <ReduxInputField
                  input={{
                    name: `ipAllowlist[${index}]`,
                    onChange: (e) => onIPAllowlistChange(e, index),
                    value,
                  }}
                  disabled={!enabled || status.isLoading}
                  className={`flex-grow ${inputBorderClass}`}
                />
                {enabled && (
                  <Button
                    onClick={() => {
                      sendKPIToGemini({
                          name: AI_KPI_DEFINITIONS.ipAllowlistEntryRemoved.name,
                          value: value,
                          timestamp: new Date().toISOString(),
                          metadata: { ip: value, index: index, reason: "User removed" },
                      });

                      const newData = [...ipAllowlist];
                      newData.splice(index, 1); // Remove at specific index
                      setIpAllowlist(newData);

                      // Clear status for removed IP immediately
                      setIpStatusMap(prev => {
                          const newMap = { ...prev };
                          delete newMap[currentIpKey];
                          return newMap;
                      });
                    }}
                    variant="ghost"
                    className="ml-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                    title="Remove IP from allowlist"
                  >
                    <Icon iconName="delete" size="sm" />
                  </Button>
                )}
              </div>
              {/* AI Feedback for each IP */}
              <AIPAllowlistEntryStatus
                  ip={value}
                  status={status}
                  onApplySuggestion={handleApplySuggestion}
                  index={index}
              />
            </div>
          );
        })}
      </div>
      {enabled && (
        <div className="flex flex-col gap-3 mt-5 pt-4 border-t border-gray-200">
          <Button
            id="add-ip-btn"
            onClick={() => {
                const newIp = "";
                setIpAllowlist([...ipAllowlist, newIp]);
                sendKPIToGemini({
                    name: AI_KPI_DEFINITIONS.ipAllowlistEntryAdded.name,
                    value: newIp,
                    timestamp: new Date().toISOString(),
                    metadata: { source: "User_Added_Empty" },
                });
            }}
            variant="primary"
            className="w-full justify-center py-2"
          >
            <Icon iconName="add_circle" className="mr-2" />
            <span>Add New IP Entry</span>
          </Button>

          <Button
            id="ai-optimize-btn"
            onClick={runAIOptimizer}
            disabled={optimizerLoading || !enabled}
            variant="secondary"
            className="w-full justify-center py-2"
            title="Get AI suggestions to optimize and secure your allowlist"
          >
            {optimizerLoading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Icon iconName="auto_awesome" className="mr-2" />
            )}
            <span>{optimizerLoading ? "AI Analyzing for Optimization..." : "AI Optimize Allowlist"}</span>
          </Button>

          {(optimizationSuggestions.length > 0 || optimizerLoading || (optimizerReason && !optimizationSuggestions.length)) && enabled && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-sm">
              <p className="font-semibold text-blue-800 flex items-center mb-3">
                <Icon iconName="lightbulb_outline" size="sm" className="mr-2" />
                AI Optimization Insights & Suggestions:
              </p>
              {optimizerReason && <p className="text-blue-700 mb-3">{optimizerReason}</p>}
              {optimizerLoading && !optimizationSuggestions.length ? (
                <div className="text-center text-blue-600 flex items-center justify-center">
                  <Spinner size="sm" className="mr-2" />
                  AI is generating advanced recommendations...
                </div>
              ) : (
                optimizationSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {optimizationSuggestions.map((suggestion, idx) => (
                      <Button
                        key={`ai-sug-${idx}`}
                        onClick={() => handleAddOptimizationSuggestion(suggestion)}
                        variant="outline"
                        size="sm"
                        className="flex items-center text-blue-700 hover:text-blue-900 hover:bg-blue-100 border-blue-400"
                        title={`Add '${suggestion}' to allowlist`}
                      >
                        <Icon iconName="add" size="xs" className="mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}