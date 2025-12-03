// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import {
  Field,
  Form,
  Formik,
  FormikErrors,
  FormikOnSubmit,
  FormikValidate,
} from "formik";
import React, { useState } from "react";
import {
  FormikErrorMessage,
  FormikSelectField,
} from "../../../../common/formik";
import {
  Button,
  ConfirmModal,
  FieldGroup,
  FormContainer,
  Label,
} from "../../../../common/ui-components";
import { FormValues } from "./types";
import { SelectOption } from "../../../../generated/dashboard/graphqlSchema";
import ConnectionEndpointFlexibleInputsFormSection from "./ConnectionEndpointFlexibleInputsFormSection";

export type Validate = FormikValidate<FormValues>;
export type OnSubmit = FormikOnSubmit<FormValues>;
export type ValidateErrors = FormikErrors<FormValues>;

interface ConnectionEndpointFormProps {
  strategySelectOptions: SelectOption[];
  initialValues: FormValues;
  onSubmit: OnSubmit;
  validate: Validate;
}

function ConnectionEndpointForm({
  strategySelectOptions,
  initialValues,
  onSubmit,
  validate,
}: ConnectionEndpointFormProps) {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const onClickSubmit = () => {
    setIsConfirmationModalOpen(true);
  };

  const onFormikSubmit: OnSubmit = async (values, formikHelpers) => {
    await onSubmit(values, formikHelpers);
    setIsConfirmationModalOpen(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onFormikSubmit}
      validate={validate}
      enableReinitialize
    >
      {({ isSubmitting, isValid, dirty, handleSubmit }) => (
        <FormContainer>
          <Form>
            <FieldGroup>
              <Label id="strategy">Strategy</Label>
              <Field
                id="strategy"
                name="strategy"
                options={strategySelectOptions}
                component={FormikSelectField}
                required
              />
              <FormikErrorMessage name="strategy" />
            </FieldGroup>

            <ConnectionEndpointFlexibleInputsFormSection name="otherInputs" />

            <Button
              buttonType="primary"
              onClick={onClickSubmit}
              disabled={isSubmitting || !isValid || !dirty}
            >
              Create
            </Button>

            <ConfirmModal
              isOpen={isConfirmationModalOpen}
              setIsOpen={setIsConfirmationModalOpen}
              confirmText="Create Connection Endpoint"
              cancelText="Cancel"
              onConfirm={handleSubmit}
              title="Create Connection Endpoint"
            >
              Are you sure you want to create this new Connection Endpoint?
            </ConfirmModal>
          </Form>
        </FormContainer>
      )}
    </Formik>
  );
}

export default ConnectionEndpointForm;
