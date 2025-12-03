// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from "react";
import { Field, FieldArray, FieldProps, FormikProps } from "formik";
import {
  FormValues,
  EntryPair,
  LedgerEntry,
} from "../../constants/ledger_transaction_form";
import { Button } from "../../../common/ui-components";
import { checkKeyValuePairs } from "../../components/KeyValueInput";
import LedgerEntryRow from "./entries/LedgerEntryRow";
import EntriesFormSum from "./entries/EntriesFormSum";
import { makeBlankLedgerEntry } from "./utilities";

interface EntriesProps {
  ledgerId: string;
  ledgerEntryKey: string;
  initialEntryCurrencySum: Record<string, EntryPair>;
  initialEntriesMetadata: Array<string>;
  editable?: boolean;
  includeMetadata?: boolean;
  reconMode?: boolean;
}

function EntriesHeader({
  includeMetadata,
  editable,
  reconMode,
}: {
  includeMetadata: boolean;
  editable: boolean;
  reconMode: boolean;
}) {
  if (includeMetadata) {
    return editable ? (
      <div className="flex max-w-[1300px] flex-row text-xs text-gray-500">
        <div className="flex basis-1/6">Ledger Account</div>
        <div className="flex basis-1/6">Debit</div>
        <div className="flex basis-1/6">Credit</div>
        <div className="flex basis-5/12">Metadata</div>
        <div className="flex basis-1/12" />
      </div>
    ) : (
      <div className="flex max-w-[1300px] flex-row text-xs text-gray-500">
        <div className="flex basis-1/6">Ledger Account</div>
        <div className="flex basis-1/6">Debit</div>
        <div className="flex basis-1/6">Credit</div>
        <div className="flex basis-1/2">Metadata</div>
      </div>
    );
  }
  return editable || reconMode ? (
    <div className="flex max-w-[1300px] flex-row text-xs text-gray-500">
      <div className="flex basis-1/3">Ledger Account</div>
      <div className="flex basis-1/3">Debit</div>
      <div className="flex basis-1/3">Credit</div>
      <div className="flex basis-1/12" />
    </div>
  ) : (
    <div className="flex max-w-[1300px] flex-row text-xs text-gray-500">
      <div className="flex basis-1/3">Ledger Account</div>
      <div className="flex basis-1/3">Debit</div>
      <div className="flex basis-1/3">Credit</div>
    </div>
  );
}

export function invalidEntriesError({
  entries,
  initialEntries,
}: {
  entries: LedgerEntry[];
  initialEntries: LedgerEntry[];
}): string | null {
  if (entries.length < 2) {
    return "Please make sure there are at least 2 entries.";
  }

  const allValuesSet = entries.every((ledgerEntry, index) => {
    const validMetadata = initialEntries[index]?.metadata
      ? checkKeyValuePairs(
          JSON.parse(ledgerEntry.metadata) as Record<string, string>,
          JSON.parse(initialEntries[index].metadata) as Record<string, string>,
        )
      : checkKeyValuePairs(
          JSON.parse(ledgerEntry.metadata) as Record<string, string>,
        );
    return (
      Number.isInteger(ledgerEntry.amount) &&
      ledgerEntry.amount > 0 &&
      ledgerEntry.direction !== "" &&
      ledgerEntry.ledgerAccountId !== "" &&
      validMetadata
    );
  });

  if (!allValuesSet) {
    return "Please remove or fill out incomplete entries.";
  }

  const netSum: Record<string, number> = {};
  entries.forEach((ledgerEntry) => {
    netSum[ledgerEntry.currency] ||= 0;
    netSum[ledgerEntry.currency] +=
      ledgerEntry.amount * (ledgerEntry.direction === "debit" ? 1 : -1);
  });
  const entriesBalanced = Object.keys(netSum).every(
    (currency) => netSum[currency] === 0,
  );
  if (!entriesBalanced) {
    return "Please make sure the credit amount is equal to debit amount.";
  }

  return null;
}

export default function Entries({
  ledgerId,
  ledgerEntryKey,
  initialEntryCurrencySum,
  initialEntriesMetadata,
  editable = true,
  includeMetadata = true,
  reconMode = false,
}: EntriesProps) {
  const [entryCurrencySum, setEntryCurrencySum] = useState<
    Record<string, EntryPair>
  >(initialEntryCurrencySum);

  /*
   * useState will only set the initial state to the value passed in above on initial render.
   * Here, we want entryCurrencySum to change whenever the value of prop initialEntryCurrencySum changes.
   */
  useEffect(() => {
    setEntryCurrencySum(initialEntryCurrencySum);
  }, [initialEntryCurrencySum]);

  return (
    <Field>
      {({ field, form }: FieldProps<FormValues> & FormikProps<FormValues>) => (
        <div className="form-group w-full">
          {!reconMode && (
            <h3 className="form-row flex justify-between pb-2">
              <div className="self-center pt-2 text-gray-800">Entries</div>
              {editable && (
                <FieldArray
                  name={ledgerEntryKey}
                  render={(arrayHelpers) => (
                    <Button
                      className="border-none pb-2"
                      buttonType="text"
                      onClick={() => {
                        arrayHelpers.push(makeBlankLedgerEntry());
                      }}
                    >
                      <div>+ Add Entry</div>
                    </Button>
                  )}
                />
              )}
            </h3>
          )}
          <div>
            {(field.value[ledgerEntryKey] as LedgerEntry[]).length === 0 ? (
              <div className="help-text text-gray-500">No entries added.</div>
            ) : (
              <div className="flex flex-col">
                <h3 className="w-full pb-3">
                  <EntriesHeader
                    includeMetadata={includeMetadata}
                    editable={editable}
                    reconMode={reconMode}
                  />
                </h3>
                <h3 className="flex flex-col">
                  {(field.value[ledgerEntryKey] as LedgerEntry[]).map(
                    (row, index) => (
                      <LedgerEntryRow
                        ledgerEntryKey={ledgerEntryKey}
                        row={row}
                        index={index}
                        ledgerEntries={
                          field.value[ledgerEntryKey] as LedgerEntry[]
                        }
                        form={form}
                        ledgerId={ledgerId}
                        entryCurrencySum={entryCurrencySum}
                        setEntryCurrencySum={setEntryCurrencySum}
                        editable={reconMode && index === 0 ? false : editable}
                        reconMode={reconMode}
                        includeMetadata={includeMetadata}
                        initialEntriesMetadata={initialEntriesMetadata}
                      />
                    ),
                  )}
                </h3>
                <div className="space-y-2">
                  <EntriesFormSum
                    entryCurrencySum={entryCurrencySum}
                    isDisabled={!editable}
                    includeMetadata={includeMetadata}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Field>
  );
}
