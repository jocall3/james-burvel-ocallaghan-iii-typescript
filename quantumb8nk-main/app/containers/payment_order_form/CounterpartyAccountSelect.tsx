// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useEffect, useState } from "react";
import { components } from "react-select";
import {
  AsyncPaginate,
  reduceGroupedOptions,
} from "react-select-async-paginate";
import { ErrorMessage } from "formik";
import { cn } from "~/common/utilities/cn";
import { useReceivingAccountSelectQuery } from "../../../generated/dashboard/graphqlSchema";
import { PaymentFieldProps } from "../../constants/payment_order_form";
import { Button, Icon } from "../../../common/ui-components";
import { DEFAULT_STYLES } from "../../../common/ui-components/AsyncSelectField/AsyncSelectField";

type SelectOption = {
  label: string;
  value: string;
  accountType: string;
};

export type ExternalAccountSelectOption = {
  label: React.ReactNode;
  value: string;
  accountName: string;
  accountType: string;
};

interface CounterpartyAccountSelectProps extends PaymentFieldProps {
  receivingAccountId: string | null;
  originatingAccount: string;
  setReceivingAccountLabel?: (label: string) => void;
  setIsCounterpartyModalOpen?: (value: boolean) => void;
  inlineCreatedAccount: { value: string; label: string } | null;
  disabled?: boolean;
  invalid?: boolean;
  sourcePaymentOrderId?: string;
  isEditForm?: boolean;
  externalOnly?: boolean;
  counterpartyId?: string | null;
  onReceivingAccountChange: (value: ExternalAccountSelectOption) => void;
}

function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <Icon
        iconName="chevron_down"
        size="s"
        color="currentColor"
        className="text-gray-500"
      />
    </components.DropdownIndicator>
  );
}

// hide the indicator separator that comes default with react-select
// eslint-disable-next-line react/prop-types
function IndicatorSeparator({ innerProps }) {
  return <span className="hidden" {...innerProps} />;
}

function ExternalAccountOption({
  accountName,
  counterpartyName,
}: {
  accountName: string;
  counterpartyName: string | null;
}) {
  return (
    <div data-dd-action-name="account select">
      <b>Counterparty</b>
      <span>{counterpartyName ? `: ${counterpartyName}` : ": N/A"}</span>
      <br />
      <b>Account</b>
      <span>{`: ${accountName}`}</span>
    </div>
  );
}

const formatExternalAccountOption = (externalAccount: {
  id: string;
  name: string;
  counterparty?: {
    name: string;
  } | null;
}): ExternalAccountSelectOption => ({
  label: (
    <ExternalAccountOption
      accountName={externalAccount.name}
      counterpartyName={externalAccount.counterparty?.name || null}
    />
  ),
  value: externalAccount.id,
  accountName: externalAccount.name,
  accountType: "ExternalAccount",
});

function CustomMenu(props) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    // eslint-disable-next-line react/prop-types
    children,
    // Some hackery to pass the modal function into the custom component.
    // eslint-disable-next-line react/prop-types
    selectProps: {
      // eslint-disable-next-line react/prop-types
      menuProps: {
        // eslint-disable-next-line react/prop-types
        setIsCounterpartyModalOpen,
      },
    },
  } = props;

  return (
    <components.Menu {...props}>
      <div>
        {children}
        {setIsCounterpartyModalOpen ? (
          <div id="createCounterpartyInline" className="p-2">
            <Button
              fullWidth
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
              onClick={() => setIsCounterpartyModalOpen(true)}
            >
              Create new
            </Button>
          </div>
        ) : (
          <div />
        )}
      </div>
    </components.Menu>
  );
}

/**
 * README
 *
 * This component allows a user to select from both internal and external accounts.
 *
 * Generally, an organization will have few (<100) internal accounts,
 * but a potentially large number of external accounts.
 *
 * Paginating over different types records can be challenging, so to simplify
 * we only paginate through the external accounts. The internal accounts are fetched only once.
 *
 * In addition, we need to cache the records since the parent component does not keep track of labels.
 * The parent passes down an account id and it is up to this component to render the correct label.
 */
