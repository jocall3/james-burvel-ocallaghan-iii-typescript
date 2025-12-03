import React, { useEffect, useState, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { cn } from "~/common/utilities/cn";
import trackEvent from "../../common/utilities/trackEvent";
import {
  Button,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverPanel,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
} from "../../common/ui-components"; // Assuming Input and Textarea are available
import { EXTERNAL_APP_EVENTS } from "../../common/constants/analytics"; // New constant for analytics

// --- MOCK DATA & TYPES for a truly epic experience ---

type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "PENDING_AUTH" | "ERROR";

type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: IntegrationStatus;
  type: "AI" | "CRM" | "COMMUNICATION" | "DATA" | "ANALYTICS" | "PM";
  icon: string; // Name of an Icon component icon (e.g., "sparkles", "cloud", "message")
  actions: Array<"connect" | "disconnect" | "configure" | "prompt_ai">;
  config?: Record<string, string>; // Placeholder for configuration settings
};

// Hypothetical analytics events for our new, epic app
const EPIC_APP_ANALYTICS = {
  HUB_OPENED: "INTEGRATION_HUB_OPENED",
  INTEGRATION_SEARCHED: "INTEGRATION_SEARCHED",
  INTEGRATION_CONNECTED: "INTEGRATION_CONNECTED",
  INTEGRATION_DISCONNECTED: "INTEGRATION_DISCONNECTED",
  INTEGRATION_CONFIGURED: "INTEGRATION_CONFIGURED",
  GEMINI_PROMPT_SENT: "GEMINI_PROMPT_SENT",
  GEMINI_SMART_ACTION_TRIGGERED: "GEMINI_SMART_ACTION_TRIGGERED",
};

const MOCK_INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "gemini-ai",
    name: "Gemini AI Powerhouse",
    description: "Unleash intelligent insights and automate workflows with Google Gemini.",
    category: "AI & Intelligence",
    status: "CONNECTED",
    type: "AI",
    icon: "sparkles",
    actions: ["disconnect", "configure", "prompt_ai"],
    config: { apiKey: "sk-****" },
  },
  {
    id: "salesforce-crm",
    name: "Salesforce CRM",
    description: "Sync customer data, leads, and sales activities. Drive conversions like never before!",
    category: "CRM & Data",
    status: "DISCONNECTED",
    type: "CRM",
    icon: "cloud",
    actions: ["connect", "configure"],
    config: { domain: "" },
  },
  {
    id: "slack-comm",
    name: "Slack Connect",
    description: "Streamline team communication, notifications, and collaborate in real-time.",
    category: "Communication",
    status: "CONNECTED",
    type: "COMMUNICATION",
    icon: "message",
    actions: ["disconnect", "configure"],
    config: { webhookUrl: "https://hooks.slack.com/services/mock" },
  },
  {
    id: "power-bi-analytics",
    name: "Power BI Analytics",
    description: "Visualize and analyze business data with interactive dashboards and reports.",
    category: "Analytics & Reporting",
    status: "DISCONNECTED",
    type: "ANALYTICS",
    icon: "chart-bar",
    actions: ["connect", "configure"],
    config: { workspaceId: "" },
  },
  {
    id: "jira-pm",
    name: "Jira Project Management",
    description: "Track projects, tasks, and issues with seamless integration into your workflow.",
    category: "Project Management",
    status: "CONNECTED",
    type: "PM",
    icon: "list-ul",
    actions: ["disconnect", "configure"],
    config: { projectKey: "MYAPP" },
  },
  {
    id: "custom-erp",
    name: "Custom ERP System",
    description: "Connect your bespoke enterprise resource planning system for unified operations.",
    category: "Enterprise Systems",
    status: "PENDING_AUTH",
    type: "DATA",
    icon: "database",
    actions: ["connect", "configure"],
    config: { apiUrl: "" },
  },
];

const MOCK_GEMINI_SMART_ACTIONS = [
  "Generate Q3 Sales Forecast",
  "Summarize Last Week's Customer Feedback",
  "Draft Onboarding Email for New Clients",
  "Analyze Market Trend Anomalies",
  "Suggest Next Best Action for High-Value Leads",
];

