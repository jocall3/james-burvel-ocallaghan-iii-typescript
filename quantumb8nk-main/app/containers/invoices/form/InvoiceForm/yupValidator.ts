// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import isEmail from "validator/lib/isEmail";
import isURL from "validator/lib/isURL";
import * as Yup from "yup";

import { InvoiceLineItemFormValues } from "./types";

export default function yupValidator({ paymentFields, amount }) {
  return Yup.object({
    paymentEffectiveDate: paymentFields
      ? Yup.string().nullable().required("Payment Effective Date is required")
      : Yup.string().nullable(),
    receivingAccountId: paymentFields
      ? Yup.string().nullable().required("Receiving Account ID is required")
      : Yup.string().nullable(),
    paymentType: paymentFields
      ? Yup.string().required("Payment Type is required")
      : Yup.string().nullable(),
    originatingAccountId: Yup.string()
      .nullable()
      .required("Originating Account is required"),
    counterpartyId: Yup.string()
      .nullable()
      .required("Counterparty is required"),
    dueDate: Yup.string().nullable().required("Due Date is required"),
    recipientEmail: Yup.string().test(
      "valid-email",
      "Recipient email is not a valid email.",
      (recipientEmail) =>
        !recipientEmail || (!!recipientEmail && isEmail(recipientEmail)),
    ),
    issuerEmail: Yup.string().test(
      "valid-email",
      "Sender email is not a valid email.",
      (issuerEmail) => !issuerEmail || (!!issuerEmail && isEmail(issuerEmail)),
    ),
    issuerWebsite: Yup.string().test(
      "valid-website",
      "Sender website is not a valid website.",
      (issuerWebsite) =>
        !issuerWebsite || (!!issuerWebsite && isURL(issuerWebsite)),
    ),
    autoAdvance: Yup.boolean().when(
      "lineItems",
      (lineItems: Array<InvoiceLineItemFormValues>) => {
        if (lineItems.length === 0 && amount === 0) {
          return Yup.boolean().test(
            "valid-auto-advance",
            "Invoice amount must be non-zero to auto advance an invoice",
            (autoAdvance) => !autoAdvance,
          );
        }
        return Yup.boolean();
      },
    ),
    notificationEmailAddresses: Yup.array(
      Yup.string().email(
        ({ value }: { value: string }) => `${value} is not a valid email.`,
      ),
    ),
  });
}
