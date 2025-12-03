// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/* eslint-disable @typescript-eslint/ban-ts-comment */

import React from "react";
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import colors from "../../../common/styles/colors";
import { BalanceReportFragment } from "../../../generated/dashboard/graphqlSchema";
import { balanceFormatter, ChartDataPoint } from "./utilities";

interface ManagedAccountBalanceChartProps {
  targetBalance: number;
  currency: string | undefined | null;
  balanceReports: BalanceReportFragment[];
  balances: ChartDataPoint[];
}

interface ManagedAccountChartTooltipPayloadItem {
  payload: {
    balance: number;
    currency: string | undefined | null;
    date: string;
    sweepAmount: number;
    hasSweepOnDay: boolean;
    dayOfWeekShort: string;
    dayOfWeek: string;
    activeAboveTarget: number;
    activeBelowTarget: number;
  };
}

interface ManagedAccountChartTooltipProps {
  active: boolean;
  payload: ManagedAccountChartTooltipPayloadItem[];
}

function ManagedAccountChartTooltip(props: ManagedAccountChartTooltipProps) {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const firstItem = payload[0].payload;
    const { balance, date, sweepAmount, currency } = firstItem;

    return (
      <div className="custom-tooltip m-2 bg-white p-2">
        <p className="label">{`Balance: ${balanceFormatter(
          balance,
          currency,
        )}`}</p>
        <p className="label">{`Sweep amount: ${balanceFormatter(
          -1 * sweepAmount,
          currency,
        )}`}</p>
        <p className="label">{`Date: ${date}`}</p>
      </div>
    );
  }

  return null;
}

export default function ManagedAccountBalanceChart({
  balanceReports,
  balances,
  currency,
  targetBalance,
}: ManagedAccountBalanceChartProps) {
  return (
    <div>
      {balanceReports.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={balances}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="dayOfWeekShort" />
            <YAxis
              tickFormatter={(value: number) =>
                balanceFormatter(value, currency)
              }
            />
            <Tooltip
              content={ManagedAccountChartTooltip}
              cursor={{ fill: "transparent" }}
            />
            <Bar
              dataKey="activeBelowTarget"
              stackId="1"
              fill={colors.mist[100]}
              id="belowTarget"
              name="activeBelowTarget"
            />
            <Bar
              dataKey="activeAtTarget"
              stackId="1"
              fill={colors.mist[700]}
              id="belowTarget"
              name="activeAtTarget"
            />
            <Bar
              dataKey="activeAboveTarget"
              stackId="1"
              fill={colors.mist[400]}
              id="belowTarget"
              name="activeAboveTarget"
            />
            <Bar
              dataKey="activeUpToTarget"
              stackId="1"
              fill="transparent"
              id="belowTarget"
              name="activeUpToTarget"
            />
            <Bar
              dataKey="inactive"
              stackId="1"
              fill="#D2D8D8"
              id="belowTarget"
              name="inactive"
            />
            <ReferenceLine
              y={targetBalance}
              label={{
                // @ts-ignore
                position: "top",
                value: `Target Balance ${targetBalance / (1000 * 100)}k`,
                fill: colors.mist[800],
              }}
              strokeDasharray="5 5"
              isOverflow="extendDomain"
              stroke={colors.mist[800]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
