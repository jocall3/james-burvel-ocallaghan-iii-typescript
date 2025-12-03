// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { RefObject, useRef, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router";
import { LazyQueryExecFunction, OperationVariables } from "@apollo/client";
import { Field, Form, Formik, FormikProps } from "formik";
import { camelCase, isEqual, omit, startCase } from "lodash";
import invariant from "ts-invariant";
import { cn } from "~/common/utilities/cn";
import {
  CONNECTION,
  COUNTERPARTY,
  INVOICE,
  RECONCILIATION_RULE,
  RESOURCES,
  ResourcesEnum,
} from "~/generated/dashboard/types/resources";
import { useMountEffect } from "~/common/utilities/useMountEffect";
import MultiSelectDropdownPanel from "~/common/ui-components/MultiSelectDropdown/MultiSelectDropdownPanel";
import { useToggle } from "~/common/utilities/useToggle";
import { FormikInputField } from "../../../common/formik";
import { AppliedFilterType, FilterType } from "./util";
import FormikAmountSearch from "./FormikAmountSearch";
import {
  Button,
  Input,
  Label,
  LoadingLine,
  Stack,
  ToggleRow,
} from "../../../common/ui-components";
import {
  LogicalForm__InputTypeEnum,
  TimeFormatEnum,
  useConnectionAsyncSelectLazyQuery,
  useCounterpartySelectFilterLazyQuery,
  useInvoicesFilterViewLazyQuery,
  useReconciliationRuleAsyncSelectLazyQuery,
} from "../../../generated/dashboard/graphqlSchema";
import DateRangePicker, {
  DateRangeValues,
} from "../../../common/ui-components/DateRangePicker/DateRangePicker";
import { ACCOUNT_DATE_RANGE_FILTER_OPTIONS } from "../../containers/reconciliation/utils";
import MultiAccountSelect from "./MultiAccountSelect";

const INITIAL_PAGINATION = {
  total: 0,
  page: 1,
  perPage: 25,
};

function AmountSearchInputFilter({
  filter,
  formikRef,
}: {
  filter: FilterType | AppliedFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
}) {
  const filterValue = (filter as AppliedFilterType).value as
    | {
        gte: number | null;
        lte: number | null;
      }
    | undefined;

  const [usingRange, toggleUsingRange] = useToggle(
    filterValue && filterValue?.gte !== filterValue?.lte,
  );

  function handleToggleUsingRange() {
    toggleUsingRange();
    if (formikRef.current) {
      void formikRef.current.setFieldValue(`${filter.key}.lte`, null);
      void formikRef.current.setFieldValue(`${filter.key}.gte`, null);
    }
  }

  return (
    <div className="grid gap-2 p-2">
      {usingRange ? (
        <>
          <Field
            id={filter.key}
            name={`${filter.key}.gte`}
            placeholder="0.00"
            component={FormikAmountSearch}
            onChange={() => {
              if (formikRef.current) {
                setTimeout(formikRef.current.handleSubmit);
              }
            }}
          />
          <Field
            id={filter.key}
            name={`${filter.key}.lte`}
            placeholder="0.00"
            component={FormikAmountSearch}
            onChange={() => {
              if (formikRef.current) {
                setTimeout(formikRef.current.handleSubmit);
              }
            }}
          />
        </>
      ) : (
        <Field
          id={filter.key}
          name={`${filter.key}.gte`}
          placeholder="0.00"
          component={FormikAmountSearch}
          onChange={(_, newValue: number | null) => {
            if (formikRef.current) {
              void formikRef.current.setFieldValue(
                `${filter.key}.lte`,
                newValue,
              );
              setTimeout(formikRef.current.handleSubmit);
            }
          }}
        />
      )}
      <div className="flex w-full">
        <ToggleRow
          toggleTextSize="text-xs"
          radios={[
            {
              selected: !usingRange,
              children: "Exact",
              value: "Exact",
              onChange: handleToggleUsingRange,
            },
            {
              selected: usingRange,
              children: "Range",
              value: "Range",
              onChange: handleToggleUsingRange,
            },
          ]}
          fullWidth
        />
      </div>
    </div>
  );
}

