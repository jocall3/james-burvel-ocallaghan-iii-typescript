// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  PopoverTrigger,
  Popover,
  Icon,
  PopoverPanel,
  ActionItem,
} from "~/common/ui-components";

interface ACHSettingsActionsProps {
  openDeleteModal: () => void;
}

export default function ACHSettingActions({
  openDeleteModal,
}: ACHSettingsActionsProps) {
  return (
    <Popover>
      <PopoverTrigger buttonType="primary">
        Actions
        <Icon
          className="text-white"
          color="currentColor"
          iconName="chevron_down"
          size="s"
        />
      </PopoverTrigger>
      <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
        <ActionItem type="danger" onClick={openDeleteModal}>
          <div id="delete">Delete</div>
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}
