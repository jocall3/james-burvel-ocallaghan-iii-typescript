// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useEffect, useState } from "react";
import * as Sentry from "@sentry/browser";
import { observer } from "mobx-react-lite";
import { uniqBy } from "lodash";
import ListView from "~/app/components/ListView";
import { TRANSACTION } from "~/generated/dashboard/types/resources";
import { mapNewTransactionQueryToVariables } from "~/common/search_components/transactionSearchComponents";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import {
  LiveConfigurationView,
  LoadingLine,
  Stack,
} from "~/common/ui-components";
import {
  ReconciliationSuggestion,
  TransactionsTableQueryResult,
  TransactionsTableDocument,
  useCalculateTransactionsTotalAmountLazyQuery,
  useGenerateExpectedPaymentReconSuggestionsMutation,
  useTransactionsTableCountLazyQuery,
} from "../../../../generated/dashboard/graphqlSchema";
import { getDrawerContent } from "../../../../common/utilities/getDrawerContent";
import useLiveConfiguration from "../../../../common/utilities/useLiveConfiguration";
import { cn } from "~/common/utilities/cn";
import useQueryParams from "~/app/components/filter/useQueryParams";
import CreateTransactionButton from "./CreateTransactionButton";

const CONSTANT_QUERY_PARAMS = ["posted", "reconciled", "internalAccountIds"];

interface EmptyTransactionsTableProps {
  internalAccountIds?: string[];
}

export function mapQueryToVariablesTransactions(
  balanceReconEnabledFlag: boolean,
  query: Record<string, unknown>,
) {
  const newQuery = balanceReconEnabledFlag
    ? {
        ...query,
        unledgeredOrUnreconciled: "unledgered_or_unreconciled",
      }
    : {
        ...query,
        reconciled:
          query.reconciled !== undefined ? query.reconciled : "unreconciled",
      };

  return mapNewTransactionQueryToVariables(newQuery);
}

function EmptyTransactionsTable({
  internalAccountIds = [],
}: EmptyTransactionsTableProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 text-center font-medium not-italic text-gray-500">
      {internalAccountIds.length === 0 ? (
        <div className="text-base">Select an Account</div>
      ) : (
        <div className="text-base">No Transactions</div>
      )}
    </div>
  );
}

interface TransactionsTableProps {
  internalAccountIds?: string[];
  disableBulkActions?: boolean;
}