export function ChoiceSearchInputFilter({
  filter,
  formikRef,
  moreOptions,
  onLoadMore,
  onSearchChange,
  options = [],
  className,
}: {
  filter: FilterType | AppliedFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
  moreOptions?: boolean;
  onLoadMore?: (searchValue: string) => void;
  onSearchChange?: (value: string) => void;
  options?: { label: string; value: string }[];
  className?: string;
}) {
  const initialValue = (filter as AppliedFilterType)?.value || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  useMountEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  const handleSubmit = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit();
    }
  };

  const filteredOptions = searchValue
    ? options.filter((option) =>
        option.label
          .toLocaleLowerCase()
          .includes(searchValue.toLocaleLowerCase()),
      )
    : options;

  return (
    <div className={cn("flex max-h-80 flex-col overflow-y-scroll", className)}>
      <div className="sticky top-0 border-b border-alpha-black-100">
        <Input
          placeholder={filter.name}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            if (onSearchChange) {
              onSearchChange(e.target.value);
            }
          }}
          outline={false}
          name="searchFilter"
          className="pl-4 text-xs"
          ref={inputRef}
        />
      </div>
      <div className="p-2">
        {filteredOptions.map((option) => (
          <Label
            key={option.value}
            className={cn(
              "flex w-full cursor-pointer rounded-sm p-2 text-xs hover:bg-gray-25",
              initialValue === option.value &&
                "bg-blue-500 text-white hover:!bg-blue-500 hover:text-white",
            )}
          >
            <Field
              id={filter?.key}
              name={filter?.key}
              type="radio"
              value={option}
              className="peer hidden"
              onChange={() => {
                void formikRef?.current?.setFieldValue(
                  filter.key,
                  option.value,
                );
                handleSubmit();
              }}
            />
            {option.label}
          </Label>
        ))}
      </div>
      {filteredOptions.length === 0 && (
        <div className="bg-white px-4">
          <p className="font-regular p-4 text-center text-xs text-gray-700">
            No Results Found.
          </p>
        </div>
      )}
      {moreOptions && onLoadMore && (
        <div className="px-3 pb-4">
          <Button
            className="text-xs font-medium"
            buttonType="link"
            onClick={() => onLoadMore(searchValue)}
            hideFocusOutline
            fullWidth
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

type LazyQueryFunctionType = () => [
  getEntities: LazyQueryExecFunction<ResponseType, OperationVariables>,
];

type ResponseType = { [key: string]: GetEntitiesQueryResponse };

type GetEntitiesQueryResponse = {
  edges: Array<{
    node: {
      id: string;
      name: string | null;
      longName?: string | null;
    };
  }>;
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
};

interface AsyncSearchFilterProps extends UIContainerProps {
  filter: FilterType | AppliedFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
  query: unknown;
  resource: ResourcesEnum;
  entityLabelFieldName?: string;
  additionalVariables?: object;
}

function AsyncSearchFilter({
  filter,
  className,
  formikRef,
  query,
  resource,
  additionalVariables,
  entityLabelFieldName,
}: AsyncSearchFilterProps) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [afterCursor, setAfterCursor] = useState<string>("");
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [getEntities] = (query as LazyQueryFunctionType)();

  useEffect(() => {
    const loadInitialEntities = async () => {
      const response = await getEntities({
        variables: {
          first: INITIAL_PAGINATION.perPage,
          ...additionalVariables,
        },
      });

      const entityName = RESOURCES[resource].graphql_fields?.async_search;
      const entities = response?.data?.[entityName];

      const fieldName = entityLabelFieldName || "name";
      const formattedOptions = entities?.edges.map(({ node }) => ({
        label: (node[fieldName] as string) || "",
        value: node.id,
      }));

      setOptions(formattedOptions || []);
      setAfterCursor(entities?.pageInfo?.endCursor || "");
      setHasNextPage(entities?.pageInfo?.hasNextPage || false);
    };

    void loadInitialEntities();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefetch = async (name: string, loadMore = false) => {
    const updatedName = name !== "" ? name : undefined;
    const after = loadMore ? afterCursor : undefined;
    const initialVariables = {};
    initialVariables[entityLabelFieldName || name] = updatedName;

    const response = await getEntities({
      variables: {
        first: INITIAL_PAGINATION.perPage,
        after,
        ...initialVariables,
        ...additionalVariables,
      },
    });

    const entityName = RESOURCES[resource].graphql_fields?.async_search;
    const entities = response?.data?.[entityName];

    const fieldName = entityLabelFieldName || "name";
    const formattedOptions = entities?.edges.map(({ node }) => ({
      label: (node[fieldName] as string) || "",
      value: node.id,
    }));

    if (formattedOptions) {
      const updatedOptions = loadMore
        ? [...options, ...formattedOptions]
        : [...formattedOptions];
      setOptions(updatedOptions);
      setAfterCursor(entities?.pageInfo?.endCursor || "");
      setHasNextPage(entities?.pageInfo?.hasNextPage || false);
    }
  };

  const handleChange = (searchValue: string) => {
    void handleRefetch(searchValue);
  };

  const handleLoadMore = async (searchValue: string) => {
    await handleRefetch(searchValue, true);
  };

  return (
    <div className={cn("flex w-full max-w-60 flex-col", className)}>
      <ChoiceSearchInputFilter
        filter={filter}
        options={options}
        formikRef={formikRef}
        moreOptions={hasNextPage}
        className="border-0 border-b border-alpha-black-100"
        onSearchChange={handleChange}
        onLoadMore={(searchValue) => {
          void handleLoadMore(searchValue);
        }}
      />
    </div>
  );
}

function DateInputFilter({
  filter,
  formikRef,
  options = [],
  className,
}: {
  filter: FilterType | AppliedFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
  options?: { label: string; value: string }[];
  className?: string;
}) {
  const appliedFilterValue = "value" in filter ? filter?.value : "";
  const initialValue = ACCOUNT_DATE_RANGE_FILTER_OPTIONS.find(
    (dateFilterOption) =>
      isEqual(dateFilterOption?.dateRange, appliedFilterValue),
  );
  const formatSelectedValue =
    initialValue?.value === "today" ? "past24H" : initialValue?.value;

  const handleSubmit = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit();
    }
  };

  const onApply = (dateRange: DateRangeValues) => {
    let value = {
      ...dateRange,
      inTheLast: null,
      format: TimeFormatEnum.Date,
    };
    if (dateRange.lte === "") {
      value = omit(value, "lte");
    }
    if (dateRange.gte === "") {
      value = omit(value, "gte");
    }
    void formikRef?.current?.setFieldValue(filter?.key, value);
    handleSubmit();
  };

  return (
    <>
      {options?.map((option) => (
        <Label
          key={option.label}
          className={cn(
            "flex w-full cursor-pointer rounded-sm p-2 text-xs hover:bg-gray-25",
            formatSelectedValue === camelCase(option.value) && "bg-gray-25",
            className,
          )}
        >
          <Field
            id={filter?.key}
            name={filter?.key}
            type="radio"
            value={option.value}
            className="peer hidden"
            onChange={() => {
              const value = ACCOUNT_DATE_RANGE_FILTER_OPTIONS.find(
                (dateFilterOption) => {
                  const dateFilterValue =
                    dateFilterOption.value === "today"
                      ? "past24H"
                      : dateFilterOption.value;
                  return dateFilterValue === camelCase(option.value);
                },
              );
              void formikRef?.current?.setFieldValue(
                filter.key,
                value?.dateRange,
              );
              handleSubmit();
            }}
          />
          {startCase(option.label)}
        </Label>
      ))}
      <DateRangePicker
        className="px-2 pt-2"
        onApply={onApply}
        initialValues={appliedFilterValue as unknown as DateRangeValues}
        allowExactValues
      />
    </>
  );
}

function MetadataInputFilter({
  filter,
  formikRef,
}: {
  filter: FilterType | AppliedFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
}) {
  // Handle submit in a separate function in order to read the correct
  // value in the setTimeout function. Since event is mutated, we will read the
  // incorrect value if we read from event.target.value directly.
  function handleSubmit(newValue: string) {
    setTimeout(() => {
      if (
        newValue &&
        formikRef.current &&
        (formikRef.current.values[filter.key] as { value: string }).value
      ) {
        formikRef.current.handleSubmit();
      }
    });
  }

  function handleChange(
    filterKey: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    void formikRef?.current?.setFieldValue(filterKey, event.target.value);

    handleSubmit(event.target.value);
  }

  return (
    <div className="p-4">
      <Stack className="gap-2">
        <Field
          id={filter.key}
          name={`${filter.key}.key`}
          placeholder="Key"
          component={FormikInputField}
          className="h-6 text-xs"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(`${filter.key}.key`, event)
          }
        />
        <Field
          id={filter.key}
          className="h-6 text-xs"
          name={`${filter.key}.value`}
          placeholder="Value"
          component={FormikInputField}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(`${filter.key}.value`, event)
          }
        />
      </Stack>
      <button aria-label="submit button" className="sr-only" type="submit" />
    </div>
  );
}

