// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import invariant from "ts-invariant";
import InvoiceForm from "./form/InvoiceForm";
import { InvoiceFormValues } from "./form/InvoiceForm/types";
import { useUpsertInvoiceMutation } from "../../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../../MessageProvider";
import { formatInvoiceDataForMutation } from "./utilities";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";

function CreateInvoice() {
  const { dispatchError } = useDispatchContext();
  const [upsertInvoice] = useUpsertInvoiceMutation();
  function handleSubmit(data: InvoiceFormValues) {
    upsertInvoice({
      variables: {
        input: {
          invoice: formatInvoiceDataForMutation(data),
        },
      },
    })
      .then((response) => {
        const { errors = [] } = response.data?.upsertInvoice || {};
        if (errors.length) {
          dispatchError(errors.toString());
        } else {
          const invoiceId = response.data?.upsertInvoice?.invoice?.id;
          invariant(
            invoiceId,
            "Invoice should be defined if creating the invoice was successful.",
          );
          window.location.href = `/invoicing/invoices/${invoiceId}`;
        }
      })
      .catch(() => dispatchError("Sorry, could not create invoice"));
  }

  return (
    <PageHeader hideBreadCrumbs title="Create Invoice">
      <InvoiceForm onSubmit={handleSubmit} />
    </PageHeader>
  );
}

export default CreateInvoice;
