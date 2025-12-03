// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import EntityTableView, {
  INITIAL_PAGINATION,
} from "../../../components/EntityTableView";
import { useOperationsConnectionBulkImportEntitiesTableQuery } from "../../../../generated/dashboard/graphqlSchema";
import { CursorPaginationInput } from "../../../types/CursorPaginationInput";

const INTERNAL_ACCOUNT = "InternalAccount";
const ACCOUNT_CAPABILITY = "AccountCapability";
const ACCOUNT_ACH_SETTING = "AccountACHSetting";

const RESOURCE_TYPE_TO_MAPPING: Record<string, Record<string, string>> = {
  [INTERNAL_ACCOUNT]: {
    id: "ID",
    bestName: "Name",
    currency: "Currency",
    operationalStatus: "Status",
  },
  [ACCOUNT_CAPABILITY]: {
    internalAccountName: "Internal Account Name",
    prettyPaymentType: "Payment Type",
    prettyDirection: "Direction",
    identifier: "Identifier",
  },
  [ACCOUNT_ACH_SETTING]: {
    internalAccountName: "Internal Account Name",
    immediateOrigin: "Immediate Origin",
    immediateOriginName: "Immediate Origin Name",
    immediateDestination: "Immediate Destination",
    immediateDestinationName: "Immediate Destination Name",
  },
};

interface ConnectionBulkImportEntitiesTableProps {
  connectionBulkImportId: string;
}

function ConnectionBulkImportEntitiesTable({
  connectionBulkImportId,
}: ConnectionBulkImportEntitiesTableProps) {
  const { loading, data, refetch } =
    useOperationsConnectionBulkImportEntitiesTableQuery({
      variables: {
        connectionBulkImportId,
        first: INITIAL_PAGINATION.perPage,
      },
    });

  const records =
    data?.connectionBulkImportEntities?.edges.map(({ node }) => {
      const { entity } = node;

      switch (entity.__typename) {
        case ACCOUNT_ACH_SETTING:
        case ACCOUNT_CAPABILITY: {
          const { internalAccount, ...rest } = entity;

          return {
            internalAccountName: internalAccount.bestName,
            ...rest,
          };
        }

        case INTERNAL_ACCOUNT: {
          const { operationsPath, ...rest } = entity;

          return {
            path: operationsPath,
            ...rest,
          };
        }

        default:
          return { ...entity };
      }
    }) || [];

  const resourceType =
    data?.connectionBulkImport?.resourceType || INTERNAL_ACCOUNT;
  const dataMapping = RESOURCE_TYPE_TO_MAPPING[resourceType];

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
  }) => {
    const { cursorPaginationParams } = options;

    await refetch({
      ...cursorPaginationParams,
    });
  };

  return (
    <EntityTableView
      data={records}
      loading={loading}
      dataMapping={dataMapping}
      onQueryArgChange={handleRefetch}
      cursorPagination={data?.connectionBulkImportEntities?.pageInfo}
      initialShowSearchArea={false}
    />
  );
}

export default ConnectionBulkImportEntitiesTable;
