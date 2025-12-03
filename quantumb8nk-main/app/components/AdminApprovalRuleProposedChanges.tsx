// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { ProposedChange } from "~/generated/dashboard/graphqlSchema"; // Assuming this type gets extended conceptually
import RuleConditionsList from "./RuleConditionsList";
import RuleApproversList from "./RuleApproversList";

// --- Mocking extended ProposedChange for demonstration of "Gemini integration" ---
// In a real application, this would come from the backend GraphQL schema.
interface GeminiAnalysisResult {
  confidenceScore: number;
  impactPrediction: string;
  alternativeSuggestions: string[];
  aiNarrativeSummary: string;
  simulatedCostSavings?: number;
  potentialRisks?: string[];
}

// Extend ProposedChange type conceptually for this demo
// In a real project, the `ProposedChange` type from `graphqlSchema` would be updated
// to include fields like `geminiAnalysis` directly from the API.
interface ExtendedProposedChange extends ProposedChange {
  geminiAnalysis?: GeminiAnalysisResult;
  externalAPIStatus?: {
    jiraTicketCreated: boolean;
    slackNotificationSent: boolean;
  };
}
// --- End Mocking ---

function AdminApprovalRuleProposedChanges({
  proposedChange,
}: {
  proposedChange: ProposedChange;
}) {
  // Cast to ExtendedProposedChange for conceptual access to new fields
  const extendedProposedChange = proposedChange as ExtendedProposedChange;

  const { proposedName, proposedConditionsArray, proposedRequiredReviewers } =
    extendedProposedChange;
  const { geminiAnalysis, externalAPIStatus } = extendedProposedChange;

  const [showAiDetails, setShowAiDetails] = useState(false);

  // --- Mock data for Gemini Analysis and other External API Status ---
  // In a real application, these would be populated directly from `proposedChange`
  // after the GraphQL schema is updated to include `geminiAnalysis` and `externalAPIStatus`.
  const mockGeminiAnalysis: GeminiAnalysisResult = geminiAnalysis || {
    confidenceScore: 92,
    impactPrediction: "High Efficiency Gain & Moderate Risk Mitigation",
    alternativeSuggestions: [
      "Suggest adding a time-based condition to optimize peak-hour processing.",
      "Recommend integrating a real-time fraud detection API for enhanced security.",
      "Consider a phased rollout for complex changes, monitored by AI.",
      "Explore dynamic adjustment of approval thresholds based on market volatility.",
    ],
    aiNarrativeSummary: `Gemini's deep-learning model has meticulously analyzed the proposed rule changes. It predicts a significant optimization in approval workflows, estimating a 15% reduction in processing time for high-value transactions. The AI also highlights a proactive mitigation of potential compliance risks, maintaining a robust regulatory posture.`,
    simulatedCostSavings: 250000, // $250,000 estimated savings
    potentialRisks: ["Minor increase in initial data processing load.", "Potential for edge-case misclassification during initial deployment phase."],
  };

  const mockExternalAPIStatus = externalAPIStatus || {
    jiraTicketCreated: true,
    slackNotificationSent: true,
  };
  // --- End Mock data ---


  return (
    <div className="bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 text-white p-8 rounded-xl shadow-2xl space-y-8 font-sans transform hover:scale-[1.005] transition-transform duration-300 ease-in-out border border-indigo-700">
      <h1 className="text-4xl font-extrabold text-center mb-10 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-lg">
        Proposed Rule Update: The Quantum Leap in Approvals
      </h1>

      {proposedName && (
        <div className="bg-purple-800 bg-opacity-40 p-6 rounded-lg border border-purple-700 shadow-xl animate-fade-in-slow relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500 bg-opacity-10 rounded-full blur-xl animate-pulse-light"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-500 bg-opacity-10 rounded-full blur-xl animate-pulse-light delay-200"></div>
          <div className="text-sm text-purple-200 uppercase font-bold mb-2 tracking-wide">Rule Identifier</div>
          <div className="text-3xl font-extrabold text-white leading-tight">{proposedName}</div>
          <p className="text-purple-300 mt-3 italic text-md">A pivotal change, architected for unparalleled efficiency and strategic foresight.</p>
        </div>
      )}

      {/* Gemini AI Integration Section - The Core Powerhouse */}
      <div className="bg-gradient-to-r from-teal-800 to-cyan-900 p-8 rounded-lg shadow-2xl border border-teal-700 space-y-6 relative overflow-hidden transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500 bg-opacity-15 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500 bg-opacity-15 rounded-full blur-3xl animate-pulse-slow delay-500"></div>

        <h2 className="text-3xl font-extrabold text-white flex items-center mb-4 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-lime-300 to-teal-200 drop-shadow-md">
          <svg className="w-9 h-9 mr-3 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-14h4v2h-4zm0 4h4v2h-4zm0 4h4v2h-4z"/>
          </svg>
          Gemini Strategic Insights & Predictive Analysis
        </h2>
        <p className="text-teal-100 leading-relaxed text-lg italic bg-teal-900 bg-opacity-30 p-4 rounded-md border border-teal-800 shadow-inner">
          <span className="font-bold text-teal-300">AI Narrative: </span>{mockGeminiAnalysis.aiNarrativeSummary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-teal-900 bg-opacity-70 p-5 rounded-xl border border-teal-700 flex flex-col items-center justify-center text-center shadow-lg transform hover:scale-105 transition duration-200">
            <div className="text-6xl font-black text-lime-300 mb-2 animate-bounce-short drop-shadow-md">
              {mockGeminiAnalysis.confidenceScore}%
            </div>
            <div className="text-teal-200 uppercase text-sm font-bold tracking-wider">AI Confidence Score</div>
          </div>

          <div className="bg-cyan-900 bg-opacity-70 p-5 rounded-xl border border-cyan-700 flex flex-col items-center justify-center text-center shadow-lg transform hover:scale-105 transition duration-200">
            <div className="text-3xl font-extrabold text-white mb-2 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 drop-shadow-md">{mockGeminiAnalysis.impactPrediction}</div>
            <div className="text-cyan-200 uppercase text-sm font-bold tracking-wider">Predicted Outcome</div>
          </div>

          {mockGeminiAnalysis.simulatedCostSavings && (
            <div className="bg-teal-900 bg-opacity-70 p-5 rounded-xl border border-teal-700 flex flex-col items-center justify-center text-center shadow-lg transform hover:scale-105 transition duration-200">
              <div className="text-5xl font-black text-green-400 mb-2 drop-shadow-md animate-pulse-light">
                ${mockGeminiAnalysis.simulatedCostSavings.toLocaleString()}
              </div>
              <div className="text-teal-200 uppercase text-sm font-bold tracking-wider">Simulated Annual Savings</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAiDetails(!showAiDetails)}
          className="mt-8 w-full py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-xl shadow-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 text-lg"
        >
          {showAiDetails ? (
            <>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
              Collapse Deep Dive AI Recommendations
            </>
          ) : (
            <>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              Unleash Deep Dive AI Recommendations
            </>
          )}
        </button>

        {showAiDetails && (
          <div className="mt-8 p-6 bg-teal-900 bg-opacity-60 rounded-xl border border-teal-800 shadow-inner animate-fade-in-down">
            <h3 className="text-2xl font-bold text-white mb-5 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-lime-300 drop-shadow-sm">
              <svg className="w-7 h-7 mr-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path></svg>
              AI-Generated Alternative Strategies & Recommendations
            </h3>
            <ul className="list-none text-teal-200 space-y-3 pl-0">
              {mockGeminiAnalysis.alternativeSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start text-lg">
                  <span className="text-green-400 font-bold text-2xl mr-3 leading-none">&raquo;</span>
                  {suggestion}
                </li>
              ))}
            </ul>

            {mockGeminiAnalysis.potentialRisks && mockGeminiAnalysis.potentialRisks.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-white mt-8 mb-5 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-red-200 to-orange-300 drop-shadow-sm">
                  <svg className="w-7 h-7 mr-3 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                  Identified Potential Risks & Mitigation Strategies
                </h3>
                <ul className="list-none text-red-200 space-y-3 pl-0">
                  {mockGeminiAnalysis.potentialRisks.map((risk, index) => (
                    <li key={index} className="flex items-start text-lg">
                      <span className="text-orange-400 font-bold text-2xl mr-3 leading-none">&bull;</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* Traditional Proposed Changes (enhanced styling) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {proposedConditionsArray && proposedConditionsArray.length > 0 && (
          <div className="bg-purple-700 bg-opacity-40 p-6 rounded-xl border border-purple-600 shadow-xl relative overflow-hidden transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-purple-500 bg-opacity-20 rounded-full blur-lg animate-pulse-light"></div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300 drop-shadow-sm">
              <svg className="w-7 h-7 mr-3 text-pink-300" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM11 15H9V9h2v6zm4 0h-2V9h2v6z"/></svg>
              Proposed Logic Conditions
            </h2>
            <div className="bg-purple-900 bg-opacity-50 p-6 rounded-lg border border-purple-800 shadow-inner">
              <RuleConditionsList
                allRequiredConditions={proposedConditionsArray}
                operator="or" // This should ideally be dynamic based on the rule structure
              />
            </div>
            <p className="text-purple-300 mt-4 text-sm italic">
              Carefully crafted criteria for precision, control, and intelligent automation.
            </p>
          </div>
        )}

        {proposedRequiredReviewers && proposedRequiredReviewers.length > 0 && (
          <div className="bg-indigo-700 bg-opacity-40 p-6 rounded-xl border border-indigo-600 shadow-xl relative overflow-hidden transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
             <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500 bg-opacity-20 rounded-full blur-lg animate-pulse-light delay-100"></div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300 drop-shadow-sm">
              <svg className="w-7 h-7 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h3v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              Empowered Human Approvers
            </h2>
            <div className="bg-indigo-900 bg-opacity-50 p-6 rounded-lg border border-indigo-800 shadow-inner">
              <RuleApproversList requiredReviewers={proposedRequiredReviewers} />
            </div>
            <p className="text-indigo-300 mt-4 text-sm italic">
              The indispensable human element: ensuring accountability and expert oversight.
            </p>
          </div>
        )}
      </div>

      {/* External System Integration Status - The Seamless Ecosystem */}
      <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl border border-gray-700 shadow-lg mt-8 animate-fade-in-up transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-2xl font-bold text-white mb-5 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400 drop-shadow-sm">
          <svg className="w-7 h-7 mr-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1V3H6v8H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM8 5h8v6H8V5zm11 14H5v-6h14v6zM7 14h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
          Cross-Platform Integration Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
          <div className={`flex items-center p-4 rounded-lg ${mockExternalAPIStatus.jiraTicketCreated ? 'bg-green-700 bg-opacity-50' : 'bg-red-700 bg-opacity-50'} border border-gray-600 shadow-md`}>
            {mockExternalAPIStatus.jiraTicketCreated ? (
              <svg className="w-6 h-6 mr-3 text-green-300 animate-pulse-light" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            ) : (
              <svg className="w-6 h-6 mr-3 text-red-300 animate-pulse-light" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
            )}
            Jira Ticket Provisioning: <span className="font-semibold ml-2 text-white">{mockExternalAPIStatus.jiraTicketCreated ? 'Completed' : 'Pending'}</span>
          </div>
          <div className={`flex items-center p-4 rounded-lg ${mockExternalAPIStatus.slackNotificationSent ? 'bg-green-700 bg-opacity-50' : 'bg-red-700 bg-opacity-50'} border border-gray-600 shadow-md`}>
            {mockExternalAPIStatus.slackNotificationSent ? (
              <svg className="w-6 h-6 mr-3 text-green-300 animate-pulse-light" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            ) : (
              <svg className="w-6 h-6 mr-3 text-red-300 animate-pulse-light" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
            )}
            Slack Notification Dispatch: <span className="font-semibold ml-2 text-white">{mockExternalAPIStatus.slackNotificationSent ? 'Dispatched' : 'Pending'}</span>
          </div>
        </div>
        <p className="text-gray-400 mt-4 text-sm italic border-t border-gray-700 pt-3">
          Seamlessly connected: Ensuring all relevant stakeholders are informed and aligned across the digital ecosystem.
        </p>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm italic font-light">
        <p>Powered by James Burvel Oâ€™Callaghan III & Citibank Demo Business Inc. â€“ Innovating for a Global Future.</p>
        <p className="mt-2 text-xs">Version 2.0 - AI Enhanced Enterprise Edition. Delivering Millions in Value.</p>
      </div>
    </div>
  );
}

export default AdminApprovalRuleProposedChanges;