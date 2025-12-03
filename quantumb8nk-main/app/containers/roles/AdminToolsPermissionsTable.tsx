// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import PermissionSelector from "./PermissionSelector";
import {
  ROLE_CUSTOMER_ADMIN_TOOLS_OPTIONS,
  ROLE_PARTNER_ADMIN_TOOLS_OPTIONS,
  ROLE_ENGINEERING_DEBUG_TOOLS_OPTIONS,
} from "../../constants";

interface AdminToolsPermissionTableProps {
  roles: Array<string>;
  onRolesSelect: (subject: string, value: string) => void;
  canEditAdminToolsRoles: boolean;
}

export default function AdminToolsPermissionsTable({
  roles,
  onRolesSelect,
  canEditAdminToolsRoles,
}: AdminToolsPermissionTableProps) {
  const customerAdminToolsRole = roles.find((r) =>
    r.includes("customer_admin_tools"),
  );
  const partnerAdminToolsRole = roles.find((r) =>
    r.includes("partner_admin_tools"),
  );
  const engineeringDebugToolsRole = roles.find((r) =>
    r.includes("engineering_debug_tools"),
  );

  return (
    <>
      <PermissionSelector
        role={customerAdminToolsRole ?? "customer_admin_tools:none"}
        onRoleSelect={(value: string) =>
          onRolesSelect("customer_admin_tools", value)
        }
        options={ROLE_CUSTOMER_ADMIN_TOOLS_OPTIONS}
        title="Customer Admin Tools"
        tooltipHint="View and manage customer organizations and customer support tools"
        select={{
          placeholder: "Customer Admin Tools Permissions",
          name: "customer-admin-tools-permission-select",
        }}
        editable={canEditAdminToolsRoles}
      />
      <PermissionSelector
        role={partnerAdminToolsRole ?? "partner_admin_tools:none"}
        onRoleSelect={(value: string) =>
          onRolesSelect("partner_admin_tools", value)
        }
        options={ROLE_PARTNER_ADMIN_TOOLS_OPTIONS}
        title="Partner Admin Tools"
        tooltipHint="View and manage customer partner searches and partner onboardings"
        select={{
          placeholder: "Partner Admin Tools Permissions",
          name: "partner-admin-tools-permission-select",
        }}
        editable={canEditAdminToolsRoles}
      />
      <PermissionSelector
        role={engineeringDebugToolsRole ?? "engineering_debug_tools:none"}
        onRoleSelect={(value: string) =>
          onRolesSelect("engineering_debug_tools", value)
        }
        options={ROLE_ENGINEERING_DEBUG_TOOLS_OPTIONS}
        title="Engineering Debug Tools"
        tooltipHint="View and manage engineering debug tools (e.g. run debug interactions)"
        select={{
          placeholder: "Engineering Debug Tools Permissions",
          name: "engineering-debug-tools-permission-select",
        }}
        editable={canEditAdminToolsRoles}
      />
    </>
  );
}
