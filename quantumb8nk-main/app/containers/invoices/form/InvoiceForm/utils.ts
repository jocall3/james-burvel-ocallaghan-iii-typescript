// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { FormikErrors, FormikTouched, getIn } from "formik";
import { InvoiceFormValues } from "./types";
import {
  PaymentTypeEnum,
  LedgerAccountSettlement,
} from "../../../../../generated/dashboard/graphqlSchema";
import { PaymentMethodOption } from "../../../payment_order_form/PaymentMethod";

export const fieldInvalid = (
  errors: FormikErrors<InvoiceFormValues>,
  touched: FormikTouched<InvoiceFormValues>,
  fieldName: string,
) => (getIn(errors, fieldName) && getIn(touched, fieldName)) as boolean;

export const FALLBACK_PAYMENT_METHODS = [
  { label: "Payment Collection", value: "ui" },
  { label: "Manual", value: "manual" },
];

export const paymentOptions: PaymentMethodOption[] = [
  {
    id: "ach_normal",
    value: "ach_normal",
    paymentType: PaymentTypeEnum.Ach,
    priority: "normal",
    label: "ACH",
  },
  {
    id: "eft_normal",
    value: "eft_normal",
    paymentType: PaymentTypeEnum.Eft,
    priority: "normal",
    label: "EFT",
  },
];

export function lasToLabel(las: LedgerAccountSettlement) {
  return `(${las.amount || ""}) ${las.settledLedgerAccount.name} -> ${
    las.contraLedgerAccount.name
  }`;
}
