// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import invariant from "ts-invariant";
import { isAddressEmpty } from "../../../common/formik/FormikAddressForm";
import { InvoiceFormValues } from "./form/InvoiceForm/types";

export function formatInvoiceDataForMutation(data: InvoiceFormValues) {
  const { dueDate, paymentEffectiveDate } = data;
  invariant(dueDate, "Due date should always be defined");
  const { priority, ...cleanData } = data;
  return {
    ...cleanData,
    autoAdvance: cleanData.autoAdvance,
    description: cleanData.description || null,
    dueDate: new Date(dueDate).toISOString(),
    paymentEffectiveDate: paymentEffectiveDate
      ? new Date(paymentEffectiveDate).toISOString()
      : null,
    billingAddress: undefined,
    shippingAddress: undefined,
    counterpartyBillingAddress: isAddressEmpty(cleanData.billingAddress)
      ? null
      : cleanData.billingAddress,
    counterpartyShippingAddress: isAddressEmpty(cleanData.shippingAddress)
      ? null
      : cleanData.shippingAddress,
    invoicerAddress: isAddressEmpty(cleanData.invoicerAddress)
      ? null
      : cleanData.invoicerAddress,
    // stephane-mt: We are removing the country code before passing it to the UI. If an invoice
    // had an existing phone number which was unchanged when editing, the country code will be missing
    // from the phone number. Add it back in that case
    issuerPhone:
      cleanData.issuerPhone && cleanData.issuerPhone.length === 10
        ? `1${cleanData.issuerPhone}`
        : cleanData.issuerPhone,
    lineItems: cleanData.lineItems.map((lineItem) => {
      const { unitAmount, quantity, ...cleanLineItem } = lineItem;
      invariant(unitAmount, "Unit amount should always be defined");
      invariant(quantity, "Quantity should always be defined");
      const output = {
        ...cleanLineItem,
        unitAmountDecimal: unitAmount.replace("-", ""),
        quantity: parseInt(quantity, 10),
      };
      delete output.amount;
      return output;
    }),
    remindAfterOverdueDays: cleanData.remindAfterOverdueDays?.map(
      (overdueNotificationDay) => parseInt(overdueNotificationDay, 10),
    ),
  };
}
