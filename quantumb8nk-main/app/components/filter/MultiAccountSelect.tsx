// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { snakeCase } from "lodash";
import React, { useState } from "react";
import { LoadingLine } from "~/common/ui-components";
import MultiSelectDropdown, {
  Category,
} from "~/common/ui-components/MultiSelectDropdown/MultiSelectDropdownPanel";
import { useMultiAccountSelectQuery } from "~/generated/dashboard/graphqlSchema";

/**
 * Takes an array of internal account IDs and categorizes
 * them by their connection (bank)
 */
function categorizeInitialValues(
  initialValues: Array<string>,
  categories: Array<Category> = [],
) {
  return (initialValues || []).reduce<Record<string, Array<string>>>(
    (acc, value) => {
      // Find the matching bank
      const category = categories.find((option) =>
        option.items.find((item) => item.id === value),
      );
      // Should only occur if something is incorrect in the query string
      // or if the id is all accounts
      if (!category) {
        return acc;
      }
      acc[snakeCase(category.label)].push(value);
      return acc;
    },
    // Create an empty array for each bank as the initial hash
    categories.reduce(
      (acc, category) => ({ ...acc, [snakeCase(category.label)]: [] }),
      {},
    ),
  );
}

function MultiAccountSelect({
  onClose,
  onChange,
  categories,
  initialValues,
}: {
  onClose: () => void;
  onChange: (internalAccounts: Array<string>) => void;
  categories: Array<Category>;
  initialValues: Array<string>;
}) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <MultiSelectDropdown
      onClose={onClose}
      categories={categories}
      onChange={(selectedValues: Record<string, Array<string>>) => {
        const selectedValueArray = Object.keys(selectedValues).reduce<
          Array<string>
        >((acc, key) => [...acc, ...selectedValues[key]], []);
        onChange(
          selectedValueArray.length ? selectedValueArray : ["all-accounts"],
        );
      }}
      initialValues={categorizeInitialValues(initialValues, categories)}
      onSearchValueChange={setSearchValue}
      searchValue={searchValue}
      className="border border-alpha-black-100"
      searchOnCategories
    />
  );
}

function MultiAccountSelectLoader(props) {
  const { data } = useMultiAccountSelectQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      includeAllAccountsOption: false,
    },
  });

  const categories = data?.multiAccountSelectOptions.reduce<Array<Category>>(
    (
      acc,
      accountGroup: {
        label: string;
        options?: Array<{ label: string; value: string }>;
      },
    ) => [
      ...acc,
      {
        label: accountGroup.label,
        id: snakeCase(accountGroup.label),
        items: (accountGroup.options || []).map((account) => ({
          label: account.label,
          id: account.value,
        })),
      },
    ],
    [],
  );

  if (!categories) {
    return (
      <div className="grid h-24 w-60 gap-2 divide-y overflow-y-scroll border-alpha-black-100 bg-white p-2 text-sm shadow-lg">
        <LoadingLine />
        <LoadingLine />
        <LoadingLine />
      </div>
    );
  }

  return <MultiAccountSelect {...props} categories={categories} />;
}

export default MultiAccountSelectLoader;
