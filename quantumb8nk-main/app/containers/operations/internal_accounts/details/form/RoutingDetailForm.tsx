// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field } from "formik";
import {
  PaymentTypeEnum,
  RoutingNumberTypeEnum,
} from "~/generated/dashboard/graphqlSchema";
import { makeOptionsFromEnum } from "~/app/utilities/selectUtilities";
import { Label, FieldGroup } from "~/common/ui-components";
import {
  FormikSelectField,
  FormikInputField,
  FormikErrorMessage,
} from "~/common/formik";
import { required } from "../../../../../../common/ui-components/validations";

const PAYMENT_TYPE_HELP_TEXT =
  "Scopes routing detail to 'payment_type'. For example, if 'payment_type' = 'wire', then only wire payments could use this routing detail.";

const ROUTING_NUMBER_TYPE_OPTIONS = makeOptionsFromEnum(RoutingNumberTypeEnum);
const PAYMENT_TYPE_OPTIONS = makeOptionsFromEnum(PaymentTypeEnum);

export const defaultRoutingDetail = {
  routingNumberType: RoutingNumberTypeEnum.Aba,
  paymentType: null,
  routingNumber: "",
};

function RoutingDetailForm() {
  return (
    <div className="flex flex-col gap-y-6">
      <FieldGroup>
        <Label>Routing Number Type</Label>
        <Field
          name="routingNumberType"
          component={FormikSelectField}
          options={ROUTING_NUMBER_TYPE_OPTIONS}
          validate={required}
        />
        <FormikErrorMessage name="routingNumberType" />
      </FieldGroup>
      <FieldGroup>
        <Label>Routing Number</Label>
        <Field
          name="routingNumber"
          component={FormikInputField}
          validate={required}
        />
        <FormikErrorMessage name="routingNumber" />
      </FieldGroup>
      <FieldGroup>
        <Label fieldConditional="Optional" helpText={PAYMENT_TYPE_HELP_TEXT}>
          Payment Type
        </Label>
        <Field
          name="paymentType"
          isClearable
          component={FormikSelectField}
          options={PAYMENT_TYPE_OPTIONS}
        />
        <FormikErrorMessage name="paymentType" />
      </FieldGroup>
    </div>
  );
}

export default RoutingDetailForm;
