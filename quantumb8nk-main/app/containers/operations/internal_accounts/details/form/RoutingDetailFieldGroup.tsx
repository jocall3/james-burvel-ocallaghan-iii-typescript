// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field } from "formik";
import { FormikErrorMessage, FormikInputField } from "~/common/formik";
import { Label, FieldGroup, Button } from "~/common/ui-components";
import { required } from "../../../../../../common/ui-components/validations";
import { RoutingDetailFormValues } from "./FormValues";

interface RoutingDetailFieldGroupProps {
  fieldName: string;
  routingDetail: RoutingDetailFormValues;
  onDelete: () => void;
}

function RoutingDetailFieldGroup({
  fieldName,
  routingDetail: { routingNumberType, paymentType },
  onDelete,
}: RoutingDetailFieldGroupProps) {
  let label: string = routingNumberType;
  if (paymentType) label += ` - ${paymentType}`;

  const validateRoutingNumber = (value) => required(value);

  return (
    <FieldGroup>
      <Label>{label}</Label>
      <Field
        name={fieldName}
        validate={validateRoutingNumber}
        component={FormikInputField}
      />
      <Button buttonType="link" onClick={onDelete} className="w-fit">
        Delete Routing Number
      </Button>
      <FormikErrorMessage name={fieldName} />
    </FieldGroup>
  );
}

export default RoutingDetailFieldGroup;