// --- Internal Component: IntegrationCard (for modularity and reusability) ---
interface IntegrationCardProps {
  integration: Integration;
  onAction: (integrationId: string, action: string) => void;
  onConfigure: (integration: Integration) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onAction,
  onConfigure,
}) => {
  const isConnected = integration.status === "CONNECTED";
  const isLoading = integration.status === "PENDING_AUTH";

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-md border mb-2",
        isConnected
          ? "border-green-300 bg-green-50"
          : integration.status === "ERROR"
          ? "border-red-300 bg-red-50"
          : "border-gray-200 bg-white",
      )}
    >
      <div className="flex items-center flex-grow">
        <Icon
          iconName={integration.icon}
          className={cn(
            "mr-3",
            isConnected ? "text-green-600" : "text-gray-500",
          )}
          size="m"
        />
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-900">{integration.name}</h4>
          <p className="text-sm text-gray-600 truncate">
            {integration.description}
          </p>
          <span
            className={cn(
              "text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full",
              isConnected
                ? "bg-green-200 text-green-800"
                : integration.status === "ERROR"
                ? "bg-red-200 text-red-800"
                : integration.status === "PENDING_AUTH"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-gray-200 text-gray-700",
            )}
          >
            {isLoading
              ? "Connecting..."
              : isConnected
              ? "Connected"
              : integration.status === "ERROR"
              ? "Error"
              : "Disconnected"}
            {isLoading && <Spinner className="inline-block ml-1 h-3 w-3" />}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4 space-x-2">
        {integration.actions.includes("configure") && (
          <Button
            size="small"
            variant="tertiary"
            onClick={() => onConfigure(integration)}
            disabled={isLoading}
          >
            Configure
          </Button>
        )}
        {isConnected ? (
          integration.actions.includes("disconnect") && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => onAction(integration.id, "disconnect")}
              disabled={isLoading}
            >
              Disconnect
            </Button>
          )
        ) : (
          integration.actions.includes("connect") && (
            <Button
              size="small"
              variant="primary"
              onClick={() => onAction(integration.id, "connect")}
              disabled={isLoading}
            >
              Connect
            </Button>
          )
        )}
      </div>
    </div>
  );
};

// --- Main Component: EpicIntegrationHubDropdown ---
export interface EpicIntegrationHubDropdownProps {
  onIntegrationAction?: (
    integrationId: string,
    action: string,
    newStatus?: IntegrationStatus,
    config?: Record<string, string>,
  ) => void;
}

