// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import InternalAccountsTable from "./InternalAccountsTable";
import { OPERATIONAL_STATUSES } from "~/app/constants";

function InternalAccountsHome() {
  return (
    <PageHeader title="Internal Accounts">
      <InternalAccountsTable operationalStatuses={OPERATIONAL_STATUSES} />
    </PageHeader>
  );
}

export default InternalAccountsHome;
