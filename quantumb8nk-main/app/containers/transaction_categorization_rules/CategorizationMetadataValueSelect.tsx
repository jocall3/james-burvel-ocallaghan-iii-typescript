// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Field } from "formik";
import { useCategorizationMetadataValueAsyncSelectQuery } from "~/generated/dashboard/graphqlSchema";
import { FormikAsyncSelectField } from "../../../common/formik";

export default function CategorizationMetadataValueSelect({
  onChange,
  selectedValue,
  name,
  id,
  categorizationMetadataKeyId,
  disabled = false,
  validation,
}: {
  onChange: (value: { value: string }) => void;
  selectedValue: { label: string; value: string } | null | undefined;
  name: string;
  id: string;
  categorizationMetadataKeyId: string;
  disabled?: boolean;
  validation?: (value: string) => void;
}) {
  const { refetch } = useCategorizationMetadataValueAsyncSelectQuery({
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
        name: inputValue,
        categorizationMetadataKeyId,
      })
        .then(({ data }) => {
          // If the results are from a search then save next cursor for the following graphql query
          if (inputValue) {
            if (inputValue !== oldInputValue) setOldInputValue(inputValue);
            setNextSearchCursor(
              data.categorizationMetadataValues.pageInfo.endCursor || null,
            );
          } else {
            // Clear search cursor
            setNextSearchCursor(null);
            // The results are from scrolling so, save next cursor for the following graphql query
            setNextCursor(
              data.categorizationMetadataValues.pageInfo.endCursor || null,
            );
          }

          const newOptions = data.categorizationMetadataValues.edges.map(
            (e) => ({
              label: e.node.name,
              value: e.node.id,
            }),
          );

          // Return the options to react-select
          resolve({
            hasMore: data.categorizationMetadataValues.pageInfo.hasNextPage,
            options: newOptions,
          });
        })
        .catch((e) => reject(e));
    });

  return (
    <Field
      id={id || name}
      name={name}
      component={FormikAsyncSelectField}
      loadOptions={loadOptions}
      onChange={onChange}
      selectValue={selectedValue}
      disabled={disabled}
      validate={validation}
    />
  );
}