function SearchInputFilter({
  filter,
  formikRef,
}: {
  filter: FilterType | AppliedFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
}) {
  return (
    <div className="p-4">
      <Field
        id={filter.key}
        name={filter.key}
        placeholder=""
        component={FormikInputField}
        className="h-6 text-xs"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          void formikRef?.current?.setFieldValue(
            filter.key,
            event.target.value || null,
          );
          if (formikRef.current) {
            setTimeout(formikRef.current.handleSubmit);
          }
        }}
      />
    </div>
  );
}

function MultiSelectFilter({
  onClose,
  filter,
  options,
  formikRef,
  initialValue,
}: {
  filter: FilterType | AppliedFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
  options: { label: string; value: string }[];
  initialValue: Array<string>;
  onClose: () => void;
}) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <MultiSelectDropdownPanel
      onClose={onClose}
      categories={[
        {
          id: filter.key,
          items: options.map((o) => ({ id: o.value, label: o.label })),
          label: filter.name,
        },
      ]}
      onChange={(selectedValues) => {
        const selectedValueArray = Object.keys(selectedValues).reduce<
          Array<string>
        >((acc, key) => [...acc, ...selectedValues[key]], []);
        if (formikRef?.current) {
          void formikRef?.current?.setFieldValue(
            filter.key,
            selectedValueArray,
          );
          setTimeout(() => formikRef?.current?.handleSubmit());
        }
      }}
      initialValues={{
        [filter.key]: initialValue || [],
      }}
      onSearchValueChange={setSearchValue}
      searchValue={searchValue}
      className="border border-alpha-black-100"
    />
  );
}

