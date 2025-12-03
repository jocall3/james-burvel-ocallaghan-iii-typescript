// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView, { Node } from "../../components/ListView";
import { UsersHomeDocument } from "../../../generated/dashboard/graphqlSchema";
import { USER } from "../../../generated/dashboard/types/resources";
import {
  getUserSearchComponentsWithoutRoles,
  mapUserQueryToVariables,
} from "../../../common/search_components/userSearchComponents";

function pathOverride(node: Node) {
  return `/settings/user_management/users/${node.id}`;
}

function UsersHome() {
  const searchComponents = getUserSearchComponentsWithoutRoles();
  return (
    <ListView
      disableMetadata
      graphqlDocument={UsersHomeDocument}
      defaultSearchComponents={searchComponents.defaultComponents}
      additionalSearchComponents={searchComponents.additionalComponents}
      mapQueryToVariables={mapUserQueryToVariables}
      resource={USER}
      enableExportData
      pathOverride={pathOverride}
    />
  );
}

export default UsersHome;
