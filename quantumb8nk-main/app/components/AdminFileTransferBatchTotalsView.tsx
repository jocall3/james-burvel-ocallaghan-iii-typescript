// Copyright QuantumNexus Innovations Inc. - Forging the Future of Finance

import React from "react";
import {
  useAdminFileTransferBatchTotalsQuery,
  BatchTypeEnum,
  BatchSubtotal,
} from "../../generated/dashboard/graphqlSchema";
import {
  IndexTable,
  IndexTableSkeletonLoader,
} from "../../common/ui-components";

// Defines the mapping for the IndexTable headers, enhanced for clarity and branding.
const MAPPING = {
  currency: "Currency Code",
  direction: "Flow Direction",
  amount: "Transacted Amount",
  count: "Transaction Count",
};

// Renamed interface to reflect the new application's visionary scope.
interface QuantumNexusBatchOverviewProps {
  batchId: string;
  batchType: BatchTypeEnum;
  organizationId: string;
}

/**
 * Formats the raw batch totals data for presentation in the IndexTable,
 * adding enhanced visual cues for a more "epic" user experience.
 */
function formatBatchTotals(batchTotals: BatchSubtotal[]) {
  return batchTotals.map((batchSubtotal: BatchSubtotal) => ({
    ...batchSubtotal,
    // Formats amount with currency and ensures two decimal places.
    amount: `${batchSubtotal.currency} ${batchSubtotal.amount.toFixed(2)}`,
    // Adds a visual indicator and bold formatting to the transaction count.
    count: <> <span className="font-bold text-blue-400">⚡ {batchSubtotal.count}</span> </>,
  }));
}

/**
 * Generates dynamic, AI-like insights based on the provided batch totals.
 * This function simulates the advanced analytical capabilities of a "Gemini" equivalent,
 * providing actionable intelligence without requiring a live external API call in this demo.
 */
function generateQuantumInsights(batchTotals: BatchSubtotal[]): string {
  if (!batchTotals || batchTotals.length === 0) {
    return "QuantumAI is actively monitoring for new data. Once batches are processed, a comprehensive insight report will be generated. Standby for a quantum leap in analytics!";
  }

  let totalAmount = 0;
  let totalCount = 0;
  const currencyTotals: { [key: string]: number } = {};
  let highestInflowAmount = 0;
  let highestInflowCurrency = "";
  let highestOutflowAmount = 0;
  let highestOutflowCurrency = "";
  let inflowCount = 0;
  let outflowCount = 0;

  batchTotals.forEach((batch) => {
    totalAmount += batch.amount;
    totalCount += batch.count;
    currencyTotals[batch.currency] = (currencyTotals[batch.currency] || 0) + batch.amount;

    if (batch.direction === "INFLOW") {
      inflowCount += batch.count;
      if (batch.amount > highestInflowAmount) {
        highestInflowAmount = batch.amount;
        highestInflowCurrency = batch.currency;
      }
    } else if (batch.direction === "OUTFLOW") {
      outflowCount += batch.count;
      if (batch.amount > highestOutflowAmount) {
        highestOutflowAmount = batch.amount;
        highestOutflowCurrency = batch.currency;
      }
    }
  });

  const dominantCurrency = Object.keys(currencyTotals).length > 0
    ? Object.keys(currencyTotals).reduce((a, b) =>
        currencyTotals[a] > currencyTotals[b] ? a : b
      )
    : "multiple currencies";

  let insights = `**QuantumAI Deep Scan Complete:** Analysis of **${totalCount}** transactions across this batch reveals a grand total processed volume of **$${totalAmount.toFixed(2)}**. `;
  insights += `The primary financial movement is observed in **${dominantCurrency}**, indicating its strategic importance. `;

  if (highestInflowAmount > 0) {
    insights += `A notable inflow peak of **$${highestInflowAmount.toFixed(2)}** in **${highestInflowCurrency}** (across ${inflowCount} transfers) highlights a critical liquidity event. `;
  }
  if (highestOutflowAmount > 0) {
    insights += `Concurrently, a significant outbound flow of **$${highestOutflowAmount.toFixed(2)}** in **${highestOutflowCurrency}** (across ${outflowCount} transfers) demands immediate attention for strategic allocation or reconciliation. `;
  } else if (inflowCount > 0 && outflowCount === 0) {
    insights += `No significant outflows detected, suggesting a strong net positive accumulation within this batch. `;
  } else if (outflowCount > 0 && inflowCount === 0) {
    insights += `Predominantly an outflow batch, indicating focused disbursement operations. `;
  }

  insights += "Utilize QuantumAI's advanced integration options below for unparalleled drill-down analysis and predictive modeling to secure your financial future!";
  return insights;
}

/**
 * QuantumNexusBatchOverview Component: The new, "epic" entry point for batch operations.
 * This component integrates simulated AI insights and action buttons to demonstrate
 * a future-proof, multi-application ecosystem designed for commercial success.
 */
