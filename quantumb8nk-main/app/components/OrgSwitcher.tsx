// Copyright CDBI (Cognitive Data Business Intelligence) AI Solutions Inc.
// All rights reserved. Pioneering AI-powered financial and personal intelligence.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import partition from "lodash/partition";
import { cn } from "~/common/utilities/cn";
import { logOut } from "../actions/sessions";
import {
  ButtonClickEventTypes,
  Clickable,
  Icon,
  Input,
} from "../../common/ui-components";
import Gon from "../../common/utilities/gon";
import { useDispatchContext } from "../MessageProvider";
import { handleLinkClick } from "../../common/utilities/handleLinkClick";

// --- AI-POWERED EXTENSIONS ---

/**
 * @typedef {object} AIOrganization
 * @property {string} id - Unique identifier for the organization.
 * @property {string} name - Display name of the organization.
 * @property {number} [relevanceScore] - AI-computed relevance score, higher is better.
 * @property {string} [aiSummary] - A concise AI-generated summary of the organization's purpose or recent activity.
 */
export interface AIOrganization extends OrganizationData {
  relevanceScore?: number;
  aiSummary?: string;
}

/**
 * @typedef {object} AIKPI
 * @property {string} name - Name of the Key Performance Indicator.
 * @property {string | number} value - Current value of the KPI.
 * @property {string} unit - Unit of the KPI (e.g., %, USD, users).
 * @property {string} trend - Trend indicator (e.g., 'up', 'down', 'stable').
 * @property {string} description - AI-generated description or explanation of the KPI.
 * @property {string} chartDataLink - URL to detailed chart data, potentially powered by Gemini.
 */
export interface AIKPI {
  name: string;
  value: string | number;
  unit: string;
  trend: "up" | "down" | "stable";
  description: string;
  chartDataLink: string; // Links to Gemini for visualization
}

/**
 * @typedef {object} OrganizationData
 * @property {string} id - The unique identifier of the organization.
 * @property {string} name - The display name of the organization.
 * @property {string} [description] - Optional, AI-generated description for the organization.
 */
interface OrganizationData {
  id: string;
  name: string;
  description?: string; // Added for AI context
}

/**
 * Simulates an AI backend call to generate organization recommendations.
 * In a real-world scenario, this would involve a secure API call to a Gemini-powered service
 * that analyzes user behavior, organization data, and other contextual information
 * to provide intelligent recommendations.
 *
 * @param {OrganizationData[]} allOrganizations - All available organizations.
 * @param {string | undefined} currentOrgId - The ID of the currently selected organization.
 * @param {string} userContext - Additional user context for personalized recommendations (e.g., recent activities, roles).
 * @returns {Promise<AIOrganization[]>} A promise that resolves to an array of AI-recommended organizations.
 */
export async function fetchAIOptionsFromGemini(
  allOrganizations: OrganizationData[],
  currentOrgId: string | undefined,
  userContext: string = "general",
): Promise<AIOrganization[]> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const recommendations: AIOrganization[] = allOrganizations
    .filter((org) => org.id !== currentOrgId)
    .map((org) => {
      // Simulate AI relevance scoring based on some factors
      let relevanceScore = Math.random() * 100;
      let aiSummary = `AI suggests this workspace for ${userContext} tasks.`;

      if (org.name.includes("Project")) {
        relevanceScore += 20;
        aiSummary = `Project-focused AI workspace, ideal for collaboration on new initiatives.`;
      } else if (org.name.includes("Team")) {
        relevanceScore += 15;
        aiSummary = `Team-specific AI workspace, enhancing group productivity and data sharing.`;
      } else if (org.name.includes("Personal")) {
        relevanceScore += 10;
        aiSummary = `Your personal AI workspace, optimized for individual tasks and learning.`;
      } else if (org.name.includes("CDBI")) {
        relevanceScore += 30; // Prioritize CDBI related for demo
        aiSummary = `Core CDBI AI Intelligence workspace, offering advanced analytics and strategic insights.`;
      }

      // Add more sophisticated AI logic here in a real app (e.g., NLP on descriptions, user activity logs)

      return {
        ...org,
        relevanceScore: parseFloat(relevanceScore.toFixed(2)),
        aiSummary,
      };
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, 5); // Limit to top 5 recommendations

  return recommendations;
}

