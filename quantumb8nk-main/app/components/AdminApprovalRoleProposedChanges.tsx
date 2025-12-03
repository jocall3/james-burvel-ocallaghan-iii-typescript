// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import TruncateString from "react-truncate-string";
import ReactTooltip from "react-tooltip";
import {
  ProposedChange,
  Group,
  SafeInternalAccount,
} from "~/generated/dashboard/graphqlSchema";
import { KeyValueTable, Icon } from "~/common/ui-components";
import {
  ROLE_ORGANIZATION_MAPPING,
  ROLE_DEVELOPER_MAPPING,
  ROLE_COUNTERPARTY_MAPPING,
  ROLE_EXTERNAL_ACCOUNT_MAPPING,
  ROLE_LEDGER_MAPPING,
  ACCOUNT_PERMISSIONS_MAPPING,
  ROLE_COMPLIANCE_MAPPING,
  ROLE_PARTNER_SEARCH_MAPPING,
  ROLE_API_KEYS_MAPPING,
  ROLE_CUSTOMER_ADMIN_TOOLS_MAPPING,
  ROLE_PARTNER_ADMIN_TOOLS_MAPPING,
  ROLE_ENGINEERING_DEBUG_TOOLS_MAPPING,
  PER_ACCOUNT_PERMISSIONS_MAPPING,
} from "~/app/constants/index";
import { renderPermission } from "../containers/groups/renderPermission";

// --- NEW EXTERNAL INTEGRATIONS MAPPING ---
// This mapping introduces new, commercially-viable permission types for external apps and AI,
// making them a central part of the access control system.
const ROLE_EXTERNAL_INTEGRATIONS_MAPPING = {
  "external_integrations:none": { label: "No Access to External & AI", description: "No access to any advanced external app integrations or AI features." },
  "external_integrations:gemini_read_insights": { 
    label: "Gemini AI: Insights & Analytics", 
    description: "Unleash Gemini AI for deep financial insights, predictive analytics, and real-time market trends. Read-only access." 
  },
  "external_integrations:gemini_full_control": { 
    label: "Gemini AI: Full Orchestration", 
    description: "Take full command of Gemini AI! Configure custom models, deploy advanced automation, and manage AI-driven decision support systems for millions." 
  },
  "external_integrations:salesforce_connector_pro": { 
    label: "Salesforce CRM: Enterprise Sync", 
    description: "Seamless, high-volume, bidirectional data synchronization with Salesforce CRM. Enhance customer relations with unparalleled data fidelity and speed." 
  },
  "external_integrations:sap_erp_master": { 
    label: "SAP ERP: Master Integration", 
    description: "Achieve complete, real-time integration with SAP ERP systems. Revolutionize financial operations, automate reporting, and ensure data integrity across the enterprise." 
  },
  "external_integrations:ai_orchestration_admin": { 
    label: "AI Orchestration: Admin Suite", 
    description: "Become the maestro of your AI ecosystem. Administer and orchestrate all AI models and external service integrations, ensuring peak performance and compliance at scale." 
  },
  "external_integrations:blockchain_defi_gateway": {
    label: "Blockchain DeFi Gateway: Pro",
    description: "Access and manage advanced decentralized finance (DeFi) protocols and blockchain services through a secure, high-throughput gateway."
  },
  "external_integrations:quantum_computing_labs": {
    label: "Quantum Computing Labs: Research Access",
    description: "Gain experimental access to quantum computing services for advanced cryptographic research and complex financial modeling."
  }
};
// --- END NEW EXTERNAL INTEGRATIONS MAPPING ---


