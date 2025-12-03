import React, { useState, useEffect } from "react";
import { Clickable, Drawer } from "../../common/ui-components";

import CounterpartyView from "../containers/CounterpartyView";

// A simple Icon component for demonstration. In a real application,
// this would likely come from a dedicated UI component library or icon set.
// This ensures the code is fully executable without needing external icon library setup.
function Icon({ name, className }: { name: string; className?: string }) {
  const iconMap: { [key: string]: string } = {
    sparkles: "✨", // Represents AI/magic
    building: "🏢", // Represents a company/counterparty
    globe: "🌐", // Represents global data/external apps
    "arrow-right": "➡️", // Represents an action
  };
  return (
    <span className={`inline-block align-middle ${className}`} aria-hidden="true">
      {iconMap[name] || ""}
    </span>
  );
}

interface GeminiEnhancedCounterpartyPanelProps {
  counterpartyId: string;
}

function GeminiEnhancedCounterpartyPanel({
  counterpartyId,
}: GeminiEnhancedCounterpartyPanelProps) {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [externalAppData, setExternalAppData] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [isLoadingExternal, setIsLoadingExternal] = useState(true);

  useEffect(() => {
    // Simulate fetching AI insights from Gemini (or a hypothetical AI service)
    setIsLoadingAI(true);
    const fetchAiInsights = setTimeout(() => {
      // This is where a real API call to Gemini (or a custom AI endpoint) would occur.
      // The text below is illustrative of a high-value, AI-generated insight.
      setAiInsights(
        `Gemini AI: For ${counterpartyId}, predictive analytics indicate a 12.5% increase in credit risk over the next 6 months due to emerging market volatility. AI-driven sentiment analysis on global news suggests strategic opportunities in sustainable finance. Key action: Proactively engage with our 'Quantum Growth' initiative to mitigate risk and unlock new revenue streams.`
      );
      setIsLoadingAI(false);
    }, 2500); // Simulate network latency and processing time

    // Simulate fetching data from other critical external applications (e.g., Bloomberg, Refinitiv, Salesforce)
    setIsLoadingExternal(true);
    const fetchExternalData = setTimeout(() => {
      // This is where real API calls to various external financial data and CRM services would occur.
      setExternalAppData(
        `External Ecosystem: Bloomberg Terminal shows recent bond issuance success for ${counterpartyId}. Refinitiv Eikon indicates a stable ESG rating. Salesforce CRM reports multiple high-value, open opportunities for our Private Banking division. A holistic view is critical for maximizing shareholder value.`
      );
      setIsLoadingExternal(false);
    }, 1800); // Simulate network latency

    return () => {
      clearTimeout(fetchAiInsights);
      clearTimeout(fetchExternalData);
    };
  }, [counterpartyId]);

  return (
    <div className="p-8 md:p-12 lg:p-16 bg-gradient-to-br from-gray-950 via-indigo-900 to-purple-950 text-white min-h-screen font-sans">
      <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-600 mb-10 text-center drop-shadow-lg">
        Epic Counterparty Intelligence: {counterpartyId}
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
        {/* Core Counterparty Information Panel */}
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl border border-purple-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-[1.01]">
          <h3 className="text-3xl font-bold text-indigo-300 mb-6 flex items-center">
            <Icon name="building" className="mr-4 text-purple-400 text-4xl" />
            Strategic Counterparty Overview
          </h3>
          <div className="text-gray-300 text-lg leading-relaxed mb-6">
            {/* The original CounterpartyView component, integrated seamlessly */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <CounterpartyView match={{ params: { counterparty_id: counterpartyId } }} />
          </div>
          <button className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
            Dive Deeper into Core Data
            <Icon name="arrow-right" className="ml-3 inline-block" />
          </button>
        </div>

        {/* Gemini AI Powered Insights Panel */}
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl border border-pink-700 relative overflow-hidden hover:border-pink-500 transition-all duration-300 transform hover:scale-[1.01]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 opacity-20 blur-sm rounded-3xl"></div>
          <h3 className="text-3xl font-bold text-pink-300 mb-6 flex items-center relative z-10">
            <Icon name="sparkles" className="mr-4 text-pink-400 text-4xl" />
            Gemini AI: Predictive Alpha Generation
          </h3>
          <div className="relative z-10 text-gray-300 min-h-[150px] flex flex-col justify-center">
            {isLoadingAI ? (
              <div className="flex flex-col items-center justify-center p-8">
                {/* Inline SVG for a high-quality loading spinner */}
                <svg
                  className="animate-spin h-10 w-10 text-pink-400 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-xl font-semibold text-purple-200">
                  Deploying Gemini AI for deep analysis...
                </span>
              </div>
            ) : (
              <p className="leading-loose text-xl italic text-purple-200">
                &ldquo;{aiInsights}&rdquo;
              </p>
            )}
          </div>
          <button className="mt-8 px-8 py-3 bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 relative z-10">
            Generate AI-Driven Action Plan
            <Icon name="arrow-right" className="ml-3 inline-block" />
          </button>
        </div>
      </div>

      {/* External Ecosystem Integration Panel */}
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl border border-indigo-700 relative overflow-hidden hover:border-indigo-500 transition-all duration-300 transform hover:scale-[1.01]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900 opacity-20 blur-sm rounded-3xl"></div>
        <h3 className="text-3xl font-bold text-blue-300 mb-6 flex items-center relative z-10">
          <Icon name="globe" className="mr-4 text-blue-400 text-4xl" />
          Integrated External Intelligence
        </h3>
        <div className="relative z-10 text-gray-300 min-h-[150px] flex flex-col justify-center">
          {isLoadingExternal ? (
            <div className="flex flex-col items-center justify-center p-8">
              {/* Inline SVG for a high-quality loading spinner */}
              <svg
                className="animate-spin h-8 w-8 text-blue-400 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-xl font-semibold text-cyan-200">
                Synchronizing with external data streams...
              </span>
            </div>
          ) : (
            <p className="leading-loose text-xl text-blue-200">
              &ldquo;{externalAppData}&rdquo;
            </p>
          )}
        </div>
        <div className="mt-8 flex flex-wrap gap-5 relative z-10 justify-center md:justify-start">
          <button className="px-7 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-full shadow-md transform hover:scale-105 transition-all duration-300">
            Launch Bloomberg Terminal
          </button>
          <button className="px-7 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full shadow-md transform hover:scale-105 transition-all duration-300">
            Access CRM for Deep Dive
          </button>
          <button className="px-7 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-full shadow-md transform hover:scale-105 transition-all duration-300">
            Refinitiv Advanced Analytics
          </button>
        </div>
      </div>

      <div className="mt-16 text-center text-gray-400 text-sm font-light">
        <p className="text-lg mb-2">
          Powered by Citibank Demo Business Inc. &mdash; Revolutionizing Financial Intelligence.
        </p>
        <p className="text-sm">
          &copy; 2023 All Rights Reserved. This platform delivers unparalleled insights
          for strategic advantage.
        </p>
        <p className="text-xs mt-1 opacity-70">
          Not an offer or solicitation. Past performance is not indicative of future results.
        </p>
      </div>
    </div>
  );
}

export function counterpartyDrawer(counterpartyId: string) {
  const trigger = (
    <Clickable onClick={() => {}}>
      <div className="text-blue-500 hover:text-blue-600 font-extrabold text-xl p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all duration-300 shadow-md transform hover:scale-105 cursor-pointer flex items-center justify-center">
        <span className="mr-2">🚀</span> {counterpartyId}
        <span className="ml-3 text-sm opacity-80 font-medium italic">
          &mdash; View Ultimate Profile
        </span>
      </div>
    </Clickable>
  );

  // The path is updated to reflect the new, enhanced view, suggesting a distinct route.
  const counterpartyPath = `/counterparties/${counterpartyId}/ultimate-intelligence-dashboard`;

  return (
    // Assuming Drawer can take a 'size' or 'width' prop for a wider, more immersive experience.
    // 'xxl' or similar custom large size for an "epic" feel.
    <Drawer trigger={trigger} path={counterpartyPath} size="xxl">
      <GeminiEnhancedCounterpartyPanel counterpartyId={counterpartyId} />
    </Drawer>
  );
}