// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect } from "react";
import moment from "moment";
import { isEmpty } from "lodash";
import { cn } from "~/common/utilities/cn";
import { SelectField } from "../../../common/ui-components";
import {
  useBalanceReportsReportsViewQuery,
  BalanceReportFragment,
} from "../../../generated/dashboard/graphqlSchema";
import { occursOnDay, ChartDataPoint } from "./utilities";
import ManagedAccountBalanceChart from "./ManagedAccountBalanceChart";
import SupportingAccountBalanceChart from "./SupportingAccountBalanceChart";

interface AccountBalanceChartProps {
  targetBalance: number;
  managedAccountLabel: string;
  managedAccountId: string;
  supportingAccountLabel: string;
  supportingAccountId: string;
  selectedDays?: string[];
  every: string;
  interval: number;
  endDate?: string;
  timeZone: string;
}

type ScheduleParams = {
  every: string;
  interval: number;
  selectedDays?: string[];
  start: moment.Moment;
  end: moment.Moment;
  timeZone: string;
};

const filterDuplicateBalances = (balances: BalanceReportFragment[]) => {
  const seenBalances = new Set();
  return balances.filter((report: BalanceReportFragment) => {
    const duplicateBalance = seenBalances.has(report.asOfDate);
    seenBalances.add(report.asOfDate);
    return !duplicateBalance;
  });
};

function filterBalancesForAccount(
  accountId: string,
  reports: BalanceReportFragment[],
) {
  return reports.filter(
    (report: BalanceReportFragment) => report.internalAccountId === accountId,
  );
}

const mapBalanceReportsToChartData = (
  report: BalanceReportFragment,
  targetBalance: number,
  scheduleParams: ScheduleParams,
): ChartDataPoint => {
  const { every, interval, selectedDays, start, end, timeZone } =
    scheduleParams;
  const { availableAmount, asOfDate, currency: reportCurrency } = report;
  const availableBalanceInt = parseInt(availableAmount, 10);
  const dayOfWeek = moment(asOfDate).format("dddd").toLowerCase();

  const chartData: ChartDataPoint = {
    balance: availableBalanceInt,
    currency: reportCurrency,
    date: moment(asOfDate).format("MM/DD"),
    sweepAmount: 0,
    hasSweepOnDay: false,
    dayOfWeekShort: moment(asOfDate).format("ddd"),
    dayOfWeek,
  };

  // TODO: Do this until we can get a proper recurrence lib in place
  const dayHasSweep = (date) =>
    occursOnDay({
      date,
      every,
      interval,
      selectedDays,
      start: start.toDate(),
      end: end.toDate(),
      timeZone,
    });

  const deltaFromTarget = availableBalanceInt - targetBalance;
  let sweepAmount = 0;

  if (dayHasSweep(moment(asOfDate).toDate())) {
    sweepAmount = deltaFromTarget;
    // if we're above target balance, then we need two stacked bars
    if (deltaFromTarget >= 0) {
      chartData.activeAboveTarget = deltaFromTarget;
      chartData.activeAtTarget = targetBalance;
    } else {
      // if we're below the target balance
      chartData.activeBelowTarget = availableBalanceInt;
      chartData.activeUpToTarget = Math.abs(deltaFromTarget);
    }
  } else {
    chartData.inactive = availableBalanceInt;
  }

  return {
    ...chartData,
    sweepAmount,
    dayOfWeek,
    hasSweepOnDay: dayHasSweep(moment(asOfDate).toDate()),
    balance: availableBalanceInt,
    dayOfWeekShort: moment(asOfDate).format("dd"),
    date: moment(asOfDate).format("MM/DD"),
  };
};

