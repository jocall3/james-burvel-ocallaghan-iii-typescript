// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  routingNumberLabelMapping,
  routingNumberValueMapping,
} from "~/app/utilities/RoutingNumberUtils";
import { useOperationsInternalAccountDetailTableQuery } from "~/generated/dashboard/graphqlSchema";
import {
  accountNumberLabelMapping,
  accountNumberValueMapping,
} from "~/app/utilities/AccountNumberUtils";
import {
  KeyValueTable,
  KeyValueTableSkeletonLoader,
} from "~/common/ui-components";

interface InternalAccountDetailsTableProps {
  internalAccountId: string;
}

function InternalAccountDetailsTable({
  internalAccountId,
}: InternalAccountDetailsTableProps) {
  const { data, loading } = useOperationsInternalAccountDetailTableQuery({
    variables: {
      id: internalAccountId,
    },
  });

  const internalAccount = data?.internalAccount;

  if (loading || !internalAccount) {
    return <KeyValueTableSkeletonLoader />;
  }

  const { connection, partyAddress } = internalAccount;

  const internalAccountData = {
    ...internalAccount,
    ...accountNumberValueMapping(internalAccount.accountDetails),
    ...routingNumberValueMapping(internalAccount.routingDetails),
    bank: connection.vendor?.name || connection.entity,
    address: partyAddress?.full,
    connection: (
      <a href={`/operations/connections/${connection.id}`}>
        {connection.nickname || connection.id}
      </a>
    ),
  };

  const dataMapping = {
    id: "ID",
    name: "Name",
    partyName: "Party Name",
    ...accountNumberLabelMapping(internalAccount.accountDetails),
    ...routingNumberLabelMapping(internalAccount.routingDetails),
    currency: "Currency",
    bank: "Bank",
    address: "Address",
    createdAt: "Created At",
    connection: "Connection",
  };

  return (
    <KeyValueTable
      data={internalAccountData}
      dataMapping={dataMapping}
      altRowClassNames="detail-panel-row"
      altTableClassNames="detail-panel p-6"
    />
  );
}

export default InternalAccountDetailsTable;
