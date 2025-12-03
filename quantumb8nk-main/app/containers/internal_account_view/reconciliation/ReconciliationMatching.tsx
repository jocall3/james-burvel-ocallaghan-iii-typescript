// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { autorun, toJS } from "mobx";
import NumberFormat from "react-number-format";
import pluralize from "pluralize";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import EntityTableView from "~/app/components/EntityTableView";
import ReconciliationContext from "~/app/contexts/ReconciliationContext";
import { getCurrencySymbol } from "~/common/formik/FormikSanitizedCurrencyInput";
import { ToastButton, ToggleRow } from "~/common/ui-components";
import { formatAmount } from "~/common/utilities/formatAmount";
import { getCurrencyDecimalScale } from "~/common/utilities/sanitizeAmount";
import { ManualMatchInput } from "~/generated/dashboard/graphqlSchema";
import { cn } from "~/common/utilities/cn";
import AvailableIndicator from "./AvailableIndicator";

const transactionMapping = {
  prettyCreatedAt: "Created Date",
  amountWithDirection: "Amount",
  prettyAmountUnreconciledToExpectedPayment: "Unreconciled",
  description: "Description",
  prettyType: "Type",
};
const expectedPaymentMapping = {
  prettyDateRange: "Expected Payment Date",
  prettyAmountRange: "Amount",
  prettyAmountUnreconciled: "Unreconciled",
};