function CounterpartyAccountSelect({
  receivingAccountId,
  originatingAccount,
  disabled,
  form,
  field,
  setReceivingAccountLabel,
  setIsCounterpartyModalOpen,
  inlineCreatedAccount,
  invalid,
  sourcePaymentOrderId,
  isEditForm,
  counterpartyId,
  externalOnly,
  onReceivingAccountChange,
}: CounterpartyAccountSelectProps) {
  const { refetch } = useReceivingAccountSelectQuery({
    skip: true,
  });
  const [initialFetch, setInitialFetch] = useState(true);
  const [oldInputValue, setOldInputValue] = useState<string | null>(null);
  const [isFocused, SetIsFocus] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextSearchCursor, setNextSearchCursor] = useState<string | null>(null);
  const [externalAccountOptions, setExternalAccountOptions] = useState<
    Array<ExternalAccountSelectOption>
  >([]);
  const [internalAccountOptions, setInternalAccountOptions] = useState<
    Array<SelectOption>
  >([]);

  const loadOptions = (inputValue: string) =>
    new Promise((resolve, reject) => {
      refetch({
        first: 25,
        after:
          // eslint-disable-next-line no-nested-ternary
          inputValue &&
          // This query is loading the next 25 categories from the same search
          inputValue === oldInputValue
            ? nextSearchCursor
            : // This query is a fresh search if it has an input value, or due to scrolling if not
            inputValue
            ? null
            : nextCursor,
        name: inputValue,
        receivingAccountId: receivingAccountId || "",
        counterpartyId: counterpartyId || "",
        initialFetch,
      })
        .then(({ data }) => {
          // Create external account options, cache the account name as well
          const newExternalAccountOptions = [
            ...data.externalAccounts.edges.map((edge) =>
              formatExternalAccountOption(edge.node),
            ),
          ];

          // If we have an initial selection, add the external account to the list if it doesn't already exist
          if (
            data.externalAccount &&
            ![...externalAccountOptions, ...newExternalAccountOptions].find(
              (o) => o.value === receivingAccountId,
            )
          ) {
            newExternalAccountOptions.push(
              formatExternalAccountOption(data.externalAccount),
            );
          }

          // Create internal account options if needed
          // Internal accounts are only fetched once on the initial fetch
          const newInternalAccountOptions = internalAccountOptions.length
            ? internalAccountOptions
            : (data.internalAccountsUnpaginated || []).map(
                (internalAccount) => ({
                  label: internalAccount.longName,
                  value: internalAccount.id,
                  accountType: "InternalAccount",
                }),
              );

          // Cache the options
          setExternalAccountOptions([
            ...newExternalAccountOptions,
            ...externalAccountOptions,
          ]);
          setInternalAccountOptions(newInternalAccountOptions);
          setInitialFetch(false);

          // If the results are from a search then save next cursor for the following graphql query
          if (inputValue) {
            if (inputValue !== oldInputValue) setOldInputValue(inputValue);
            setNextSearchCursor(
              data.externalAccounts.pageInfo.endCursor || null,
            );
          } else {
            // Clear search cursor
            setNextSearchCursor(null);
            // The results are from scrolling so, save next cursor for the following graphql query
            setNextCursor(data.externalAccounts.pageInfo.endCursor || null);
          }

          const reactSelectOptions: Array<{
            label: string;
            options: Array<SelectOption | ExternalAccountSelectOption>;
          }> = [
            {
              label: "Internal Accounts",
              options: externalOnly
                ? []
                : newInternalAccountOptions.filter(
                    // Only add when there is an inputValue or if there are no initial internalAccountOptions
                    (option) =>
                      (!internalAccountOptions.length || inputValue) &&
                      (!inputValue ||
                        option.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())),
                  ),
            },
            {
              label: "Counterparties",
              options: newExternalAccountOptions,
            },
          ];

          // Return the options to react-select
          resolve({
            hasMore: data.externalAccounts.pageInfo.hasNextPage,
            options: reactSelectOptions,
          });
        })
        .catch((e) => reject(e));
    });

  const getSelectValue = useCallback(() => {
    // See if the newly created counterparty matches the receivingAccountId
    if (inlineCreatedAccount?.value === receivingAccountId) {
      return inlineCreatedAccount;
    }

    // Search through the cached options to get the corresponding label
    let selectValue: SelectOption | null = null;
    const options: Array<SelectOption | ExternalAccountSelectOption> = [
      ...internalAccountOptions,
      ...externalAccountOptions,
    ];
    const option = options.find((o) => o.value === receivingAccountId);
    if (option) {
      selectValue = {
        value: option.value,
        label: "accountName" in option ? option.accountName : option.label,
        accountType: option.accountType,
      };
    }

    return selectValue;
  }, [
    externalAccountOptions,
    inlineCreatedAccount,
    internalAccountOptions,
    receivingAccountId,
  ]);

  useEffect(() => {
    if (
      (sourcePaymentOrderId || isEditForm) &&
      receivingAccountId &&
      getSelectValue()
    ) {
      // This if clause is mainly here due to tsc-strict complaining about sourcePaymentOrderId
      // and receivingAccountId and the result of getSelectValue() being possibly null or undefined
      const duplicatedValue = getSelectValue();
      if (setReceivingAccountLabel && duplicatedValue) {
        setReceivingAccountLabel(duplicatedValue.label);
      }
    }
  }, [
    getSelectValue,
    isEditForm,
    receivingAccountId,
    setReceivingAccountLabel,
    sourcePaymentOrderId,
  ]);

  return (
    <div data-dd-action-name="account select">
      <AsyncPaginate
        defaultOptions
        isDisabled={disabled}
        id="receivingAccountId"
        onChange={(selectOption: ExternalAccountSelectOption) => {
          void form.setFieldValue("receivingAccountId", selectOption.value);
          // need to set label on both counterparties and internal account options
          const { accountName, label: optionLabel } = selectOption;

          let optionLabelString = "";
          if (optionLabel) {
            optionLabelString = optionLabel.toString();
          }

          const label =
            "accountName" in selectOption ? accountName : optionLabelString;
          if (setReceivingAccountLabel) {
            setReceivingAccountLabel(label);
          }

          if (onReceivingAccountChange) {
            onReceivingAccountChange(selectOption);
          }
        }}
        onFocus={() => SetIsFocus(true)}
        onBlur={() => SetIsFocus(false)}
        loadOptions={loadOptions}
        value={getSelectValue()}
        classNamePrefix="react-select"
        className={cn("react-select-container w-full flex-1", {
          "rounded border border-red-500": invalid,
        })}
        aria-label={field.name}
        components={{
          DropdownIndicator,
          IndicatorSeparator,
          Menu: CustomMenu,
        }}
        menuProps={{ setIsCounterpartyModalOpen }}
        isOptionDisabled={(o: ExternalAccountSelectOption) =>
          o.value === originatingAccount
        }
        placeholder={isFocused ? "Type to select" : "Select Account"}
        reduceOptions={reduceGroupedOptions}
        styles={DEFAULT_STYLES}
        debounceTimeout={300}
      />
      <ErrorMessage
        name={field.name}
        component="span"
        className="mt-1 text-xs text-text-critical"
      />
    </div>
  );
}

export default CounterpartyAccountSelect;
