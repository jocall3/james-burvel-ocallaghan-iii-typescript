// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import {
  LiveConfigurationView,
  PageHeader,
} from "../../../common/ui-components";
import ReconciliationSplitView from "../internal_account_view/reconciliation/ReconciliationSplitView";
import ReconciliationActionButtons from "../internal_account_view/reconciliation/ReconciliationActionButtons";
import ReconciliationMatching from "../internal_account_view/reconciliation/ReconciliationMatching";
import { parse } from "../../../common/utilities/queryString";
import AccountSelect from "../AccountSelect";
import LedgerBalanceVariance from "../internal_account_view/reconciliation/LedgerBalanceVariance";

const parseInternalAccountIds = (): string[] => {
  const params = parse(window.location.search);
  if (!params.internalAccountIds) return [];
  const parsed = params.internalAccountIds as string;
  const internalAccountIds = parsed ? parsed.split(",") : [];
  return internalAccountIds;
};

function MultiAccountReconciliationPage() {
  const { ui: uiStore, data: dataStore } = useReconSplitViewStore();

  const title = uiStore.showMatchingView ? "Details" : "Reconcile";

  const internalAccountIdsFromUrl = parseInternalAccountIds();
  const [internalAccountIds, setInternalAccountIds] = useState<string[]>(
    internalAccountIdsFromUrl,
  );

  function onAccountSelect(internalAccountId: string) {
    setInternalAccountIds([internalAccountId]);

    const params = parse(window.location.search);
    const ledgerBalanceDateQueryParam = params.ledgerBalanceDate
      ? `&ledgerBalanceDate=${params.ledgerBalanceDate as string}`
      : "";

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?internalAccountIds=${internalAccountId}${ledgerBalanceDateQueryParam}`,
    );

    dataStore.setRefresh();
  }

  return (
    <PageHeader
      theme="experimental__theme--dark"
      title={title}
      fullHeight
      hideBottomBorder
      hideBreadCrumbs
      loading={false}
      left={
        !uiStore.showMatchingView && (
          <div className="flex items-center gap-4">
            <AccountSelect
              theme="experimental__theme--dark"
              onAccountSelect={(value) => {
                onAccountSelect(value);
                dataStore.reset();
              }}
              accountId={internalAccountIds[0]}
              classes="w-full!"
              removeAllAccountsOption
            />
            <LiveConfigurationView
              featureName="ledgers_balance_recon_enabled"
              enabledView={
                !internalAccountIds?.[0] ? null : (
                  <LedgerBalanceVariance
                    internalAccountId={internalAccountIds[0]}
                    refresh={dataStore.refresh}
                  />
                )
              }
              disabledView={null}
            />
          </div>
        )
      }
      right={<ReconciliationActionButtons />}
    >
      {uiStore.showMatchingView ? (
        <ReconciliationMatching />
      ) : (
        <ReconciliationSplitView
          internalAccountIds={internalAccountIds}
          hideReconButtons
        />
      )}
    </PageHeader>
  );
}

export default observer(MultiAccountReconciliationPage);
