// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "~/app/components/ListView";
import {
  mapConnectionEndpointQueryToVariables,
  getConnectionEndpointSearchComponents,
} from "~/common/search_components/connectionEndpointSearchComponents";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import { OperationsConnectionEndpointsHomeDocument } from "~/generated/dashboard/graphqlSchema";
import { CONNECTION_ENDPOINT } from "~/generated/dashboard/types/resources";

function ConnectionEndpointsHome() {
  const searchComponents = getConnectionEndpointSearchComponents();

  return (
    <PageHeader title="Connection Endpoints">
      <ListView
        disableMetadata
        mapQueryToVariables={mapConnectionEndpointQueryToVariables}
        graphqlDocument={OperationsConnectionEndpointsHomeDocument}
        resource={CONNECTION_ENDPOINT}
        defaultSearchComponents={searchComponents.defaultComponents}
        additionalSearchComponents={searchComponents.additionalComponents}
      />
    </PageHeader>
  );
}

export default ConnectionEndpointsHome;
