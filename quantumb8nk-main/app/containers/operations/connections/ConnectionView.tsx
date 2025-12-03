// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import {
  useOperationsConnectionViewQuery,
  useConnectionDetailsTableQuery,
  ConnectionBulkImportsForConnectionDocument,
  OperationsCustomProcessingWindowsForConnectionDocument,
  OperationsConnectionEndpointsForConnectionDocument,
  OperationsVendorSubscriptionsForConnectionDocument,
} from "~/generated/dashboard/graphqlSchema";
import {
  CONNECTION,
  CONNECTION_BULK_IMPORT,
  CONNECTION_ENDPOINT,
  CUSTOM_PROCESSING_WINDOW,
  VENDOR_SUBSCRIPTION,
} from "~/generated/dashboard/types/resources";
import ListView from "~/app/components/ListView";
import {
  getCustomProcessingWindowSearchComponents,
  mapCustomProcessingWindowQueryToVariables,
} from "~/common/search_components/customProcessingWindowSearchComponents";
import {
  getConnectionEndpointSearchComponents,
  mapConnectionEndpointQueryToVariables,
} from "~/common/search_components/connectionEndpointSearchComponents";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import {
  getVendorSubscriptionSearchComponents,
  mapVendorSubscriptionQueryToVariables,
} from "~/common/search_components/vendorSubscriptionSearchComponents";
import sectionWithNavigator from "../../sectionWithNavigator";
import {
  Layout,
  SectionNavigator,
  PageHeader,
} from "../../../../common/ui-components";
import DetailsTable from "../../../components/DetailsTable";
import {
  getConnectionBulkImportSearchComponents,
  mapConnectionBulkImportQueryToVariables,
} from "../../../../common/search_components/connectionBulkImportSearchComponents";
import ConnectionActions from "./ConnectionActions";
import ConnectionConfigurationViewModal from "./ConnectionConfigurationViewModal";
import InternalAccountsTable from "../internal_accounts/InternalAccountsTable";
import ConnectionBulkActions from "./ConnectionBulkActions";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";

const AUDIT_RECORD_ENTITY_TYPE = "Connection";

const SECTIONS = {
  connectionEndpoints: "Connection Endpoints",
  vendorSubscriptions: "Vendor Subscriptions",
  internalAccounts: "Internal Accounts",
  customProcessingWindows: "Custom Processing Windows",
  bulkImports: "Bulk Imports",
  auditTrail: "Audit Trail",
};

interface ConnectionViewProps {
  match: {
    params: {
      connectionId: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
}

function ConnectionView({
  match: {
    params: { connectionId },
  },
  currentSection,
  setCurrentSection,
}: ConnectionViewProps) {
  const { data, loading } = useOperationsConnectionViewQuery({
    variables: {
      id: connectionId,
    },
  });

  const [showConfigurationModal, setShowConfigurationModal] = useState(false);

  let content;
  let pageHeaderProps: PageHeaderProps = {
    title: "View Connection",
    loading,
  };

  switch (currentSection) {
    case "vendorSubscriptions": {
      const searchComponents = getVendorSubscriptionSearchComponents({});

      content = (
        <ListView
          customizableColumns={false}
          disableMetadata
          initialShowSearchArea={false}
          graphqlDocument={OperationsVendorSubscriptionsForConnectionDocument}
          resource={VENDOR_SUBSCRIPTION}
          constantQueryVariables={{ connectionId }}
          displayColumnIdsToFilter={["id"]}
          mapQueryToVariables={mapVendorSubscriptionQueryToVariables}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
        />
      );
      break;
    }
    case "internalAccounts":
      content = <InternalAccountsTable connectionId={connectionId} />;
      break;
    case "connectionEndpoints": {
      const searchComponents = getConnectionEndpointSearchComponents({
        includeConnectionSearch: !connectionId,
      });

      content = (
        <ListView
          customizableColumns={false}
          disableMetadata
          initialShowSearchArea={false}
          graphqlDocument={OperationsConnectionEndpointsForConnectionDocument}
          resource={CONNECTION_ENDPOINT}
          constantQueryVariables={{ connectionId }}
          mapQueryToVariables={mapConnectionEndpointQueryToVariables}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
        />
      );
      break;
    }
    case "bulkImports": {
      const searchComponents = getConnectionBulkImportSearchComponents();

      content = (
        <ListView
          customizableColumns={false}
          disableMetadata
          initialShowSearchArea={false}
          graphqlDocument={ConnectionBulkImportsForConnectionDocument}
          resource={CONNECTION_BULK_IMPORT}
          constantQueryVariables={{ connectionId }}
          displayColumnIdsToFilter={["connection"]}
          mapQueryToVariables={mapConnectionBulkImportQueryToVariables}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
        />
      );
      break;
    }
    case "customProcessingWindows": {
      const searchComponents = getCustomProcessingWindowSearchComponents({
        includeConnectionSearch: false,
      });

      content = (
        <ListView
          customizableColumns={false}
          disableMetadata
          initialShowSearchArea={false}
          graphqlDocument={
            OperationsCustomProcessingWindowsForConnectionDocument
          }
          resource={CUSTOM_PROCESSING_WINDOW}
          constantQueryVariables={{ connectionId }}
          displayColumnIdsToFilter={["connection"]}
          mapQueryToVariables={mapCustomProcessingWindowQueryToVariables}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
        />
      );
      break;
    }
    case "auditTrail": {
      content = (
        <AuditRecordsHome
          queryArgs={{
            entityId: connectionId,
            entityType: AUDIT_RECORD_ENTITY_TYPE,
            includeAdminActions: true,
          }}
          hideHeadline
          hideLinks
        />
      );
      break;
    }
    default:
      break;
  }

  const connection = data?.connection;

  if (!loading && connection) {
    pageHeaderProps = {
      ...pageHeaderProps,
      title: connection.bestName,
      crumbs: [
        {
          name: "Operations",
          path: "/operations",
        },
        {
          name: "Connections",
          path: "/operations/connections",
        },
        {
          name: connection.bestName,
          path: `/operations/connections/${connection.id}`,
        },
      ],
      right: (
        <div className="flex flex-row gap-2">
          <ConnectionBulkActions connectionId={connectionId} />
          <ConnectionActions
            connectionId={connectionId}
            onViewConfigurationClick={() => setShowConfigurationModal(true)}
          />
        </div>
      ),
    };
  }

  return (
    <PageHeader {...pageHeaderProps}>
      <Layout
        ratio="1/3"
        primaryContent={
          <DetailsTable
            graphqlQuery={useConnectionDetailsTableQuery}
            id={connectionId}
            resource={CONNECTION}
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
      {showConfigurationModal && (
        <ConnectionConfigurationViewModal
          connectionId={connectionId}
          closeModal={() => setShowConfigurationModal(false)}
        />
      )}
    </PageHeader>
  );
}

export default sectionWithNavigator(ConnectionView, "connectionEndpoints");