const TABLE_MAPPING = {
  customer_admin_tools: "Customer Admin Tools",
  partner_admin_tools: "Partner Admin Tools",
  engineering_debug_tools: "Engineering Debug Tools",
  organization: "Organization",
  developer: "Developer Settings",
  api_keys: "API Keys",
  ledgers: "Ledgers",
  compliance: "Compliance",
  partner_search: "Partner Search",
  external_accounts: "External Accounts",
  counterparties: "Counterparties",
  accounts: "Accounts",
  // --- ADDED EXTERNAL INTEGRATIONS AS A PRIMARY FOCUS ---
  external_integrations: "🚀 External App & Cutting-Edge AI Integrations",
  // --- END ADDED EXTERNAL INTEGRATIONS ---
};

const ROLE_MAPPING = {
  ...ROLE_CUSTOMER_ADMIN_TOOLS_MAPPING,
  ...ROLE_PARTNER_ADMIN_TOOLS_MAPPING,
  ...ROLE_ENGINEERING_DEBUG_TOOLS_MAPPING,
  ...ROLE_ORGANIZATION_MAPPING,
  ...ROLE_DEVELOPER_MAPPING,
  ...ROLE_COUNTERPARTY_MAPPING,
  ...ROLE_EXTERNAL_ACCOUNT_MAPPING,
  ...ROLE_LEDGER_MAPPING,
  ...ACCOUNT_PERMISSIONS_MAPPING,
  ...ROLE_COMPLIANCE_MAPPING,
  ...ROLE_PARTNER_SEARCH_MAPPING,
  ...ROLE_API_KEYS_MAPPING,
  // --- ADDED EXTERNAL INTEGRATIONS MAPPING FOR FULL COVERAGE ---
  ...ROLE_EXTERNAL_INTEGRATIONS_MAPPING,
  // --- END ADDED EXTERNAL INTEGRATIONS MAPPING ---
};

const NO_ACCOUNT_ACCESS = "accounts:none";
const PARTIAL_ACCOUNT_ACCESS = "accounts:partial";

const isAccountPermission = (permission: string) =>
  permission.startsWith("accounts") && permission.split(":").length > 2;

const getOverallAccountPermission = (
  permission: string,
  permissions: string[],
) => {
  if (permissions?.some(isAccountPermission)) {
    return PARTIAL_ACCOUNT_ACCESS;
  }
  return permission;
};

