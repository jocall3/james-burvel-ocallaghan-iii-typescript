// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import abbreviateAmount from "../../../common/utilities/abbreviateAmount";
import colors from "../../../common/styles/colors";
import { ChartProps, ChartTooltip } from "./InternalAccountBalanceChartUtil";
import {
  XAxisProps,
  YAxisProps,
} from "../../../common/styles/cash_management/charts";

export function InternalAccountBalanceBarChart({
  data,
  internalAccountCurrency,
}: ChartProps) {
  const dateFormatKey = data.length > 10 ? "dateShortest" : "dateShort";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey={dateFormatKey} {...XAxisProps} />
        <YAxis
          tickFormatter={(amount: number) =>
            `${abbreviateAmount(amount / 100, internalAccountCurrency)}`
          }
          {...YAxisProps}
        />
        <Bar dataKey="amount" fill={colors.green[600]} radius={[2, 2, 0, 0]} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