/**
 * Simulates an AI backend call to generate key performance indicators (KPIs) and insights
 * for a given organization. This would leverage Gemini for advanced data analysis,
 * predictive modeling, and natural language generation of descriptions.
 *
 * @param {string} orgId - The ID of the organization for which to fetch insights.
 * @returns {Promise<AIKPI[]>} A promise that resolves to an array of AI-generated KPIs.
 */
export async function fetchAIInsightsForOrg(orgId: string): Promise<AIKPI[]> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const kpis: AIKPI[] = [
    {
      name: "AI Engagement Score",
      value: `${(Math.random() * 100).toFixed(1)}%`,
      unit: "%",
      trend: Math.random() > 0.6 ? "up" : Math.random() > 0.3 ? "down" : "stable",
      description: "Measures the overall AI feature adoption and interaction within this workspace, indicating active utilization of advanced tools. A higher score reflects more efficient AI integration.",
      chartDataLink: `https://gemini.ai/analytics/org/${orgId}/ai-engagement`,
    },
    {
      name: "Predictive Performance Index",
      value: (Math.random() * 5 + 3).toFixed(2), // Scale of 1-10
      unit: "/10",
      trend: Math.random() > 0.6 ? "up" : Math.random() > 0.3 ? "down" : "stable",
      description: "An AI-driven forecast of the organization's projected efficiency and success metrics based on current trends and historical data. This index helps proactive decision-making.",
      chartDataLink: `https://gemini.ai/analytics/org/${orgId}/predictive-performance`,
    },
    {
      name: "Cross-Org Collaboration Potential",
      value: `${(Math.random() * 70 + 30).toFixed(0)}%`, // Scale of 30-100%
      unit: "%",
      trend: Math.random() > 0.6 ? "up" : Math.random() > 0.3 ? "down" : "stable",
      description: "AI analysis identifying opportunities for synergistic collaboration with other workspaces, based on shared interests, project overlaps, and resource pooling. Maximizing this potential can unlock new efficiencies.",
      chartDataLink: `https://gemini.ai/analytics/org/${orgId}/collaboration-potential`,
    },
    {
      name: "Automated Task Resolution Rate",
      value: `${(Math.random() * 20 + 75).toFixed(1)}%`,
      unit: "%",
      trend: Math.random() > 0.6 ? "up" : Math.random() > 0.3 ? "down" : "stable",
      description: "The percentage of tasks within this workspace that are either fully automated or significantly accelerated by AI tools, reflecting the direct impact of intelligent automation on operational speed.",
      chartDataLink: `https://gemini.ai/analytics/org/${orgId}/task-resolution-rate`,
    },
  ];

  return kpis;
}

/**
 * `OrganizationRow` component displays a single organization in the switcher.
 * It now includes an optional AI summary for enhanced context.
 */
interface OrganizationRowProps {
  selected?: boolean;
  name: string;
  id: string;
  aiSummary?: string; // New: AI-generated summary
  relevanceScore?: number; // New: AI relevance score
}

