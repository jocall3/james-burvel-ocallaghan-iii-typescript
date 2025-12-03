// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { observer } from "mobx-react-lite";
import pluralize from "pluralize";
import SplitViewUIStore from "~/app/stores/reconciliation/split-view/ui-store";
import SplitViewDataStore from "~/app/stores/reconciliation/split-view/data-store";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import {
  useManuallyReconcileExpectedPaymentsMutation,
  useManualUnreconcileTransactablesMutation,
  useUnreconcileTransactionMutation,
  useBulkManuallyReconcileExpectedPaymentsMutation,
} from "~/generated/dashboard/graphqlSchema";
import { formatAmount } from "~/common/utilities/formatAmount";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";
import { cn } from "~/common/utilities/cn";
import { Button } from "../../../../common/ui-components";
import trackEvent from "../../../../common/utilities/trackEvent";
import { SPLIT_RECONCILIATION_ACTIONS } from "../../../../common/constants/analytics";
import useErrorBanner from "../../../../common/utilities/useErrorBanner";
import {
  EXPECTED_PAYMENT,
  TRANSACTION,
} from "~/generated/dashboard/types/resources";
import useQueryParams from "~/app/components/filter/useQueryParams";
import { mapQueryToVariablesExpectedPayments } from "./ExpectedPaymentsTable";
import { mapQueryToVariablesTransactions } from "./TransactionsTable";
import { BigMath } from "~/common/utilities/bigMath";

interface StatisticsProps {
  label: string;
  value: string;
  valueTextColor?: string;
}

function Statistics({ label, value, valueTextColor = "" }: StatisticsProps) {
  return (
    <div className="flex flex-col font-medium ">
      <h1 className="text-right text-xxs">{label}</h1>
      <p className={cn("text-right text-sm", valueTextColor)}>{value}</p>
    </div>
  );
}

function reconcileButtonEnabledForLedgers(
  dataStore: SplitViewDataStore,
  uiStore: SplitViewUIStore,
  balanceReconEnabled: boolean,
): boolean {
  return (
    balanceReconEnabled &&
    dataStore.isLedgerable &&
    !uiStore.showMatchingView &&
    dataStore.selectedExpectedPaymentIds.length === 0
  );
}

function reconcileButtonEnabledForEpRecon(
  dataStore: SplitViewDataStore,
  uiStore: SplitViewUIStore,
): boolean {
  return (
    !dataStore.reconciliationDisabled &&
    dataStore.isReconcilable &&
    !(
      dataStore.manualMatches.some((match) => match.amountToReconcile <= 0) &&
      uiStore.showMatchingView
    )
  );
}

function reconcileButtonDisabled(
  dataStore: SplitViewDataStore,
  uiStore: SplitViewUIStore,
  balanceReconEnabled: boolean,
): boolean {
  return (
    uiStore.loading ||
    !(
      reconcileButtonEnabledForEpRecon(dataStore, uiStore) ||
      reconcileButtonEnabledForLedgers(dataStore, uiStore, balanceReconEnabled)
    )
  );
}

