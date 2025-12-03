import React, { useState, useEffect, useCallback } from "react";
import { capitalize, startCase } from "lodash";
import ReactTooltip from "react-tooltip";
import { MutationFunction } from "@apollo/client/react/types/types";
import {
  BulkImportViewQuery,
  useBulkImportViewQuery,
  useCalculatePaymentOrderTotalsQuery,
  useCreateDownloadAuditRecordMutation,
  Exact,
  CreateDownloadAuditRecordMutation,
  CreateDownloadAuditRecordInput,
  BulkImportStatus, // Assumed to be available from graphqlSchema
} from "../../generated/dashboard/graphqlSchema";
import formatDate from "../../common/utilities/formatDate";
import {
  DateTime,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
  Tooltip,
  Button, // Assuming Button exists in ui-components
  Spinner, // Assuming Spinner exists in ui-components
  Alert, // Assuming Alert exists in ui-components
} from "../../common/ui-components";

// --- START: New Gemini/External App Integration Logic ---

// Mocking Gemini AI for advanced insights
interface GeminiInsight {
  summary: string;
  anomalies: string[];
  suggestions: string[];
  sentiment?: "positive" | "neutral" | "negative";
  riskScore?: number; // Score from 1-10
}

// This function simulates an API call to Gemini.
// In a real application, this would call Google's Gemini API with relevant bulkImport data.
const mockGeminiAnalyzeBulkImport = async (
  bulkImportData: NonNullable<BulkImportViewQuery["bulkImport"]>,
): Promise<GeminiInsight> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let summary = `Gemini AI: Initial analysis of Bulk Import ID ${bulkImportData.id}.`;
      const anomalies: string[] = [];
      const suggestions: string[] = [];
      let sentiment: GeminiInsight["sentiment"] = "neutral";
      let riskScore = Math.floor(Math.random() * 5) + 3; // Base risk 3-7

      if (bulkImportData.status === BulkImportStatus.Failed) {
        summary += " The import has failed, requiring immediate attention and review of specific error logs.";
        anomalies.push("Import failed with critical processing errors.");
        suggestions.push(
          "Review detailed error logs (if available) for root cause analysis.",
          "Consider re-uploading with corrected data after investigation."
        );
        sentiment = "negative";
        riskScore = Math.min(riskScore + 4, 10); // Increase risk for failed imports
      } else if (bulkImportData.resourceCount === 0 && bulkImportData.status === BulkImportStatus.Completed) {
        summary += " Import completed but no resources were created. Potential data source or mapping issue detected.";
        anomalies.push("Zero resources created despite 'Completed' status.");
        suggestions.push("Verify source CSV file integrity and content against expected schema.", "Check data mapping configurations.");
        sentiment = "negative";
        riskScore = Math.min(riskScore + 3, 10);
      } else if (bulkImportData.resourceType === "PaymentOrder") {
        summary += ` This import successfully processed ${bulkImportData.resourceCount} payment orders.`;
        if (bulkImportData.resourceCount > 1000) {
          anomalies.push("High volume payment order import detected. Recommend staggered processing for stability.");
          suggestions.push("Optimize payment order processing batch sizes to prevent system overload.", "Alert treasury operations for high-value impact.");
          riskScore = Math.min(riskScore + 2, 10);
        }
        suggestions.push("Cross-reference payment orders with internal fraud detection systems.", "Confirm successful settlement with banking partners.");
        sentiment = "positive";
      } else {
        summary += ` Successfully processed ${bulkImportData.resourceCount} ${bulkImportData.resourceType} resources.`;
        suggestions.push("Monitor resource usage and downstream system integration for data consistency.");
        sentiment = "positive";
      }

      if (!bulkImportData.liveMode) {
        anomalies.push("Import executed in Sandbox/Test Mode. Ensure proper live deployment for production data flows.");
      }

      resolve({ summary, anomalies, suggestions, sentiment, riskScore });
    }, 1500); // Simulate network delay
  });
};

// Mocking an External Compliance/Risk Engine
interface ComplianceCheckResult {
  status: "Passed" | "Failed" | "Pending" | "Not Applicable";
  details: string;
  riskScore: number; // Score from 1-10
}

