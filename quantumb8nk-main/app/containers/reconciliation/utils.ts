// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import {
  TimeFormatEnum,
  TimeUnitEnum,
} from "../../../generated/dashboard/graphqlSchema";

export const formatCount = (count: number, decimalDigits?: number) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  });

  return formatter.format(count);
};

export const buildFilters = (internalAccountId: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("internalAccountIds", internalAccountId);
  return searchParams.toString();
};
export interface GroupType {
  groupId: string;
  currency: string;
  bestName: string;
  [key: string]: string | number | null;
  childrenCount: number;
}

export const DATE_RANGE_FILTERS = {
  PastDay: {
    value: "today",
    label: "Past 24h",
    dateRange: {
      inTheLast: { unit: TimeUnitEnum.Days, amount: "1" },
      format: TimeFormatEnum.Duration,
    },
  },
  PastWeek: {
    value: "pastWeek",
    label: "Past Week",
    dateRange: {
      inTheLast: { unit: TimeUnitEnum.Weeks, amount: "1" },
      format: TimeFormatEnum.Duration,
    },
  },
  PastMonth: {
    value: "pastMonth",
    label: "Past Month",
    dateRange: {
      inTheLast: { unit: TimeUnitEnum.Months, amount: "1" },
      format: TimeFormatEnum.Duration,
    },
  },
  PastQuarter: {
    value: "pastQuarter",
    label: "Past Quarter",
    dateRange: {
      inTheLast: { unit: TimeUnitEnum.Months, amount: "3" },
      format: TimeFormatEnum.Duration,
    },
  },
  PastYear: {
    value: "pastYear",
    label: "Past Year",
    dateRange: {
      inTheLast: { unit: TimeUnitEnum.Years, amount: "1" },
      format: TimeFormatEnum.Duration,
    },
  },
};

export const ACCOUNT_DATE_RANGE_FILTER_OPTIONS =
  Object.values(DATE_RANGE_FILTERS);
