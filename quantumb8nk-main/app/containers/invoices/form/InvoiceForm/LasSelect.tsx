// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, FormikProps } from "formik";
import { Toggle } from "../../../../../common/ui-components";
import LedgerAccountSettlementsSelect from "../../LedgerAccountSettlementsSelect";
import { InvoiceFormValues } from "./types";

type SharedPropTypes = {
  setFieldValue: FormikProps<InvoiceFormValues>["setFieldValue"];
  values: FormikProps<InvoiceFormValues>["values"];
};

type CheckboxPropTypes = {
  disableLineItems: boolean;
  setDisableLineItems: (arg: boolean) => void;
};

type DropdownPropTypes = {
  setAmount: (arg: string) => void;
};

type DropdownOnlyPropTypes = {
  isDisabled: boolean;
};

export function Dropdown({
  setFieldValue,
  setAmount,
  values,
  isDisabled,
}: DropdownPropTypes & SharedPropTypes & DropdownOnlyPropTypes) {
  return (
    <div>
      <LedgerAccountSettlementsSelect
        onChange={(value) => {
          void setFieldValue("ledgerAccountSettlement", value);
          setAmount(`${value?.amount || ""}` || "0");
        }}
        selectedValue={values.ledgerAccountSettlement}
        isDisabled={isDisabled}
      />
    </div>
  );
}

export function Checkbox({
  values,
  setDisableLineItems,
  setFieldValue,
  disableLineItems,
}: CheckboxPropTypes & SharedPropTypes) {
  return (
    <div>
      <Field
        id="ingestLedgerEntriesToggle"
        name="ingestLedgerEntries"
        component={Toggle}
        toggleClassName="p-0"
        labelClassName="text-black ml-3"
        label="Ingest Ledger Entries"
        checked={values.ingestLedgerEntries}
        handleChange={() => {
          setDisableLineItems(!disableLineItems);
          void setFieldValue(
            "ingestLedgerEntries",
            !values.ingestLedgerEntries,
          );
        }}
      />
      <p className="ml-8 pt-4 text-xs text-text-muted">
        When true, ledger entries for the Ledger Account Settlement will be used
        to create the line items for the invoice and line items manually added
        will be ignored. If not set, then line items must be created and the sum
        must equal the total amount of the Ledger Account Settlement.
      </p>
    </div>
  );
}
