// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { makeAutoObservable, toJS } from "mobx";
import { ReactElement } from "react";
import {
  ManualMatchInput,
  ReconciliationSuggestion,
  CreateTransactionMutation,
  FindTransactionsInput,
  BulkManuallyReconcileExpectedPaymentsMutation,
  FindExpectedPaymentsInput,
  ReconciliationRuleObjectEnum,
  ManuallyReconcileExpectedPaymentsMutation,
  TransactionsTableQuery,
  ExpectedPaymentsTableQuery,
} from "~/generated/dashboard/graphqlSchema";
import { ToastPanelProps } from "~/common/ui-components/Toast/Toast";
import { BigMath } from "~/common/utilities/bigMath";
import { DataAccessLayer } from "./data-access-layer"; // New import
import { ReconciliationEngine } from "./reconciliation-engine"; // New import

type Transaction = TransactionsTableQuery["transactions"]["edges"][number];
type ExpectedPayment =
  ExpectedPaymentsTableQuery["expectedPayments"]["edges"][number];

/**
 * Interface for the core state of the SplitViewDataStore.
 * This promotes better type safety and a clear definition of the store's data.
 */
interface DataStoreState {
  netReconciliationEnabled: boolean;
  selectedTransactionIds: string[];
  selectedExpectedPaymentIds: string[];
  transactionTotalCount: number;
  expectedPaymentTotalCount: number;
  manualMatches: ManualMatchInput[];
  transactions: Transaction[];
  expectedPayments: ExpectedPayment[];
  suggestedExpectedPayments: ReconciliationSuggestion[];
  selectEverythingTransactions: boolean;
  selectEverythingExpectedPayments: boolean;
  transactionsTotalAmount: bigint;
  expectedPaymentsTotalAmountRange: { min: bigint; max: bigint };
  reconSuggestionsLoading: boolean;
  toast: {
    text: ReactElement | string;
    status: ToastPanelProps["status"];
    undoAction?: (() => void) | undefined;
    durationSeconds: number;
    dismissable?: boolean;
  } | null;
  refresh: number | null;
  errorMessage: string | null;
}

/**
 * SplitViewDataStore: A robust, scalable, and AI-ready data store for reconciliation.
 * Designed for high-volume, real-time data processing and intelligent reconciliation
 * suggestions, with an architecture ready for continuous expansion and AI integration.
 */
export default class SplitViewDataStore implements DataStoreState {
  // Core state properties, implementing DataStoreState
  netReconciliationEnabled = false;
  selectedTransactionIds: string[] = [];
  selectedExpectedPaymentIds: string[] = [];
  transactionTotalCount = 0;
  expectedPaymentTotalCount = 0;
  manualMatches: ManualMatchInput[] = [];
  transactions: Transaction[] = [];
  expectedPayments: ExpectedPayment[] = [];
  suggestedExpectedPayments: ReconciliationSuggestion[] = [];
  selectEverythingTransactions = false;
  selectEverythingExpectedPayments = false;
  transactionsTotalAmount = BigInt(0);
  expectedPaymentsTotalAmountRange = {
    min: BigInt(0),
    max: BigInt(0),
  };
  reconSuggestionsLoading = false;
  toast: {
    text: ReactElement | string;
    status: ToastPanelProps["status"];
    undoAction?: (() => void) | undefined;
    durationSeconds: number;
    dismissable?: boolean;
  } | null = null;
  refresh: number | null = null;
  errorMessage: string | null = null;

  // External service dependencies
  private dataAccessLayer: DataAccessLayer;
  private reconciliationEngine: ReconciliationEngine;

  constructor(
    dataAccessLayer: DataAccessLayer = new DataAccessLayer(),
    reconciliationEngine: ReconciliationEngine = new ReconciliationEngine()
  ) {
    makeAutoObservable(this);
    this.dataAccessLayer = dataAccessLayer;
    this.reconciliationEngine = reconciliationEngine;
  }

  // --- State Mutators ---

  public setNetReconciliationEnabled = (enabled: boolean) => {
    this.netReconciliationEnabled = enabled;
  };

  public setErrorMessage = (message: string) => {
    this.errorMessage = message;
  };

  public setRefresh = () => {
    this.refresh = Date.now();
  };

  public setTransactions = (transactions: Transaction[]) => {
    this.transactions = transactions;
  };

  public setTransactionsTotalAmount = (amount: bigint) => {
    this.transactionsTotalAmount = amount;
  };

