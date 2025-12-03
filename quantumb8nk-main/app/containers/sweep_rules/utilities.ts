// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/* eslint-disable @typescript-eslint/no-unused-vars */
export function balanceFormatter(
  value: number,
  currency: string | null | undefined,
): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 100000).toFixed(0)}k`;
  }
  const safeCurrencyString = currency || "USD";
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrencyString,
  }).format(value / 100.0);
}

export interface OccursOnDayArgs {
  date: Date;
  start?: Date;
  end?: Date;
  selectedDays?: string[];
  every: string;
  interval: number;
  timeZone?: string;
}

// This is a placeholder until we implement a recurrence library
export function occursOnDay({
  date,
  start,
  end,
  selectedDays,
  every,
  interval,
  timeZone,
}: OccursOnDayArgs): boolean {
  const between = start && end ? date >= start && date <= end : true;
  if (every === "day") {
    return between;
  }
  if (every === "week" && selectedDays) {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return selectedDays.includes(days[date.getDay()]) && between;
  }
  return false;
}

export interface ChartDataPoint {
  balance: number;
  currency: string | undefined | null;
  date: string;
  sweepAmount: number;
  hasSweepOnDay?: boolean;
  dayOfWeekShort: string;
  dayOfWeek: string;
  activeAboveTarget?: number;
  activeBelowTarget?: number;
  activeAtTarget?: number;
  activeUpToTarget?: number;
  inactive?: number;
}
