// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { ErrorMessage, Field, useFormikContext } from "formik";
import React from "react";
import Select, { components } from "react-select";
import { cn } from "~/common/utilities/cn";
import { Icon, Input, Label, FieldGroup } from "../../../common/ui-components";
import { required } from "../../../common/ui-components/validations";
import {
  DirectionEnum,
  PaymentSubtypeEnum,
  PaymentTypeEnum,
  useCpaCodesDropdownQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { FormValues } from "../../constants/payment_order_form";
import { fieldInvalid, InputOptions } from "./PaymentOrderCreateUtils";

function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <Icon
        iconName="chevron_down"
        size="m"
        color="currentColor"
        className="text-gray-600"
      />
    </components.DropdownIndicator>
  );
}

// hide the indicator separator that comes default with react-select
// eslint-disable-next-line react/prop-types
function IndicatorSeparator({ innerProps }) {
  return <span className="hidden" {...innerProps} />;
}

function PurposeInputField({ field, form, invalid, id }: InputOptions) {
  return (
    <div className="flex w-full flex-col">
      <FieldGroup>
        <Label className="text-sm font-normal">Purpose Code</Label>
        <Input
          id={id || undefined}
          name={field.name}
          onChange={(event) => {
            void form.setFieldValue(field.name, event.target.value);
          }}
          value={field.value}
          invalid={invalid}
        />
      </FieldGroup>
    </div>
  );
}

interface CpaCodeOption {
  value: string;
  label: string;
}

function CpaCodesDropdown({ field, form, invalid, id }: InputOptions) {
  const {
    values: { direction },
  } = useFormikContext<FormValues>();
  const { data } = useCpaCodesDropdownQuery({
    variables: { direction: (direction as DirectionEnum) || null },
  });
  const dropdownOptions = data?.cpaCodes.map(({ code, description }) => ({
    value: code,
    label: `${code} ${description}`,
  }));

  return (
    <div className="flex w-full flex-col">
      <FieldGroup>
        <Label className="text-sm font-normal">CPA Code</Label>
        <Select
          id={id || undefined}
          aria-label={field.name}
          onChange={(option: CpaCodeOption) => {
            void form.setFieldValue(field.name, option.value);
          }}
          options={dropdownOptions}
          selectValue={field.value}
          classNamePrefix="react-select"
          className={cn("react-select-container flex-1", {
            "rounded border border-red-500": invalid,
          })}
          components={{
            DropdownIndicator,
            IndicatorSeparator,
          }}
          placeholder="Select"
        />
        <ErrorMessage
          name={field.name}
          component="span"
          className="mt-1 text-xs text-text-critical"
        />
      </FieldGroup>
    </div>
  );
}

function PurposeField() {
  const {
    values: { paymentType, paymentSubtype, foreignExchangePaymentEnabled },
    errors,
    touched,
  } = useFormikContext<FormValues>();
  if (
    paymentType === PaymentTypeEnum.Eft ||
    paymentSubtype === PaymentSubtypeEnum.Eft
  ) {
    return (
      <Field
        id="purpose"
        name="purpose"
        component={CpaCodesDropdown}
        validate={required}
        invalid={fieldInvalid(errors, touched, "purpose")}
      />
    );
  }
  if (
    paymentType === PaymentTypeEnum.CrossBorder ||
    paymentType === PaymentTypeEnum.Wire ||
    foreignExchangePaymentEnabled
  ) {
    return (
      <Field
        id="purpose"
        name="purpose"
        component={PurposeInputField}
        invalid={fieldInvalid(errors, touched, "purpose")}
      />
    );
  }
  return null;
}

export default PurposeField;
