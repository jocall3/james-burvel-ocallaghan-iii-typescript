// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, Form, Formik, FormikErrors, FormikProps } from "formik";
import React, { RefObject, useState } from "react";
import { isEmpty, isNil, omit, reduce } from "lodash";
import * as Sentry from "@sentry/browser";
import useLedgersProductActive from "~/common/utilities/useLedgersProductActive";
import { ForeignExchangeAmountEnum } from "~/app/constants";
import {
  FormValues,
  LineItemValues,
  SanitizedLineItemValues,
  ModifiedPaymentOrderInput,
  ModifiedPaymentOrderLineItemInput,
} from "../../constants/payment_order_form";
import PaymentMethod from "./PaymentMethod";
import PaymentSubtypeField from "./PaymentSubtypeField";
import PaymentDirection from "./PaymentDirection";
import PaymentDate from "./PaymentDate";
import PaymentAmount from "./PaymentAmount";
import PaymentOrderSummary from "./PaymentOrderSummary";
import PaymentToFrom from "./PaymentToFrom";
import PaymentAdditionalInformation from "./PaymentAdditionalInformation";
import {
  PaymentOrderInput,
  PaymentTypeEnum,
  useUpsertPaymentOrderMutation,
  useSourcePaymentOrderQuery,
  useLedgerTransactionAbilityQuery,
  LineItem,
  Accounting__LedgerEntity,
  LineItemInput,
  PaymentOrderFormQuery,
  useInvoiceDetailsQuery,
  PaymentSubtypeEnum,
  AccountCapabilityFragment,
  ForeignExchangeIndicatorEnum,
  useActiveComplianceQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { required } from "../../../common/ui-components/validations";
import PaymentAccountingDetails from "./PaymentAccountingDetails";
import CreateCounterpartyModal from "./create_counterparty/CreateCounterpartyModal";
import FormikKeyValueInput, {
  FieldTypeEnum,
} from "../../../common/formik/FormikKeyValueInput";
import { Alert, FieldsRow } from "../../../common/ui-components";
import { fieldInvalid, sanitizeMetadata } from "./PaymentOrderCreateUtils";
import PaymentDocumentsUpload from "./PaymentDocumentsUpload";
import PurposeField from "./PurposeField";
import trackEvent from "../../../common/utilities/trackEvent";
import { PAYMENT_ORDER_FORM_EVENTS } from "../../../common/constants/analytics";
import { PAYMENT_ORDER } from "../../../generated/dashboard/types/resources";
import sanitizeAmount, {
  getCurrencyDecimalScale,
} from "../../../common/utilities/sanitizeAmount";
import MissingAccountRequirementsModalContainer from "./missing_account_requirements/MissingAccountRequirementsModalContainer";
import TransactionMonitoring from "./TransactionMonitoring";
import EmbeddedLedgerTransactionDetails from "../embedded_ledger_transaction_component/EmbeddedLedgerTransactionDetails";
import {
  LedgerEntry,
  LedgerableLedgerEntry,
} from "../../constants/ledger_transaction_form";
import PaymentOrderEffectiveDateAndApprovalDeadline from "./PaymentOrderEffectiveDateAndApprovalDeadline";
import ForeignExchangePaymentToggle from "./ForeignExchangePaymentToggle";

function getAmountType(foreignExchangeIndicator: string | undefined | null) {
  if (
    foreignExchangeIndicator === ForeignExchangeIndicatorEnum.VariableToFixed
  ) {
    return ForeignExchangeAmountEnum.TargetAmount;
  }
  if (
    foreignExchangeIndicator === ForeignExchangeIndicatorEnum.FixedToVariable
  ) {
    return ForeignExchangeAmountEnum.BaseAmount;
  }
  return undefined;
}

interface PaymentOrderFormProps {
  sourcePaymentOrderId: string | null;
  isEditForm: boolean;
  id?: string;
  paymentOrderData?: ModifiedPaymentOrderInput;
  formikRef: RefObject<FormikProps<FormValues>>;
  setDisableCreate: (disableCreate: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  createQuotesFromPOFormEnabled: boolean;
}

function PaymentOrderForm({
  sourcePaymentOrderId,
  isEditForm = false,
  id: paymentOrderId,
  paymentOrderData,
  formikRef,
  setDisableCreate,
  setSubmitting,
  createQuotesFromPOFormEnabled = false,
}: PaymentOrderFormProps) {
  const [formErrorMessages, setFormErrorMessages] = useState<Array<string>>([]);
  // these are so when we select a originating account and receiving account,
  // we are able to show it in the payment order summary
  const [originatingAccountLabel, setOriginatingAccountLabel] = useState("");
  const [receivingAccountLabel, setReceivingAccountLabel] = useState("");
  const [isCounterpartyModalOpen, setIsCounterpartyModalOpen] = useState(false);
  const [internalAccount, setInternalAccount] =
    useState<PaymentOrderFormQuery["internalAccount"]>();
  const [receivingAccount, setReceivingAccount] =
    useState<PaymentOrderFormQuery["receivingEntity"]>();
  const [inlineCreatedAccount, setInlineCreatedAccount] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [accountCapabilities, setAccountCapabilities] = useState<
    Array<AccountCapabilityFragment> | undefined
  >(undefined);
  const [upsertPaymentOrder] = useUpsertPaymentOrderMutation();

  const { loading, data: queryData } = useSourcePaymentOrderQuery({
    // Empty string since typescript can't see that we skip if no id is defined
    variables: { id: paymentOrderId || sourcePaymentOrderId || "" },
    skip: !(paymentOrderId || sourcePaymentOrderId),
  });
  const sourcePaymentOrder = queryData?.paymentOrder;
  const { data: ledgerTransactionAbilityData } =
    useLedgerTransactionAbilityQuery();

  const { ledgersProductActive } = useLedgersProductActive();

  const { data: activeComplianceData } = useActiveComplianceQuery();
  const activeCompliance = activeComplianceData?.products.totalCount === 1;

  const canUpdateLedgerTransaction =
    ledgerTransactionAbilityData?.abilities?.LedgerTransaction?.canUpdate &&
    ledgersProductActive;

  const urlParams = new URLSearchParams(window.location.search);
  const receivingAccountId = urlParams.get("receivingAccountId");

  const invoiceId = urlParams.get("invoiceId") as string;
  const { loading: invoiceLoading, data: invoiceData } = useInvoiceDetailsQuery(
    {
      variables: {
        id: invoiceId,
      },
      skip: !invoiceId,
    },
  );

  function prepareLineItem(
    lineItem: LineItem | ModifiedPaymentOrderLineItemInput,
  ): LineItemValues {
    const accountingCategory =
      lineItem.accountingCategory as Accounting__LedgerEntity;
    const accountingClass =
      lineItem.accountingLedgerClass as Accounting__LedgerEntity;
    return {
      ...lineItem,
      id: isEditForm ? lineItem.id : null,
      metadata: JSON.parse(lineItem.metadata as string) as Array<{
        key: string;
        value: string;
      }>,
      accountingDetails: [
        {
          category: accountingCategory ? accountingCategory.id : "",
          class: accountingClass ? accountingClass.id : "",
        },
      ],
      accountingCategory: "",
      accountingLedgerClass: "",
    };
  }

  let initialValues: FormValues;
  if (isEditForm && paymentOrderId && paymentOrderData) {
    const foreignExchangePaymentEnabled =
      // TODO (mchaudhry05): remove when GA release
      createQuotesFromPOFormEnabled &&
      paymentOrderData?.currency !==
        paymentOrderData?.originatingAccountCurrency;

    initialValues = {
      id: paymentOrderData.id,
      paymentType: paymentOrderData.type as PaymentTypeEnum,
      priority: paymentOrderData.priority,
      paymentSubtype: paymentOrderData.subtype as PaymentSubtypeEnum,
      currency: foreignExchangePaymentEnabled
        ? paymentOrderData?.originatingAccountCurrency
        : paymentOrderData?.currency,
      targetCurrency: foreignExchangePaymentEnabled
        ? paymentOrderData?.currency
        : undefined,
      amount: paymentOrderData.amount,
      direction: paymentOrderData.direction,
      originatingAccountId: paymentOrderData.originatingAccountId,
      receivingAccountId: paymentOrderData.receivingAccountId,
      effectiveDate: paymentOrderData.effectiveDate,
      accountingCategory: paymentOrderData.accountingCategory,
      accountingLedgerClass: paymentOrderData.accountingLedgerClass,
      description: paymentOrderData.description,
      statementDescriptor: paymentOrderData.statementDescriptor,
      metadata: paymentOrderData.metadata as [],
      remittanceInformation: paymentOrderData.remittanceInformation,
      sourcePaymentOrderId: paymentOrderData.sourcePaymentOrderId,
      nsfProtected: paymentOrderData.nsfProtected,
      lineItems: (sourcePaymentOrder?.lineItems || []).map((lineItem) =>
        prepareLineItem(lineItem),
      ),
      transactionMonitoringEnabled:
        paymentOrderData.transactionMonitoringEnabled,
      complianceRuleMetadata: paymentOrderData.complianceRuleMetadata as [],
      purpose: paymentOrderData.purpose || "",
      additionalExternalAccountFields: {
        partyType: "",
        accountType: "",
        partyAddress:
          paymentOrderData.additionalExternalAccountFields?.partyAddress,
        routingDetails: [],
        accountDetails: [],
      },
      ledgerEntries: [],
      savedLedgerEntries: [],
      ledgerTransactionMetadata: {},
      savedLedgerTransactionMetadata: {},
      foreignExchangeIndicator:
        paymentOrderData.foreignExchangeIndicator as ForeignExchangeIndicatorEnum,
      creationSource: paymentOrderData.creationSource,
      foreignExchangePaymentEnabled,
      amountType: getAmountType(paymentOrderData?.foreignExchangeIndicator),
    };
  } else if (sourcePaymentOrderId != null && sourcePaymentOrder?.canRead) {
    const foreignExchangePaymentEnabled =
      // TODO (mchaudhry05): remove when GA release
      createQuotesFromPOFormEnabled &&
      sourcePaymentOrder?.originatingAccount?.currency !==
        sourcePaymentOrder.currency;

    initialValues = {
      ...sourcePaymentOrder,
      id: undefined,
      originatingAccountId: sourcePaymentOrder.originatingAccountId,
      accountingCategory: sourcePaymentOrder.accountingCategory?.id,
      accountingLedgerClass: sourcePaymentOrder.accountingLedgerClass?.id,
      // we use prettyAmount over amount due to easier parsing for both PaymentOrderSummary and CurrencyInput.
      amount: sourcePaymentOrder.prettyAmount,
      lineItems: (sourcePaymentOrder.lineItems || []).map((lineItem) =>
        prepareLineItem(lineItem as LineItem),
      ),
      metadata: JSON.parse(sourcePaymentOrder.metadata) as Array<{
        key: string;
        value: string;
      }>,
      sourcePaymentOrderId,
      duplicateLineItems: sourcePaymentOrderId != null,
      documents: [],
      paymentType: sourcePaymentOrder.type,
      priority: sourcePaymentOrder.priority,
      paymentSubtype:
        sourcePaymentOrder.subtype !== null
          ? sourcePaymentOrder.subtype
          : undefined,
      additionalExternalAccountFields: {
        partyType: "",
        accountType: "",
        partyAddress: {},
        routingDetails: [],
        accountDetails: [],
      },
      nsfProtected: sourcePaymentOrder.nsfProtected,
      transactionMonitoringEnabled:
        !!sourcePaymentOrder.transactionMonitoringEnabled,
      complianceRuleMetadata: JSON.parse(
        sourcePaymentOrder.complianceRuleMetadata as string,
      ) as Array<{
        key: string;
        value: string;
      }>,
      purpose: sourcePaymentOrder.purpose || "",
      ledgerEntries: [],
      savedLedgerEntries: [],
      ledgerTransactionMetadata: {},
      savedLedgerTransactionMetadata: {},
      foreignExchangeIndicator:
        sourcePaymentOrder.foreignExchangeIndicator !== null
          ? sourcePaymentOrder.foreignExchangeIndicator
          : undefined,
      foreignExchangePaymentEnabled,
      amountType: getAmountType(sourcePaymentOrder.foreignExchangeIndicator),
    };
  } else {
    initialValues = {
      id: paymentOrderId,
      receivingAccountId,
      currency: invoiceData?.invoice?.currency || "USD",
      paymentType: undefined,
      priority: undefined,
      paymentSubtype: undefined,
      amount: (invoiceData?.invoice?.decimalizedAmount as number) || undefined,
      direction: invoiceData?.invoice ? "debit" : "credit",
      originatingAccountId: invoiceData?.invoice?.originatingAccountId || "",
      effectiveDate: null,
      lineItems: [],
      transactionMonitoringEnabled: false,
      complianceRuleMetadata: [],
      purpose: "",
      invoice: invoiceData?.invoice || undefined,
      additionalExternalAccountFields: {
        partyType: "",
        accountType: "",
        partyAddress: {
          line1: "",
          line2: "",
          locality: "",
          region: "",
          postalCode: "",
          country: "",
        },
        routingDetails: [],
        accountDetails: [],
      },
      ledgerEntries: [],
      savedLedgerEntries: [],
      ledgerTransactionMetadata: {},
      savedLedgerTransactionMetadata: {},
      amountType: ForeignExchangeAmountEnum.TargetAmount,
      foreignExchangeIndicator: undefined,
      foreignExchangePaymentEnabled: false,
    };
  }

  function submitPaymentOrder(
    formValues: FormValues,
    setErrors: (errors: FormikErrors<FormValues>) => void,
  ) {
    setSubmitting(true);

    function sanitizeLineItems(
      lineItems: Array<LineItemValues> | undefined,
    ): SanitizedLineItemValues[] {
      return reduce(
        lineItems,
        (acc: SanitizedLineItemValues[], curr) => {
          const lineItemInput: SanitizedLineItemValues = {
            ...curr,
            metadata: JSON.stringify(sanitizeMetadata(curr.metadata)),
            amount: sanitizeAmount(
              curr.amount,
              getCurrencyDecimalScale(formValues.currency),
            ),
          };
          acc.push(lineItemInput);
          return acc;
        },
        [],
      );
    }

    function transformLineItem(lineItem: SanitizedLineItemValues) {
      // we want to the behavior to set either the class or category
      // as we currently do in the main form
      let accountingCategory = "";
      let accountingLedgerClass = "";

      if (
        lineItem.accountingDetails &&
        lineItem.accountingDetails?.length > 0
      ) {
        accountingCategory = lineItem.accountingDetails[0].category;
        accountingLedgerClass = lineItem.accountingDetails[0].class;
      }

      let lineItemData: LineItemInput = {
        id: lineItem.id,
        amount: lineItem.amount,
        description: lineItem.description,
        metadata: lineItem.metadata,
        accountingCategory: accountingCategory || ("" as string),
        accountingLedgerClass: accountingLedgerClass || ("" as string),
      };

      if (
        isEmpty(lineItemData.accountingCategory) &&
        isEmpty(lineItemData.accountingLedgerClass)
      ) {
        lineItemData = omit(lineItemData, [
          "accountingCategory",
          "accountingLedgerClass",
        ]);
        return lineItemData;
      }

      if (isEmpty(lineItemData.accountingLedgerClass)) {
        lineItemData = omit(lineItemData, ["accountingLedgerClass"]);
      }

      if (isEmpty(lineItemData.accountingCategory)) {
        lineItemData = omit(lineItemData, ["accountingCategory"]);
      }

      if (isEmpty(lineItemData.metadata)) {
        lineItemData = omit(lineItemData, ["metadata"]);
      }

      return lineItemData;
    }
    function getSubtype() {
      return isEmpty(formValues.paymentSubtype)
        ? undefined
        : (formValues.paymentSubtype as PaymentSubtypeEnum);
    }
    function getForeignExchangeIndicator() {
      if (
        formValues.foreignExchangePaymentEnabled &&
        (!formValues.amountType ||
          formValues.amountType === ForeignExchangeAmountEnum.TargetAmount)
      ) {
        return ForeignExchangeIndicatorEnum.VariableToFixed;
      }

      if (
        formValues.foreignExchangePaymentEnabled &&
        formValues.amountType === ForeignExchangeAmountEnum.BaseAmount
      ) {
        return ForeignExchangeIndicatorEnum.FixedToVariable;
      }

      return isEmpty(formValues.foreignExchangeIndicator)
        ? null
        : (formValues.foreignExchangeIndicator as ForeignExchangeIndicatorEnum);
    }

    const decimalScale = formValues.foreignExchangePaymentEnabled
      ? getCurrencyDecimalScale(formValues.targetCurrency)
      : getCurrencyDecimalScale(formValues.currency);
    const data: PaymentOrderInput = {
      id: formValues.id,
      amount: sanitizeAmount(formValues.amount, decimalScale),
      currency: formValues.foreignExchangePaymentEnabled
        ? formValues.targetCurrency
        : formValues.currency,
      description: formValues.description,
      direction: formValues.direction,
      effectiveDate: formValues.effectiveDate,
      processAfter: formValues.processAfter,
      originatingAccountId: formValues.originatingAccountId,
      receivingAccountId: formValues.receivingAccountId,
      remittanceInformation: formValues.remittanceInformation,
      statementDescriptor: formValues.statementDescriptor,
      nsfProtected: formValues.nsfProtected,
      type: formValues.paymentType as PaymentTypeEnum,
      priority: formValues.priority,
      subtype: getSubtype(),
      purpose: isEmpty(formValues.purpose) ? undefined : formValues.purpose,
      foreignExchangeIndicator: getForeignExchangeIndicator(),
      // sanitize line items metadata and amount
      // then map and while mapping, transform the line item to include accounting ledger class and category
      // then omit the accounting details key and value since we don't support it on the backend
      lineItems: sanitizeLineItems(formValues.lineItems).map((lineItem) =>
        omit(transformLineItem(lineItem), "accountingDetails"),
      ),
      ...(!isNil(formValues.accountingCategory)
        ? { accountingCategory: formValues.accountingCategory }
        : ""),
      ...(!isNil(formValues.accountingLedgerClass)
        ? { accountingLedgerClass: formValues.accountingLedgerClass }
        : ""),
      ...(!isNil(formValues.metadata)
        ? {
            metadata: JSON.stringify(
              sanitizeMetadata(formValues.metadata, initialValues.metadata),
            ),
          }
        : {}),
      documents: formValues.documents,
      complianceRuleMetadata: JSON.stringify(
        sanitizeMetadata(
          formValues.complianceRuleMetadata,
          initialValues.complianceRuleMetadata,
        ),
      ),
      transactionMonitoringEnabled: formValues.transactionMonitoringEnabled,
      additionalExternalAccountFields:
        !isEmpty(formValues.additionalExternalAccountFields?.partyType) ||
        !isEmpty(formValues.additionalExternalAccountFields?.accountType) ||
        !isEmpty(formValues.additionalExternalAccountFields?.partyAddress) ||
        !isEmpty(formValues.additionalExternalAccountFields?.routingDetails) ||
        !isEmpty(formValues.additionalExternalAccountFields?.accountDetails)
          ? formValues.additionalExternalAccountFields
          : null,
      invoiceId: formValues.invoice?.id,
      ledgerTransaction:
        formValues.savedLedgerEntries.length > 0
          ? {
              description: formValues.savedLedgerTransactionDescription,
              ledgerEntries: formValues.savedLedgerEntries.map(
                ({
                  amount,
                  direction,
                  ledgerAccountId,
                }: LedgerEntry): LedgerableLedgerEntry => ({
                  amount,
                  direction,
                  ledgerAccountId,
                }),
              ),
              metadata: JSON.stringify(
                formValues.savedLedgerTransactionMetadata,
              ),
            }
          : null,
    };

    function transformData(poData: PaymentOrderInput) {
      // for some we reason, we get an error if we include accountingCategory and accountingLedgerClass
      // but they are empty strings.
      // so if they are empty strings, we'll remove them from the final object we send to the backend.
      // but if we have a ledger class and no category or vice versa,
      // we'll keep the non-empty one on the object per current PO behavior
      let paymentOrder: PaymentOrderInput = poData;
      if (
        isEmpty(poData.accountingCategory) &&
        isEmpty(poData.accountingLedgerClass)
      ) {
        paymentOrder = omit(poData, [
          "accountingCategory",
          "accountingLedgerClass",
        ]);
        return paymentOrder;
      }

      if (isEmpty(poData.accountingLedgerClass)) {
        paymentOrder = omit(poData, ["accountingLedgerClass"]);
      }

      if (isEmpty(poData.accountingCategory)) {
        paymentOrder = omit(poData, ["accountingCategory"]);
      }
      return paymentOrder;
    }

    upsertPaymentOrder({
      variables: { input: { input: transformData(data) } },
    })
      .then((response) => {
        const returnedPaymentOrder =
          response?.data?.upsertPaymentOrder?.paymentOrder;
        const errors = response?.data?.upsertPaymentOrder?.errors;
        const serializedErrors =
          response?.data?.upsertPaymentOrder?.serializedErrors;

        if (returnedPaymentOrder?.ledgerTransaction) {
          trackEvent(
            null,
            PAYMENT_ORDER_FORM_EVENTS.EMBEDDED_LEDGER_TRANSACTION,
          );
        }

        if (serializedErrors) {
          // Show error on fields that are dynamically hidden as action errors.
          const hiddenFieldSerializedErrors = [
            "subtype",
            "purpose",
            "nsfProtected",
          ].filter((field) => serializedErrors[field]);
          // check if we have action errors
          if (
            hiddenFieldSerializedErrors.length ||
            (serializedErrors.actionErrors &&
              serializedErrors.actionErrors.length)
          ) {
            // this is in the case we have multiple action errors
            const errorMessages: Array<string> =
              hiddenFieldSerializedErrors.map(
                (key) => serializedErrors[key] as string,
              );
            serializedErrors.actionErrors?.forEach((actionError) => {
              errorMessages.push(actionError.messages[0]);
            });
            setFormErrorMessages(errorMessages);
          } else {
            // NOTE: if a field in serializedErrors doesn't have a corresponding ErrorMesssage
            // component on its field component, the error will be hidden. So if you add a new field,
            // please, add an ErrorMessage onto it to display any errors with that field.
            // EX: see PaymentDirection.tsx line 28
            setFormErrorMessages(["Please fix all errors before continuing."]);
          }

          const transformedSerializedErrors = {
            ...serializedErrors,
            paymentType: serializedErrors.type || serializedErrors.priority,
          };

          setErrors(transformedSerializedErrors as FormikErrors<FormValues>);
          window.scrollTo(0, 0);
          setSubmitting(false);
        }

        if (!isEmpty(errors) || !isEmpty(serializedErrors)) {
          trackEvent(null, PAYMENT_ORDER_FORM_EVENTS.ERROR, {
            errors,
            serializedErrors,
            isEditForm,
          });
        }

        if (returnedPaymentOrder && returnedPaymentOrder.id) {
          // we created the payment order
          window.location.href = `/payment_orders/${returnedPaymentOrder.id}`;
        }
      })
      .catch((error) => {
        setFormErrorMessages([
          "Sorry, an unexpected error occurred. Your payment order may have been created, please check before resubmitting.",
        ]);
        // log error and exception into sentry
        Sentry.captureException(error);
      });
  }

  if (loading || invoiceLoading) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {formErrorMessages.map((errorMessage) => (
        <div className="mt-2" key={errorMessage}>
          <Alert alertType="danger">{errorMessage}</Alert>
        </div>
      ))}
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          onSubmit={(values, { setErrors }) => {
            submitPaymentOrder(values, setErrors);
          }}
          innerRef={formikRef}
        >
          {({
            errors,
            touched,
            setFieldValue,
            values,
          }: FormikProps<FormValues>) => (
            <div>
              {isCounterpartyModalOpen && (
                <CreateCounterpartyModal
                  isOpen={isCounterpartyModalOpen}
                  handleModalClose={(id, name) => {
                    if (id && name) {
                      void setFieldValue("receivingAccountId", id);
                      setInlineCreatedAccount({ value: id, label: name });
                    }

                    setIsCounterpartyModalOpen(false);
                  }}
                />
              )}
              <MissingAccountRequirementsModalContainer />
              <Form>
                <div className="grid max-w-[1176px] grid-cols-1 items-start gap-x-6 mint-lg:grid-cols-2">
                  <div className="flex flex-col gap-y-6">
                    <div className="flex flex-col gap-y-6">
                      <div className="flex flex-row gap-x-6">
                        <div className="w-full">
                          {/* https://formik.org/docs/api/field */}
                          <Field
                            id="direction"
                            name="direction"
                            component={PaymentDirection}
                            invalid={fieldInvalid(errors, touched, "direction")}
                            validate={(value: string): string | undefined => {
                              const requiredValue = required(value);
                              if (requiredValue) return requiredValue;
                              if (values.invoice && value !== "debit") {
                                return "Only charge is supported for invoice payments.";
                              }
                              return undefined;
                            }}
                          />
                        </div>
                        <div className="w-full">
                          <Field
                            id="effectiveDate"
                            name="effectiveDate"
                            component={PaymentDate}
                            invalid={fieldInvalid(
                              errors,
                              touched,
                              "effectiveDate",
                            )}
                          />
                        </div>
                      </div>
                      {/* Select fields for counterparty + internal account selection */}
                      <PaymentToFrom
                        setOriginatingAccountLabel={setOriginatingAccountLabel}
                        setReceivingAccountLabel={setReceivingAccountLabel}
                        setIsCounterpartyModalOpen={setIsCounterpartyModalOpen}
                        setAccountCapabilities={setAccountCapabilities}
                        inlineCreatedAccount={inlineCreatedAccount}
                        fieldInvalid={fieldInvalid}
                        sourcePaymentOrderId={sourcePaymentOrderId}
                        isEditForm={isEditForm}
                        setInternalAccount={setInternalAccount}
                        setReceivingAccount={setReceivingAccount}
                      />
                      <FieldsRow columns={2} className="!mb-0">
                        <Field
                          id="type"
                          name="paymentType"
                          priorityName="priority"
                          component={PaymentMethod}
                          accountCapabilities={accountCapabilities}
                          validate={required}
                          invalid={fieldInvalid(errors, touched, "paymentType")}
                          sourcePaymentOrderId={sourcePaymentOrderId}
                        />
                        <PaymentSubtypeField
                          accountCapabilities={accountCapabilities}
                        />
                        <PurposeField />
                      </FieldsRow>

                      <PaymentAmount
                        fieldInvalid={fieldInvalid}
                        accountCapabilities={accountCapabilities}
                        isEditForm={isEditForm}
                      />
                    </div>

                    <PaymentAccountingDetails
                      fieldInvalid={fieldInvalid}
                      errors={errors}
                      touched={touched}
                      accountingCategoryId={
                        receivingAccount?.counterparty?.accountingCategory?.id
                      }
                      accountingLedgerClassId={
                        receivingAccount?.counterparty?.accountingLedgerClass
                          ?.id
                      }
                      accountingFieldsClearable={!isEditForm}
                    />

                    <FormikKeyValueInput
                      fieldType={FieldTypeEnum.Metadata}
                      fieldInvalid={fieldInvalid}
                      resource={PAYMENT_ORDER}
                    />

                    {!isEditForm && canUpdateLedgerTransaction && (
                      <EmbeddedLedgerTransactionDetails
                        amount={values.amount}
                        originatingLedgerAccount={
                          internalAccount?.ledgerAccount
                        }
                        receivingLedgerAccount={receivingAccount?.ledgerAccount}
                      />
                    )}

                    <PaymentAdditionalInformation
                      fieldInvalid={fieldInvalid}
                      errors={errors}
                      touched={touched}
                      values={values}
                      setFieldValue={setFieldValue}
                    />

                    {isEditForm ? null : <PaymentDocumentsUpload />}
                  </div>

                  <div className="sticky top-4 mt-4 flex flex-col gap-4 mint-lg:mt-0">
                    <PaymentOrderSummary
                      receivingAccountLabel={receivingAccountLabel}
                      originatingAccountLabel={originatingAccountLabel}
                      sourcePaymentOrderId={sourcePaymentOrderId}
                      isEditForm={isEditForm}
                      setDisableCreate={setDisableCreate}
                      createQuotesFromPOFormEnabled={
                        createQuotesFromPOFormEnabled
                      }
                    />
                    <PaymentOrderEffectiveDateAndApprovalDeadline />
                    <ForeignExchangePaymentToggle />
                    {activeCompliance && (
                      <TransactionMonitoring isEditForm={isEditForm} />
                    )}
                  </div>
                </div>
              </Form>
            </div>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default PaymentOrderForm;
