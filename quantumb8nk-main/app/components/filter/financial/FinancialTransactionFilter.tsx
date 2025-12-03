// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { RefObject, useRef, useState, useEffect, useCallback } from "react";
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
import FormikAmountSearch from "../FormikAmountSearch";
import {
  Button,
  Input,
  Label,
  LoadingLine,
  Stack,
  ToggleRow,
  Select,
  Checkbox,
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
import MultiAccountSelect from "../MultiAccountSelect";

/**
 * Initial pagination settings used for asynchronous filter data fetching.
 */
const INITIAL_PAGINATION = {
  total: 0,
  page: 1,
  perPage: 25,
};

/**
 * @typedef {Object} FilterOption
 * @property {string} valueName - The programmatic value of the filter option.
 * @property {string} prettyValueName - The user-friendly display name of the filter option.
 */
interface FilterOption {
  valueName: string;
  prettyValueName: string;
}

/**
 * @typedef {Object} BaseFinancialFilterType
 * @property {string} key - A unique key identifying the filter.
 * @property {string} name - The display name for the filter.
 * @property {LogicalForm__InputTypeEnum} type - The type of input control to render for this filter.
 * @property {FilterOption[]} [options] - Optional array of predefined options for select-type filters.
 * @property {"inline" | "block"} [display] - Optional display style hint for rendering.
 */
interface BaseFinancialFilterType {
  key: string;
  name: string;
  type: LogicalForm__InputTypeEnum;
  options?: FilterOption[];
  display?: "inline" | "block";
}

/**
 * @typedef {Object} AppliedFinancialFilterType
 * @extends BaseFinancialFilterType
 * @property {string | string[] | number | { gte: number | null; lte: number | null } | { key: string; value: string } | DateRangeValues | null} value - The currently applied value for the filter.
 */
export interface AppliedFinancialFilterType extends BaseFinancialFilterType {
  value:
    | string
    | string[]
    | number
    | { gte: number | null; lte: number | null }
    | { key: string; value: string }
    | DateRangeValues
    | null;
}

/**
 * @typedef {BaseFinancialFilterType} FinancialFilterType - Represents a filter that has not yet been applied.
 */
export type FinancialFilterType = BaseFinancialFilterType;

/**
 * @typedef {Object.<string, string | string[] | number | object | null>} FormValues - The shape of the form values, where keys are filter keys and values are their corresponding applied filter values.
 */
export type FormValues = {
  [key: string]: AppliedFinancialFilterType["value"];
};

// --- Mock GraphQL Lazy Query Hooks to simulate data interaction ---
// These mocks are designed to mimic the return signature of Apollo Client's useLazyQuery.
// They return a tuple: [execute_query_function, { loading, data, error }]
// For simplicity, we'll only mock the `execute_query_function` part for `AsyncSearchFilter`.

/**
 * @typedef {Object} MockGetEntitiesNode
 * @property {string} id - The unique identifier of the entity.
 * @property {string | null} name - The primary name of the entity.
 * @property {string | null} [longName] - An optional longer name for the entity.
 * @property {string | null} [number] - An optional number identifier (e.g., for invoices).
 */
type MockGetEntitiesNode = {
  id: string;
  name: string | null;
  longName?: string | null;
  number?: string | null;
};

/**
 * @typedef {Object} MockGetEntitiesQueryResponse
 * @property {Array<{node: MockGetEntitiesNode}>} edges - A list of entity nodes.
 * @property {{endCursor: string | null; hasNextPage: boolean}} pageInfo - Pagination information.
 */
type MockGetEntitiesQueryResponse = {
  edges: Array<{
    node: MockGetEntitiesNode;
  }>;
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
};

/**
 * @typedef {Object.<string, MockGetEntitiesQueryResponse>} MockResponseType - A map where keys are entity names and values are their query responses.
 */
type MockResponseType = { [key: string]: MockGetEntitiesQueryResponse };

/**
 * @callback MockLazyQueryExecFunction
 * @param {OperationVariables} variables - The variables to pass to the query.
 * @returns {Promise<{data: MockResponseType}>} A promise resolving to an object containing query data.
 */
type MockLazyQueryExecFunction = (
  variables: OperationVariables,
) => Promise<{ data: MockResponseType }>;

/**
 * @typedef {() => [MockLazyQueryExecFunction]} MockLazyQueryFunctionType - Type for mock lazy query hooks.
 */
type MockLazyQueryFunctionType = () => [MockLazyQueryExecFunction];

/**
 * Mock data for financial accounts, simulating a larger dataset.
 */
const MOCK_FINANCIAL_ACCOUNTS = Array.from({ length: 50 }).map((_, i) => ({
  id: `fa_${i + 1}`,
  name: `Checking Account ${i + 1}`,
  longName: `Citibank Checking Account ${i + 1} - ****${
    1234 + i
  } (USD)`,
}));

/**
 * Mock data for payment gateway sources, including Stripe, Plaid, Modern Treasury, and Citibank Demo Business.
 */
const MOCK_GATEWAY_SOURCES = [
  { id: "stripe", name: "Stripe" },
  { id: "plaid", name: "Plaid" },
  { id: "modern_treasury", name: "Modern Treasury" },
  { id: "citibank_demo_business", name: "Citibank Demo Business" },
  { id: "paypal", name: "PayPal" },
  { id: "square", name: "Square" },
  { id: "ach_direct", name: "ACH Direct" },
  { id: "wire_transfer", name: "Wire Transfer" },
  { id: "swift_payment", name: "SWIFT Payment" },
  { id: "visa", name: "Visa" },
  { id: "mastercard", name: "Mastercard" },
  { id: "amex", name: "American Express" },
  { id: "discover", name: "Discover" },
  { id: "jcb", name: "JCB" },
  { id: "apple_pay", name: "Apple Pay" },
  { id: "google_pay", name: "Google Pay" },
  { id: "samsung_pay", name: "Samsung Pay" },
  { id: "venmo", name: "Venmo" },
  { id: "zelle", name: "Zelle" },
  { id: "interac", name: "Interac" },
  { id: "klarna", name: "Klarna" },
  { id: "affirm", name: "Affirm" },
  { id: "afterpay", name: "Afterpay" },
  { id: "adyen", name: "Adyen" },
  { id: "braintree", name: "Braintree" },
  { id: "checkout_com", name: "Checkout.com" },
  { id: "fiserv", name: "Fiserv" },
  { id: "worldpay", name: "Worldpay" },
  { id: "global_payments", name: "Global Payments" },
  { id: "chase_paymentech", name: "Chase Paymentech" },
  { id: "wells_fargo", name: "Wells Fargo Gateway" },
  { id: "bank_of_america", name: "Bank of America Gateway" },
  { id: "jp_morgan_access", name: "J.P. Morgan Access" },
  { id: "treasury_prime", name: "Treasury Prime" },
  { id: "currencycloud", name: "Currencycloud" },
  { id: "transferwise", name: "Wise (formerly TransferWise)" },
  { id: "revolut", name: "Revolut Business" },
  { id: "nium", name: "Nium" },
  { id: "airwallex", name: "Airwallex" },
  { id: "remitly", name: "Remitly" },
  { id: "xoom", name: "Xoom" },
];

/**
 * Mock lazy query hook for financial accounts.
 * This simulates `useConnectionAsyncSelectLazyQuery` or similar for internal accounts.
 * @returns {[MockLazyQueryExecFunction]} A tuple containing the mock execution function.
 */
function useFinancialAccountSelectLazyQueryMock(): [MockLazyQueryExecFunction] {
  const getEntities: MockLazyQueryExecFunction = useCallback(
    async ({ first, after, name }) => {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
      let filtered = MOCK_FINANCIAL_ACCOUNTS;
      if (name) {
        filtered = filtered.filter((account) =>
          account.name.toLowerCase().includes((name as string).toLowerCase()),
        );
      }

      const startIndex = after
        ? filtered.findIndex((a) => a.id === after) + 1
        : 0;
      const endIndex = startIndex + (first || INITIAL_PAGINATION.perPage);

      const edges = filtered.slice(startIndex, endIndex).map((account) => ({
        node: {
          id: account.id,
          name: account.name,
          longName: account.longName,
        },
      }));

      return {
        data: {
          financialAccounts: { // Key matches entityNameMap in AsyncSearchFilter
            edges,
            pageInfo: {
              endCursor: edges.length > 0 ? edges[edges.length - 1].node.id : null,
              hasNextPage: endIndex < filtered.length,
            },
          },
        },
      };
    },
    [],
  );
  return [getEntities];
}

/**
 * Mock lazy query hook for payment gateways.
 * This simulates a generic async select for payment gateway sources.
 * @returns {[MockLazyQueryExecFunction]} A tuple containing the mock execution function.
 */
function usePaymentGatewaySourceSelectLazyQueryMock(): [MockLazyQueryExecFunction] {
  const getEntities: MockLazyQueryExecFunction = useCallback(
    async ({ first, after, name }) => {
      await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate network delay
      let filtered = MOCK_GATEWAY_SOURCES;
      if (name) {
        filtered = filtered.filter((gateway) =>
          gateway.name.toLowerCase().includes((name as string).toLowerCase()),
        );
      }

      const startIndex = after
        ? filtered.findIndex((g) => g.id === after) + 1
        : 0;
      const endIndex = startIndex + (first || INITIAL_PAGINATION.perPage);

      const edges = filtered.slice(startIndex, endIndex).map((gateway) => ({
        node: {
          id: gateway.id,
          name: gateway.name,
        },
      }));

      return {
        data: {
          paymentGatewaySources: { // Key matches entityNameMap in AsyncSearchFilter
            edges,
            pageInfo: {
              endCursor: edges.length > 0 ? edges[edges.length - 1].node.id : null,
              hasNextPage: endIndex < filtered.length,
            },
          },
        },
      };
    },
    [],
  );
  return [getEntities];
}

// --- Reusable Filter Input Components (adapted from seed) ---

/**
 * Renders an amount search input filter with options for exact or range matching.
 * @param {object} props
 * @param {FinancialFilterType | AppliedFinancialFilterType} props.filter - The filter definition.
 * @param {RefObject<FormikProps<FormValues>>} props.formikRef - Ref to the Formik instance.
 */
function AmountSearchInputFilter({
  filter,
  formikRef,
}: {
  filter: FinancialFilterType | AppliedFinancialFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
}) {
  const filterValue = (filter as AppliedFinancialFilterType).value as
    | {
        gte: number | null;
        lte: number | null;
      }
    | undefined;

  const [usingRange, toggleUsingRange] = useToggle(
    filterValue && filterValue?.gte !== filterValue?.lte,
  );

  /**
   * Handles toggling between exact and range amount filtering.
   * Resets GTE and LTE values when toggling.
   */
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
            id={`${filter.key}-gte`}
            name={`${filter.key}.gte`}
            placeholder="Min Amount (e.g., 50.00)"
            component={FormikAmountSearch}
            onChange={() => {
              if (formikRef.current) {
                setTimeout(formikRef.current.handleSubmit);
              }
            }}
          />
          <Field
            id={`${filter.key}-lte`}
            name={`${filter.key}.lte`}
            placeholder="Max Amount (e.g., 100.00)"
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
          placeholder="Exact Amount (e.g., 75.00)"
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

/**
 * Renders a choice search input filter for single selection.
 * Supports searching through options and loading more options if available.
 * @param {object} props
 * @param {FinancialFilterType | AppliedFinancialFilterType} props.filter - The filter definition.
 * @param {RefObject<FormikProps<FormValues>>} props.formikRef - Ref to the Formik instance.
 * @param {boolean} [props.moreOptions] - Indicates if there are more options to load.
 * @param {(searchValue: string) => void} [props.onLoadMore] - Callback to load more options.
 * @param {(value: string) => void} [props.onSearchChange] - Callback when the search input value changes.
 * @param {{ label: string; value: string }[]} [props.options] - Array of options to display.
 * @param {string} [props.className] - Additional CSS class names.
 */
export function ChoiceSearchInputFilter({
  filter,
  formikRef,
  moreOptions,
  onLoadMore,
  onSearchChange,
  options = [],
  className,
}: {
  filter: FinancialFilterType | AppliedFinancialFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
  moreOptions?: boolean;
  onLoadMore?: (searchValue: string) => void;
  onSearchChange?: (value: string) => void;
  options?: { label: string; value: string }[];
  className?: string;
}) {
  const initialValue = (filter as AppliedFinancialFilterType)?.value || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  useMountEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  /** Submits the Formik form. */
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
        {filteredOptions.length === 0 && (
          <div className="bg-white px-4">
            <p className="font-regular p-4 text-center text-xs text-gray-700">
              No Results Found.
            </p>
          </div>
        )}
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
              id={`${filter?.key}-${option.value}`}
              name={filter?.key}
              type="radio"
              value={option.value}
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

/**
 * @typedef {object} UIContainerProps
 * @property {string} [className] - Optional CSS class name for the container.
 */
interface UIContainerProps {
  className?: string;
}

/**
 * @typedef {object} AsyncSearchFilterProps
 * @extends UIContainerProps
 * @property {FinancialFilterType | AppliedFinancialFilterType} filter - The filter definition.
 * @property {RefObject<FormikProps<FormValues>>} formikRef - Ref to the Formik instance.
 * @property {MockLazyQueryFunctionType} query - The mock lazy query hook to fetch entities.
 * @property {ResourcesEnum} resource - The resource enum identifying the type of entities being searched.
 * @property {string} [entityLabelFieldName] - The field name on the entity node to use for the label (defaults to "name").
 * @property {object} [additionalVariables] - Additional variables to pass to the query.
 */
interface AsyncSearchFilterProps extends UIContainerProps {
  filter: FinancialFilterType | AppliedFinancialFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
  query: MockLazyQueryFunctionType; // Use MockLazyQueryFunctionType for internal consistency
  resource: ResourcesEnum;
  entityLabelFieldName?: string;
  additionalVariables?: object;
}

/**
 * Renders an asynchronous search filter, typically used for selecting entities from a large dataset.
 * It uses a provided query hook to fetch options dynamically.
 * @param {AsyncSearchFilterProps} props - The properties for the AsyncSearchFilter component.
 */
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
  const [getEntities] = query(); // Execute the mock query hook

  useEffect(() => {
    /** Loads the initial set of entities for the async search filter. */
    const loadInitialEntities = async () => {
      const response = await getEntities({
        variables: {
          first: INITIAL_PAGINATION.perPage,
          ...additionalVariables,
        },
      });

      // Mapping resource to entity name for mock data.
      const entityNameMap: { [key in ResourcesEnum]?: keyof MockResponseType } = {
        [ResourcesEnum.FinancialAccount as ResourcesEnum]: 'financialAccounts', // Hypothetical
        [ResourcesEnum.PaymentGateway as ResourcesEnum]: 'paymentGatewaySources', // Hypothetical
        [ResourcesEnum.Connection]: 'connections',
        [ResourcesEnum.Counterparty]: 'counterparties',
        [ResourcesEnum.Invoice]: 'invoices',
        [ResourcesEnum.ReconciliationRule]: 'reconciliationRules',
      };

      const mockResourceKey = entityNameMap[resource];
      invariant(mockResourceKey, `Unknown resource for AsyncSearchFilter: ${resource}`);

      const entities = response?.data?.[mockResourceKey];

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
  }, [resource, JSON.stringify(additionalVariables), getEntities]); // Depend on getEntities

  /**
   * Refetches entities based on a search value and pagination.
   * @param {string} name - The search string.
   * @param {boolean} [loadMore=false] - Whether to append new results to existing ones.
   */
  const handleRefetch = async (name: string, loadMore = false) => {
    const updatedName = name !== "" ? name : undefined;
    const after = loadMore ? afterCursor : undefined;

    const queryVariables: OperationVariables = {
      first: INITIAL_PAGINATION.perPage,
      after,
      ...additionalVariables,
    };

    if (updatedName) {
      queryVariables[entityLabelFieldName || 'name'] = updatedName;
    }

    const response = await getEntities({
      variables: queryVariables,
    });

    const entityNameMap: { [key in ResourcesEnum]?: keyof MockResponseType } = {
        [ResourcesEnum.FinancialAccount as ResourcesEnum]: 'financialAccounts',
        [ResourcesEnum.PaymentGateway as ResourcesEnum]: 'paymentGatewaySources',
        [ResourcesEnum.Connection]: 'connections',
        [ResourcesEnum.Counterparty]: 'counterparties',
        [ResourcesEnum.Invoice]: 'invoices',
        [ResourcesEnum.ReconciliationRule]: 'reconciliationRules',
    };
    const mockResourceKey = entityNameMap[resource];
    invariant(mockResourceKey, `Unknown resource for AsyncSearchFilter: ${resource}`);

    const entities = response?.data?.[mockResourceKey];

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

  /**
   * Handles changes in the search input for filtering options.
   * @param {string} searchValue - The current value of the search input.
   */
  const handleChange = (searchValue: string) => {
    void handleRefetch(searchValue);
  };

  /**
   * Handles loading more options for the async search filter.
   * @param {string} searchValue - The current value of the search input.
   */
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

/**
 * Renders a date input filter with predefined options and a date range picker.
 * @param {object} props
 * @param {FinancialFilterType | AppliedFinancialFilterType} props.filter - The filter definition.
 * @param {RefObject<FormikProps<FormValues>>} props.formikRef - Ref to the Formik instance.
 * @param {{ label: string; value: string }[]} [props.options] - Predefined date range options (e.g., "Today", "Last 7 Days").
 * @param {string} [props.className] - Additional CSS class names.
 */
function DateInputFilter({
  filter,
  formikRef,
  options = [],
  className,
}: {
  filter: FinancialFilterType | AppliedFinancialFilterType;
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

  /** Submits the Formik form. */
  const handleSubmit = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit();
    }
  };

  /**
   * Applies the selected date range filter.
   * @param {DateRangeValues} dateRange - The selected date range.
   */
  const onApply = (dateRange: DateRangeValues) => {
    let value = {
      ...dateRange,
      inTheLast: null,
      format: TimeFormatEnum.Date,
    };
    if (value.lte === "") {
      value = omit(value, "lte");
    }
    if (value.gte === "") {
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
            id={`${filter?.key}-${option.value}`}
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

/**
 * Renders a metadata input filter, allowing users to specify a key-value pair.
 * @param {object} props
 * @param {FinancialFilterType | AppliedFinancialFilterType} props.filter - The filter definition.
 * @param {RefObject<FormikProps<FormValues>>} props.formikRef - Ref to the Formik instance.
 */
function MetadataInputFilter({
  filter,
  formikRef,
}: {
  filter: FinancialFilterType | AppliedFinancialFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
}) {
  /**
   * Handles form submission after a small delay.
   * @param {string} newValue - The new value of the input that triggered the change.
   * @param {boolean} isKeyField - True if the changed field is the metadata key.
   */
  function handleSubmit(newValue: string, isKeyField: boolean) {
    setTimeout(() => {
      const currentKey = formikRef.current?.values[`${filter.key}.key`] as string | undefined;
      const currentVal = formikRef.current?.values[`${filter.key}.value`] as string | undefined;

      if (
        formikRef.current &&
        ((isKeyField && newValue && currentVal) || (!isKeyField && currentKey && newValue))
      ) {
        formikRef.current.handleSubmit();
      }
    });
  }

  /**
   * Handles changes in the metadata input fields.
   * @param {string} filterKeyPath - The full path to the filter field (e.g., "metadata.key").
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
   */
  function handleChange(
    filterKeyPath: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    void formikRef?.current?.setFieldValue(filterKeyPath, event.target.value);
    handleSubmit(event.target.value, filterKeyPath.endsWith('.key'));
  }

  return (
    <div className="p-4">
      <Stack className="gap-2">
        <Field
          id={`${filter.key}-key`}
          name={`${filter.key}.key`}
          placeholder="Metadata Key"
          component={FormikInputField}
          className="h-6 text-xs"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(`${filter.key}.key`, event)
          }
        />
        <Field
          id={`${filter.key}-value`}
          className="h-6 text-xs"
          name={`${filter.key}.value`}
          placeholder="Metadata Value"
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

/**
 * Renders a generic search input filter for text-based filtering.
 * @param {object} props
 * @param {FinancialFilterType | AppliedFinancialFilterType} props.filter - The filter definition.
 * @param {RefObject<FormikProps<FormValues>>} props.formikRef - Ref to the Formik instance.
 */
function SearchInputFilter({
  filter,
  formikRef,
}: {
  filter: FinancialFilterType | AppliedFinancialFilterType;
  formikRef: RefObject<FormikProps<FormValues>>;
}) {
  return (
    <div className="p-4">
      <Field
        id={filter.key}
        name={filter.key}
        placeholder={`Search ${filter.name}`}
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

/**
 * Renders a multi-select dropdown filter.
 * @param {object} props
 * @param {() => void} props.onClose - Callback to close the dropdown.
 * @param {FinancialFilterType | AppliedFinancialFilterType} props.filter - The filter definition.
 * @param {{ label: string; value: string }[]} props.options - Array of available options.
 * @param {RefObject<FormikProps<FormValues>>} props.formikRef - Ref to the Formik instance.
 * @param {string[]} props.initialValue - The initial selected values.
 */
function MultiSelectFilter({
  onClose,
  filter,
  options,
  formikRef,
  initialValue,
}: {
  filter: FinancialFilterType | AppliedFinancialFilterType;
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

/**
 * Renders a multi-account select component for filtering by internal financial accounts.
 * This component fetches its options using a mock lazy query hook.
 * @param {object} props
 * @param {string} props.field - The Formik field name.
 * @param {string} props.label - The label for the component.
 * @param {string[]} props.initialValues - Initial selected account IDs.
 * @param {(value: string[]) => void} props.onChange - Callback when selected accounts change.
 * @param {() => void} props.onClose - Callback to close the component.
 */
function MultiFinancialAccountSelect({
  field,
  label,
  initialValues,
  onChange,
  onClose,
}: {
  field: string;
  label: string;
  initialValues: string[];
  onChange: (value: string[]) => void;
  onClose: () => void;
}) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [getAccounts] = useFinancialAccountSelectLazyQueryMock();

  useEffect(() => {
    /** Loads initial financial accounts for the multi-select. */
    const loadAccounts = async () => {
      const response = await getAccounts({ variables: { first: 100 } }); // Fetch more for initial list
      const accounts = response?.data?.financialAccounts?.edges.map(({ node }) => ({
        label: node.name || "",
        value: node.id,
      })) || [];
      setOptions(accounts);
    };
    void loadAccounts();
  }, [getAccounts]);

  return (
    <MultiSelectDropdownPanel
      onClose={onClose}
      categories={[
        {
          id: field,
          items: options.map((o) => ({ id: o.value, label: o.label })),
          label: label,
        },
      ]}
      onChange={(selectedValues) => {
        const selectedValueArray = Object.keys(selectedValues).reduce<
          Array<string>
        >((acc, key) => [...acc, ...selectedValues[key]], []);
        onChange(selectedValueArray);
      }}
      initialValues={{
        [field]: initialValues || [],
      }}
      onSearchValueChange={() => {
        // MultiSelectDropdownPanel does internal search on its items.
        // For larger datasets, AsyncSearchFilter with an actual async query would be used.
      }}
      className="border border-alpha-black-100"
    />
  );
}

/**
 * @typedef {object} FinancialFilterInputRendererProps
 * @property {AppliedFinancialFilterType} appliedFilter - The filter object currently being rendered.
 * @property {(filter: AppliedFinancialFilterType) => void} onChange - Callback function triggered when the filter's value changes.
 * @property {() => void} onClose - Callback function to signal that the filter input should be closed.
 */
interface FinancialFilterInputRendererProps {
  appliedFilter: AppliedFinancialFilterType;
  onChange: (filter: AppliedFinancialFilterType) => void;
  onClose: () => void;
}

/**
 * A central component responsible for rendering the correct input control
 * for a given financial transaction filter type. It acts as a dispatcher
 * based on the filter's `type` property, similar to `FilterInputTypeRenderer` in the seed.
 * @param {FinancialFilterInputRendererProps} props - The properties for the FinancialFilterInputRenderer component.
 * @returns {React.ReactNode} The rendered filter input component.
 */
function FinancialFilterInputRenderer({
  appliedFilter: filter,
  onChange,
  onClose,
}: FinancialFilterInputRendererProps) {
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const initialValue = filter?.value ?? "";

  const fieldType = filter.type;
  const options = filter?.options?.map((enumValue) => ({
    label: enumValue?.prettyValueName,
    value: enumValue?.valueName,
  }));

  let inputRenderer: React.ReactNode;
  switch (fieldType) {
    case LogicalForm__InputTypeEnum.AmountInput:
      inputRenderer = (
        <AmountSearchInputFilter filter={filter} formikRef={formikRef} />
      );
      break;
    case LogicalForm__InputTypeEnum.DateInput:
      inputRenderer = (
        <div className="p-2">
          <DateInputFilter
            filter={filter}
            formikRef={formikRef}
            options={ACCOUNT_DATE_RANGE_FILTER_OPTIONS.map(opt => ({
              label: startCase(opt.value === "today" ? "past24H" : opt.value),
              value: opt.value,
            }))}
          />
        </div>
      );
      break;
    case LogicalForm__InputTypeEnum.MultiSelect:
      invariant(options, "MultiSelect filter must have options.");
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
      invariant(options, "SingleSelect filter must have options.");
      inputRenderer = (
        <ChoiceSearchInputFilter
          filter={filter}
          formikRef={formikRef}
          options={options}
        />
      );
      break;
    case LogicalForm__InputTypeEnum.TextInput:
      inputRenderer = (
        <SearchInputFilter filter={filter} formikRef={formikRef} />
      );
      break;
    case LogicalForm__InputTypeEnum.MetadataInput:
      inputRenderer = (
        <MetadataInputFilter filter={filter} formikRef={formikRef} />
      );
      break;
    case LogicalForm__InputTypeEnum.InternalAccountSelect: // Re-use this for single financial account selection
      inputRenderer = (
        <AsyncSearchFilter
          filter={filter}
          formikRef={formikRef}
          query={useFinancialAccountSelectLazyQueryMock}
          resource={ResourcesEnum.FinancialAccount as ResourcesEnum} // Hypothetical casting
          entityLabelFieldName="name"
        />
      );
      break;
    case LogicalForm__InputTypeEnum.MultiAccountSelect: // Used for selecting multiple financial accounts
      inputRenderer = (
        <MultiFinancialAccountSelect
          field={filter.key}
          label={filter.name}
          initialValues={initialValue as string[]}
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
    case LogicalForm__InputTypeEnum.ConnectionSelect: // Re-purposing for Gateway Source, assuming a 'PaymentGateway' resource concept
      inputRenderer = (
        <AsyncSearchFilter
          filter={filter}
          formikRef={formikRef}
          query={usePaymentGatewaySourceSelectLazyQueryMock}
          resource={ResourcesEnum.Connection as ResourcesEnum} // Casting for illustrative purposes
          entityLabelFieldName="name"
        />
      );
      break;
    case LogicalForm__InputTypeEnum.CounterpartySelect: // Using the actual seed query
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
    default:
      inputRenderer = (
        <div className="mb-4">
          <LoadingLine />
          <p className="p-4 text-center text-xs text-gray-700">
            No input renderer defined for filter type: {fieldType}.
          </p>
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


/**
 * Predefined list of filter options for financial transactions.
 * This array defines the available filters and their initial configurations.
 * These are "FilterType" objects before they are applied (i.e., no `value` yet).
 * @type {FinancialFilterType[]}
 */
const FINANCIAL_TRANSACTION_FILTERS: FinancialFilterType[] = [
  {
    key: "status",
    name: "Payment Status",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "PENDING", prettyValueName: "Pending" },
      { valueName: "COMPLETED", prettyValueName: "Completed" },
      { valueName: "FAILED", prettyValueName: "Failed" },
      { valueName: "REFUNDED", prettyValueName: "Refunded" },
      { valueName: "CANCELLED", prettyValueName: "Cancelled" },
      { valueName: "DISPUTED", prettyValueName: "Disputed" },
      { valueName: "SETTLED", prettyValueName: "Settled" },
      { valueName: "PROCESSING", prettyValueName: "Processing" },
      { valueName: "AUTHORIZED", prettyValueName: "Authorized" },
      { valueName: "EXPIRED", prettyValueName: "Expired" },
    ],
  },
  {
    key: "gatewaySource",
    name: "Gateway Source",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: MOCK_GATEWAY_SOURCES.map(g => ({ valueName: g.id, prettyValueName: g.name })),
  },
  {
    key: "amount",
    name: "Amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "settlementDate",
    name: "Settlement Date",
    type: LogicalForm__InputTypeEnum.DateInput,
  },
  {
    key: "transactionDate",
    name: "Transaction Date",
    type: LogicalForm__InputTypeEnum.DateInput,
  },
  {
    key: "internalAccountIds",
    name: "Financial Accounts",
    type: LogicalForm__InputTypeEnum.MultiAccountSelect,
  },
  {
    key: "externalAccountId",
    name: "External Account (e.g., customer bank account)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "currency",
    name: "Currency",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "USD", prettyValueName: "US Dollar" },
      { valueName: "EUR", prettyValueName: "Euro" },
      { valueName: "GBP", prettyValueName: "British Pound" },
      { valueName: "JPY", prettyValueName: "Japanese Yen" },
      { valueName: "CAD", prettyValueName: "Canadian Dollar" },
      { valueName: "AUD", prettyValueName: "Australian Dollar" },
      { valueName: "CHF", prettyValueName: "Swiss Franc" },
      { valueName: "CNY", prettyValueName: "Chinese Yuan" },
      { valueName: "INR", prettyValueName: "Indian Rupee" },
      { valueName: "BRL", prettyValueName: "Brazilian Real" },
      { valueName: "MXN", prettyValueName: "Mexican Peso" },
      { valueName: "SGD", prettyValueName: "Singapore Dollar" },
      { valueName: "HKD", prettyValueName: "Hong Kong Dollar" },
      { valueName: "NZD", prettyValueName: "New Zealand Dollar" },
      { valueName: "ZAR", prettyValueName: "South African Rand" },
      { valueName: "SEK", prettyValueName: "Swedish Krona" },
      { valueName: "NOK", prettyValueName: "Norwegian Krone" },
      { valueName: "DKK", prettyValueName: "Danish Krone" },
      { valueName: "RUB", prettyValueName: "Russian Ruble" },
      { valueName: "KRW", prettyValueName: "South Korean Won" },
      { valueName: "TWD", prettyValueName: "New Taiwan Dollar" },
      { valueName: "PLN", prettyValueName: "Polish Złoty" },
      { valueName: "THB", prettyValueName: "Thai Baht" },
      { valueName: "IDR", prettyValueName: "Indonesian Rupiah" },
      { valueName: "MYR", prettyValueName: "Malaysian Ringgit" },
      { valueName: "PHP", prettyValueName: "Philippine Peso" },
      { valueName: "AED", prettyValueName: "UAE Dirham" },
      { valueName: "SAR", prettyValueName: "Saudi Riyal" },
      { valueName: "TRY", prettyValueName: "Turkish Lira" },
      { valueName: "CLP", prettyValueName: "Chilean Peso" },
      { valueName: "COP", prettyValueName: "Colombian Peso" },
      { valueName: "EGP", prettyValueName: "Egyptian Pound" },
    ],
  },
  {
    key: "transactionId",
    name: "Transaction ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "paymentId",
    name: "Payment ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "invoiceNumber",
    name: "Invoice Number",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "referenceNumber",
    name: "Reference Number",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "description",
    name: "Description",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "counterpartyId",
    name: "Counterparty",
    type: LogicalForm__InputTypeEnum.CounterpartySelect,
  },
  {
    key: "tag",
    name: "Tags",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "OPERATIONAL", prettyValueName: "Operational" },
      { valueName: "INVESTMENT", prettyValueName: "Investment" },
      { valueName: "PAYROLL", prettyValueName: "Payroll" },
      { valueName: "SUPPLIER_PAYMENT", prettyValueName: "Supplier Payment" },
      { valueName: "CUSTOMER_RECEIPT", prettyValueName: "Customer Receipt" },
      { valueName: "FEES", prettyValueName: "Fees" },
      { valueName: "TAXES", prettyValueName: "Taxes" },
      { valueName: "INTEREST", prettyValueName: "Interest" },
      { valueName: "DIVIDEND", prettyValueName: "Dividend" },
      { valueName: "TRANSFER", prettyValueName: "Transfer" },
      { valueName: "ADJUSTMENT", prettyValueName: "Adjustment" },
      { valueName: "REFUND", prettyValueName: "Refund" },
      { valueName: "CHARGEBACK", prettyValueName: "Chargeback" },
      { valueName: "VOID", prettyValueName: "Void" },
      { valueName: "DEPOSIT", prettyValueName: "Deposit" },
      { valueName: "WITHDRAWAL", prettyValueName: "Withdrawal" },
    ],
  },
  {
    key: "batchId",
    name: "Batch ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "sourceSystem",
    name: "Source System (e.g., ERP, CRM)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "transactionType",
    name: "Transaction Type",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "DEBIT", prettyValueName: "Debit" },
      { valueName: "CREDIT", prettyValueName: "Credit" },
      { valueName: "TRANSFER_IN", prettyValueName: "Transfer In" },
      { valueName: "TRANSFER_OUT", prettyValueName: "Transfer Out" },
      { valueName: "PAYMENT_SEND", prettyValueName: "Payment Send" },
      { valueName: "PAYMENT_RECEIVE", prettyValueName: "Payment Receive" },
    ],
  },
  {
    key: "reconciliationStatus",
    name: "Reconciliation Status",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "UNRECONCILED", prettyValueName: "Unreconciled" },
      { valueName: "PARTIALLY_RECONCILED", prettyValueName: "Partially Reconciled" },
      { valueName: "RECONCILED", prettyValueName: "Reconciled" },
      { valueName: "EXCEPTION", prettyValueName: "Exception" },
    ],
  },
  {
    key: "category",
    name: "Category",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "OPERATING_EXPENSE", prettyValueName: "Operating Expense" },
      { valueName: "CAPITAL_EXPENDITURE", prettyValueName: "Capital Expenditure" },
      { valueName: "REVENUE", prettyValueName: "Revenue" },
      { valueName: "ASSET_PURCHASE", prettyValueName: "Asset Purchase" },
      { valueName: "LIABILITY_REPAYMENT", prettyValueName: "Liability Repayment" },
      { valueName: "INTERCOMPANY", prettyValueName: "Intercompany" },
      { valueName: "OTHER", prettyValueName: "Other" },
    ],
  },
  {
    key: "riskScore",
    name: "Risk Score",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "initiatorId",
    name: "Initiator User ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "channel",
    name: "Channel (e.g., API, UI, File)",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "API", prettyValueName: "API" },
      { valueName: "UI", prettyValueName: "User Interface" },
      { valueName: "FILE_UPLOAD", prettyValueName: "File Upload" },
      { valueName: "BATCH", prettyValueName: "Batch Process" },
    ],
  },
  {
    key: "countryCode",
    name: "Origin Country Code",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "US", prettyValueName: "United States" },
      { valueName: "GB", prettyValueName: "United Kingdom" },
      { valueName: "CA", prettyValueName: "Canada" },
      { valueName: "AU", prettyValueName: "Australia" },
      { valueName: "DE", prettyValueName: "Germany" },
      { valueName: "FR", prettyValueName: "France" },
      { valueName: "JP", prettyValueName: "Japan" },
      { valueName: "IN", prettyValueName: "India" },
      { valueName: "BR", prettyValueName: "Brazil" },
      { valueName: "CN", prettyValueName: "China" },
      { valueName: "MX", prettyValueName: "Mexico" },
      { valueName: "AE", prettyValueName: "United Arab Emirates" },
      { valueName: "SG", prettyValueName: "Singapore" },
      { valueName: "KR", prettyValueName: "South Korea" },
      { valueName: "IT", prettyValueName: "Italy" },
      { valueName: "ES", prettyValueName: "Spain" },
      { valueName: "NL", prettyValueName: "Netherlands" },
      { valueName: "CH", prettyValueName: "Switzerland" },
      { valueName: "SE", prettyValueName: "Sweden" },
      { valueName: "BE", prettyValueName: "Belgium" },
      { valueName: "NO", prettyValueName: "Norway" },
      { valueName: "DK", prettyValueName: "Danish Krone" },
      { valueName: "FI", prettyValueName: "Finland" },
      { valueName: "IE", prettyValueName: "Ireland" },
      { valueName: "PT", prettyValueName: "Portugal" },
      { valueName: "AT", prettyValueName: "Austria" },
      { valueName: "GR", prettyValueName: "Greece" },
      { valueName: "PL", prettyValueName: "Poland" },
      { valueName: "TR", prettyValueName: "Turkey" },
      { valueName: "ZA", prettyValueName: "South Africa" },
      { valueName: "EG", prettyValueName: "Egypt" },
      { valueName: "SA", prettyValueName: "Saudi Arabia" },
      { valueName: "AR", prettyValueName: "Argentina" },
      { valueName: "CL", prettyValueName: "Chile" },
      { valueName: "CO", prettyValueName: "Colombia" },
      { valueName: "PE", prettyValueName: "Peru" },
      { valueName: "PH", prettyValueName: "Philippines" },
      { valueName: "VN", prettyValueName: "Vietnam" },
      { valueName: "ID", prettyValueName: "Indonesia" },
      { valueName: "MY", prettyValueName: "Malaysia" },
      { valueName: "TH", prettyValueName: "Thailand" },
      { valueName: "UA", prettyValueName: "Ukraine" },
      { valueName: "RU", prettyValueName: "Russia" },
      { valueName: "CZ", prettyValueName: "Czech Republic" },
      { valueName: "HU", prettyValueName: "Hungary" },
      { valueName: "RO", prettyValueName: "Romania" },
    ]
  },
  {
    key: "paymentMethodType",
    name: "Payment Method Type",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "CARD", prettyValueName: "Card" },
      { valueName: "ACH", prettyValueName: "ACH" },
      { valueName: "WIRE", prettyValueName: "Wire" },
      { valueName: "CHECK", prettyValueName: "Check" },
      { valueName: "WALLET", prettyValueName: "Digital Wallet" },
      { valueName: "SEPA", prettyValueName: "SEPA" },
      { valueName: "BACS", prettyValueName: "BACS" },
      { valueName: "CHAPS", prettyValueName: "CHAPS" },
      { valueName: "FPS", prettyValueName: "Faster Payments" },
      { valueName: "RTP", prettyValueName: "Real-Time Payments" },
      { valueName: "SWIFT", prettyValueName: "SWIFT" },
      { valueName: "INTERAC", prettyValueName: "Interac" },
      { valueName: "UPI", prettyValueName: "UPI" },
      { valueName: "ALIPAY", prettyValueName: "Alipay" },
      { valueName: "WECHATPAY", prettyValueName: "WeChat Pay" },
    ]
  },
  {
    key: "internalRefId",
    name: "Internal Reference ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "externalRefId",
    name: "External Reference ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "isIntercompany",
    name: "Is Intercompany",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "true", prettyValueName: "Yes" },
      { valueName: "false", prettyValueName: "No" },
    ]
  },
  {
    key: "isRecurring",
    name: "Is Recurring",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "true", prettyValueName: "Yes" },
      { valueName: "false", prettyValueName: "No" },
    ]
  },
  {
    key: "region",
    name: "Region",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "NORTH_AMERICA", prettyValueName: "North America" },
      { valueName: "EUROPE", prettyValueName: "Europe" },
      { valueName: "ASIA", prettyValueName: "Asia" },
      { valueName: "SOUTH_AMERICA", prettyValueName: "South America" },
      { valueName: "AFRICA", prettyValueName: "Africa" },
      { valueName: "OCEANIA", prettyValueName: "Oceania" },
    ]
  },
  {
    key: "department",
    name: "Department",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "FINANCE", prettyValueName: "Finance" },
      { valueName: "SALES", prettyValueName: "Sales" },
      { valueName: "MARKETING", prettyValueName: "Marketing" },
      { valueName: "ENGINEERING", prettyValueName: "Engineering" },
      { valueName: "HR", prettyValueName: "Human Resources" },
      { valueName: "OPERATIONS", prettyValueName: "Operations" },
      { valueName: "LEGAL", prettyValueName: "Legal" },
      { valueName: "PRODUCT", prettyValueName: "Product" },
    ]
  },
  {
    key: "glAccount",
    name: "GL Account Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "costCenter",
    name: "Cost Center",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "projectCode",
    name: "Project Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "sourceDocumentId",
    name: "Source Document ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "initiatorRole",
    name: "Initiator Role",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "ADMIN", prettyValueName: "Admin" },
      { valueName: "FINANCE_MANAGER", prettyValueName: "Finance Manager" },
      { valueName: "ACCOUNTANT", prettyValueName: "Accountant" },
      { valueName: "DEVELOPER", prettyValueName: "Developer" },
      { valueName: "BUSINESS_USER", prettyValueName: "Business User" },
    ]
  },
  {
    key: "approvalStatus",
    name: "Approval Status",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "PENDING_APPROVAL", prettyValueName: "Pending Approval" },
      { valueName: "APPROVED", prettyValueName: "Approved" },
      { valueName: "REJECTED", prettyValueName: "Rejected" },
      { valueName: "NOT_REQUIRED", prettyValueName: "Not Required" },
    ]
  },
  {
    key: "priority",
    name: "Priority",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "HIGH", prettyValueName: "High" },
      { valueName: "MEDIUM", prettyValueName: "Medium" },
      { valueName: "LOW", prettyValueName: "Low" },
    ]
  },
  {
    key: "auditLogId",
    name: "Audit Log ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "deviceType",
    name: "Device Type",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "DESKTOP", prettyValueName: "Desktop" },
      { valueName: "MOBILE", prettyValueName: "Mobile" },
      { valueName: "TABLET", prettyValueName: "Tablet" },
      { valueName: "API", prettyValueName: "API" },
    ]
  },
  {
    key: "ipAddress",
    name: "IP Address",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "userAgent",
    name: "User Agent",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "geographicalLocation",
    name: "Geographical Location",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "businessUnit",
    name: "Business Unit",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "CORPORATE", prettyValueName: "Corporate" },
      { valueName: "RETAIL", prettyValueName: "Retail" },
      { valueName: "COMMERCIAL", prettyValueName: "Commercial" },
      { valueName: "INVESTMENT_BANKING", prettyValueName: "Investment Banking" },
      { valueName: "WEALTH_MANAGEMENT", prettyValueName: "Wealth Management" },
    ]
  },
  {
    key: "product",
    name: "Product/Service",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "LOANS", prettyValueName: "Loans" },
      { valueName: "DEPOSITS", prettyValueName: "Deposits" },
      { valueName: "CREDIT_CARDS", prettyValueName: "Credit Cards" },
      { valueName: "INVESTMENTS", prettyValueName: "Investments" },
      { valueName: "TREASURY_SERVICES", prettyValueName: "Treasury Services" },
      { valueName: "FX_TRADING", prettyValueName: "FX Trading" },
    ]
  },
  {
    key: "memo",
    name: "Memo/Note Content",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "metadata",
    name: "Custom Metadata",
    type: LogicalForm__InputTypeEnum.MetadataInput,
  },
  {
    key: "entityId",
    name: "Entity ID (e.g., Legal Entity)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "paymentNetwork",
    name: "Payment Network",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "VISA_NETWORK", prettyValueName: "Visa Network" },
      { valueName: "MASTERCARD_NETWORK", prettyValueName: "Mastercard Network" },
      { valueName: "AMERICAN_EXPRESS_NETWORK", prettyValueName: "American Express Network" },
      { valueName: "DISCOVER_NETWORK", prettyValueName: "Discover Network" },
      { valueName: "JCB_NETWORK", prettyValueName: "JCB Network" },
      { valueName: "UNIONPAY_NETWORK", prettyValueName: "UnionPay Network" },
      { valueName: "NACHA", prettyValueName: "NACHA (ACH)" },
      { valueName: "FEDWIRE", prettyValueName: "Fedwire" },
      { valueName: "CHIPS", prettyValueName: "CHIPS" },
      { valueName: "SWIFT_NETWORK", prettyValueName: "SWIFT Network" },
      { valueName: "SEPA_NETWORK", prettyValueName: "SEPA Network" },
      { valueName: "BACS_NETWORK", prettyValueName: "BACS Network" },
      { valueName: "CHAPS_NETWORK", prettyValueName: "CHAPS Network" },
    ]
  },
  {
    key: "processingStatusCode",
    name: "Processing Status Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "fraudScore",
    name: "Fraud Score",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "originalTransactionId",
    name: "Original Transaction ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "batchReferenceId",
    name: "Batch Reference ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "settlementCurrency",
    name: "Settlement Currency",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "USD", prettyValueName: "US Dollar" },
      { valueName: "EUR", prettyValueName: "Euro" },
      { valueName: "GBP", prettyValueName: "British Pound" },
      { valueName: "JPY", prettyValueName: "Japanese Yen" },
      { valueName: "CAD", prettyValueName: "Canadian Dollar" },
      { valueName: "AUD", prettyValueName: "Australian Dollar" },
    ]
  },
  {
    key: "conversionRate",
    name: "Conversion Rate",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "feeAmount",
    name: "Fee Amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "taxAmount",
    name: "Tax Amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "grossAmount",
    name: "Gross Amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "netAmount",
    name: "Net Amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "instrumentType",
    name: "Instrument Type",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "BANK_ACCOUNT", prettyValueName: "Bank Account" },
      { valueName: "CREDIT_CARD", prettyValueName: "Credit Card" },
      { valueName: "DEBIT_CARD", prettyValueName: "Debit Card" },
      { valueName: "PREPAID_CARD", prettyValueName: "Prepaid Card" },
      { valueName: "DIGITAL_WALLET", prettyValueName: "Digital Wallet" },
      { valueName: "TOKEN", prettyValueName: "Payment Token" },
    ]
  },
  {
    key: "processorTransactionId",
    name: "Processor Transaction ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "acquirerId",
    name: "Acquirer ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "merchantId",
    name: "Merchant ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "terminalId",
    name: "Terminal ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "customerReference",
    name: "Customer Reference",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "vendorReference",
    name: "Vendor Reference",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "reversalStatus",
    name: "Reversal Status",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "NOT_REVERSED", prettyValueName: "Not Reversed" },
      { valueName: "PARTIALLY_REVERSED", prettyValueName: "Partially Reversed" },
      { valueName: "FULLY_REVERSED", prettyValueName: "Fully Reversed" },
    ]
  },
  {
    key: "chargebackStatus",
    name: "Chargeback Status",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "NO_CHARGEBACK", prettyValueName: "No Chargeback" },
      { valueName: "CHARGEBACK_INITIATED", prettyValueName: "Chargeback Initiated" },
      { valueName: "CHARGEBACK_WON", prettyValueName: "Chargeback Won" },
      { valueName: "CHARGEBACK_LOST", prettyValueName: "Chargeback Lost" },
    ]
  },
  {
    key: "refundStatus",
    name: "Refund Status",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "NO_REFUND", prettyValueName: "No Refund" },
      { valueName: "PENDING_REFUND", prettyValueName: "Pending Refund" },
      { valueName: "REFUNDED_PARTIALLY", prettyValueName: "Partially Refunded" },
      { valueName: "REFUNDED_FULLY", prettyValueName: "Fully Refunded" },
    ]
  },
  {
    key: "authorizationCode",
    name: "Authorization Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "avsResult",
    name: "AVS Result",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "cvvResult",
    name: "CVV Result",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "riskReasonCode",
    name: "Risk Reason Code",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "HIGH_VELOCITY", prettyValueName: "High Velocity" },
      { valueName: "IP_MISMATCH", prettyValueName: "IP Mismatch" },
      { valueName: "CARD_BLACKLISTED", prettyValueName: "Card Blacklisted" },
      { valueName: "ADDRESS_MISMATCH", prettyValueName: "Address Mismatch" },
      { valueName: "UNUSUAL_AMOUNT", prettyValueName: "Unusual Amount" },
    ]
  },
  {
    key: "networkStatusCode",
    name: "Network Status Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "schemeReference",
    name: "Scheme Reference",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "mandateId",
    name: "Mandate ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "invoiceStatus",
    name: "Invoice Status",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "DRAFT", prettyValueName: "Draft" },
      { valueName: "SENT", prettyValueName: "Sent" },
      { valueName: "PAID", prettyValueName: "Paid" },
      { valueName: "OVERDUE", prettyValueName: "Overdue" },
      { valueName: "VOIDED", prettyValueName: "Voided" },
    ]
  },
  {
    key: "billingAccountId",
    name: "Billing Account ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "shippingAccountId",
    name: "Shipping Account ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "customerType",
    name: "Customer Type",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "INDIVIDUAL", prettyValueName: "Individual" },
      { valueName: "BUSINESS", prettyValueName: "Business" },
      { valueName: "CORPORATE", prettyValueName: "Corporate" },
      { valueName: "GOVERNMENT", prettyValueName: "Government" },
    ]
  },
  {
    key: "merchantCategoryCode",
    name: "Merchant Category Code (MCC)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "cardBrand",
    name: "Card Brand",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "VISA", prettyValueName: "Visa" },
      { valueName: "MASTERCARD", prettyValueName: "Mastercard" },
      { valueName: "AMEX", prettyValueName: "American Express" },
      { valueName: "DISCOVER", prettyValueName: "Discover" },
      { valueName: "JCB", prettyValueName: "JCB" },
      { valueName: "UNIONPAY", prettyValueName: "UnionPay" },
      { valueName: "DINERS_CLUB", prettyValueName: "Diners Club" },
    ]
  },
  {
    key: "cardIssuerCountry",
    name: "Card Issuer Country",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "US", prettyValueName: "United States" },
      { valueName: "GB", prettyValueName: "United Kingdom" },
      { valueName: "CA", prettyValueName: "Canada" },
      { valueName: "AU", prettyValueName: "Australia" },
    ]
  },
  {
    key: "bankName",
    name: "Bank Name",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "bankCountry",
    name: "Bank Country",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "US", prettyValueName: "United States" },
      { valueName: "GB", prettyValueName: "United Kingdom" },
      { valueName: "CA", prettyValueName: "Canada" },
      { valueName: "AU", prettyValueName: "Australia" },
    ]
  },
  {
    key: "iban",
    name: "IBAN",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "bicSwift",
    name: "BIC/SWIFT",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "routingNumber",
    name: "Routing Number",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "accountNumber",
    name: "Account Number",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "statementDescription",
    name: "Statement Description",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "reportingPeriod",
    name: "Reporting Period",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "CURRENT_MONTH", prettyValueName: "Current Month" },
      { valueName: "LAST_MONTH", prettyValueName: "Last Month" },
      { valueName: "CURRENT_QUARTER", prettyValueName: "Current Quarter" },
      { valueName: "LAST_QUARTER", prettyValueName: "Last Quarter" },
      { valueName: "CURRENT_YEAR", prettyValueName: "Current Year" },
      { valueName: "LAST_YEAR", prettyValueName: "Last Year" },
    ]
  },
  {
    key: "entryMethod",
    name: "Entry Method (e.g., POS, Online, Mail)",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "POS", prettyValueName: "Point-of-Sale" },
      { valueName: "ONLINE", prettyValueName: "Online" },
      { valueName: "MAIL_ORDER", prettyValueName: "Mail Order" },
      { valueName: "TELEPHONE_ORDER", prettyValueName: "Telephone Order" },
      { valueName: "MOTO", prettyValueName: "MOTO" },
    ]
  },
  {
    key: "fundingInstrument",
    name: "Funding Instrument",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "settlementBatchId",
    name: "Settlement Batch ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "clearingDate",
    name: "Clearing Date",
    type: LogicalForm__InputTypeEnum.DateInput,
  },
  {
    key: "valueDate",
    name: "Value Date",
    type: LogicalForm__InputTypeEnum.DateInput,
  },
  {
    key: "interchangeFee",
    name: "Interchange Fee",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "schemeFee",
    name: "Scheme Fee",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "processorFee",
    name: "Processor Fee",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "markupFee",
    name: "Markup Fee",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "netPnl",
    name: "Net P&L",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "tradeId",
    name: "Trade ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "orderId",
    name: "Order ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "subscriptionId",
    name: "Subscription ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "contractId",
    name: "Contract ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "customerEmail",
    name: "Customer Email",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "customerPhone",
    name: "Customer Phone",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "billingAddress",
    name: "Billing Address (Partial)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "shippingAddress",
    name: "Shipping Address (Partial)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "returnCode",
    name: "Return Code (e.g., ACH return code)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "disputeReasonCode",
    name: "Dispute Reason Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "receiptId",
    name: "Receipt ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "taxIdentifier",
    name: "Tax Identifier (e.g., EIN, SSN)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "fxRateProvider",
    name: "FX Rate Provider",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "auditTrailId",
    name: "Audit Trail ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "sanctionsScreeningResult",
    name: "Sanctions Screening Result",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "CLEAN", prettyValueName: "Clean" },
      { valueName: "POTENTIAL_HIT", prettyValueName: "Potential Hit" },
      { valueName: "BLOCKED", prettyValueName: "Blocked" },
      { valueName: "PENDING_REVIEW", prettyValueName: "Pending Review" },
    ]
  },
  {
    key: "amlScore",
    name: "AML Score",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "complianceStatus",
    name: "Compliance Status",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "COMPLIANT", prettyValueName: "Compliant" },
      { valueName: "NON_COMPLIANT", prettyValueName: "Non-Compliant" },
      { valueName: "UNDER_REVIEW", prettyValueName: "Under Review" },
    ]
  },
  {
    key: "paymentInstructionId",
    name: "Payment Instruction ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "remittanceInformation",
    name: "Remittance Information",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "purposeCode",
    name: "Purpose Code (e.g., ISO 20022)",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "ultimateDebtor",
    name: "Ultimate Debtor",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "ultimateCreditor",
    name: "Ultimate Creditor",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "debtorAgent",
    name: "Debtor Agent Bank",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "creditorAgent",
    name: "Creditor Agent Bank",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "endToEndId",
    name: "End-to-End ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "originalMessageId",
    name: "Original Message ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "cancellationReason",
    name: "Cancellation Reason",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "modifiedByUserId",
    name: "Modified By User ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "creationDate",
    name: "Creation Date",
    type: LogicalForm__InputTypeEnum.DateInput,
  },
  {
    key: "lastModifiedDate",
    name: "Last Modified Date",
    type: LogicalForm__InputTypeEnum.DateInput,
  },
  {
    key: "rejectionReason",
    name: "Rejection Reason",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "sourceIpAddress",
    name: "Source IP Address",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "destinationIpAddress",
    name: "Destination IP Address",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "httpStatusCode",
    name: "HTTP Status Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "latencyMs",
    name: "Latency (ms)",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "payloadSizeKb",
    name: "Payload Size (KB)",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "apiEndpoint",
    name: "API Endpoint",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "correlationId",
    name: "Correlation ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "environment",
    name: "Environment (e.g., Production, Sandbox)",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "PRODUCTION", prettyValueName: "Production" },
      { valueName: "SANDBOX", prettyValueName: "Sandbox" },
      { valueName: "DEVELOPMENT", prettyValueName: "Development" },
      { valueName: "STAGING", prettyValueName: "Staging" },
    ]
  },
  {
    key: "serviceName",
    name: "Service Name",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "threadId",
    name: "Thread ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "sessionDurationMs",
    name: "Session Duration (ms)",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "authenticationMethod",
    name: "Authentication Method",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "PASSWORD", prettyValueName: "Password" },
      { valueName: "MFA", prettyValueName: "Multi-Factor Authentication" },
      { valueName: "SSO", prettyValueName: "Single Sign-On" },
      { valueName: "API_KEY", prettyValueName: "API Key" },
      { valueName: "OAUTH", prettyValueName: "OAuth" },
    ]
  },
  {
    key: "authorizationDecision",
    name: "Authorization Decision",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "GRANTED", prettyValueName: "Granted" },
      { valueName: "DENIED", prettyValueName: "Denied" },
      { valueName: "PENDING", prettyValueName: "Pending" },
    ]
  },
  {
    key: "resourceAccessed",
    name: "Resource Accessed",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "requestBodyHash",
    name: "Request Body Hash",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "responseBodyHash",
    name: "Response Body Hash",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "requestTimestamp",
    name: "Request Timestamp",
    type: LogicalForm__InputTypeEnum.DateInput,
  },
  {
    key: "responseTimestamp",
    name: "Response Timestamp",
    type: LogicalForm__InputTypeEnum.DateInput,
  },
  {
    key: "errorMessage",
    name: "Error Message",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "errorCode",
    name: "Error Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "traceId",
    name: "Trace ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "spanId",
    name: "Span ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "parentSpanId",
    name: "Parent Span ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "logLevel",
    name: "Log Level",
    type: LogicalForm__InputTypeEnum.MultiSelect,
    options: [
      { valueName: "INFO", prettyValueName: "Info" },
      { valueName: "WARN", prettyValueName: "Warning" },
      { valueName: "ERROR", prettyValueName: "Error" },
      { valueName: "DEBUG", prettyValueName: "Debug" },
      { valueName: "TRACE", prettyValueName: "Trace" },
      { valueName: "CRITICAL", prettyValueName: "Critical" },
    ]
  },
  {
    key: "systemEvent",
    name: "System Event",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "eventSource",
    name: "Event Source",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "component",
    name: "Component",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "version",
    name: "Version",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "tenantId",
    name: "Tenant ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "organizationId",
    name: "Organization ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "departmentId",
    name: "Department ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "branchId",
    name: "Branch ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "employeeId",
    name: "Employee ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "partnerId",
    name: "Partner ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "vendorId",
    name: "Vendor ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "campaignId",
    name: "Campaign ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "promotionCode",
    name: "Promotion Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "discountAmount",
    name: "Discount Amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "giftCardAmount",
    name: "Gift Card Amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "loyaltyPointsUsed",
    name: "Loyalty Points Used",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "couponCode",
    name: "Coupon Code",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "sourceApplication",
    name: "Source Application",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "destinationApplication",
    name: "Destination Application",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "externalSystemCorrelationId",
    name: "External System Correlation ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "messageQueueId",
    name: "Message Queue ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "blockchainTransactionId",
    name: "Blockchain Transaction ID",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "cryptocurrencyType",
    name: "Cryptocurrency Type",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "BITCOIN", prettyValueName: "Bitcoin" },
      { valueName: "ETHEREUM", prettyValueName: "Ethereum" },
      { valueName: "RIPPLE", prettyValueName: "Ripple (XRP)" },
      { valueName: "LITECOIN", prettyValueName: "Litecoin" },
      { valueName: "DOGECOIN", prettyValueName: "Dogecoin" },
      { valueName: "USDT", prettyValueName: "Tether (USDT)" },
    ]
  },
  {
    key: "walletAddress",
    name: "Wallet Address",
    type: LogicalForm__InputTypeEnum.TextInput,
  },
  {
    key: "tokenAmount",
    name: "Token Amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "gasFee",
    name: "Gas Fee",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "exchangeRate",
    name: "Exchange Rate (Crypto)",
    type: LogicalForm__InputTypeEnum.AmountInput,
  },
  {
    key: "networkConfirmationStatus",
    name: "Network Confirmation Status",
    type: LogicalForm__InputTypeEnum.SingleSelect,
    options: [
      { valueName: "PENDING", prettyValueName: "Pending" },
      { valueName: "CONFIRMED", prettyValueName: "Confirmed" },
      { valueName: "FAILED", prettyValueName: "Failed" },
    ]
  },
];


