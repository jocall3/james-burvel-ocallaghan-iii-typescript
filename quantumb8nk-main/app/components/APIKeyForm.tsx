// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { APIKeyRolesForm } from "./APIKeyRolesForm";
import { IPAllowlistForm } from "./IPAllowlistForm";
import ReduxInputField from "../../common/deprecated_redux/ReduxInputField";
import { Button } from "../../common/ui-components";
import { ApiKeyFormDeprecatedQuery } from "../../generated/dashboard/graphqlSchema";

// Renamed component for an "epic" integration focus
function UnifiedIntegrationNexusForm({
  id,
  internalAccounts,
  ipAllowlist: initialIpAllowlist,
  roles: initialRoles,
  name: initialName,
  // New props for Gemini and Webhook integrations
  geminiEnabled: initialGeminiEnabled = false,
  geminiProjectId: initialGeminiProjectId = "",
  webhooksEnabled: initialWebhooksEnabled = false,
  webhookEndpoint: initialWebhookEndpoint = "",
  onSubmit,
}: {
  id?: string;
  internalAccounts: Pick<
    ApiKeyFormDeprecatedQuery["internalAccountsUnpaginated"][0],
    "id" | "longName"
  >[];
  ipAllowlist?: string[] | null;
  roles?: string[];
  name?: string;
  // Updated onSubmit signature to include new integration parameters
  onSubmit: ({
    name,
    roles,
    ipAllowlist,
    geminiEnabled,
    geminiProjectId,
    webhooksEnabled,
    webhookEndpoint,
  }) => void;
  // New props definition
  geminiEnabled?: boolean;
  geminiProjectId?: string;
  webhooksEnabled?: boolean;
  webhookEndpoint?: string;
}) {
  const [ipAllowlist, setIpAllowlist] = useState(initialIpAllowlist || []);
  const [roles, setRoles] = useState(initialRoles || []);
  const [name, setName] = useState(initialName || "");

  // New state for Gemini Integration
  const [geminiEnabled, setGeminiEnabled] = useState(initialGeminiEnabled);
  const [geminiProjectId, setGeminiProjectId] = useState(initialGeminiProjectId);

  // New state for Webhook Integration
  const [webhooksEnabled, setWebhooksEnabled] = useState(initialWebhooksEnabled);
  const [webhookEndpoint, setWebhookEndpoint] = useState(initialWebhookEndpoint);

  const updating = !!id;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Forge Your Integration Nexus</h1> {/* Epic title */}
      <p className="text-gray-600 mb-8">Unleash the power of Gemini AI and external apps with custom-crafted integration keys. Elevate your platform to new dimensions of capability and reach millions.</p>

      {/* SECTION: Core Integration Key Details */}
      <div className="form-section mb-6 p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Core Integration Key Identity</h2>
        <div className="form-row flex">
          <ReduxInputField
            input={{
              onChange: (e) => setName(e.target.value),
              value: name,
              name: "name",
            }}
            type="text"
            label="Integration Key Name" // Renamed label
            placeholder="e.g., Gemini AI Data Flow, Marketing Automation Nexus"
          />
        </div>
      </div>

      {/* SECTION: IP Access Gateways */}
      <div className="form-section mb-6 p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">IP Access Gateways (Security Protocols)</h2>
        <IPAllowlistForm
          ipAllowlist={ipAllowlist}
          setIpAllowlist={setIpAllowlist}
          enabled
        />
        <div className="header-hint mt-2 text-sm text-gray-500">
            Define authorized network origins for this integration key to enhance security.
        </div>
      </div>

      {/* SECTION: Access Nexus Capabilities */}
      <div className="form-section mb-6 p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Access Nexus Capabilities (Permission Matrix)</h2>
        <APIKeyRolesForm
          roles={roles}
          setRoles={setRoles}
          internalAccounts={internalAccounts}
          enabled={!updating}
        >
          <div className="header-hint text-sm text-gray-500">
            Configure the precise capabilities this Integration Key will command within our ecosystem.
            {updating && (
              <div>
                Existing keys have immutable permissions. For new capabilities, forge a new Integration Key.
              </div>
            )}
          </div>
        </APIKeyRolesForm>
      </div>

      {/* NEW SECTION: Gemini AI Nexus Integration */}
      <div className="form-section mb-6 p-4 border rounded-md shadow-sm bg-blue-50">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">🚀 Gemini AI Nexus Integration</h2>
        <p className="mb-4 text-blue-700">Connect directly to Google's Gemini AI to unlock advanced conversational, data analysis, and generative capabilities.</p>
        <div className="form-row flex items-center mb-4">
          <input
            type="checkbox"
            id="geminiEnabled"
            checked={geminiEnabled}
            onChange={(e) => setGeminiEnabled(e.target.checked)}
            className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="geminiEnabled" className="text-lg font-medium text-blue-800">Activate Gemini AI Nexus</label>
        </div>
        {geminiEnabled && (
          <>
            <div className="form-row flex mb-4">
              <ReduxInputField
                input={{
                  onChange: (e) => setGeminiProjectId(e.target.value),
                  value: geminiProjectId,
                  name: "geminiProjectId",
                  placeholder: "e.g., your-gemini-project-id-123",
                }}
                type="text"
                label="Gemini AI Project ID"
                hint="Your unique identifier for the Google Gemini project. Essential for direct API calls."
              />
            </div>
            <div className="form-row flex justify-end">
              <Button
                buttonType="secondary"
                onClick={() => alert("Simulating launch of Gemini Capability Management Portal...")} // Placeholder for a more complex action
                className="mr-2"
              >
                Configure Advanced Gemini Directives
              </Button>
            </div>
          </>
        )}
      </div>

      {/* NEW SECTION: External Webhook Conduit */}
      <div className="form-section mb-6 p-4 border rounded-md shadow-sm bg-purple-50">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">🔗 External Webhook Conduit</h2>
        <p className="mb-4 text-purple-700">Establish real-time data flow with any external application via secure webhooks. Push notifications and event-driven data across your integrated ecosystem.</p>
        <div className="form-row flex items-center mb-4">
          <input
            type="checkbox"
            id="webhooksEnabled"
            checked={webhooksEnabled}
            onChange={(e) => setWebhooksEnabled(e.target.checked)}
            className="mr-2 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="webhooksEnabled" className="text-lg font-medium text-purple-800">Enable External Webhooks</label>
        </div>
        {webhooksEnabled && (
          <>
            <div className="form-row flex mb-4">
              <ReduxInputField
                input={{
                  onChange: (e) => setWebhookEndpoint(e.target.value),
                  value: webhookEndpoint,
                  name: "webhookEndpoint",
                  placeholder: "e.g., https://yourapp.com/api/webhooks/inbound",
                }}
                type="url" // Using type "url" for better input validation hint
                label="Webhook Destination Endpoint"
                hint="The URL where event data will be dispatched. Must be publicly accessible."
              />
            </div>
            <div className="form-row flex justify-end">
              <Button
                buttonType="secondary"
                onClick={() => alert(`Simulating test event dispatch to: ${webhookEndpoint || 'No endpoint defined'}`)} // Placeholder action
                disabled={!webhookEndpoint}
              >
                Simulate Webhook Flow Test
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Action Button */}
      <div className="form-group mt-8">
        <Button
          buttonType="primary"
          onClick={() =>
            onSubmit({
              name,
              roles,
              ipAllowlist,
              geminiEnabled,
              geminiProjectId,
              webhooksEnabled,
              webhookEndpoint,
            })
          }
        >
          {updating ? "Update Integration Nexus" : "Forge New Integration Nexus"}
        </Button>
      </div>
    </div>
  );
}

export default UnifiedIntegrationNexusForm;