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

interface ConnectionActionsProps {
  connectionId: string;
  onViewConfigurationClick: () => void;
}

function ConnectionActions({
  connectionId,
  onViewConfigurationClick,
}: ConnectionActionsProps) {
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
        <ActionItem
          onClick={() => {
            history.push(
              `/operations/connections/${connectionId}/accounts/new`,
            );
          }}
        >
          <div id="create-account">Create Account</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(
              `/operations/connections/${connectionId}/accounts/import`,
            );
          }}
        >
          <div id="import-internal-account">Import Internal Account</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(
              `/operations/connections/${connectionId}/connection_endpoints/new`,
            );
          }}
        >
          <div id="create-connection-endpoint">Create Connection Endpoint</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(
              `/operations/connections/${connectionId}/connection_endpoints/new_v2`,
            );
          }}
        >
          <div id="create-connection-endpoint-v2">
            Create Connection Endpoint V2
          </div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(`/operations/connections/${connectionId}/edit`);
          }}
        >
          <div id="edit-connection">Edit Connection</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(
              `/operations/connections/${connectionId}/custom_processing_windows/new`,
            );
          }}
        >
          <div id="create-custom-procesing-window">
            Create Custom Processing Window
          </div>
        </ActionItem>

        <ActionItem onClick={onViewConfigurationClick}>
          <div id="view-as-json">View as JSON</div>
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}

export default ConnectionActions;