/**
 * @typedef {object} FinancialTransactionFilterProps
 * @property {AppliedFinancialFilterType[]} [initialAppliedFilters] - An array of filters that are already applied when the component mounts.
 * @property {(appliedFilters: AppliedFinancialFilterType[]) => void} onApplyFilters - Callback function triggered when filters are applied.
 * @property {() => void} [onClose] - Optional callback to close the filter panel if it's part of a larger modal/dropdown.
 */
interface FinancialTransactionFilterProps {
  initialAppliedFilters?: AppliedFinancialFilterType[];
  onApplyFilters: (appliedFilters: AppliedFinancialFilterType[]) => void;
  onClose?: () => void;
}

/**
 * The main React component for filtering financial transactions.
 * It provides an extensive set of user interface controls for filtering financial
 * transactions based on various criteria like payment status, gateway source,
 * amount ranges, settlement dates, and associated financial accounts.
 * This component leverages internal mock API clients for data interaction,
 * mimicking a modern financial backend integration.
 *
 * The component aims to be comprehensive, flexible, and adhere to the
 * architectural style defined by the seed file, while managing a large
 * number of potential filtering dimensions.
 *
 * @param {FinancialTransactionFilterProps} props - The properties for the FinancialTransactionFilter component.
 * @returns {React.ReactElement} The rendered financial transaction filter UI.
 */
