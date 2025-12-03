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

interface CustomProcessingWindowActionsProps {
  customProcessingWindowId: string;
  setDeleteModal: (open: boolean) => void;
}

function CustomProcessingWindowActions({
  customProcessingWindowId,
  setDeleteModal,
}: CustomProcessingWindowActionsProps) {
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
              `/operations/custom_processing_windows/${customProcessingWindowId}/edit`,
            );
          }}
        >
          <div id="edit">Edit</div>
        </ActionItem>
        <ActionItem type="danger" onClick={() => setDeleteModal(true)}>
          <div id="delete">Delete</div>
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}

export default CustomProcessingWindowActions;