export type FormValues = {
  [key: string]: AppliedFilterType["value"];
};

interface FilterInputTypeRendererProps {
  appliedFilter: AppliedFilterType;
  onChange: (filter: AppliedFilterType) => void;
  onClose: () => void;
}

function FilterInputTypeRenderer({
  appliedFilter: filter,
  onChange,
  onClose,
}: FilterInputTypeRendererProps) {
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const initialValue = filter?.value ?? "";

  const fieldType = filter.type;
  const options = filter?.options?.map((enumValue) => ({
    label: enumValue?.prettyValueName,
    value: enumValue?.valueName,
  }));

  const { preview_id: previewId }: { preview_id: string } = useParams();
  const location = useLocation();

  let inputRenderer: React.ReactNode;
  switch (fieldType) {
    case LogicalForm__InputTypeEnum.AmountInput:
      inputRenderer = (
        <AmountSearchInputFilter filter={filter} formikRef={formikRef} />
      );
      break;
    case LogicalForm__InputTypeEnum.CounterpartySelect:
      inputRenderer = (
        <AsyncSearchFilter
          filter={filter}
          formikRef={formikRef}
          query={useCounterpartySelectFilterLazyQuery}
          resource={COUNTERPARTY}
          entityLabelFieldName="name"
        />
      );
      break;
    case LogicalForm__InputTypeEnum.InvoiceSelect:
      inputRenderer = (
        <AsyncSearchFilter
          filter={filter}
          formikRef={formikRef}
          query={useInvoicesFilterViewLazyQuery}
          resource={INVOICE}
          entityLabelFieldName="number"
        />
      );
      break;
    case LogicalForm__InputTypeEnum.ReconciliationRuleSelect:
      inputRenderer = (
        <AsyncSearchFilter
          filter={filter}
          formikRef={formikRef}
          query={useReconciliationRuleAsyncSelectLazyQuery}
          resource={RECONCILIATION_RULE}
          entityLabelFieldName="name"
        />
      );
      break;
    case LogicalForm__InputTypeEnum.PreviewReconciliationRuleSelect: {
      const queryParams = new URLSearchParams(location.search);
      const editingSessionId = queryParams.get("editingSessionId") as string;

      inputRenderer = (
        <AsyncSearchFilter
          filter={filter}
          formikRef={formikRef}
          query={useReconciliationRuleAsyncSelectLazyQuery}
          resource={RECONCILIATION_RULE}
          additionalVariables={{ previewId, editingSessionId }}
          entityLabelFieldName="name"
        />
      );
      break;
    }
    case LogicalForm__InputTypeEnum.ConnectionSelect:
      inputRenderer = (
        <AsyncSearchFilter
          filter={filter}
          formikRef={formikRef}
          query={useConnectionAsyncSelectLazyQuery}
          resource={CONNECTION}
          entityLabelFieldName="name"
        />
      );
      break;
    case LogicalForm__InputTypeEnum.MultiSelect:
      invariant(options);
      inputRenderer = (
        <MultiSelectFilter
          filter={filter}
          formikRef={formikRef}
          options={options}
          onClose={onClose}
          initialValue={initialValue as Array<string>}
        />
      );
      break;
    case LogicalForm__InputTypeEnum.SingleSelect:
      inputRenderer = (
        <ChoiceSearchInputFilter
          filter={filter}
          formikRef={formikRef}
          options={options}
        />
      );
      break;
    case LogicalForm__InputTypeEnum.MultiAccountSelect:
      inputRenderer = (
        <MultiAccountSelect
          field={filter.key}
          label="Internal Accounts"
          initialValues={initialValue}
          onChange={(value) => {
            if (formikRef?.current) {
              void formikRef?.current?.setFieldValue(filter.key, value);
              setTimeout(() => formikRef?.current?.handleSubmit());
            }
          }}
          onClose={onClose}
        />
      );
      break;
    case LogicalForm__InputTypeEnum.DateInput:
      inputRenderer = (
        <div className="p-2">
          <DateInputFilter
            filter={filter}
            formikRef={formikRef}
            options={options}
          />
        </div>
      );
      break;
    case LogicalForm__InputTypeEnum.MetadataInput:
      inputRenderer = (
        <MetadataInputFilter filter={filter} formikRef={formikRef} />
      );
      break;
    case LogicalForm__InputTypeEnum.TextInput:
      inputRenderer = (
        <SearchInputFilter filter={filter} formikRef={formikRef} />
      );
      break;
    default:
      inputRenderer = (
        <div className="mb-4">
          <LoadingLine />
        </div>
      );
  }

  const hideTitle = [
    LogicalForm__InputTypeEnum.CounterpartySelect,
    LogicalForm__InputTypeEnum.SingleSelect,
    LogicalForm__InputTypeEnum.InternalAccountSelect,
    LogicalForm__InputTypeEnum.InvoiceSelect,
    LogicalForm__InputTypeEnum.MultiAccountSelect,
    LogicalForm__InputTypeEnum.ReconciliationRuleSelect,
    LogicalForm__InputTypeEnum.PreviewReconciliationRuleSelect,
    LogicalForm__InputTypeEnum.ConnectionSelect,
    LogicalForm__InputTypeEnum.MultiSelect,
  ].includes(fieldType);

  return (
    <div className="flex h-full w-full max-w-60 flex-col rounded-sm">
      {!hideTitle && (
        <div className="flex w-full items-center border-b border-alpha-black-100 px-4 py-2 text-xs text-gray-500">
          <span>{startCase(filter.name)}</span>
        </div>
      )}
      <Formik
        initialValues={{
          [filter.key]: initialValue,
        }}
        onSubmit={(values: FormValues) => {
          onChange({ ...filter, value: values[filter.key] });
        }}
        innerRef={formikRef}
        enableReinitialize
      >
        <Form>{inputRenderer}</Form>
      </Formik>
    </div>
  );
}

export default FilterInputTypeRenderer;
