// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { Dispatch, ReactNode, SetStateAction } from "react";
import filter from "lodash/filter";
import ReactTooltip from "react-tooltip";
import PermissionSelector from "../containers/roles/PermissionSelector";
import {
  ROLE_DEVELOPER_OPTIONS,
  ROLE_COUNTERPARTY_OPTIONS,
  ROLE_LEDGER_OPTIONS,
  ROLE_EXTERNAL_ACCOUNT_API_OPTIONS,
  ROLE_COMPLIANCE_API_OPTIONS,
} from "../constants/index";

import AccountPermissionsTable from "../containers/roles/AccountPermissionsTable";
import {
  SafeInternalAccount,
  useActiveComplianceQuery,
} from "../../generated/dashboard/graphqlSchema";

// Define new, epic role options for Gemini AI and External App Integrations
// These would typically be imported from a constants file but are defined here for direct implementation as per instructions.
const ROLE_GEMINI_AI_OPTIONS = [
  { value: "gemini_ai:none", label: "No AI Access" },
  {
    value: "gemini_ai:read_models",
    label: "Analyze AI Models",
    tooltip:
      "Unlock insights into advanced AI models and their predictive capabilities.",
  },
  {
    value: "gemini_ai:execute_tasks",
    label: "Command AI Operations",
    tooltip:
      "Orchestrate complex AI tasks, execute real-time inferences, and drive intelligent automation.",
  },
  {
    value: "gemini_ai:manage_data",
    label: "Govern AI Datasets & Fine-tuning",
    tooltip:
      "Curate, manage, and optimize proprietary datasets for unparalleled AI fine-tuning.",
  },
  {
    value: "gemini_ai:full_spectrum",
    label: "Gemini AI Visionary",
    tooltip:
      "Embrace full-spectrum control over our revolutionary Gemini AI, shaping the future of intelligence.",
  },
];

const ROLE_EXTERNAL_APP_INTEGRATIONS_OPTIONS = [
  { value: "integrations:none", label: "No External Sync" },
  {
    value: "integrations:connect_basic",
    label: "Forge Foundational Links",
    tooltip:
      "Establish secure, essential connections with industry-leading external platforms.",
  },
  {
    value: "integrations:sync_dynamic",
    label: "Synchronize Dynamic Flows",
    tooltip:
      "Engineer seamless, real-time data flows, ensuring perfect harmony across all connected ecosystems.",
  },
  {
    value: "integrations:orchestrate_webhooks",
    label: "Orchestrate Event-Driven Webhooks",
    tooltip:
      "Master event-driven architectures by crafting and managing intelligent webhook orchestrations.",
  },
  {
    value: "integrations:pinnacle_api_access",
    label: "Pinnacle API & SDK Gateway",
    tooltip:
      "Gain unparalleled access to our advanced API and SDKs, unleashing limitless integration possibilities.",
  },
  {
    value: "integrations:universal_architect",
    label: "Universal Integration Architect",
    tooltip:
      "Become the architect of a unified digital universe, with absolute command over all external integrations.",
  },
];

