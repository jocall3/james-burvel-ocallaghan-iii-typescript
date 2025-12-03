// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  ACCOUNT_PERMISSIONS_OPTIONS,
  PER_ACCOUNT_PERMISSIONS_MAPPING,
} from "../../constants/index";
import { SelectField, Tooltip } from "../../../common/ui-components";

export default function AccountPermissionsTable({
  internalAccounts,
  roles,
  onAccountRoleSelect,
  canEditGroup,
}) {
  const perAccountRoles =
    roles.filter(
      (role) => role.startsWith("accounts:") && role.split(":").length > 2,
    ) || [];
  const accountsSelectorFallback =
    perAccountRoles.length > 0 ? "accounts:partial" : "accounts:none";
  const accountsRole = roles.find(
    (role) => role.startsWith("accounts:") && role.split(":").length === 2,
  );
  const renderAccountsPermissions =
    perAccountRoles.length > 0 || accountsRole === "accounts:partial";

  function renderAccountPermissionSelect(account) {
    const id = `account-id-${account.id}`;
    const accountRole = perAccountRoles.find((role) =>
      role.includes(account.id),
    );
    const accountOptions = Object.entries(PER_ACCOUNT_PERMISSIONS_MAPPING).map(
      ([value, label]) => ({ value: `${value}:${account.id}`, label }),
    );

    return (
      <div key={id} className="index-table-row no-border">
        <div className="table-entry text-with-dropdown-line-height indented-table-entry">
          <div>{account.longName}</div>
        </div>
        <div className="table-entry table-entry-allow-overflow">
          <SelectField
            options={accountOptions}
            handleChange={(key, field) => onAccountRoleSelect(field.value)}
            selectValue={accountRole || `accounts:none:${account.id}`}
            placeholder="Select Account Permissions"
            name={`account-${account.id}-permission-select`}
            disabled={!canEditGroup}
          />
        </div>
      </div>
    );
  }

  function renderDataRows() {
    return internalAccounts.map(renderAccountPermissionSelect);
  }

  return (
    <>
      <div className="index-table-row">
        <div className="table-entry text-with-dropdown-line-height">
          <span>Accounts</span>
          <Tooltip
            className="tooltip-holder"
            data-tip="View and edit payment orders, transactions, expected payments, returns, and paper items."
          />
        </div>
        <div className="table-entry table-entry-allow-overflow">
          <SelectField
            options={ACCOUNT_PERMISSIONS_OPTIONS}
            handleChange={(key, field) => onAccountRoleSelect(field.value)}
            selectValue={accountsRole || accountsSelectorFallback}
            placeholder="Accounts Permissions"
            name="accounts-permission-select"
            disabled={!canEditGroup}
            required
          />
        </div>
      </div>
      {renderAccountsPermissions ? renderDataRows() : null}
    </>
  );
}
