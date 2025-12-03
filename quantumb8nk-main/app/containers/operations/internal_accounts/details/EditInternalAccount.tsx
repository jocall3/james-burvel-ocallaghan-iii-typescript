// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  defaultAddress,
  isAddressEmpty,
  sanitizeAddress,
} from "~/common/formik/FormikAddressForm";
import { PageHeader } from "~/common/ui-components";
import {
  useOperationsEditInternalAccountQuery,
  useOperationsUpdateInternalAccountMutation,
} from "~/generated/dashboard/graphqlSchema";
import { useDispatchContext } from "~/app/MessageProvider";
import {
  InternalAccountFormValues,
  getAccountDetailIdsToDiscard,
  getRoutingDetailIdsToDiscard,
  newAccountDetailInputs,
  newRoutingDetailInputs,
} from "./form/FormValues";
import InternalAccountForm from "./form/InternalAccountForm";

interface EditInternalAccountProps {
  match: {
    params: {
      internalAccountId: string;
    };
  };
}

function EditInternalAccount({
  match: {
    params: { internalAccountId },
  },
}: EditInternalAccountProps) {
  const [updateInternalAccount] = useOperationsUpdateInternalAccountMutation();
  const { dispatchError } = useDispatchContext();
  const internalAccountPath = `/operations/internal_accounts/${internalAccountId}`;

  const { data, loading } = useOperationsEditInternalAccountQuery({
    variables: { id: internalAccountId },
  });

  const internalAccount = data?.internalAccount;

  let content;

  if (!internalAccount || loading) {
    content = null;
  } else {
    const initialAccountDetails = internalAccount.accountDetails.map(
      (accountDetail) => ({
        ...accountDetail,
        accountNumber: `****(${accountDetail.accountNumber})`,
        disabled: true,
      }),
    );

    const initialRoutingDetails = internalAccount.routingDetails.map(
      (routingDetail) => ({
        ...routingDetail,
        paymentType: routingDetail.paymentType || null,
      }),
    );

    const initialValues: InternalAccountFormValues = {
      name: internalAccount.name || "",
      partyName: internalAccount.partyName || "",
      currency: internalAccount.currency,
      accountDetails: initialAccountDetails,
      routingDetails: initialRoutingDetails,
      partyAddress: isAddressEmpty(internalAccount.partyAddress)
        ? { ...defaultAddress }
        : sanitizeAddress(internalAccount.partyAddress || {}),
    };

    const handleSubmit = (formData: InternalAccountFormValues) => {
      const newAccountDetails = newAccountDetailInputs(formData.accountDetails);

      const accountDetailIdsToDiscard = getAccountDetailIdsToDiscard(
        initialAccountDetails,
        formData.accountDetails,
      );

      const newRoutingDetails = newRoutingDetailInputs(
        initialRoutingDetails,
        formData.routingDetails,
      );

      const routingDetailIdsToDiscard = getRoutingDetailIdsToDiscard(
        initialRoutingDetails,
        formData.routingDetails,
      );

      return updateInternalAccount({
        variables: {
          input: {
            id: internalAccountId,
            name: formData.name,
            partyName: formData.partyName,
            currency: formData.currency,
            newAccountDetails,
            accountDetailIdsToDiscard,
            partyAddress: formData.partyAddress,
            newRoutingDetails,
            routingDetailIdsToDiscard,
          },
        },
      })
        .then((response) => {
          const { errors = [] } =
            response.data?.operationsUpdateInternalAccount || {};
          if (errors.length) {
            dispatchError(errors.toString());
          } else {
            window.location.href = internalAccountPath;
          }
        })
        .catch((error: Error) => {
          const errorMsg =
            error.message || "Sorry, could not update the Internal Account";
          dispatchError(errorMsg);
        });
    };

    const { id: connectionId, nickname, vendor } = internalAccount.connection;

    content = (
      <InternalAccountForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        connectionName={nickname || connectionId}
        bankName={vendor?.name}
      />
    );
  }

  return (
    <PageHeader
      loading={loading}
      crumbs={[
        {
          name: "Operations",
          path: "/operations",
        },
        {
          name: "Internal Accounts",
          path: "/operations/internal_accounts",
        },
        {
          name: internalAccount?.longName || internalAccountId,
          path: internalAccountPath,
        },
      ]}
      title="Edit Internal Account"
    >
      {content}
    </PageHeader>
  );
}

export default EditInternalAccount;
