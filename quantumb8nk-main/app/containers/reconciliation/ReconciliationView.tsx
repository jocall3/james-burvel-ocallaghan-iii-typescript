// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState, useMemo } from "react";
import { map, debounce, sumBy } from "lodash";
import Cookies from "js-cookie";
import { v4 } from "uuid";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";
import useLedgersProductActive from "~/common/utilities/useLedgersProductActive";
import {
  PageHeader,
  DateRangeFormValues,
  Button,
  LiveConfigurationView,
} from "../../../common/ui-components";
import CurrencyDropdown from "../../components/CurrencyDropdown";
import {
  CurrencyEnum,
  useGroupedReconciliationMetricsQuery,
  useBalancesFeedCurrencyTotalsQuery,
} from "../../../generated/dashboard/graphqlSchema";
import DateSearch, {
  dateSearchMapper,
} from "../../components/search/DateSearch";
import { ALL_ACCOUNT_GROUPS_ID, ALL_CONNECTIONS_ID } from "../../constants";
import AccountsOverviewBar from "../dashboard/widgets/reconciliation_overview/Widget";
import MultiAccountGroupSearch from "../../components/search/MultiAccountGroupSearch";
import MultiConnectionSearch from "../../components/search/MultiConnectionSearch";
import { formatAmount } from "../../../common/utilities/formatAmount";
import GroupedAccountTable from "./GroupedAccountTable";
import GroupedAccountTableBody from "./GroupedAccountTableBody";
import GroupedAccountTableFooter from "./GroupedAccountTableFooter";

import {
  GroupTypeEnum,
  GroupTypeOptions,
} from "../../../common/utilities/groupBy";
import { ACCOUNT_DATE_RANGE_FILTER_OPTIONS, formatCount } from "./utils";
import ROMASelectField from "../../../common/ui-components/Select/ROMASelectField";
import { ACCOUNT_ACTIONS } from "../../../common/constants/analytics";
import trackEvent from "../../../common/utilities/trackEvent";
import { useHandleLinkClick } from "~/common/utilities/handleLinkClick";

