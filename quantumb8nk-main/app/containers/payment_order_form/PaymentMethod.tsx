// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { ErrorMessage } from "formik";
import React, { useCallback, useEffect } from "react";
import { cn } from "~/common/utilities/cn";
import { PaymentFieldProps } from "../../constants/payment_order_form";
import { FieldGroup, Label, SelectField } from "../../../common/ui-components";
import {
  PaymentTypeEnum,
  AccountCapabilityFragment,
} from "../../../generated/dashboard/graphqlSchema";

interface PaymentMethodProps extends PaymentFieldProps {
  accountCapabilities?: Array<AccountCapabilityFragment>;
  customPaymentTypeOptions?: PaymentMethodOption[];
  priorityName: string;
}

export interface PaymentMethodOption {
  id: string;
  paymentType: PaymentTypeEnum;
  priority: string;
  label: string;
  value: string;
}

function PaymentMethod({
  field,
  form,
  invalid,
  accountCapabilities,
  customPaymentTypeOptions,
  priorityName,
}: PaymentMethodProps) {
  const currentPaymentType = field.value;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentPriority = form.values[priorityName];

  //  Make sure you also add your payment type to:
  //  - `app/javascript/src/app/constants/index.ts`
  //  - `app/javascript/src/app/containers/payment_order_form/PaymentMethod.tsx`
  //  - `app/models/payment_order.rb
  const paymentTypeOptions: PaymentMethodOption[] =
    customPaymentTypeOptions || [
      {
        id: "ach_normal",
        value: "ach_normal",
        paymentType: PaymentTypeEnum.Ach,
        priority: "normal",
        label: "ACH",
      },
      {
        id: "ach_high",
        value: "ach_high",
        paymentType: PaymentTypeEnum.Ach,
        priority: "high",
        label: "Same-Day ACH",
      },
      {
        id: "rtp_normal",
        value: "rtp_normal",
        paymentType: PaymentTypeEnum.Rtp,
        priority: "normal",
        label: "RTP",
      },
      {
        id: "wire_normal",
        value: "wire_normal",
        paymentType: PaymentTypeEnum.Wire,
        priority: "normal",
        label: "Wire Transfer",
      },
      {
        id: "check_normal",
        value: "check_normal",
        paymentType: PaymentTypeEnum.Check,
        priority: "normal",
        label: "Check (First-Class Mail)",
      },
      {
        id: "chats_normal",
        value: "chats_normal",
        paymentType: PaymentTypeEnum.Chats,
        priority: "normal",
        label: "HK CHATS",
      },
      {
        id: "check_high",
        value: "check_high",
        paymentType: PaymentTypeEnum.Check,
        priority: "high",
        label: "Check (Overnight)",
      },
      {
        id: "book_normal",
        value: "book_normal",
        paymentType: PaymentTypeEnum.Book,
        priority: "normal",
        label: "Book Transfer",
      },
      {
        id: "dk_nets_normal",
        value: "dk_nets_normal",
        paymentType: PaymentTypeEnum.DkNets,
        priority: "normal",
        label: "Danish Nets Credit",
      },
      {
        id: "eft_normal",
        value: "eft_normal",
        paymentType: PaymentTypeEnum.Eft,
        priority: "normal",
        label: "EFT",
      },
      {
        id: "eft_high",
        value: "eft_high",
        paymentType: PaymentTypeEnum.Eft,
        priority: "high",
        label: "High Priority EFT",
      },
      {
        id: "hu_ics_normal",
        value: "hu_ics_normal",
        paymentType: PaymentTypeEnum.HuIcs,
        priority: "normal",
        label: "HU ICS",
      },
      {
        id: "interac_normal",
        value: "interac_normal",
        paymentType: PaymentTypeEnum.Interac,
        priority: "normal",
        label: "Interac e-Transfer",
      },
      {
        id: "masav_normal",
        value: "masav_normal",
        paymentType: PaymentTypeEnum.Masav,
        priority: "normal",
        label: "Masav EFT",
      },
      {
        id: "mx_ccen_normal",
        value: "mx_ccen_normal",
        paymentType: PaymentTypeEnum.MxCcen,
        priority: "normal",
        label: "MX CCEN",
      },
      {
        id: "neft_normal",
        value: "neft_normal",
        paymentType: PaymentTypeEnum.Neft,
        priority: "normal",
        label: "NEFT",
      },
      {
        id: "nics_normal",
        value: "nics_normal",
        paymentType: PaymentTypeEnum.Nics,
        priority: "normal",
        label: "NICS",
      },
      {
        id: "au_becs_normal",
        value: "au_becs_normal",
        paymentType: PaymentTypeEnum.AuBecs,
        priority: "normal",
        label: "AU BECS",
      },
      {
        id: "nz_becs_normal",
        value: "nz_becs_normal",
        paymentType: PaymentTypeEnum.NzBecs,
        priority: "normal",
        label: "NZ BECS",
      },
      {
        id: "pl_elixir_normal",
        value: "pl_elixir_normal",
        paymentType: PaymentTypeEnum.PlElixir,
        priority: "normal",
        label: "PL ELIXIR",
      },
      {
        id: "ro_sent_normal",
        value: "ro_sent_nromal",
        paymentType: PaymentTypeEnum.RoSent,
        priority: "normal",
        label: "RO SENT",
      },
      {
        id: "sg_giro_normal",
        value: "sg_giro_normal",
        paymentType: PaymentTypeEnum.SgGiro,
        priority: "normal",
        label: "SG GIRO",
      },
      {
        id: "sen_normal",
        value: "sen_normal",
        paymentType: PaymentTypeEnum.Sen,
        priority: "normal",
        label: "SEN",
      },
      {
        id: "pl_elixir_normal",
        value: "pl_elixir_normal",
        paymentType: PaymentTypeEnum.PlElixir,
        priority: "normal",
        label: "PL ELIXIR",
      },
      {
        id: "sepa_normal",
        value: "sepa_normal",
        paymentType: PaymentTypeEnum.Sepa,
        priority: "normal",
        label: "SEPA",
      },
      {
        id: "sic_normal",
        value: "sic_normal",
        paymentType: PaymentTypeEnum.Sic,
        priority: "normal",
        label: "SIC",
      },
      {
        id: "bacs_normal",
        value: "bacs_normal",
        paymentType: PaymentTypeEnum.Bacs,
        priority: "normal",
        label: "Bacs",
      },
      {
        id: "signet_normal",
        value: "signet_normal",
        paymentType: PaymentTypeEnum.Signet,
        priority: "normal",
        label: "Signet",
      },
      {
        id: "sknbi",
        value: "sknbi_normal",
        paymentType: PaymentTypeEnum.Sknbi,
        priority: "normal",
        label: "SKNBI",
      },
      {
        id: "provxchange_normal",
        value: "provxchange_normal",
        paymentType: PaymentTypeEnum.Provxchange,
        priority: "normal",
        label: "ProvXchange",
      },
      {
        id: "card_normal",
        value: "card_normal",
        paymentType: PaymentTypeEnum.Card,
        priority: "normal",
        label: "Card",
      },
      {
        id: "cross_border_normal",
        value: "cross_border_normal",
        paymentType: PaymentTypeEnum.CrossBorder,
        priority: "normal",
        label: "Cross Border",
      },
    ];

  const filteredPaymentTypeOptions = () => {
    let availablePaymentTypes: Array<PaymentTypeEnum> = paymentTypeOptions.map(
      ({ paymentType }) => paymentType,
    );

    // Default to AccountCapabilities of selected originating account or Custom options if specified
    if (accountCapabilities) {
      availablePaymentTypes = accountCapabilities.map((cap) => cap.paymentType);
    }

    // Only display payment methods that account capabilities have direction for.
    if (form.values.direction && accountCapabilities) {
      const directionalPaymentTypes = accountCapabilities
        .filter((cap) => cap.direction === form.values.direction)
        .flatMap((capability) => capability.paymentType);
      availablePaymentTypes = availablePaymentTypes.filter((type) =>
        directionalPaymentTypes.includes(type),
      );
    }

    return paymentTypeOptions.filter(({ paymentType }) =>
      availablePaymentTypes.some((t) => paymentType === t),
    );
  };

  const options = filteredPaymentTypeOptions();

  const getSelectValue = useCallback(
    (): PaymentMethodOption | null =>
      options.find(
        (o) =>
          o.paymentType === currentPaymentType &&
          o.priority === currentPriority,
      ) || null,
    [options, currentPaymentType, currentPriority],
  );

  // Check if the option is no longer valid given the account capabilities.
  useEffect(() => {
    if (field.value !== undefined) {
      if (!getSelectValue()) {
        void form.setFieldValue(field.name, undefined);
        void form.setFieldValue(priorityName, undefined);
      }
    }
  }, [getSelectValue, form, field, options, priorityName]);

  return (
    <div className="flex w-full flex-col">
      <FieldGroup>
        <Label className="text-sm font-normal">Payment Method</Label>
        <SelectField
          id="type"
          handleChange={(selectedValue) => {
            const option = paymentTypeOptions.find(
              (paymnetTypeOption) => paymnetTypeOption.value === selectedValue,
            ) as PaymentMethodOption;
            void form.setFieldValue(field.name, option.paymentType);
            void form.setFieldValue(priorityName, option.priority);

            if (option.paymentType === PaymentTypeEnum.CrossBorder) {
              void form.setFieldValue("foreignExchangePaymentEnabled", true);
            }
          }}
          options={options}
          selectValue={getSelectValue()?.value}
          classes={cn("flex-1 w-full react-select-container", {
            "border rounded border-red-500": invalid,
          })}
          name="type"
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

export default PaymentMethod;
