// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { OperationsConnectionBulkImportsHomeDocument } from "../../../../generated/dashboard/graphqlSchema";
import ListView from "../../../components/ListView";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";
import { CONNECTION_BULK_IMPORT } from "../../../../generated/dashboard/types/resources";
import {
  getConnectionBulkImportSearchComponents,
  mapConnectionBulkImportQueryToVariables,
} from "../../../../common/search_components/connectionBulkImportSearchComponents";

function ConnectionsBulkImportsHome() {
  const searchComponents = getConnectionBulkImportSearchComponents();

  return (
    <PageHeader title="Connection Bulk Imports">
      <ListView
        disableMetadata
        mapQueryToVariables={mapConnectionBulkImportQueryToVariables}
        graphqlDocument={OperationsConnectionBulkImportsHomeDocument}
        resource={CONNECTION_BULK_IMPORT}
        defaultSearchComponents={searchComponents.defaultComponents}
        additionalSearchComponents={searchComponents.additionalComponents}
      />
    </PageHeader>
  );
}

export default ConnectionsBulkImportsHome;
