// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from "react";
import { ResponsiveContainer, TooltipProps } from "recharts";
import colors from "../../../common/styles/colors";
import { LineChart } from "../../../common/ui-components";
import { balanceFormatter, ChartDataPoint } from "./utilities";

interface SupportingAccountBalanceChartProps {
  balances: ChartDataPoint[];
  currency: string | undefined | null;
}

function SupportingAccountBalanceTooltip({ payload }: TooltipProps) {
  if (payload && payload.length !== 0) {
    const { balance, currency, date } = payload[0].payload;
    return (
      <div className="bg-white p-4 drop-shadow-md">
        <div className="flex flex-col">
          <span>Date: {date}</span>
          <span>Balance: {balanceFormatter(balance, currency)}</span>
        </div>
      </div>
    );
  }

  return null;
}

export default function SupportingAccountBalanceChart({
  balances,
  currency,
}: SupportingAccountBalanceChartProps) {
  return (
    <div>
      {balances.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            key="lineChartKey"
            data={balances}
            dataMapping={[
              {
                color: colors.mist["600"],
                key: "balance",
              },
            ]}
            strokeWidth={2}
            xAxisProps={{
              dataKey: "dayOfWeekShort",
            }}
            yAxisProps={{
              dataKey: "balance",
              tickFormatter: (balance: number) =>
                `${balanceFormatter(balance, currency)}`,
              axisLine: true,
            }}
            tooltipComponent={<SupportingAccountBalanceTooltip />}
          />
        </ResponsiveContainer>
      )}
    </div>
  );
}
