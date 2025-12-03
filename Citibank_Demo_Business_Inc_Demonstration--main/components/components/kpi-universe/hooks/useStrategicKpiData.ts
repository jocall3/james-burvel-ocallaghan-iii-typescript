import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

/**
 * Defines the structure for a Visionary Strategic KPI.
 * These are high-level, forward-looking metrics, often derived from complex
 * or non-traditional data sources (e.g., market sentiment, ecosystem health,
 * AI autonomy, predictive analytics).
 */
export interface StrategicKpi {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  trend: 'up' | 'down' | 'stable' | 'volatile';
  description: string;
  lastUpdated: string; // ISO string or formatted date
  source: string; // e.g., 'AI-Driven Predictive Model', 'Ecosystem Consensus', 'Market Intelligence'
}

/**
 * Defines configuration options for the useStrategicKpiData hook.
 */
export interface UseStrategicKpiDataConfig {
  /**
   * If true, data will be refreshed at a regular interval to simulate real-time updates.
   * @default true
   */
  enableRealtimeUpdates?: boolean;
  /**
   * The interval in milliseconds for data refreshes when enableRealtimeUpdates is true.
   * @default 15000 (15 seconds)
   */
  refreshInterval?: number;
}

/**
 * A custom React hook designed to fetch, process, and provide real-time or near real-time
 * data for visionary strategic KPIs from various aggregated and non-traditional data sources.
 *
 * This hook simulates the complex aggregation and AI-driven analysis required to produce
 * high-level, forward-looking metrics for an enterprise. It's intended to provide
 * the "north star" KPIs that guide the visionary CEO's strategic decisions.
 *
 * Business Value: This hook underpins strategic foresight and agility by:
 * - **Distilling Complexity**: Aggregates disparate data points (market sentiment, AI operational efficiency,
 *   ecosystem health, predictive risk) into easily digestible, strategic indicators.
 * - **Enabling Proactive Strategy**: Provides insights into emerging trends and potential shifts,
 *   allowing the CEO to steer the organization proactively rather than reactively.
 * - **Fueling Visionary Leadership**: Supplies the data needed to articulate and validate
 *   long-term strategic goals, supporting narratives of innovation and future market dominance.
 * - **Simulating AI-driven Intelligence**: Demonstrates the potential for autonomous agents
 *   to synthesize information and present actionable strategic intelligence without human bias or delay.
 *
 * @param {UseStrategicKpiDataConfig} config Configuration options for the hook.
 * @returns {{
 *   strategicKpis: StrategicKpi[];
 *   isLoading: boolean;
 *   error: string | null;
 *   refetch: () => void;
 * }} An object containing the strategic KPIs, loading state, error, and a refetch function.
 */
