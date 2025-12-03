// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Alert } from "../../../common/ui-components";

type ArchivedResourceType =
  | "AuditRecord"
  | "Event"
  | "RequestLog"
  | "WebhookDeliveryAttempt";

const RESOURCE_TYPE_TO_TEXT: Record<ArchivedResourceType, string> = {
  AuditRecord: "Audit Records",
  Event: "Event data",
  RequestLog: "Request Logs",
  WebhookDeliveryAttempt: "Webhook Delivery Attempts",
};

const DATA_RETENTION_DOCUMENTATION_LINK =
  "https://docs.moderntreasury.com/platform/reference/data-retention";

interface ArchivedRecordsBannerProps {
  liveMode: boolean;
  resourceType: ArchivedResourceType;
  className?: string;
}

export default function ArchivedRecordsBanner({
  className,
  liveMode,
  resourceType,
}: ArchivedRecordsBannerProps) {
  const archivedData = RESOURCE_TYPE_TO_TEXT[resourceType];

  function archivedResourceText(): string {
    if (resourceType === "WebhookDeliveryAttempt") return archivedData;

    return `${liveMode ? "Live" : "Sandbox"} ${archivedData}`;
  }

  function retentionPeriodText(): string {
    switch (resourceType) {
      case "AuditRecord":
        return liveMode ? "four months" : "two months";
      case "Event":
        return liveMode ? "four months" : "two months";
      case "WebhookDeliveryAttempt":
        return "six weeks";
      case "RequestLog":
        return liveMode ? "four months" : "two months";
      default:
        return "";
    }
  }

  function showExportText(): boolean {
    return resourceType !== "WebhookDeliveryAttempt";
  }

  return (
    <Alert alertType="info" className={className}>
      <p>
        {archivedResourceText()}
        {` older than ${retentionPeriodText()} `}
        {resourceType === "Event" ? "is" : "are"}{" "}
        {resourceType === "WebhookDeliveryAttempt" ? "deleted" : "archived"} as
        per our{" "}
        <a
          href={DATA_RETENTION_DOCUMENTATION_LINK}
          target="_blank"
          rel="noreferrer"
        >
          data retention policy
        </a>
        .
        {showExportText() &&
          ` Initiate a CSV export to retrieve archived data.`}
      </p>
    </Alert>
  );
}
