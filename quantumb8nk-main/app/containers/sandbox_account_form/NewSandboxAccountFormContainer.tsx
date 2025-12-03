// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  useSandboxAccountFormQuery,
  useCreateSandboxAccountMutation,
  CurrencyEnum,
} from "../../../generated/dashboard/graphqlSchema";
import useErrorBanner from "../../../common/utilities/useErrorBanner";
import NewSandboxAccountForm, {
  ValidateErrors,
  OnSubmit,
  Validate,
} from "./NewSandboxAccountForm";
import GraphqlQueryResult from "../../../common/ui-components/GraphqlQueryResult/GraphqlQueryResult";
import {
  FormContainer,
  Navigate,
  SandboxGate,
} from "../../../common/ui-components";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";

const validate: Validate = (values) => {
  const errors: ValidateErrors = {};
  if (!values.connectionId) errors.connectionId = "Vendor is required";
  if (!values.name) errors.name = "Name is required";
  if (!values.currency) errors.currency = "Currency is required";
  return errors;
};

export default function NewSandboxAccountFormContainer() {
  const queryResult = useSandboxAccountFormQuery();
  const [createSandboxAccount] = useCreateSandboxAccountMutation();
  const flashError = useErrorBanner();

  const onSubmit: OnSubmit = (values, { setSubmitting }) => {
    void createSandboxAccount({ variables: { input: { input: values } } }).then(
      (result) => {
        if (result.errors) {
          flashError("Something went wrong!");
        } else if (result.data?.createSandboxAccount?.errors?.length) {
          flashError(result.data?.createSandboxAccount.errors[0]);
        } else {
          const accountId =
            result.data?.createSandboxAccount?.internalAccount?.id;
          window.location.replace(`/accounts/${accountId ?? ""}`);
        }
        setSubmitting(false);
      },
    );
  };
  return (
    <SandboxGate fallback={<Navigate to="/" />}>
      <PageHeader title="New Sandbox Account">
        <FormContainer>
          <GraphqlQueryResult result={queryResult}>
            {({ data }) => {
              const { connectionIdOptions, currencyOptions } =
                data.createSandboxAccountForm;
              const initialValues = {
                connectionId: connectionIdOptions[0]?.value ?? "",
                name: "",
                accountNumber: null,
                currency: CurrencyEnum.Usd,
                paymentCapabilities: {},
              };

              return (
                <NewSandboxAccountForm
                  connectionIdOptions={connectionIdOptions}
                  currencyOptions={currencyOptions}
                  initialValues={initialValues}
                  onSubmit={onSubmit}
                  validate={validate}
                />
              );
            }}
          </GraphqlQueryResult>
        </FormContainer>
      </PageHeader>
    </SandboxGate>
  );
}
