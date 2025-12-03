// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView, { Node } from "../../components/ListView";
import { GroupsHomeDocument } from "../../../generated/dashboard/graphqlSchema";
import {
  getGroupNameSearchComponent,
  mapGroupQueryToVariables,
} from "../../../common/search_components/groupSearchComponents";
import { GROUP } from "../../../generated/dashboard/types/resources";

function pathOverride(node: Node) {
  return `/settings/user_management/groups/${node.id}`;
}

function GroupsHome() {
  return (
    <ListView
      disableMetadata
      mapQueryToVariables={mapGroupQueryToVariables}
      graphqlDocument={GroupsHomeDocument}
      resource={GROUP}
      defaultSearchComponents={getGroupNameSearchComponent()}
      pathOverride={pathOverride}
      enableExportData
    />
  );
}

export default GroupsHome;