  public setExpectedPaymentsTotalAmountRange = (min: bigint, max: bigint) => {
    this.expectedPaymentsTotalAmountRange = { min, max };
  };

  public setExpectedPayments = (expectedPayments: ExpectedPayment[]) => {
    this.expectedPayments = expectedPayments;
  };

  public setSuggestedExpectedPayments = (
    suggestedExpectedPayments: ReconciliationSuggestion[],
  ) => {
    this.suggestedExpectedPayments = suggestedExpectedPayments;
  };

  public setReconSuggestionsLoading = (loading: boolean) => {
    this.reconSuggestionsLoading = loading;
  };

  public setSelectEverythingTransactions = (selectEverything: boolean) => {
    this.selectEverythingTransactions = selectEverything;
  };

  public setSelectEverythingExpectedPayments = (selectEverything: boolean) => {
    this.selectEverythingExpectedPayments = selectEverything;
  };

  public setSelectedTransactionIds = (transactionIds: string[]) => {
    if (
      transactionIds.length > 1 &&
      this.selectedExpectedPaymentIds.length > 1
    ) {
      this.setToast({
        status: "error",
        text: "You can only select one expected payment when selecting many transactions.",
        durationSeconds: 10,
        dismissable: true,
      });
    }
    this.selectedTransactionIds = transactionIds;
    this.setInitialManualMatches();
  };

  public setSelectedExpectedPaymentIds = (ids: string[]) => {
    if (ids.length > 1 && this.selectedTransactionIds.length > 1) {
      this.setToast({
        status: "error",
        text: "You can only select one transaction when selecting many expected payments.",
        durationSeconds: 10,
        dismissable: true,
      });
    }
    this.selectedExpectedPaymentIds = ids;
    this.setInitialManualMatches();
  };

  public setTransactionTotalCount = (count: number) => {
    this.transactionTotalCount = count;
  };

  public setExpectedPaymentTotalCount = (count: number) => {
    this.expectedPaymentTotalCount = count;
  };

  public setManualMatches = (matches: ManualMatchInput[]) => {
    this.manualMatches = matches;
  };

  public updateManualMatch = (
    index: number,
    updates: Partial<ManualMatchInput>,
  ): void => {
    if (index !== -1) {
      const current = this.manualMatches[index];
      this.manualMatches[index] = {
        ...current,
        ...updates,
      };
    }
  };

  setToast(
    args: {
      status: ToastPanelProps["status"];
      text: ReactElement | string;
      undoAction?: () => void;
      durationSeconds: number;
      dismissable?: boolean;
    } | null,
  ) {
    this.toast = args;
  }

  public resetToast = () => {
    this.setToast(null);
  };

  // --- Computed Properties (Getters) ---

  get selectedTransactions() {
    return this.transactions.filter((transaction) =>
      this.selectedTransactionIds.includes(transaction.node.id),
    );
  }

  get selectedExpectedPayments() {
    return this.expectedPayments.filter((expectedPayment) =>
      this.selectedExpectedPaymentIds.includes(expectedPayment.node.id),
    );
  }

  get selectedTransactionTotal() {
    return this.selectedTransactions.reduce((total, transaction) => {
      const coefficient =
        this.netReconciliationEnabled && transaction.node.direction === "debit"
          ? -1
          : 1;
      return total + Number(transaction.node.amount) * coefficient;
    }, 0);
  }

  get selectedTransactionsTotalUnledgered() {
    return this.selectedTransactions.reduce(
      (total, transaction) => total + Number(transaction.node.unledgeredAmount),
      0,
    );
  }

  get selectedExpectedPaymentRange() {
    let min = 0;
    let max = 0;
    this.selectedExpectedPayments.forEach((expectedPayment) => {
      const coefficient =
        this.netReconciliationEnabled &&
        expectedPayment.node.prettyDirection === "Debit"
          ? -1
          : 1;
      if (expectedPayment.node.amountUnreconciledLowerBound) {
        min +=
          Number(expectedPayment.node.amountUnreconciledLowerBound) *
          coefficient;
      }
      if (expectedPayment.node.amountUnreconciledUpperBound) {
        max +=
          Number(expectedPayment.node.amountUnreconciledUpperBound) *
          coefficient;
      }
    });
    return { min, max };
  }

  get selectedUnreconciledTransactionTotal(): number {
    return this.selectedTransactions.reduce((total, transaction) => {
      const coefficient =
        this.netReconciliationEnabled && transaction.node.direction === "debit"
          ? -1
          : 1;
      return (
        total +
        Number(
          transaction.node.amountUnreconciledToExpectedPayment * coefficient,
        )
      );
    }, 0);
  }

