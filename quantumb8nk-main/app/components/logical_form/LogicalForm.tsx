// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Sentry from "@sentry/browser";
import {
  LogicalForm__ModelNameEnum,
  LogicalFormKeyEnum,
  useSubmitLogicalFormMutation,
  LogicalForm__OperatorEnum,
} from "../../../generated/dashboard/graphqlSchema";
import PropositionComponent from "./PropositionComponent";
import {
  FormValues,
  Data,
  PropositionType,
  validationSchema,
} from "./LogicalTypes";
import {
  Alert,
  Button,
  FormContainer,
  Heading,
} from "../../../common/ui-components";

const FORM_SUBMIT_URL: Record<string, string> = {
  [LogicalForm__ModelNameEnum.PaymentOrder]: "/settings/payments/rules/",
  [LogicalForm__ModelNameEnum.ExternalAccount]: "/settings/payments/rules/",
  [LogicalForm__ModelNameEnum.Reconcilable]: "/reconciliation_rules/",
  [LogicalForm__ModelNameEnum.Transaction]:
    "/settings/transaction_categorization/rules/",
};

interface LogicalFormProps<T> {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  existingInitialValues?: string | null | undefined;
  additionalDefaultInitialValues: T;
  preLogicalCustomComponent?: JSX.Element;
  postLogicalCustomComponent?: JSX.Element;
  entityId: string | null | undefined;
  supportAndOfOrs: boolean;
  supportOrOfAnds: boolean;
  fullWidth: boolean;
  /* When passed in, rule will be associated with an editingSessionId. */
  editingSessionId?: string | null | undefined;
}

// LogicalForm for Approval Rules makes assumptions on levels of nesting and how the
// ands/ors operators work at which level. The old rules were not formatted within logical to
// conform these assumptions such as the 1st level must always be an OR

function convertOldRulesToNewFormat(data: Data) {
  // Check if the data is in the old format
  if (data?.conditions?.operator === LogicalForm__OperatorEnum.And) {
    const { name, approvers } = data;

    // Convert to the new format
    return {
      name,
      approvers,
      conditions: {
        ...data.conditions,
        operator: LogicalForm__OperatorEnum.Or,
        value: [
          {
            negate: data.conditions.negate,
            operator: LogicalForm__OperatorEnum.And,
            value: data.conditions.value,
          },
        ],
      },
    };
  }

  // If data is already in the new format, return as is
  return data;
}

function LogicalForm<T = object>({
  logicalFormKey,
  modelName,
  existingInitialValues,
  additionalDefaultInitialValues,
  preLogicalCustomComponent,
  postLogicalCustomComponent,
  entityId,
  supportAndOfOrs,
  supportOrOfAnds,
  fullWidth,
  editingSessionId,
}: LogicalFormProps<T>): JSX.Element | null {
  const [submitLogicalForm] = useSubmitLogicalFormMutation();
  const [formErrorMessages, setFormErrorMessages] = useState<string[]>([]);

  let initialValues: FormValues<T>;
  if (!existingInitialValues) {
    initialValues = {
      ...additionalDefaultInitialValues,
      conditions: {
        negate: false,
        value: [
          {
            negate: false,
            value: [
              {
                field: undefined,
                operator: undefined,
                negate: undefined,
                value: undefined,
              },
            ],
          },
        ],
      },
    };
  } else {
    const parsedValues = JSON.parse(existingInitialValues) as FormValues<T>;
    initialValues =
      modelName === LogicalForm__ModelNameEnum.PaymentOrder
        ? (convertOldRulesToNewFormat(parsedValues as Data) as FormValues<T>)
        : parsedValues;
  }

  return (
    <>
      {formErrorMessages.map((errorMessage) => (
        <div className="mt-2">
          <Alert alertType="danger">{errorMessage}</Alert>
        </div>
      ))}
      <FormContainer className="max-w-full">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true);

            submitLogicalForm({
              variables: {
                input: {
                  logicalFormKey,
                  modelName,
                  formData: JSON.stringify(values),
                  entityId: entityId ?? null,
                  editingSessionId: editingSessionId ?? null,
                },
              },
            })
              .then((response) => {
                if (response.data?.submitLogicalForm?.errors?.length === 0) {
                  const newEntityId =
                    response.data?.submitLogicalForm?.entityId;
                  if (response.data?.submitLogicalForm?.postSubmitPath) {
                    window.location.href =
                      response.data?.submitLogicalForm?.postSubmitPath;
                  } else {
                    window.location.href = `${FORM_SUBMIT_URL[modelName]}${
                      newEntityId ?? ""
                    }`;
                  }
                } else {
                  setFormErrorMessages(
                    response.data?.submitLogicalForm?.errors ?? [],
                  );
                }
              })
              .catch((error) => {
                setFormErrorMessages(["Sorry, an unexpected error occurred."]);
                Sentry.captureException(error);
              });
            setSubmitting(false);
          }}
        >
          {({ isValid, values }) => {
            const propositionType = values.conditions?.field
              ? PropositionType.Predicate
              : PropositionType.Statement;

            return (
              <Form>
                <div className="max-w-[1600px]">
                  {preLogicalCustomComponent}
                </div>
                <div className={fullWidth ? "max-w-[1600px]" : "max-w-[860px]"}>
                  <Heading level="h3" className="mb-6">
                    Conditions
                  </Heading>
                  <PropositionComponent
                    logicalFormKey={logicalFormKey}
                    modelName={modelName}
                    propositionType={propositionType}
                    formikPath="conditions"
                    supportAndOfOrs={supportAndOfOrs}
                    supportOrOfAnds={supportOrOfAnds}
                  />
                </div>
                <div className="max-w-[860px]">
                  {postLogicalCustomComponent}
                </div>
                <Button buttonType="primary" disabled={!isValid} isSubmit>
                  Submit
                </Button>
              </Form>
            );
          }}
        </Formik>
      </FormContainer>
    </>
  );
}

export default LogicalForm;
