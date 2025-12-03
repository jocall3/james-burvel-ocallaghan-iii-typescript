// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, Form, Formik, FormikState } from "formik";
import * as Yup from "yup";

import { ConnectionEndpointFormValues } from "./FormValues";
import { FieldGroup, FieldsRow, Label } from "~/common/ui-components";
import { FormikErrorMessage, FormikSelectField } from "~/common/formik";
import ConnectionEndpointFormSummary from "~/app/containers/operations/connections/connection_endpoints/form/ConnectionEndpointFormSummary";
import { ConnectionEndpointTemplate } from "~/generated/dashboard/graphqlSchema";
import ConnectionEndpointFormFieldsForTemplate from "~/app/containers/operations/connections/connection_endpoints/form/ConnectionEndpointFormFieldsForTemplate";
import { OptionType } from "~/common/formik/FormikSelectField";
import { templateInitialValues } from "~/app/containers/operations/connections/connection_endpoints/form/utilities";

const DEFAULT_INITIAL_VALUES: ConnectionEndpointFormValues = {
  connectionEndpointTemplateId: null,
  label: null,
  protocol: null,
  port: "",
  host: "",
  username: "",
  password: "",
  allowInboundRequests: [],
  cleanAfterRead: [],
  authenticationStrategy: null,
  decryption_options: {},
  encryptionStrategy: null,
  encryptionKey: "",
  signingStrategy: null,
  decryptionStrategy: null,
  inboundAuthenticationStrategy: null,
  authentication_options: {},
};

const VALIDATION_SCHEMA = Yup.object({
  connectionEndpointTemplateId: Yup.string().required(),
  label: Yup.string().required(),
  protocol: Yup.string().required(),
  host: Yup.string().required(),
  authenticationStrategy: Yup.string().required(),
});

interface ConnectionEndpointFormProps {
  initialFormValues?: ConnectionEndpointFormValues;
  onSubmit: (data: ConnectionEndpointFormValues) => Promise<void>;
  isEdit: boolean;
  templates: ConnectionEndpointTemplate[];
}

function ConnectionEndpointForm({
  initialFormValues = DEFAULT_INITIAL_VALUES,
  onSubmit,
  isEdit = false,
  templates,
}: ConnectionEndpointFormProps) {
  const [initialValues, setInitialValues] = React.useState(initialFormValues);

  const handleTemplateChange = (
    option: OptionType,
    resetForm: (
      nextState?: Partial<FormikState<ConnectionEndpointFormValues>>,
    ) => void,
  ) => {
    const currentTemplate = templates.find(
      (template) => template.id === option.value,
    );

    const nextInitialValues = currentTemplate
      ? templateInitialValues(currentTemplate)
      : initialFormValues;

    setInitialValues(nextInitialValues);
    resetForm({ values: nextInitialValues });
  };

  const templateOptions = templates.map((template) => ({
    label: template.id,
    value: template.id,
  }));

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
      enableReinitialize
      validateOnMount
    >
      {({ values, isSubmitting, isValid, resetForm, errors }) => {
        const currentTemplate = templates.find(
          (template) => template.id === values.connectionEndpointTemplateId,
        );

        return (
          <Form className="grid grid-cols-[minmax(0,2fr),1fr] gap-4">
            <div>
              <FieldsRow>
                <FieldGroup>
                  <Label>Connection Endpoint Template</Label>
                  <Field
                    name="connectionEndpointTemplateId"
                    options={templateOptions}
                    component={FormikSelectField}
                    onChange={(option: OptionType): void => {
                      handleTemplateChange(option, resetForm);
                    }}
                  />
                  <FormikErrorMessage name="connectionEndpointTemplateId" />
                </FieldGroup>
              </FieldsRow>

              {currentTemplate && (
                <ConnectionEndpointFormFieldsForTemplate
                  connectionEndpointTemplate={currentTemplate}
                />
              )}
            </div>
            <ConnectionEndpointFormSummary
              submitDisabled={isSubmitting || !isValid}
              isEdit={isEdit}
              currentTemplate={currentTemplate}
              values={values}
              errors={errors}
            />
          </Form>
        );
      }}
    </Formik>
  );
}

export default ConnectionEndpointForm;