  get selectedUnreconciledTotalWithNetCreditDebit(): number {
    return this.selectedTransactions.reduce((total, transaction) => {
      const amount = Number(
        transaction.node.amountUnreconciledToExpectedPayment,
      );
      return transaction.node.direction === "credit"
        ? total + amount
        : total - amount;
    }, 0);
  }

  get selectedUnreconciledExpectedPaymentRange(): { min: number; max: number } {
    let min = 0;
    let max = 0;
    this.selectedExpectedPayments.forEach((expectedPayment) => {
      const coefficient =
        this.netReconciliationEnabled &&
        expectedPayment.node.prettyDirection === "Debit"
          ? -1
          : 1;
      if (expectedPayment.node.amountUnreconciledLowerBound) {
        min +=
          Number(expectedPayment.node.amountUnreconciledLowerBound) *
          coefficient;
      }
      if (expectedPayment.node.amountUnreconciledUpperBound) {
        max +=
          Number(expectedPayment.node.amountUnreconciledUpperBound) *
          coefficient;
      }
    });
    return { min, max };
  }

  get differenceBetweenSelectedItems() {
    const unreconciledTransactionTotal = this.selectEverythingTransactions
      ? this.transactionsTotalAmount
      : BigInt(this.selectedUnreconciledTransactionTotal); // Cast to BigInt
    const unreconciledExpectedPaymentsRange = this
      .selectEverythingExpectedPayments
      ? this.expectedPaymentsTotalAmountRange
      : {
          min: BigInt(this.selectedUnreconciledExpectedPaymentRange.min), // Cast to BigInt
          max: BigInt(this.selectedUnreconciledExpectedPaymentRange.max), // Cast to BigInt
        };

    const min = BigMath.min(
      BigMath.abs(
        unreconciledExpectedPaymentsRange.min - unreconciledTransactionTotal,
      ),
      BigMath.abs(
        unreconciledExpectedPaymentsRange.max - unreconciledTransactionTotal,
      ),
    );

    const max = BigMath.max(
      BigMath.abs(
        unreconciledExpectedPaymentsRange.min - unreconciledTransactionTotal,
      ),
      BigMath.abs(
        unreconciledExpectedPaymentsRange.max - unreconciledTransactionTotal,
      ),
    );

    return { min, max };
  }

  get selectedTransactionCurrencies() {
    const currencies = new Set<string>();
    this.selectedTransactions.forEach((transaction) => {
      currencies.add(transaction.node.currency);
    });
    return currencies;
  }

  get selectedExpectedPaymentCurrencies() {
    const currencies = new Set<string>();
    this.selectedExpectedPayments.forEach((expectedPayment) => {
      currencies.add(expectedPayment.node.currency);
    });
    return currencies;
  }

  get selectedCurrency() {
    if (this.selectedTransactionCurrencies.size > 0) {
      return this.selectedTransactionCurrencies.values().next().value as string;
    }
    if (this.selectedExpectedPaymentCurrencies.size > 0) {
      return this.selectedExpectedPaymentCurrencies.values().next()
        .value as string;
    }
    return null;
  }

  get reconciliationDisabled(): boolean {
    const manyOnBothSides =
      this.selectedTransactionIds.length > 1 &&
      this.selectedExpectedPaymentIds.length > 1;
    return (
      manyOnBothSides ||
      (this.selectedTransactionIds.length === 0 &&
        !this.selectEverythingTransactions) ||
      (this.selectedExpectedPaymentIds.length === 0 &&
        !this.selectEverythingExpectedPayments) ||
      (this.selectEverythingTransactions &&
        this.selectEverythingExpectedPayments)
    );
  }

  get selectionErrors() {
    return this.reconciliationEngine.getSelectionErrors(this);
  }

  get ledgerSelectionErrors() {
    return this.reconciliationEngine.getLedgerSelectionErrors(this);
  }

  get validManualMatches() {
    return this.manualMatches.some((m) => m.amountToReconcile <= 0);
  }

  public setInitialManualMatches = () => {
    this.manualMatches = this.reconciliationEngine.generateInitialManualMatches(
      this.selectedTransactions,
      this.selectedExpectedPayments,
      this.netReconciliationEnabled,
      this.selectedTransactionAmountAvailableToReconcile,
      this.selectedExpectedPaymentAmountAvailableToReconcile,
    );
  };