function TransactionsTable({
  internalAccountIds,
  disableBulkActions = false,
}: TransactionsTableProps) {
  const [enableScrollX, setEnableScrollX] = useState(false);
  const { data: dataStore } = useReconSplitViewStore();
  const {
    transactions,
    setTransactions,
    transactionTotalCount,
    setTransactionTotalCount,
    selectedTransactionIds,
    setSelectedTransactionIds,
    refresh,
    setReconSuggestionsLoading,
    setSuggestedExpectedPayments,
    setTransactionsTotalAmount,
    setSelectEverythingTransactions,
  } = dataStore;

  const [generateReconSuggestionsMutation] =
    useGenerateExpectedPaymentReconSuggestionsMutation();
  const [getTransactionsTableCountQuery, { loading }] =
    useTransactionsTableCountLazyQuery();

  const [getTransactionsSelectEverythingTotalAmountQuery] =
    useCalculateTransactionsTotalAmountLazyQuery();

  async function generateReconSuggestions(transactionIds: string[]) {
    setReconSuggestionsLoading(true);
    const { data } = await generateReconSuggestionsMutation({
      variables: {
        input: {
          selectedTransactionIds: [transactionIds[0]],
        },
      },
    });
    setReconSuggestionsLoading(false);

    if (data?.generateExpectedPaymentReconSuggestions) {
      const reconciliationSuggestions =
        data?.generateExpectedPaymentReconSuggestions
          ?.reconciliationSuggestions;

      if (
        reconciliationSuggestions &&
        reconciliationSuggestions?.length > 0 &&
        transactionIds.length === 1
      ) {
        setSuggestedExpectedPayments(
          reconciliationSuggestions as ReconciliationSuggestion[],
        );
      } else {
        setSuggestedExpectedPayments([]);
      }
    }
  }

  const [balanceReconEnabledFlag] = useLiveConfiguration({
    featureName: "ledgers_balance_recon_enabled",
  });
  const [selectAllEnabled] = useLiveConfiguration({
    featureName: "reconciliation_select_all",
  });
  const [getFilters] = useQueryParams();

  const handleSelectEverythingTransactionsTotalAmount = useCallback(
    (query?: Record<string, unknown>) => {
      const defaultQuery = balanceReconEnabledFlag
        ? {
            internalAccountIds,
            unledgeredOrUnreconciled: "unledgered_or_unreconciled",
          }
        : {
            internalAccountIds,
            reconciled: query?.reconciled
              ? (query.reconciled as string)
              : "unreconciled",
          };

      getTransactionsSelectEverythingTotalAmountQuery({
        variables: {
          ...mapNewTransactionQueryToVariables({
            ...query,
            ...defaultQuery,
          }),
        },
        fetchPolicy: "no-cache",
      })
        .then((response) => {
          const totalAmount = response.data?.calculateTransactionsTotalAmount
            ?.totalAmount as bigint;

          setTransactionsTotalAmount(totalAmount || BigInt(0));
        })
        .catch((err) => {
          Sentry.captureException(err);
        });
    },
    [
      getTransactionsSelectEverythingTotalAmountQuery,
      setTransactionsTotalAmount,
      internalAccountIds,
      balanceReconEnabledFlag,
    ],
  );

  const handleTableCount = useCallback(
    (query?: Record<string, unknown>) => {
      const defaultQuery = balanceReconEnabledFlag
        ? {
            internalAccountIds,
            unledgeredOrUnreconciled: "unledgered_or_unreconciled",
          }
        : {
            internalAccountIds,
            reconciled: query?.reconciled
              ? (query.reconciled as string)
              : "unreconciled",
          };

      getTransactionsTableCountQuery({
        variables: {
          ...mapNewTransactionQueryToVariables({
            ...query,
            ...defaultQuery,
          }),
        },
        fetchPolicy: "no-cache",
      })
        .then((response) => {
          setTransactionTotalCount(response.data?.transactions.totalCount || 0);
        })
        .catch((err) => {
          Sentry.captureException(err);
        });
    },
    [
      getTransactionsTableCountQuery,
      internalAccountIds,
      setTransactionTotalCount,
      balanceReconEnabledFlag,
    ],
  );

  useEffect(() => {
    if (internalAccountIds?.length === 0) {
      setSuggestedExpectedPayments([]);
    }
    const initialParse = getFilters(TRANSACTION);
    handleTableCount(initialParse);
    if (selectAllEnabled) {
      handleSelectEverythingTransactionsTotalAmount(initialParse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    handleTableCount,
    handleSelectEverythingTransactionsTotalAmount,
    selectAllEnabled,
  ]);

  return (
    <Stack
      id="transactions-table"
      className="h-full grid-rows-[25px_minmax(100px,_1fr)] gap-3"
      style={{
        height: "calc(100vh - 125px)",
      }}
    >
      <div
        className={cn(
          "flex flex-1 gap-2 px-4",
          loading && "items-center",
          !loading && "items-end justify-between px-4",
        )}
      >
        <div className="flex items-baseline">
          <p className="text-base font-medium text-gray-700">Transactions</p>
          {loading && (
            <div className="w-8">
              <LoadingLine />
            </div>
          )}
          {!loading && (
            <div className="pl-2 text-xs text-gray-500">
              {transactionTotalCount || "0"}
            </div>
          )}
        </div>
        <div>
          <LiveConfigurationView
            featureName="side_by_side_create_transaction_button"
            enabledView={<CreateTransactionButton />}
          />
        </div>
      </div>
      <ListView
        resource={TRANSACTION}
        graphqlDocument={TransactionsTableDocument}
        mapQueryToVariables={(query: Record<string, unknown>) =>
          mapQueryToVariablesTransactions(
            Boolean(balanceReconEnabledFlag),
            query,
          )
        }
        enableActions
        enableNewFilters
        scrollX={enableScrollX}
        renderDrawerContent={getDrawerContent}
        constantQueryParams={CONSTANT_QUERY_PARAMS}
        initialSelectedRows={dataStore.selectedTransactionIds}
        setSelectedRowCallback={(transactionIds) => {
          setSelectedTransactionIds(transactionIds);
          void generateReconSuggestions(transactionIds);
        }}
        onDataChange={(
          query: Record<string, unknown>,
          data?: Record<string, unknown>,
        ) => {
          const typedResult = data as
            | TransactionsTableQueryResult["data"]
            | undefined;
          if (typedResult) {
            const unqiueTransactions = uniqBy(
              [...typedResult.transactions.edges, ...transactions],
              (element) => element.node.id,
            );

            setTransactions(unqiueTransactions);
            setEnableScrollX(typedResult.transactions.edges.length > 0);
            handleTableCount(query);
            if (selectAllEnabled) {
              handleSelectEverythingTransactionsTotalAmount(query);
            }
            if (selectedTransactionIds.length > 1) {
              setSuggestedExpectedPayments([]);
            }
          }
        }}
        constantQueryVariables={{
          internalAccountIds,
        }}
        overrideFilterValue={
          balanceReconEnabledFlag
            ? {
                unledgeredOrUnreconciled: {
                  default: true,
                  value: "unledgered_or_unreconciled",
                },
              }
            : {
                reconciled: {
                  hidden: true,
                  value: "unreconciled",
                },
              }
        }
        filterIdsToRemove={[
          "internalAccountIds",
          "reconciledItemTypes",
          "reconciliationRuleId",
          "connectionId",
        ]}
        refetch={refresh}
        enableExportData={false}
        customViewName="transaction_reconciliation_split_view"
        overrideCustomColumnValue={{
          asOfDate: { default: true },
          amountWithDirection: { default: true },
          prettyAmountUnreconciledToExpectedPayment: { default: true },
          description: { default: true },
        }}
        emptyDataRowText={
          <EmptyTransactionsTable internalAccountIds={internalAccountIds} />
        }
        onQueryArgChangeCallback={(filters: Record<string, unknown>) => {
          if (selectAllEnabled) {
            handleSelectEverythingTransactionsTotalAmount(filters);
          }
          handleTableCount(filters);
        }}
        totalCount={transactionTotalCount}
        setSelectEverythingCallback={
          selectAllEnabled ? setSelectEverythingTransactions : undefined
        }
        disableBulkActions={disableBulkActions}
        stickyHeader
      />
    </Stack>
  );
}

export default observer(TransactionsTable);
