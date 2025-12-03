// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { InternalAccountLedgersDocument } from "~/generated/dashboard/graphqlSchema";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";

import ListView from "~/app/components/ListView";
import { INTERNAL_ACCOUNT_BALANCE_RECON } from "~/generated/dashboard/types/resources";

function InternalAccountLedgers({
  internalAccountId,
  ledgerAccountId,
  overrideRowLinkClickHandler,
}: {
  internalAccountId: string;
  ledgerAccountId?: string | null;
  overrideRowLinkClickHandler?: (url: string) => void;
}): JSX.Element {
  const [balanceReconEnabledFlag] = useLiveConfiguration({
    featureName: "ledgers_balance_recon_enabled",
  });

  const emptyDataRowMsg = ledgerAccountId ? (
    <p>No Entries.</p>
  ) : (
    <p>
      <a
        href="https://docs.moderntreasury.com/ledgers/docs/link-a-ledger-account-to-an-internal-or-external-account"
        target="_blank"
        rel="noreferrer"
      >
        Connect a ledger account
      </a>{" "}
      to reconcile this bank balance to your subledger.
    </p>
  );

  return (
    <ListView
      resource={INTERNAL_ACCOUNT_BALANCE_RECON}
      graphqlDocument={InternalAccountLedgersDocument}
      constantQueryVariables={{ id: internalAccountId }}
      ListViewEmptyState={emptyDataRowMsg}
      displayColumnIdsToFilter={balanceReconEnabledFlag ? [] : ["reason"]}
      customizableColumns={false}
      overrideRowLinkClickHandler={overrideRowLinkClickHandler}
    />
  );
}
export default InternalAccountLedgers;
