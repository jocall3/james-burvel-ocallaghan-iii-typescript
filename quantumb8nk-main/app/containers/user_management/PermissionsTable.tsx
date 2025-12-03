// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { IndexTable } from "../../../common/ui-components";
import { Permission } from "../../../generated/dashboard/graphqlSchema";
import { mapFieldWithValuesToAppliedFilters } from "~/app/components/filter/util";
import FilterPill from "~/app/components/filter/FilterPill";

function formatPermissions(permissions: Permission[]) {
  return permissions.map((permission) => {
    const includeFilters = mapFieldWithValuesToAppliedFilters(
      permission.includes || [],
    ).map((filter) => (
      <div className="pb-1">
        <FilterPill appliedFilter={filter} />{" "}
      </div>
    ));
    const excludeFilters = mapFieldWithValuesToAppliedFilters(
      permission.excludes || [],
    ).map((filter) => <FilterPill appliedFilter={filter} />);
    return {
      resource: permission.resource,
      actions: permission.actions.join(", "),
      includes: includeFilters,
      excludes: excludeFilters,
    };
  });
}

const MAPPING = {
  resource: "Resource",
  actions: "Actions",
  includes: "Only Include",
  excludes: "And Exclude",
};

function PermissionsTable({ permissions }: { permissions: Permission[] }) {
  return (
    <IndexTable
      data={formatPermissions(permissions)}
      dataMapping={MAPPING}
      styleMapping={{
        resource: "table-entry-small",
        actions: "table-entry-small",
        includes: "scrollable-longtext",
        excludes: "scrollable-longtext",
      }}
    />
  );
}

export default PermissionsTable;