const mockComplianceCheck = async (
  bulkImportData: NonNullable<BulkImportViewQuery["bulkImport"]>,
): Promise<ComplianceCheckResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let status: ComplianceCheckResult["status"] = "Passed";
      let details = `Automated compliance check for Bulk Import ID ${bulkImportData.id} passed all standard regulatory criteria.`;
      let riskScore = Math.floor(Math.random() * 2) + 1; // Low risk by default (1-3)

      if (bulkImportData.resourceType === "PaymentOrder") {
        if (bulkImportData.resourceCount > 500) {
          status = "Pending";
          details =
            "High volume payment orders detected. Requires manual compliance officer review for large transaction aggregation.";
          riskScore = 7;
        } else if (bulkImportData.createdBy === "SuspiciousUser123" || bulkImportData.user.name.includes("Fraud")) { // Fictional check
          status = "Failed";
          details = "Associated user flagged in internal risk database. IMMEDIATE ACTION REQUIRED: Suspend import, investigate user account.";
          riskScore = 10;
        } else {
          details = "Payment order compliance check successful. No red flags identified.";
        }
      } else if (bulkImportData.resourceType === "User" && bulkImportData.resourceCount > 100) {
          status = "Pending";
          details = "Large user import. Requires review of new user permissions, access levels, and regional data privacy compliance.";
          riskScore = 5;
      } else if (!bulkImportData.liveMode && bulkImportData.status === BulkImportStatus.Completed) {
          // Even if successful in test mode, compliance might flag for full live implications
          status = "Pending";
          details = "Import completed in non-live mode. Review for production readiness and full compliance checks post-deployment.";
          riskScore = 4;
      }

      resolve({ status, details, riskScore });
    }, 1200); // Simulate network delay
  });
};

// --- END: New Gemini/External App Integration Logic ---

const MAPPING = {
  id: "ID",
  createdAt: "Created At",
  resourceType: "Resource",
  liveMode: "Live Mode",
  status: "Status",
  createdBy: "Uploaded By",
  resourceCount: "Total Created Resources",
  csvDownload: "CSV",
  // New mappings will be conditionally added to reflect the enhanced value proposition
};

interface CurrencyTotalType {
  amount: string;
  currency: string;
  direction: string;
}

type CustomBulkImportType = Pick<BulkImportViewQuery, "bulkImport"> & {
  createdAt: JSX.Element;
  liveMode: string;
  createdBy: JSX.Element;
  status: string;
  resourceType: string;
  resourceCount: React.ReactNode;
  csvDownload: JSX.Element;
  geminiAiInsights?: JSX.Element;
  complianceCheck?: JSX.Element;
  totalAmounts?: JSX.Element; // Added for payment order totals
};

function csvDownloadFormat(
  bulkImportData: NonNullable<BulkImportViewQuery["bulkImport"]>,
  createDownloadAuditRecord: MutationFunction<
    CreateDownloadAuditRecordMutation,
    Exact<{
      input: CreateDownloadAuditRecordInput;
    }>
  >,
) {
  if (bulkImportData.fileUrl && bulkImportData.filename) {
    return (
      <a
        onClick={() => {
          void createDownloadAuditRecord({
            variables: { input: { id: bulkImportData.id } },
          });
        }}
        href={bulkImportData.fileUrl}
        download
      >
        {bulkImportData.filename}
      </a>
    );
  }
  if (bulkImportData.filename && !bulkImportData.fileUrl) {
    return (
      <>
        {bulkImportData.filename}
        <ReactTooltip
          multiline
          id="csv"
          data-place="top"
          data-type="dark"
          data-effect="float"
        />
        <Tooltip
          className="ml-1"
          data-for="csv"
          data-tip="You don't have permission to download"
        />
      </>
    );
  }
  return (
    <>
      <span>Unavailable</span>
      <ReactTooltip
        multiline
        id="download"
        data-place="top"
        data-type="dark"
        data-effect="float"
      />
      <Tooltip
        className="ml-1"
        data-for="download"
        data-tip="Check back later"
      />
    </>
  );
}

function buildPaymentOrderTotals(
  currencyTotals: CurrencyTotalType[],
  showCalculationTotal: boolean,
) {
  return showCalculationTotal ? (
    <div className="row-value">
      {currencyTotals.map(({ amount, currency, direction }, index) => (
        <div key={index} className="mb-1 last:mb-0"> {/* Added key and margin for spacing */}
          {capitalize(direction)}
          &nbsp;
          {amount}
          &nbsp;
          <b>{currency}</b>
        </div>
      ))}
    </div>
  ) : (
    <>
      <span>Insufficient Permissions</span>
      <ReactTooltip
        multiline
        id="resources"
        data-place="top"
        data-type="dark"
        data-effect="float"
      />
      <Tooltip
        className="ml-1"
        data-for="resources"
        data-tip="You must have permissions to view all payment orders to see totals."
      />
    </>
  );
}

