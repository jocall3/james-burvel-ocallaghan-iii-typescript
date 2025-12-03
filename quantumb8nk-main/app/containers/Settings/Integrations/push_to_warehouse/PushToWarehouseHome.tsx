// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "~/app/components/ListView";
import { Alert, PageHeader } from "~/common/ui-components";
import { PushToWarehouseHomeDocument } from "~/generated/dashboard/graphqlSchema";
import { DESTINATION } from "~/generated/dashboard/types/resources";

const PUSH_TO_WAREHOUSE_DOCUMENTATION_LINK =
  "https://docs.moderntreasury.com/platform/docs/push-to-warehouse";

export default function PushToWarehouseHome() {
  return (
    <PageHeader hideBreadCrumbs title="Push to Warehouse">
      <Alert alertType="info">
        Please direct any questions about your Push to Warehouse integration to
        our customer support team. Additional information can be found in our{" "}
        <a
          href={PUSH_TO_WAREHOUSE_DOCUMENTATION_LINK}
          target="_blank"
          rel="noreferrer"
        >
          documentation
        </a>
        .
      </Alert>
      <ListView
        resource={DESTINATION}
        graphqlDocument={PushToWarehouseHomeDocument}
        disableMetadata
      />
    </PageHeader>
  );
}