function ReconciliationActionButtons() {
  const flashError = useErrorBanner();

  const [netReconciliationEnabled] = useLiveConfiguration({
    featureName: "reconciliation/net_reconciliation",
  });
  const { ui: uiStore, data: dataStore } = useReconSplitViewStore();
  const {
    selectedCurrency,
    selectedUnreconciledTransactionTotal,
    selectedUnreconciledExpectedPaymentRange,
  } = dataStore;

  React.useEffect(() => {
    dataStore.setNetReconciliationEnabled(Boolean(netReconciliationEnabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netReconciliationEnabled]);

  const [manuallyReconcileExpectedPayments] =
    useManuallyReconcileExpectedPaymentsMutation();
  const [bulkManuallyReconcileExpectedPayments] =
    useBulkManuallyReconcileExpectedPaymentsMutation();
  const [undoTransactionReconciliation] = useUnreconcileTransactionMutation();
  const [unreconcileTransactablesMutation] =
    useManualUnreconcileTransactablesMutation();
  const [balanceReconEnabled] = useLiveConfiguration({
    featureName: "ledgers_balance_recon_enabled",
  });
  const [getFilters] = useQueryParams();
  const onError = (message: string) => {
    uiStore.setLoading(false);
    flashError(message);
  };

  const reconcileDisabled = reconcileButtonDisabled(
    dataStore,
    uiStore,
    Boolean(balanceReconEnabled),
  );

  async function undoAction(
    expectedPaymentIds: string[],
    transactionIds: string[],
  ): Promise<void> {
    const hasManyExpectedPayments =
      expectedPaymentIds.length > 1 && transactionIds.length === 1;

    if (hasManyExpectedPayments) {
      const { data } = await undoTransactionReconciliation({
        variables: {
          input: {
            id: transactionIds[0],
          },
        },
      });

      if (data && data.unreconcileTransaction?.errors?.length === 0) {
        dataStore.setRefresh();
        dataStore.setToast({
          status: "success",
          text: "Successfully unreconciled the transaction",
          durationSeconds: 10,
        });
        dataStore.setSelectedTransactionIds(transactionIds);
        dataStore.setSelectedExpectedPaymentIds(expectedPaymentIds);
      } else {
        flashError("Error unreconciling transaction");
      }

      uiStore.setLoading(false);
      return Promise.resolve();
    }
    const { data } = await unreconcileTransactablesMutation({
      variables: {
        input: {
          transactableIds: expectedPaymentIds,
          transactableType: "ExpectedPayment",
        },
      },
    });

    if (data && data.manualUnreconcileTransactables?.errors?.length === 0) {
      dataStore.setRefresh();
      dataStore.setToast({
        status: "success",
        text: "Successfully unreconciled the expected payment",
        durationSeconds: 10,
      });
      dataStore.setSelectedTransactionIds(transactionIds);
      dataStore.setSelectedExpectedPaymentIds(expectedPaymentIds);
    } else {
      flashError("Error unreconciling expected payment");
    }

    uiStore.setLoading(false);
    return Promise.resolve();
  }

  const formatRange = (min: number | bigint, max: number | bigint) => {
    let formattedRange = "";
    if (min && max) {
      const prettyMin = formatAmount(min, selectedCurrency || "USD");
      const prettyMax = formatAmount(max, selectedCurrency || "USD");

      if (min === max) {
        formattedRange = prettyMin;
      } else {
        formattedRange = `${prettyMin} → ${prettyMax}`;
      }
    }

    return formattedRange;
  };

  const submitReconciliation = async () => {
    trackEvent(null, SPLIT_RECONCILIATION_ACTIONS.RECONCILED_SELECTED_CLICKED);
    uiStore.setLoading(true);

    const {
      selectedTransactionIds: transactionIds,
      selectedExpectedPaymentIds,
    } = dataStore;

    const onUndo = () => {
      void undoAction(selectedExpectedPaymentIds, transactionIds);
      dataStore.setInitialManualMatches();
    };

    const onSuccess = () => {
      let toastText: string;
      if (
        dataStore.selectEverythingTransactions ||
        dataStore.selectEverythingExpectedPayments
      ) {
        toastText =
          "Please refresh the page to see the reconciliation status of this page. Large batch jobs may take longer to fully process.";

        dataStore.setToast({
          status: "success",
          text: toastText,
          durationSeconds: 10,
        });
      } else {
        toastText = `Successfully reconciled ${transactionIds.length}`;
        toastText += ` ${pluralize("transaction", transactionIds.length)}`;
        toastText += ` and ${selectedExpectedPaymentIds.length}`;
        toastText += ` ${pluralize(
          "expected payment",
          selectedExpectedPaymentIds.length,
        )}`;

        dataStore.setToast({
          status: "success",
          text: toastText,
          undoAction: onUndo,
          durationSeconds: 10,
        });
      }

      uiStore.reset();
      dataStore.reset();
      dataStore.setRefresh();
    };

    if (dataStore.selectEverythingTransactions) {
      await dataStore.bulkReconcileExpectedPaymentToManyTransactions(
        bulkManuallyReconcileExpectedPayments,
        mapQueryToVariablesTransactions(
          Boolean(balanceReconEnabled),
          getFilters(TRANSACTION),
        ),
        onSuccess,
        onError,
      );
    } else if (dataStore.selectEverythingExpectedPayments) {
      await dataStore.bulkReconcileTransactionToManyExpectedPayments(
        bulkManuallyReconcileExpectedPayments,
        mapQueryToVariablesExpectedPayments(getFilters(EXPECTED_PAYMENT)),
        onSuccess,
        onError,
      );
    } else {
      await dataStore.reconcileExpectedPayments(
        manuallyReconcileExpectedPayments,
        onSuccess,
        onError,
      );
    }
  };

  const reconciliationAction = (
    <Button
      buttonHeight="small"
      className={
        reconcileButtonEnabledForEpRecon(dataStore, uiStore) &&
        dataStore.selectedItemsWithinRange
          ? "animate-pulse bg-green-500 outline-2 outline-green-500 hover:animate-none hover:bg-green-500"
          : "outline-none"
      }
      buttonType="primary"
      id="reconcile-selected-button"
      disabled={reconcileDisabled}
      onClick={() => {
        // If we're in the split view and the items are in range, reconcile them
        // If we're in the multi-match view, reconcile them
        if (dataStore.selectedItemsWithinRange || uiStore.showMatchingView) {
          void submitReconciliation();
          return;
        }

        if (
          dataStore.selectedTransactionIds.length >= 1 &&
          dataStore.selectedExpectedPaymentIds.length === 0
        ) {
          uiStore.setShowLedgeringModal(true);
          return;
        }

        // when we're outside of the range, show the modal for 1:1, or full page for 1:many
        // handle the 1:1 case first
        if (
          dataStore.selectedTransactionIds.length === 1 &&
          dataStore.selectedExpectedPaymentIds.length === 1
        ) {
          uiStore.setShowConfirmationModal(true);
          return;
        }

        // 1:many case with select all
        if (
          dataStore.selectEverythingExpectedPayments ||
          dataStore.selectEverythingTransactions
        ) {
          void submitReconciliation();
          return;
        }

        // handle the 1:many case by showing the multi-match full-page view
        if (
          dataStore.selectedTransactionIds.length > 1 ||
          dataStore.selectedExpectedPaymentIds.length > 1
        ) {
          dataStore.setInitialManualMatches();
          uiStore.setShowMatchingView(true);
        }
      }}
    >
      {uiStore.loading ? "Reconciling..." : "Reconcile"}
    </Button>
  );

  const { min: expectedPaymentMin, max: expectedPaymentMax } =
    (dataStore.selectEverythingExpectedPayments
      ? dataStore.expectedPaymentsTotalAmountRange
      : dataStore.selectedUnreconciledExpectedPaymentRange) || {};
  const formattedRange = formatRange(expectedPaymentMin, expectedPaymentMax);

  let formatDifference = formatAmount(0, selectedCurrency || "USD");
  let valueTextColor = "text-green-200a";
  const startingTransactionTotal = Math.abs(
    selectedUnreconciledTransactionTotal,
  );
  let difference = dataStore.selectEverythingTransactions
    ? BigMath.abs(dataStore.transactionsTotalAmount)
    : Math.abs(startingTransactionTotal);

  if (
    selectedUnreconciledExpectedPaymentRange ||
    dataStore.selectEverythingExpectedPayments
  ) {
    const transactionTotal = dataStore.selectEverythingTransactions
      ? dataStore.transactionsTotalAmount
      : selectedUnreconciledTransactionTotal;
    const { min: differenceFromMin, max: differenceFromMax } =
      dataStore.differenceBetweenSelectedItems;

    difference = BigMath.max(differenceFromMax, differenceFromMin);

    const withinRange =
      (transactionTotal >= expectedPaymentMin &&
        transactionTotal <= expectedPaymentMax) ||
      false;
    const differenceAmount = withinRange ? 0 : difference;

    valueTextColor = withinRange ? "text-green-200a" : "text-orange-300a";

    if (differenceFromMax !== differenceFromMin) {
      formatDifference = `${formatAmount(
        BigMath.min(differenceFromMax, differenceFromMin),
        selectedCurrency || "USD",
      )} → ${formatAmount(
        BigMath.max(differenceFromMax, differenceFromMin),
        selectedCurrency || "USD",
      )}`;
    } else {
      formatDifference = formatAmount(
        differenceAmount,
        selectedCurrency || "USD",
      );
    }
  } else {
    formatDifference = formatAmount(difference, selectedCurrency || "USD");
  }

  const selectedTransactionTotalFormatted =
    dataStore.selectEverythingTransactions
      ? formatAmount(
          dataStore.transactionsTotalAmount,
          selectedCurrency || "USD",
        )
      : formatAmount(
          dataStore.selectedTransactionTotal,
          selectedCurrency || "USD",
        );

  return (
    <div className="flex flex-row items-center justify-end">
      <div className="flex flex-row items-center justify-center gap-4">
        <Statistics
          label={`TRANSACTIONS (${
            dataStore.selectEverythingTransactions
              ? dataStore.transactionTotalCount
              : dataStore.selectedTransactions.length
          })`}
          value={
            dataStore.selectedTransactionTotal < 0
              ? `(${selectedTransactionTotalFormatted})`
              : selectedTransactionTotalFormatted
          }
        />
        <Statistics
          label={`EXPECTED PAYMENTS (${
            dataStore.selectEverythingExpectedPayments
              ? dataStore.expectedPaymentTotalCount
              : dataStore.selectedExpectedPayments.length
          })`}
          value={
            dataStore.selectEverythingExpectedPayments
              ? formatRange(
                  dataStore.expectedPaymentsTotalAmountRange.min,
                  dataStore.expectedPaymentsTotalAmountRange.max,
                ) ||
                formatAmount(
                  dataStore.expectedPaymentsTotalAmountRange.min,
                  selectedCurrency || "USD",
                )
              : formattedRange ||
                formatAmount(expectedPaymentMin, selectedCurrency || "USD")
          }
        />
        <Statistics
          label="DIFFERENCE"
          value={formatDifference}
          valueTextColor={valueTextColor}
        />
        {uiStore.showMatchingView && (
          <Button
            buttonHeight="small"
            className="flex items-center"
            onClick={() => {
              uiStore.setShowMatchingView(false);
            }}
          >
            Cancel
          </Button>
        )}
        {reconciliationAction}
      </div>
    </div>
  );
}

export default observer(ReconciliationActionButtons);
