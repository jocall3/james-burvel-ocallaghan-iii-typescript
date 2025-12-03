// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useHistory } from "react-router-dom";
import { InvoicesHomeDocument } from "../../../generated/dashboard/graphqlSchema";
import { INVOICE } from "../../../generated/dashboard/types/resources";
import ListView from "../../components/ListView";
import {
  ActionItem,
  Icon,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from "../../../common/ui-components";
import {
  getInvoiceSearchComponents,
  mapInvoiceQueryToVariables,
} from "../../../common/search_components/invoiceSearchComponents";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";

function InvoicesHome() {
  const searchComponents = getInvoiceSearchComponents();
  const history = useHistory();

  return (
    <PageHeader
      hideBreadCrumbs
      title="Invoices"
      action={
        <Popover>
          <PopoverTrigger buttonType="primary">
            Create New
            <Icon
              className="text-white"
              iconName="chevron_down"
              size="s"
              color="currentColor"
            />
          </PopoverTrigger>
          <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
            <ActionItem
              onClick={() => {
                history.push("/invoicing/new");
              }}
            >
              <div id="invoice">Invoice</div>
            </ActionItem>
            <ActionItem
              onClick={() => {
                history.push("/invoicing/invoices/bulk_imports/new");
              }}
            >
              <div id="bulk-invoice">Bulk Invoice</div>
            </ActionItem>
          </PopoverPanel>
        </Popover>
      }
    >
      <ListView
        mapQueryToVariables={mapInvoiceQueryToVariables}
        graphqlDocument={InvoicesHomeDocument}
        resource={INVOICE}
        defaultSearchComponents={searchComponents.defaultComponents}
        additionalSearchComponents={searchComponents.additionalComponents}
        enableExportData
      />
    </PageHeader>
  );
}

export default InvoicesHome;
