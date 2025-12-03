// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import DetailsTable from "~/app/components/DetailsTable";
import {
  OperationsVendorSubscriptionsForConnectionEndpointDocument,
  useConnectionEndpointDetailsTableQuery,
  useOperationsConnectionEndpointViewQuery,
  useOperationsPromoteConnectionEndpointMutation,
} from "~/generated/dashboard/graphqlSchema";
import { Layout, PageHeader, SectionNavigator } from "~/common/ui-components";
import {
  CONNECTION_ENDPOINT,
  VENDOR_SUBSCRIPTION,
} from "~/generated/dashboard/types/resources";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import OperationalStatusBadge from "~/app/components/OperationalStatusBadge";
import ListView from "~/app/components/ListView";
import {
  getVendorSubscriptionSearchComponents,
  mapVendorSubscriptionQueryToVariables,
} from "~/common/search_components/vendorSubscriptionSearchComponents";
import ConnectionEndpointActions from "./ConnectionEndpointActions";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import { useDispatchContext } from "~/app/MessageProvider";
import sectionWithNavigator from "../../sectionWithNavigator";
import ConnectionEndpointPromoteModal from "./ConnectionEndpointPromoteModal";

const AUDIT_RECORD_ENTITY_TYPE = "ConnectionEndpoint";

const SECTIONS = {
  vendorSubscriptions: "Vendor Subscriptions",
  auditTrail: "Audit Trail",
};
interface ConnectionEndpointViewProps {
  match: {
    params: {
      connectionEndpointId: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
}

function ConnectionEndpointView({
  match: {
    params: { connectionEndpointId },
  },
  currentSection,
  setCurrentSection,
}: ConnectionEndpointViewProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();

  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteErrors, setPromoteErrors] = useState([] as Array<string>);

  const [promoteConnectionEndpoint] =
    useOperationsPromoteConnectionEndpointMutation();
  const { data, loading } = useOperationsConnectionEndpointViewQuery({
    variables: { id: connectionEndpointId },
  });

  const handlePromoteConnectionEndpoint = () => {
    promoteConnectionEndpoint({
      variables: {
        input: {
          id: connectionEndpointId,
        },
      },
    })
      .then((response) => {
        const { errors = [] } =
          response.data?.operationsPromoteConnectionEndpoint || {};

        if (errors.length) {
          setPromoteErrors(errors);
        } else {
          dispatchSuccess(
            "Connection Endpoint was successfully promoted to operational.",
          );
          window.location.href = `/operations/connection_endpoints/${connectionEndpointId}`;

          setIsPromoteModalOpen(false);
        }
      })
      .catch((err: Error) =>
        dispatchError(
          err.message || "Unable to promote the connection endpoint.",
        ),
      );
  };

  let content;
  let pageHeaderProps: PageHeaderProps = {
    title: "View Connection Endpoint",
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
          graphqlDocument={
            OperationsVendorSubscriptionsForConnectionEndpointDocument
          }
          resource={VENDOR_SUBSCRIPTION}
          constantQueryVariables={{ connectionEndpointId }}
          mapQueryToVariables={mapVendorSubscriptionQueryToVariables}
          displayColumnIdsToFilter={["connectionEndpoint"]}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
        />
      );
      break;
    }
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{
            entityId: connectionEndpointId,
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

  const connectionEndpoint = data?.connectionEndpoint;

  if (!loading && connectionEndpoint) {
    const { connection, label, operationalStatus, discardedAt } =
      connectionEndpoint;

    pageHeaderProps = {
      title: label,
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
        {
          name: "Connection Endpoints",
          path: `/operations/connections/${connection.id}?section=connectionEndpoints`,
        },
        {
          name: label,
          path: `/operations/connection_endpoints/${connectionEndpointId}`,
        },
      ],
      left: (
        <OperationalStatusBadge
          status={operationalStatus}
          discarded={!!discardedAt}
        />
      ),
      right: !discardedAt && (
        <ConnectionEndpointActions
          connectionEndpoint={connectionEndpoint}
          openPromoteModal={() => {
            setIsPromoteModalOpen(true);
          }}
        />
      ),
    };
  }

  return (
    <PageHeader {...pageHeaderProps}>
      <Layout
        ratio="1/3"
        primaryContent={
          <DetailsTable
            graphqlQuery={useConnectionEndpointDetailsTableQuery}
            id={connectionEndpointId}
            resource={CONNECTION_ENDPOINT}
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
      <ConnectionEndpointPromoteModal
        connectionEndpointId={connectionEndpointId}
        isPromoteModalOpen={isPromoteModalOpen}
        setIsPromoteModalOpen={setIsPromoteModalOpen}
        handlePromoteConnectionEndpoint={handlePromoteConnectionEndpoint}
        onPromoteErrors={promoteErrors}
      />
    </PageHeader>
  );
}

export default sectionWithNavigator(
  ConnectionEndpointView,
  "vendorSubscriptions",
);
