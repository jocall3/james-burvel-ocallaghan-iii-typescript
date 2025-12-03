// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { VirtualAccountSettingFormValues } from "./FormValues";
import { VirtualAccountSettingAllocationTypeEnum } from "~/generated/dashboard/graphqlSchema";
import {
  FieldGroup,
  FieldsRow,
  FormContainer,
  Label,
} from "~/common/ui-components";
import { required } from "../../../../../../common/ui-components/validations";
import { makeOptionsFromEnum } from "~/app/utilities/selectUtilities";
import {
  FormikErrorMessage,
  FormikInputField,
  FormikNumberFormatField,
  FormikSelectField,
} from "~/common/formik";
import VirtualAccountSettingFormSummary from "./VirtualAccountSettingFormSummary";
import { OptionType } from "~/common/formik/FormikSelectField";
import {
  isAllocationIdentifierRequired,
  isAllocationRangeRequired,
} from "./utilities";

const VALIDATION_SCHEMA = Yup.object({
  allocationLength: Yup.number(),
  allocationIdentifier: Yup.string().when("allocationType", {
    is: (allocationType: VirtualAccountSettingAllocationTypeEnum) =>
      isAllocationIdentifierRequired(allocationType),
    then: Yup.string().required(
      "Required for 'prefix', 'suffix', or 'id' based settings",
    ),
  }),
  allocationRangeStart: Yup.string().when("allocationType", {
    is: (allocationType: VirtualAccountSettingAllocationTypeEnum) =>
      isAllocationRangeRequired(allocationType),
    then: Yup.string().required("Required for 'range' based settings"),
  }),
  allocationRangeEnd: Yup.string().when("allocationType", {
    is: (allocationType: VirtualAccountSettingAllocationTypeEnum) =>
      isAllocationRangeRequired(allocationType),
    then: Yup.string().required("Required for 'range' based settings"),
  }),
});

const ALLOCATION_TYPE_OPTIONS = makeOptionsFromEnum(
  VirtualAccountSettingAllocationTypeEnum,
);

const DEFAULT_INITIAL_VALUES: VirtualAccountSettingFormValues = {
  allocationType: VirtualAccountSettingAllocationTypeEnum.Range,
};

interface InternalAccount {
  bestName: string;
}

interface AccountCapabilityFormProps {
  initialValues?: VirtualAccountSettingFormValues;
  onSubmit: (data: VirtualAccountSettingFormValues) => Promise<void>;
  internalAccount: InternalAccount;
  isEdit?: boolean;
}

export default function VirtualAccountSettingForm({
  initialValues = DEFAULT_INITIAL_VALUES,
  onSubmit,
  internalAccount,
  isEdit = false,
}: AccountCapabilityFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={onSubmit}
      validateOnMount
    >
      {({ values, isSubmitting, isValid, resetForm }) => (
        <Form className="grid grid-cols-[minmax(0,2fr),1fr] gap-4">
          <FormContainer>
            <FieldsRow columns={2}>
              <FieldGroup>
                <Label helpText="Type of Virtual Account Setting">
                  Allocation Type
                </Label>
                <Field
                  name="allocationType"
                  component={FormikSelectField}
                  options={ALLOCATION_TYPE_OPTIONS}
                  validate={required}
                  onChange={(option: OptionType | null) => {
                    resetForm({
                      values: {
                        ...DEFAULT_INITIAL_VALUES,
                        allocationType:
                          (option?.value as VirtualAccountSettingAllocationTypeEnum) ||
                          VirtualAccountSettingAllocationTypeEnum.Range,
                      },
                    });
                  }}
                  isDisabled={isEdit}
                />
                <FormikErrorMessage name="allocationType" />
              </FieldGroup>
              <FieldGroup>
                <Label>Allocation Length</Label>
                <Field
                  name="allocationLength"
                  component={FormikNumberFormatField}
                />
                <FormikErrorMessage name="allocationLength" />
              </FieldGroup>
            </FieldsRow>
            {isAllocationIdentifierRequired(values.allocationType) && (
              <FieldsRow>
                <FieldGroup>
                  <Label>Allocation Identifier</Label>
                  <Field
                    name="allocationIdentifier"
                    component={FormikInputField}
                  />
                  <FormikErrorMessage name="allocationIdentifier" />
                </FieldGroup>
              </FieldsRow>
            )}
            {isAllocationRangeRequired(values.allocationType) && (
              <FieldsRow columns={2}>
                <FieldGroup>
                  <Label>Allocation Range Start</Label>
                  <Field
                    name="allocationRangeStart"
                    component={FormikInputField}
                  />
                  <FormikErrorMessage name="allocationRangeStart" />
                </FieldGroup>
                <FieldGroup>
                  <Label>Allocation Range End</Label>
                  <Field
                    name="allocationRangeEnd"
                    component={FormikInputField}
                  />
                  <FormikErrorMessage name="allocationRangeEnd" />
                </FieldGroup>
              </FieldsRow>
            )}
          </FormContainer>

          <VirtualAccountSettingFormSummary
            isEdit={isEdit}
            submitDisabled={isSubmitting || !isValid}
            internalAccount={internalAccount}
          />
        </Form>
      )}
    </Formik>
  );
}
