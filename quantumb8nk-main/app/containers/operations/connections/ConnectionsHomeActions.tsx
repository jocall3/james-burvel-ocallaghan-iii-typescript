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

function ConnectionsHomeActions() {
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
            history.push(`/operations/connections/new`);
          }}
        >
          <div id="create-connection">Create Connection</div>
        </ActionItem>

        <ActionItem
          onClick={() => {
            history.push(`/operations/connections/import`);
          }}
        >
          <div id="import-connection">Import Connection</div>
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}

export default ConnectionsHomeActions;
