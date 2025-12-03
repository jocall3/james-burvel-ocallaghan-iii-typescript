// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import pluralize from "pluralize";
import { observer } from "mobx-react-lite";
import SplitViewDataStore from "~/app/stores/reconciliation/split-view/data-store";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import {
  useCreateTransactionMutation,
  useDeleteTransactionMutation,
  useManuallyReconcileExpectedPaymentsMutation,
  useManualUnreconcileTransactablesMutation,
  useUnreconcileTransactionMutation,
} from "~/generated/dashboard/graphqlSchema";
import { Button } from "../../../../common/ui-components";
import trackEvent from "../../../../common/utilities/trackEvent";
import { SPLIT_RECONCILIATION_ACTIONS } from "../../../../common/constants/analytics";
import useErrorBanner from "../../../../common/utilities/useErrorBanner";

function createAndReconcileTransactionButtonEnabled(
  dataStore: SplitViewDataStore,
): boolean {
  return (
    dataStore.selectedTransactionIds.length === 0 &&
    dataStore.selectedExpectedPaymentIds.length > 0
  );
}

function CreateTransactionButton() {
  const flashError = useErrorBanner();
  const [createTransaction] = useCreateTransactionMutation();
  const [manuallyReconcileExpectedPayments] =
    useManuallyReconcileExpectedPaymentsMutation();
  const { ui: uiStore, data: dataStore } = useReconSplitViewStore();
  const [undoTransactionReconciliation] = useUnreconcileTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [unreconcileTransactablesMutation] =
    useManualUnreconcileTransactablesMutation();

  const deleteTransactionFunction = async (
    expectedPaymentIds: string[],
    transactionId: string,
  ) => {
    const { data } = await deleteTransaction({
      variables: {
        input: {
          id: transactionId,
        },
      },
    });
    if (data && data.deleteTransaction?.errors?.length === 0) {
      dataStore.setRefresh();
      dataStore.setToast({
        status: "success",
        text: (
          <>
            Successfully unreconciled and deleted the{" "}
            <a href={`/transactions/${transactionId}`}>transaction</a>{" "}
          </>
        ),
        durationSeconds: 10,
      });
      dataStore.setSelectedTransactionIds([]);
      dataStore.setSelectedExpectedPaymentIds(expectedPaymentIds);
    } else {
      flashError("Error unreconciling transaction");
    }
  };

  async function undoAction(
    expectedPaymentIds: string[],
    transactionId: string,
  ): Promise<void> {
    const hasManyExpectedPayments = expectedPaymentIds.length > 1;

    if (hasManyExpectedPayments) {
      const { data } = await undoTransactionReconciliation({
        variables: {
          input: {
            id: transactionId,
          },
        },
      });

      if (data && data.unreconcileTransaction?.errors?.length === 0) {
        await deleteTransactionFunction(expectedPaymentIds, transactionId);
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
      await deleteTransactionFunction(expectedPaymentIds, transactionId);
    } else {
      flashError("Error unreconciling expected payment");
    }

    uiStore.setLoading(false);
    return Promise.resolve();
  }

  const createTransactionAndReconcile = async () => {
    trackEvent(null, SPLIT_RECONCILIATION_ACTIONS.RECONCILED_SELECTED_CLICKED);
    uiStore.setLoading(true);

    const onUndo = (expectedPaymentIds: string[], transactionId: string) => {
      dataStore.setRefresh();
      void undoAction(expectedPaymentIds, transactionId);
      dataStore.setInitialManualMatches();
    };

    const onSuccess = () => {
      dataStore.setRefresh();
      const {
        selectedTransactionIds: createdTransactionIds,
        selectedExpectedPaymentIds: reconciledExpectedPaymentIds,
      } = dataStore;
      const beginningToastText = `Successfully created and reconciled ${createdTransactionIds.length}`;
      let endToastText = ` and ${reconciledExpectedPaymentIds.length}`;
      endToastText += ` ${pluralize(
        "expected payment",
        reconciledExpectedPaymentIds.length,
      )}`;

      uiStore.reset();
      dataStore.reset();
      dataStore.setToast({
        status: "success",
        text: (
          <>
            {beginningToastText}{" "}
            <a href={`/transactions/${createdTransactionIds[0]}`}>
              transaction
            </a>{" "}
            {endToastText}
          </>
        ),
        undoAction: () =>
          onUndo(reconciledExpectedPaymentIds, createdTransactionIds[0]),
        durationSeconds: 10,
      });
      dataStore.setRefresh();
    };

    const onError = (message: string) => {
      uiStore.setLoading(false);
      flashError(message);
    };

    await dataStore.createAndReconcileTransaction(
      createTransaction,
      manuallyReconcileExpectedPayments,
      onSuccess,
      onError,
    );
  };

  return (
    <Button
      id="create-transaction-and-reconcile-button"
      buttonHeight="small"
      disabled={!createAndReconcileTransactionButtonEnabled(dataStore)}
      onClick={() => {
        void createTransactionAndReconcile();
      }}
    >
      {uiStore.loading ? "Creating Transaction..." : "Create Transaction"}
    </Button>
  );
}

export default observer(CreateTransactionButton);
