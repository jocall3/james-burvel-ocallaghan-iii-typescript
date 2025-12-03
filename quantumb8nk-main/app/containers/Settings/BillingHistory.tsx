// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Button, Icon, LoadingLine } from "../../../common/ui-components";
import {
  BillingInvoice,
  PlanDetails,
} from "../../../generated/dashboard/graphqlSchema";

interface InvoiceListProps {
  invoices: Array<BillingInvoice>;
}

type BillingHistoryProps = {
  loading: boolean;
  ordwaySubscriptionSettings: PlanDetails | null | undefined;
};

function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="mt-4 text-gray-600">
        Your invoices will be listed here after your first billing cycle.
      </div>
    );
  }
  return (
    <div className="divide-y divide-gray-100">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="group grid grid-cols-4 items-center py-1 hover:bg-gray-50"
        >
          <div>{invoice.date}</div>
          <div>{invoice.id}</div>
          <div>{invoice.amount}</div>
          <div className="mr-1 flex justify-self-end transition-all duration-75 ease-in-out mint-md:opacity-0 mint-md:group-hover:opacity-100">
            <Button
              className="!py-1"
              onClick={() => window.open(invoice.pdfUrl, "_blank")?.focus()}
            >
              <Icon iconName="download_to" size="s" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BillingHistory({
  loading,
  ordwaySubscriptionSettings,
}: BillingHistoryProps) {
  const invoices = ordwaySubscriptionSettings?.invoices ?? [];

  return (
    <div className="grid grid-flow-row gap-6">
      <div className="border-b border-gray-100 pb-2">
        <h2 className="text-lg">Invoices</h2>
      </div>
      <div className="divide-y divide-gray-100 text-xs">
        <div className="grid grid-cols-4 pb-2 font-medium text-gray-700">
          <div>Date</div>
          <div>Invoice</div>
          <div>Amount</div>
        </div>
        <div className="grid-rows grid max-h-60 overflow-y-auto">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div
                className="grid h-9 grid-cols-4 items-center py-1"
                key={`loadingLine-${index.toString()}`}
              >
                {Array.from({ length: 3 }).map((__, lineIndex) => (
                  <div className="w-20" key={`line-${lineIndex.toString()}`}>
                    <LoadingLine />
                  </div>
                ))}
              </div>
            ))
          ) : (
            <InvoiceList invoices={invoices} />
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingHistory;
