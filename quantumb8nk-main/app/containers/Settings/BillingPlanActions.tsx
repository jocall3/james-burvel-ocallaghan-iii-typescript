// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";

import {
  ActionItem,
  Icon,
  PopoverPanel,
  PopoverTrigger,
  Popover,
} from "../../../common/ui-components";

interface BillingPlanActionsProps {
  onCancelPlan: () => void;
}

function BillingPlanActions({ onCancelPlan }: BillingPlanActionsProps) {
  return (
    <Popover>
      <PopoverTrigger as="a" className="flex">
        <Icon iconName="more_horizontal" size="s" />
      </PopoverTrigger>
      <PopoverPanel>
        <ActionItem type="danger" onClick={() => onCancelPlan()}>
          Cancel plan...
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}

export default BillingPlanActions;
