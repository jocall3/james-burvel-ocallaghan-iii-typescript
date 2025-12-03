// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useDispatchContext } from "~/app/MessageProvider";
import { PageHeader } from "~/common/ui-components";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import {
  useOperationsCreateVirtualAccountSettingMutation,
  useOperationsInternalAccountCreateVirtualAccountSettingQuery,
} from "~/generated/dashboard/graphqlSchema";
import { VirtualAccountSettingFormValues } from "./form/FormValues";
import { formatVirtualAccountSettingFormValuesForMutation } from "./form/utilities";
import VirtualAccountSettingForm from "./form/VirtualAccountSettingForm";

interface CreateVirtualAccountSettingProps {
  match: {
    params: {
      internalAccountId: string;
    };
  };
}

export default function CreateVirtualAccountSetting({
  match: {
    params: { internalAccountId },
  },
}: CreateVirtualAccountSettingProps) {
  const [createVirtualAccountSetting] =
    useOperationsCreateVirtualAccountSettingMutation();
  const { dispatchError } = useDispatchContext();

  const { data, loading } =
    useOperationsInternalAccountCreateVirtualAccountSettingQuery({
      variables: { id: internalAccountId },
    });

  let content;
  let pageHeaderProps: PageHeaderProps = {
    title: "Create Virtual Account Setting",
    loading,
  };

  const internalAccount = data?.internalAccount;

  if (internalAccount && !loading) {
    const connectionId = internalAccount.connection.id;

    const handleSubmit = async (
      formValues: VirtualAccountSettingFormValues,
    ): Promise<void> => {
      try {
        const response = await createVirtualAccountSetting({
          variables: {
            input: {
              ...formatVirtualAccountSettingFormValuesForMutation(formValues),
              internalAccountId,
              connectionId,
            },
          },
        });
        const { errors = [], virtualAccountSetting } =
          response.data?.operationsCreateVirtualAccountSetting || {};

        if (errors.length) {
          dispatchError(errors.toString());
        } else if (virtualAccountSetting) {
          window.location.href = `/operations/virtual_account_settings/${virtualAccountSetting.id}`;
        } else {
          window.location.href = `/operations/internal_accounts/${internalAccountId}`;
        }
      } catch (error: unknown) {
        dispatchError(
          error instanceof Error
            ? error.message
            : "Sorry, could not create the Virtual Account Setting",
        );
      }
    };

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
          name: internalAccount.bestName,
          path: `/operations/internal_accounts/${internalAccountId}`,
        },
        {
          name: "Virtual Account Settings",
          path: `/operations/internal_accounts/${internalAccountId}?section=virtualAccountSettings`,
        },
      ],
    };

    content = (
      <VirtualAccountSettingForm
        onSubmit={handleSubmit}
        internalAccount={internalAccount}
      />
    );
  }

  return <PageHeader {...pageHeaderProps}>{content}</PageHeader>;
}
