// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { ReactNode, useState } from "react";
import ReactTooltip from "react-tooltip";
import { ErrorMessage, Field, FieldProps, FormikProps } from "formik";
import { FormValues } from "../../constants/ledger_transaction_form";
import MetadataInput from "../../components/MetadataInput";
import { Button, Icon, Tooltip } from "../../../common/ui-components";
import { LEDGER } from "../../../generated/dashboard/types/resources";

function FormElement({ children }: { children: ReactNode }) {
  return (
    <div className="pb-4">
      <div className="form-group">{children}</div>
    </div>
  );
}

export default function LedgerObjectMetadata({
  disabled = false,
  initialMetadata,
  headerText = "Transaction Metadata",
}: {
  disabled?: boolean;
  initialMetadata: string;
  headerText?: string;
}) {
  const isInitialEmpty = initialMetadata !== null && initialMetadata !== "{}";
  const [hideAddMetadata, setHideAddMetadata] = useState(isInitialEmpty);
  const metadataRecordFormat = JSON.parse(initialMetadata) as Record<
    string,
    string
  >;
  const metadataForm = (
    <Field>
      {({ form }: FieldProps<FormValues> & FormikProps<FormValues>) => (
        <FormElement>
          <MetadataInput
            initialValues={
              isInitialEmpty
                ? metadataRecordFormat
                : ({} as Record<string, string>)
            }
            resource={LEDGER}
            hideLabel
            onChange={(value) => {
              void form.setFieldValue("metadata", JSON.stringify(value));
            }}
            completedValuesAndKeys={false}
            disabled={disabled}
            noInitialEmptyEntry={isInitialEmpty}
          />
          <ErrorMessage
            name="metadata"
            component="span"
            className="error-message"
          />
        </FormElement>
      )}
    </Field>
  );

  const addMetadataButton = (
    <div className="flex self-center">
      <Button
        id="add-metadata-btn"
        buttonType="text"
        onClick={() => setHideAddMetadata(true)}
        disabled={disabled}
      >
        <Icon iconName="add" />
        <span>Add Metadata</span>
      </Button>
    </div>
  );

  return (
    <div
      id="ledgerTransactionMetadata"
      className="form-section additional-information-form-section pt-5"
    >
      <h3>
        <div className="flex">
          <div className="flex flex-grow items-center">
            <span>{headerText}</span>
            <Tooltip
              className="ml-1"
              data-for="metadata"
              data-tip="If you add two key-value pairs with the same key, the first one will be saved."
            />
            <ReactTooltip
              id="metadata"
              multiline
              place="right"
              data-type="dark"
              data-effect="float"
            />
          </div>
          {!hideAddMetadata && addMetadataButton}
        </div>
      </h3>
      {hideAddMetadata && metadataForm}
    </div>
  );
}
