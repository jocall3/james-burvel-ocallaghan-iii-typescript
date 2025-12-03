// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { ErrorMessage, Field, useField, useFormikContext } from "formik";
import {
  Accounting__LedgerSyncEnum,
  useAccountingLedgerEntitiesSelectQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { AsyncSelectField } from "../../../common/ui-components";

type AccountingCategoryProps = {
  id: string;
  name: string;
  placeholder?: string;
  className?: string;
  classNamePrefix?: string;
  iconColor?: string;
  iconName?: string;
  iconSize?: string;
  validate?: (value: string) => string;
  invalid?: boolean;
  accountingCategoryId?: string;
  isClearable?: boolean;
};

interface ILoadedOptions {
  options: [
    {
      label: string;
      value: string;
      classification: string;
    },
  ];
}

function AccountingCategorySelect({
  id,
  name,
  placeholder,
  className,
  classNamePrefix,
  iconColor,
  iconName,
  iconSize,
  validate,
  invalid,
  accountingCategoryId,
  isClearable = false,
}: AccountingCategoryProps) {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();
  const ledgerEntityId = (field?.value as string) || accountingCategoryId;
  const { refetch } = useAccountingLedgerEntitiesSelectQuery({
    skip: true,
  });

  // State used for category pagination
  const [initialFetch, setInitialFetch] = useState<boolean>(true);
  const [oldInputValue, setOldInputValue] = useState<string | null>(null);
  const [selectValue, setSelectValue] = useState<Record<
    string,
    string | undefined | null
  > | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextSearchCursor, setNextSearchCursor] = useState<string | null>(null);

  const loadOptions = (
    inputValue: string,
    loadedOptions: Array<ILoadedOptions>,
  ) =>
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
        ledgerEntityName: inputValue,
        ledgerSyncType: Accounting__LedgerSyncEnum.Account,
        ledgerEntityId: ledgerEntityId || "",
        initialFetch,
      })
        .then(({ data }) => {
          // First, extract the category options already loaded
          const loadedOptionsArray = loadedOptions.map((o) => o.options).flat();

          // Make new category options from the returned data
          const uncleanNewCategoryOptions =
            data.accountingLedgerEntities.edges.map(({ node }) => ({
              label: node.name,
              value: node.id,
              classification: node.classification,
            }));

          // If the form has a category value, set it to be the default and
          // add to the initial options if not already present
          if (initialFetch && data?.accountingLedgerEntity?.id) {
            const existingOption = {
              label: data.accountingLedgerEntity.name,
              value: data.accountingLedgerEntity.id,
              classification: data.accountingLedgerEntity.classification,
            };

            if (
              !uncleanNewCategoryOptions.find(
                (o) => o.value === data.accountingLedgerEntity?.id,
              )
            ) {
              uncleanNewCategoryOptions.push(existingOption);
            }

            setSelectValue(existingOption);
          }

          // Filter out categories that are already present
          const cleanNewCategoryOptions = uncleanNewCategoryOptions.filter(
            ({ value }) =>
              !loadedOptionsArray.find(
                ({ value: existingValue }) => existingValue === value,
              ),
          );

          // Get unique classifications to provide labels for the category dropdown
          const categoryLabels = cleanNewCategoryOptions
            .reduce<Array<string>>((acc, curr) => {
              if (!curr.classification || !acc.includes(curr.classification)) {
                const classification = curr.classification || "N/A";
                acc.push(classification);
              }
              return acc;
            }, [])
            .sort((a, b) => a.localeCompare(b));

          // Provide options not currently cached
          const reactSelectOptions = categoryLabels.map((categoryLabel) => ({
            label: categoryLabel,
            options: cleanNewCategoryOptions
              .filter((o) => o.classification === categoryLabel)
              .sort((a, b) => {
                if (!a.label || !b.label) {
                  return 0;
                }
                return a.label.localeCompare(b.label);
              }),
          }));

          // If the results are from a search then save next cursor for the following graphql query
          if (inputValue) {
            if (inputValue !== oldInputValue) setOldInputValue(inputValue);
            setNextSearchCursor(
              data.accountingLedgerEntities.pageInfo.endCursor ?? null,
            );
          } else {
            // Clear search cursor
            setNextSearchCursor(null);
            // The results are from scrolling so, save next cursor for the following graphql query
            setNextCursor(
              data.accountingLedgerEntities.pageInfo.endCursor ?? null,
            );
          }

          // Initial fetch completed
          if (initialFetch) setInitialFetch(false);

          // Return the options
          resolve({
            hasMore: data.accountingLedgerEntities.pageInfo.hasNextPage,
            options: reactSelectOptions,
          });
        })
        .catch((error) => reject(error));
    });

  const handleChange = (c: Record<string, string> | null) => {
    setSelectValue(c);
    void setFieldValue(name, c ? c.value : "");
  };

  return (
    <div className="flex flex-col">
      <Field
        id={id}
        name={name}
        isGrouped
        noFormGroup
        defaultOptions
        isClearable={isClearable}
        loadOptions={loadOptions}
        handleChange={handleChange}
        component={AsyncSelectField}
        selectValue={selectValue}
        placeholder={placeholder}
        classNamePrefix={classNamePrefix}
        className={className}
        iconColor={iconColor}
        iconName={iconName}
        iconSize={iconSize}
        validate={validate}
        invalid={invalid}
      />
      <ErrorMessage
        name={name}
        component="span"
        className="mt-1 text-xs text-text-critical"
      />
    </div>
  );
}

export default AccountingCategorySelect;
