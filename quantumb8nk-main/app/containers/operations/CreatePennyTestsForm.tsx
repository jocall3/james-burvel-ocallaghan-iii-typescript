// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, Form, Formik } from "formik";
import { isEmpty, isNull } from "lodash";
import React, { useState } from "react";
import {
  PennyTestConfig,
  usePennyTestConfigsLazyQuery,
  usePennyTestExternalAccountsSelectOptionsQuery,
} from "~/generated/dashboard/graphqlSchema";
import { cn } from "~/common/utilities/cn";
import { useDispatchContext } from "~/app/MessageProvider";
import { FormikErrorMessage, FormikSelectField } from "~/common/formik";
import {
  Button,
  FieldGroup,
  FieldsRow,
  Label,
  Layout,
} from "../../../common/ui-components";
import AccountSelect from "../AccountSelect";

interface CreatePennyTestsFormProps {
  onSubmit: ({
    internalAccountId,
    configIds,
    receivingAccount,
  }: {
    internalAccountId: string;
    configIds: string[];
    receivingAccount: string;
  }) => Promise<void>;
}

interface PennyTestsCreateFormValues {
  internalAccountId: string;
  receivingAccount: string | undefined;
}

export default function CreatePennyTestsForm({
  onSubmit,
}: CreatePennyTestsFormProps) {
  const { dispatchError, dispatchClearMessage } = useDispatchContext();
  const [configs, setConfigs] = useState<PennyTestConfig[] | null>([]);

  const [findPennyTestConfigs] = usePennyTestConfigsLazyQuery();
  const { data: externalAccountsData, loading: externalAccountsLoading } =
    usePennyTestExternalAccountsSelectOptionsQuery();

  const onValidate = (values: PennyTestsCreateFormValues) => {
    const errors = {} as {
      internalAccountId: string;
      receivingAccount: string;
    };

    if (isEmpty(values.internalAccountId)) {
      errors.internalAccountId = "This field is required.";
    }

    if (isEmpty(values.receivingAccount)) {
      errors.receivingAccount = "This field is required.";
    }

    return errors;
  };

  return (
    <Formik
      initialValues={{
        internalAccountId: "",
        configIds: [] as string[],
        receivingAccount: "",
      }}
      onSubmit={onSubmit}
      validate={onValidate}
      validateOnChange
      enableReinitialize
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form>
          <Layout
            primaryContent={
              <div>
                <FieldsRow>
                  <FieldGroup>
                    <Label>Internal Account</Label>
                    <Field
                      component={AccountSelect}
                      classes="w-full"
                      removeAllAccountsOption
                      name="internalAccountId"
                      accountId={values.internalAccountId}
                      onAccountSelect={(accountId: string) => {
                        void setFieldValue("internalAccountId", accountId);
                        findPennyTestConfigs({
                          variables: {
                            internalAccountIds: [accountId],
                          },
                        })
                          .then(({ data }) => {
                            if (!data) {
                              // Note: we need to clear the message because lazyQuery surfaces
                              // an error in the dispatch even when we catch it below.
                              dispatchClearMessage();
                              setConfigs(null);
                            } else if (data) {
                              setConfigs(
                                data?.pennyTestConfigs as PennyTestConfig[],
                              );
                              void setFieldValue(
                                "configIds",
                                data?.pennyTestConfigs.map(
                                  (config) => config.id,
                                ),
                              );
                            }
                          })
                          .catch(() => {
                            dispatchError("An unknown error has occurred.");
                          });
                      }}
                    />
                    <FormikErrorMessage
                      name="internalAccountId"
                      className="text-xs"
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Receiving Account</Label>
                    <Field
                      component={FormikSelectField}
                      id="receivingAccount"
                      name="receivingAccount"
                      options={
                        externalAccountsData?.pennyTestExternalAccountsSelectOptions ||
                        []
                      }
                      disabled={externalAccountsLoading}
                    />
                    <FormikErrorMessage
                      name="receivingAccount"
                      className="text-xs"
                    />
                  </FieldGroup>
                </FieldsRow>
                <div className="md:mt-0 mt-2 rounded border bg-background-default">
                  <div className="m-4">
                    <p className="mb-2 text-xs text-text-muted">OPTIONS</p>
                    <hr className="mb-3" />
                    <ul className="flex flex-col gap-1 text-sm">
                      {configs && configs.length === 0 && <li>N/A</li>}
                      {isNull(configs) && (
                        <li className="text-xs text-red-400">
                          Sorry! This account is not supported for penny
                          testing.
                        </li>
                      )}
                      {configs &&
                        configs.map((config) => (
                          <li
                            className={cn(
                              "rounded p-2",
                              values.configIds.includes(config.id)
                                ? "border-green-100 bg-green-50 text-green-500"
                                : "border-gray-100 bg-gray-50 text-gray-500",
                            )}
                          >
                            <FieldGroup direction="left-to-right">
                              <Field
                                id={config.id}
                                type="checkbox"
                                name="configIds"
                                value={config.id}
                              />
                              <Label className="flex flex-col" id={config.id}>
                                <p>
                                  <span className="font-medium">1</span>{" "}
                                  {config.prettyType}
                                </p>
                                <p className="mt-1 text-xs">
                                  <span className="font-medium">
                                    Description:
                                  </span>{" "}
                                  &quot;{config.description}&quot;
                                </p>
                              </Label>
                            </FieldGroup>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end py-4">
                  <Button
                    buttonType="primary"
                    isSubmit
                    disabled={isSubmitting || !configs}
                  >
                    Create Penny Tests
                  </Button>
                </div>
              </div>
            }
          />
        </Form>
      )}
    </Formik>
  );
}
