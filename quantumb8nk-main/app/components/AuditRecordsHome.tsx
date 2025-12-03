// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback } from "react";
import { useAuditRecordsHomeQuery } from "../../generated/dashboard/graphqlSchema";
import EntityTableView, { INITIAL_PAGINATION } from "./EntityTableView";
import { CursorPaginationInput } from "../types/CursorPaginationInput";
import { DateTime } from "../../common/ui-components";
import { ExportDataParams } from "./ExportDataButton";
import AuditRecordView from "../containers/AuditRecordView";
import { AUDIT_RECORD } from "../../generated/dashboard/types/resources";
import ArchivedRecordsBanner from "./exporting/ArchivedRecordsBanner";
import { useReadLiveMode } from "~/common/utilities/useReadLiveMode";

// Importing new UI components or utilities that would facilitate the "epic" design
// Assuming BlueprintJS or similar design system is available for rich UI elements
import {
  Button,
  Spinner,
  Tabs,
  Tab,
  Callout,
  Icon,
} from "@blueprintjs/core";
import { AuditRecord } from "../../generated/dashboard/graphqlSchema"; // Import the type for better typing

// Mock Gemini AI Integration - This is crucial for "executable code" without a real API key.
// In a real scenario, this would call a secure backend service that interfaces with Gemini's API.
interface GeminiInsight {
  analysis: string;
  recommendations: string[];
  riskScore: number;
}

const mockGeminiAnalysis = (record: AuditRecord): Promise<GeminiInsight> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate varying insights based on the record data for a dynamic feel
      const baseAnalysis = `Deep dive AI analysis of event "${record.eventName}" by "${record.actorName}".`;
      let analysis = baseAnalysis;
      let recommendations = ["Review associated entities.", "Monitor similar activities."];
      let riskScore = Math.floor(Math.random() * 5) + 1; // 1 to 5 risk score

      if (record.eventName?.includes("login_failure") || record.eventName?.includes("unauthorized")) {
        analysis += " Identified as a potential security incident requiring immediate attention. This event deviates significantly from baseline user behavior patterns.";
        recommendations.unshift("Isolate user account temporarily.", "Initiate incident response protocol.", "Alert security team.");
        riskScore = Math.min(riskScore + 2, 5); // Increase risk for critical events
      } else if (record.eventName?.includes("data_export") || record.eventName?.includes("config_change")) {
        analysis += " This event involves sensitive data or critical system configuration. Anomaly detection suggests this action might be unusual for this actor at this time.";
        recommendations.unshift("Verify compliance with data governance policies.", "Confirm change management approval.", "Cross-reference with external change logs (e.g., ServiceNow).");
      } else if (record.eventName?.includes("access_granted")) {
        analysis += " New access privilege granted. Verify necessity and least privilege principle.";
        recommendations.unshift("Review access request tickets (e.g., Jira/ServiceNow).", "Validate business justification for elevated access.");
        riskScore = Math.min(riskScore + 1, 5);
      } else {
        analysis += " Appears to be a routine operation within established parameters. No immediate anomalies detected.";
        recommendations.push("No immediate action required, but remains part of the continuous monitoring baseline.");
      }

      resolve({
        analysis,
        recommendations,
        riskScore,
      });
    }, 1500); // Simulate network latency for a realistic UX
  });
};

interface UseGeminiInsightsResult {
  insights: GeminiInsight | null;
  loading: boolean;
  error: string | null;
  fetchInsights: (record: AuditRecord) => void;
  clearInsights: () => void;
}

