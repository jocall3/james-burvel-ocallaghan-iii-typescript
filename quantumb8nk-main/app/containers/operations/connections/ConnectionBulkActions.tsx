// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import AccountCapabilityBulkUploadActionItem, {
  ACCOUNT_CAPABILITY_CSV_HEADERS,
} from "~/app/components/AccountCapabilityBulkUploadActionItem";
import AccountACHSettingBulkUploadActionItem, {
  ACCOUNT_ACH_SETTING_CSV_HEADERS,
} from "~/app/components/AccountACHSettingBulkUploadActionItem";
import InternalAccountBulkUploadActionItem, {
  INTERNAL_ACCOUNT_CSV_HEADERS,
} from "~/app/components/InternalAccountBulkUploadActionItem";

import { downloadCsvTemplate } from "~/app/utilities/downloadCsvTemplate";
import {
  ActionItem,
  Icon,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from "~/common/ui-components";

interface ConnectionBulkActionsProps {
  connectionId: string;
}

function ConnectionBulkActions({ connectionId }: ConnectionBulkActionsProps) {
  return (
    <Popover>
      <PopoverTrigger buttonType="secondary">
        Bulk Actions
        <Icon iconName="chevron_down" size="s" />
      </PopoverTrigger>

      <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
        <InternalAccountBulkUploadActionItem connectionId={connectionId} />
        <ActionItem
          onClick={() => downloadCsvTemplate(INTERNAL_ACCOUNT_CSV_HEADERS)}
        >
          Download Account Template CSV
        </ActionItem>

        <AccountCapabilityBulkUploadActionItem connectionId={connectionId} />

        <ActionItem
          onClick={() => downloadCsvTemplate(ACCOUNT_CAPABILITY_CSV_HEADERS)}
        >
          Download Capability Template CSV
        </ActionItem>

        <AccountACHSettingBulkUploadActionItem connectionId={connectionId} />

        <ActionItem
          onClick={() => downloadCsvTemplate(ACCOUNT_ACH_SETTING_CSV_HEADERS)}
        >
          Download Account ACH Setting Template CSV
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}

export default ConnectionBulkActions;
