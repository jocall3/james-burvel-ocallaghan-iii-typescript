// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import {
  connect,
  ErrorMessage,
  Field,
  FormikErrors,
  FormikProps,
  FormikTouched,
} from "formik";
import React, { useEffect, useState } from "react";
import * as Sentry from "@sentry/browser";
import { isEmpty, isNil } from "lodash";
import { FormValues } from "../../constants/payment_order_form";
import {
  useCurrentOrganizationQuery,
  usePaymentOrderFormQuery,
  useInternalAccountPaymentSelectionLazyQuery,
  PaymentOrderFormQuery,
  VendorIdEnum,
  BalanceReportFragment,
  AccountCapabilityFragment,
  SelectSimpleOption,
} from "../../../generated/dashboard/graphqlSchema";
import CounterpartyAccountSelect, {
  ExternalAccountSelectOption,
} from "./CounterpartyAccountSelect";
import NSFProtected from "./NSFProtected";
import { required } from "../../../common/ui-components/validations";
import { FieldGroup, Label } from "../../../common/ui-components";
import { PAYMENT_TYPES_WITH_NSF } from "../../constants";
import { useMountEffect } from "../../../common/utilities/useMountEffect";
import AccountSelect from "../AccountSelect";

interface PaymentToFromProps {
  setReceivingAccountLabel: (label: string) => void;
  setOriginatingAccountLabel: (label: string) => void;
  setIsCounterpartyModalOpen: (value: boolean) => void;
  setAccountCapabilities: (values?: Array<AccountCapabilityFragment>) => void;
  inlineCreatedAccount: { label: string; value: string } | null;
  fieldInvalid: (
    errors: FormikErrors<FormValues>,
    touched: FormikTouched<FormValues>,
    fieldName: string,
  ) => boolean;
  sourcePaymentOrderId: string | null;
  isEditForm?: boolean;
  setInternalAccount: (
    internalAccount: PaymentOrderFormQuery["internalAccount"],
  ) => void;
  setReceivingAccount: (
    receivingAccount: PaymentOrderFormQuery["receivingEntity"],
  ) => void;
  onReceivingAccountChange?: (value: ExternalAccountSelectOption) => void;
  onOriginatingAccountChange?: (value: {
    vendor?: { id: VendorIdEnum; timeZone: string } | null;
    balanceReport?: BalanceReportFragment;
    accountType: string;
  }) => void;
  originatingLabel?: string;
  receivingLabel?: string;
}