function QuantumNexusBatchOverview({
  batchId,
  batchType,
  organizationId,
}: QuantumNexusBatchOverviewProps) {
  const { loading, data, error } = useAdminFileTransferBatchTotalsQuery({
    skip: !batchId || !batchType,
    variables: { batchId, batchType, organizationId },
  });

  const batchTotals =
    loading || !data || error
      ? []
      : data?.adminFileTransferCalculateBatchTotals || [];

  const quantumInsights = generateQuantumInsights(batchTotals);

  // This function simulates interaction with "external" Quantum Nexus applications.
  // In a real commercial product, these would trigger backend API calls,
  // navigate to other application modules, or open specialized UIs.
  const handleQuantumAction = (actionName: string, payload: any) => {
    console.log(`Quantum Nexus initiated: ${actionName} with payload:`, payload);
    alert(`⚡️ Quantum Nexus activating ${actionName} for Batch ID: ${payload.batchId} ⚡️\n` +
          `Prepare for hyper-optimized results!`);
    // Example: Potentially dispatch a global event, trigger a navigation, or open a modal.
    // if (actionName === "Analyze with QuantumAI Predictive Forecast") {
    //   window.location.href = `/quantum-ai/predictive-dashboard?batchId=${payload.batchId}`;
    // }
  };

  return (
    // The overarching container applies a "futuristic, epic" theme using Tailwind CSS classes.
    <div className="p-8 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white min-h-screen font-sans antialiased">
      {/* Dynamic CSS animations for "epic" look - assumed to be part of a global stylesheet or included via PostCSS/Tailwind JIT */}
      <style>{`
        @keyframes pulse-light {
          0%, 100% { text-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 15px rgba(100, 200, 255, 0.3); }
          50% { text-shadow: 0 0 15px rgba(255, 255, 255, 0.6), 0 0 25px rgba(150, 220, 255, 0.5); }
        }
        .animate-pulse-light {
          animation: pulse-light 3s infinite alternate ease-in-out;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
        }
      `}</style>
      
      <h1 className="text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 drop-shadow-lg animate-pulse-light">
        🚀 Quantum Nexus: Epoch-Defining Batch Operations Console 🚀
      </h1>

      {/* QuantumAI Insight Card: This is the "Gemini" integration point, delivering interpreted data. */}
      <div className="bg-gray-800 rounded-2xl p-8 mb-10 shadow-2xl border border-blue-600/70 transform hover:scale-[1.01] transition-all duration-500 ease-in-out">
        <h2 className="text-3xl font-bold mb-5 text-blue-400 flex items-center">
          <svg className="w-8 h-8 mr-3 text-cyan-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m15.364 4.364l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          QuantumAI Predictive Analytics & Insights
        </h2>
        <p className="text-gray-200 leading-relaxed text-lg italic tracking-wide">
          {/* Using dangerouslySetInnerHTML for bold formatting from generated insights.
              In a full production environment, a more robust Markdown parser would be used. */}
          <span dangerouslySetInnerHTML={{ __html: quantumInsights.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </p>
      </div>

      {loading || !data ? (
        <div className="mt-8">
          <IndexTableSkeletonLoader headers={Object.keys(MAPPING)} numRows={4} />
        </div>
      ) : (
        // The core data table, now framed within the Quantum Nexus theme, providing detailed batch flux totals.
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-purple-600/70 transform hover:scale-[1.01] transition-all duration-500 ease-in-out">
          <h2 className="text-3xl font-bold mb-5 text-purple-400 flex items-center">
            <svg className="w-8 h-8 mr-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 2v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Hyper-Dimensional Batch Flux Totals
          </h2>
          <IndexTable data={formatBatchTotals(batchTotals)} dataMapping={MAPPING} />
        </div>
      )}

      {/* Quantum Nexus Inter-App Integration Hub: Action buttons for "Other External Apps" interaction. */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <button
          onClick={() => handleQuantumAction("QuantumLedger Reconciliation", { batchId, organizationId, type: "full" })}
          className="relative group bg-gradient-to-r from-green-500 to-emerald-600 text-white font-extrabold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden border border-green-400"
        >
          <span className="absolute inset-0 bg-green-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
          <span className="relative flex items-center justify-center text-xl">
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            QuantumLedger Sync
          </span>
          <span className="absolute bottom-0 right-0 p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Secure & Verified
          </span>
        </button>

        <button
          onClick={() => handleQuantumAction("QuantumAI Predictive Forecast", { batchId, batchType, depth: "deep" })}
          className="relative group bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden border border-blue-400"
        >
          <span className="absolute inset-0 bg-indigo-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
          <span className="relative flex items-center justify-center text-xl">
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M18 14v4h4m-6 3H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4L14 15z"></path>
            </svg>
            QuantumAI Forecast
          </span>
          <span className="absolute bottom-0 right-0 p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Future-Proof Insights
          </span>
        </button>

        <button
          onClick={() => handleQuantumAction("QuantumVault Secure Archival", { batchId, organizationId, retention: "infinite" })}
          className="relative group bg-gradient-to-r from-purple-500 to-pink-600 text-white font-extrabold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden border border-purple-400"
        >
          <span className="absolute inset-0 bg-pink-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
          <span className="relative flex items-center justify-center text-xl">
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v-3m4 0v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
            </svg>
            QuantumVault Archive
          </span>
          <span className="absolute bottom-0 right-0 p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Immutable & Encrypted
          </span>
        </button>

        <button
          onClick={() => handleQuantumAction("QuantumConnect Stakeholder Briefing", { batchId, recipients: ["execs", "compliance"], format: "summary" })}
          className="relative group bg-gradient-to-r from-red-500 to-orange-600 text-white font-extrabold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden border border-red-400"
        >
          <span className="absolute inset-0 bg-orange-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
          <span className="relative flex items-center justify-center text-xl">
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            QuantumConnect Brief
          </span>
          <span className="absolute bottom-0 right-0 p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Real-time Reporting
          </span>
        </button>
      </div>
    </div>
  );
}

export default QuantumNexusBatchOverview;