function formatBulkImport(
  bulkImportData: NonNullable<BulkImportViewQuery["bulkImport"]>,
  currencyTotals: CurrencyTotalType[],
  entitiesDate: string,
  totalsLoaded: boolean,
  showCalculationTotal: boolean,
  createDownloadAuditRecord: MutationFunction<
    CreateDownloadAuditRecordMutation,
    Exact<{
      input: CreateDownloadAuditRecordInput;
    }>
  >,
  geminiResults?: GeminiInsight | null,
  complianceResults?: ComplianceCheckResult | null,
): Record<string, unknown> {
  const formattedData: Record<string, unknown> = {
    ...bulkImportData,
    createdAt: <DateTime timestamp={bulkImportData.createdAt} />,
    liveMode: bulkImportData.liveMode ? "True" : "False",
    createdBy: (
      <a href={`/settings/users/${bulkImportData.userId ?? ""}/edit`}>
        {bulkImportData.user.name}
      </a>
    ),
    status: bulkImportData.prettyStatus,
    resourceType: startCase(bulkImportData.prettyResourceType),
    resourceCount:
      bulkImportData.resourceCount === 0 &&
      new Date(bulkImportData.createdAt) <= new Date(entitiesDate) ? (
        <>
          <span>Unknown</span>
          <ReactTooltip
            multiline
            id="resources"
            data-place="top"
            data-type="dark"
            data-effect="float"
          />
          <Tooltip
            className="ml-1"
            data-for="resources"
            data-tip={`Unable to determine resources created for imports before ${
              formatDate(new Date(entitiesDate)) ?? ""
            }`}
          />
        </>
      ) : (
        bulkImportData.resourceCount
      ),
    csvDownload: csvDownloadFormat(bulkImportData, createDownloadAuditRecord),
  };

  if (totalsLoaded && bulkImportData.resourceType === "PaymentOrder") {
    formattedData.totalAmounts = buildPaymentOrderTotals(
      currencyTotals,
      showCalculationTotal,
    );
  }

  if (geminiResults) {
    formattedData.geminiAiInsights = (
      <div className="gemini-insights p-2 rounded bg-blue-50">
        <p className="font-bold mb-1">{geminiResults.summary}</p>
        {geminiResults.anomalies.length > 0 && (
          <div className="mb-2">
            <p className="font-semibold text-red-600">Detected Anomalies:</p>
            <ul className="list-disc ml-4">
              {geminiResults.anomalies.map((a, i) => (
                <li key={`anomaly-${i}`} className="text-sm">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {geminiResults.suggestions.length > 0 && (
          <div>
            <p className="font-semibold text-blue-600">Suggested Actions:</p>
            <ul className="list-disc ml-4">
              {geminiResults.suggestions.map((s, i) => (
                <li key={`suggestion-${i}`} className="text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className={`mt-2 text-sm ${geminiResults.sentiment === 'negative' ? 'text-red-500' : geminiResults.sentiment === 'positive' ? 'text-green-500' : 'text-gray-500'}`}>
            Overall Sentiment: {capitalize(geminiResults.sentiment || 'neutral')}
        </p>
        <p className="text-sm text-gray-700">Gemini Risk Score: {geminiResults.riskScore}/10</p>
      </div>
    );
  }

  if (complianceResults) {
    let statusColorClass = "text-gray-600";
    let bgColorClass = "bg-gray-50";
    switch (complianceResults.status) {
      case "Passed":
        statusColorClass = "text-green-600";
        bgColorClass = "bg-green-50";
        break;
      case "Failed":
        statusColorClass = "text-red-600";
        bgColorClass = "bg-red-50";
        break;
      case "Pending":
        statusColorClass = "text-orange-600";
        bgColorClass = "bg-orange-50";
        break;
      default:
        statusColorClass = "text-gray-600";
        bgColorClass = "bg-gray-50";
    }

    formattedData.complianceCheck = (
      <div className={`compliance-check p-2 rounded ${bgColorClass}`}>
        <p className={`font-bold ${statusColorClass}`}>
          Status: {complianceResults.status}
        </p>
        <p className="text-sm text-gray-700">{complianceResults.details}</p>
        <p className="text-sm text-gray-700">Compliance Risk: {complianceResults.riskScore}/10</p>
      </div>
    );
  }

  return formattedData as CustomBulkImportType;
}

interface BulkImportDetailsViewProps {
  bulkImportId: string;
  entitiesDate: string;
  showCalculationTotal: boolean;
}

function BulkImportDetailsView({
  bulkImportId,
  entitiesDate,
  showCalculationTotal,
}: BulkImportDetailsViewProps) {
  const { loading, data } = useBulkImportViewQuery({
    variables: { id: bulkImportId },
  });
  const bulkImport = data?.bulkImport;
  const [createDownloadAuditRecord] = useCreateDownloadAuditRecordMutation();
  const {
    data: calcData,
    loading: calcLoading,
    error: calcError,
  } = useCalculatePaymentOrderTotalsQuery({
    notifyOnNetworkStatusChange: true,
    variables: { bulkImportId },
  });
  const currencyTotals =
    calcLoading || !calcData || calcError
      ? []
      : (calcData.calculatePaymentOrderTotals
          .prettyTotals as CurrencyTotalType[]);

  const bulkImportLoaded = !!(!loading && bulkImport);
  const totalsLoaded = !!(
    !calcLoading &&
    calcData &&
    calcData.calculatePaymentOrderTotals.paymentOrdersTotalCount !== 0
  );

  // --- State for Gemini Integration ---
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiInsights, setGeminiInsights] = useState<GeminiInsight | null>(
    null,
  );
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const analyzeWithGemini = useCallback(async () => {
    if (!bulkImport) {
      setGeminiError("Bulk import data not available for analysis.");
      return;
    }
    setGeminiLoading(true);
    setGeminiError(null);
    setGeminiInsights(null);
    try {
      const insights = await mockGeminiAnalyzeBulkImport(bulkImport);
      setGeminiInsights(insights);
    } catch (err) {
      console.error("Gemini analysis failed:", err);
      setGeminiError("Failed to get AI insights. Please try again or contact support.");
    } finally {
      setGeminiLoading(false);
    }
  }, [bulkImport]);

  // --- State for Compliance Check Integration ---
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceResults, setComplianceResults] = useState<ComplianceCheckResult | null>(
    null,
  );
  const [complianceError, setComplianceError] = useState<string | null>(null);

  const runComplianceCheck = useCallback(async () => {
    if (!bulkImport) {
      setComplianceError("Bulk import data not available for compliance check.");
      return;
    }
    setComplianceLoading(true);
    setComplianceError(null);
    setComplianceResults(null);
    try {
      const results = await mockComplianceCheck(bulkImport);
      setComplianceResults(results);
    } catch (err) {
      console.error("Compliance check failed:", err);
      setComplianceError("Failed to run compliance check. Please try again or contact support.");
    } finally {
      setComplianceLoading(false);
    }
  }, [bulkImport]);

  // Trigger analysis automatically when bulkImport data loads for the first time
  useEffect(() => {
    if (bulkImportLoaded && bulkImport && !geminiInsights && !geminiLoading && !geminiError) {
      void analyzeWithGemini();
    }
    if (bulkImportLoaded && bulkImport && !complianceResults && !complianceLoading && !complianceError) {
      void runComplianceCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkImportLoaded, bulkImport]); // Removed geminiInsights, etc. from deps to only run on initial bulkImport load

  return (
    <div className="mt-4">
      {bulkImportLoaded ? (
        <>
          <KeyValueTable
            data={formatBulkImport(
              bulkImport,
              currencyTotals,
              entitiesDate,
              totalsLoaded,
              showCalculationTotal,
              createDownloadAuditRecord,
              geminiInsights,
              complianceResults,
            )}
            dataMapping={{
              ...MAPPING,
              ...(bulkImport.resourceType === "PaymentOrder" &&
                totalsLoaded && { totalAmounts: "Total Payment Amounts" }),
              // Conditionally add mapping labels if analysis has been run or is loading
              ...(geminiInsights || geminiLoading || geminiError ? { geminiAiInsights: "AI Powered Insights" } : {}),
              ...(complianceResults || complianceLoading || complianceError ? { complianceCheck: "Risk & Compliance Status" } : {}),
            }}
          />

          <div className="mt-6 p-4 border rounded-lg shadow-md bg-white">
            <h3 className="text-xl font-bold mb-4 text-indigo-700">
              {/* Added Citibank branding assumption for "uniquely ourselves" */}
              Citibank Fusion AI: Intelligent Bulk Import Management
            </h3>

            {/* Gemini AI Integration Section */}
            <div className="mb-4 pb-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg text-gray-800">
                  Gemini AI: Deep Dive Import Analysis
                </h4>
                <Button
                  onClick={analyzeWithGemini}
                  disabled={geminiLoading}
                  variant="primary"
                >
                  {geminiLoading ? (
                    <>
                      <Spinner className="mr-2" /> Analyzing...
                    </>
                  ) : (
                    "Re-Analyze with Gemini AI"
                  )}
                </Button>
              </div>
              {geminiError && (
                <Alert type="error" message={geminiError} className="mb-2" />
              )}
              {geminiLoading && !geminiInsights && (
                 <div className="flex items-center text-blue-500 py-4">
                    <Spinner className="mr-2" /> <span>Running Gemini AI analysis for bulk import ID {bulkImportId}...</span>
                 </div>
              )}
              {geminiInsights && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="font-bold text-gray-800 mb-1">{geminiInsights.summary}</p>
                  {geminiInsights.anomalies.length > 0 && (
                    <div className="mb-2 mt-2">
                      <p className="font-semibold text-red-700">Detected Anomalies:</p>
                      <ul className="list-disc ml-5 text-sm">
                        {geminiInsights.anomalies.map((a, i) => (
                          <li key={`gemini-anomaly-${i}`}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {geminiInsights.suggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-green-700">Suggested Actions for Optimization:</p>
                      <ul className="list-disc ml-5 text-sm">
                        {geminiInsights.suggestions.map((s, i) => (
                          <li key={`gemini-suggestion-${i}`}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-blue-100 text-sm">
                      <p className={`${geminiInsights.sentiment === 'negative' ? 'text-red-600' : geminiInsights.sentiment === 'positive' ? 'text-green-600' : 'text-gray-600'} font-medium`}>
                        Overall Sentiment: {capitalize(geminiInsights.sentiment || 'neutral')}
                      </p>
                      <p className="text-gray-700 font-medium">AI Risk Index: <span className="text-indigo-800">{geminiInsights.riskScore}/10</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Compliance & Risk Integration Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg text-gray-800">
                  Automated Enterprise Risk & Compliance
                </h4>
                <Button
                  onClick={runComplianceCheck}
                  disabled={complianceLoading}
                  variant="secondary"
                >
                  {complianceLoading ? (
                    <>
                      <Spinner className="mr-2" /> Checking...
                    </>
                  ) : (
                    "Run Compliance Check"
                  )}
                </Button>
              </div>
              {complianceError && (
                <Alert type="error" message={complianceError} className="mb-2" />
              )}
              {complianceLoading && !complianceResults && (
                 <div className="flex items-center text-blue-500 py-4">
                    <Spinner className="mr-2" /> <span>Initiating compliance review for bulk import ID {bulkImportId}...</span>
                 </div>
              )}
              {complianceResults && (
                <div
                  className={`p-3 rounded-md border ${
                    complianceResults.status === "Failed"
                      ? "bg-red-50 border-red-200"
                      : complianceResults.status === "Pending"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <p className={`font-bold text-lg ${
                    complianceResults.status === "Failed" ? "text-red-800" :
                    complianceResults.status === "Pending" ? "text-orange-800" :
                    "text-green-800"
                  }`}>
                    Status: {complianceResults.status}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{complianceResults.details}</p>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 text-sm">
                      <p className="text-gray-700 font-medium">Compliance Risk Score: <span className="text-indigo-800">{complianceResults.riskScore}/10</span></p>
                      {complianceResults.status === "Failed" && (
                          <Button variant="danger" size="small">Remediate Issues</Button> // Assuming button size/variant props
                      )}
                      {complianceResults.status === "Pending" && (
                          <Button variant="info" size="small">Request Manual Review</Button>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <KeyValueTableSkeletonLoader dataMapping={MAPPING} />
      )}
    </div>
  );
}

export default BulkImportDetailsView;