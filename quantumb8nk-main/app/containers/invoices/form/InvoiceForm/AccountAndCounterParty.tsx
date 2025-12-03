// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, FormikProps } from "formik";
import { isNil, isEmpty } from "lodash";
import * as Sentry from "@sentry/browser";

import AccountSelect from "../../../AccountSelect";
import CounterpartySelect from "../../../CounterpartySelect";
import {
  Counterparty,
  useInternalAccountPaymentSelectionLazyQuery,
  AccountCapabilityFragment,
} from "../../../../../generated/dashboard/graphqlSchema";
import { FieldsRow } from "../../../../../common/ui-components";
import { FormikErrorMessage } from "../../../../../common/formik";
import { InvoiceFormValues } from "./types";

type PropTypes = {
  setFieldValue: FormikProps<InvoiceFormValues>["setFieldValue"];
  values: FormikProps<InvoiceFormValues>["values"];
  counterpartyEmail: string;
  setCounterpartyEmail: (arg: string) => void;
  setAccountCapabilities: (arg: Array<AccountCapabilityFragment>) => void;
};

export default function AccountAndCounterparty({
  setFieldValue,
  values,
  counterpartyEmail,
  setCounterpartyEmail,
  setAccountCapabilities,
}: PropTypes) {
  const [getInternalAccountPaymentSelectionQuery] =
    useInternalAccountPaymentSelectionLazyQuery();
  const getCapabilities = (originatingAccountId: string | null) => {
    if (!isNil(originatingAccountId) && !isEmpty(originatingAccountId)) {
      getInternalAccountPaymentSelectionQuery({
        variables: { internalAccountId: originatingAccountId },
      })
        .then(({ data: internalAccountPaymentSelectionData }) => {
          if (internalAccountPaymentSelectionData?.internalAccount) {
            if (
              internalAccountPaymentSelectionData.internalAccount
                ?.accountCapabilities
            ) {
              setAccountCapabilities(
                internalAccountPaymentSelectionData.internalAccount
                  .accountCapabilities as Array<AccountCapabilityFragment>,
              );
            }
          }
        })
        .catch((err) => {
          Sentry.captureException(err);
        });
    }
  };

  const onChange = (counterpartyId, counterparty: Counterparty) => {
    if (counterparty.email) {
      if (!values.recipientEmail) {
        if (counterpartyEmail) {
          if (counterpartyEmail !== counterparty.email) {
            const newValues = values.notificationEmailAddresses.concat();
            newValues[0] = counterparty.email;
            void setFieldValue("notificationEmailAddresses", newValues);
          }
        } else {
          void setFieldValue("notificationEmailAddresses", [
            counterparty.email,
            ...values.notificationEmailAddresses,
          ]);
        }
      }
      setCounterpartyEmail(counterparty.email);
    } else {
      if (!values.recipientEmail) {
        const newValues = values.notificationEmailAddresses.concat();
        newValues.shift();
        void setFieldValue("notificationEmailAddresses", newValues);
      }
      setCounterpartyEmail("");
    }
    void setFieldValue("counterpartyId", counterpartyId);
    void setFieldValue("receivingAccountId", null);
  };

  const onAccountSelect = (account) => {
    void setFieldValue("originatingAccountId", account);
    getCapabilities(account as string);
  };
  return (
    <FieldsRow>
      <div className="flex min-w-60 flex-col">
        <Field
          component={AccountSelect}
          classes="w-full"
          removeAllAccountsOption
          name="originatingAccountId"
          label="Originating Account"
          accountId={values.originatingAccountId}
          onAccountSelect={onAccountSelect}
        />
        <FormikErrorMessage name="originatingAccountId" />
      </div>
      <div className="min-w-60">
        <Field
          name="counterpartyId"
          counterpartyId={values.counterpartyId}
          component={CounterpartySelect}
          onChange={onChange}
        />
        <FormikErrorMessage name="counterpartyId" />
      </div>
    </FieldsRow>
  );
}
