// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { getCurrencyDecimalScale } from "~/common/utilities/sanitizeAmount";
import {
  Icon,
  IndexTable,
  PopoverPanel,
  PopoverTrigger,
  Popover,
  ActionItem,
} from "../../../../common/ui-components";
import { formatSanitizedAmount } from "./InvoiceLineItemModal";
import { InvoiceLineItemFormValues } from "./InvoiceForm/types";

type HeaderType = {
  name: string;
  quantity: string;
  unitAmount: string;
  amount: string;
  description: string;
  actions?: string;
};

function InvoiceFormLineItemTable({
  onRemoveLineItem,
  onEditLineItem,
  lineItems,
  currency,
  disableLineItems,
}: {
  onRemoveLineItem: (index: number) => void;
  onEditLineItem: (index: number) => void;
  lineItems: Array<InvoiceLineItemFormValues>;
  currency: string;
  disableLineItems: boolean;
}) {
  const headers = {
    name: "Item Name",
    quantity: "Quantity",
    unitAmount: "Unit Price",
    amount: "Amount",
    description: "Description",
    actions: "Actions",
  } as HeaderType;
  if (disableLineItems) {
    delete headers.actions;
  }
  return lineItems.length ? (
    <div id="invoiceFormLineItemTable">
      <IndexTable
        dataMapping={headers}
        data={lineItems.map((lineItem, index) => ({
          ...lineItem,
          unitAmount: formatSanitizedAmount(
            currency,
            parseFloat(lineItem.unitAmount || "") *
              10 ** getCurrencyDecimalScale(currency),
            Math.max(
              lineItem.unitAmount?.split(".")[1]?.length || 0,
              getCurrencyDecimalScale(currency),
            ),
          ),
          amount: formatSanitizedAmount(
            currency,
            lineItem.unitAmount && lineItem.quantity
              ? parseFloat(lineItem.unitAmount) *
                  10 ** getCurrencyDecimalScale(currency) *
                  parseInt(lineItem.quantity, 10)
              : null,
          ),
          actions: (
            <Popover display="block">
              <PopoverTrigger
                className="border-none bg-white"
                buttonType="text"
                buttonHeight="small"
                hideFocusOutline
                id="invoiceLineItemActions"
              >
                <div className="z-10 py-0">
                  <Icon
                    iconName="more_horizontal"
                    color="currentColor"
                    className="text-gray-600"
                    size="s"
                  />
                </div>
              </PopoverTrigger>
              <PopoverPanel>
                <ActionItem
                  onClick={() => {
                    onEditLineItem(index);
                  }}
                >
                  Edit
                </ActionItem>
                <ActionItem
                  onClick={() => {
                    onRemoveLineItem(index);
                  }}
                >
                  <div className="text-red-500">Delete</div>
                </ActionItem>
              </PopoverPanel>
            </Popover>
          ),
        }))}
      />
    </div>
  ) : null;
}

export default InvoiceFormLineItemTable;
