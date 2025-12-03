// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Field } from "formik";
import {
  useLedgerAccountCategoriesSelectLazyQuery,
  useLedgerAccountCategoriesValidatorLazyQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { SelectActionTypes } from "../../../common/ui-components";
import type { SelectValue, SelectAction } from "../../../common/ui-components";
import { FormikAsyncSelectField } from "../../../common/formik";
import { FormValues } from "../../constants/ledger_account_form";

interface LedgerAccountCategoryAsyncSelectProps {
  ledgerId: string;
  currency: string;
  currencyExponent: number | null;
}
function LedgerAccountCategoryAsyncSelect({
  ledgerId,
  currency,
  currencyExponent,
}: LedgerAccountCategoryAsyncSelectProps) {
  const [getLedgerAccountCategories] =
    useLedgerAccountCategoriesSelectLazyQuery();

  const [validateChosenCategory] =
    useLedgerAccountCategoriesValidatorLazyQuery();

  const [oldInputValue, setOldInputValue] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextSearchCursor, setNextSearchCursor] = useState<string | null>(null);
  const [ledgerAccountCategoryOptions, setLedgerAccountCategoryOptions] =
    useState<Array<{ label: string; value: string }>>([]);

  const onChange = async (
    field: SelectValue | SelectValue[],
    action: SelectAction,
    values: unknown,
    setOnChangeValue: (
      newValues: SelectValue | SelectValue[],
      extras?: [{ extraFieldName: string; extraFieldValue: unknown }],
    ) => void,
  ) => {
    const selectedCategories = (values as FormValues).category;
    let newField: SelectValue | SelectValue[] = [];
    let newError: string | null = null;

    if (action.action === SelectActionTypes.SelectOption) {
      const response = await validateChosenCategory({
        variables: {
          selectedCategoryIds: selectedCategories.map((node) => node.value),
          chosenCategoryId: action.option.value as string,
        },
      });
      if (
        response?.data?.ledgerAccountCategoriesValidator?.badCategoryIds?.length
      ) {
        newField = selectedCategories;
        newError = "The chosen category conflicts with another category";
      } else {
        newField = field || [];
      }
    } else if (action.action === SelectActionTypes.RemoveOption) {
      newField = field || [];
    } else if (action.action === SelectActionTypes.ClearOption) {
      newField = [];
    }

    setOnChangeValue(newField, [
      { extraFieldName: "categoryError", extraFieldValue: newError },
    ]);
  };

  const loadOptions = (inputValue: string) =>
    new Promise((resolve, reject) => {
      const scrollingCursor = inputValue ? null : nextCursor;
      getLedgerAccountCategories({
        variables: {
          ledgerId,
          currency,
          currencyExponent,
          first: 25,
          after:
            inputValue &&
            // This query is loading the next 25 accounts from the same search
            inputValue === oldInputValue
              ? nextSearchCursor
              : // This query is a fresh search if it has an input value, or due to scrolling if not
                scrollingCursor,
          name: inputValue,
        },
      })
        .then(({ data }) => {
          // Create account options, cache the account name as well
          const newLedgerAccountCategoryOptions =
            data?.ledgerAccountCategories.edges.map((edge) => ({
              label: edge.node.name,
              value: edge.node.id,
            })) as Array<{
              label: string;
              value: string;
            }>;

          // Cache the options
          setLedgerAccountCategoryOptions([
            ...newLedgerAccountCategoryOptions,
            ...ledgerAccountCategoryOptions,
          ]);
          // If the results are from a search then save next cursor for the following graphql query
          if (inputValue) {
            if (inputValue !== oldInputValue) setOldInputValue(inputValue);
            setNextSearchCursor(
              data?.ledgerAccountCategories.pageInfo.endCursor ?? null,
            );
          } else {
            // Clear search cursor
            setNextSearchCursor(null);
            // The results are from scrolling so, save next cursor for the following graphql query
            setNextCursor(
              data?.ledgerAccountCategories.pageInfo.endCursor ?? null,
            );
          }

          // Return the options to react-select
          resolve({
            options: newLedgerAccountCategoryOptions,
            hasMore: data?.ledgerAccountCategories.pageInfo.hasNextPage,
          });
        })
        .catch((e) => reject(e));
    });

  return (
    <Field
      id="category"
      name="category"
      component={FormikAsyncSelectField}
      onChange={onChange}
      loadOptions={loadOptions}
      isMulti
    />
  );
}

export default LedgerAccountCategoryAsyncSelect;
