// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useToast } from "@chakra-ui/react";
import { isEqual, map, reject } from "lodash";
import pluralize from "pluralize";
import { useToggle } from "~/common/utilities/useToggle";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import sanitizeAmount, {
  getCurrencyDecimalScale,
} from "~/common/utilities/sanitizeAmount";
import { Toast, ToastButton, ToastPanel } from "../../../common/ui-components";
import ReconciliationContext, {
  ReconciliationState,
  Transactable,
  Transaction,
} from "../../contexts/ReconciliationContext";
import useErrorBanner from "../../../common/utilities/useErrorBanner";
import trackEvent from "../../../common/utilities/trackEvent";
import { SPLIT_RECONCILIATION_ACTIONS } from "../../../common/constants/analytics";
import {
  useInternalToolsVisibilityQuery,
  useManualUnreconcileTransactablesMutation,
  useReconcileTransactablesMutation,
  useUnreconcileTransactionMutation,
  useMultipleTransactionsToOneExpectedPaymentMutation,
  useGenerateExpectedPaymentReconSuggestionsMutation,
  ReconciliationSuggestion,
} from "../../../generated/dashboard/graphqlSchema";

interface Props {
  children: React.ReactNode;
  internalAccountId?: string;
}

export interface ManyToOneMatchingViewInput {
  [key: string]: {
    userInputAmount: number;
    originalAmount: number;
  };
}

export interface OneToManyMatchingViewInput {
  [key: string]: {
    userInputAmount: number;
    reconcile: "reconcile" | "partial";
    originalAmount: number;
  };
}

export interface OneToOne {
  expectedPaymentId: string;
  markExpectedPaymentAsReconciled: boolean;
  amountToReconcile: number;
}

export const TOAST_DURATION = 10000;

