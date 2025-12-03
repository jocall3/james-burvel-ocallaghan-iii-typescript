// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useDispatchContext } from "~/app/MessageProvider";
import { PageHeader } from "~/common/ui-components";
import {
  useOperationsEditAccountAchSettingQuery,
  useOperationsUpdateAccountAchSettingMutation,
} from "~/generated/dashboard/graphqlSchema";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import { AccountACHSettingFormValues } from "./form/FormValues";
import AccountACHSettingForm from "./form/AccountACHSettingForm";
import { formatAccountACHSettingFormValuesForMutation } from "./form/utilities";

interface EditAccountACHSettingProps {
  match: {
    params: {
      id: string;
    };
  };
}

function EditAccountACHSetting({
  match: {
    params: { id },
  },
}: EditAccountACHSettingProps) {
  const [updateAccountAchSetting] =
    useOperationsUpdateAccountAchSettingMutation();
  const { dispatchError } = useDispatchContext();
  const accountAchSettingPath = `/operations/account_ach_settings/${id}`;

  const { data, loading } = useOperationsEditAccountAchSettingQuery({
    variables: { id },
  });

  let content;
  let pageHeaderProps: PageHeaderProps = {
    title: "Edit Account ACH Setting",
    loading,
  };

  const accountAchSetting = data?.accountAchSetting;

  if (!loading && accountAchSetting) {
    const initialValues: AccountACHSettingFormValues = {
      immediateOrigin: accountAchSetting.immediateOrigin,
      immediateOriginName: accountAchSetting.immediateOriginName,
      immediateDestination: accountAchSetting.immediateDestination,
      immediateDestinationName: accountAchSetting.immediateDestinationName,
      direction: accountAchSetting.direction || null,
      connectionEndpointLabel: accountAchSetting.connectionEndpointLabel || "",
    };

    const handleSubmit = (formValues: AccountACHSettingFormValues) =>
      updateAccountAchSetting({
        variables: {
          input: {
            ...formatAccountACHSettingFormValuesForMutation(formValues),
            id,
          },
        },
      })
        .then((response) => {
          const { errors = [] } =
            response.data?.operationsUpdateAccountAchSetting || {};

          if (errors.length) {
            dispatchError(errors.toString());
          } else {
            window.location.href = accountAchSettingPath;
          }
        })
        .catch((error: Error) => {
          const errorMsg =
            error.message || "Sorry, could not create the Account ACH Setting";
          dispatchError(errorMsg);
        });

    const { id: internalAccountId, bestName } =
      accountAchSetting.internalAccount;

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
          name: bestName,
          path: `/operations/internal_accounts/${internalAccountId}`,
        },
        {
          name: "Account ACH Settings",
          path: `/operations/internal_accounts/${internalAccountId}?section=accountAchSettings`,
        },
        {
          name: accountAchSetting.prettyDirection,
          path: `/operations/account_ach_settings/${internalAccountId}`,
        },
      ],
    };

    content = (
      <AccountACHSettingForm
        isEdit
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    );
  }

  return <PageHeader {...pageHeaderProps}>{content}</PageHeader>;
}

export default EditAccountACHSetting;
