// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState } from "react";
import ListView from "~/app/components/ListView";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import {
  OutOfToleranceMatchesTableDocument,
  OutOfToleranceMatchesTableQuery,
  OutOfToleranceMatchesTableQueryResult,
  PricelineOutOfToleranceMetricsQuery,
  PricelineOutOfToleranceMetricsQueryVariables,
  usePricelineOutOfToleranceMetricsQuery,
  useReconcilePricelineTransactionsMutation,
} from "~/generated/dashboard/graphqlSchema";
import { TRANSACTION } from "~/generated/dashboard/types/resources";
import { TransactionDisplayColumnsEnum } from "~/generated/dashboard/types/resourceDisplayColumns";
import { formatAmount } from "~/common/utilities/formatAmount";
import { cn } from "~/common/utilities/cn";
import useErrorBanner from "~/common/utilities/useErrorBanner";
import OverviewBar, {
  OverviewCard,
} from "../dashboard/widgets/reconciliation_overview/OverviewBar";
import { mapNewTransactionQueryToVariables } from "~/common/search_components/transactionSearchComponents";

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

type Transaction =
  OutOfToleranceMatchesTableQuery["transactions"]["edges"][number]["node"];

const CONSTANT_QUERY_PARAMS = ["posted", "reconciled", "internalAccountIds"];

function getVariance(transaction: Transaction) {
  const { metadataJson } = transaction;

  const parsed = JSON.parse(metadataJson || "{}") as { variance: string };
  return Number(parsed?.variance || 0);
}

export default function PricelineReconciliationView() {
  const flashError = useErrorBanner();
  const initialQueryParams = {
    reconciled: "false",
    metadata: '{"out_of_tolerance_match":"true"}',
  };
  const [transactionTableQuery, setTransactionTableQuery] = useState(
    initialQueryParams as Partial<PricelineOutOfToleranceMetricsQueryVariables>,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    string[]
  >([]);
  const [selectedVarianceTotal, setSelectedVarianceTotal] = useState<number>(0);
  const [selectedTransactionAmountSum, setSelectedTransactionAmountSum] =
    useState<number>(0);
  const [refetch, setRefetch] = useState(Date.now());
  const { data: metricsData, refetch: refetchMetrics } =
    usePricelineOutOfToleranceMetricsQuery({
      variables: transactionTableQuery,
    });

  const metrics: PricelineOutOfToleranceMetricsQuery["pricelineOutOfToleranceMetrics"] =
    metricsData?.pricelineOutOfToleranceMetrics || {
      totalCount: 0,
      totalPricelineAmount: 0,
      totalSupplierAmount: 0,
      totalVariance: 0,
      overChargedSum: 0,
      underChargedSum: 0,
      overChargedCount: 0,
      underChargedCount: 0,
    };
  const {
    totalCount,
    totalPricelineAmount,
    totalSupplierAmount,
    totalVariance,
    overChargedSum,
    underChargedSum,
    overChargedCount,
    underChargedCount,
  } = {
    totalCount: metrics.totalCount,
    totalPricelineAmount: Number(metrics.totalPricelineAmount),
    totalSupplierAmount: Number(metrics.totalSupplierAmount),
    totalVariance: Number(metrics.totalVariance),
    overChargedSum: Number(metrics.overChargedSum),
    underChargedSum: Number(metrics.underChargedSum),
    overChargedCount: metrics.overChargedCount,
    underChargedCount: metrics.underChargedCount,
  };

  useEffect(() => {
    void refetchMetrics(transactionTableQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionTableQuery]);

  const [reconcilePricelineTransactionsMutation] =
    useReconcilePricelineTransactionsMutation();

  const reconcilePricelineTransactions = () => {
    reconcilePricelineTransactionsMutation({
      variables: {
        input: {
          transactionIds: selectedTransactionIds,
        },
      },
    })
      .then((result) => {
        if (result.data) {
          void refetchMetrics();
          setRefetch(Date.now());
          setSelectedVarianceTotal(0);
          setSelectedTransactionAmountSum(0);
        }
      })
      .catch(() => {
        flashError("Failed to reconcile Transactions");
      });
  };
  return (
    <PageHeader
      title="Out-of-Tolerance Matches"
      right={
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-row items-center justify-center gap-4">
            <Statistics
              value={formatAmount(selectedTransactionAmountSum)}
              label={`TRANSACTIONS (${selectedTransactionIds.length})`}
            />
            <Statistics
              label="VARIANCE"
              valueTextColor="text-orange-300a"
              value={formatAmount(selectedVarianceTotal)}
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-y-4">
        <OverviewBar title="Unresolved Matches">
          <OverviewCard title="Total Count" value={totalCount} />
          <OverviewCard
            title="Total Priceline Amount"
            value={formatAmount(Number(totalPricelineAmount))}
          />
          <OverviewCard
            title="Total Supplier Amount"
            value={formatAmount(Number(totalSupplierAmount))}
          />
          <OverviewCard
            title="Total Variance"
            value={formatAmount(Number(totalVariance))}
          />
          <OverviewCard
            title={`Overcharged Total (${overChargedCount ?? 0})`}
            value={formatAmount(Number(overChargedSum))}
          />
          <OverviewCard
            title={`Undercharged Total (${underChargedCount ?? 0})`}
            value={formatAmount(Number(underChargedSum))}
          />
        </OverviewBar>
        <ListView
          resource={TRANSACTION}
          mapQueryToVariables={(query) => ({
            ...mapNewTransactionQueryToVariables(query),
            ...transactionTableQuery,
          })}
          legacyFilterMappers={{
            queryToFilters: (query) => ({ ...query, ...transactionTableQuery }),
            queryToGraphqlArguments: (query) => ({
              ...query,
              ...transactionTableQuery,
            }),
            filtersToLegacyFormat: (query) => query,
          }}
          graphqlDocument={OutOfToleranceMatchesTableDocument}
          constantQueryParams={CONSTANT_QUERY_PARAMS}
          onQueryArgChangeCallback={(query) => {
            setTransactionTableQuery(query);
          }}
          onDataChange={(_query, data) => {
            const typedResult = data as
              | OutOfToleranceMatchesTableQueryResult["data"]
              | undefined;
            if (!typedResult) return;
            setTransactions(
              typedResult.transactions.edges.map((edge) => edge.node),
            );
          }}
          setSelectedRowCallback={(transactionIds) => {
            const selectedTransactions = transactions.filter((transaction) =>
              transactionIds.includes(transaction.id),
            );
            const varianceTotal = selectedTransactions.reduce(
              (acc, transaction) => acc + getVariance(transaction),
              0,
            );
            const amountTotal = selectedTransactions.reduce(
              (acc, transaction) => acc + Number(transaction.amount),
              0,
            );
            setSelectedVarianceTotal(varianceTotal);
            setSelectedTransactionAmountSum(amountTotal);
            setSelectedTransactionIds(selectedTransactions.map((t) => t.id));
          }}
          overrideCustomColumnValue={{
            [TransactionDisplayColumnsEnum.PricelineExpectedPaymentMatch]: {
              default: true,
            },
            tolerance: { default: true },
            variance: { default: true },
          }}
          overrideFilterValue={{
            reconciled: {
              default: true,
              hidden: false,
              value: "false",
            },
            metadata: {
              default: true,
              hidden: false,
              repeatable: true,
              value: '{"out_of_tolerance_match":"true"}',
            },
          }}
          actions={{
            Reconcile: () => reconcilePricelineTransactions(),
          }}
          refetch={refetch}
          enableExportData
          enableNewFilters
          enableActions
        />
      </div>
    </PageHeader>
  );
}