function ReconciliationContextProvider({ children, ...props }: Props) {
  const toast = useToast();
  const flashError = useErrorBanner();

  // == UI State ==
  // These are all the UI state values that are used in the reconciliation split view
  const showTransactables = useInternalToolsVisibilityQuery().data
    ?.internalToolsVisibility as boolean;
  const [reconciled, setReconciled] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [manualReasonRequired, setManualReasonRequired] =
    useState<boolean>(false);
  // This will eventually come from a filter
  const [internalAccountId] = useState<string | undefined>(
    props.internalAccountId,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionTotalCount, setTransactionTotalCount] = useState<number>(0);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    string[]
  >([]);
  const [selectedTransactableAccountIds, setSelectedTransactableAccountIds] =
    useState<Set<string>>(new Set([]));
  const [selectedTransactionAccountIds, setSelectedTransactionAccountIds] =
    useState<Set<string>>(new Set([]));
  const [selectedTransactableDirections, setSelectedTransactableDirections] =
    useState<Set<string>>(new Set([]));
  const [selectedTransactionDirections, setSelectedTransactionDirections] =
    useState<Set<string>>(new Set([]));
  const [transactables, setTransactables] = useState<Transactable[]>([]);
  const [transactablesWithSuggestions, setTransactablesWithSuggestions] =
    useState<Transactable[]>([]);
  const [transactableTotalCount, setTransactableTotalCount] =
    useState<number>(0);
  const [selectedTransactableIds, setSelectedTransactableIds] = useState<
    string[]
  >([]);
  const transactableType = "ExpectedPayment";
  const [selectedTransactionSum, setSelectedTransactionSum] =
    useState<number>(0);
  const [hasSelectedEPWithRange, setHasSelectedEPWithRange] =
    useState<boolean>(false);
  const [reconSuggestions, setReconSuggestions] = useState<
    ReconciliationSuggestion[]
  >([]);
  const [reconSuggestionsLoading, setReconSuggestionsLoading] = useState(false);
  const [selectedTransactionTotal, setSelectedTransactionTotal] =
    useState<number>(0);
  const [
    selectedReconciledTransactionTotal,
    setSelectedReconciledTransactionTotal,
  ] = useState<number>(0);
  const [
    selectedUnreconciledTransactionTotal,
    setUnreconciledSelectedTransactionTotal,
  ] = useState<number>(0);
  const [selectedTransactableTotal, setSelectedTransactableTotal] =
    useState<number>(0);
  const [selectedTransactableRange, setSelectedTransactableRange] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 0 });
  const [
    selectedUnreconciledTransactableRange,
    setSelectedUnreconciledTransactableRange,
  ] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 0 });
  const [selectedAmountsMatch, setSelectedAmountsMatch] =
    useState<boolean>(false);
  const [selectedTransactionCurrencies, setSelectedTransactionCurrencies] =
    useState<Set<string>>(new Set());
  const [selectedTransactableCurrencies, setSelectedTransactableCurrencies] =
    useState<Set<string>>(new Set());
  const [minDifference, setMinDifference] = useState<number>(0);
  const [maxDifference, setMaxDifference] = useState<number>(0);
  const disableUnreconcileReconciliation =
    selectedTransactionIds.length === 0 && selectedTransactableIds.length === 0;
  const reconciliationDisabled =
    selectedTransactionIds.length === 0 || selectedTransactableIds.length === 0;
  const [isReconcilable, setIsReconcilable] = useState<boolean>(false);
  const [selectedItemsError, setSelectedItemsError] = useState<string>("");
  const [partiallyReconcile, togglePartiallyReconcile] = useToggle(false);
  const [manyToOneUserInput, setManyToOneUserInput] =
    useState<ManyToOneMatchingViewInput>({});
  const [oneToManyUserInput, setOneToManyUserInput] =
    useState<OneToManyMatchingViewInput>({});
  const [transactionAmountAvailable, setTransactionAmountAvailable] =
    useState(0);
  const [transactableAmountAvailable, setTransactableAmountAvailable] =
    useState(0);
  // == End UI State ===

  const { ui: uiStore } = useReconSplitViewStore();
  const {
    showMatchingView,
    setShowMatchingView,
    showConfirmationModal,
    setShowConfirmationModal,
  } = uiStore;

  // === UI Helper functions ===
  const openToast = useCallback(
    (
      toastProps,
      value: string,
      rightContent?: JSX.Element,
      duration?: number,
    ) => {
      toast({
        duration,
        isClosable: true,
        render: () => (
          <Toast>
            <ToastPanel {...toastProps} className="pl-5">
              {value}
            </ToastPanel>
            {rightContent}
          </Toast>
        ),
      });
    },
    [toast],
  );

  const closeToast = useCallback(() => {
    toast.closeAll();
  }, [toast]);

  const showErrorMessage = useCallback(
    (errorMessage: string) => {
      if (showConfirmationModal) {
        setError(errorMessage);
      } else {
        flashError(errorMessage);
      }
    },
    [flashError, showConfirmationModal],
  );
  // == End UI Helper functions ==

  // === UI Updaters ===
  // Thefunctions in this section update the global state when selections or query results change
  useEffect(() => {
    const checkForSelectionErrors = (): string | undefined => {
      const selectedCurrencies = new Set([
        ...Array.from(selectedTransactionCurrencies),
        ...Array.from(selectedTransactableCurrencies),
      ]);
      if (selectedCurrencies.size > 1) {
        return "Cannot reconcile items with different currencies";
      }

      if (
        selectedTransactionAccountIds.size > 1 ||
        selectedTransactableAccountIds.size > 1
      ) {
        return "Cannot reconcile transactions from different accounts";
      }

      const selectedDirections = new Set([
        ...Array.from(selectedTransactableDirections),
        ...Array.from(selectedTransactionDirections),
      ]);

      if (selectedTransactionDirections.size > 1) {
        return "All transactions must have the same direction (credit/debit)";
      }

      if (selectedTransactableDirections.size > 1) {
        return "All expected payments must have the same direction (credit/debit)";
      }

      if (selectedDirections.size > 1) {
        return "Transactions and Expected payments must have the same direction (credit/debit)";
      }

      const selectedInternalAccountIds = new Set([
        ...Array.from(selectedTransactionAccountIds),
        ...Array.from(selectedTransactableAccountIds),
      ]);

      if (selectedInternalAccountIds.size > 1) {
        return "Cannot reconcile items from different accounts";
      }

      return undefined;
    };

    const hasSelectionError = checkForSelectionErrors();
    if (hasSelectionError) {
      setIsReconcilable(false);
      setSelectedItemsError(hasSelectionError);
    } else {
      setSelectedItemsError("");
      setIsReconcilable(true);
    }
  }, [
    selectedTransactableCurrencies,
    selectedTransactionCurrencies,
    selectedTransactionAccountIds,
    selectedTransactableAccountIds,
    selectedTransactionDirections,
    selectedTransactableDirections,
  ]);

  useEffect(() => {
    if (selectedTransactionIds.length > 0) {
      const sum = transactions
        .filter((t) => selectedTransactionIds.includes(t.node.id))
        .reduce((acc, t) => acc + Number(t.node.amount), 0);
      setSelectedTransactionSum(sum);
    } else {
      setSelectedTransactionSum(0);
    }
  }, [selectedTransactionIds, transactions]);

  useEffect(() => {
    const withinRange =
      selectedTransactionTotal >= selectedTransactableRange.min &&
      selectedTransactionTotal <= selectedTransactableRange.max &&
      selectedTransactableRange.min > 0 &&
      selectedTransactableRange.max > 0;
    setSelectedAmountsMatch(
      selectedTransactionTotal === selectedTransactableTotal || withinRange,
    );
  }, [
    selectedTransactionTotal,
    selectedTransactableTotal,
    selectedTransactableRange,
  ]);

  // check for mismatched currencies and internal accounts and direction
  useEffect(() => {
    const selectedTransactions = transactions.filter((t) =>
      selectedTransactionIds.includes(t.node.id),
    );
    const selectedTransactables = transactablesWithSuggestions.filter((t) =>
      selectedTransactableIds.includes(t.node.id),
    );

    const transactionAccountIds = new Set(
      selectedTransactions.map((t) => t.node.internalAccount.id),
    );
    const transactableAccountIds = new Set(
      selectedTransactables.map((t) => t.node.accountId as string),
    );

    if (!isEqual(transactionAccountIds, selectedTransactionAccountIds)) {
      setSelectedTransactionAccountIds(transactionAccountIds);
    }

    if (transactableAccountIds !== selectedTransactableAccountIds) {
      setSelectedTransactableAccountIds(transactableAccountIds);
    }

    const transactionCurrencies = new Set(
      selectedTransactions.map((t) => t.node.currency),
    );
    const transactableCurrencies = new Set(
      selectedTransactables.map((t) => t.node.currency as string),
    );

    if (
      !isEqual(selectedTransactableCurrencies, selectedTransactionCurrencies)
    ) {
      setSelectedTransactionCurrencies(transactionCurrencies);
    }

    if (!isEqual(transactableCurrencies, selectedTransactableCurrencies)) {
      setSelectedTransactableCurrencies(transactableCurrencies);
    }

    const transactionDirections = new Set(
      selectedTransactions.map((t) => t.node.prettyDirection),
    );
    const transactableDirections = new Set(
      selectedTransactables.map((t) => t.node.prettyDirection as string),
    );

    if (!isEqual(transactionDirections, selectedTransactionDirections)) {
      setSelectedTransactionDirections(transactionDirections);
    }

    if (!isEqual(transactableDirections, selectedTransactableDirections)) {
      setSelectedTransactableDirections(transactableDirections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTransactableIds, selectedTransactionIds]);

  // calculate transaction total
  useEffect(() => {
    let amount = 0;
    let amountReconciled = 0;
    let amountUnreconciled = 0;
    transactions.forEach(({ node: transaction }) => {
      if (selectedTransactionIds.includes(transaction.id)) {
        // should we take into account the transaction type? Credit / Debit
        amount += Number(transaction.amount);
        amountReconciled += Number(
          transaction.amountReconciledToExpectedPayment,
        );
        amountUnreconciled += Number(
          transaction.amountUnreconciledToExpectedPayment,
        );
      }
    });
    setSelectedTransactionTotal(amount);
    setSelectedReconciledTransactionTotal(amountReconciled);
    setUnreconciledSelectedTransactionTotal(amountUnreconciled);
  }, [selectedTransactionIds, transactions]);

  // calculate transactable total
  useEffect(() => {
    let total = 0;
    let rangeMinTotal = 0;
    let rangeMaxTotal = 0;
    let rangeUnreconciledMinTotal = 0;
    let rangeUnreconciledMaxTotal = 0;

    const selectedTransactables = transactablesWithSuggestions.filter((t) =>
      selectedTransactableIds.includes(t?.node?.id),
    );

    // check if any of the transactables are an EP and have a non-zero range. This is important because
    // we can only reconcile a transaction to many EPs if they all have a zero range.
    const containsEPWithNonzeroRange = selectedTransactables.some(
      ({ node: transactable }) =>
        transactable?.typename === "ExpectedPayment" &&
        transactable.amountLowerBound !== transactable.amountUpperBound,
    );
    setHasSelectedEPWithRange(containsEPWithNonzeroRange);

    selectedTransactables.forEach(({ node: transactable }) => {
      if (transactable.typename === "ExpectedPayment") {
        rangeMinTotal += Number(transactable.amountLowerBound);
        rangeMaxTotal += Number(transactable.amountUpperBound);
        rangeUnreconciledMinTotal += Number(
          transactable.amountUnreconciledLowerBound,
        );
        rangeUnreconciledMaxTotal += Number(
          transactable.amountUnreconciledUpperBound,
        );
      } else {
        total += Number(transactable?.amount);
      }
    });

    if (transactableType === "ExpectedPayment") {
      setSelectedTransactableRange({
        min: rangeMinTotal,
        max: rangeMaxTotal,
      });
      setSelectedUnreconciledTransactableRange({
        min: rangeUnreconciledMinTotal,
        max: rangeUnreconciledMaxTotal,
      });
    } else {
      setSelectedTransactableTotal(total);
    }
  }, [selectedTransactableIds, transactablesWithSuggestions, transactableType]);

  // Update the min and max difference values
  useEffect(() => {
    const minDiff = Math.min(
      Math.abs(
        selectedUnreconciledTransactableRange.min -
          selectedUnreconciledTransactionTotal,
      ),
      Math.abs(
        selectedUnreconciledTransactableRange.max -
          selectedUnreconciledTransactionTotal,
      ),
    );
    const maxDiff = Math.max(
      Math.abs(
        selectedUnreconciledTransactableRange.min -
          selectedUnreconciledTransactionTotal,
      ),
      Math.abs(
        selectedUnreconciledTransactableRange.max -
          selectedUnreconciledTransactionTotal,
      ),
    );

    setMinDifference(minDiff);
    setMaxDifference(maxDiff);
  }, [
    selectedUnreconciledTransactableRange,
    selectedUnreconciledTransactionTotal,
    minDifference,
    maxDifference,
  ]);

  // Show errors if we know that reconciliation can't happen
  // with the currently selected items
  useEffect(() => {
    if (selectedTransactionIds.length > 1 && hasSelectedEPWithRange) {
      setError(
        "Cannot reconcile multiple transactions when an Expected Payment has a range.",
      );
    } else {
      setError(null);
    }
  }, [selectedTransactionIds, hasSelectedEPWithRange]);

  const indexSelectedOneToManyUserInput = useCallback(() => {
    const oneToMany =
      selectedTransactionIds.length <= selectedTransactableIds.length;

    const selectedTransactables = transactablesWithSuggestions
      .filter((t) => selectedTransactableIds.includes(t.node.id))
      .sort((a, b) => {
        const dateA = new Date(a.node.dateLowerBound as string).getTime();
        const dateB = new Date(b.node.dateLowerBound as string).getTime();
        return dateB - dateA;
      });

    // Note(@paul on 12/19/2023): This entire UI data flow will be refactored separately.
    // This branch handles the 1:1 case separately.
    if (
      selectedTransactionIds.length === 1 &&
      selectedTransactableIds.length === 1
    ) {
      const { node: transactable } = selectedTransactables[0];
      const { amountUnreconciledUpperBound } = transactable;
      const upperBound = Number(amountUnreconciledUpperBound);

      if (selectedUnreconciledTransactionTotal === upperBound) {
        const matchInput: OneToManyMatchingViewInput = {
          [transactable.id]: {
            userInputAmount: upperBound,
            reconcile: "reconcile",
            originalAmount: upperBound,
          },
        };
        setOneToManyUserInput(matchInput);
        return;
      }
    }

    let transactionTotal = selectedUnreconciledTransactionTotal;
    const indexedOneToManyUserInput = selectedTransactables.reduce(
      (acc, item) => {
        const { node } = item;
        const {
          id,
          amountUnreconciledLowerBound,
          amountUnreconciledUpperBound,
        } = node;

        const lowerBound = Number(amountUnreconciledLowerBound);
        const upperBound = Number(amountUnreconciledUpperBound);
        const rangedAmount = lowerBound !== upperBound;
        const num = rangedAmount ? (lowerBound + upperBound) / 2 : lowerBound;

        let userInputAmount: number;
        let reconciledState: string;

        if (num > transactionTotal) {
          userInputAmount = transactionTotal;
          transactionTotal = 0;
          reconciledState = "partial";
        } else {
          transactionTotal -= num;
          userInputAmount = num;
          reconciledState = "reconcile";
        }
        if (!oneToMany) {
          userInputAmount = rangedAmount ? upperBound : num;
        }

        acc[id] = {
          userInputAmount,
          reconcile: reconciledState,
          originalAmount: upperBound,
        };

        return acc;
      },
      {},
    );
    setOneToManyUserInput(indexedOneToManyUserInput);
  }, [
    selectedTransactionIds,
    selectedTransactableIds,
    selectedUnreconciledTransactionTotal,
    transactablesWithSuggestions,
  ]);

  useEffect(() => {
    indexSelectedOneToManyUserInput();
  }, [indexSelectedOneToManyUserInput, showMatchingView]);

  const indexSelectedManyToOneUserInput = useCallback(() => {
    let transactableTotal =
      (selectedUnreconciledTransactableRange.max +
        selectedUnreconciledTransactableRange.min) /
      2;

    const transformedTransactionObject = transactions
      .filter((item) => selectedTransactionIds.includes(item.node.id))
      .sort((a, b) => {
        const dateA = new Date(a.node.prettyCreatedAt).getTime();
        const dateB = new Date(b.node.prettyCreatedAt).getTime();
        return dateB - dateA;
      })
      .reduce((acc, item) => {
        const { node } = item;
        const { id } = node;

        const num = Number(node.amountUnreconciledToExpectedPayment);

        let userInputAmount: number;
        if (num > transactableTotal) {
          userInputAmount = transactableTotal;
          transactableTotal = 0;
        } else {
          transactableTotal -= num;
          userInputAmount = num;
        }

        acc[id] = {
          userInputAmount,
          originalAmount: num,
        };

        return acc;
      }, {});

    setManyToOneUserInput(transformedTransactionObject);
  }, [
    selectedTransactionIds,
    selectedUnreconciledTransactableRange.max,
    selectedUnreconciledTransactableRange.min,
    transactions,
  ]);

  useEffect(() => {
    indexSelectedManyToOneUserInput();
  }, [indexSelectedManyToOneUserInput, showMatchingView]);

  //  For now, you can only select:
  //   - one transaction and many EPs (one:many)
  //   - many transactions and one EP (many:one)

  //  When selecting a transaction,
  //   if there is more than 1 transaction selected AND many EPs selected,
  //  then deselect all EPs except for the first one.

  //  When selecting an EP,
  //  if there are gt 1 EPs selected AND many transactions selected,
  //   then deselect all transactions except for the first one.

  //  If there are no other EPs selected, don't do anything to the transactions
  const handleSelectedTransactionIdsChange = useCallback(
    (ids: string[]) => {
      if (ids.length > 1 && selectedTransactableIds.length > 1) {
        setSelectedTransactableIds([selectedTransactableIds[0]]);
        setSelectedTransactionIds(ids);
        closeToast();
        openToast(
          { title: "Warning", status: "warning" },
          "You can only select one expected payment when selecting many transactions.",
          <ToastButton onClick={closeToast} closeButton />,
        );
      } else {
        setSelectedTransactionIds(ids);
      }
    },
    [selectedTransactableIds, openToast, closeToast],
  );

  const handleSelectedTransactableIdsChange = useCallback(
    (ids: string[]) => {
      if (ids.length > 1 && selectedTransactionIds.length > 1) {
        setSelectedTransactionIds([selectedTransactionIds[0]]);
        setSelectedTransactableIds(ids);
        closeToast();
        openToast(
          { title: "Warning", status: "warning" },
          "You can only select one transaction when selecting many expected payments.",
          <ToastButton onClick={closeToast} closeButton />,
        );
      } else {
        setSelectedTransactableIds(ids);
      }
    },
    [selectedTransactionIds, openToast, closeToast],
  );

  // === MUTATIONS ===
  const [reconcileTransactablesMutation] = useReconcileTransactablesMutation();
  const [reconcileManyTransactionsToOneEP] =
    useMultipleTransactionsToOneExpectedPaymentMutation();
  const [unreconcileTransactablesMutation] =
    useManualUnreconcileTransactablesMutation();
  const [unreconcileTransactionMutation] = useUnreconcileTransactionMutation();
  const [generateReconSuggestionsMutation] =
    useGenerateExpectedPaymentReconSuggestionsMutation();

  async function generateReconSuggestions(transactionId: string) {
    setReconSuggestionsLoading(true);
    const { data } = await generateReconSuggestionsMutation({
      variables: {
        input: {
          selectedTransactionIds: [transactionId],
        },
      },
    });
    setReconSuggestionsLoading(false);

    if (data?.generateExpectedPaymentReconSuggestions) {
      const { reconciliationSuggestions } =
        data.generateExpectedPaymentReconSuggestions;
      setReconSuggestions(
        (reconciliationSuggestions ?? []) as ReconciliationSuggestion[],
      );
    }
  }

  useEffect(() => {
    if (selectedTransactionIds.length !== 1) {
      setReconSuggestions([]);
      return;
    }

    if (transactableType !== "ExpectedPayment") {
      setReconSuggestions([]);
      return;
    }

    void generateReconSuggestions(selectedTransactionIds[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTransactionIds]);
  // Merge recon suggestions with transactables
  useEffect(() => {
    if (reconSuggestions.length === 0) {
      setTransactablesWithSuggestions(transactables);
      return;
    }

    const reconSuggestionsToTransactables = (
      suggestions: ReconciliationSuggestion[],
    ): Transactable[] => {
      const asTransactables = suggestions.map((suggestion) => {
        const transactable = suggestion.transactable as unknown as Transactable;

        return {
          node: {
            ...transactable,
            isAiSuggestion: true,
          },
        };
      });

      return asTransactables as unknown as Transactable[];
    };

    const suggestedTransactables =
      reconSuggestionsToTransactables(reconSuggestions);

    const suggestedTransactableIds = map(suggestedTransactables, "node.id");
    const remainingTransactables = reject(transactables, (transactable) =>
      suggestedTransactableIds.includes(transactable?.node?.id),
    );

    const merged = [...suggestedTransactables, ...remainingTransactables];
    setTransactablesWithSuggestions(merged);
    setTransactableTotalCount(merged.length);
  }, [reconSuggestions, transactables]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const undoTransactionReconciliation = async (transactionId: string) => {
    const { data } = await unreconcileTransactionMutation({
      variables: {
        input: {
          id: transactionId,
        },
      },
    });

    if (data && data.unreconcileTransaction?.errors.length === 0) {
      openToast({ status: "success" }, `Unreconciled 1 Transaction`);

      // Reset the state in this parent page
      setSelectedTransactableIds([]);
      setSelectedTransactionIds([]);

      // Refresh the child tables
      setRefresh((prev) => !prev);
    } else {
      flashError(
        `${
          data?.unreconcileTransaction?.errors.join(", ") ||
          "An error has occurred"
        }`,
      );
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const undoTransactableReconciliation = async (transactableIds: string[]) => {
    const { data } = await unreconcileTransactablesMutation({
      variables: {
        input: {
          transactableIds,
          transactableType,
        },
      },
    });

    if (data && data.manualUnreconcileTransactables?.errors.length === 0) {
      openToast(
        { status: "success" },
        `Unreconciled ${transactableIds.length} ${transactableType}`,
      );

      // Reset the state in this parent page
      setSelectedTransactableIds([]);
      setSelectedTransactionIds([]);

      // Refresh the child tables
      setRefresh((prev) => !prev);
    } else {
      flashError(
        `${
          data?.manualUnreconcileTransactables?.errors.join(", ") ||
          "An error has occurred"
        }`,
      );
    }
  };

  const handleReconciliationOneTransactionToOneExpectedPayment = async (
    manualReconciliationReason: string,
    oneToOne?: OneToOne[],
  ) => {
    const { data } = await reconcileTransactablesMutation({
      variables: {
        input: {
          transactionId: selectedTransactionIds[0],
          transactableIds: selectedTransactableIds,
          transactableType,
          manualReconciliationReason,
          oneToMany: oneToOne,
        },
      },
    });

    if (data && data.reconcileTransactables?.transaction) {
      setShowMatchingView(false);
      const { transaction } = data.reconcileTransactables;

      openToast(
        { status: "success" },
        `${selectedTransactionIds.length} ${pluralize(
          "Transaction",
          selectedTransactionIds.length,
        )} successfully reconciled to ${
          selectedTransactableIds.length
        } ${pluralize(
          transactableType === "ExpectedPayment"
            ? "Expected Payment"
            : transactableType,
          selectedTransactableIds.length,
        )}`,
        <ToastButton
          className="mr-4"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={async () => {
            trackEvent(
              null,
              SPLIT_RECONCILIATION_ACTIONS.UNDO_RECONCILED_TOAST_CLICKED,
            );
            await undoTransactionReconciliation(transaction.id);
          }}
        >
          Undo
        </ToastButton>,
        TOAST_DURATION,
      );

      setShowConfirmationModal(false);
      setError(null);

      setSelectedTransactableIds([]);
      setSelectedTransactionIds([]);
    } else {
      // if the modal is open, show error in the modal. otherwise, use flashError
      const errors = data?.reconcileTransactables?.errors;

      if (errors && errors.length > 0) {
        showErrorMessage(errors?.join(", "));
      }
    }
  };

  const handleReconciliationOneTransactionToManyExpectedPayments = async (
    manualReconciliationReason: string,
  ) => {
    const decimalScale = getCurrencyDecimalScale(
      Array.from(selectedTransactionCurrencies)[0] || "USD",
    );
    const oneToMany = Object.entries(oneToManyUserInput).map(([key, item]) => {
      const amountToReconcile = sanitizeAmount(
        item.userInputAmount / 100,
        decimalScale,
      );
      let markExpectedPaymentAsReconciled = false;
      const reconciliationStatus = item.reconcile === "reconcile";
      if (reconciliationStatus && item.userInputAmount < item.originalAmount) {
        markExpectedPaymentAsReconciled = true;
      }
      return {
        expectedPaymentId: key,
        amountToReconcile,
        markExpectedPaymentAsReconciled,
      };
    });
    const { data } = await reconcileTransactablesMutation({
      variables: {
        input: {
          transactionId: selectedTransactionIds[0],
          transactableIds: selectedTransactableIds,
          transactableType,
          manualReconciliationReason,
          oneToMany,
        },
      },
    });

    if (data && data.reconcileTransactables?.transaction) {
      setShowMatchingView(false);
      const { transaction } = data.reconcileTransactables;

      openToast(
        { status: "success" },
        `${selectedTransactionIds.length} ${pluralize(
          "Transaction",
          selectedTransactionIds.length,
        )} successfully reconciled to ${
          selectedTransactableIds.length
        } ${pluralize(
          transactableType === "ExpectedPayment"
            ? "Expected Payment"
            : transactableType,
          selectedTransactableIds.length,
        )}`,
        <ToastButton
          className="mr-4"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={async () => {
            trackEvent(
              null,
              SPLIT_RECONCILIATION_ACTIONS.UNDO_RECONCILED_TOAST_CLICKED,
            );
            await undoTransactionReconciliation(transaction.id);
          }}
        >
          Undo
        </ToastButton>,
        TOAST_DURATION,
      );

      setShowConfirmationModal(false);
      setError(null);

      setSelectedTransactableIds([]);
      setSelectedTransactionIds([]);
    } else {
      // if the modal is open, show error in the modal. otherwise, use flashError
      const errors = data?.reconcileTransactables?.errors;

      if (errors && errors.length > 0) {
        showErrorMessage(errors?.join(", "));
      }
    }
  };

  const handleReconciliationOneExpectedPaymentToManyTransactions = async () => {
    const decimalScale = getCurrencyDecimalScale(
      Array.from(selectedTransactionCurrencies)[0] || "USD",
    );
    const manyToOne = Object.entries(manyToOneUserInput).map(([key, item]) => {
      const amountToReconcile = sanitizeAmount(
        item.userInputAmount / 100,
        decimalScale,
      );
      return {
        transactionId: key,
        amountToReconcile,
      };
    });

    const { data } = await reconcileManyTransactionsToOneEP({
      variables: {
        input: {
          transactionIds: selectedTransactionIds,
          expectedPaymentId: selectedTransactableIds[0],
          manyToOne,
          markExpectedPaymentAsReconciled:
            oneToManyUserInput[selectedTransactableIds[0]]?.reconcile ===
              "reconcile" || false,
        },
      },
    });

    if (
      data &&
      data.multipleTransactionsToOneExpectedPayment?.expectedPayment
    ) {
      const { expectedPayment } = data.multipleTransactionsToOneExpectedPayment;
      const { prettyAmountRange } = expectedPayment;

      if (prettyAmountRange && typeof prettyAmountRange === "string") {
        setShowMatchingView(false);
        openToast(
          { status: "success" },
          `${selectedTransactionIds.length} ${pluralize(
            "Transaction",
            selectedTransactionIds.length,
          )} successfully reconciled to ${
            selectedTransactableIds.length
          } ${pluralize(
            transactableType === "ExpectedPayment"
              ? "Expected Payment"
              : transactableType,
            selectedTransactableIds.length,
          )}`,
          <ToastButton
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={async () => {
              trackEvent(
                null,
                SPLIT_RECONCILIATION_ACTIONS.UNDO_RECONCILED_TOAST_CLICKED,
              );
              await undoTransactableReconciliation([
                expectedPayment?.id,
              ] as string[]);
            }}
          >
            Undo
          </ToastButton>,
          TOAST_DURATION,
        );
      }

      setShowConfirmationModal(false);
      setError(null);

      setRefresh((prev) => !prev);

      setSelectedTransactableIds([]);
      setSelectedTransactionIds([]);
    } else {
      const errors = data?.multipleTransactionsToOneExpectedPayment?.errors;

      if (errors && errors.length > 0) {
        showErrorMessage(errors?.join(", "));
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleReconciliation = async (
    manualReconciliationReason: string,
    oneToOne?: OneToOne[],
  ) => {
    trackEvent(null, SPLIT_RECONCILIATION_ACTIONS.RECONCILED_SELECTED_CLICKED);
    if (
      selectedTransactionIds.length === 1 &&
      selectedTransactableIds.length === 1 &&
      transactableType === "ExpectedPayment" &&
      oneToOne
    ) {
      await handleReconciliationOneTransactionToOneExpectedPayment(
        manualReconciliationReason,
        oneToOne,
      );
    } else if (
      selectedTransactionIds.length === 1 &&
      selectedTransactableIds.length > 0 &&
      transactableType === "ExpectedPayment"
    ) {
      await handleReconciliationOneTransactionToManyExpectedPayments(
        manualReconciliationReason,
      );
    } else if (
      selectedTransactionIds.length === 1 &&
      selectedTransactableIds.length > 0
    ) {
      await handleReconciliationOneTransactionToManyExpectedPayments(
        manualReconciliationReason,
      );
    } else if (
      selectedTransactionIds.length > 1 &&
      selectedTransactableIds.length === 1
    ) {
      await handleReconciliationOneExpectedPaymentToManyTransactions();
    } else if (
      selectedTransactionIds.length > 1 &&
      selectedTransactableIds.length > 1
    ) {
      flashError(
        "You can only reconcile one transaction to many expected payments or one expected payment to many transactions.",
      );
      return;
    }
    setRefresh((prev) => !prev);
  };
  // === END MUTATIONS ===

  const context: ReconciliationState = useMemo(
    () => ({
      // Mutations
      handleReconciliation,
      undoTransactionReconciliation,
      undoTransactableReconciliation,
      unreconcileTransactionMutation,
      // UI concerns
      isReconcilable,
      manualReasonRequired,
      setManualReasonRequired,
      showTransactables,
      minDifference,
      maxDifference,
      reconciled,
      setReconciled,
      refresh,
      setRefresh,
      error,
      setError,
      selectedItemsError,
      setSelectedItemsError,
      disableUnreconcileReconciliation,
      reconciliationDisabled,
      showErrorMessage,
      flashError,
      // data concerns
      transactablesWithSuggestions,
      internalAccountId,
      transactions,
      transactionTotalCount,
      setTransactionTotalCount,
      selectedTransactionIds,
      setSelectedTransactionIds: handleSelectedTransactionIdsChange,
      selectedTransactableCurrencies,
      selectedTransactionCurrencies,
      selectedTransactionSum,
      setSelectedTransactionSum,
      selectedAmountsMatch,
      hasSelectedEPWithRange,
      setHasSelectedEPWithRange,
      transactables,
      transactableTotalCount,
      selectedTransactableIds,
      transactableType,
      setTransactions,
      setTransactables,
      setTransactableTotalCount,
      setSelectedTransactableIds: handleSelectedTransactableIdsChange,
      selectedTransactionTotal,
      selectedReconciledTransactionTotal,
      selectedUnreconciledTransactionTotal,
      selectedTransactableTotal,
      selectedTransactableRange,
      selectedUnreconciledTransactableRange,
      openToast,
      closeToast,
      reconSuggestions,
      reconSuggestionsLoading,
      setReconSuggestionsLoading,
      partiallyReconcile,
      togglePartiallyReconcile,
      manyToOneUserInput,
      setManyToOneUserInput,
      oneToManyUserInput,
      setOneToManyUserInput,
      transactionAmountAvailable,
      setTransactionAmountAvailable,
      transactableAmountAvailable,
      setTransactableAmountAvailable,
    }),
    [
      transactablesWithSuggestions,
      selectedItemsError,
      transactionTotalCount,
      setTransactionTotalCount,
      transactableTotalCount,
      setTransactableTotalCount,
      manualReasonRequired,
      showTransactables,
      handleReconciliation,
      undoTransactionReconciliation,
      undoTransactableReconciliation,
      selectedTransactableCurrencies,
      selectedTransactionCurrencies,
      unreconcileTransactionMutation,
      flashError,
      showErrorMessage,
      error,
      setError,
      disableUnreconcileReconciliation,
      reconciliationDisabled,
      minDifference,
      maxDifference,
      internalAccountId,
      transactions,
      selectedTransactionIds,
      handleSelectedTransactableIdsChange,
      handleSelectedTransactionIdsChange,
      selectedTransactionSum,
      setSelectedTransactionSum,
      selectedAmountsMatch,
      hasSelectedEPWithRange,
      setHasSelectedEPWithRange,
      transactables,
      selectedTransactableIds,
      transactableType,
      setTransactions,
      setTransactables,
      refresh,
      setRefresh,
      reconciled,
      setReconciled,
      selectedTransactionTotal,
      selectedReconciledTransactionTotal,
      selectedUnreconciledTransactionTotal,
      selectedTransactableTotal,
      selectedTransactableRange,
      selectedUnreconciledTransactableRange,
      openToast,
      closeToast,
      reconSuggestions,
      reconSuggestionsLoading,
      isReconcilable,
      partiallyReconcile,
      togglePartiallyReconcile,
      manyToOneUserInput,
      setManyToOneUserInput,
      oneToManyUserInput,
      setOneToManyUserInput,
      transactionAmountAvailable,
      setTransactionAmountAvailable,
      transactableAmountAvailable,
      setTransactableAmountAvailable,
    ],
  );

  return (
    <ReconciliationContext.Provider value={context}>
      {children}
    </ReconciliationContext.Provider>
  );
}

export default observer(ReconciliationContextProvider);
