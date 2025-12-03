// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Form, Formik } from "formik";
import moment from "moment-timezone";
import * as Yup from "yup";
import { FormValues, EntryPair } from "../../constants/ledger_transaction_form";
import { useReverseLedgerTransactionMutation } from "../../../generated/dashboard/graphqlSchema";
import { validation as metadataValidation } from "../../components/KeyValueInput";
import { Button, ButtonClickEventTypes } from "../../../common/ui-components";
import { useDispatchContext } from "../../MessageProvider";
import BasicInfoComponent from "./BasicInfoComponent";
import Entries from "./Entries";
import LedgerObjectMetadata from "./LedgerObjectMetadata";
import trackEvent from "../../../common/utilities/trackEvent";
import { LEDGERS_EVENTS } from "../../../common/constants/analytics";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

interface ReverseLedgerTransactionFormProps {
  initialValues: FormValues;
  ledgerTransactionId: string;
  initialEntryCurrencySum: Record<string, EntryPair>;
}

export default function ReverseLedgerTransactionForm({
  initialValues,
  ledgerTransactionId,
  initialEntryCurrencySum,
}: ReverseLedgerTransactionFormProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [reverseLedgerTransaction] = useReverseLedgerTransactionMutation();
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const showExternalId = true;

  const handleSubmit = async (values: FormValues) => {
    setButtonDisabled(true);

    const reverseLedgerTransactionInput = {
      status: values.status,
      id: ledgerTransactionId,
      effectiveAt: moment(values.effectiveDate).format(),
      description: values.description,
      externalId: values.externalId,
      metadata: values.metadata,
    };

    const result = await reverseLedgerTransaction({
      variables: {
        input: reverseLedgerTransactionInput,
      },
    });

    if (result?.data?.reverseLedgerTransaction) {
      const { reversalLedgerTransaction, errors } =
        result.data.reverseLedgerTransaction;
      if (reversalLedgerTransaction) {
        trackEvent(
          null,
          LEDGERS_EVENTS.CREATE_LEDGER_TRANSACTION_REVERSAL_CLICKED,
        );

        window.location.href = `/ledger_transactions/${reversalLedgerTransaction.id}`;
        dispatchSuccess("Success!");
      } else if (errors?.length > 0) {
        dispatchError(errors.toString());
      }
      setButtonDisabled(false);
    }
  };

  const validate = (initialFormValues: FormValues) =>
    Yup.object({
      status: Yup.string().required("Required"),
      metadata: metadataValidation(
        JSON.parse(initialFormValues.metadata) as Record<string, string>,
      ),
    });

  const initialEntriesMetadata = initialValues.ledgerEntries.map(
    (ledger_entry) => ledger_entry.metadata,
  );

  return (
    <PageHeader hideBreadCrumbs title="Reverse Ledger Transaction">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validate(initialValues)}
      >
        {(form) => (
          <Form>
            <div className="form-create form-create-wide">
              <BasicInfoComponent
                isDisabledDate
                isDisabledBasicInfo={false}
                showExternalId={showExternalId}
              />
            </div>
            <div className="form-section additional-information-form-section max-w-[1300px] pt-4">
              <Entries
                ledgerEntryKey="ledgerEntries"
                ledgerId={initialValues.ledgerId}
                initialEntryCurrencySum={initialEntryCurrencySum}
                initialEntriesMetadata={initialEntriesMetadata}
                editable={false}
              />
              <LedgerObjectMetadata initialMetadata={initialValues.metadata} />
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
                  disabled={isButtonDisabled}
                  buttonType="primary"
                  onClick={() => form.handleSubmit()}
                >
                  Create
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </PageHeader>
  );
}