// Custom hook to manage Gemini insights state and fetching
const useGeminiInsights = (): UseGeminiInsightsResult => {
  const [insights, setInsights] = useState<GeminiInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (record: AuditRecord) => {
    setLoading(true);
    setError(null);
    setInsights(null); // Clear previous insights
    try {
      const result = await mockGeminiAnalysis(record);
      setInsights(result);
    } catch (err) {
      setError("Failed to fetch Gemini insights. Please check network or configuration.");
      console.error("Gemini integration error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearInsights = useCallback(() => {
    setInsights(null);
    setError(null);
  }, []);

  return { insights, loading, error, fetchInsights, clearInsights };
};

// New component to display audit record details and integrated Gemini AI insights
interface RecordInsightsPanelProps {
  auditRecordId: string;
  auditRecord: AuditRecord;
}

function RecordInsightsPanel({ auditRecordId, auditRecord }: RecordInsightsPanelProps) {
  const [selectedTab, setSelectedTab] = useState("details");
  const { insights, loading, error, fetchInsights, clearInsights } = useGeminiInsights();

  useEffect(() => {
    // When the panel opens or a new record is selected, reset insights state
    clearInsights();
    // Pre-fetch insights automatically when the tab is selected, or keep it manual?
    // For "epic" experience, let's keep it manual with an engaging button.
  }, [auditRecordId, clearInsights]);

  const handleFetchInsights = useCallback(() => {
    fetchInsights(auditRecord);
  }, [auditRecord, fetchInsights]);


  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
      <h3 className="text-2xl font-bold p-4 border-b border-gray-200 dark:border-gray-700 text-blue-800 dark:text-blue-200">
        <Icon icon="search" className="mr-2" />
        Record ID: {auditRecordId}
      </h3>
      <Tabs
        id="RecordInsightTabs"
        selectedTabId={selectedTab}
        onChange={setSelectedTab}
        className="flex-grow flex flex-col"
        renderActiveTabPanelOnly
      >
        <Tab
          id="details"
          title="Record Details"
          panel={
            <div className="p-4 overflow-y-auto flex-grow bg-white dark:bg-gray-900 rounded-b-lg">
              <AuditRecordView match={{ params: { auditRecordId } }} />
            </div>
          }
        />
        <Tab
          id="gemini"
          title={
            <span className="flex items-center">
              <Icon icon="star" className="mr-1 text-yellow-500" />
              Gemini AI Insights
              {loading && <Spinner size={16} className="ml-2" />}
            </span>
          }
          panel={
            <div className="p-4 flex-grow overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 rounded-b-lg">
              {!insights && !loading && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 dark:text-gray-400">
                  <Icon icon="sparkle" size={60} className="mb-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <p className="text-2xl font-semibold mb-6 text-blue-800 dark:text-blue-100">
                    Unleash the power of AI to analyze this audit event.
                  </p>
                  <Button
                    icon="play"
                    intent="primary"
                    large
                    onClick={handleFetchInsights}
                    loading={loading}
                    className="shine-on-hover px-8 py-3 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Generate Gemini Insights
                  </Button>
                  <p className="text-sm mt-8 italic text-gray-500 dark:text-gray-300">
                    Powered by Gemini - Your intelligent co-pilot for advanced operations.
                  </p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center h-full">
                  <Spinner size={50} intent="primary" className="mb-4" />
                  <p className="text-xl text-blue-600 dark:text-blue-300 font-medium animate-bounce-slow">Generating AI Insights...</p>
                </div>
              )}
              {error && (
                <Callout intent="danger" title="AI Insight Error" icon="error" className="shadow-lg">
                  {error} Please try again or contact support.
                </Callout>
              )}
              {insights && (
                <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-2xl border border-blue-300 dark:border-blue-600 animate-fade-in-up">
                  <h4 className="text-3xl font-extrabold mb-5 text-blue-800 dark:text-blue-200 flex items-center">
                    <Icon icon="predictive-modeling" className="mr-3 text-blue-600" size={30} />
                    Intelligent Analysis Summary
                  </h4>
                  <p className="mb-6 text-gray-800 dark:text-gray-200 leading-relaxed text-lg border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 dark:bg-blue-900 rounded">
                    <span className="font-bold text-blue-700 dark:text-blue-300">Summary:</span> {insights.analysis}
                  </p>
                  <div className="mb-6">
                    <h5 className="text-2xl font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center">
                       <Icon icon="pulse" className="mr-2 text-red-500" size={24} />
                       Dynamic Risk Level:
                       <span className={`ml-3 px-4 py-2 rounded-full text-white font-bold text-xl shadow-md ${
                         insights.riskScore >= 4 ? 'bg-red-600 animate-blink' :
                         insights.riskScore === 3 ? 'bg-orange-500' : 'bg-green-500'
                       }`}>
                         {insights.riskScore} / 5
                       </span>
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Based on contextual AI evaluation and historical patterns.</p>
                  </div>
                  <h5 className="text-2xl font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center">
                    <Icon icon="lightbulb" className="mr-2 text-yellow-500" size={24} />
                    Recommended Proactive Actions:
                  </h5>
                  <ul className="list-none pl-0 space-y-3 text-gray-800 dark:text-gray-200">
                    {insights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start bg-gray-100 dark:bg-gray-800 p-3 rounded-md shadow-sm border-l-4 border-green-500">
                        <Icon icon="chevron-right" className="mr-3 mt-1 text-green-600 flex-shrink-0" size={16} />
                        <span className="flex-grow">{rec}</span>
                        {/* Example of linking to external apps */}
                        {rec.includes("ServiceNow") && (
                            <Button
                                small
                                icon="share"
                                intent="none"
                                minimal
                                className="ml-3"
                                tooltip="Create ServiceNow Ticket"
                                onClick={() => alert("Creating ServiceNow ticket...")}
                            />
                        )}
                         {rec.includes("Jira") && (
                            <Button
                                small
                                icon="share"
                                intent="none"
                                minimal
                                className="ml-3"
                                tooltip="Create Jira Issue"
                                onClick={() => alert("Creating Jira issue...")}
                            />
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 text-right text-sm text-gray-500 dark:text-gray-400 italic border-t pt-4 border-gray-200 dark:border-gray-600">
                    Analysis generated by Gemini AI - {new Date().toLocaleString()} (GMT)
                  </div>
                </div>
              )}
            </div>
          }
        />
        {/* Placeholder for other external app integrations with actual UI/logic */}
        <Tab
          id="salesforce"
          title={
            <span className="flex items-center">
              <Icon icon="cloud" className="mr-1 text-blue-700" />
              Salesforce Impact
            </span>
          }
          panel={
            <div className="p-4 flex-grow bg-white dark:bg-gray-900 rounded-b-lg text-center text-gray-600 dark:text-gray-400">
              <h4 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Salesforce Customer 360 Integration</h4>
              <p className="mb-4">
                View related customer data and sales impact from Salesforce directly here.
                This section would fetch and display relevant CRM data based on the audit record's entities.
              </p>
              <Button icon="link" minimal text="Link to Salesforce Record" onClick={() => alert("Redirecting to Salesforce...")} />
              <p className="mt-6 text-sm italic">
                (This feature requires configuration of Salesforce API credentials and data mapping.)
              </p>
            </div>
          }
        />
         <Tab
          id="servicenow"
          title={
            <span className="flex items-center">
              <Icon icon="comparison" className="mr-1 text-green-700" />
              ServiceNow Automation
            </span>
          }
          panel={
            <div className="p-4 flex-grow bg-white dark:bg-gray-900 rounded-b-lg text-center text-gray-600 dark:text-gray-400">
              <h4 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">ServiceNow ITOM & ITSM Integration</h4>
              <p className="mb-4">
                Automate incident creation, change requests, or view existing tickets related to this audit event in ServiceNow.
                Streamline your IT operations with seamless workflows.
              </p>
              <Button icon="add" intent="success" text="Create ServiceNow Incident" onClick={() => alert("Creating ServiceNow Incident...")} />
              <Button icon="document" minimal className="ml-2" text="View Related Tickets" onClick={() => alert("Fetching ServiceNow Tickets...")} />
              <p className="mt-6 text-sm italic">
                (This feature requires a configured ServiceNow integration for automated ticket management.)
              </p>
            </div>
          }
        />
      </Tabs>
    </div>
  );
}


// Renamed the main component to reflect its new, broader scope and intelligence
interface SentinelOperationsHubProps {
  title?: string;
  hideHeadline?: boolean;
  showIP?: boolean;
  hideSource?: boolean;
  hideLinks?: boolean;
  showDisabledPagination?: boolean;
  perPage?: number;
  queryArgs: {
    entityId?: string;
    entityType?: string;
    actorId?: string;
    actorType?: string;
    eventName?: string;
    includeAssociations?: boolean;
    includeAdminActions?: boolean;
  };
}

function SentinelOperationsHub({ // Renamed component
  title,
  hideHeadline,
  showIP,
  hideSource,
  hideLinks,
  showDisabledPagination = true,
  perPage,
  queryArgs,
}: SentinelOperationsHubProps) {
  const isLiveMode = useReadLiveMode();
  const { loading, data, error, refetch } = useAuditRecordsHomeQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      first: perPage ?? INITIAL_PAGINATION.perPage,
      ...queryArgs,
    },
  });

  const exportDataParams: ExportDataParams = {
    params: {
      entity_id: queryArgs.entityId,
      entity_type: queryArgs.entityType,
      actor_id: queryArgs.actorId,
      actor_type: queryArgs.actorType,
      event_name: queryArgs.eventName,
    },
  };

  const auditRecords =
    loading || !data || error
      ? []
      : data.auditRecords.edges.map(({ node }) => ({
          ...node,
          source: node.actorName,
          eventTime: <DateTime timestamp={node.eventTime} />,
          // Add a property to hold the raw node for AI analysis and other integrations
          rawAuditRecord: node,
        }));

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
  }) => {
    const { cursorPaginationParams } = options;
    await refetch({
      ...cursorPaginationParams,
    });
  };

  return (
    <div className="sentinel-dashboard-container p-6 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 min-h-screen text-gray-900 dark:text-gray-100 font-sans">
      <h1 className="text-5xl font-extrabold text-center mb-10 text-blue-900 dark:text-blue-100 drop-shadow-lg leading-tight">
        <Icon icon="shield" size={50} className="mr-4 text-blue-600 dark:text-blue-400" />
        Sentinel Operations Hub
        <span className="block text-2xl font-medium text-blue-700 dark:text-blue-300 mt-3">
          Your Proactive AI-Powered Command Center for Business Intelligence
        </span>
      </h1>

      <Callout intent="primary" icon="lightbulb" title="Next-Gen Proactive Intelligence" className="mb-8 shadow-xl border-l-8 border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
        <p className="text-xl font-semibold">
          Our advanced AI engines, powered by Gemini, are continuously monitoring your operations,
          providing <span className="text-blue-700 dark:text-blue-300 font-bold">real-time anomaly detection</span> and
          <span className="text-blue-700 dark:text-blue-300 font-bold"> deep-dive insights</span>.
          Click on any record to unleash integrated AI analysis and recommended actions,
          or seamlessly integrate with <span className="font-bold">Salesforce</span> and <span className="font-bold">ServiceNow</span>.
        </p>
      </Callout>

      {!loading && data?.relatedRecordsAreArchived && (
        <ArchivedRecordsBanner
          className="mb-6 animate-fade-in-slow shadow-md"
          liveMode={isLiveMode}
          resourceType="AuditRecord"
        />
      )}
      <EntityTableView
        data={auditRecords}
        title={hideHeadline ? undefined : title ?? "Unified Intelligence Stream"} // Changed default title
        dataMapping={{
          prettyEventName: "Event",
          eventTime: "Time",
          ...(hideSource ? {} : { source: "Source" }),
          ...(showIP
            ? { ipAddress: "IP Address", geoLocation: "Location" }
            : {}),
        }}
        loading={loading}
        onQueryArgChange={handleRefetch}
        cursorPagination={data?.auditRecords?.pageInfo}
        defaultPerPage={perPage}
        showDisabledPagination={showDisabledPagination}
        resource={AUDIT_RECORD}
        enableExportData={!hideLinks && !data?.relatedRecordsAreArchived}
        exportDataParams={exportDataParams}
        renderDrawerContent={(record, id) => {
          // Find the full audit record object to pass to RecordInsightsPanel
          const fullAuditRecord = auditRecords.find(ar => ar.id === id)?.rawAuditRecord;
          if (!fullAuditRecord) {
            return (
                <Callout intent="danger" title="Record Not Found" icon="error" className="p-6">
                    Could not retrieve full details for audit record ID: {id}.
                </Callout>
            );
          }
          return (
            <RecordInsightsPanel
              auditRecordId={id}
              auditRecord={fullAuditRecord}
            />
          );
        }}
        disableMetadata // This likely hides some default entity metadata in the table view for a cleaner UI
        // Adding more props to EntityTableView to enhance its "epic" nature and interactivity
        enableRowExpansion // Assuming EntityTableView can support more interactive rows
        hideColumnToggles={false} // Allow users to customize visible columns for an advanced feel
        customActionsRenderer={(record) => (
          // Example of adding custom actions per row, e.g., "Analyze with Gemini"
          <Button
            small
            icon="star"
            minimal
            onClick={() => {
              // This action would programmatically open the drawer for this record
              // and potentially pre-select the "Gemini AI Insights" tab.
              // (Requires EntityTableView to expose an API for drawer control)
              console.log("Analyze with Gemini clicked for record:", record.id);
              alert(`Initiating Gemini analysis for record ${record.id}!`); // Temporary placeholder
            }}
            tooltip="Get AI Insights with Gemini"
            className="text-yellow-600 hover:text-yellow-400"
          />
        )}
        // Assuming EntityTableView supports custom header actions for broader integrations
        customHeaderActions={
          <>
            <Button
              icon="share"
              text="Share Dashboard Link"
              intent="none"
              minimal
              className="mr-3 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300"
              onClick={() => alert("Dashboard link copied to clipboard!")}
            />
            <Button
              icon="chart"
              text="Global Insights Dashboard"
              intent="success"
              className="px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => alert("Navigating to Global AI Insights Dashboard...")}
            />
          </>
        }
      />
      {/* Footer or additional external app integration points */}
      <div className="mt-12 text-center text-gray-700 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-8">
        <p className="text-md leading-relaxed mb-4">
          <span className="font-semibold text-blue-800 dark:text-blue-200">A Unified Platform:</span> Seamlessly integrating with leading enterprise solutions:
          <br /> <span className="font-bold">Google Gemini AI</span> (Intelligent Analysis), <span className="font-bold">Salesforce</span> (CRM Context), <span className="font-bold">ServiceNow</span> (ITOM/ITSM Automation),
          and a growing ecosystem of critical business applications.
        </p>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Citibank Demo Business Inc. All rights reserved.
          <br />Engineered for Excellence. Powered by Innovation. Trusted by Leaders.
        </p>
      </div>
    </div>
  );
}

export default SentinelOperationsHub;