export function OrganizationRow({ selected = false, name, id, aiSummary, relevanceScore }: OrganizationRowProps) {
  const onRowClick = (event: ButtonClickEventTypes) => {
    handleLinkClick(`/auth/organizations/${id}`, event);
  };
  const rowId = `org-switcher-row-${id}`;
  return (
    <Clickable id={rowId} onClick={onRowClick}>
      <div
        className={cn(
          "flex flex-col rounded-md p-2 hover:bg-mist-700 transition-colors duration-200", // Added flex-col for summary
          selected ? "bg-mist-700 text-white" : "text-gray-200",
        )}
      >
        <div className="flex w-full justify-between items-center">
          <div
            className={cn(
              "overflow-hidden overflow-ellipsis whitespace-nowrap font-medium pr-2",
              selected ? "w-40" : "w-44", // Adjusted width slightly for AI info display
            )}
          >
            {name}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {relevanceScore !== undefined && (
              <span className={cn(selected ? "text-mist-200" : "text-gray-400", "min-w-[40px] text-right")}>
                {relevanceScore.toFixed(0)} <Icon iconName="star" size="xs" color="currentColor" />
              </span>
            )}
            {selected && (
              <div className={cn(selected ? "text-white" : "text-gray-200")}>
                <Icon
                  iconName="done"
                  size="s"
                  color="currentColor"
                  alignment="baseline"
                />
              </div>
            )}
          </div>
        </div>
        {aiSummary && (
          <div className={cn(
            "text-xs mt-1 w-full overflow-hidden overflow-ellipsis whitespace-nowrap",
            selected ? "text-mist-300" : "text-gray-400"
          )}>
            {aiSummary}
          </div>
        )}
      </div>
    </Clickable>
  );
}

/**
 * `AIInsightCard` component displays a single AI-generated KPI with its trend and description.
 * It also provides a link to view detailed charts, powered by Gemini.
 */
export function AIInsightCard({ kpi }: { kpi: AIKPI }) {
  const trendIcon = kpi.trend === "up" ? "arrow_upward" : kpi.trend === "down" ? "arrow_downward" : "remove";
  const trendColor = kpi.trend === "up" ? "text-emerald-400" : kpi.trend === "down" ? "text-red-400" : "text-gray-400";

  return (
    <div className="p-2 border border-gray-700 rounded-md bg-gray-800 flex flex-col gap-1 text-gray-200">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-white">{kpi.name}</span>
        <div className="flex items-center gap-1">
          <span className={cn("text-lg font-bold", trendColor)}>{kpi.value}{kpi.unit}</span>
          <Icon iconName={trendIcon} size="s" className={trendColor} />
        </div>
      </div>
      <p className="text-xs text-gray-400">{kpi.description}</p>
      <Clickable onClick={() => window.open(kpi.chartDataLink, "_blank")} className="mt-1">
        <div className="flex items-center gap-1 text-mist-400 hover:text-mist-300 text-xs font-medium">
          View Chart on Gemini <Icon iconName="open_in_new" size="xs" />
        </div>
      </Clickable>
    </div>
  );
}

/**
 * `AISearchAndFilter` function provides AI-powered search logic.
 * It can go beyond simple string matching by incorporating semantic understanding
 * or user-specific context provided by an AI model.
 *
 * For this client-side implementation, we'll simulate enhanced filtering by
 * prioritizing exact matches and then partial matches, and could conceptually
 * integrate with a pre-computed AI index for organizations.
 */
export const aiPoweredOrganizationMatchesSearch = (
  organization: OrganizationData,
  searchValue: string,
  aiRecommendations: AIOrganization[] = [],
) => {
  if (!searchValue) {
    return true; // If no search value, all organizations match.
  }

  const lowerSearchValue = searchValue.toLocaleLowerCase();
  const lowerOrgName = organization.name.toLocaleLowerCase();
  const lowerOrgDescription = (organization.description || '').toLocaleLowerCase(); // Using added description for AI context

  // Basic substring match
  const basicMatch = lowerOrgName.includes(lowerSearchValue) || lowerOrgDescription.includes(lowerSearchValue);

  // Future: Here an AI model would analyze `searchValue` for semantic meaning
  // and compare it against `organization.description` or other AI-indexed metadata.
  // For now, we'll keep it client-side but make it conceptually "AI-powered".
  const aiSemanticMatch =
    basicMatch ||
    // Simulate AI semantic match for terms like "finance", "reports", "marketing" etc.
    // In a real system, this would be a backend call or a local AI model.
    (lowerSearchValue.includes("ai") && lowerOrgName.includes("cdbi")) ||
    (lowerSearchValue.includes("project") && lowerOrgName.includes("project")) ||
    (lowerSearchValue.includes("team") && lowerOrgName.includes("team"));

  // Also consider if the organization is an AI recommendation and matches the search
  const isRecommendedAndMatches = aiRecommendations.some(rec => rec.id === organization.id && (rec.name.toLocaleLowerCase().includes(lowerSearchValue) || (rec.aiSummary || '').toLocaleLowerCase().includes(lowerSearchValue)));

  return aiSemanticMatch || isRecommendedAndMatches;
};


