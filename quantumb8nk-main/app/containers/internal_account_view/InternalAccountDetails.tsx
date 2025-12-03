// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useMemo, useState } from "react";
import {
  accountNumberLabelMapping,
  accountNumberValueMapping,
} from "../../utilities/AccountNumberUtils";
import {
  routingNumberLabelMapping,
  routingNumberValueMapping,
} from "../../utilities/RoutingNumberUtils";
import { counterpartyDrawer } from "../../components/CounterpartyDrawer";
import {
  InternalAccount,
  useUpdateInternalAccountMutation,
} from "../../../generated/dashboard/graphqlSchema";
import {
  InlineTextEditor,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
} from "../../../common/ui-components";
import { useDispatchContext } from "../../MessageProvider";
import VirtualAccountsUtilization from "./VirtualAccountsUtilization";

export default function InternalAccountDetails({
  internalAccount,
}: {
  internalAccount: InternalAccount | null | undefined;
}) {
  const { dispatchError } = useDispatchContext();
  const [editing, setEditing] = useState(false);

  const [updateInternalAccount, { loading: saveNameLoading }] =
    useUpdateInternalAccountMutation({
      refetchQueries: ["InternalAccountView"],
    });

  const updateInternalAccountFunc = useCallback(
    (name: string) => {
      updateInternalAccount({
        variables: { input: { id: internalAccount?.id || "", name } },
      })
        .then(({ data: responseData }) => {
          if (responseData?.updateInternalAccount?.errors.length) {
            dispatchError(responseData.updateInternalAccount.errors.toString());
          }
        })
        .catch(() =>
          dispatchError("Sorry, we could not update the internal account"),
        );
    },
    [internalAccount, updateInternalAccount, dispatchError],
  );

  const accountDetails = internalAccount?.accountDetails;
  const routingDetails = internalAccount?.routingDetails;

  const dataMapping = {
    name: "Nickname",
    partyName: "Legal Name",
    ...accountNumberLabelMapping(accountDetails || []),
    ...routingNumberLabelMapping(routingDetails || []),
    ...(internalAccount?.childrenCount ? { childrenCount: "Subaccounts" } : {}),
    currency: "Currency",
    bank: "Bank",
    address: "Address",
    id: "ID",
    ...(internalAccount?.counterpartyId
      ? { counterpartyId: "Counterparty ID" }
      : {}),
    ...(internalAccount?.connection?.hasVirtualAccountSettings
      ? { virtualAccountsUtilization: "Virtual Accounts" }
      : {}),
  };

  const nameEditor = useMemo(
    (): JSX.Element => (
      <InlineTextEditor
        value={internalAccount?.name || "N/A"}
        editing={editing}
        onEditingChange={setEditing}
        onSave={updateInternalAccountFunc}
        loading={saveNameLoading}
      />
    ),
    [
      editing,
      internalAccount?.name,
      saveNameLoading,
      updateInternalAccountFunc,
    ],
  );

  if (internalAccount) {
    return (
      <KeyValueTable
        data={{
          ...internalAccount,
          ...accountNumberValueMapping(accountDetails || []),
          ...routingNumberValueMapping(routingDetails || []),
          name: nameEditor,
          bank:
            internalAccount?.connection.nickname ||
            internalAccount?.connection.vendor?.name,
          address: internalAccount?.partyAddress?.full,
          counterpartyId: internalAccount?.counterpartyId
            ? counterpartyDrawer(internalAccount?.counterpartyId)
            : null,
          virtualAccountsUtilization: (
            <VirtualAccountsUtilization
              internalAccountId={internalAccount.id}
            />
          ),
        }}
        dataMapping={dataMapping}
        copyableData={["id", "counterpartyId"]}
      />
    );
  }

  return <KeyValueTableSkeletonLoader dataMapping={dataMapping} />;
}
