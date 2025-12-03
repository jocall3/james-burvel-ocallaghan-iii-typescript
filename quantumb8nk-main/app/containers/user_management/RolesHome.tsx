// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "../../components/ListView";
import { RolesHomeDocument } from "../../../generated/dashboard/graphqlSchema";
import { ROLE } from "../../../generated/dashboard/types/resources";

function RolesHome() {
  return (
    <ListView
      disableMetadata
      graphqlDocument={RolesHomeDocument}
      resource={ROLE}
      enableExportData
      hideAllCheckboxes
      constantQueryVariables={{
        actorSource: "Group",
      }}
    />
  );
}

export default RolesHome;
