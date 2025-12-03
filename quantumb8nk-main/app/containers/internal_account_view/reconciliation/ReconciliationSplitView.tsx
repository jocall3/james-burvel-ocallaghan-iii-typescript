// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { observer } from "mobx-react-lite";
import React from "react";
import {
  AISuggestionCard,
  AITagProps,
} from "~/app/components/AISuggestionsCard";
import ExpectedPaymentsTable, {
  mapQueryToVariablesExpectedPayments,
} from "~/app/containers/internal_account_view/reconciliation/ExpectedPaymentsTable";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import { Layout, Stack } from "~/common/ui-components";
import useErrorBanner from "~/common/utilities/useErrorBanner";
import {
  ExpectedPaymentsTableQuery,
  useBulkManuallyReconcileExpectedPaymentsMutation,
  useManuallyReconcileExpectedPaymentsMutation,
  useManualUnreconcileTransactablesMutation,
  useUnreconcileTransactionMutation,
} from "~/generated/dashboard/graphqlSchema";
import ReconciliationActionButtons from "./ReconciliationActionButtons";
import CreateLedgerTransactionModal from "./CreateLedgerTransactionModal";
import ReconciliationMatchModal from "./ReconciliationMatchModal";
import TransactionsTable, {
  mapQueryToVariablesTransactions,
} from "./TransactionsTable";
import useQueryParams from "~/app/components/filter/useQueryParams";
import {
  EXPECTED_PAYMENT,
  TRANSACTION,
} from "~/generated/dashboard/types/resources";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";

function ReconciliationSplitView({
  internalAccountIds,
  hideReconButtons,
}: {
  internalAccountIds?: string[];
  hideReconButtons?: boolean;
}) {
  const flashError = useErrorBanner();
  const [manuallyReconcileExpectedPayments] =
    useManuallyReconcileExpectedPaymentsMutation();
  const [undoTransactionReconciliation] = useUnreconcileTransactionMutation();
  const [unreconcileTransactablesMutation] =
    useManualUnreconcileTransactablesMutation();
  const [bulkManuallyReconcileExpectedPayments] =
    useBulkManuallyReconcileExpectedPaymentsMutation();
  const [balanceReconEnabledFlag] = useLiveConfiguration({
    featureName: "ledgers_balance_recon_enabled",
  });

  const { ui: uiStore, data: dataStore } = useReconSplitViewStore();
  const { showLedgeringModal, showConfirmationModal } = uiStore;
  const [getFilters] = useQueryParams();

  const {
    selectedTransactionIds,
    suggestedExpectedPayments,
    reconSuggestionsLoading,
    reconcileExpectedPayments,
  } = dataStore;

  async function reconcile(transactableId: string) {
    dataStore.setSelectedExpectedPaymentIds([transactableId]);

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
        } else {
          flashError("Error unreconciling transaction");
        }

        uiStore.setLoading(false);
        return Promise.resolve();
      }
      const { data } = await unreconcileTransactablesMutation({
        variables: {
          input: {
            transactableIds: [transactableId],
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
      } else {
        flashError("Error unreconciling expected payment");
      }

      uiStore.setLoading(false);
      return Promise.resolve();
    }

    const onUndo = () => {
      void undoAction([transactableId], selectedTransactionIds);
      dataStore.setInitialManualMatches();
    };

    const onSuccess = () => {
      const toastText =
        "Successfully reconciled 1 transaction and 1 expected payment";

      uiStore.reset();
      dataStore.reset();
      dataStore.setToast({
        status: "success",
        text: toastText,
        undoAction: onUndo,
        durationSeconds: 10,
      });
      dataStore.setRefresh();
    };

    const onError = (message: string) => {
      uiStore.setLoading(false);
      flashError(message);
    };

    if (dataStore.selectEverythingTransactions) {
      await dataStore.bulkReconcileExpectedPaymentToManyTransactions(
        bulkManuallyReconcileExpectedPayments,
        mapQueryToVariablesTransactions(
          Boolean(balanceReconEnabledFlag),
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
      await reconcileExpectedPayments(
        manuallyReconcileExpectedPayments,
        onSuccess,
        onError,
      );
    }
  }

  const matches = suggestedExpectedPayments.map((suggestedExpectedPayment) => ({
    typename: "ExpectedPayment",
    id: suggestedExpectedPayment.transactableId ?? "",
    path: suggestedExpectedPayment.transactableId
      ? `/expected_payments/${suggestedExpectedPayment.transactableId}`
      : "",
    matches: suggestedExpectedPayment.matches as AITagProps[],
    onClick: async () => {
      const expectedPaymentContainsSuggestion =
        dataStore.expectedPayments.filter(
          (expectedPayment) =>
            expectedPayment.node.id === suggestedExpectedPayment.transactableId,
        );

      if (expectedPaymentContainsSuggestion.length === 0) {
        dataStore.setExpectedPayments([
          ...dataStore.expectedPayments,
          {
            node: suggestedExpectedPayment.transactable,
          } as unknown as ExpectedPaymentsTableQuery["expectedPayments"]["edges"][number],
        ]);
      }

      dataStore.setSelectedExpectedPaymentIds([
        suggestedExpectedPayment.transactableId!,
      ]);

      if (dataStore.selectedItemsWithinRange || uiStore.showMatchingView) {
        await reconcile(suggestedExpectedPayment.transactableId!);
        return;
      }

      if (
        dataStore.selectedTransactionIds.length === 1 &&
        dataStore.selectedExpectedPaymentIds.length === 1
      ) {
        uiStore.setShowConfirmationModal(true);
        return;
      }

      if (
        dataStore.selectedTransactionIds.length > 1 ||
        dataStore.selectedExpectedPaymentIds.length > 1
      ) {
        dataStore.setInitialManualMatches();
        uiStore.setShowMatchingView(true);
      }
    },
  }));

  function renderAISuggestionTitle() {
    if (selectedTransactionIds.length > 1) {
      return "Suggestions are not supported for multiple Transactions";
    }
    if (matches.length === 0 && selectedTransactionIds.length > 0) {
      return "No suggested Expected Payments";
    }
    if (matches.length > 0) {
      return "Suggested Expected Payments";
    }
    return "Select a Transaction to show suggestions";
  }

  let modal: React.ReactNode = null;
  if (showLedgeringModal) {
    modal = <CreateLedgerTransactionModal />;
  } else if (showConfirmationModal) {
    modal = <ReconciliationMatchModal />;
  }

  return (
    <>
      {modal}
      {!hideReconButtons && (
        <div className="mb-6">
          <ReconciliationActionButtons />
        </div>
      )}

      <Layout
        className="h-full"
        primaryContent={
          <TransactionsTable
            internalAccountIds={internalAccountIds}
            disableBulkActions={dataStore.selectEverythingExpectedPayments}
          />
        }
        secondaryContent={
          <Stack
            className="grid-rows-[minmax(36px,min-content)_minmax(100px,_1fr)] gap-7"
            style={{
              height: "calc(100vh - 125px)",
            }}
          >
            <AISuggestionCard
              title={renderAISuggestionTitle()}
              suggestions={matches}
              loading={reconSuggestionsLoading}
            />
            <ExpectedPaymentsTable
              internalAccountIds={internalAccountIds}
              disableBulkActions={dataStore.selectEverythingTransactions}
            />
          </Stack>
        }
        ratio="1/2"
      />
    </>
  );
}

export default observer(ReconciliationSplitView);
