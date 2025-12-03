// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useFormikContext } from "formik";
import ReactTooltip from "react-tooltip";
import { ForeignExchangeAmountEnum } from "~/app/constants";
import { Stack, Toggle } from "../../../common/ui-components";
import { FormValues } from "../../constants/payment_order_form";
import { PaymentTypeEnum } from "~/generated/workflows/graphqlSchema";

function ForeignExchangePaymentToggle() {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  return (
    <Stack className="gap-1">
      <span
        data-tip={
          values.direction === "debit"
            ? "Foreign Exchange Payments are Credit-Only "
            : ""
        }
      >
        <Toggle
          id="foreignExchangePaymentEnabled"
          handleChange={() => {
            if (values.foreignExchangePaymentEnabled) {
              void setFieldValue("foreignExchangeIndicator", undefined);
              void setFieldValue(
                "amountType",
                ForeignExchangeAmountEnum.TargetAmount,
              );
              void setFieldValue("paymentSubtype", undefined);
              void setFieldValue("purpose", undefined);
              void setFieldValue("targetCurrency", undefined);
              void setFieldValue("targetAmount", undefined);
            }

            void setFieldValue(
              "foreignExchangePaymentEnabled",
              !values.foreignExchangePaymentEnabled,
            );
          }}
          checked={values.foreignExchangePaymentEnabled}
          label="Foreign Exchange (FX) Payment"
          labelClassName="text-gray-800 font-medium"
          disabled={
            values.direction === "debit" ||
            values.paymentType === PaymentTypeEnum.CrossBorder
          }
        />
        <p className="ml-9 text-xs text-text-muted">
          If enabled, we will show you additional fields needed to complete a
          cross-border payment.
        </p>
      </span>
      <ReactTooltip
        data-place="bottom"
        place="bottom"
        data-type="dark"
        data-effect="float"
      />
    </Stack>
  );
}

export default ForeignExchangePaymentToggle;
