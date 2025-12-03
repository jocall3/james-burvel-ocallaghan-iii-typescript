// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FormikProps, FieldArray } from "formik";
import { Button, Icon } from "../../../../common/ui-components";
import { conditionalRemove } from "../utilities";
import {
  FormValues,
  LedgerEntry,
  EntryPair,
} from "../../../constants/ledger_transaction_form";
import LedgerAccountSelect from "./LedgerAccountSelect";
import EntriesMetadata from "./EntriesMetadata";
import EntryInputBox from "./EntryInputBox";

interface LedgerEntryRowProps {
  ledgerEntryKey: string;
  row: LedgerEntry;
  index: number;
  ledgerEntries: Array<LedgerEntry>;
  form: FormikProps<FormValues>;
  entryCurrencySum: Record<string, EntryPair>;
  setEntryCurrencySum: React.Dispatch<
    React.SetStateAction<Record<string, EntryPair>>
  >;
  ledgerId: string;
  editable: boolean;
  includeMetadata: boolean;
  initialEntriesMetadata: Array<string>;
  reconMode: boolean;
}

function RemoveEntryButton({
  ledgerEntryKey,
  index,
  entryCurrencySum,
  setEntryCurrencySum,
  ledgerEntries,
}: {
  ledgerEntryKey: string;
  index: number;
  entryCurrencySum: Record<string, EntryPair>;
  setEntryCurrencySum: React.Dispatch<
    React.SetStateAction<Record<string, EntryPair>>
  >;
  ledgerEntries: Array<LedgerEntry>;
}) {
  return (
    <FieldArray
      name={ledgerEntryKey}
      render={(arrayHelpers) => (
        <Button
          name={`delete[${index}]`}
          id={`delete[${index}]`}
          buttonType="text"
          onClick={() => {
            arrayHelpers.remove(index);
            conditionalRemove(
              setEntryCurrencySum,
              entryCurrencySum,
              ledgerEntries,
              index,
            );
          }}
        >
          <Icon iconName="clear" />
        </Button>
      )}
    />
  );
}

function LedgerEntryRowWithMetadata({
  ledgerEntryKey,
  row,
  index,
  ledgerEntries,
  form,
  ledgerId,
  entryCurrencySum,
  setEntryCurrencySum,
  editable,
  initialEntriesMetadata,
  reconMode,
}: Omit<LedgerEntryRowProps, "includeMetadata">) {
  return (
    <div
      className="flex max-w-[1300px] flex-row space-x-0.5 pb-2"
      key={`${row.id.toString()}`}
    >
      <div className="flex basis-1/6">
        <LedgerAccountSelect
          ledgerEntryKey={ledgerEntryKey}
          ledgerId={ledgerId}
          setFieldValue={form.setFieldValue}
          ledgerEntries={ledgerEntries}
          index={index}
          setEntryCurrencySum={setEntryCurrencySum}
          entryCurrencySum={entryCurrencySum}
          disabled={!editable}
        />
      </div>
      <div className="flex basis-1/6">
        <EntryInputBox
          ledgerEntryKey={ledgerEntryKey}
          direction="debit"
          index={index}
          form={form}
          ledgerEntry={ledgerEntries[index]}
          setEntryCurrencySum={setEntryCurrencySum}
          entryCurrencySum={entryCurrencySum}
          isDisabled={!editable}
        />
      </div>
      <div className="flex basis-1/6">
        <EntryInputBox
          ledgerEntryKey={ledgerEntryKey}
          direction="credit"
          index={index}
          form={form}
          ledgerEntry={ledgerEntries[index]}
          setEntryCurrencySum={setEntryCurrencySum}
          entryCurrencySum={entryCurrencySum}
          isDisabled={!editable}
        />
      </div>
      <div className="flex basis-5/12">
        <EntriesMetadata
          disabled={!editable}
          initialMetadata={initialEntriesMetadata[index]}
          index={index}
        />
      </div>
      {(editable || reconMode) && (
        <div className="flex basis-1/12 content-end">
          <RemoveEntryButton
            ledgerEntryKey={ledgerEntryKey}
            index={index}
            entryCurrencySum={entryCurrencySum}
            setEntryCurrencySum={setEntryCurrencySum}
            ledgerEntries={ledgerEntries}
          />
        </div>
      )}
    </div>
  );
}

function LedgerEntryRowWithoutMetadata({
  ledgerEntryKey,
  row,
  index,
  ledgerEntries,
  form,
  ledgerId,
  entryCurrencySum,
  setEntryCurrencySum,
  editable,
  reconMode,
}: Omit<LedgerEntryRowProps, "includeMetadata" | "initialEntriesMetadata">) {
  return (
    <div
      className="flex max-w-[1300px] flex-row space-x-0.5 pb-2"
      key={`${row.id.toString()}`}
    >
      <div className="flex basis-1/3">
        <LedgerAccountSelect
          ledgerEntryKey={ledgerEntryKey}
          ledgerId={ledgerId}
          setFieldValue={form.setFieldValue}
          ledgerEntries={ledgerEntries}
          index={index}
          setEntryCurrencySum={setEntryCurrencySum}
          entryCurrencySum={entryCurrencySum}
          disabled={!editable}
        />
      </div>
      <div className="flex basis-1/3">
        <EntryInputBox
          ledgerEntryKey={ledgerEntryKey}
          direction="debit"
          index={index}
          form={form}
          ledgerEntry={ledgerEntries[index]}
          setEntryCurrencySum={setEntryCurrencySum}
          entryCurrencySum={entryCurrencySum}
          isDisabled={!editable}
        />
      </div>
      <div className="flex basis-1/3">
        <EntryInputBox
          ledgerEntryKey={ledgerEntryKey}
          direction="credit"
          index={index}
          form={form}
          ledgerEntry={ledgerEntries[index]}
          setEntryCurrencySum={setEntryCurrencySum}
          entryCurrencySum={entryCurrencySum}
          isDisabled={!editable}
        />
      </div>
      {editable ? (
        <div className="flex basis-1/12 justify-end">
          <RemoveEntryButton
            ledgerEntryKey={ledgerEntryKey}
            index={index}
            entryCurrencySum={entryCurrencySum}
            setEntryCurrencySum={setEntryCurrencySum}
            ledgerEntries={ledgerEntries}
          />
        </div>
      ) : (
        reconMode && <div className="flex basis-1/12 justify-end" />
      )}
    </div>
  );
}

export default function LedgerEntryRow({
  ledgerEntryKey,
  row,
  index,
  ledgerEntries,
  form,
  ledgerId,
  entryCurrencySum,
  setEntryCurrencySum,
  editable,
  includeMetadata,
  reconMode,
  initialEntriesMetadata,
}: LedgerEntryRowProps) {
  return includeMetadata ? (
    <LedgerEntryRowWithMetadata
      ledgerEntryKey={ledgerEntryKey}
      row={row}
      index={index}
      ledgerEntries={ledgerEntries}
      form={form}
      ledgerId={ledgerId}
      entryCurrencySum={entryCurrencySum}
      setEntryCurrencySum={setEntryCurrencySum}
      editable={editable}
      reconMode={reconMode}
      initialEntriesMetadata={initialEntriesMetadata}
    />
  ) : (
    <LedgerEntryRowWithoutMetadata
      ledgerEntryKey={ledgerEntryKey}
      row={row}
      index={index}
      ledgerEntries={ledgerEntries}
      form={form}
      ledgerId={ledgerId}
      entryCurrencySum={entryCurrencySum}
      setEntryCurrencySum={setEntryCurrencySum}
      editable={editable}
      reconMode={reconMode}
    />
  );
}
