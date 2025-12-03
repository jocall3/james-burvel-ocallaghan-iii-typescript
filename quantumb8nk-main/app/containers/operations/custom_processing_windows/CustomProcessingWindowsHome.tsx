// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "~/app/components/ListView";
import {
  mapCustomProcessingWindowQueryToVariables,
  getCustomProcessingWindowSearchComponents,
} from "~/common/search_components/customProcessingWindowSearchComponents";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import { OperationsCustomProcessingWindowsHomeDocument } from "~/generated/dashboard/graphqlSchema";
import { CUSTOM_PROCESSING_WINDOW } from "~/generated/dashboard/types/resources";

function CustomProcessingWindowsHome() {
  const searchComponents = getCustomProcessingWindowSearchComponents();

  return (
    <PageHeader title="Custom Processing Windows">
      <ListView
        disableMetadata
        mapQueryToVariables={mapCustomProcessingWindowQueryToVariables}
        graphqlDocument={OperationsCustomProcessingWindowsHomeDocument}
        resource={CUSTOM_PROCESSING_WINDOW}
        defaultSearchComponents={searchComponents.defaultComponents}
        additionalSearchComponents={searchComponents.additionalComponents}
      />
    </PageHeader>
  );
}

export default CustomProcessingWindowsHome;