function EpicIntegrationHubDropdown({
  onIntegrationAction,
}: EpicIntegrationHubDropdownProps) {
  const [searchValue, setSearchValue] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>(
    MOCK_INITIAL_INTEGRATIONS,
  );
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedIntegrationToConfigure, setSelectedIntegrationToConfigure] =
    useState<Integration | null>(null);
  const [currentConfig, setCurrentConfig] = useState<Record<string, string>>(
    {},
  );

  // Track opening of the hub
  useEffect(() => {
    trackEvent(null, EPIC_APP_ANALYTICS.HUB_OPENED, {
      path: window.location.pathname,
    });
  }, []);

  // Debounced search tracking
  const debouncedTrackSearch = useMemo(
    () =>
      debounce((value: string) => {
        trackEvent(null, EPIC_APP_ANALYTICS.INTEGRATION_SEARCHED, {
          searchValue: value,
          path: window.location.pathname,
        });
      }, 300),
    [],
  );

  const handleSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedTrackSearch(value);
  };

  const handleIntegrationAction = useCallback(
    (integrationId: string, action: string) => {
      setIntegrations((prev) =>
        prev.map((integration) => {
          if (integration.id === integrationId) {
            const newStatus: IntegrationStatus =
              action === "connect" ? "PENDING_AUTH" : "DISCONNECTED"; // Simulate pending for connect
            trackEvent(null, EPIC_APP_ANALYTICS.INTEGRATION_CONNECTED, {
              integrationId,
              action,
              path: window.location.pathname,
            });

            // Simulate API call delay
            setTimeout(() => {
              setIntegrations((current) =>
                current.map((i) =>
                  i.id === integrationId
                    ? {
                        ...i,
                        status:
                          action === "connect" ? "CONNECTED" : "DISCONNECTED",
                      }
                    : i,
                ),
              );
              onIntegrationAction?.(
                integrationId,
                action,
                action === "connect" ? "CONNECTED" : "DISCONNECTED",
              );
            }, 1500); // Simulate network latency

            return { ...integration, status: newStatus };
          }
          return integration;
        }),
      );
    },
    [onIntegrationAction],
  );

  const handleConfigureIntegration = useCallback((integration: Integration) => {
    setSelectedIntegrationToConfigure(integration);
    setCurrentConfig(integration.config || {});
    setConfigModalOpen(true);
  }, []);

  const handleSaveConfiguration = useCallback(() => {
    if (selectedIntegrationToConfigure) {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === selectedIntegrationToConfigure.id
            ? { ...i, config: currentConfig }
            : i,
        ),
      );
      trackEvent(null, EPIC_APP_ANALYTICS.INTEGRATION_CONFIGURED, {
        integrationId: selectedIntegrationToConfigure.id,
        path: window.location.pathname,
      });
      onIntegrationAction?.(
        selectedIntegrationToConfigure.id,
        "configure",
        selectedIntegrationToConfigure.status,
        currentConfig,
      );
      setConfigModalOpen(false);
      setSelectedIntegrationToConfigure(null);
      setCurrentConfig({});
    }
  }, [selectedIntegrationToConfigure, currentConfig, onIntegrationAction]);

  const handleGeminiPrompt = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setGeminiLoading(true);
    setGeminiResponse(null);
    setGeminiPrompt(""); // Clear input after sending

    trackEvent(null, EPIC_APP_ANALYTICS.GEMINI_PROMPT_SENT, {
      prompt,
      path: window.location.pathname,
    });

    // Simulate AI API call
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
    const mockResponses = [
      "Based on current market trends, we project a 15% increase in Q3 sales for accounts based in the Northeast region. A detailed report can be generated upon request.",
      "Customer feedback summary for the last week indicates high satisfaction with feature X, but also recurring requests for enhanced mobile UI. Perhaps integrate with Figma?",
      "Detected a potential anomaly in yesterday's transaction volume, indicating a large bulk order from a new corporate client. No immediate action required, but worth monitoring.",
      "Top 3 performing sales reps last month were Sarah J., Mark T., and Emily K. Consider a recognition program or bonus structure to capitalize on this momentum.",
      "To optimize lead conversion, focus on personalized follow-ups within 24 hours for leads scoring above 80. AI can assist in drafting these personalized messages.",
      "A comprehensive security audit report has been completed and is available in your designated secure document repository. No critical vulnerabilities found.",
    ];
    setGeminiResponse(
      mockResponses[Math.floor(Math.random() * mockResponses.length)],
    );
    setGeminiLoading(false);
  }, []);

  const handleSmartActionClick = useCallback((action: string) => {
    setGeminiPrompt(action);
    handleGeminiPrompt(action); // Trigger the prompt immediately
    trackEvent(null, EPIC_APP_ANALYTICS.GEMINI_SMART_ACTION_TRIGGERED, {
      action,
      path: window.location.pathname,
    });
  }, [handleGeminiPrompt]);

  const filteredIntegrations = useMemo(() => {
    if (!searchValue) return integrations;
    const lowerSearch = searchValue.toLowerCase();
    return integrations.filter(
      (integration) =>
        integration.name.toLowerCase().includes(lowerSearch) ||
        integration.description.toLowerCase().includes(lowerSearch) ||
        integration.category.toLowerCase().includes(lowerSearch),
    );
  }, [integrations, searchValue]);

  const groupedIntegrations = useMemo(() => {
    return filteredIntegrations.reduce(
      (acc, integration) => {
        if (!acc[integration.category]) {
          acc[integration.category] = [];
        }
        acc[integration.category].push(integration);
        return acc;
      },
      {} as Record<string, Integration[]>,
    );
  }, [filteredIntegrations]);

  return (
    <Popover>
      <PopoverTrigger
        buttonHeight="large" // Make the trigger more prominent for an 'epic' app
        className="px-6 py-3 font-semibold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <Icon iconName="sparkles" className="mr-3 text-white" size="l" />
        <span className="drop-shadow-sm">Unleash App Power</span>
      </PopoverTrigger>
      <PopoverPanel className="w-[450px] max-h-[600px] overflow-y-auto bg-gray-50 p-0 shadow-2xl rounded-xl">
        {({ close }) => (
          <div className="flex flex-col h-full">
            {/* Header with Close button */}
            <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100 sticky top-0 z-10">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center">
                <Icon
                  iconName="sparkles"
                  className="mr-2 text-purple-600"
                  size="l"
                />
                Epic Integration Hub
              </h3>
              <Button
                variant="tertiary"
                iconOnly
                onClick={close}
                aria-label="Close"
              >
                <Icon iconName="x" size="l" />
              </Button>
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
              {/* Search Bar for Integrations */}
              <Input
                placeholder="Search integrations, features, or ask AI..."
                value={searchValue}
                onChange={handleSearchValueChange}
                className="mb-4 shadow-sm"
                iconLeft="search"
              />

              {/* Gemini AI Powerhouse Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg shadow-md mb-6 border border-purple-200">
                <div className="flex items-center mb-3">
                  <Icon
                    iconName="gemini" // Assuming a 'gemini' icon exists or is custom
                    className="mr-2 text-purple-700"
                    size="l"
                  />
                  <h4 className="text-lg font-bold text-purple-800">
                    Gemini AI Powerhouse
                  </h4>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Your intelligent co-pilot. Ask anything, get smart insights
                  and trigger actions.
                </p>

                <Textarea
                  placeholder="Ask Gemini for a sales forecast, customer summary, or next best action..."
                  value={geminiPrompt}
                  onChange={(e) => setGeminiPrompt(e.target.value)}
                  className="mb-3 resize-y"
                  rows={3}
                  disabled={geminiLoading}
                />
                <Button
                  onClick={() => handleGeminiPrompt(geminiPrompt)}
                  fullWidth
                  variant="primary"
                  className="mb-3 bg-purple-600 hover:bg-purple-700 border-purple-600"
                  disabled={geminiLoading || !geminiPrompt.trim()}
                >
                  {geminiLoading ? (
                    <>
                      <Spinner className="mr-2" /> Generating Insight...
                    </>
                  ) : (
                    "Ask Gemini"
                  )}
                </Button>

                {geminiResponse && (
                  <div className="mt-4 p-3 bg-white border border-blue-200 rounded-md shadow-sm text-sm text-gray-800 animate-fade-in-up">
                    <strong className="text-blue-700 block mb-1">
                      Gemini's Insight:
                    </strong>
                    {geminiResponse}
                  </div>
                )}

                <div className="mt-4 border-t border-purple-100 pt-3">
                  <h5 className="text-md font-semibold text-purple-700 mb-2">
                    Smart Actions:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_GEMINI_SMART_ACTIONS.map((action, index) => (
                      <Button
                        key={index}
                        size="small"
                        variant="ghost"
                        className="border border-purple-300 text-purple-700 hover:bg-purple-100"
                        onClick={() => handleSmartActionClick(action)}
                        disabled={geminiLoading}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other Integrations Section */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Icon iconName="bolt" className="mr-2 text-blue-600" />
                  Your Connected Ecosystem
                </h3>
                {Object.keys(groupedIntegrations).length === 0 ? (
                  <div className="text-center text-gray-600 py-8">
                    <Icon iconName="plug" size="2xl" className="mb-3" />
                    <p className="font-semibold">No integrations found.</p>
                    <p className="text-sm">
                      Try adjusting your search or explore new possibilities
                      with Gemini.
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedIntegrations).map(
                    ([category, integrations]) => (
                      <div key={category} className="mb-5">
                        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                          {category}
                        </h4>
                        {integrations.map((integration) => (
                          <IntegrationCard
                            key={integration.id}
                            integration={integration}
                            onAction={handleIntegrationAction}
                            onConfigure={handleConfigureIntegration}
                          />
                        ))}
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </PopoverPanel>

      {/* Configuration Modal */}
      <Modal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)}>
        <ModalContent className="max-w-md">
          <ModalHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-t-lg">
            Configure {selectedIntegrationToConfigure?.name}
          </ModalHeader>
          <ModalBody className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Adjust the settings for your{" "}
              <strong>{selectedIntegrationToConfigure?.name}</strong>{" "}
              integration.
            </p>
            {selectedIntegrationToConfigure &&
              Object.keys(selectedIntegrationToConfigure.config || {}).length ===
                0 && (
                <p className="text-gray-500 italic">
                  No specific configuration options available for this
                  integration.
                </p>
              )}
            {selectedIntegrationToConfigure &&
              Object.entries(currentConfig).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {key.replace(/([A-Z])/g, " $1").trim()}{" "}
                    {/* Basic camelCase to sentence case */}
                  </label>
                  <Input
                    id={key}
                    type={key.toLowerCase().includes("key") ? "password" : "text"}
                    value={value}
                    onChange={(e) =>
                      setCurrentConfig({ ...currentConfig, [key]: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              ))}
          </ModalBody>
          <ModalFooter className="flex justify-end p-4 border-t border-gray-100">
            <Button
              variant="tertiary"
              onClick={() => setConfigModalOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveConfiguration}>
              Save Configuration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Popover>
  );
}

export default EpicIntegrationHubDropdown;