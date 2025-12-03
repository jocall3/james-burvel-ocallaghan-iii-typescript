// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Field } from "formik";
import { useVirtualAccountsSelectQuery } from "../../../generated/dashboard/graphqlSchema";
import { FieldGroup, Label } from "../../../common/ui-components";
import { FormikAsyncSelectField } from "../../../common/formik";

export default function VirtualAccountSelect({
  onChange,
  selectedValue,
}: {
  onChange: (value: { value: string }) => void;
  selectedValue: { label: string; value: string } | null | undefined;
}) {
  const { refetch } = useVirtualAccountsSelectQuery({
    skip: true,
  });
  const [oldInputValue, setOldInputValue] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextSearchCursor, setNextSearchCursor] = useState<string | null>(null);

  const loadOptions = (inputValue: string) =>
    new Promise((resolve, reject) => {
      refetch({
        first: 25,
        after:
          // eslint-disable-next-line no-nested-ternary
          inputValue &&
          // This query is loading the next 25 vas from the same search
          inputValue === oldInputValue
            ? nextSearchCursor
            : // This query is a fresh search if it has an input value, or due to scrolling if not
            inputValue
            ? null
            : nextCursor,
        virtualAccountName: inputValue,
      })
        .then(({ data }) => {
          // If the results are from a search then save next cursor for the following graphql query
          if (inputValue) {
            if (inputValue !== oldInputValue) setOldInputValue(inputValue);
            setNextSearchCursor(
              data.virtualAccounts.pageInfo.endCursor || null,
            );
          } else {
            // Clear search cursor
            setNextSearchCursor(null);
            // The results are from scrolling so, save next cursor for the following graphql query
            setNextCursor(data.virtualAccounts.pageInfo.endCursor || null);
          }

          const newOptions = data.virtualAccounts.edges.map((e) => ({
            label: e.node.fullAccountName,
            value: e.node.id,
          }));

          // Return the options to react-select
          resolve({
            hasMore: data.virtualAccounts.pageInfo.hasNextPage,
            options: newOptions,
          });
        })
        .catch((e) => reject(e));
    });

  return (
    <div data-dd-action-name="virtual account select">
      <FieldGroup>
        <Label id="virtualAccountIdLabel" className="text-sm font-normal">
          Virtual Account
        </Label>
        <Field
          id="virtualAccountId"
          name="virtualAccountId"
          component={FormikAsyncSelectField}
          loadOptions={loadOptions}
          onChange={onChange}
          selectValue={selectedValue}
        />
      </FieldGroup>
    </div>
  );
}