function PaymentToFrom({
  formik: { values, errors, touched, setFieldValue },
  setOriginatingAccountLabel,
  setReceivingAccountLabel,
  setIsCounterpartyModalOpen,
  setAccountCapabilities,
  inlineCreatedAccount,
  fieldInvalid,
  sourcePaymentOrderId,
  isEditForm,
  setInternalAccount,
  setReceivingAccount,
  originatingLabel,
  receivingLabel,
  onReceivingAccountChange,
  onOriginatingAccountChange,
}: PaymentToFromProps & { formik: FormikProps<FormValues> }) {
  const { data: organizationData } = useCurrentOrganizationQuery();
  const [getInternalAccountPaymentSelectionQuery] =
    useInternalAccountPaymentSelectionLazyQuery();
  const [availableBalance, setAvailableBalance] = useState<string | null>(null);

  const getBalanceReports = (originatingAccountId: string | null) => {
    let availableBalanceValue = "Balance: Unavailable";
    if (!isNil(originatingAccountId) && !isEmpty(originatingAccountId)) {
      getInternalAccountPaymentSelectionQuery({
        variables: { internalAccountId: originatingAccountId },
      })
        .then(({ data: internalAccountPaymentSelectionData }) => {
          if (internalAccountPaymentSelectionData?.internalAccount) {
            const { balanceReport, connection: connectionVendor } =
              internalAccountPaymentSelectionData.internalAccount;

            if (balanceReport) {
              availableBalanceValue = `Balance: ${
                balanceReport.prettyAvailableAmount ?? ""
              } ${balanceReport.currency ?? ""}`;

              if (onOriginatingAccountChange) {
                onOriginatingAccountChange({
                  vendor: connectionVendor.vendor,
                  balanceReport,
                  accountType: "InternalAccount",
                });
              }
            }

            if (sourcePaymentOrderId || isEditForm) {
              setOriginatingAccountLabel(
                internalAccountPaymentSelectionData.internalAccount.longName,
              );
            }

            // we are going to lock base currency to the internal account's
            // base currency
            if (values.foreignExchangePaymentEnabled) {
              void setFieldValue(
                "currency",
                internalAccountPaymentSelectionData.internalAccount.currency,
              );
            }

            if (
              setAccountCapabilities &&
              internalAccountPaymentSelectionData.internalAccount
                ?.accountCapabilities
            ) {
              setAccountCapabilities(
                internalAccountPaymentSelectionData.internalAccount
                  .accountCapabilities as Array<AccountCapabilityFragment>,
              );
            }
          }
          setAvailableBalance(availableBalanceValue);
        })
        .catch((err) => {
          Sentry.captureException(err);
          setAvailableBalance(availableBalanceValue);
        });
    }
  };

  const onInternalAccountChange = (
    selectedValue: string,
    fieldData: SelectSimpleOption,
  ) => {
    setOriginatingAccountLabel(fieldData.label);
    void setFieldValue("originatingAccountId", selectedValue);
    getBalanceReports(selectedValue);
  };

  const { data: accountData, loading: accountDataLoading } =
    usePaymentOrderFormQuery({
      variables: {
        originatingAccountId: values.originatingAccountId || "",
        receivingAccountId: values.receivingAccountId || "",
      },
    });

  const originatingAccount =
    !accountDataLoading && accountData ? accountData.internalAccount : null;
  const receivingAccount =
    !accountDataLoading && accountData ? accountData.receivingEntity : null;

  useEffect(() => {
    if (originatingAccount) {
      setInternalAccount(originatingAccount);
    }
  }, [originatingAccount, setInternalAccount]);
  useEffect(() => {
    if (receivingAccount) {
      setReceivingAccount(receivingAccount);
    }
  }, [receivingAccount, setReceivingAccount]);

  useMountEffect(() => {
    if (sourcePaymentOrderId || isEditForm) {
      getBalanceReports(values.originatingAccountId);
    }
  });

  function getDirection() {
    let direction = "credit";

    if (values.direction) {
      direction = values.direction;
    }

    return direction;
  }

  function isOrgNSFProtectionEnabled() {
    let nsfProtectionEnabled = false;

    if (organizationData) {
      nsfProtectionEnabled =
        organizationData.currentOrganization.nsfProtectionEnabled;
    }

    return nsfProtectionEnabled;
  }

  function showNSFProtection() {
    let showNSF = false;

    const paymentTypeWithNSF =
      values.paymentType && PAYMENT_TYPES_WITH_NSF.includes(values.paymentType);

    if (
      isOrgNSFProtectionEnabled() &&
      getDirection() === "debit" &&
      paymentTypeWithNSF
    ) {
      showNSF = true;
    }

    return showNSF;
  }

  const validateOriginatingAccount = (value: string): string | undefined => {
    if (values.invoice && values.invoice.originatingAccountId !== value) {
      return "Originating account does not match invoice originating account";
    }
    return undefined;
  };

  return (
    <div className="flex flex-row gap-x-6">
      <div className="flex w-full flex-initial flex-col">
        <FieldGroup>
          <Label id="originatingAccountLabel" className="text-sm font-normal">
            {originatingLabel || (getDirection() === "credit" ? "From" : "To")}
          </Label>
          <div>
            <Field
              component={AccountSelect}
              classes="w-full"
              removeAllAccountsOption
              name="originatingAccountId"
              validate={validateOriginatingAccount}
              accountId={values.originatingAccountId}
              onAccountSelect={(value: string, fieldData: SelectSimpleOption) =>
                onInternalAccountChange(value, fieldData)
              }
            />
            <ErrorMessage
              name="originatingAccountId"
              component="span"
              className="mt-1 text-xs text-text-critical"
            />
          </div>
          {availableBalance && (
            <span id="accountBalance" className="text-xs text-text-muted">
              {availableBalance}
            </span>
          )}
        </FieldGroup>
      </div>
      <div
        className="flex w-full flex-initial flex-col"
        data-dd-action-name="account select"
      >
        <FieldGroup>
          <Label id="receivingAccountIdLabel" className="text-sm font-normal">
            {receivingLabel || (getDirection() === "credit" ? "To" : "From")}
          </Label>
          <Field
            id="receivingAccountId"
            name="receivingAccountId"
            component={CounterpartyAccountSelect}
            originatingAccountId={values.originatingAccountId}
            receivingAccountId={values.receivingAccountId}
            counterpartyId={values.invoice?.counterpartyId}
            externalOnly={Boolean(values.invoice?.counterpartyId)}
            validate={required}
            setReceivingAccountLabel={setReceivingAccountLabel}
            setIsCounterpartyModalOpen={setIsCounterpartyModalOpen}
            inlineCreatedAccount={inlineCreatedAccount}
            invalid={fieldInvalid(errors, touched, "receivingAccountId")}
            sourcePaymentOrderId={sourcePaymentOrderId}
            isEditForm={isEditForm}
            onReceivingAccountChange={onReceivingAccountChange}
          />
        </FieldGroup>
        {showNSFProtection() && (
          <div className="mt-2 flex flex-row gap-x-1">
            <Field
              id="nsfProtected"
              name="nsfProtected"
              component={NSFProtected}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default connect<PaymentToFromProps, FormValues>(PaymentToFrom);
