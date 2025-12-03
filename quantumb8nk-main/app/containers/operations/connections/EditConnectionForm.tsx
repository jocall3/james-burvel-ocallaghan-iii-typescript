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
} from "../../../../common/formik";
import {
  Button,
  ConfirmModal,
  FieldGroup,
  FieldsRow,
  FormContainer,
  Heading,
  HorizontalRule,
  Label,
} from "../../../../common/ui-components";
import { ConnectionExtraFieldsType } from "../../../../generated/dashboard/graphqlSchema";
import { EditFormValues } from "./types";
import ConnectionExtraField from "./ConnectionExtraField";
import VendorSubscriptionFormSection from "./VendorSubscriptionFormSection";

export type Validate = FormikValidate<EditFormValues>;
export type OnSubmit = FormikOnSubmit<EditFormValues>;
export type ValidateErrors = FormikErrors<EditFormValues>;

interface EditConnectionFormProps {
  initialValues: EditFormValues;
  extraFields: ConnectionExtraFieldsType;
  onSubmit: OnSubmit;
}

function EditConnectionForm({
  initialValues,
  extraFields,
  onSubmit,
}: EditConnectionFormProps) {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const onClickSubmit = () => {
    setIsConfirmationModalOpen(true);
  };

  const onFormikSubmit: OnSubmit = async (values, formikHelpers) => {
    await onSubmit(values, formikHelpers);
    setIsConfirmationModalOpen(false);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onFormikSubmit}>
      {({ values, isSubmitting, isValid, handleSubmit }) => (
        <Form className="grid grid-cols-2 gap-4">
          <FormContainer>
            <FieldsRow columns={1}>
              <FieldGroup>
                <Label
                  id="nickname"
                  helpText="The nickname will replace the default bank name in the app. Maximum 50 characters."
                  fieldConditional="Optional"
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
            <FieldsRow columns={1}>
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

            <FieldsRow columns={1}>
              <FieldGroup>
                <Label disabled id="extra">
                  <Heading level="h2">Extra</Heading>
                </Label>
                <ConnectionExtraField
                  name="extra"
                  fields={extraFields.fields}
                />
                <FormikErrorMessage name="extra" />
              </FieldGroup>
            </FieldsRow>

            <FieldsRow columns={1}>
              <FieldGroup>
                <Label disabled id="connectionEndpoints">
                  <Heading level="h2">Vendor Subscriptions</Heading>
                </Label>
                <HorizontalRule />
                <VendorSubscriptionFormSection
                  connectionEndpoints={values.connectionEndpoints}
                />
              </FieldGroup>
            </FieldsRow>

            <Button
              buttonType="primary"
              onClick={onClickSubmit}
              disabled={isSubmitting || !isValid}
            >
              Save
            </Button>
            <ConfirmModal
              isOpen={isConfirmationModalOpen}
              setIsOpen={setIsConfirmationModalOpen}
              confirmText="Save Changes"
              cancelText="Cancel"
              onConfirm={handleSubmit}
              title="Edit Connection"
            >
              Are you sure you want to edit this Connection?
            </ConfirmModal>
          </FormContainer>
        </Form>
      )}
    </Formik>
  );
}

export default EditConnectionForm;