export default function AccountBalanceChart({
  targetBalance,
  managedAccountLabel,
  managedAccountId,
  supportingAccountId,
  supportingAccountLabel,
  selectedDays,
  every,
  interval = 1,
  timeZone,
}: AccountBalanceChartProps) {
  const accountSelectOptions = [
    {
      value: managedAccountId,
      label: managedAccountLabel,
    },
    {
      value: supportingAccountId,
      label: supportingAccountLabel,
    },
  ];
  const startDate = moment().subtract(2, "weeks");
  const [currency, setCurrency] = React.useState<string | undefined | null>(
    "USD",
  );
  const [balanceReports, setBalanceReports] = React.useState<
    BalanceReportFragment[]
  >([]);
  const [selectedAccount, setSelectedAccount] = React.useState<{
    value: string;
    label: string;
  }>({ value: managedAccountId, label: managedAccountLabel });
  const [balances, setBalances] = React.useState<ChartDataPoint[]>([]);
  const [start] = React.useState<moment.Moment>(startDate);
  const [end] = React.useState<moment.Moment>(moment("2032-01-01"));

  // Whenever the InternalAccounts in the form change
  useEffect(() => {
    setSelectedAccount({
      value: supportingAccountId,
      label: supportingAccountLabel,
    });
  }, [supportingAccountId, supportingAccountLabel]);

  useEffect(() => {
    setSelectedAccount({ value: managedAccountId, label: managedAccountLabel });
  }, [managedAccountId, managedAccountLabel]);

  const { data } = useBalanceReportsReportsViewQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      asOfDate: {
        gte: startDate.format("YYYY-MM-DD"),
      },
      internalAccountIds: [selectedAccount.value],
    },
  });

  useEffect(() => {
    if (
      selectedAccount.value &&
      data &&
      data.balanceReports.edges.length === 0
    ) {
      setBalances([]);
      setCurrency(undefined);
      setBalanceReports([]);
    }

    if (selectedAccount.value && data && data.balanceReports.edges.length > 0) {
      const reports = data.balanceReports.edges.map(({ node }) => node);
      const balanceReportsDesc = reports.slice().reverse();
      const selectedAccountBalances = filterBalancesForAccount(
        selectedAccount.value,
        balanceReportsDesc,
      );
      // only show one balance per day per account
      const uniqueByDay = filterDuplicateBalances(selectedAccountBalances);
      const scheduleParams = {
        every,
        interval,
        selectedDays,
        start,
        end,
        timeZone,
      };

      const chartData = uniqueByDay.map((report) =>
        mapBalanceReportsToChartData(report, targetBalance, scheduleParams),
      );

      setBalances(chartData);
      setCurrency(reports[0].currency);
      setBalanceReports(uniqueByDay);
    }
  }, [
    data,
    selectedAccount,
    every,
    selectedDays,
    interval,
    end,
    start,
    targetBalance,
    timeZone,
  ]);

  const onOptionChange = (account: { value: string; label: string }) => {
    setSelectedAccount(account);
  };

  const searchComponents = [
    {
      options: accountSelectOptions,
      component: SelectField,
      selectValue: selectedAccount.value,
      isSearchable: false,
      handleChange: (_, newOption: { value: string; label: string }) =>
        onOptionChange(newOption),
    },
  ];

  const searchComponentElements = searchComponents.map(
    ({ component: Component, ...options }, index) => (
      <Component
        key={accountSelectOptions[index].value}
        classes={cn("w-72")}
        {...options}
      />
    ),
  );

  return (
    <div className="m-4 p-4">
      <div className="flex flex-wrap items-center justify-between pb-4">
        {selectedAccount.label && (
          <h1
            className="font-medium"
            data-tip={`Balance history for ${selectedAccount.label}`}
          >
            {`Historical View: ${
              supportingAccountId ? "" : selectedAccount.label
            }`}
          </h1>
        )}
        {managedAccountId && supportingAccountId && (
          <div className="flex flex-wrap items-center gap-2">
            {searchComponentElements}
          </div>
        )}
      </div>
      {/* <div className="header">{selectedAccount.label}</div> */}
      <div>
        {balanceReports.length === 0 &&
          isEmpty(managedAccountId) &&
          isEmpty(managedAccountLabel) && (
            <div className="text-center">
              <div className="text-muted">
                Select a Target Balance Account to see the balance history
              </div>
            </div>
          )}
        {balanceReports.length === 0 &&
          !isEmpty(selectedAccount.label) &&
          !isEmpty(selectedAccount.value) && (
            <div className="text-center">
              <div className="text-muted">
                No balance reports found for {selectedAccount.label}
              </div>
            </div>
          )}
        {selectedAccount.value === managedAccountId ? (
          <ManagedAccountBalanceChart
            balanceReports={balanceReports}
            balances={balances}
            currency={currency}
            targetBalance={targetBalance}
          />
        ) : (
          <SupportingAccountBalanceChart
            balances={balances}
            currency={currency}
          />
        )}
      </div>
    </div>
  );
}