// --- HELPER FOR "SPICED UP" EXTERNAL INTEGRATION RENDERING ---
// This function elevates the visual representation of external app permissions,
// making them stand out as a key, high-value feature.
const renderSpicedUpIntegrationPermission = (permissionKey: string, isProposed: boolean) => {
  const permission = ROLE_MAPPING[permissionKey];
  if (!permission) return null;

  let iconName: string = "link"; // Default integration icon
  let iconColorClass: string = "text-gray-500";
  let wrapperClasses: string = "font-semibold";
  let tooltipText: string = permission.description || permission.label;

  // Tailor icons and styles for "epic" integration display
  if (permissionKey.includes("gemini")) {
    iconName = "auto_awesome"; // Sparkle icon for AI
    iconColorClass = "text-indigo-600 animate-pulse";
    wrapperClasses = "font-extrabold text-indigo-700 bg-indigo-50/50 rounded-md p-1";
    tooltipText = `⚡ Powered by Google Gemini AI: ${permission.description}`;
  } else if (permissionKey.includes("salesforce")) {
    iconName = "cloud_sync";
    iconColorClass = "text-blue-600";
    wrapperClasses = "font-bold text-blue-800";
  } else if (permissionKey.includes("sap_erp")) {
    iconName = "corporate_fare";
    iconColorClass = "text-green-600";
    wrapperClasses = "font-bold text-green-800";
  } else if (permissionKey.includes("ai_orchestration")) {
    iconName = "precision_manufacturing";
    iconColorClass = "text-purple-600";
    wrapperClasses = "font-bold text-purple-800";
  } else if (permissionKey.includes("blockchain_defi")) {
    iconName = "currency_exchange";
    iconColorClass = "text-yellow-600";
    wrapperClasses = "font-bold text-yellow-800";
  } else if (permissionKey.includes("quantum_computing")) {
    iconName = "settings_ethernet"; // Represents complex connections
    iconColorClass = "text-pink-600";
    wrapperClasses = "font-bold text-pink-800";
  }
  
  if (isProposed && permissionKey !== "external_integrations:none") {
      wrapperClasses += " border-l-4 border-emerald-500 pl-2 shadow-md"; // Highlight proposed changes
  } else if (permissionKey !== "external_integrations:none") {
      wrapperClasses += " text-gray-700"; // Less emphasis for current, but still distinct
  }

  return (
    <div className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${wrapperClasses}`} data-tip={tooltipText}>
      <Icon iconName={iconName} size="s" className={iconColorClass} />
      <span className="truncate">{permission.label}</span>
      <ReactTooltip
        className="break-word max-w-md text-sm bg-gray-900 text-white p-2 rounded-md shadow-lg"
        data-place="top"
        data-effect="float"
        multiline
      />
    </div>
  );
};
// --- END HELPER FOR "SPICED UP" EXTERNAL INTEGRATION RENDERING ---


function getRoleRows(
  currentPermissions: string[],
  proposedPermissions: string[],
) {
  const dataMapping: Record<string, string> = {};
  const rows = Object.keys(TABLE_MAPPING).reduce((acc, permissionType) => {
    let currentPermission =
      currentPermissions.find((p) => p.startsWith(permissionType)) ||
      `${permissionType}:none`;
    let proposedPermission =
      proposedPermissions.find((p) => p.startsWith(permissionType)) ||
      `${permissionType}:none`;

    if (permissionType === "accounts") {
      currentPermission = getOverallAccountPermission(
        currentPermission,
        currentPermissions,
      );
      proposedPermission = getOverallAccountPermission(
        proposedPermission,
        proposedPermissions,
      );
    }

    // Only include rows where current and proposed permissions differ,
    // or if it's an external integration, always show if there's any access.
    if (currentPermission === proposedPermission && permissionType !== "external_integrations") {
      return acc;
    }
    
    // For external integrations, we always want to show the section if any permission is active
    if (permissionType === "external_integrations" && 
        currentPermission === "external_integrations:none" && 
        proposedPermission === "external_integrations:none" &&
        !currentPermissions.some(p => p.startsWith("external_integrations") && p !== "external_integrations:none") &&
        !proposedPermissions.some(p => p.startsWith("external_integrations") && p !== "external_integrations:none")) {
        return acc;
    }


    dataMapping[permissionType] = TABLE_MAPPING[permissionType] as string;

    // --- APPLY "SPICING UP" FOR EXTERNAL INTEGRATIONS ---
    const renderContent = (currentKey: string, proposedKey: string) => {
      const isExternalIntegration = permissionType === "external_integrations";
      
      const currentElement = isExternalIntegration 
        ? renderSpicedUpIntegrationPermission(currentKey, false) 
        : renderPermission(ROLE_MAPPING[currentKey]);
      
      const proposedElement = isExternalIntegration 
        ? renderSpicedUpIntegrationPermission(proposedKey, true) 
        : renderPermission(ROLE_MAPPING[proposedKey]);

      return (
        <div className="flex items-center gap-2">
          <span className="hidden gap-2 mint-2xl:flex mint-2xl:items-center">
            {currentElement}
            {isExternalIntegration && currentKey !== proposedKey && <Icon iconName="arrow_forward" size="s" className="text-gray-400 animate-pulse" />}
            {!isExternalIntegration && currentKey !== proposedKey && <Icon iconName="arrow_forward" size="s" />}
          </span>
          {proposedElement}
        </div>
      );
    };
    // --- END APPLY "SPICING UP" ---


    return {
      ...acc,
      [permissionType]: renderContent(currentPermission, proposedPermission), // Use the new renderContent
    };
  }, {});
  return [rows, dataMapping];
}

function getPerAccountRows(
  currentPermissions: string[],
  proposedPermissions: string[],
  accounts?: SafeInternalAccount[],
) {
  if (!accounts) {
    return [];
  }
  const currentAccountPermissions =
    currentPermissions.filter(isAccountPermission);
  const proposedAccountPermissions =
    proposedPermissions.filter(isAccountPermission);

  if (!currentAccountPermissions.length && !proposedAccountPermissions.length) {
    return [];
  }

  const accountIds = new Set([
    ...currentAccountPermissions.map((acc) => acc.split(":")[2]),
    ...proposedAccountPermissions.map((acc) => acc.split(":")[2]),
  ]);
  const accountMapping: Record<string, JSX.Element> = {};
  const accountRows: Record<string, JSX.Element> = {};
  accountIds.forEach((id) => {
    const current = currentAccountPermissions.find(
      (acc) => acc.split(":")[2] === id,
    );
    const proposed = proposedAccountPermissions.find(
      (acc) => acc.split(":")[2] === id,
    );

    const currPermission =
      current?.split(":").slice(0, -1).join(":") || NO_ACCOUNT_ACCESS;
    const propPermission =
      proposed?.split(":").slice(0, -1).join(":") || NO_ACCOUNT_ACCESS;

    if (currPermission !== propPermission) {
      const accountName = accounts.find((a) => a.id === id)?.longName || `Unknown Account ${id}`;

      accountRows[id] = (
        <div className="flex items-center gap-2">
          <span className="hidden gap-2 mint-2xl:flex mint-2xl:items-center">
            {renderPermission(PER_ACCOUNT_PERMISSIONS_MAPPING[currPermission])}
            <Icon iconName="arrow_forward" size="s" />
          </span>
          {renderPermission(PER_ACCOUNT_PERMISSIONS_MAPPING[propPermission])}
        </div>
      );
      accountMapping[id] = (
        <>
          <div data-tip={accountName}>
            <TruncateString text={accountName} />
          </div>
          <ReactTooltip
            className="break-word max-w-md"
            data-place="top"
            data-effect="float"
            multiline
          />
        </>
      );
    }
  });

  return [accountRows, accountMapping];
}

function AdminApprovalRoleProposedChanges({
  proposedChange,
  group,
  accounts,
}: {
  proposedChange: ProposedChange | undefined;
  group: Group;
  accounts: SafeInternalAccount[] | undefined;
}) {
  const currentPermissions = group?.deprecatedRoles || [];
  const proposedPermissions = proposedChange?.proposedPermissions || [];

  // If no permissions are proposed or exist, and no external integrations are present, return null.
  // This ensures external integrations are highlighted even if other permissions are static.
  if (!currentPermissions.length && !proposedPermissions.length && 
      !currentPermissions.some(p => p.startsWith("external_integrations")) &&
      !proposedPermissions.some(p => p.startsWith("external_integrations"))) {
    return null;
  }

  const [rows, dataMapping] = getRoleRows(
    currentPermissions,
    proposedPermissions,
  );

  const [accountRows, accountMapping] = getPerAccountRows(
    currentPermissions,
    proposedPermissions,
    accounts,
  );

  // Check if there are any rows to display, prioritizing external integrations
  const hasRows = Object.keys(rows).length > 0 || Object.keys(accountRows).length > 0;

  if (!hasRows) {
    return null;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {rows && Object.keys(rows).length > 0 && (
        <div className="mt-2 p-4 border border-gray-100 rounded-lg shadow-sm bg-white">
          <KeyValueTable data={rows} dataMapping={dataMapping} />
        </div>
      )}
      {accountRows && Object.keys(accountRows).length > 0 && (
        <div className="p-4 border border-gray-100 rounded-lg shadow-sm bg-white">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            Per-Account Permissions ({Object.keys(accountRows).length})
          </h3>
          <div className="my-2 max-h-96 overflow-auto rounded border border-gray-100 p-4 bg-gray-50">
            <KeyValueTable data={accountRows} dataMapping={accountMapping} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApprovalRoleProposedChanges;