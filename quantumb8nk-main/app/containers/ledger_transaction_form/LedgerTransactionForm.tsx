// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Form, Formik } from "formik";
import moment from "moment-timezone";
import * as Yup from "yup";
import trackEvent from "../../../common/utilities/trackEvent";
import { FormValues, EntryPair } from "../../constants/ledger_transaction_form";
import { useUpsertLedgerTransactionMutation } from "../../../generated/dashboard/graphqlSchema";
import { validation as metadataValidation } from "../../components/KeyValueInput";
import { Button, ButtonClickEventTypes } from "../../../common/ui-components";
import { useDispatchContext } from "../../MessageProvider";
import BasicInfoComponent from "./BasicInfoComponent";
import Entries, { invalidEntriesError } from "./Entries";
import LedgerObjectMetadata from "./LedgerObjectMetadata";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import { LEDGERS_EVENTS } from "../../../common/constants/analytics";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

interface LedgerTransactionFormProps {
  initialValues: FormValues;
  ledgerTransactionId: string;
  initialEntryCurrencySum: Record<string, EntryPair>;
}

function LedgerTransactionForm({
  initialValues,
  ledgerTransactionId,
  initialEntryCurrencySum,
}: LedgerTransactionFormProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [upsertLedgerTransaction] = useUpsertLedgerTransactionMutation();
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const isDisabledDate = !!ledgerTransactionId;
  const isDisabledBasicInfo =
    initialValues.status === "posted" || initialValues.status === "archived";
  const isDisabledMetadata = initialValues.status === "archived";
  const showExternalId = !!initialValues.externalId;

  function invalidLedgerTransaction({ values }: { values: FormValues }) {
    const entriesError = invalidEntriesError({
      entries: values.ledgerEntries,
      initialEntries: initialValues.ledgerEntries,
    });
    if (entriesError !== null) {
      dispatchError(entriesError);
      return true;
    }

    if (values.effectiveDate === "") {
      dispatchError("Effective date is required.");
      return true;
    }
    return false;
  }

  const handleSubmit = async (values: FormValues) => {
    setButtonDisabled(true);
    if (invalidLedgerTransaction({ values })) {
      setButtonDisabled(false);
      return;
    }

    trackEvent(
      null,
      ledgerTransactionId
        ? LEDGERS_EVENTS.UPDATE_LEDGER_TRANSACTION_CLICKED
        : LEDGERS_EVENTS.CREATE_LEDGER_TRANSACTION_CLICKED,
    );

    const ledgerTransactionInput = {
      metadata: values.metadata,
      description: values.description,
      effectiveAt: isDisabledDate ? "" : moment(values.effectiveDate).format(),
      ledgerEntries: values.ledgerEntries.map((entry) => ({
        amount: entry.amount,
        direction: entry.direction,
        ledgerAccountId: entry.ledgerAccountId,
        metadata: entry.metadata,
      })),
      status: values.status,
      id: ledgerTransactionId || null,
    };

    const result = await upsertLedgerTransaction({
      variables: {
        input: ledgerTransactionInput,
      },
    });

    if (result?.data?.upsertLedgerTransaction) {
      const { ledgerTransaction, errors } = result.data.upsertLedgerTransaction;
      if (ledgerTransaction) {
        window.location.href = `/ledger_transactions/${ledgerTransaction.id}`;
        dispatchSuccess("Success!");
      } else if (errors?.length > 0) {
        dispatchError(errors.toString());
      }
      setButtonDisabled(false);
    }
  };

  const validate = (initialFormValues: FormValues) =>
    Yup.object({
      status: Yup.string().nullable().required("Required"),
      metadata: metadataValidation(
        JSON.parse(initialFormValues.metadata) as Record<string, string>,
      ),
    });
  const initialEntriesMetadata = initialValues.ledgerEntries.map(
    (ledger_entry) => ledger_entry.metadata,
  );

  return (
    <PageHeader
      hideBreadCrumbs
      title={`${
        ledgerTransactionId ? "Update" : "Create New"
      } Ledger Transaction`}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validate(initialValues)}
      >
        {(form) => (
          <Form>
            <div className="form-create form-create-wide">
              <BasicInfoComponent
                isDisabledDate={isDisabledDate}
                isDisabledBasicInfo={isDisabledBasicInfo}
                showExternalId={showExternalId}
              />
            </div>
            <div className="form-section additional-information-form-section max-w-[1300px] pt-4">
              <Entries
                ledgerEntryKey="ledgerEntries"
                ledgerId={initialValues.ledgerId}
                initialEntryCurrencySum={initialEntryCurrencySum}
                initialEntriesMetadata={initialEntriesMetadata}
                editable={!isDisabledBasicInfo}
              />
              <LedgerObjectMetadata
                disabled={isDisabledMetadata}
                initialMetadata={initialValues.metadata}
              />
            </div>
            <div className="form-create form-create-wide">
              <div className="flex flex-row space-x-4 pt-5">
                <Button
                  fullWidth
                  onClick={(event: ButtonClickEventTypes) => {
                    handleLinkClick(
                      `/ledgers/${initialValues.ledgerId}`,
                      event,
                    );
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  name="upload"
                  disabled={
                    initialValues.status === "archived" || isButtonDisabled
                  }
                  buttonType="primary"
                  onClick={() => form.handleSubmit()}
                >
                  {ledgerTransactionId !== "" ? "Save" : "Create"}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </PageHeader>
  );
}

export default LedgerTransactionForm;