export const useStrategicKpiData = (config?: UseStrategicKpiDataConfig) => {
  const { enableRealtimeUpdates = true, refreshInterval = 15000 } = config || {};

  const [strategicKpis, setStrategicKpis] = useState<StrategicKpi[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Simulates fetching and processing strategic KPI data from various sources.
   * This function generates dynamic values to mimic real-time shifts and trends.
   * Each KPI value is designed to fluctuate realistically.
   */
  const fetchStrategicKpiData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

      const generateRandomTrend = () => {
        const r = Math.random();
        if (r < 0.3) return 'up';
        if (r < 0.6) return 'down';
        if (r < 0.8) return 'volatile';
        return 'stable';
      };

      const generateFluctuatingValue = (base: number, volatility: number, isPercentage = false) => {
        const fluctuation = (Math.random() - 0.5) * 2 * volatility; // -volatility to +volatility
        let newValue = base + fluctuation;
        if (isPercentage) {
          newValue = Math.max(0, Math.min(100, newValue)); // Keep percentages between 0 and 100
        } else {
          newValue = Math.max(0, newValue); // No negative values for most KPIs
        }
        return parseFloat(newValue.toFixed(isPercentage ? 1 : 2));
      };

      const now = new Date();

      const simulatedKpis: StrategicKpi[] = [
        {
          id: 'EVCI',
          name: 'Ecosystem Value Creation Index',
          value: generateFluctuatingValue(1250, 50),
          unit: 'points',
          trend: generateRandomTrend(),
          description: 'Holistic measure of value generated across our entire digital ecosystem, beyond direct revenue.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'AI-Driven Predictive Model',
        },
        {
          id: 'DAS',
          name: 'Decentralized Autonomy Score',
          value: generateFluctuatingValue(88.5, 2.5, true),
          unit: '%',
          trend: generateRandomTrend(),
          description: 'Quantifies the successful autonomous operation rate of AI agents and smart contracts.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'Agentic System Telemetry',
        },
        {
          id: 'MMV',
          name: 'Market Mindshare Velocity',
          value: generateFluctuatingValue(7.2, 0.8),
          unit: 'rank',
          trend: generateRandomTrend(),
          description: 'Speed and reach of our brand influence across emerging digital landscapes and communities.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'Cross-Platform Sentiment Analysis',
        },
        {
          id: 'PRMI',
          name: 'Proactive Risk Mitigation Index',
          value: generateFluctuatingValue(92.1, 1.8, true),
          unit: '%',
          trend: generateRandomTrend(),
          description: 'Effectiveness of AI in preventing financial, operational, and security incidents proactively.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'Predictive Threat Intelligence',
        },
        {
          id: 'AWAR',
          name: 'Agentic Workflow Adoption Rate',
          value: generateFluctuatingValue(65.7, 4.2, true),
          unit: '%',
          trend: generateRandomTrend(),
          description: 'Percentage of critical business processes successfully executed by autonomous AI agents.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'Internal Process Automation Logs',
        },
        {
          id: 'CCIS',
          name: 'Cross-Chain Interoperability Score',
          value: generateFluctuatingValue(8.9, 0.5),
          unit: '/10',
          trend: generateRandomTrend(),
          description: 'Seamlessness and efficiency of assets/data movement across disparate blockchain networks.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'Decentralized Network Analytics',
        },
        {
          id: 'TESI',
          name: 'Token Economic Stability Index',
          value: generateFluctuatingValue(785, 30),
          unit: 'points',
          trend: generateRandomTrend(),
          description: 'Composite score reflecting the health, liquidity, and long-term viability of our native token economy.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'Tokenomics Modeling & Market Data',
        },
        {
          id: 'PRCS',
          name: 'Predictive Regulatory Compliance Score',
          value: generateFluctuatingValue(95.3, 1.0, true),
          unit: '%',
          trend: generateRandomTrend(),
          description: 'AI-driven assessment of adherence to anticipated future regulations, identifying proactive adjustments.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'Regulatory Intelligence AI',
        },
        {
          id: 'SIQ',
          name: 'Sustainable Innovation Quotient',
          value: generateFluctuatingValue(7.8, 0.7),
          unit: '/10',
          trend: generateRandomTrend(),
          description: 'Rate of new, environmentally conscious, and socially responsible feature deployments and product iterations.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'R&D Portfolio Analysis',
        },
        {
          id: 'DTRS',
          name: 'Digital Trust and Reputation Score',
          value: generateFluctuatingValue(84.9, 2.0, true),
          unit: '%',
          trend: generateRandomTrend(),
          description: 'Comprehensive metric from sentiment analysis, security audits, and user reviews across all platforms.',
          lastUpdated: format(now, 'MMM d, h:mm:ss a'),
          source: 'Security & Reputation Monitoring',
        },
      ];
      setStrategicKpis(simulatedKpis);
    } catch (e) {
      console.error("Failed to fetch strategic KPIs:", e);
      setError("Failed to load strategic KPIs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to fetch initial data and set up real-time updates
  useEffect(() => {
    fetchStrategicKpiData();

    let intervalId: NodeJS.Timeout;
    if (enableRealtimeUpdates) {
      intervalId = setInterval(fetchStrategicKpiData, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchStrategicKpiData, enableRealtimeUpdates, refreshInterval]);

  // Expose a refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchStrategicKpiData();
  }, [fetchStrategicKpiData]);

  return { strategicKpis, isLoading, error, refetch };
};

export default useStrategicKpiData;