function ReconciliationMatching() {
  const { openToast, closeToast } = useContext(ReconciliationContext);
  const { data: dataStore, ui: uiStore } = useReconSplitViewStore();
  const {
    selectedTransactionIds,
    selectedExpectedPaymentIds,
    setSelectedExpectedPaymentIds,
    setSelectedTransactionIds,
    setInitialManualMatches,
    manualMatches,
  } = dataStore;

  // reset the manual matches if the selected items count changes
  autorun(() => {
    const matchesCount = manualMatches.length;
    const selectedItemsCount = Math.max(
      selectedTransactionIds.length,
      selectedExpectedPaymentIds.length,
    );
    if (matchesCount !== selectedItemsCount) {
      setInitialManualMatches();
    }
  });

  const expectedPaymentOnAction = (
    _actionName: string,
    selectedIds: Array<string>,
  ) => {
    if (selectedIds.length === selectedExpectedPaymentIds.length) {
      openToast(
        { status: "error" },
        `Cannot remove all Expected Payments`,
        <ToastButton onClick={closeToast} closeButton />,
        10000,
      );
    } else {
      const oldExpectedPaymentIds = selectedExpectedPaymentIds;
      const filteredIds = selectedExpectedPaymentIds.filter(
        (id) => !selectedIds.includes(id),
      );

      setSelectedExpectedPaymentIds(filteredIds);

      // If there's only one transaction and EP left, show the confirmation modal instead.
      // We don't need the multi-match view anymore.
      if (filteredIds.length === 1 && selectedTransactionIds.length === 1) {
        uiStore.setShowConfirmationModal(true);
        uiStore.setShowMatchingView(false);
      }

      const toastText = `${selectedIds.length} row ${pluralize(
        "item",
        selectedIds.length,
      )} removed`;
      const toastButton = (
        <ToastButton
          onClick={() => {
            setSelectedExpectedPaymentIds(oldExpectedPaymentIds);
          }}
        >
          Undo
        </ToastButton>
      );
      openToast({ status: "success" }, toastText, toastButton, 10000);
    }
  };

  const expectedPaymentActions = () => ({
    Remove: expectedPaymentOnAction,
  });

  const transactionOnAction = (
    _actionName: string,
    selectedIds: Array<string>,
  ) => {
    if (selectedIds.length === selectedTransactionIds.length) {
      // openToast(
      //   { status: "error" },
      //   `Cannot remove all Transactions`,
      //   <ToastButton onClick={closeToast} closeButton />,
      //   10000
      // );
      dataStore.setToast({
        status: "error",
        text: `Cannot remove all Transactions`,
        durationSeconds: 10,
      });
    } else {
      const oldExpectedPaymentIds = selectedTransactionIds;
      const filteredIds = selectedTransactionIds.filter(
        (id) => !selectedIds.includes(id),
      );

      setSelectedTransactionIds(filteredIds);

      // If there's only one transaction and EP left, show the confirmation modal instead.
      // We don't need the multi-match view anymore.
      if (filteredIds.length === 1 && selectedExpectedPaymentIds.length === 1) {
        uiStore.setShowConfirmationModal(true);
        uiStore.setShowMatchingView(false);
      }

      const toastText = `${selectedIds.length} row ${pluralize(
        "item",
        selectedIds.length,
      )} removed`;

      const undoAction = () => {
        setSelectedTransactionIds(oldExpectedPaymentIds);
      };

      dataStore.setToast({
        status: "success",
        text: toastText,
        undoAction,
        durationSeconds: 10,
      });
    }
  };

  const transactionActions = () => ({ Remove: transactionOnAction });

  const onBlur = (
    manualMatch: ManualMatchInput,
    manualMatchIndex: number,
    maxAmount: number,
  ) => {
    // if the user entered an amount that is greater than the max amount,
    // set it to the max amount and show a toast error
    if (manualMatch.amountToReconcile > maxAmount) {
      dataStore.updateManualMatch(manualMatchIndex, {
        amountToReconcile: maxAmount,
      });
      openToast(
        { status: "error" },
        "Amount cannot exceed the available unreconciled amount",
        <ToastButton onClick={closeToast} closeButton />,
      );
    }

    // if the user entered an amount that is less than zero,
    // set it to zero and show a toast error
    if (manualMatch.amountToReconcile <= 0) {
      dataStore.updateManualMatch(manualMatchIndex, {
        amountToReconcile: 0,
      });
      openToast(
        { status: "error" },
        "Amount must be greater than $0.00",
        <ToastButton onClick={closeToast} closeButton />,
      );
    }
  };

  const maxTransactionAmountAvailableToReconcile =
    dataStore.selectedTransactionAmountAvailableToReconcile;
  const maxExpectedPaymentAmountAvailableToReconcile =
    dataStore.selectedExpectedPaymentAmountAvailableToReconcile;

  return (
    <div>
      <div className="rounded-md border border-alpha-black-100 bg-white">
        <div className="flex justify-between p-3">
          <div className="text-base font-medium">
            Bank Transactions ({dataStore.selectedTransactions.length})
          </div>
          {selectedTransactionIds.length > 1 && (
            <AvailableIndicator
              maxTransactionAmount={maxTransactionAmountAvailableToReconcile}
              maxExpectedPaymentAmount={
                maxExpectedPaymentAmountAvailableToReconcile
              }
              manualMatches={toJS(dataStore.manualMatches)}
            />
          )}
        </div>
        <EntityTableView
          className=""
          data={dataStore.selectedTransactions
            .map((item) => ({ ...item.node, path: undefined }))
            .sort((a, b) => {
              const dateA = new Date(a.prettyCreatedAt).getTime();
              const dateB = new Date(b.prettyCreatedAt).getTime();
              return dateB - dateA;
            })}
          dataMapping={transactionMapping}
          styleMapping={{
            date: "font-medium pl-5",
          }}
          showDisabledPagination={false}
          onQueryArgChange={() => Promise.resolve()}
          emptyDataRowText=" "
          disableMetadata
          fullWidth
          actions={transactionActions()}
          enableActions
          actionExcludedRows={
            selectedTransactionIds.length === 1 ? selectedTransactionIds : []
          }
          renderCustomActionsHeader={
            selectedTransactionIds.length > 1
              ? "Amount to Reconcile"
              : undefined
          }
          renderCustomActions={(dataRow: {
            id?: string;
            currency?: string;
            amountUnreconciledToExpectedPayment?: number;
          }) => {
            // Don't show the amount to reconcile input if there's only 1 transaction
            if (selectedTransactionIds.length === 1) return null;

            if (!dataRow || !dataRow?.id) return null;
            const manualMatchIndex = dataStore.manualMatches.findIndex(
              (match) => match.transactionId === dataRow.id,
            );
            const manualMatch =
              manualMatchIndex >= 0
                ? dataStore.manualMatches[manualMatchIndex]
                : null;
            if (!manualMatch) return null;
            const invalidAmount =
              manualMatch.amountToReconcile <= 0 ||
              manualMatch.amountToReconcile >
                Number(dataRow.amountUnreconciledToExpectedPayment);

            return (
              <NumberFormat
                id={`${dataRow?.id}-number_format`}
                className={cn(
                  "h-8 w-28 rounded-sm border px-2 py-1 text-right text-sm placeholder-gray-600 outline-none hover:border-gray-300 focus:border-l focus:border-blue-500 disabled:bg-gray-100",
                  invalidAmount ? "border-red-500" : "border-border-default",
                )}
                fixedDecimalScale
                thousandSeparator
                decimalScale={getCurrencyDecimalScale(dataRow.currency)}
                prefix={getCurrencySymbol(dataRow.currency)}
                allowNegative={false}
                placeholder={`${
                  getCurrencySymbol(dataRow.currency) || ""
                }  0.00`}
                value={formatAmount(Number(manualMatch.amountToReconcile))}
                onValueChange={(values) => {
                  const amountToReconcile = Math.round(
                    Number(values.value) * 100,
                  );
                  // check if we should flip the markExpectedPaymentAsReconciled toggle
                  let markAsReconciled =
                    manualMatch.markExpectedPaymentAsReconciled;
                  if (
                    amountToReconcile <
                    Number(dataRow.amountUnreconciledToExpectedPayment)
                  ) {
                    markAsReconciled = false;
                    if (
                      dataStore.selectedTransactionIds.length === 1 &&
                      dataStore.selectedExpectedPaymentIds.length >= 1
                    ) {
                      dataStore.manualMatches.forEach((_match, index) => {
                        dataStore.updateManualMatch(index, {
                          markExpectedPaymentAsReconciled: markAsReconciled,
                        });
                      });
                    }
                  }
                  dataStore.updateManualMatch(manualMatchIndex, {
                    amountToReconcile,
                    markExpectedPaymentAsReconciled: markAsReconciled,
                  });
                }}
                onBlur={() =>
                  onBlur(
                    manualMatch,
                    manualMatchIndex,
                    Number(dataRow.amountUnreconciledToExpectedPayment),
                  )
                }
              />
            );
          }}
        />
      </div>

      <br />
      <div className="rounded-md border border-alpha-black-100 bg-white">
        <div className="flex justify-between p-3">
          <div className="text-base font-medium">
            Expected Payments ({selectedExpectedPaymentIds.length})
          </div>
          {selectedExpectedPaymentIds.length > 1 && (
            <AvailableIndicator
              maxTransactionAmount={
                dataStore.selectedTransactionAmountAvailableToReconcile
              }
              maxExpectedPaymentAmount={
                dataStore.selectedExpectedPaymentAmountAvailableToReconcile
              }
              manualMatches={toJS(dataStore.manualMatches)}
            />
          )}
        </div>

        <EntityTableView
          loading={false}
          data={dataStore.selectedExpectedPayments
            .map((item) => ({ ...item.node, path: undefined }))
            .sort((a, b) => {
              const dateA = new Date(a.dateLowerBound as string).getTime();
              const dateB = new Date(b.dateLowerBound as string).getTime();
              return dateB - dateA;
            })}
          dataMapping={expectedPaymentMapping}
          fullWidth
          showDisabledPagination={false}
          onQueryArgChange={() => Promise.resolve()}
          emptyDataRowText=" " // so it doesn't show any text while loading
          enableActions
          actions={expectedPaymentActions()}
          actionExcludedRows={
            selectedExpectedPaymentIds.length === 1
              ? selectedExpectedPaymentIds
              : []
          }
          renderCustomActionsHeader="Amount to Reconcile"
          renderCustomActions={(dataRow: {
            id?: string;
            currency?: string;
            amountUnreconciledUpperBound?: number;
            amountUnreconciledLowerBound?: number;
          }) => {
            const {
              id = "123",
              currency = "USD",
              amountUnreconciledUpperBound = 0,
              amountUnreconciledLowerBound = 0,
            } = dataRow;
            const manualMatchIndex = dataStore.manualMatches.findIndex(
              (match) => match.expectedPaymentId === id,
            );
            const manualMatch =
              manualMatchIndex >= 0
                ? dataStore.manualMatches[manualMatchIndex]
                : null;
            if (!manualMatch) return null;
            const amountToReconcile = Number(manualMatch.amountToReconcile);
            const invalidAmount =
              amountToReconcile <= 0 ||
              amountToReconcile > Number(amountUnreconciledUpperBound);
            let { markExpectedPaymentAsReconciled } = manualMatch;
            return (
              <div className="flex flex-row gap-3">
                {dataStore.selectedExpectedPaymentIds.length > 1 && (
                  <NumberFormat
                    id={`${id}-number_format`}
                    className={cn(
                      "h-8 w-28 rounded-sm border px-2 py-1 text-right text-sm placeholder-gray-600 outline-none hover:border-gray-300 focus:border-l focus:border-blue-500 disabled:bg-gray-100",
                      invalidAmount
                        ? "border-red-500"
                        : "border-border-default",
                    )}
                    fixedDecimalScale
                    thousandSeparator
                    decimalScale={getCurrencyDecimalScale(currency)}
                    prefix={getCurrencySymbol(currency)}
                    allowNegative={false}
                    placeholder={`${getCurrencySymbol(currency) || ""}  0.00`}
                    value={formatAmount(Number(manualMatch.amountToReconcile))}
                    onValueChange={(values) => {
                      const newValue = Math.round(Number(values.value) * 100);
                      const lowerBound = Number(amountUnreconciledLowerBound);
                      const upperBound = Number(amountUnreconciledUpperBound);
                      if (newValue < lowerBound) {
                        markExpectedPaymentAsReconciled = false;
                      }
                      if (newValue >= lowerBound && newValue <= upperBound) {
                        markExpectedPaymentAsReconciled = true;
                      }
                      dataStore.updateManualMatch(manualMatchIndex, {
                        amountToReconcile: newValue,
                        markExpectedPaymentAsReconciled,
                      });
                    }}
                    onBlur={() =>
                      onBlur(
                        manualMatch,
                        manualMatchIndex,
                        Number(amountUnreconciledUpperBound),
                      )
                    }
                  />
                )}
                <ToggleRow
                  radios={[
                    {
                      id: `reconcile-${id}`,
                      value: "reconcile",
                      children: "Reconcile",
                      selected: markExpectedPaymentAsReconciled,
                      onChange: () => {
                        const expectedPaymentIds =
                          dataStore.selectedExpectedPaymentIds;
                        const transactionIds = dataStore.selectedTransactionIds;

                        if (
                          expectedPaymentIds.length === 1 &&
                          transactionIds.length > 1
                        ) {
                          dataStore.manualMatches.forEach((match, index) => {
                            dataStore.updateManualMatch(index, {
                              markExpectedPaymentAsReconciled: true,
                            });
                          });
                        } else {
                          dataStore.updateManualMatch(manualMatchIndex, {
                            markExpectedPaymentAsReconciled: true,
                          });
                        }
                      },
                    },
                    {
                      id: `partial-${id}`,
                      value: "partial",
                      children: "Partial",
                      selected: !markExpectedPaymentAsReconciled,
                      disabled:
                        manualMatch.amountToReconcile >=
                        Number(amountUnreconciledUpperBound),
                      disabledToolTipText:
                        "Expected Payments are marked as Reconciled if the allocated Transaction amounts are equal to the Expected Payment amount",
                      onChange: () => {
                        // if there is only 1 EP and Many transactions and this is toggled to "Partial",
                        // we want to update all matches to be "Partial"
                        const expectedPaymentIds =
                          dataStore.selectedExpectedPaymentIds;
                        const transactionIds = dataStore.selectedTransactionIds;

                        if (
                          expectedPaymentIds.length === 1 &&
                          transactionIds.length > 1
                        ) {
                          dataStore.manualMatches.forEach((match, index) => {
                            dataStore.updateManualMatch(index, {
                              markExpectedPaymentAsReconciled: false,
                            });
                          });
                        } else {
                          dataStore.updateManualMatch(manualMatchIndex, {
                            markExpectedPaymentAsReconciled: false,
                          });
                        }
                      },
                    },
                  ]}
                />
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export default observer(ReconciliationMatching);
