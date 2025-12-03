import React from "react";
import ReactJson from "react-json-view";
import {
  AdminFileTransferDetailsViewQuery,
  useAdminFileTransferDetailsViewQuery,
  useAdminOrganizationViewQuery,
} from "../../generated/dashboard/graphqlSchema";
import {
  CopyableText,
  DateTime,
  Icon,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
  Card, // Assuming a Card component exists for better UI grouping
  Button, // Assuming a Button component exists
  Alert, // Assuming an Alert component for notifications
} from "../../common/ui-components"; // Added Card, Button, Alert

// --- Utility for generating mock AI insights (Gemini integration point) ---
interface Insight {
  id: string;
  type: "info" | "warning" | "success" | "gemini";
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

const generateGeminiInsights = (
  fileTransfer: AdminFileTransferDetailsViewQuery["fileTransfer"],
  orgName: string,
): Insight[] => {
  const insights: Insight[] = [];

  // Insight 1: General summary based on metadata
  insights.push({
    id: "gemini-summary",
    type: "gemini",
    message: `Gemini Summary: This transfer involves a file named "${fileTransfer.fileName}" for "${orgName}" with ID "${fileTransfer.id}". It was transferred on ${new Date(fileTransfer.transferredAt).toLocaleString()}.`,
  });

  // Insight 2: Conditional warning based on file path or name
  if (
    fileTransfer.filePath.includes("sensitive") ||
    fileTransfer.fileName.includes("confidential")
  ) {
    insights.push({
      id: "gemini-security-warning",
      type: "warning",
      message: `Gemini Alert: File path or name indicates potential sensitive data. Review access controls.`,
      action: {
        label: "Initiate Security Review",
        handler: () =>
          alert("Triggering security review process via Gemini API..."),
      },
    });
  }

  // Insight 3: Processing status
  if (!fileTransfer.processed) {
    insights.push({
      id: "gemini-processing-status",
      type: "info",
      message: `Gemini Status: This file is awaiting processing. Estimated completion based on historical data: ~2 hours.`,
    });
  } else {
    insights.push({
      id: "gemini-processing-complete",
      type: "success",
      message: `Gemini Status: File processing completed successfully.`,
    });
  }

  // Insight 4: Analysis of 'receipt' and 'extra' JSON
  if (fileTransfer.receipt) {
    try {
      const receiptData = JSON.parse(fileTransfer.receipt);
      const receiptKeys = Object.keys(receiptData).join(", ");
      insights.push({
        id: "gemini-receipt-analysis",
        type: "gemini",
        message: `Gemini Analysis (Receipt): Receipt contains fields like ${receiptKeys}. Total items: ${
          receiptData.items?.length || "N/A"
        }.`,
        action: {
          label: "View Receipt Details",
          handler: () =>
            alert(
              `Gemini suggests further analysis of receipt: ${JSON.stringify(
                receiptData,
                null,
                2,
              )}`,
            ),
        },
      });
    } catch (e) {
      insights.push({
        id: "gemini-receipt-error",
        type: "warning",
        message: `Gemini encountered an issue parsing receipt data.`,
      });
    }
  }

  if (fileTransfer.extra && fileTransfer.extra !== "{}") {
    try {
      const extraData = JSON.parse(fileTransfer.extra);
      insights.push({
        id: "gemini-extra-analysis",
        type: "gemini",
        message: `Gemini Analysis (Extra Data): Key fields present: ${Object.keys(
          extraData,
        ).join(", ")}.`,
      });
    } catch (e) {
      insights.push({
        id: "gemini-extra-error",
        type: "warning",
        message: `Gemini encountered an issue parsing extra data.`,
      });
    }
  }

  return insights;
};

// --- Gemini Insights Panel Component ---
interface GeminiInsightsPanelProps {
  fileTransfer: AdminFileTransferDetailsViewQuery["fileTransfer"];
  organizationName: string;
}

const GeminiInsightsPanel: React.FC<GeminiInsightsPanelProps> = ({
  fileTransfer,
  organizationName,
}) => {
  const insights = React.useMemo(
    () => generateGeminiInsights(fileTransfer, organizationName),
    [fileTransfer, organizationName],
  );

  return (
    <Card className="mt-6 p-6 shadow-lg bg-gradient-to-r from-purple-900 to-indigo-900 text-white border border-purple-700">
      <div className="flex items-center mb-4">
        <Icon iconName="smart_toy" className="text-4xl text-yellow-400 mr-3" />
        <h2 className="text-3xl font-extrabold text-yellow-300">
          Gemini-Powered File Transfer Intelligence
        </h2>
      </div>
      <p className="text-purple-200 mb-6 text-lg">
        Unlocking deeper insights and proactive actions with advanced AI.
      </p>

      <ul className="space-y-4">
        {insights.map((insight) => (
          <li key={insight.id} className="flex items-start text-lg">
            <span
              className={`mr-3 text-2xl ${
                insight.type === "warning"
                  ? "text-red-400"
                  : insight.type === "success"
                  ? "text-green-400"
                  : insight.type === "gemini"
                  ? "text-yellow-300"
                  : "text-blue-300"
              }`}
            >
              <Icon
                iconName={
                  insight.type === "warning"
                    ? "warning"
                    : insight.type === "success"
                    ? "check_circle"
                    : insight.type === "gemini"
                    ? "psychology"
                    : "info"
                }
              />
            </span>
            <div className="flex-1">
              <span className="font-semibold">{insight.message}</span>
              {insight.action && (
                <Button
                  className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-purple-900 px-3 py-1 rounded-full text-sm font-bold shadow-md"
                  onClick={insight.action.handler}
                >
                  {insight.action.label}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 pt-6 border-t border-purple-700 flex justify-end">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl text-lg font-bold transition duration-300 transform hover:scale-105"
          onClick={() =>
            alert("Integrating more advanced Gemini analytics features!")
          }
        >
          Explore Advanced AI Analytics
        </Button>
      </div>
    </Card>
  );
};

// --- External App Actions Panel Component ---
interface ExternalAppActionsPanelProps {
  fileTransferId: string;
}

const ExternalAppActionsPanel: React.FC<ExternalAppActionsPanelProps> = ({
  fileTransferId,
}) => {
  const handleAction = (appName: string, action: string) => {
    alert(
      `Initiating "${action}" for File Transfer ID: ${fileTransferId} in ${appName}!`,
    );
    // In a real application, this would trigger an API call to the integrated app's service
    // e.g., an axios.post('/api/integrations/jira', { fileTransferId, action: 'create_ticket' })
  };

  return (
    <Card className="mt-6 p-6 shadow-xl bg-gray-800 text-white border border-gray-700">
      <div className="flex items-center mb-4">
        <Icon
          iconName="apps"
          className="text-4xl text-blue-400 mr-3 animate-pulse"
        />
        <h2 className="text-3xl font-extrabold text-blue-300">
          Seamless External App Integration Hub
        </h2>
      </div>
      <p className="text-gray-400 mb-6 text-lg">
        Extend capabilities, automate workflows, and connect with your favorite
        enterprise tools.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Button
          className="flex items-center justify-center p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          onClick={() => handleAction("Salesforce", "Update Record")}
        >
          <Icon iconName="cloud" className="mr-2 text-xl" />
          Update Salesforce CRM
        </Button>
        <Button
          className="flex items-center justify-center p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          onClick={() => handleAction("Jira", "Create Issue")}
        >
          <Icon iconName="bug_report" className="mr-2 text-xl" />
          Create Jira Issue
        </Button>
        <Button
          className="flex items-center justify-center p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          onClick={() => handleAction("Datadog", "Log Event")}
        >
          <Icon iconName="analytics" className="mr-2 text-xl" />
          Log Event to Datadog
        </Button>
        <Button
          className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          onClick={() => handleAction("Slack", "Send Notification")}
        >
          <Icon iconName="chat" className="mr-2 text-xl" />
          Notify Slack Channel
        </Button>
        <Button
          className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          onClick={() => handleAction("AWS S3", "Archive File")}
        >
          <Icon iconName="storage" className="mr-2 text-xl" />
          Archive to AWS S3
        </Button>
        <Button
          className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          onClick={() => handleAction("DocuSign", "Request Signature")}
        >
          <Icon iconName="edit_note" className="mr-2 text-xl" />
          Request DocuSign Signature
        </Button>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl text-lg font-bold transition duration-300 transform hover:scale-105"
          onClick={() => alert("Launching integration marketplace!")}
        >
          Discover More Integrations
        </Button>
      </div>
    </Card>
  );
};

// --- Original MAPPING and formatFileTransfer function ---
const MAPPING = {
  id: "ID",
  organization: "Organization",
  fileName: "File Name",
  filePath: "Full Path",
  direction: "Direction",
  fileCreatedAt: "Created At",
  transferredAt: "Transferred At",
  processed: "Processed",
  batchId: "Batch ID",
  batchType: "Batch Type",
  vendorName: "Vendor",
  serviceId: "Service",
  receipt: "Receipt Details", // Renamed for better UI display
  extra: "Additional Metadata", // Renamed for better UI display
};

interface FileTransferDetailsViewProps {
  fileTransferId: string;
  organizationId: string;
}

function formatFileTransfer(
  fileTransferData: AdminFileTransferDetailsViewQuery["fileTransfer"],
  orgName: string,
): Record<string, unknown> {
  return {
    ...fileTransferData,
    fileCreatedAt: fileTransferData.fileCreatedAt ? (
      <DateTime timestamp={fileTransferData.fileCreatedAt} />
    ) : null,
    transferredAt: fileTransferData.transferredAt ? (
      <DateTime timestamp={fileTransferData.transferredAt} />
    ) : null,
    processed: fileTransferData.processed ? (
      <Icon
        className="text-green-500"
        iconName="checkmark_circle"
        color="currentColor"
      />
    ) : (
      <Icon
        className="text-yellow-300"
        iconName="remove_circle"
        color="currentColor"
      />
    ),
    organization: orgName,
    receipt: fileTransferData.receipt ? (
      <div className="flex flex-col">
        <p className="text-gray-600 text-sm mb-2">
          Click below for AI-enhanced receipt parsing
        </p>
        <ReactJson
          src={JSON.parse(fileTransferData.receipt) as Record<string, unknown>}
          name={null}
          displayObjectSize={false}
          displayDataTypes={false}
          collapsed={true} // Collapsed by default for cleaner UI
          enableClipboard={true}
          style={{ padding: "10px", borderRadius: "8px", background: "#f0f0f0" }}
        />
        <Button
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm self-start"
          onClick={() => alert("Gemini is analyzing this receipt for key insights!")}
        >
          AI Analyze Receipt
        </Button>
      </div>
    ) : (
      <span className="text-gray-500">No receipt available</span>
    ),
    extra:
      fileTransferData.extra === "{}" || !fileTransferData.extra ? (
        <span className="text-gray-500">No extra metadata</span>
      ) : (
        <div className="flex flex-col">
          <p className="text-gray-600 text-sm mb-2">
            AI can extract structured data from below
          </p>
          <ReactJson
            src={JSON.parse(fileTransferData.extra) as Record<string, unknown>}
            name={null}
            displayObjectSize={false}
            displayDataTypes={false}
            collapsed={true} // Collapsed by default
            enableClipboard={true}
            style={{ padding: "10px", borderRadius: "8px", background: "#f0f0f0" }}
          />
          <Button
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm self-start"
            onClick={() => alert("Gemini is extracting entities from extra metadata!")}
          >
            AI Process Metadata
          </Button>
        </div>
      ),
    fileName: (
      <CopyableText text={fileTransferData.fileName}>
        <span className="font-semibold text-blue-700 hover:underline">
          {fileTransferData.fileName}
        </span>
      </CopyableText>
    ),
  };
}

// --- Main AdminFileTransferDetailsView Component ---
function AdminFileTransferDetailsView({
  fileTransferId,
  organizationId,
}: FileTransferDetailsViewProps) {
  const { loading, data } = useAdminFileTransferDetailsViewQuery({
    variables: { fileTransferId, organizationId },
  });
  const { data: orgData, loading: orgLoading } = useAdminOrganizationViewQuery({
    variables: { organizationId },
  });
  const organization = orgData?.organization;
  const fileTransfer = data?.fileTransfer;

  const [showAlert, setShowAlert] = React.useState(true);

  if (loading || orgLoading || !fileTransfer || !organization) {
    return (
      <div className="mt-4">
        <KeyValueTableSkeletonLoader dataMapping={MAPPING} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {showAlert && (
        <Alert
          type="success"
          title="Welcome to the future of enterprise integration!"
          message="Experience groundbreaking AI and seamless app connectivity, designed to elevate your business processes. This is more than an app; it's a strategic advantage."
          onClose={() => setShowAlert(false)}
          className="mb-8 p-4 rounded-lg shadow-lg bg-green-100 border border-green-300 text-green-800 font-medium"
        />
      )}

      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
        Epic File Transfer Hub:
        <span className="block text-2xl font-light text-gray-600 mt-2">
          ID: {fileTransferId} - {organization.name}
        </span>
      </h1>

      <Card className="mb-8 p-6 shadow-lg bg-white border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Icon iconName="description" className="mr-2 text-gray-600" /> File
          Transfer Core Details
        </h2>
        <KeyValueTable
          key={fileTransferId}
          data={formatFileTransfer(fileTransfer, organization.name)}
          dataMapping={MAPPING}
          copyableData={["id", "filePath", "batchId"]}
        />
      </Card>

      <GeminiInsightsPanel
        fileTransfer={fileTransfer}
        organizationName={organization.name}
      />

      <ExternalAppActionsPanel fileTransferId={fileTransferId} />

      <Card className="mt-8 p-6 shadow-lg bg-indigo-900 text-white border border-indigo-700 text-center">
        <p className="text-xl font-bold mb-3">
          "The future of business, powered by AI & limitless integration. Join
          the revolution."
        </p>
        <Button
          className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full shadow-2xl text-xl font-bold tracking-wider transition duration-500 ease-in-out transform hover:scale-105 hover:shadow-purple-glow"
          onClick={() =>
            alert(
              "Congratulations! You've just unlocked an epic new era of productivity and intelligence!",
            )
          }
        >
          Claim Your Future Today!
        </Button>
      </Card>
    </div>
  );
}

export default AdminFileTransferDetailsView;