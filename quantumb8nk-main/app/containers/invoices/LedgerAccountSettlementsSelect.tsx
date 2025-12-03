// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Field } from "formik";
import {
  LedgerAccountSettlement,
  useLedgerAccountSettlementsSelectByPartialIdQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { FieldGroup, Label } from "../../../common/ui-components";
import { FormikAsyncSelectField } from "../../../common/formik";
import { lasToLabel } from "./form/InvoiceForm/utils";

export default function LedgerAccountSettlementsSelect({
  onChange,
  selectedValue,
  isDisabled = true,
}: {
  onChange: (
    value: { label: string; value: string; amount: string } | null | undefined,
  ) => void;
  selectedValue:
    | { label: string; value: string; amount: string }
    | null
    | undefined;
  isDisabled: boolean;
}) {
  const { refetch } = useLedgerAccountSettlementsSelectByPartialIdQuery({
    skip: true,
  });
  const [oldInputValue, setOldInputValue] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextSearchCursor, setNextSearchCursor] = useState<string | null>(null);

  const loadOptions = (inputValue: string) =>
    new Promise((resolve, reject) => {
      let after;
      if (inputValue && inputValue === oldInputValue) {
        // This query is loading the next 25 LASes from the same search
        after = nextSearchCursor;
      } else if (!inputValue) {
        after = nextCursor;
      } else {
        // This query is a fresh search if it has an input value, or due to scrolling if not
        after = null;
      }
      refetch({
        first: 25,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        after,
        id: inputValue,
        hasLedgerable: false,
        statuses: ["pending"],
      })
        .then(({ data }) => {
          // If the results are from a search then save next cursor for the following graphql query
          if (inputValue) {
            if (inputValue !== oldInputValue) setOldInputValue(inputValue);
            setNextSearchCursor(
              data.ledgerAccountSettlementsByPartialId.pageInfo.endCursor ||
                null,
            );
          } else {
            // Clear search cursor
            setNextSearchCursor(null);
            // The results are from scrolling so, save next cursor for the following graphql query
            setNextCursor(
              data.ledgerAccountSettlementsByPartialId.pageInfo.endCursor ||
                null,
            );
          }

          const newOptions = data.ledgerAccountSettlementsByPartialId.edges.map(
            (e) => ({
              label: lasToLabel(e.node as LedgerAccountSettlement),
              value: e.node.id,
              amount: e.node.amount,
            }),
          );

          // Return the options to react-select
          resolve({
            hasMore:
              data?.ledgerAccountSettlementsByPartialId?.pageInfo?.hasNextPage,
            options: newOptions,
          });
        })
        .catch((e) => reject(e));
    });

  return (
    <FieldGroup>
      <Label
        id="ledgerAccountSettlementIdLabel"
        className="text-sm font-normal"
        fieldConditional="Optional"
      >
        Ledger Account Settlement
      </Label>
      <Field
        id="ledgerAccountSettlementId"
        name="ledgerAccountSettlementId"
        component={FormikAsyncSelectField}
        loadOptions={loadOptions}
        onChange={(value: typeof selectedValue) => {
          onChange(value);
        }}
        selectValue={selectedValue}
        isClearable
        disabled={isDisabled}
      />
    </FieldGroup>
  );
}
