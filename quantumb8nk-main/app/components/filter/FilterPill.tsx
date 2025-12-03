// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { get, isEqual } from "lodash";
import pluralize from "pluralize";
import invariant from "ts-invariant";
import { ALL_ACCOUNTS_ID } from "~/app/constants";
import { AppliedFilterType, FilterType } from "./util";
import {
  ButtonClickEventTypes,
  Chip,
  DateRangeFormValues,
  Icon,
  LoadingLine,
  icons,
} from "../../../common/ui-components";
import {
  LogicalForm__InputTypeEnum,
  useFilterPillCounterpartyTextQuery,
  useFilterPillInternalAccountsTextQuery,
  useFilterPillReconciliationRuleTextQuery,
  useFilterPillConnectionTextQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { DATE_SEARCH_FILTER_OPTIONS } from "../search/DateSearch";

function formatText(text: string) {
  const maxLength = 12;
  if (text.length <= maxLength) {
    return text;
  }
  const charsFromBeginning = Math.floor((maxLength - 3) / 2);
  const charsFromEnd = Math.ceil((maxLength - 3) / 2);
  return `${text.substring(0, charsFromBeginning)}...${text.substr(
    -charsFromEnd,
  )}`;
}

type QueryFunctionType = (args: Record<string, unknown>) => {
  data: unknown;
  loading: boolean;
};

function AsyncText({
  query,
  resource,
  field,
  id,
}: {
  query: QueryFunctionType;
  resource: string;
  field: string;
  id: string;
}) {
  const { data, loading } = query({
    variables: {
      id,
    },
  });

  if (data) {
    return <span>{get(data, [resource, field])}</span>;
  }
  if (loading) {
    return (
      <div className="w-20">
        <LoadingLine className="!h-3" />
      </div>
    );
  }
  return <span>{id}</span>;
}

function InternalAccountName({
  internalAccountIds,
}: {
  internalAccountIds: Array<string>;
}) {
  const { data } = useFilterPillInternalAccountsTextQuery({
    skip: internalAccountIds.length === 0,
    variables: {
      id: internalAccountIds[0],
    },
  });

  if (
    internalAccountIds.length === 1 &&
    internalAccountIds[0] === ALL_ACCOUNTS_ID
  ) {
    return <span>All Accounts</span>;
  }
  if (internalAccountIds.length > 1) {
    return (
      <span>
        {`${data?.internalAccount?.bestLongName || ""} + ${
          internalAccountIds.length - 1
        } ${pluralize("Account", internalAccountIds.length - 1)}`}
      </span>
    );
  }
  if (data) {
    return <span>{data?.internalAccount?.bestLongName}</span>;
  }
  return (
    <div className="w-20">
      <LoadingLine className="!h-3" />
    </div>
  );
}

function MultiSelectText({
  selectedValues,
  filter,
  options,
}: {
  selectedValues: Array<string>;
  filter: FilterType | AppliedFilterType;
  options: Array<Record<string, string>>;
}) {
  const firstSelected =
    options.find((o) => selectedValues.includes(o.valueName))
      ?.prettyValueName || "";
  if (selectedValues.length === 0) {
    return <span>{`All ${pluralize(filter.name, 2)}`}</span>;
  }
  if (selectedValues.length > 1) {
    return (
      <span>
        {`${firstSelected} + ${selectedValues.length - 1} ${pluralize(
          filter.name,
          selectedValues.length - 1,
        )}`}
      </span>
    );
  }
  return <span>{firstSelected}</span>;
}

function DateText({ value }: { value: DateRangeFormValues }) {
  const inTheLast = value?.inTheLast;
  const inTheNext = value?.inTheNext;

  let label = "";
  if (inTheLast) {
    label =
      DATE_SEARCH_FILTER_OPTIONS.find((dateSearchFilterOption) =>
        isEqual(dateSearchFilterOption.dateRange.inTheLast, inTheLast),
      )?.label || "";
  }

  if (inTheNext) {
    label =
      DATE_SEARCH_FILTER_OPTIONS.find((dateSearchFilterOption) =>
        isEqual(dateSearchFilterOption.dateRange.inTheNext, inTheNext),
      )?.label || "";
  }

  const lte = value?.lte as unknown as string;
  const gte = value?.gte as unknown as string;

  if (lte && gte && lte === gte) {
    return <span>{lte}</span>;
  }
  if (gte && !lte) {
    return (
      <span>
        {"> "}
        {gte}
      </span>
    );
  }
  if (lte && !gte) {
    return (
      <span>
        {"< "}
        {lte}
      </span>
    );
  }
  if (lte && gte) {
    return (
      <span>
        {gte} - {lte}
      </span>
    );
  }
  if (label) {
    return <span>{label}</span>;
  }
  return <span>Past 24h</span>;
}

function AmountText({
  value,
}: {
  value: {
    gte: number | null;
    lte: number | null;
  };
}) {
  const lte = (value?.lte as unknown as number) / 100;
  const gte = (value?.gte as unknown as number) / 100;

  if (lte === gte) {
    return (
      <span>
        {Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
        }).format(lte)}
      </span>
    );
  }
  if (gte && !lte) {
    return (
      <span>
        {"> "}
        {Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
        }).format(gte)}
      </span>
    );
  }
  if (lte && !gte) {
    return (
      <span>
        {"< "}
        {Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
        }).format(lte)}
      </span>
    );
  }
  return (
    <span>
      {Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
      }).format(gte)}{" "}
      -{" "}
      {Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
      }).format(lte)}
    </span>
  );
}

