// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "~/common/ui-components";
import {
  defaultAddress,
  isAddressEmpty,
  sanitizeAddress,
} from "~/common/formik/FormikAddressForm";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import { useDispatchContext } from "~/app/MessageProvider";
import {
  useOperationsEditAccountCapabilityQuery,
  useOperationsUpdateAccountCapabilityMutation,
} from "~/generated/dashboard/graphqlSchema";
import { AccountCapabilityFormValues } from "./form/FormValues";
import AccountCapabilityForm from "./form/AccountCapabilityForm";
import { formatAccountCapabilityFormValuesForMutation } from "./form/utilities";

interface EditAccountCapabilityProps {
  match: {
    params: {
      id: string;
    };
  };
}

export default function EditAccountCapability({
  match: {
    params: { id },
  },
}: EditAccountCapabilityProps) {
  const { dispatchError } = useDispatchContext();
  const [updateAccountCapability] =
    useOperationsUpdateAccountCapabilityMutation();
  const { data, loading } = useOperationsEditAccountCapabilityQuery({
    variables: {
      id,
    },
  });

  const accountCapability = data?.accountCapability;

  const handleSubmit = (values: AccountCapabilityFormValues) => {
    const { paymentType, direction, ...sanitizedFormValues } =
      formatAccountCapabilityFormValuesForMutation(values);

    return updateAccountCapability({
      variables: {
        input: {
          ...sanitizedFormValues,
          id,
        },
      },
    })
      .then((response) => {
        const { errors = [] } =
          response.data?.operationsUpdateAccountCapability || {};
        if (errors.length) {
          dispatchError(errors.toString());
        } else {
          window.location.href = `/operations/capabilities/${id}`;
        }
      })
      .catch((error: Error) => {
        const errorMsg =
          error.message || "Sorry, could not update Account Capability.";
        dispatchError(errorMsg);
      });
  };

  let content: React.ReactElement | null = null;
  let pageHeaderProps: PageHeaderProps = {
    title: "Edit Capability",
    loading,
  };

  if (!loading && accountCapability) {
    pageHeaderProps = {
      title: `Edit ${accountCapability.bestName}`,
      crumbs: [
        {
          name: "Operations",
          path: "/operations",
        },
        {
          name: "Internal Accounts",
          path: "/operations/internal_accounts",
        },
        {
          name: accountCapability.internalAccount.bestName,
          path: `/operations/internal_accounts/${accountCapability.internalAccount.id}`,
        },
        {
          name: accountCapability.bestName,
          path: `/operations/capabilities/${id}`,
        },
        {
          name: "Edit",
        },
      ],
    };

    const initialValues: AccountCapabilityFormValues = {
      paymentType: accountCapability.paymentType,
      direction: accountCapability.direction,
      paymentSubtypes: accountCapability.paymentSubtypes || [],
      currencies: accountCapability.currencies,
      anyCurrency: [accountCapability.anyCurrency],
      identifier: accountCapability.identifier || "",
      partyName: accountCapability.partyName || "",
      address: isAddressEmpty(accountCapability.address)
        ? { ...defaultAddress }
        : sanitizeAddress(accountCapability.address || {}),
      connectionId: accountCapability.connection?.id || "",
    };

    content = (
      <AccountCapabilityForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        internalAccount={accountCapability.internalAccount}
        isEdit
      />
    );
  }

  return <PageHeader {...pageHeaderProps}>{content}</PageHeader>;
}
