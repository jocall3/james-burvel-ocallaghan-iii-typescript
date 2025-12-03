// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import EntityTableView, {
  INITIAL_PAGINATION,
} from "../../../components/EntityTableView";
import {
  useOperationsInternalAccountsTableQuery,
  OperationalStatusEnum,
} from "../../../../generated/dashboard/graphqlSchema";
import { CursorPaginationInput } from "../../../types/CursorPaginationInput";

import {
  getInternalAccountsSearchComponents,
  mapInternalAccountQueryToVariables,
  InternalAccountsQueryFilter,
} from "../../../../common/search_components/operationsInternalAccountsSearchComponents";

const columnMapping = (
  includeConnectionColumns: boolean,
): Record<string, string> => {
  const columns: Record<string, string> = {
    id: "ID",
    bestName: "Name",
  };

  if (includeConnectionColumns) {
    columns.bankName = "Bank Name";
  }

  columns.currency = "Currency";
  columns.operationalStatus = "Status";
  return columns;
};

interface InternalAccountsTableProps {
  connectionId?: string;
  achSettingId?: string;
  operationalStatuses?: OperationalStatusEnum[];
}

function InternalAccountsTable({
  connectionId,
  achSettingId,
  operationalStatuses,
}: InternalAccountsTableProps) {
  const { loading, data, error, refetch } =
    useOperationsInternalAccountsTableQuery({
      variables: {
        connectionId,
        achSettingId,
        operationalStatuses,
        first: INITIAL_PAGINATION.perPage,
      },
    });

  const internalAccounts =
    loading || !data || error || !data?.internalAccounts
      ? []
      : data.internalAccounts.edges.map(({ node }) => ({
          ...node,
          path: node.operationsPath,
        }));

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
    query: InternalAccountsQueryFilter;
  }) => {
    const { cursorPaginationParams, query } = options;

    await refetch({
      ...mapInternalAccountQueryToVariables(query),
      ...(connectionId ? { connectionId } : {}),
      ...(achSettingId ? { achSettingId } : {}),
      ...cursorPaginationParams,
    });
  };

  const searchComponents = getInternalAccountsSearchComponents({
    includeConnectionSearch: !connectionId,
  });

  return (
    <EntityTableView
      data={internalAccounts}
      loading={loading}
      dataMapping={columnMapping(!connectionId)}
      onQueryArgChange={handleRefetch}
      cursorPagination={data?.internalAccounts?.pageInfo}
      initialShowSearchArea={false}
      defaultSearchComponents={searchComponents.defaultComponents}
      additionalSearchComponents={searchComponents.additionalComponents}
    />
  );
}

export default InternalAccountsTable;
