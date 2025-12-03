// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "../../components/ListView";
import { PermissionSetsHomeDocument } from "../../../generated/dashboard/graphqlSchema";
import { PERMISSION_SET } from "../../../generated/dashboard/types/resources";

function PermissionSetsHome() {
  return (
    <ListView
      disableMetadata
      graphqlDocument={PermissionSetsHomeDocument}
      resource={PERMISSION_SET}
      enableExportData
      hideAllCheckboxes
      constantQueryVariables={{
        actorSource: "Group",
        permissionSetType: ["admin", "managed", "custom"],
      }}
    />
  );
}

export default PermissionSetsHome;
