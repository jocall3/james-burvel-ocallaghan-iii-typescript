// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  InvoiceStatusEnum,
  useInvoiceHeaderViewQuery,
} from "../../../generated/dashboard/graphqlSchema";
import {
  Heading,
  PopoverPanel,
  PopoverTrigger,
  Popover,
  ActionItem,
  Icon,
  LoadingLine,
  CopyableText,
  Clickable,
  Badge,
  BadgeType,
  ButtonClickEventTypes,
} from "../../../common/ui-components";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

function InvoiceViewHeader({
  invoiceId,
  onUpdateInvoiceToUnpaid,
  onVoidInvoice,
  onUpdateInvoiceToPaid,
}: {
  invoiceId: string;
  onUpdateInvoiceToUnpaid: () => void;
  onVoidInvoice: () => void;
  onUpdateInvoiceToPaid: () => void;
}) {
  const { data, loading } = useInvoiceHeaderViewQuery({
    variables: { id: invoiceId },
  });

  // Defining the variable here makes typescript happy for some reason.
  const invoice = data?.invoice;
  const invoicePdfUrl = invoice?.pdfUrl ? invoice.pdfUrl : undefined;

  const actions: Array<React.ReactNode> = [];
  if (invoice?.status === InvoiceStatusEnum.Draft) {
    actions.push(
      <ActionItem
        key="editInvoice"
        onClick={(event: ButtonClickEventTypes) => {
          handleLinkClick(`/invoicing/invoices/${invoiceId}/edit`, event);
        }}
      >
        Edit
      </ActionItem>,
    );
    actions.push(
      <ActionItem key="issueInvoice" onClick={onUpdateInvoiceToUnpaid}>
        Issue invoice
      </ActionItem>,
    );
  }
  if (invoice?.status === InvoiceStatusEnum.Unpaid) {
    actions.push(
      <ActionItem
        key="createInvoice"
        onClick={(event: ButtonClickEventTypes) => {
          handleLinkClick(`/payment_orders/new?invoiceId=${invoiceId}`, event);
        }}
      >
        Issue Payment
      </ActionItem>,
    );
  }
  if (
    invoice?.status &&
    [InvoiceStatusEnum.Draft, InvoiceStatusEnum.Unpaid].includes(invoice.status)
  ) {
    actions.push(
      <ActionItem key="voidInvoice" onClick={onVoidInvoice}>
        Void invoice
      </ActionItem>,
    );
  }
  if (invoice?.status === InvoiceStatusEnum.Unpaid) {
    actions.push(
      <ActionItem key="markInvoiceAsPaid" onClick={onUpdateInvoiceToPaid}>
        Mark as paid
      </ActionItem>,
    );
  }
  if (
    invoice?.originatingAccountId &&
    invoice?.status === InvoiceStatusEnum.Unpaid
  ) {
    actions.push(
      <ActionItem
        key="reconcile"
        onClick={(event: ButtonClickEventTypes) => {
          handleLinkClick(
            `/reconcile?section=overview&internalAccountIds=${invoice.originatingAccountId}&ExpectedPaymentFilters=%257B%2522invoiceId%2522%253A%2522${invoiceId}%2522%252C%2522status%2522%253A%2522unreconciled%2522%257D&TransactionFilters=%257B%2522reconciled%2522%253A%2522unreconciled%2522%257D`,
            event,
          );
        }}
      >
        Reconcile Invoice
      </ActionItem>,
    );
  }
  if (invoicePdfUrl) {
    actions.push(
      <ActionItem
        key="viewPdf"
        onClick={() => {
          window.open(invoicePdfUrl, "_blank");
        }}
      >
        Download PDF
      </ActionItem>,
    );
  }
  const actionButton = actions.length ? (
    <Popover>
      <PopoverTrigger buttonType="primary">
        Actions{" "}
        <Icon
          iconName="chevron_down"
          color="currentColor"
          className="text-white"
        />
      </PopoverTrigger>
      <PopoverPanel
        className="badge-action-dropdown reports-button-panel"
        anchorOrigin={{ horizontal: "right" }}
      >
        {actions}
      </PopoverPanel>
    </Popover>
  ) : null;

  return (
    <div>
      <div className="flex justify-between">
        {loading || !invoice ? (
          <div className="h-6 w-48">
            <LoadingLine />
          </div>
        ) : (
          <div>
            <div className="flex">
              <Heading level="h1">
                <span>Invoice {invoice.number} </span>
              </Heading>
              <div className="pl-2 pt-1">
                <Badge
                  type={
                    invoice.status === InvoiceStatusEnum.Voided
                      ? BadgeType.Warning
                      : BadgeType.Cool
                  }
                  text={invoice.prettyStatus}
                />
              </div>
            </div>
            <div className="flex pt-2 text-gray-600">
              <Clickable
                onClick={() => {
                  // Invoice is guarenteed to exist if this code is running.
                  if (invoice) {
                    window.open(invoice.hostedUrl, "_blank");
                  }
                }}
              >
                <span className="flex items-center pr-3 text-sm">
                  View invoice{" "}
                  <Icon
                    iconName="external_link"
                    size="s"
                    className="ml-1 text-gray-600"
                    color="currentColor"
                  />
                </span>
              </Clickable>
              <CopyableText className="text-sm" text={invoice.hostedUrl}>
                Copy Url
              </CopyableText>
            </div>
          </div>
        )}
        {loading ? (
          <div className="h-6 w-36">
            <LoadingLine />
          </div>
        ) : (
          actionButton
        )}
      </div>
    </div>
  );
}

export default InvoiceViewHeader;
