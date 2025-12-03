// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ReactTooltip from "react-tooltip";
import { isNumber } from "lodash";
import { getCurrencyDecimalScale } from "~/common/utilities/sanitizeAmount";
import { formatSanitizedAmount } from "./InvoiceLineItemModal";
import { Button, Tooltip, Alert } from "../../../../common/ui-components";
import { InvoiceLineItemFormValues } from "./InvoiceForm/types";

function sumLineItems(
  currency: string,
  lineItems: Array<InvoiceLineItemFormValues>,
) {
  const amount = lineItems.reduce<number>(
    (acc: number, val: InvoiceLineItemFormValues) => {
      // Santize the unit amount to avoid doing math with float numbers
      const unitAmount = val.unitAmount
        ? parseFloat(val.unitAmount) * 10 ** getCurrencyDecimalScale(currency)
        : 0;
      const quantity = val.quantity ? parseInt(val.quantity, 10) : 0;
      const lineItemAmount = unitAmount * quantity;

      return acc + lineItemAmount;
    },
    0,
  );

  return formatSanitizedAmount(currency, amount);
}

function formatAmount(currency: string, amount: string) {
  if (!isNumber(amount[0])) {
    return amount;
  }
  return formatSanitizedAmount(currency, parseFloat(amount));
}

function InvoiceFormSummary({
  lineItems,
  currency,
  isEdit,
  includePaymentFlow,
  autoAdvance,
  amount,
}: {
  lineItems: Array<InvoiceLineItemFormValues>;
  currency: string;
  isEdit: boolean;
  includePaymentFlow: boolean;
  autoAdvance: boolean;
  amount: string | null;
}) {
  return (
    <div className="sticky top-4 mt-4 rounded border bg-background-default mint-lg:mt-0">
      <div className="grid gap-y-2 p-6">
        <div className="mb-2 text-xs text-text-muted">Invoice Summary</div>
        <div className="mb-2 flex items-center">
          <span id="invoiceAmount">
            {amount
              ? formatAmount(currency, amount)
              : sumLineItems(currency, lineItems)}{" "}
            {currency}
          </span>
          <div className="flex pl-2">
            <Tooltip data-tip="The invoice amount is computed by summing each line item." />
            <ReactTooltip
              data-place="top"
              data-type="dark"
              data-effect="float"
              data-html
            />
          </div>
        </div>
        {includePaymentFlow && (
          <Alert alertType="info">
            Payment collection is enabled, the counterparty will be prompted to
            enter their account information.
          </Alert>
        )}
        {autoAdvance && (
          <Alert alertType="info">
            Auto advance is enabled, the invoice will be automatically issued
            upon creation.
          </Alert>
        )}
      </div>
      <hr />
      <div className="flex justify-end px-6 py-4">
        <Button buttonType="primary" isSubmit>
          {isEdit ? "Save Changes" : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}

export default InvoiceFormSummary;