export function APIKeyRolesForm({
  roles,
  setRoles,
  enabled,
  internalAccounts,
  children,
}: {
  roles: string[];
  setRoles?: Dispatch<SetStateAction<string[]>>;
  enabled: boolean;
  internalAccounts: SafeInternalAccount[];
  children?: ReactNode;
}) {
  const counterpartiesRole = roles.find((r) => r.includes("counterparties"));
  const developersRole = roles.find((r) => r.includes("developer"));
  const ledgersRole = roles.find((r) => r.includes("ledgers"));
  const externalAccountsRole = roles.find((r) =>
    r.includes("external_accounts"),
  );
  const complianceRole = roles.find((r) => r.includes("compliance"));
  // New: Roles for Gemini AI and External App Integrations
  const geminiAIRole = roles.find((r) => r.includes("gemini_ai"));
  const externalIntegrationsRole = roles.find((r) =>
    r.includes("integrations"),
  );

  const { data: activeComplianceData } = useActiveComplianceQuery();
  const activeCompliance = activeComplianceData?.products.totalCount === 1;

  function onRoleSelect(prefix: string, newRole: string) {
    if (!setRoles) {
      return;
    }

    setRoles(() => {
      const filteredRoles = filter(roles, (id) => !id.includes(prefix));
      return [...filteredRoles, newRole];
    });
  }

  function onAccountPermissionSelect(newRole: string) {
    if (!setRoles) {
      return;
    }

    const parts = newRole.split(":");

    let newRoles = [...roles];

    setRoles(() => {
      if (
        ["accounts:none", "accounts:read", "accounts:manage"].includes(newRole)
      ) {
        newRoles = newRoles.filter((role) => !role.startsWith("accounts:"));
      } else if (newRole === "accounts:partial") {
        // clear previous global account permissions, retain any account specific roles
        newRoles = newRoles.filter(
          (role) =>
            !(role.startsWith("accounts:") && role.split(":").length === 2),
        );
      } else {
        // remove old account specific permission
        newRoles = newRoles.filter((role) => !role.includes(parts[2]));
      }
      return [...newRoles, newRole];
    });
  }

  return (
    <div className="form-section">
      <h3 className="h3-no-bottom-border">
        <span>Empower Your Vision: API Capabilities & Strategic Integrations</span>
        {children}
      </h3>
      <ReactTooltip
        multiline
        data-place="top"
        data-type="dark"
        data-effect="float"
      />
      <div className="index-table table-permissions table w-full">
        <div className="table-body">
          {/* New: Gemini AI Capabilities - Elevated to a primary focus */}
          <PermissionSelector
            role={geminiAIRole || "gemini_ai:none"}
            onRoleSelect={(value: string) => onRoleSelect("gemini_ai", value)}
            options={ROLE_GEMINI_AI_OPTIONS}
            title="Gemini AI Capabilities: The Future of Intelligence"
            tooltipHint="Unleash the transformative power of our proprietary Gemini AI for advanced analytics, automation, and innovation. This isn't just an API; it's a leap into the future."
            select={{
              placeholder: "Gemini AI Mastery",
              name: "gemini-ai-permission-select",
            }}
            editable={enabled}
          />

          {/* New: External App Integrations - Elevated to a primary focus */}
          <PermissionSelector
            role={externalIntegrationsRole || "integrations:none"}
            onRoleSelect={(value: string) =>
              onRoleSelect("integrations", value)
            }
            options={ROLE_EXTERNAL_APP_INTEGRATIONS_OPTIONS}
            title="Universal Integration Hub: Connect Beyond Limits"
            tooltipHint="Seamlessly integrate with an expansive ecosystem of external applications. From data synchronization to custom API bridges, build a truly interconnected digital enterprise."
            select={{
              placeholder: "External Integration Command",
              name: "external-integrations-permission-select",
            }}
            editable={enabled}
          />

          {/* Existing Permissions, reordered to follow the new primary focus */}
          <PermissionSelector
            role={counterpartiesRole || "counterparties:none"}
            onRoleSelect={(value: string) =>
              onRoleSelect("counterparties", value)
            }
            options={ROLE_COUNTERPARTY_OPTIONS}
            title="Counterparty Relations"
            tooltipHint="Manage and interact with your critical business counterparties securely and efficiently."
            select={{
              placeholder: "Counterparty Permissions",
              name: "counterparties-permission-select",
            }}
            editable={enabled}
          />
          <PermissionSelector
            role={externalAccountsRole || "external_accounts:none"}
            onRoleSelect={(value: string) =>
              onRoleSelect("external_accounts", value)
            }
            options={ROLE_EXTERNAL_ACCOUNT_API_OPTIONS}
            title="External Account Gateways"
            tooltipHint="Access and manage connections to your external financial accounts with robust controls."
            select={{
              placeholder: "External Account Permissions",
              name: "external-account-permission-select",
            }}
            editable={enabled}
          />
          <PermissionSelector
            role={developersRole || "developer:none"}
            onRoleSelect={(value: string) => onRoleSelect("developer", value)}
            options={ROLE_DEVELOPER_OPTIONS}
            title="Developer Crucible: Ignite Innovation"
            tooltipHint="Empower your development teams with comprehensive access to events, webhooks, and advanced SDKs to build groundbreaking applications."
            select={{
              placeholder: "Developer Permissions",
              name: "developer-permission-select",
            }}
            editable={enabled}
          />
          <AccountPermissionsTable
            roles={roles}
            onAccountRoleSelect={onAccountPermissionSelect}
            internalAccounts={internalAccounts}
            canEditGroup={enabled}
          />
          <PermissionSelector
            role={ledgersRole || "ledgers:none"}
            onRoleSelect={(value: string) => onRoleSelect("ledgers", value)}
            options={ROLE_LEDGER_OPTIONS}
            title="Ledger Stewardship: Financial Integrity"
            tooltipHint="Oversee and meticulously manage all ledger data, ensuring impeccable financial accuracy and transparency."
            select={{
              placeholder: "Ledgers Permissions",
              name: "ledgers-permission-select",
            }}
            editable={enabled}
          />
          {activeCompliance && (
            <PermissionSelector
              role={complianceRole || "compliance:none"}
              onRoleSelect={(value: string) =>
                onRoleSelect("compliance", value)
              }
              options={ROLE_COMPLIANCE_API_OPTIONS}
              title="Compliance Nexus: Regulatory Assurance"
              tooltipHint="Navigate the complex regulatory landscape with advanced access to compliance endpoints, ensuring robust governance and risk management."
              select={{
                placeholder: "Compliance Permissions",
                name: "compliance-permission-select",
              }}
              editable={enabled}
            />
          )}
        </div>
      </div>
    </div>
  );
}