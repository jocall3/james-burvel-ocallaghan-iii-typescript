// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from "react";
import { cn } from "~/common/utilities/cn";
import {
  ButtonClickEventTypes,
  Clickable,
  CopyableText,
} from "~/common/ui-components";

// --- Mock Data & Types for "Epic" Integration ---
type IntegrationStatus = "connected" | "disconnected" | "connecting" | "error";

interface ExternalApp {
  id: string;
  name: string;
  logoUrl: string; // For a more visual "epic" feel
  description: string;
  status: IntegrationStatus;
  apiKey?: string; // Optional, some apps might use OAuth, others API keys
  isAIApp?: boolean; // To identify AI-focused apps like Gemini
  features?: string[]; // What features this integration provides
}

const initialApps: ExternalApp[] = [
  {
    id: "gemini-ai",
    name: "Google Gemini AI",
    logoUrl: "https://www.gstatic.com/images/branding/product/2x/gemini_2023_48dp.png", // Mock logo
    description: "Unleash cutting-edge AI for insights, content generation, and intelligent automation across your financial data.",
    status: "disconnected",
    isAIApp: true,
    features: ["Strategic Insights", "Content Generation", "Predictive Analytics"],
  },
  {
    id: "sales-crm",
    name: "SalesMaster CRM", // Generic CRM, could be Salesforce, HubSpot
    logoUrl: "https://cdn-icons-png.flaticon.com/512/3796/3796695.png", // Mock CRM logo
    description: "Synchronize rich customer data, automate sales workflows, and enhance client relationship management.",
    status: "disconnected",
    apiKey: "sk-crm-xxxxxxxxxxxxxxxxxxxx-uniqueid", // Example API key
    features: ["Customer 360", "Lead Management", "Sales Automation"],
  },
  {
    id: "marketing-suite",
    name: "MarketingPro Suite",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/2807/2807106.png", // Mock marketing logo
    description: "Automate sophisticated marketing campaigns, track performance, and personalize customer journeys for maximum impact.",
    status: "error", // Simulate an initial error state
    features: ["Campaign Automation", "Performance Analytics", "Personalization"],
  },
  {
    id: "data-warehouse",
    name: "DataVault Analytics",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/860/860473.png", // Mock data warehouse logo
    description: "Securely centralize and analyze vast amounts of financial data for robust reporting and strategic decision-making.",
    status: "connected",
    features: ["Data Consolidation", "BI Reporting", "Secure Storage"],
  },
];

// --- Helper component for API Key display (adapted from original logic) ---
function AppApiKeyDisplay({
  apiKey,
  loading,
  onReveal,
}: {
  apiKey: string;
  loading: boolean;
  onReveal: () => void; // Callback when API key is "revealed"
}) {
  const [showFullSecret, setShowFullSecret] = useState(false);

  if (!apiKey) {
    return null;
  }

  const truncatedSecret = `•••• ${apiKey.slice(
    apiKey.length - 4,
    apiKey.length,
  )}`;

  const keySecret = showFullSecret && !loading ? apiKey : truncatedSecret;

  const handleClick = (event: ButtonClickEventTypes) => {
    event.stopPropagation(); // Prevent propagation to parent elements

    if (!showFullSecret) {
      onReveal(); // Notify parent, e.g., for audit logging
    }
    setShowFullSecret(!showFullSecret);
  };

  return (
    <div className="fs-exclude flex items-center bg-gray-700 px-3 py-1 rounded-md shadow-inner text-sm font-mono">
      {showFullSecret ? (
        <CopyableText text={keySecret}>
          <code className="text-gray-200 break-all">{keySecret}</code>
        </CopyableText>
      ) : (
        <code className="text-gray-400 break-all">{truncatedSecret}</code>
      )}
      <div
        className={cn("btn hover:text-green-800 ml-auto", { // ml-auto to push button to the right
          "pl-0": showFullSecret,
        })}
      >
        <Clickable onClick={handleClick}>
          <span className="ml-2 text-green-400 hover:text-green-300 transition-colors duration-200">
            {showFullSecret ? "Hide" : "Show"}
          </span>
        </Clickable>
      </div>
    </div>
  );
}