function ReconciliationView() {
  const [dateRangeQuery, setDateRangeQuery] = useState(() => {
    const storedDateRange = Cookies.get("globalDateRange");
    if (storedDateRange) {
      return { dateRange: JSON.parse(storedDateRange) as DateRangeFormValues };
    }
    return { dateRange: ACCOUNT_DATE_RANGE_FILTER_OPTIONS[1].dateRange };
  });
  const [dateRangeDefaultLabel, setDateRangeDefaultLabel] = useState("");
  const handleLinkClick = useHandleLinkClick();

  const setGlobalDateFilterLabel = () => {
    setDateRangeDefaultLabel("Mixed");
  };
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    CurrencyEnum.Usd,
  );

  // if we're searching, we should display all accounts that match the
  // search term grouped by connection_currency or account group
  const [searchTerm, setSearchTerm] = useState<string>("");
  // if we're not searching, we should display all
  // accounts grouped by connection_currency or account group
  const [groupBy, setGroupBy] = useState(GroupTypeEnum.Banks);

  // Groups for the table. Will either be (connection & currency) or account group
  const [query, setQuery] = useState({
    entityType: "Connection",
    entityIds: [ALL_CONNECTIONS_ID],
    accountSearchName: searchTerm,
    dateRange: dateRangeQuery.dateRange,
  });

  // (mchaudhry05): the /reconcile page uses localStorage to store
  // selected txns and eps, we would like to reset their selections if
  // they navigated away
  useEffect(() => {
    window.localStorage.clear();
  }, []);

  const { data, loading, error, refetch } =
    useGroupedReconciliationMetricsQuery({
      variables: {
        ...query,
        entityType:
          groupBy === GroupTypeEnum.Banks ? "Connection" : "AccountGroup",
        dateRange: dateSearchMapper(dateRangeQuery.dateRange),
        accountSearchName: searchTerm,
      },
    });

  const groups = useMemo(
    () =>
      loading || !data || error
        ? []
        : data?.groupedReconciliationMetric.map((group) => ({
            ...group,
            transactionCount: group.transactionCount || 0,
            unreconciledCount: group.unreconciledCount || 0,
            groupType: group.groupType || "",
            bestName: group.bestName || "",
            childrenCount: group.childrenCount || 0,
          })),
    [data, error, loading],
  );

  const delayedRefetchGroupedReconciliationMetric = useMemo(
    () =>
      debounce(() => {
        void refetch();
      }, 1000),
    [refetch],
  );
  useEffect(() => {
    void delayedRefetchGroupedReconciliationMetric();
  }, [data, searchTerm, delayedRefetchGroupedReconciliationMetric, groupBy]);

  const handleRefetch = async (newQuery: Record<string, unknown>) => {
    setQuery(
      newQuery as unknown as {
        entityIds: string[];
        entityType: string;
        accountSearchName: string;
        dateRange: DateRangeFormValues;
      },
    );

    await refetch({
      ...newQuery,
      dateRange: dateSearchMapper(newQuery.dateRange as DateRangeFormValues),
      accountSearchName: searchTerm,
    });
  };

  const searchComponents = [
    {
      field: "dateRange",
      options: ACCOUNT_DATE_RANGE_FILTER_OPTIONS,
      component: DateSearch,
      validateRange: true,
      isSearchable: false,
      updateQuery: (input: Record<string, DateRangeFormValues>) =>
        setDateRangeQuery({ dateRange: input.dateRange }),
      query: {
        ...query,
        dateRange: dateRangeQuery.dateRange,
      },
      autoWidth: true,
      setGlobalDateFilterLabel,
      showStartAndEndDateArrow: false,
    },
    {
      options: GroupTypeOptions,
      selectValue: groupBy,
      isSearchable: false,
      placeholder: "Group By",
      component: ROMASelectField,
      handleChange: (_, field: { value: string }) => {
        const { value } = field;

        if (value === GroupTypeEnum.AccountGroups) {
          setQuery({
            ...query,
            entityIds: [ALL_ACCOUNT_GROUPS_ID],
            entityType: "AccountGroup",
          });
        } else {
          setQuery({
            ...query,
            entityIds: [ALL_CONNECTIONS_ID],
            entityType: "Connection",
          });
        }

        setGroupBy(value as GroupTypeEnum);
      },
    },
    {
      query,
      field: "entityIds",
      component:
        groupBy === GroupTypeEnum.AccountGroups
          ? MultiAccountGroupSearch
          : MultiConnectionSearch,
      currencies: [selectedCurrency],
      updateQuery: async (input: Record<string, unknown>) => {
        await handleRefetch({
          ...query,
          entityIds: input.entityIds as Array<string>,
          entityType:
            groupBy === GroupTypeEnum.Banks ? "Connection" : "AccountGroup",
        });
      },
    },
  ];

  const groupByLabel =
    groupBy === GroupTypeEnum.AccountGroups ? "Account Group" : "Account Name";
  const secondaryLabel =
    groupBy === GroupTypeEnum.AccountGroups ? "Account Name" : "Account Group";
  // const rowLabel = groupBy === GroupTypeEnum.AccountGroups ?
  const [balanceReconEnabledFlag] = useLiveConfiguration({
    featureName: "ledgers_balance_recon_enabled",
  });
  const { ledgersProductActive } = useLedgersProductActive();
  const headerGroupRow = {
    bankName: groupByLabel,
    label: secondaryLabel,
    ...(ledgersProductActive &&
      balanceReconEnabledFlag && {
        prettyLedgerVariance: "Ledger Variance",
      }),
    transactionCount: "# Transactions",
    prettyUnreconciledVolume: "$ Unreconciled",
    unreconciledCount: "# Unreconciled",
    prettyPercentReconciledByCount: "% Reconciled",
  };

  const {
    loading: currencyLoading,
    data: currencyData,
    error: currencyError,
  } = useBalancesFeedCurrencyTotalsQuery();
  const currencies = useMemo<string[]>(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      currencyLoading ||
      !currencyData ||
      currencyError ||
      !currencyData.balancesFeedCurrencyTotals?.edges
        ? []
        : map(currencyData.balancesFeedCurrencyTotals.edges, "node.currency"),
    [currencyLoading, currencyData, currencyError],
  );

  useEffect(() => {
    if (!currencies.length) return;
    setSelectedCurrency(currencies[0]);
  }, [currencies, setSelectedCurrency]);

  const currencyFilteredGroups = useMemo(() => {
    if (groups.length === 0) return [];
    if (!selectedCurrency) return [];

    const groupsMatchingCurrency = groups.filter(
      (group) =>
        group.currency.toUpperCase() === selectedCurrency.toUpperCase(),
    );
    const groupsWithChildren = groupsMatchingCurrency.filter(
      (group) => group.childrenCount > 0,
    );

    return groupsWithChildren;
  }, [groups, selectedCurrency]);

  /**
   * TODO(@paul) 2023-08-07
   *
   * Right now we're summing up the totals from each group header row.
   *
   * In other places where we use the GroupedAccountTable,
   * we're using a separate query to get the totals from the backend.
   *
   * We should refactor this to make a query as well, so that we don't have to do any
   * data calculation or manipulation in the frontend.
   */
  const footerData = useMemo(() => {
    if (!currencyFilteredGroups.length) return [];

    const totalVolume = currencyFilteredGroups.reduce(
      (acc, group) => acc + Number(group.totalTransactionVolume),
      0,
    );
    const totalReconciledVolume = currencyFilteredGroups.reduce(
      (acc, group) => acc + Number(group.reconciledTransactionVolume),
      0,
    );

    const totalCount = currencyFilteredGroups.reduce(
      (acc, group) => acc + Number(group.transactionCount),
      0,
    );

    const totalTransactionCount = sumBy(
      currencyFilteredGroups,
      "transactionCount",
    );
    const totalUnreconciledCount = sumBy(
      currencyFilteredGroups,
      "unreconciledCount",
    );
    const totalReconciledCount = totalCount - totalUnreconciledCount;

    const totalUnreconciledVolume = formatAmount(
      totalVolume - totalReconciledVolume,
      selectedCurrency,
    );
    const totalPercentReconciledByCount =
      totalReconciledCount > 0 && totalTransactionCount > 0
        ? formatCount((totalReconciledCount / totalTransactionCount) * 100, 1)
        : 0;

    return [
      {
        title: `Total ${selectedCurrency}`,
        subtitle: "",
        ...(balanceReconEnabledFlag && { prettyLedgerVariance: "" }),
        transactionCount: totalTransactionCount,
        prettyUnreconciledVolume: totalUnreconciledVolume,
        unreconciledCount: totalUnreconciledCount,
        prettyPercentReconciledByCount: `${totalPercentReconciledByCount}%`,
      },
    ];
  }, [balanceReconEnabledFlag, currencyFilteredGroups, selectedCurrency]);

  return (
    <PageHeader
      title="Overview"
      loading={loading}
      action={
        <LiveConfigurationView
          featureName="transfer_ingestion_wizard_enabled"
          enabledView={
            <Button
              onClick={(e) => handleLinkClick("/imports/new", e)}
              buttonType="primary"
            >
              Import
            </Button>
          }
        />
      }
    >
      <div className="flex flex-row items-center gap-4">
        <DateSearch
          anchorOrigin={{ horizontal: "unset" }}
          key={v4()}
          query={dateRangeQuery}
          field="dateRange"
          options={ACCOUNT_DATE_RANGE_FILTER_OPTIONS}
          updateQuery={(input: Record<string, DateRangeFormValues>) => {
            Cookies.set("globalDateRange", JSON.stringify(input.dateRange), {
              expires: 7,
            });
            setDateRangeDefaultLabel("");
            setQuery({ ...query, dateRange: input.dateRange });
            setDateRangeQuery({ dateRange: input.dateRange });
            trackEvent(null, ACCOUNT_ACTIONS.CHANGED_GLOBAL_DATE_FILTER, {
              path: window.location.pathname,
            });
          }}
          /** change label to "Mixed" without changing actual date range */
          defaultLabel={
            dateRangeDefaultLabel !== "" ? dateRangeDefaultLabel : undefined
          }
          showIcon
          showStartAndEndDateArrow={false}
        />
        <CurrencyDropdown
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          // reset label to be empty when currency changes
          setGlobalDateFilterLabel={() => setDateRangeDefaultLabel("")}
        />
      </div>
      <AccountsOverviewBar
        currency={selectedCurrency}
        setDateRange={setDateRangeQuery}
        reconciliationFocus
        dateRange={query.dateRange}
        setGlobalDateFilterLabel={setGlobalDateFilterLabel}
      />
      {selectedCurrency && (
        <GroupedAccountTable
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchComponents={searchComponents}
        >
          <GroupedAccountTableBody
            groupBy={groupBy}
            groups={currencyFilteredGroups}
            header={headerGroupRow}
            loading={loading}
            searchTerm={searchTerm}
            dateRange={dateRangeQuery.dateRange}
            sortByUnreconciledCountDesc
          />
          <GroupedAccountTableFooter footerData={footerData} />
        </GroupedAccountTable>
      )}
    </PageHeader>
  );
}

export default ReconciliationView;