  get isReconcilable() {
    return this.selectionErrors.length === 0;
  }

  get isLedgerable() {
    return this.ledgerSelectionErrors.length === 0;
  }

  get selectedItemsWithinRange() {
    if (this.selectedExpectedPaymentIds.length === 0) {
      return false;
    }

    const { min, max } = this.selectedExpectedPaymentRange;

    if (this.netReconciliationEnabled) {
      const transactionTotal = Math.abs(
        this.selectedUnreconciledTotalWithNetCreditDebit,
      );
      return transactionTotal >= min && transactionTotal <= max;
    }
    const transactionTotal = this.selectedUnreconciledTransactionTotal;
    return transactionTotal >= min && transactionTotal <= max;
  }

  get selectedExpectedPaymentAmountAvailableToReconcile(): number {
    return this.selectedExpectedPayments.reduce((total, expectedPayment) => {
      const coefficient =
        this.netReconciliationEnabled &&
        expectedPayment.node.prettyDirection === "Debit"
          ? -1
          : 1;

      return (
        total +
        Number(expectedPayment.node.amountUnreconciledUpperBound) * coefficient
      );
    }, 0);
  }

  get selectedTransactionAmountAvailableToReconcile(): number {
    return this.selectedTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.node.amountUnreconciledToExpectedPayment),
      0,
    );
  }

  // --- Actions ---

  public bulkReconcileTransactionToManyExpectedPayments = async (
    expectedPaymentsFilters: FindExpectedPaymentsInput,
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => {
    try {
      const variables = {
        input: {
          singleReconcilableEntityId: this.selectedTransactionIds?.[0],
          singleReconcilableEntityType:
            ReconciliationRuleObjectEnum.Transaction,
          expectedPaymentsFilters,
          manyReconcilableEntitiesCount: this.expectedPaymentTotalCount,
          reconcilableEntityFiltersType:
            ReconciliationRuleObjectEnum.ExpectedPayment,
        },
      };

      const result =
        await this.dataAccessLayer.bulkManuallyReconcileExpectedPayments(
          variables,
        );
      if (
        result.data?.bulkManuallyReconcileExpectedPayments?.errors?.length ===
        0
      ) {
        onSuccess();
      } else {
        const message =
          result.data?.bulkManuallyReconcileExpectedPayments?.errors?.[0] ??
          "An error occurred";
        onError(message);
      }
    } catch (error: any) {
      onError(error.message || "An unexpected error occurred.");
    }
  };

  public bulkReconcileExpectedPaymentToManyTransactions = async (
    transactionsFilters: FindTransactionsInput,
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => {
    try {
      const variables = {
        input: {
          singleReconcilableEntityId: this.selectedExpectedPaymentIds?.[0],
          singleReconcilableEntityType:
            ReconciliationRuleObjectEnum.ExpectedPayment,
          transactionsFilters,
          manyReconcilableEntitiesCount: this.transactionTotalCount,
          reconcilableEntityFiltersType:
            ReconciliationRuleObjectEnum.Transaction,
        },
      };

      const result =
        await this.dataAccessLayer.bulkManuallyReconcileExpectedPayments(
          variables,
        );
      if (
        result.data?.bulkManuallyReconcileExpectedPayments?.errors?.length ===
        0
      ) {
        onSuccess();
      } else {
        const message =
          result.data?.bulkManuallyReconcileExpectedPayments?.errors?.[0] ??
          "An error occurred";
        onError(message);
      }
    } catch (error: any) {
      onError(error.message || "An unexpected error occurred.");
    }
  };

  public reconcileExpectedPayments = async (
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => {
    try {
      const variables = {
        input: {
          manualMatches: toJS(this.manualMatches),
        },
      };

      const result = await this.dataAccessLayer.manuallyReconcileExpectedPayments(
        variables,
      );
      if (
        result.data?.manuallyReconcileExpectedPayments?.errors?.length === 0
      ) {
        onSuccess();
      } else {
        const message =
          result.data?.manuallyReconcileExpectedPayments?.errors?.[0] ??
          "An error occurred";
        onError(message);
      }
    } catch (error: any) {
      onError(error.message || "An unexpected error occurred.");
    }
  };

  public createAndReconcileTransaction = async (
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => {
    try {
      const midPointAmt =
        (this.selectedUnreconciledExpectedPaymentRange.max +
          this.selectedUnreconciledExpectedPaymentRange.min) /
        2;
      const variables = {
        input: {
          input: {
            internalAccountId:
              this.selectedExpectedPayments?.[0].node.internalAccount.id || "",
            amount: Math.abs(midPointAmt),
            direction: midPointAmt > 0 ? "credit" : "debit",
          },
        },
      };

      const result = await this.dataAccessLayer.createTransaction(variables);

      if (result.data?.createTransaction?.errors?.length === 0) {
        const transaction = {
          __typename: "TransactionEdge",
          node: result.data?.createTransaction?.transaction,
        } as Transaction;
        this.setTransactions(this.transactions.concat([transaction]));
        this.setSelectedTransactionIds([transaction.node?.id]);

        await this.reconcileExpectedPayments(onSuccess, onError);
      } else {
        const message =
          result.data?.createTransaction?.errors?.[0] ?? "An error occurred";
        onError(message);
      }
    } catch (error: any) {
      onError(error.message || "An unexpected error occurred.");
    }
  };

  public undoExpectedPaymentReconciliation = async (
    onSuccess?: () => void,
    onError?: (message: string) => void,
  ): Promise<void> => {
    try {
      const variables = {
        input: {
          transactableIds: this.selectedExpectedPaymentIds,
          transactableType: "ExpectedPayment",
        },
      };
      await this.dataAccessLayer.undoReconciliation(variables);
      this.setToast({
        status: "success",
        text: "Successfully unreconciled expected payment",
        durationSeconds: 10,
      });
      onSuccess?.();
    } catch (error: any) {
      this.setToast({
        status: "error",
        text: error.message || "An error occurred",
        durationSeconds: 10,
      });
      onError?.(error.message || "An error occurred");
    }
  };

  public undoTransactionReconciliation = async (
    onSuccess?: () => void,
    onError?: (message: string) => void,
  ) => {
    try {
      const variables = {
        input: {
          id: this.selectedTransactionIds[0],
        },
      };
      await this.dataAccessLayer.undoTransactionReconciliation(variables);
      this.setToast({
        status: "success",
        text: "Successfully unreconciled transaction",
        durationSeconds: 10,
      });
      onSuccess?.();
    } catch (error: any) {
      this.setToast({
        status: "error",
        text: error.message || "An error occurred",
        durationSeconds: 10,
      });
      onError?.(error.message || "An error occurred");
    }
  };

  public async loadInitialData(
    transactionsFilters?: FindTransactionsInput,
    expectedPaymentsFilters?: FindExpectedPaymentsInput,
  ) {
    this.setReconSuggestionsLoading(true);
    try {
      const [transactionsResult, expectedPaymentsResult] = await Promise.all([
        this.dataAccessLayer.fetchTransactions(transactionsFilters),
        this.dataAccessLayer.fetchExpectedPayments(expectedPaymentsFilters),
      ]);

      this.setTransactions(transactionsResult.data?.transactions?.edges || []);
      this.setTransactionTotalCount(transactionsResult.data?.transactions?.totalCount || 0);
      this.setTransactionsTotalAmount(BigInt(transactionsResult.data?.transactions?.totalAmount || 0));

      this.setExpectedPayments(expectedPaymentsResult.data?.expectedPayments?.edges || []);
      this.setExpectedPaymentTotalCount(expectedPaymentsResult.data?.expectedPayments?.totalCount || 0);
      this.setExpectedPaymentsTotalAmountRange(
        BigInt(expectedPaymentsResult.data?.expectedPayments?.totalAmountRange?.min || 0),
        BigInt(expectedPaymentsResult.data?.expectedPayments?.totalAmountRange?.max || 0),
      );

      // Potentially fetch AI suggestions based on loaded data
      // const suggestions = await this.aiPredictionService.getReconciliationSuggestions(this.transactions, this.expectedPayments);
      // this.setSuggestedExpectedPayments(suggestions);

    } catch (error) {
      console.error("Failed to load initial data:", error);
      this.setErrorMessage("Failed to load initial reconciliation data.");
      this.setToast({
        status: "error",
        text: "Failed to load initial reconciliation data.",
        durationSeconds: 10,
        dismissable: true,
      });
    } finally {
      this.setReconSuggestionsLoading(false);
    }
  }


  reset() {
    this.setRefresh();
    this.manualMatches = [];
    this.selectedTransactionIds = [];
    this.selectedExpectedPaymentIds = [];
    this.suggestedExpectedPayments = [];
    this.selectEverythingExpectedPayments = false;
    this.selectEverythingTransactions = false;
    this.setToast(null);
    this.setErrorMessage(null);
  }
}
