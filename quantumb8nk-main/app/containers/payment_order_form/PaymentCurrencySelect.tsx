// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect } from "react";
import { PaymentFieldProps } from "../../constants/payment_order_form";
import { SelectField } from "../../../common/ui-components";
import {
  AccountCapabilityFragment,
  CurrencyEnum,
  PaymentTypeEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_MAPPING_WITH_CURRENCY } from "~/app/constants";

interface PaymentCurrencyOptions extends PaymentFieldProps {
  options: {
    value: CurrencyEnum;
    label: string;
  }[];
  invalid: boolean;
  id?: string;
  className?: string;
  accountCapabilities?: Array<AccountCapabilityFragment> | null;
  controlClassNames?: string;
  disabled?: boolean;
  onChangeCallback?: (currency: string) => void;
}

function PaymentCurrencySelect({
  options,
  field,
  form,
  invalid,
  id,
  className,
  accountCapabilities,
  controlClassNames,
  disabled = false,
  onChangeCallback,
}: PaymentCurrencyOptions) {
  let filteredOptions = options;

  if (accountCapabilities) {
    if (!accountCapabilities.some((capability) => capability.anyCurrency)) {
      const possibleCurrencies = [
        ...new Set(accountCapabilities.flatMap((cap) => cap.currencies)),
      ];
      filteredOptions = filteredOptions.filter((option) =>
        possibleCurrencies.includes(option.value),
      );
    }
  }

  // Each cross border subtype has 1 valid target currency - the currency of the local rail
  if (
    field.name === "targetCurrency" &&
    !accountCapabilities?.some((capability) => capability.anyCurrency)
  ) {
    const { paymentType, paymentSubtype } = form.values;
    if (paymentType === PaymentTypeEnum.CrossBorder && paymentSubtype) {
      const validCurrency =
        PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_MAPPING_WITH_CURRENCY[
          paymentSubtype
        ].currency;
      filteredOptions = [
        {
          value: validCurrency as CurrencyEnum,
          label: validCurrency,
        },
      ];
    }
  }

  // Check if the option is no longer valid given the account capabilities.
  useEffect(() => {
    if (
      field.value !== undefined ||
      (field.value === undefined && field.name === "targetCurrency")
    ) {
      if (
        filteredOptions.length > 0 &&
        !filteredOptions.find((opt) => opt.value === field.value)
      ) {
        // Default to the first valid filteredOption.
        void form.setFieldValue(field.name, filteredOptions[0]?.value);
      }
    }
  }, [filteredOptions, form, field]);

  return (
    <SelectField
      id={id || undefined}
      options={filteredOptions}
      name={field.name}
      placeholder="Select"
      handleChange={(currency: string) => {
        void form.setFieldValue(field.name, currency);

        if (onChangeCallback) {
          onChangeCallback(currency);
        }
      }}
      isSearchable
      invalid={invalid}
      classes={className || undefined}
      selectValue={
        (form.values[field.name] as string | undefined) || options[0]
      }
      controlClassNames={controlClassNames}
      onFocus={() => form.setFieldTouched(field.name, true)}
      disabled={disabled}
    />
  );
}

export default PaymentCurrencySelect;
