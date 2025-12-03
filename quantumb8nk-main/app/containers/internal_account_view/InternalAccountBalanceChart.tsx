// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useMemo } from "react";
import { startCase } from "lodash";
import { v4 } from "uuid";
import ChartView from "../../../common/ui-components/Charts/ChartView";

import { useHistoricalBalancesViewQuery } from "../../../generated/dashboard/graphqlSchema";
import DateSearch, {
  dateSearchMapper,
} from "../../components/search/DateSearch";
import { DateRangeFormValues } from "../../../common/ui-components";
import { InternalAccountBalanceBarChart } from "./InternalAccountBalanceBarChart";
import {
  BalanceTypeEnum,
  ChartDataPoint,
  toChartData,
  extractBalanceTypeOptions,
  extractDefaultBalanceType,
} from "./InternalAccountBalanceChartUtil";
import PlaceholderLineChart from "../../components/PlaceholderLineChart";
import { ACCOUNT_DATE_RANGE_FILTER_OPTIONS } from "../reconciliation/utils";
import ROMASelectField from "../../../common/ui-components/Select/ROMASelectField";
import { ACCOUNT_ACTIONS } from "../../../common/constants/analytics";
import trackEvent from "../../../common/utilities/trackEvent";

function InternalAccountBalanceChartCaption({
  data,
  balanceType,
}: {
  data: ChartDataPoint[];
  balanceType: BalanceTypeEnum;
}) {
  if (!data.length) {
    return null;
  }

  const latestBalanceChartDataPoint = data[data.length - 1];
  const { prettyAmount } = latestBalanceChartDataPoint;

  return (
    <div className="flex flex-row gap-10 pb-4">
      <div className="flex flex-col">
        <span className="text-gray-400">{startCase(balanceType)}</span>
        <span className="text-lg text-gray-800">{prettyAmount}</span>
      </div>
    </div>
  );
}

interface InternalAccountBalanceChartProps {
  internalAccountId: string;
  internalAccountCurrency: string;
  dateRange?: DateRangeFormValues;
  setGlobalDateFilterLabel?: () => void;
}

interface InternalAccountBalanceChartQuery {
  dateRange: DateRangeFormValues;
  entityId: string;
}

function renderChart(
  data: ChartDataPoint[],
  internalAccountId: string,
  internalAccountCurrency: string,
) {
  return (
    <InternalAccountBalanceBarChart
      data={data}
      internalAccountCurrency={internalAccountCurrency}
      internalAccountId={internalAccountId}
    />
  );
}

function InternalAccountBalanceChart({
  internalAccountId,
  internalAccountCurrency,
  dateRange,
  setGlobalDateFilterLabel,
}: InternalAccountBalanceChartProps) {
  const [balanceType, setBalanceType] = useState(
    BalanceTypeEnum.ClosingAvailable,
  );
  const [query, setQuery] = useState<InternalAccountBalanceChartQuery>({
    dateRange: dateRange || ACCOUNT_DATE_RANGE_FILTER_OPTIONS[1].dateRange,
    entityId: internalAccountId,
  });

  const { data, loading, error, refetch } = useHistoricalBalancesViewQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      ...query,
      dateRange: dateSearchMapper(query.dateRange),
    },
  });

  const handleRefetch = async (newQuery: InternalAccountBalanceChartQuery) => {
    await refetch({
      ...newQuery,
      dateRange: dateSearchMapper(newQuery.dateRange),
    });
    setQuery(newQuery);
  };

  useEffect(() => {
    void handleRefetch({
      ...query,
      ...(dateRange && { dateRange }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const chartDataByBalanceType = useMemo(
    () =>
      loading || error || !data
        ? {}
        : (toChartData(
            [...(data?.historicalBalances || [])].reverse(),
            dateSearchMapper(query.dateRange),
          ) as { [balanceType: string]: ChartDataPoint[] }),
    [loading, error, data, query],
  );

  useEffect(() => {
    const defaultBalanceType = extractDefaultBalanceType([
      ...(data?.historicalBalances || []),
    ]);
    setBalanceType(defaultBalanceType);
  }, [data]);

  const searchComponents = [
    {
      options: extractBalanceTypeOptions(chartDataByBalanceType),
      component: ROMASelectField,
      selectValue: balanceType,
      placeholder: "Select Balance Type",
      isSearchable: false,
      handleChange: (_, field: { value: string }) => {
        const { value } = field;
        setBalanceType(value as BalanceTypeEnum); // Add 'await' here
      },
    },
    {
      field: "dateRange",
      query,
      options: ACCOUNT_DATE_RANGE_FILTER_OPTIONS,
      component: DateSearch,
      updateQuery: (input: Record<string, DateRangeFormValues>) => {
        trackEvent(null, ACCOUNT_ACTIONS.CHANGED_WIDGET_DATE_FILTER, {
          widget: "InternalAccount Balance Chart",
        });
        void handleRefetch({ ...query, dateRange: input.dateRange });
      },
      setGlobalDateFilterLabel,
      key: v4(),
      autoWidth: true,
      showStartAndEndDateArrow: false,
    },
  ];

  const emptyChartData: Array<ChartDataPoint> = [];
  const chartData = chartDataByBalanceType[balanceType] ?? emptyChartData;

  return (
    <ChartView
      title="Account Balance"
      className="bg-background-default"
      loading={Boolean(loading)}
      caption={
        <InternalAccountBalanceChartCaption
          data={chartData}
          balanceType={balanceType}
        />
      }
      searchComponents={searchComponents}
    >
      {chartData.length ? (
        renderChart(chartData, internalAccountId, internalAccountCurrency)
      ) : (
        <div className="flex flex-grow items-center justify-center">
          <PlaceholderLineChart
            content={`${startCase(
              balanceType,
            )} balances not found in this date range.`}
          />
        </div>
      )}
    </ChartView>
  );
}

export default InternalAccountBalanceChart;