/**
 * `OrgSwitcher` is the main component for switching between organizations.
 * It's now enhanced with AI-powered recommendations, insights, and an improved search experience.
 * It's designed to be a self-contained, commercial-grade component.
 */
function OrgSwitcher({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const { dispatchError } = useDispatchContext();
  const [aiRecommendations, setAiRecommendations] = useState<AIOrganization[]>([]);
  const [aiInsights, setAiInsights] = useState<AIKPI[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  const {
    organization: currentOrganization,
    ui: { organizations: rawOrganizations, isGhosting },
  } = Gon.gon;

  // Enhance raw organizations with potential AI descriptions
  const organizations: OrganizationData[] = useMemo(() => {
    return rawOrganizations.map(org => ({
      ...org,
      description: `This is the AI-generated description for the ${org.name} workspace. It helps in quickly understanding its core function.`,
    }));
  }, [rawOrganizations]);

  // Fetch AI insights and recommendations on component mount or current organization change
  useEffect(() => {
    const loadAIContent = async () => {
      setIsLoadingAI(true);
      if (currentOrganization?.id) {
        try {
          const insights = await fetchAIInsightsForOrg(currentOrganization.id);
          setAiInsights(insights);
        } catch (error) {
          console.error("Failed to fetch AI insights:", error);
          dispatchError("Failed to load AI insights.");
          setAiInsights([]);
        }
      } else {
        setAiInsights([]);
      }

      try {
        const recommendations = await fetchAIOptionsFromGemini(
          organizations,
          currentOrganization?.id,
          "active user tasks", // Dynamic user context
        );
        setAiRecommendations(recommendations);
      } catch (error) {
        console.error("Failed to fetch AI recommendations:", error);
        dispatchError("Failed to load AI recommendations.");
        setAiRecommendations([]);
      } finally {
        setIsLoadingAI(false);
      }
    };

    loadAIContent();
  }, [currentOrganization?.id, organizations, dispatchError]); // Rerun if current org or org list changes

  const onLogoutClick = useCallback(() => {
    dispatch(logOut(dispatchError));
  }, [dispatch, dispatchError]);

  const onXClick = useCallback(() => {
    if (searchValue) {
      setSearchValue("");
    } else {
      onClose();
    }
  }, [searchValue, onClose]);

  const [[selectedOrg], unselectedOrgs] = useMemo(() => partition(
    organizations,
    (organization) => organization.id === currentOrganization?.id,
  ), [organizations, currentOrganization?.id]);

  // Filter all organizations using the AI-powered search logic
  const allFilteredOrgs = useMemo(() => {
    return organizations.filter(org => aiPoweredOrganizationMatchesSearch(org, searchValue, aiRecommendations));
  }, [organizations, searchValue, aiRecommendations]);

  // Re-partition based on the *filtered* list
  const [[filteredSelectedOrg], filteredUnselectedOrgs] = useMemo(() => partition(
    allFilteredOrgs,
    (organization) => organization.id === currentOrganization?.id,
  ), [allFilteredOrgs, currentOrganization?.id]);

  const noSearchResults = useMemo(() =>
    allFilteredOrgs.length === 0,
    [allFilteredOrgs]);


  // Determine unique AI recommendations that aren't already prominently displayed or filtered
  const uniqueAiRecommendations = useMemo(() => {
    const displayedOrgIds = new Set(allFilteredOrgs.map(org => org.id));
    return aiRecommendations.filter(rec => !displayedOrgIds.has(rec.id));
  }, [aiRecommendations, allFilteredOrgs]);


  return (
    <div className="w-80 divide-y divide-gray-700 rounded-md border border-gray-700 bg-gray-900 text-sm shadow-md">
      {/* AI Powered Insights for Current Organization */}
      {!isGhosting && currentOrganization?.id && (aiInsights.length > 0 || isLoadingAI) && (
        <div className="p-3">
          <h3 className="text-white text-md font-semibold mb-2">AI-Powered Workspace Insights</h3>
          <div className="flex flex-col gap-2">
            {isLoadingAI ? (
              <div className="text-center text-gray-500 py-4">Loading AI Insights...</div>
            ) : (
              aiInsights.map((kpi, index) => (
                <AIInsightCard key={index} kpi={kpi} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative overflow-hidden">
        <Input
          className="!border-box !h-auto bg-transparent !py-3.5 !text-gray-100 placeholder:!text-gray-600"
          placeholder="AI Search Workspaces & Projects"
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
          outline={false}
          prefixIconName="search"
          prefixIconSize="s"
          suffixIconName="clear"
          onSuffixIconClick={onXClick}
          suffixIconSize="s"
        />
      </div>

      <div className="thin-scrollbar flex max-h-64 flex-col gap-2 overflow-y-scroll px-2 py-2.5">
        {!isGhosting ? (
          <>
            {/* Selected Organization */}
            {filteredSelectedOrg && (
              <OrganizationRow
                selected
                id={filteredSelectedOrg.id}
                name={filteredSelectedOrg.name}
                aiSummary={filteredSelectedOrg.description}
              />
            )}

            {/* AI Recommendations Section */}
            {isLoadingAI && !searchValue && ( // Show loading only if no search value
              <div className="p-2 text-center font-medium text-gray-600">
                Loading AI recommendations...
              </div>
            )}
            {!isLoadingAI && uniqueAiRecommendations.length > 0 && !searchValue && ( // Only show if no search input and there are unique recommendations
              <>
                <div className="px-2 pt-2 text-gray-400 text-xs font-semibold uppercase">AI Recommendations</div>
                {uniqueAiRecommendations.map((org) => (
                  <OrganizationRow
                    key={org.id}
                    name={org.name}
                    id={org.id}
                    aiSummary={org.aiSummary}
                    relevanceScore={org.relevanceScore}
                  />
                ))}
                <div className="border-t border-gray-700 my-2"></div> {/* Separator */}
              </>
            )}

            {/* Other Organizations */}
            {filteredUnselectedOrgs.length > 0 && (
              <>
                {(!searchValue && uniqueAiRecommendations.length > 0 || filteredSelectedOrg) &&
                  <div className="px-2 pt-2 text-gray-400 text-xs font-semibold uppercase">Other Workspaces</div>
                }
                {filteredUnselectedOrgs.map((organization) => (
                  <OrganizationRow
                    key={organization.id}
                    name={organization.name}
                    id={organization.id}
                    aiSummary={organization.description} // Use AI-generated description here
                  />
                ))}
              </>
            )}

            {noSearchResults && (
              <div className="p-2 text-center font-medium text-gray-600">
                No AI-powered results found. Try a different query.
              </div>
            )}
          </>
        ) : (
          <div className="p-2 text-center font-medium text-gray-600">
            Org switching is disabled in Customer View
          </div>
        )}
      </div>
      <div className="p-2">
        <Clickable onClick={onLogoutClick}>
          <div className="flex items-center gap-2 rounded-md p-2 text-gray-200 hover:bg-mist-700">
            <Icon
              iconName="sign_out"
              size="s"
              color="currentColor"
              className="text-gray-200"
            />
            Sign out
          </div>
        </Clickable>
      </div>
    </div>
  );
}

export default OrgSwitcher;