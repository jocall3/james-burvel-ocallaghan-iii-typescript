import React, { useState } from "react";
import {
  ApiKeyViewQuery,
  SafeInternalAccount,
  Permission,
} from "../../generated/dashboard/graphqlSchema";
import {
  CopyableText,
  DateTime,
  Drawer,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
  Pill,
  Button,
  Modal,
  Input,
  Textarea,
  Alert,
  Spinner,
} from "../../common/ui-components"; // Assuming these UI components are available
import APIKeySecret from "./APIKeySecret";
import { APIKeyRolesForm } from "./APIKeyRolesForm";
import PermissionsTable from "../containers/user_management/PermissionsTable";
import { getDrawerContent } from "~/common/utilities/getDrawerContent";

// --- New Core Integration Components (Simulated for demonstration) ---

interface GeminiAISetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (apiKey: string, config: { projectId: string; region: string }) => void;
  loading: boolean;
  error?: string;
}

const GeminiAISetupModal: React.FC<GeminiAISetupModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  loading,
  error,
}) => {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [projectId, setProjectId] = useState("");
  const [region, setRegion] = useState("us-central1");

  const handleSubmit = () => {
    if (geminiApiKey && projectId) {
      onConnect(geminiApiKey, { projectId, region });
    } else {
      // In a real app, use better form validation/feedback
      alert("Please provide Gemini API Key and Project ID.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Gemini AI Co-Pilot"
      description="Elevate your operations with powerful AI assistance. Connect your Gemini account to unlock advanced insights and automation."
    >
      <div className="space-y-4 p-4">
        {error && <Alert variant="error" message={error} />}
        <div>
          <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700">
            Gemini API Key
          </label>
          <Input
            id="geminiApiKey"
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="mt-1 block w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
            Google Cloud Project ID
          </label>
          <Input
            id="projectId"
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Your Google Cloud Project ID"
            className="mt-1 block w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Region
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            disabled={loading}
          >
            <option value="us-central1">us-central1 (Iowa)</option>
            <option value="europe-west1">europe-west1 (Belgium)</option>
            <option value="asia-east1">asia-east1 (Taiwan)</option>
            {/* Add more regions as needed */}
          </select>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || !geminiApiKey || !projectId}>
            {loading ? <Spinner className="w-4 h-4 mr-2" /> : null}
            Connect Gemini
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface ExternalAppCardProps {
  appName: string;
  description: string;
  iconSrc?: string;
  isConnected: boolean;
  onConnect: () => void;
  onManage: () => void;
}

const ExternalAppCard: React.FC<ExternalAppCardProps> = ({
  appName,
  description,
  iconSrc,
  isConnected,
  onConnect,
  onManage,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 bg-white">
      <div className="flex items-center mb-4">
        {iconSrc && <img src={iconSrc} alt={`${appName} icon`} className="w-10 h-10 mr-4 rounded-md object-contain" />}
        <h3 className="text-xl font-semibold text-gray-800">{appName}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-5 flex-grow">{description}</p>
      <div className="flex justify-end mt-auto">
        {isConnected ? (
          <Button variant="secondary" onClick={onManage} className="py-2 px-4 text-sm">
            Manage Integration
          </Button>
        ) : (
          <Button variant="primary" onClick={onConnect} className="py-2 px-4 text-sm bg-indigo-600 hover:bg-indigo-700">
            Connect App
          </Button>
        )}
      </div>
    </div>
  );
};

// --- End New Core Integration Components ---

interface APIKeyViewFormProps {
  apiKey?: ApiKeyViewQuery["apiKey"];
  onShowApiKeySecret: (id: string) => void;
  loading: boolean;
  apiKeyMapping: Record<string, string>;
  roles: Array<string>;
  internalAccounts: SafeInternalAccount[];
  fullApiKey?: string | null;
  permissions?: Permission[];
  showPermissions?: boolean;
}

function formatAPIKey(
  apiKey: ApiKeyViewQuery["apiKey"],
  onShowKeySecret: (id: string) => void,
  keySecretLoading: boolean,
  fullApiKey?: string | null,
) {
  if (!apiKey) {
    return {};
  }
  return {
    ...apiKey,
    createdAtPrettyTime: <DateTime timestamp={apiKey.createdAt} />,
    decommissionedAtPrettyTime: apiKey.decommissionedAt ? (
      <DateTime timestamp={apiKey.decommissionedAt} />
    ) : null,
    liveMode: apiKey.liveMode ? "True" : "False",
    creator: apiKey.creator ? (
      <a href={apiKey.creator.path} className="text-indigo-600 hover:underline">{apiKey.creator.name}</a>
    ) : (
      "Default"
    ),
    prettyIpAllowlist:
      apiKey.ipAllowlist && apiKey.ipAllowlist.length > 0 ? (
        apiKey.ipAllowlist.join(", ")
      ) : (
        <span className="italic text-gray-500">All IP Addresses</span>
      ),
    secret: (
      <APIKeySecret
        key={apiKey.id}
        secret={fullApiKey || apiKey.keySecret}
        onShowApiKeySecret={() => onShowKeySecret(apiKey.id)}
        loading={keySecretLoading}
      />
    ),
    organizationId: (
      <CopyableText text={apiKey.organizationId}>
        <code className="bg-gray-100 p-1 rounded text-sm">{apiKey.organizationId}</code>
      </CopyableText>
    ),
    rateLimit: <span className="text-gray-700">{apiKey.rateLimit} requests per second</span>,
    ...(apiKey.rolesV2 &&
      apiKey.rolesV2.length > 0 &&
      apiKey.rolesV2[0].mtManaged && {
        roleV2: (
          <Drawer
            trigger={
              <div className="mr-1">
                <Pill className="associated-entity z-10 bg-purple-100 text-purple-800 border-purple-300" showTooltip>
                  {apiKey.rolesV2[0].name}
                </Pill>
              </div>
            }
            path={`/settings/user_management/roles/${apiKey.rolesV2[0].id}`}
          >
            {getDrawerContent("Role", apiKey.rolesV2[0].id)}
          </Drawer>
        ),
      }),
  };
}

export default function APIKeyViewForm({
  apiKey,
  onShowApiKeySecret,
  loading,
  apiKeyMapping,
  roles,
  internalAccounts,
  fullApiKey,
  permissions,
  showPermissions,
}: APIKeyViewFormProps) {
  const [showGeminiSetup, setShowGeminiSetup] = useState(false);
  const [isGeminiConnecting, setIsGeminiConnecting] = useState(false);
  const [geminiConnectionError, setGeminiConnectionError] = useState<string | undefined>(undefined);
  // Simulate connection status; in a real app, this would come from a backend or global state
  const [isGeminiConnected, setIsGeminiConnected] = useState(false); 

  const handleConnectGemini = async (key: string, config: { projectId: string; region: string }) => {
    setIsGeminiConnecting(true);
    setGeminiConnectionError(undefined);
    try {
      // Simulate an actual API call to your backend to connect Gemini
      console.log("Simulating connection to Gemini with key (masked):", key.substring(0, 4) + '...', "and config:", config);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network latency

      // Simulate a random success/failure for demonstration purposes
      if (Math.random() > 0.15) { // 85% chance of success
        setIsGeminiConnected(true);
        setShowGeminiSetup(false);
        alert("🎉 Gemini AI Co-Pilot connected successfully!");
        console.log("Gemini successfully connected!");
      } else {
        throw new Error("Authentication failed with Gemini. Please verify your API Key and Project ID.");
      }
    } catch (error: any) {
      setGeminiConnectionError(error.message || "An unexpected error occurred during Gemini connection.");
      console.error("Gemini connection error:", error);
    } finally {
      setIsGeminiConnecting(false);
    }
  };

  const handleManageGemini = () => {
    console.log("Navigating to Gemini AI Co-Pilot management settings.");
    alert("Navigating to Gemini AI Co-Pilot management settings. This would open a dedicated view for AI configuration.");
  };

  const handleConnectExternalApp = (appName: string) => {
    console.log(`Initiating connection flow for: ${appName}`);
    alert(`Initiating connection for ${appName}. This would open a specific setup modal or navigate to an integration page.`);
  };

  const handleManageExternalApp = (appName: string) => {
    console.log(`Navigating to management for: ${appName}`);
    alert(`Managing integration for ${appName}. This would open a dedicated view for ${appName} settings.`);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen font-sans">
      {/* Hero Section for Ecosystem Integration */}
      <div className="text-center mb-16 py-10 bg-white rounded-xl shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 opacity-30 -z-10 blur-2xl transform scale-150"></div>
        <hgroup className="relative z-10">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-700 mb-5 tracking-tighter leading-tight">
            The Ultimate Integration Ecosystem
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light">
            Forge an unstoppable force by seamlessly connecting our platform with cutting-edge AI like Gemini
            and your most vital external applications. Unlock unparalleled intelligence, automation, and synergy.
          </p>
        </hgroup>
      </div>

      {/* Gemini AI Co-Pilot Section - Primary Focus */}
      <section className="mb-12 p-10 bg-white rounded-2xl shadow-2xl border border-purple-200 relative overflow-hidden transform hover:scale-[1.005] transition-all duration-300 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-40 -z-10 blur-xl"></div>
        <h2 className="text-4xl font-bold text-gray-800 mb-7 flex items-center">
          <span role="img" aria-label="gemini icon" className="mr-4 text-5xl animate-pulse-light">✨</span> Gemini AI Co-Pilot
          {isGeminiConnected && <Pill className="ml-5 text-base bg-green-100 text-green-800 border-green-300 font-medium">Connected & Active</Pill>}
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-prose">
          Integrate Google's most powerful AI models to supercharge your data analysis, content generation, customer support, and strategic decision-making. Your intelligent assistant, always on standby to elevate every aspect of your business.
        </p>
        <div className="flex items-center space-x-5 flex-wrap gap-y-4">
          {!isGeminiConnected ? (
            <Button
              variant="primary"
              size="large"
              onClick={() => setShowGeminiSetup(true)}
              className="px-10 py-4 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Connect Gemini Now
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="large"
              onClick={handleManageGemini}
              className="px-10 py-4 text-lg border-2 border-indigo-400 text-indigo-700 font-semibold rounded-xl shadow-md hover:bg-indigo-50 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Manage Gemini Integration
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => console.log("Directing to Gemini AI features demo...")}
            className="text-indigo-600 hover:text-indigo-800 text-lg font-medium"
          >
            See AI in Action <span aria-hidden="true" className="ml-1 text-xl">🚀</span>
          </Button>
        </div>

        <GeminiAISetupModal
          isOpen={showGeminiSetup}
          onClose={() => setShowGeminiSetup(false)}
          onConnect={handleConnectGemini}
          loading={isGeminiConnecting}
          error={geminiConnectionError}
        />
      </section>

      {/* Other External App Integrations Section */}
      <section className="mb-12 p-10 bg-white rounded-2xl shadow-2xl border border-indigo-200">
        <h2 className="text-4xl font-bold text-gray-800 mb-7 flex items-center">
          <span role="img" aria-label="apps icon" className="mr-4 text-5xl">🔗</span> Ecosystem App Catalog
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-prose">
          Discover and seamlessly integrate with a curated selection of leading applications. Expand your platform's capabilities across marketing, sales, finance, and operations with secure, high-performance connectors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ExternalAppCard
            appName="Salesforce CRM"
            description="Sync customer data, automate sales workflows, and gain a unified view of your pipeline from lead to close."
            iconSrc="https://developer.salesforce.com/files/salesforce-icon-transparent.png"
            isConnected={false}
            onConnect={() => handleConnectExternalApp("Salesforce CRM")}
            onManage={() => handleManageExternalApp("Salesforce CRM")}
          />
          <ExternalAppCard
            appName="Slack Workspace"
            description="Streamline team communication, receive real-time alerts, and foster efficient collaboration across projects."
            iconSrc="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
            isConnected={true}
            onConnect={() => handleConnectExternalApp("Slack Workspace")}
            onManage={() => handleManageExternalApp("Slack Workspace")}
          />
          <ExternalAppCard
            appName="Stripe Payments"
            description="Manage payments, subscriptions, and financial data with robust and secure integration, ensuring smooth transactions."
            iconSrc="https://stripe.com/img/v3/home/social/open_graph.png"
            isConnected={false}
            onConnect={() => handleConnectExternalApp("Stripe Payments")}
            onManage={() => handleManageExternalApp("Stripe Payments")}
          />
          <ExternalAppCard
            appName="HubSpot Marketing"
            description="Automate marketing campaigns, track leads, and manage your customer relationships end-to-end with powerful tools."
            iconSrc="https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/primary-logo.svg"
            isConnected={true}
            onConnect={() => handleConnectExternalApp("HubSpot Marketing")}
            onManage={() => handleManageExternalApp("HubSpot Marketing")}
          />
          <ExternalAppCard
            appName="GitHub Development"
            description="Streamline your development workflows by connecting to GitHub for seamless code management and deployments."
            iconSrc="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            isConnected={false}
            onConnect={() => handleConnectExternalApp("GitHub Development")}
            onManage={() => handleManageExternalApp("GitHub Development")}
          />
          <ExternalAppCard
            appName="Zendesk Support"
            description="Integrate your customer support operations with Zendesk to provide fast, efficient, and personalized service."
            iconSrc="https://upload.wikimedia.org/wikipedia/commons/e/e3/Zendesk_logo.png"
            isConnected={true}
            onConnect={() => handleConnectExternalApp("Zendesk Support")}
            onManage={() => handleManageExternalApp("Zendesk Support")}
          />
        </div>
        <div className="mt-10 text-center">
          <Button
            variant="ghost"
            onClick={() => console.log("Navigating to full app marketplace...")}
            className="text-xl text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Explore Our Full App Marketplace <span aria-hidden="true" className="ml-1 text-xl">→</span>
          </Button>
        </div>
      </section>

      {/* Original API Key Details and Permissions - now part of the broader ecosystem view */}
      <section className="p-10 bg-white rounded-2xl shadow-2xl border border-gray-200">
        <h2 className="text-4xl font-bold text-gray-800 mb-7 flex items-center">
          <span role="img" aria-label="key icon" className="mr-4 text-5xl">🔑</span> Your Internal API Keys & Access
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-prose">
          Manage the programmatic access credentials for your own applications and services within our ecosystem. Secure and granular control for seamless internal operations and bespoke integrations.
        </p>
        <div className="border border-gray-200 rounded-xl p-8 bg-gray-50">
          {!apiKey && <KeyValueTableSkeletonLoader dataMapping={apiKeyMapping} />}
          {!!apiKey && (
            <>
              {apiKey.default && (
                <Alert
                  variant="info"
                  title="Default API Key Status"
                  message="This is a default API key. Permissions for new products and services will be automatically added to this key, ensuring broad access."
                  className="mb-8"
                />
              )}
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">API Key Details</h3>
              <KeyValueTable
                data={formatAPIKey(
                  apiKey,
                  onShowApiKeySecret,
                  loading,
                  fullApiKey,
                )}
                dataMapping={apiKeyMapping}
              />
            </>
          )}

          {showPermissions ? (
            <>
              <h3 className="text-2xl font-semibold mt-12 mb-6 text-gray-800">Granular Permissions Overview</h3>
              <PermissionsTable permissions={permissions || []} />
            </>
          ) : (
            <div className="mt-12">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">Associated Roles & Accounts</h3>
              <APIKeyRolesForm
                roles={roles ?? []}
                internalAccounts={internalAccounts}
                enabled={false} // Assuming roles/accounts are managed elsewhere for this view
              />
            </div>
          )}
        </div>
      </section>

      {/* Grand Call to Action Footer */}
      <div className="text-center mt-20 p-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-3xl">
        <h2 className="text-5xl font-extrabold mb-6 tracking-tight">
          Ready to Architect Your Future?
        </h2>
        <p className="text-xl max-w-3xl mx-auto mb-10 font-light">
          Embrace the power of a truly integrated ecosystem. From advanced AI to critical business applications, our platform is your launchpad to unprecedented innovation and success.
        </p>
        <Button
          variant="secondary"
          size="large"
          onClick={() => alert("Initiating guided integration setup for new users!")}
          className="px-12 py-5 bg-white text-purple-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 ease-in-out text-xl"
        >
          Start Your Integration Journey Today!
        </Button>
      </div>
    </div>
  );
}