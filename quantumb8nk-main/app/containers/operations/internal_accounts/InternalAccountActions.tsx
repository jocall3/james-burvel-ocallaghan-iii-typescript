// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useHistory } from "react-router-dom";
import {
  ActionItem,
  Icon,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from "~/common/ui-components";

interface InternalAccountActionsProps {
  internalAccountId: string;
  path: string;
  onViewConfigurationClick: () => void;
  onDeactivateAccountClick: () => void;
}

function InternalAccountActions({
  internalAccountId,
  path,
  onViewConfigurationClick,
  onDeactivateAccountClick,
}: InternalAccountActionsProps) {
  const history = useHistory();

  return (
    <Popover>
      <PopoverTrigger buttonType="primary">
        Actions
        <Icon
          className="text-white"
          iconName="chevron_down"
          size="s"
          color="currentColor"
        />
      </PopoverTrigger>

      <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
        <ActionItem onClick={() => history.push(path)}>
          <div id="edit">View in App</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(
              `/operations/internal_accounts/${internalAccountId}/edit`,
            );
          }}
        >
          <div id="edit">Edit</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(
              `/operations/internal_accounts/${internalAccountId}/account_ach_settings/new`,
            );
          }}
        >
          <div id="add-ach-setting">Add ACH Setting</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(
              `/operations/internal_accounts/${internalAccountId}/capabilities/new`,
            );
          }}
        >
          <div id="create">Add Capability</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(
              `/operations/internal_accounts/${internalAccountId}/virtual_account_settings/new`,
            );
          }}
        >
          <div id="add-virtual-account-setting">
            Add Virtual Account Setting
          </div>
        </ActionItem>

        <ActionItem onClick={onViewConfigurationClick}>
          <div id="view-as-json">View as JSON</div>
        </ActionItem>

        <ActionItem onClick={onDeactivateAccountClick}>
          <div id="deactivate-account">Deactivate Account</div>
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}

export default InternalAccountActions;
