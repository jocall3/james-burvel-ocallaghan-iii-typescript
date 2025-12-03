// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import moment from "moment";
import { useOperationsConnectionVendorConfigCutoffTableQuery } from "~/generated/dashboard/graphqlSchema";
import {
  Alert,
  IndexTable,
  IndexTableSkeletonLoader,
  Tag,
} from "../../../../common/ui-components";

const CUTOFF_DATA_MAPPING = {
  cutoffTime: "Cutoff Time",
  cutoffType: "Cutoff Type",
};

const CRON_DATA_MAPPING = {
  cron: "Cron",
  cutoffType: "Cutoff Type",
};

type ScheduleCutoff = {
  cutoffTime: string;
  cutoffType: CutoffType;
};

export enum CutoffType {
  VENDOR_CONFIG = "Vendor Config Default",
  CUSTOM_PROCESSING_WINDOW = "Custom Processing Window",
  PENDING_CREATION = "PENDING CREATION",
  PENDING_DELETION = "PENDING DELETION",
  PENDING_UPDATE = "PENDING UPDATE",
}

function rowHighlightFunction({ cutoffType }: ScheduleCutoff): boolean {
  return [
    CutoffType.PENDING_CREATION,
    CutoffType.PENDING_DELETION,
    CutoffType.PENDING_UPDATE,
  ].includes(cutoffType);
}

interface ConnectionVendorConfigCutoffTableProps {
  connectionId: string;
  vendorConfigId: string;
  customProcessingWindow?: {
    id?: string;
    cutoffTime?: string;
    cutoffType: CutoffType;
  };
}

function ConnectionVendorConfigCutoffTable({
  connectionId,
  vendorConfigId,
  customProcessingWindow,
}: ConnectionVendorConfigCutoffTableProps) {
  const { data, loading } = useOperationsConnectionVendorConfigCutoffTableQuery(
    {
      variables: { connectionId, vendorConfigId },
    },
  );

  const vendorConfig = data?.vendorConfig;

  let content;

  if (loading) {
    content = (
      <>
        <IndexTableSkeletonLoader
          headers={Object.keys(CUTOFF_DATA_MAPPING)}
          numRows={5}
        />

        <IndexTableSkeletonLoader
          headers={Object.keys(CRON_DATA_MAPPING)}
          numRows={1}
        />
      </>
    );
  } else if (!vendorConfig) {
    content = (
      <Alert alertType="danger">
        Unable to load schedule preview for vendor config with id:{" "}
        {vendorConfigId}.
        <br />
        Please ensure this is a valid vendor config id.
      </Alert>
    );
  } else {
    const scheduleCutoffs: ScheduleCutoff[] = [];

    vendorConfig.cutoffTimes.forEach((cutoffTime) => {
      scheduleCutoffs.push({
        cutoffTime,
        cutoffType: CutoffType.VENDOR_CONFIG,
      });
    });

    data.customProcessingWindows.edges.forEach(({ node }) => {
      if (node.id !== customProcessingWindow?.id) {
        scheduleCutoffs.push({
          cutoffTime: node.cutoffTime,
          cutoffType: CutoffType.CUSTOM_PROCESSING_WINDOW,
        });
      }
    });

    if (customProcessingWindow?.cutoffTime) {
      scheduleCutoffs.push({
        cutoffTime: customProcessingWindow.cutoffTime,
        cutoffType: customProcessingWindow.cutoffType,
      });
    }

    scheduleCutoffs.sort((a, b) => {
      const timeA = moment(a.cutoffTime, "hh:mm");
      const timeB = moment(b.cutoffTime, "hh:mm");

      return moment(timeA).diff(timeB);
    });

    const cronData = vendorConfig.crons.map((cron) => ({
      cron,
      cutoffType: CutoffType.VENDOR_CONFIG,
    }));

    content = (
      <>
        <div className="flex flex-col gap-2 text-xs font-bold text-text-muted">
          <div>Description: {vendorConfig.description ?? "N/A"}</div>
          <div>Time Zone: {vendorConfig.timeZone}</div>
          <div>Vendor Cutoff: {vendorConfig.lastCutoff}</div>
        </div>

        <IndexTable
          dataMapping={CUTOFF_DATA_MAPPING}
          data={scheduleCutoffs}
          rowHighlightFunction={rowHighlightFunction}
        />

        <IndexTable dataMapping={CRON_DATA_MAPPING} data={cronData} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Tag color="blue" size="large">
        {vendorConfigId}
      </Tag>
      {content}
    </div>
  );
}

export default ConnectionVendorConfigCutoffTable;
