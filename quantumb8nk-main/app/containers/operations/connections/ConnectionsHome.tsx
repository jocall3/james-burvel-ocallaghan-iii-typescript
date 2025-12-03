// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { OperationsConnectionsHomeDocument } from "~/generated/dashboard/graphqlSchema";
import {
  getConnectionSearchComponents,
  mapConnectionQueryToVariables,
} from "~/common/search_components/connectionSearchComponents";
import ConnectionsHomeActions from "./ConnectionsHomeActions";
import ListView from "../../../components/ListView";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";
import { CONNECTION } from "../../../../generated/dashboard/types/resources";

function ConnectionsHome() {
  const searchComponents = getConnectionSearchComponents();

  return (
    <PageHeader title="Connections" right={<ConnectionsHomeActions />}>
      <ListView
        mapQueryToVariables={mapConnectionQueryToVariables}
        graphqlDocument={OperationsConnectionsHomeDocument}
        disableMetadata
        customizableColumns={false}
        resource={CONNECTION}
        defaultSearchComponents={searchComponents.defaultComponents}
        additionalSearchComponents={searchComponents.additionalComponents}
      />
    </PageHeader>
  );
}

export default ConnectionsHome;
