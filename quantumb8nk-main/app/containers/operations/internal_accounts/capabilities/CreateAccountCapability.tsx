// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  useOperationsCreateAccountCapabilityMutation,
  useOperationsCreateAccountCapabilityViewQuery,
} from "~/generated/dashboard/graphqlSchema";
import { useDispatchContext } from "~/app/MessageProvider";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import { PageHeader } from "~/common/ui-components";
import AccountCapabilityForm from "./form/AccountCapabilityForm";
import { AccountCapabilityFormValues } from "./form/FormValues";
import { formatAccountCapabilityFormValuesForMutation } from "./form/utilities";

interface CreateAccountCapabilityParams {
  internalAccountId: string;
}

export default function CreateAccountCapability({
  match: {
    params: { internalAccountId },
  },
}: {
  match: {
    params: CreateAccountCapabilityParams;
  };
}) {
  const { dispatchError } = useDispatchContext();
  const [createAccountCapability] =
    useOperationsCreateAccountCapabilityMutation();
  const { data, loading } = useOperationsCreateAccountCapabilityViewQuery({
    variables: {
      id: internalAccountId,
    },
  });

  const handleSubmit = (values: AccountCapabilityFormValues) => {
    const sanitizedFormValues =
      formatAccountCapabilityFormValuesForMutation(values);

    return createAccountCapability({
      variables: {
        input: {
          internalAccountId,
          ...sanitizedFormValues,
        },
      },
    })
      .then((response) => {
        const { errors = [], accountCapability } =
          response.data?.operationsCreateAccountCapability || {};
        if (errors.length) {
          dispatchError(errors.toString());
        } else if (accountCapability) {
          window.location.href = `/operations/capabilities/${accountCapability.id}`;
        }
      })
      .catch((error: Error) => {
        const errorMsg =
          error.message ||
          "Sorry, the Account Capability could not be created.";
        dispatchError(errorMsg);
      });
  };

  const account = data?.internalAccount;

  let content: React.ReactElement | null = null;
  let pageHeaderProps: PageHeaderProps = {
    title: "Create Capability",
    loading,
  };

  if (!loading && account) {
    content = (
      <AccountCapabilityForm
        onSubmit={handleSubmit}
        internalAccount={account}
      />
    );

    pageHeaderProps = {
      ...pageHeaderProps,
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
          name: account.bestName,
          path: `/operations/internal_accounts/${internalAccountId}`,
        },
        {
          name: "Create",
        },
      ],
    };
  }

  return <PageHeader {...pageHeaderProps}>{content}</PageHeader>;
}
