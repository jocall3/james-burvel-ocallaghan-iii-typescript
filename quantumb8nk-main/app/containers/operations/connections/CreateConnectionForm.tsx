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
  FormikInputField,
  FormikSelectField,
} from "../../../../common/formik";
import {
  Button,
  ConfirmModal,
  FieldGroup,
  FieldsRow,
  Label,
} from "../../../../common/ui-components";
import { SelectOption } from "../../../../generated/dashboard/graphqlSchema";
import { CreateFormValues } from "./types";
import CreateConnectionExtraFormSection from "./CreateConnectionExtraFormSection";

export type Validate = FormikValidate<CreateFormValues>;
export type OnSubmit = FormikOnSubmit<CreateFormValues>;
export type ValidateErrors = FormikErrors<CreateFormValues>;

interface CreateConnectionFormProps {
  entitySelectOptions: SelectOption[];
  initialValues: CreateFormValues;
  onSubmit: OnSubmit;
  validate: Validate;
}

function CreateConnectionForm({
  entitySelectOptions,
  initialValues,
  onSubmit,
  validate,
}: CreateConnectionFormProps) {
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
    >
      {({ values, isSubmitting, isValid, handleSubmit }) => (
        <Form className="grid grid-cols-[minmax(0,2fr),1fr] gap-4">
          <div>
            <FieldsRow columns={2}>
              <FieldGroup>
                <Label id="entity">Entity</Label>
                <Field
                  id="entity"
                  name="entity"
                  options={entitySelectOptions}
                  component={FormikSelectField}
                  required
                />
                <FormikErrorMessage name="entity" />
              </FieldGroup>
            </FieldsRow>
            <FieldsRow columns={2}>
              <FieldGroup>
                <Label id="vendorCustomerId" fieldConditional="Optional">
                  Vendor Customer Id
                </Label>
                <Field
                  id="vendorCustomerId"
                  name="vendorCustomerId"
                  component={FormikInputField}
                />
                <FormikErrorMessage name="vendorCustomerId" />
              </FieldGroup>
            </FieldsRow>
            <FieldsRow columns={2}>
              <FieldGroup>
                <Label
                  id="nickname"
                  fieldConditional="Optional"
                  helpText="The nickname will replace the default bank name in the app. Maximum 50 characters."
                >
                  Nickname
                </Label>
                <Field
                  id="nickname"
                  name="nickname"
                  component={FormikInputField}
                />
                <FormikErrorMessage name="nickname" />
              </FieldGroup>
            </FieldsRow>
            <CreateConnectionExtraFormSection name="extra" />

            <div className="pt-4">
              <Button
                buttonType="primary"
                onClick={onClickSubmit}
                disabled={isSubmitting || !isValid}
              >
                Create
              </Button>
            </div>
          </div>
          <div className="summary-placeholder" />
          <ConfirmModal
            isOpen={isConfirmationModalOpen}
            setIsOpen={setIsConfirmationModalOpen}
            confirmText="Create Connection"
            cancelText="Cancel"
            onConfirm={handleSubmit}
            title="Create Connection"
          >
            {`Are you sure you want to create this new ${values.entity} Connection?`}
          </ConfirmModal>
        </Form>
      )}
    </Formik>
  );
}

export default CreateConnectionForm;
