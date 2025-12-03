// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useActiveComplianceQuery } from "~/generated/dashboard/graphqlSchema";
import PermissionSelector from "./PermissionSelector";
import {
  ROLE_ORGANIZATION_OPTIONS,
  ROLE_COUNTERPARTY_OPTIONS,
  ROLE_DEVELOPER_OPTIONS,
  ROLE_LEDGER_OPTIONS,
  ROLE_EXTERNAL_ACCOUNT_OPTIONS,
  ROLE_COMPLIANCE_OPTIONS,
  ROLE_PARTNER_SEARCH_OPTIONS,
  ROLE_API_KEY_OPTIONS,
} from "../../constants/index";

type GlobalPermissionsTableProps = {
  roles: string[];
  onRoleSelect: (prefix: string, value: string) => void;
  canEditGroup: boolean;
};

export default function GlobalPermissionsTable({
  roles,
  onRoleSelect,
  canEditGroup,
}: GlobalPermissionsTableProps) {
  const organizationRole = roles.find((r) => r.includes("organization"));
  const developerRole = roles.find((r) => r.includes("developer"));
  const counterpartiesRole = roles.find((r) => r.includes("counterparties"));
  const externalAccountsRole = roles.find((r) =>
    r.includes("external_accounts"),
  );
  const ledgersRole = roles.find((r) => r.includes("ledgers"));
  const complianceRole = roles.find((r) => r.includes("compliance"));
  const partnerSearchRole = roles.find((r) => r.includes("partner_search"));
  const apiKeysRole = roles.find((r) => r.includes("api_keys"));

  const { data: activeComplianceData } = useActiveComplianceQuery();
  const activeCompliance = activeComplianceData?.products.totalCount === 1;

  return (
    <>
      <PermissionSelector
        role={organizationRole || "organization:none"}
        onRoleSelect={(value) => onRoleSelect("organization", value)}
        options={ROLE_ORGANIZATION_OPTIONS}
        title="Organization"
        tooltipHint="View and edit organization-wide settings, users, groups, approval rules, and audit records."
        select={{
          placeholder: "Organization Permissions",
          name: "organization-permission-select",
        }}
        editable={canEditGroup}
      />
      <PermissionSelector
        role={developerRole || "developer:none"}
        onRoleSelect={(value) => onRoleSelect("developer", value)}
        options={ROLE_DEVELOPER_OPTIONS}
        title="Developer Settings"
        tooltipHint="View and edit logs, events, webhook endpoints, and webhook delivery attempts"
        select={{
          placeholder: "Developer Permissions",
          name: "developer-permission-select",
        }}
        editable={canEditGroup}
      />
      <PermissionSelector
        role={apiKeysRole || "api_keys:none"}
        onRoleSelect={(value) => onRoleSelect("api_keys", value)}
        options={ROLE_API_KEY_OPTIONS}
        title="API Keys"
        tooltipHint="Manage, view, and edit API keys. Users also require Developer Settings permissions."
        select={{
          placeholder: "API keys Permissions",
          name: "api-keys-permission-select",
        }}
        editable={canEditGroup}
      />
      <PermissionSelector
        role={ledgersRole || "ledgers:none"}
        onRoleSelect={(value) => onRoleSelect("ledgers", value)}
        options={ROLE_LEDGER_OPTIONS}
        title="Ledgers"
        tooltipHint="View and edit ledgers data."
        select={{
          placeholder: "Ledger Permissions",
          name: "ledgers-permission-select",
        }}
        editable={canEditGroup}
      />
      {activeCompliance && (
        <PermissionSelector
          role={complianceRole || "compliance:none"}
          onRoleSelect={(value) => onRoleSelect("compliance", value)}
          options={ROLE_COMPLIANCE_OPTIONS}
          title="Compliance"
          tooltipHint="Manage, view, and edit compliance data including Cases."
          select={{
            placeholder: "Compliance Permissions",
            name: "compliance-permission-select",
          }}
          editable={canEditGroup}
        />
      )}
      <PermissionSelector
        role={partnerSearchRole || "partner_search:none"}
        onRoleSelect={(value) => onRoleSelect("partner_search", value)}
        options={ROLE_PARTNER_SEARCH_OPTIONS}
        title="Partner Search"
        tooltipHint="Manage, view, and edit partner search data including Partner Searches."
        select={{
          placeholder: "Partner Search Permissions",
          name: "partner-search-permission-select",
        }}
        editable={canEditGroup}
      />
      <PermissionSelector
        role={counterpartiesRole || "counterparties:none"}
        onRoleSelect={(value) => onRoleSelect("counterparties", value)}
        options={ROLE_COUNTERPARTY_OPTIONS}
        title="Counterparties"
        tooltipHint="View and edit counterparty information as well as invitations."
        select={{
          placeholder: "Counterparty Permissions",
          name: "counterparties-permission-select",
        }}
        editable={canEditGroup}
      />
      <PermissionSelector
        role={externalAccountsRole || "external_accounts:none"}
        onRoleSelect={(value) => onRoleSelect("external_accounts", value)}
        options={ROLE_EXTERNAL_ACCOUNT_OPTIONS}
        title="External Accounts"
        tooltipHint="View and edit external accounts. Partial View Only Access displays only the last 4 digits of account numbers."
        select={{
          placeholder: "External Account Permissions",
          name: "external-accounts-permission-select",
        }}
        editable={canEditGroup}
      />
    </>
  );
}
