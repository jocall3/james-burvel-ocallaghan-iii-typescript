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

interface AccountCapabilityActionsProps {
  id: string;
  setDeleteModal: (open: boolean) => void;
}

export default function AccountCapabilityActions({
  id,
  setDeleteModal,
}: AccountCapabilityActionsProps) {
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
            history.push(`/operations/capabilities/${id}/edit`);
          }}
        >
          <div id="edit">Edit</div>
        </ActionItem>
        <ActionItem
          type="danger"
          onClick={() => {
            setDeleteModal(true);
          }}
        >
          <div id="delete">Delete</div>
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}