function formatAppliedFilterValue(appliedFilter: AppliedFilterType) {
  let content: React.ReactNode;

  switch (appliedFilter.type) {
    case LogicalForm__InputTypeEnum.AmountInput: {
      content = (
        <AmountText
          value={
            appliedFilter.value as {
              gte: number | null;
              lte: number | null;
            }
          }
        />
      );
      break;
    }
    case LogicalForm__InputTypeEnum.CounterpartySelect: {
      content = (
        <AsyncText
          query={useFilterPillCounterpartyTextQuery}
          resource="counterparty"
          field="name"
          id={appliedFilter.value as string}
        />
      );
      break;
    }
    case LogicalForm__InputTypeEnum.InvoiceSelect: {
      content = <span>{formatText(appliedFilter.value as string)}</span>;
      break;
    }
    case LogicalForm__InputTypeEnum.ConnectionSelect: {
      content = (
        <AsyncText
          query={useFilterPillConnectionTextQuery}
          resource="connection"
          field="name"
          id={appliedFilter.value as string}
        />
      );
      break;
    }
    case LogicalForm__InputTypeEnum.PreviewReconciliationRuleSelect:
    case LogicalForm__InputTypeEnum.ReconciliationRuleSelect: {
      content = (
        <AsyncText
          query={useFilterPillReconciliationRuleTextQuery}
          resource="reconciliationRule"
          field="name"
          id={appliedFilter.value as string}
        />
      );
      break;
    }
    case LogicalForm__InputTypeEnum.SingleSelect: {
      const option = (appliedFilter.options || []).find(
        (selectOption) => selectOption.valueName === appliedFilter.value,
      );
      content = option ? (
        <span>{formatText(option.prettyValueName)}</span>
      ) : null;
      break;
    }
    case LogicalForm__InputTypeEnum.MultiAccountSelect: {
      content = (
        <InternalAccountName
          internalAccountIds={appliedFilter.value as [string]}
        />
      );
      break;
    }
    case LogicalForm__InputTypeEnum.MultiSelect: {
      invariant(appliedFilter.options);
      content = (
        <MultiSelectText
          options={appliedFilter.options}
          filter={appliedFilter}
          selectedValues={appliedFilter.value as [string]}
        />
      );
      break;
    }
    case LogicalForm__InputTypeEnum.DateInput: {
      content = (
        <DateText
          value={
            appliedFilter.value as {
              gte: string | undefined;
              lte: string | undefined;
            }
          }
        />
      );
      break;
    }
    case LogicalForm__InputTypeEnum.MetadataInput: {
      const metadataValue = appliedFilter.value as {
        key: string;
        value: string;
      };

      content =
        metadataValue?.key && metadataValue?.value ? (
          <span className="flex flex-row space-x-1">
            <p>{formatText(metadataValue?.key)}</p>
            <Icon
              iconName="arrow_forward"
              color="currentColor"
              className="text-gray-700"
              size="s"
            />
            <p>{formatText(metadataValue?.value)}</p>
          </span>
        ) : (
          "Metadata"
        );
      break;
    }
    default:
      content = (
        <span>{`"${formatText(appliedFilter.value.toString())}"`}</span>
      );
      break;
  }

  return content;
}

interface FilterPillProps {
  appliedFilter: AppliedFilterType;
  removeFilter?: (e: ButtonClickEventTypes) => void;
}

/**
 * Creates a pill representing an applied filter and allows user to remove filter.
 */
function FilterPill({ appliedFilter, removeFilter }: FilterPillProps) {
  return (
    <Chip
      className="relative items-center"
      contentClassName="rounded-l-sm"
      icon={{
        iconName: appliedFilter.icon as keyof typeof icons,
        color: "currentColor",
        size: "s",
      }}
      onRemove={removeFilter}
    >
      {appliedFilter.value == null
        ? appliedFilter.name
        : formatAppliedFilterValue(appliedFilter)}
    </Chip>
  );
}

export default FilterPill;