// --- Main IntegrationHub Component: The Epicenter of Our External Apps ---
function IntegrationHub() {
  const [apps, setApps] = useState<ExternalApp[]>(initialApps);
  const [loadingAppId, setLoadingAppId] = useState<string | null>(null);
  const [geminiInsights, setGeminiInsights] = useState<string | null>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const handleConnectToggle = useCallback((appId: string) => {
    setLoadingAppId(appId);
    setApps((prevApps) =>
      prevApps.map((app) =>
        app.id === appId
          ? { ...app, status: app.status === "connected" ? "disconnected" : "connecting" }
          : app
      )
    );

    // Simulate an asynchronous API call delay for connection/disconnection
    setTimeout(() => {
      setApps((prevApps) =>
        prevApps.map((app) =>
          app.id === appId
            ? { ...app, status: app.status === "connecting" ? "connected" : "disconnected" }
            : app
        )
      );
      setLoadingAppId(null);
      // If Gemini is disconnected, clear any existing insights
      if (appId === "gemini-ai" && apps.find(a => a.id === appId)?.status === "connected") {
          setGeminiInsights(null);
      }
    }, 1500 + Math.random() * 1000); // Simulate 1.5 to 2.5 seconds of processing
  }, [apps]);

  const handleRevealApiKey = useCallback((appId: string) => {
    // In a real commercial application, this action would trigger:
    // 1. Backend audit log entry (who, when, which key)
    // 2. Potentially a re-authentication prompt or MFA for high-security keys
    // 3. This function doesn't actually 'reveal' from backend, just logs intent.
    console.log(`[SECURITY AUDIT] API key for ${appId} was revealed to the user.`);
  }, []);

  const handleGenerateGeminiInsights = useCallback(() => {
    setGeneratingInsights(true);
    // Simulate Gemini AI's complex analytical process
    setTimeout(() => {
      const insights = [
        "✨ Gemini AI cross-referenced SalesMaster CRM and MarketingPro Suite data, identifying a 15% untapped market segment in Q3. Focus personalized campaigns on leads with high interaction scores and lapsed engagement.",
        "💡 Predictive analytics by Gemini indicate a potential 8% increase in Q4 revenue by optimizing credit offerings based on DataVault Analytics historical customer behavior patterns.",
        "📊 Gemini's anomaly detection module flagged an unusual spike in transaction failures in a specific region, suggesting a potential fraud attempt or system malfunction for immediate investigation.",
        "🚀 Automated compliance check via Gemini: All integrated financial reports are 100% compliant with current regulatory standards, saving 20 hours of manual review this week.",
      ];
      setGeminiInsights(insights[Math.floor(Math.random() * insights.length)]);
      setGeneratingInsights(false);
    }, 3500 + Math.random() * 1500); // Simulate 3.5 to 5 seconds for AI processing
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 via-zinc-950 to-black text-white min-h-screen font-sans antialiased">
      <header className="mb-14 text-center">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-sky-500 to-indigo-600 animate-pulse-slow tracking-tight drop-shadow-lg">
          Citibank Fusion Integration Hub
        </h1>
        <p className="mt-5 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          The ultimate platform to seamlessly connect, empower, and revolutionize your financial enterprise with cutting-edge AI and global applications.
        </p>
      </header>

      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {apps.map((app) => (
          <div
            key={app.id}
            className={cn(
              "relative bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-7 border-2 transform transition-all duration-500 hover:scale-102 hover:shadow-green-900/40 flex flex-col justify-between",
              {
                "border-green-500 shadow-green-700/30": app.status === "connected",
                "border-blue-500 shadow-blue-700/30": app.status === "connecting",
                "border-red-500 shadow-red-700/30": app.status === "error",
                "border-gray-700": app.status === "disconnected",
              }
            )}
          >
            <div>
              <div className="flex items-center mb-5">
                {app.logoUrl && (
                  <img src={app.logoUrl} alt={`${app.name} logo`} className="w-12 h-12 mr-4 rounded-full shadow-lg p-1 bg-gradient-to-br from-gray-700 to-gray-900" />
                )}
                <h2 className="text-2xl font-bold text-white leading-tight">{app.name}</h2>
              </div>
              <p className="text-gray-400 mb-5 text-sm leading-relaxed min-h-[60px]">{app.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {app.features?.map(feature => (
                  <span key={feature} className="px-3 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full font-medium shadow-md">
                    {feature}
                  </span>
                ))}
              </div>

              {app.apiKey && (
                <div className="mb-6">
                  <span className="block text-gray-500 text-xs mb-2">API Key:</span>
                  <AppApiKeyDisplay
                    apiKey={app.apiKey}
                    loading={loadingAppId === app.id && app.status === "connecting"}
                    onReveal={() => handleRevealApiKey(app.id)}
                  />
                </div>
              )}
            </div>

            <div className="mt-auto"> {/* Pushes controls to the bottom */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-700">
                <span
                  className={cn("px-4 py-2 rounded-full text-xs font-semibold shadow-md", {
                    "bg-green-600 text-white": app.status === "connected",
                    "bg-blue-600 text-white animate-pulse": app.status === "connecting",
                    "bg-red-600 text-white": app.status === "error",
                    "bg-gray-600 text-white": app.status === "disconnected",
                  })}
                >
                  {app.status === "connecting"
                    ? "Connecting..."
                    : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
                <Clickable
                  onClick={() => handleConnectToggle(app.id)}
                  className={cn(
                    "px-7 py-3 rounded-full text-white font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg",
                    {
                      "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700":
                        app.status !== "connected",
                      "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700":
                        app.status === "connected",
                      "opacity-60 cursor-not-allowed hover:scale-100 hover:shadow-none": loadingAppId === app.id,
                    }
                  )}
                  disabled={loadingAppId === app.id}
                >
                  {loadingAppId === app.id
                    ? "Processing..."
                    : app.status === "connected"
                    ? "Disconnect"
                    : "Connect"}
                </Clickable>
              </div>

              {/* AI Insights Section for Gemini, a unique 'million-dollar' feature */}
              {app.isAIApp && app.status === "connected" && (
                <div className="mt-8 pt-7 border-t border-blue-700/50">
                  <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
                    <span className="mr-3 text-2xl animate-bounce-slow">🧠</span> Fusion AI Insights
                  </h3>
                  {geminiInsights ? (
                    <p className="text-lg text-blue-200 bg-gray-700/60 p-5 rounded-lg italic shadow-inner border border-blue-800 mb-5 leading-relaxed">
                      {geminiInsights}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                      Leverage Gemini&rsquo;s immense intelligence to analyze data across all connected apps and generate actionable, strategic recommendations.
                    </p>
                  )}
                  <Clickable
                    onClick={handleGenerateGeminiInsights}
                    className={cn(
                      "w-full px-5 py-3 rounded-full text-white font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-xl",
                      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                      {
                        "opacity-60 cursor-not-allowed hover:scale-100 hover:shadow-none": generatingInsights,
                      }
                    )}
                    disabled={generatingInsights}
                  >
                    {generatingInsights ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Epic Insights...
                        </span>
                    ) : "Generate Fusion AI Insights"}
                  </Clickable>
                </div>
              )}

              {/* Example of showing a persistent error state */}
              {app.status === "error" && (
                  <div className="mt-6 pt-5 border-t border-red-700/50 text-red-400 text-sm flex items-center bg-red-900/20 p-3 rounded-md">
                      <span className="mr-2 text-lg">🚨</span> Integration failed. Please review your credentials or configuration settings.
                  </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-24 text-center text-gray-500 text-sm opacity-80">
        <p>
          &copy; 2023 Citibank Fusion Inc. All rights reserved. Pioneering the future of intelligent finance.
        </p>
        <p className="mt-1 text-xs">
          Built with passion, precision, and a relentless pursuit of perfection.
        </p>
      </footer>
    </div>
  );
}

export default IntegrationHub;