// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  ConnectionBulkImport__StatusEnum,
  useOperationsConnectionBulkImportViewQuery,
  useConnectionBulkImportDetailsTableQuery,
} from "~/generated/dashboard/graphqlSchema";
import { CONNECTION_BULK_IMPORT } from "~/generated/dashboard/types/resources";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import sectionWithNavigator from "../../sectionWithNavigator";
import {
  Layout,
  SectionNavigator,
  PageHeader,
  BadgeType,
  Badge,
  Button,
} from "../../../../common/ui-components";
import DetailsTable from "../../../components/DetailsTable";
import ConnectionBulkImportEntitiesTable from "./ConnectionBulkImportEntitiesTable";

const AUDIT_RECORD_ENTITY_TYPE = "ConnectionBulkImport";

const SECTIONS = {
  records: "Records",
  auditTrail: "Audit Trail",
};

function statusBadge(
  status: ConnectionBulkImport__StatusEnum | undefined | null,
) {
  let badgeType: BadgeType;
  if (status === ConnectionBulkImport__StatusEnum.Completed) {
    badgeType = BadgeType.Success;
  } else if (status === ConnectionBulkImport__StatusEnum.Failed) {
    badgeType = BadgeType.Default;
  } else {
    badgeType = BadgeType.Cool;
  }

  return <Badge text={(status as string)?.toUpperCase()} type={badgeType} />;
}

interface ConnectionBulkImportViewProps {
  match: {
    params: {
      connectionBulkImportId: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
}

function ConnectionBulkImportView({
  match: {
    params: { connectionBulkImportId },
  },
  currentSection,
  setCurrentSection,
}: ConnectionBulkImportViewProps) {
  const { data, loading } = useOperationsConnectionBulkImportViewQuery({
    variables: {
      id: connectionBulkImportId,
    },
  });

  let content;
  switch (currentSection) {
    case "records":
      content = (
        <ConnectionBulkImportEntitiesTable
          connectionBulkImportId={connectionBulkImportId}
        />
      );
      break;
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{
            entityId: connectionBulkImportId,
            entityType: AUDIT_RECORD_ENTITY_TYPE,
            includeAdminActions: true,
          }}
          hideHeadline
          hideLinks
        />
      );
      break;
    default:
      break;
  }

  const connectionBulkImport = data?.connectionBulkImport;
  const title = connectionBulkImport?.filename || connectionBulkImportId;
  const status = statusBadge(connectionBulkImport?.status);

  const downloadPath = connectionBulkImport?.downloadPath;
  const downloadButton = downloadPath && (
    <Button buttonType="primary" onClick={() => window.open(downloadPath)}>
      Download
    </Button>
  );

  return (
    <PageHeader
      title={title}
      loading={loading}
      left={status}
      right={downloadButton}
    >
      <Layout
        ratio="1/3"
        primaryContent={
          <DetailsTable
            graphqlQuery={useConnectionBulkImportDetailsTableQuery}
            id={connectionBulkImportId}
            resource={CONNECTION_BULK_IMPORT}
          />
        }
        secondaryContent={
          <div className="mt-4">
            <SectionNavigator
              sections={SECTIONS}
              currentSection={currentSection}
              onClick={(section: string) => setCurrentSection(section)}
            />
            {content}
          </div>
        }
      />
    </PageHeader>
  );
}

export default sectionWithNavigator(ConnectionBulkImportView, "records");
