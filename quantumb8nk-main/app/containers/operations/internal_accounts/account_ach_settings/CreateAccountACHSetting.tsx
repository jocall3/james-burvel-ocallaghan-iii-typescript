// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useDispatchContext } from "~/app/MessageProvider";
import { PageHeader } from "~/common/ui-components";
import {
  useOperationsCreateAccountAchSettingMutation,
  useOperationsInternalAccountCreateAccountAchSettingQuery,
} from "~/generated/dashboard/graphqlSchema";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import { formatAccountACHSettingFormValuesForMutation } from "./form/utilities";
import { AccountACHSettingFormValues } from "./form/FormValues";
import AccountACHSettingForm from "./form/AccountACHSettingForm";

interface CreateAccountACHSettingProps {
  match: {
    params: {
      internalAccountId: string;
    };
  };
}

export default function CreateAccountACHSetting({
  match: {
    params: { internalAccountId },
  },
}: CreateAccountACHSettingProps) {
  const [createAccountACHSetting] =
    useOperationsCreateAccountAchSettingMutation();
  const { dispatchError } = useDispatchContext();

  const { data, loading } =
    useOperationsInternalAccountCreateAccountAchSettingQuery({
      variables: { id: internalAccountId },
    });

  let content;
  let pageHeaderProps: PageHeaderProps = {
    title: "Create Account ACH Setting",
    loading,
  };

  const internalAccount = data?.internalAccount;

  if (internalAccount && !loading) {
    const handleSubmit = (formValues: AccountACHSettingFormValues) =>
      createAccountACHSetting({
        variables: {
          input: {
            ...formatAccountACHSettingFormValuesForMutation(formValues),
            internalAccountId,
          },
        },
      })
        .then((response) => {
          const { errors = [], accountAchSetting } =
            response.data?.operationsCreateAccountAchSetting || {};

          if (errors.length) {
            dispatchError(errors.toString());
          } else if (accountAchSetting) {
            window.location.href = `/operations/account_ach_settings/${accountAchSetting.id}`;
          } else {
            window.location.href = `/operations/internal_accounts/${internalAccountId}`;
          }
        })
        .catch((error: Error) => {
          const errorMsg =
            error.message || "Sorry, could not create the Account ACH Setting";
          dispatchError(errorMsg);
        });

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
          name: "Account ACH Settings",
          path: `/operations/internal_accounts/${internalAccountId}?section=accountAchSettings`,
        },
      ],
    };

    content = <AccountACHSettingForm onSubmit={handleSubmit} />;
  }

  return <PageHeader {...pageHeaderProps}>{content}</PageHeader>;
}