function FinancialTransactionFilter({
  initialAppliedFilters = [],
  onApplyFilters,
  onClose,
}: FinancialTransactionFilterProps): React.ReactElement {
  // Initialize form values from initialAppliedFilters
  const initialFormValues = useRef<FormValues>(
    initialAppliedFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.value;
      return acc;
    }, {} as FormValues),
  );

  const formikRef = useRef<FormikProps<FormValues>>(null);

  const [appliedFiltersState, setAppliedFiltersState] = useState<AppliedFinancialFilterType[]>(
    initialAppliedFilters,
  );

  useEffect(() => {
    setAppliedFiltersState(initialAppliedFilters);
    // Re-initialize formik's values if initialAppliedFilters change
    if (formikRef.current) {
      formikRef.current.resetForm({
        values: initialAppliedFilters.reduce((acc, filter) => {
          acc[filter.key] = filter.value;
          return acc;
        }, {} as FormValues),
      });
    }
  }, [initialAppliedFilters]);

  /**
   * Checks if a filter value is considered empty and should be removed.
   * @param {AppliedFinancialFilterType["value"]} value - The filter value to check.
   * @returns {boolean} True if the value is empty, false otherwise.
   */
  const isFilterValueEmpty = (value: AppliedFinancialFilterType["value"]): boolean => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'object' && value !== null) {
      if (('gte' in value || 'lte' in value) && !(value.gte || value.lte)) return true;
      if (('key' in value || 'value' in value) && !((value as {key?: string, value?: string}).key || (value as {key?: string, value?: string}).value)) return true;
    }
    return false;
  };

  /**
   * Updates a single filter's value and triggers the overall apply callback.
   * This function is debounced by the individual input components' `setTimeout(handleSubmit)`.
   * @param {AppliedFinancialFilterType} updatedFilter - The filter with its new applied value.
   */
  const handleFilterChange = useCallback(
    (updatedFilter: AppliedFinancialFilterType) => {
      setAppliedFiltersState((prevFilters) => {
        const existingIndex = prevFilters.findIndex(
          (f) => f.key === updatedFilter.key,
        );
        let newFilters: AppliedFinancialFilterType[];

        if (isFilterValueEmpty(updatedFilter.value)) {
          // If value is empty/null, remove the filter
          newFilters = prevFilters.filter((f) => f.key !== updatedFilter.key);
        } else if (existingIndex > -1) {
          // Update existing filter
          newFilters = [...prevFilters];
          newFilters[existingIndex] = updatedFilter;
        } else {
          // Add new filter
          const baseFilter = FINANCIAL_TRANSACTION_FILTERS.find(f => f.key === updatedFilter.key);
          if (baseFilter) {
            newFilters = [...prevFilters, { ...baseFilter, value: updatedFilter.value }];
          } else {
            newFilters = prevFilters; // Should not happen if filter key is predefined
          }
        }
        onApplyFilters(newFilters);
        return newFilters;
      });
    },
    [onApplyFilters],
  );

  /**
   * Handles the form submission for all filters. This is called by Formik internally
   * when any child Field's onChange triggers `setTimeout(formikRef.current.handleSubmit)`.
   * The `onApplyFilters` callback is already handled by `handleFilterChange` for individual fields.
   * This specific `onSubmit` for the main Formik is primarily for explicit button submissions if any.
   * @param {FormValues} values - The current values from the Formik form.
   */
  const handleFormikSubmit = (values: FormValues) => {
    const newAppliedFilters: AppliedFinancialFilterType[] = [];
    FINANCIAL_TRANSACTION_FILTERS.forEach((filterDefinition) => {
      const value = values[filterDefinition.key];
      // Only include filters that have a non-empty value
      if (!isFilterValueEmpty(value)) {
        newAppliedFilters.push({ ...filterDefinition, value });
      }
    });
    onApplyFilters(newAppliedFilters);
    if (onClose) onClose();
  };

  const hasAppliedFilters = appliedFiltersState.length > 0;

  return (
    <div className="flex h-full flex-col bg-white shadow-lg rounded-md">
      <div className="flex items-center justify-between border-b border-alpha-black-100 p-4">
        <h3 className="text-sm font-medium text-gray-900">Filter Financial Transactions</h3>
        <Button
          buttonType="text"
          size="sm"
          onClick={() => {
            setAppliedFiltersState([]);
            onApplyFilters([]);
            if (formikRef.current) {
              formikRef.current.resetForm({ values: {} });
            }
          }}
          disabled={!hasAppliedFilters}
        >
          Clear All
        </Button>
      </div>

      <Formik
        initialValues={initialFormValues.current}
        onSubmit={handleFormikSubmit}
        innerRef={formikRef}
        enableReinitialize={true}
      >
        {({ values, resetForm }) => (
          <Form className="flex flex-col flex-grow overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 p-4">
              {FINANCIAL_TRANSACTION_FILTERS.map((filterDefinition) => {
                const appliedFilterForRenderer: AppliedFinancialFilterType = {
                  ...filterDefinition,
                  value: values[filterDefinition.key],
                };
                return (
                  <div key={filterDefinition.key} className="relative group p-2 border border-gray-100 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold text-gray-700">
                        {startCase(filterDefinition.name)}
                      </Label>
                      {!isFilterValueEmpty(appliedFilterForRenderer.value) && (
                        <Button
                          buttonType="link"
                          className="text-red-500 hover:text-red-700 text-xs py-0 px-1"
                          onClick={() => {
                            void formikRef.current?.setFieldValue(filterDefinition.key, null);
                            handleFilterChange({ ...filterDefinition, value: null });
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <FinancialFilterInputRenderer
                      key={filterDefinition.key}
                      appliedFilter={appliedFilterForRenderer}
                      onChange={handleFilterChange}
                      onClose={() => { /* No-op for individual filters here, main panel handles close */ }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-alpha-black-100 p-4 bg-white">
              <Button buttonType="secondary" onClick={() => {
                resetForm({ values: initialFormValues.current });
                onApplyFilters(initialAppliedFilters);
                if (onClose) onClose();
              }}>
                Reset
              </Button>
              <Button type="submit">
                Apply Filters
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default FinancialTransactionFilter;