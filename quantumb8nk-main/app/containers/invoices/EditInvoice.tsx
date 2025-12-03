// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import invariant from "ts-invariant";
import InvoiceForm from "./form/InvoiceForm";
import { InvoiceFormValues } from "./form/InvoiceForm/types";
import {
  useUpsertInvoiceMutation,
  useEditInvoiceQuery,
  EditInvoiceQuery,
  DirectionEnum,
  LedgerAccountSettlement,
} from "../../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../../MessageProvider";
import {
  sanitizeAddress,
  defaultAddress,
  isAddressEmpty,
} from "../../../common/formik/FormikAddressForm";
import { formatInvoiceDataForMutation } from "./utilities";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import { lasToLabel } from "./form/InvoiceForm/utils";

function formatInvoiceDataForForm(
  invoiceData: EditInvoiceQuery,
): InvoiceFormValues {
  const { invoice } = invoiceData;
  invariant(invoice, "Invoice should always be defined");
  return {
    currency: invoice.currency,
    description: invoice.description || "",
    dueDate: invoice.dueDate,
    remindAfterOverdueDays: invoice.remindAfterOverdueDays || [],
    paymentType: invoice.paymentType || null,
    priority: "normal",
    receivingAccountId: invoice.receivingAccountId || "",
    includePaymentFlow: invoice.includePaymentFlow,
    initiatePayment: invoice.initiatePayment,
    paymentEffectiveDate: invoice.paymentEffectiveDate || "",
    fallbackPaymentMethod: invoice.fallbackPaymentMethod || null,
    autoAdvance: false,
    lineItems: invoice.lineItems.map((lineItem) => ({
      id: lineItem.id,
      name: lineItem.name,
      description: lineItem.description || "",
      direction: lineItem.direction,
      quantity: lineItem.quantity,
      unitAmount:
        (lineItem.direction === DirectionEnum.Credit ? "-" : "") +
        lineItem.unitAmountDecimal,
    })),
    originatingAccountId: invoice.originatingAccount.id,
    counterpartyId: invoice.counterparty.id,
    billingAddress: isAddressEmpty(invoice.counterpartyBillingAddress)
      ? { ...defaultAddress }
      : sanitizeAddress(invoice.counterpartyBillingAddress || {}),
    shippingAddress: isAddressEmpty(invoice.counterpartyShippingAddress)
      ? { ...defaultAddress }
      : sanitizeAddress(invoice.counterpartyShippingAddress || {}),
    invoicerAddress: isAddressEmpty(invoice.invoicerAddress)
      ? { ...defaultAddress }
      : sanitizeAddress(invoice.invoicerAddress || {}),
    recipientEmail: invoice.recipientEmail || "",
    recipientName: invoice.recipientName || "",
    issuerEmail: invoice.issuerEmail || "",
    // stephane-mt: Assuming US numbers for now. Remove the country code before passing
    // it into the phone number field
    issuerPhone: invoice.issuerPhone ? invoice.issuerPhone.substring(1) : "",
    issuerWebsite: invoice.issuerWebsite || "",
    csvAttachmentFilename: invoice.csvAttachmentFilename || "",
    csvLink: invoice.csvLink || "",
    notificationsEnabled: invoice.notificationsEnabled || false,
    notificationEmailAddresses:
      invoice.notificationEmailAddresses && invoice.recipientEmail
        ? [invoice.recipientEmail].concat(
            invoice.notificationEmailAddresses.filter(
              (email) => email !== invoice.recipientEmail,
            ),
          )
        : invoice.notificationEmailAddresses || [],
    virtualAccount: invoice.virtualAccount
      ? {
          label: invoice.virtualAccount.fullAccountName,
          value: invoice.virtualAccount.id,
        }
      : null,
    ledgerAccountSettlement: invoice.ledgerAccountSettlement
      ? {
          label: lasToLabel(
            invoice.ledgerAccountSettlement as LedgerAccountSettlement,
          ),
          value: invoice.ledgerAccountSettlement.id,
          amount: invoice.ledgerAccountSettlement.amount || "",
        }
      : null,
  };
}

function EditInvoice({
  match: {
    params: { invoice_id: invoiceId },
  },
}: {
  match: {
    params: {
      invoice_id: string;
    };
  };
}) {
  const { data } = useEditInvoiceQuery({
    variables: { id: invoiceId },
  });

  const initialValues = data?.invoice
    ? formatInvoiceDataForForm(data)
    : undefined;

  const invoiceNumber = data?.invoice?.number;

  const { dispatchError } = useDispatchContext();
  const [upsertInvoice] = useUpsertInvoiceMutation();
  function handleSubmit(formData: InvoiceFormValues) {
    const invoice = formatInvoiceDataForMutation(formData);
    if (formData.ingestLedgerEntries) {
      invoice.lineItems = [];
    }
    upsertInvoice({
      variables: {
        input: {
          invoice,
          id: invoiceId,
        },
      },
    })
      .then((response) => {
        const { errors = [] } = response.data?.upsertInvoice || {};
        if (errors.length) {
          dispatchError(errors.toString());
        } else {
          window.location.href = `/invoicing/invoices/${invoiceId}`;
        }
      })
      .catch(() => dispatchError("Sorry, could not update the invoice"));
  }

  return (
    <PageHeader
      hideBreadCrumbs
      title={`Edit Invoice${invoiceNumber ? ` ${invoiceNumber}` : ""}`}
    >
      {initialValues && (
        <InvoiceForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          isEditing
        />
      )}
    </PageHeader>
  );
}

export default EditInvoice;
