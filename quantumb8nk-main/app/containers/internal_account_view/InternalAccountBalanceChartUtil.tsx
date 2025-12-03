// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import moment, { Moment } from "moment";
import { groupBy, startCase } from "lodash";
import { TooltipProps } from "recharts";

import {
  DateFilterInput,
  HistoricalBalance,
} from "../../../generated/dashboard/graphqlSchema";

export const enum BalanceTypeEnum {
  OpeningLedger = "opening_ledger",
  ClosingLedger = "closing_ledger",
  CurrentLedger = "current_ledger",
  OpeningAvailable = "opening_available",
  OpeningAvailableNextBusinessDay = "opening_available_next_business_day",
  ClosingAvailable = "closing_available",
  CurrentAvailable = "current_available",
}

const defaultBalanceTypeOptions = [
  { value: BalanceTypeEnum.CurrentAvailable, label: "Current Available" },
  { value: BalanceTypeEnum.ClosingAvailable, label: "Closing Available" },
  { value: BalanceTypeEnum.CurrentLedger, label: "Current Ledger" },
  { value: BalanceTypeEnum.ClosingLedger, label: "Closing Ledger" },
];

export interface ChartDataPoint {
  amount: number;
  prettyAmount: string;
  balanceType: string;
  currency: string | undefined | null;
  date: Moment;
  dateShort: string;
  dateShortest: string;
  dayOfWeekShort: string;
  dayOfWeek: string;
}

function mapHistoricalBalanceToBarChartData(
  historicalBalance: HistoricalBalance,
) {
  const { currency, prettyAmount, balanceType } = historicalBalance;

  // cannot destructure amount & asOfDate due to @typescript-eslint/no-unsafe-assignment
  const amount = (historicalBalance ?? {}).amount as number;
  const { asOfDate } = historicalBalance ?? {};

  const date = moment(asOfDate);

  const data: ChartDataPoint = {
    prettyAmount,
    balanceType: startCase(balanceType),
    amount: Number(amount),
    currency: currency ?? "USD",
    date,
    dateShortest: date.format("MM/DD"),
    dateShort: date.format("ddd, MMM D"),
    dayOfWeekShort: date.format("ddd"),
    dayOfWeek: date.format("dddd").toLowerCase(),
  };

  return data;
}

function getLatestHistoricalBalancesByWeek(
  historicalBalances: HistoricalBalance[],
) {
  // Group latest balance by week number and year
  const balancesByWeek = historicalBalances.reduce(
    (result: { [key: string]: HistoricalBalance }, historicalBalance) => {
      const { asOfDate } = historicalBalance ?? {};
      const week = moment(asOfDate).isoWeek();
      const year = moment(asOfDate).isoWeekYear();
      const key = `${year}-${week}`;
      const newResult = { ...result };
      if (
        !result[key] ||
        moment(asOfDate).isAfter((result[key] ?? {}).asOfDate)
      ) {
        newResult[key] = historicalBalance;
      }
      return newResult;
    },
    {},
  );

  // Get the latest balances from each week
  return Object.values(balancesByWeek);
}

function shouldFilterHistoricalBalances(
  dateRange: DateFilterInput,
  historicalBalances: HistoricalBalance[],
) {
  if (historicalBalances.length > 100) return true;
  const { inTheLast } = dateRange;

  const gte = (dateRange ?? {}).gte as string;
  const lte = (dateRange ?? {}).lte as string;

  if (lte && gte) {
    return moment(lte).diff(moment(gte), "days") > 30;
  }

  if (gte) {
    return moment().diff(moment(gte), "days") > 30;
  }

  if (inTheLast && inTheLast.unit === "weeks") {
    return (inTheLast.amount ?? 1) > 4;
  }

  if (inTheLast && inTheLast.unit === "months") {
    return (inTheLast.amount ?? 1) > 1;
  }

  return false;
}

export function toChartData(
  historicalBalances: HistoricalBalance[],
  dateRange: DateFilterInput,
): { [key: string]: ChartDataPoint[] } {
  const balancesByBalanceType = groupBy(historicalBalances, "balanceType");

  const balancesByBalanceTypeAndDate = {};

  Object.keys(balancesByBalanceType).forEach((balanceType) => {
    const balances = balancesByBalanceType[balanceType];

    // reduce (downsample) balances if too many data points
    const filteredHistoricalBalances = shouldFilterHistoricalBalances(
      dateRange,
      balances,
    )
      ? getLatestHistoricalBalancesByWeek(balances)
      : balances;

    balancesByBalanceTypeAndDate[balanceType] = filteredHistoricalBalances.map(
      mapHistoricalBalanceToBarChartData,
    );
  });

  // chart data points per balance type
  return balancesByBalanceTypeAndDate;
}

export const extractBalanceTypeOptions = (balancesByBalanceType: {
  [balanceType: string]: ChartDataPoint[];
}) => {
  const balanceTypes = Object.keys(balancesByBalanceType);

  if (!balanceTypes.length) {
    return defaultBalanceTypeOptions;
  }

  return Object.keys(balancesByBalanceType).map((balanceType) => ({
    label: startCase(balanceType),
    value: balanceType as BalanceTypeEnum,
  }));
};

export const extractDefaultBalanceType = (
  historicalBalances: HistoricalBalance[],
) => {
  const balance = historicalBalances.find(
    (historicalBalance) => Number(historicalBalance.amount) > 0.0,
  );

  return balance
    ? (balance.balanceType as BalanceTypeEnum)
    : BalanceTypeEnum.CurrentAvailable;
};

export function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload) return null;

  const { prettyAmount, dateShort, balanceType } = payload[0]
    .payload as ChartDataPoint;

  return (
    <div className="rounded-md border bg-white p-4 drop-shadow-md">
      <span>{balanceType}</span>
      <div>
        <code className="font-medium text-green-600">{prettyAmount}</code>
        <code>
          <div>{dateShort}</div>
        </code>
      </div>
    </div>
  );
}

export interface ChartProps {
  data: ChartDataPoint[];
  internalAccountId?: string;
  internalAccountCurrency: string;
}
