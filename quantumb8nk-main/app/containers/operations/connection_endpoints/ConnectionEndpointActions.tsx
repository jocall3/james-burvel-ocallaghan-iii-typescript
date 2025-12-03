// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useHistory } from "react-router";
import {
  PopoverTrigger,
  Popover,
  Icon,
  PopoverPanel,
  ActionItem,
} from "~/common/ui-components";
import { OperationsConnectionEndpointViewQuery } from "~/generated/dashboard/graphqlSchema";

interface ConnectionEndpointActionsProps {
  connectionEndpoint: OperationsConnectionEndpointViewQuery["connectionEndpoint"];
  openPromoteModal: () => void;
}

export default function ConnectionEndpointActions({
  connectionEndpoint,
  openPromoteModal,
}: ConnectionEndpointActionsProps) {
  const history = useHistory();
  if (!connectionEndpoint) return null;

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
              `/operations/connection_endpoints/${connectionEndpoint.id}/edit`,
            );
          }}
        >
          <div id="edit">Edit</div>
        </ActionItem>
        <ActionItem
          disabled={!connectionEndpoint.canPromote}
          onClick={openPromoteModal}
        >
          <div id="promote">Promote</div>
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}
