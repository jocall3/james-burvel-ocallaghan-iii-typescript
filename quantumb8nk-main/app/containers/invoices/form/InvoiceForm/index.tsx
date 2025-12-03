// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, Form, Formik, FormikProps } from "formik";
import React, { useState } from "react";

import { defaultAddress } from "../../../../../common/formik/FormikAddressForm";
import { FieldGroup, Label } from "../../../../../common/ui-components";
import { FormikInputField } from "../../../../../common/formik";
import {
  AccountCapabilityFragment,
  useProductsQuery,
} from "../../../../../generated/dashboard/graphqlSchema";
import { ISO_CODES } from "../../../../constants";
import InvoiceFormSummary from "../InvoiceFormSummary";
import InvoicePartyDetails from "../InvoicePartyDetails";
import { InvoiceFormValues } from "./types";
import validator from "./yupValidator";
import AccountAndCounterparty from "./AccountAndCounterParty";
import CurrencyAndDates from "./CurrencyAndDates";
import LineItems from "./LineItems";
import AddressForm from "./AddressForm";
import PaymentOptions from "./PaymentOptions";
import AdditionalOptions from "./AdditionalOptions";

function InvoiceForm({
  onSubmit,
  initialValues,
  isEditing,
}: {
  onSubmit: (data: InvoiceFormValues) => void;
  initialValues?: InvoiceFormValues;
  isEditing?: boolean;
}) {
  const [amount, setAmount] = useState(
    initialValues?.ledgerAccountSettlement?.amount || "",
  );
  const { loading, data: productData } = useProductsQuery({
    variables: { productType: "ledgers", status: "active" },
  });
  const [editingLineItem, setEditingLineItem] = useState<number | null>(null);
  const [showLineItemModal, setShowLineItemModal] = useState(false);
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(false);
  const [paymentFields, setShowPaymentFields] = useState(
    initialValues?.initiatePayment || false,
  );
  const [disableEnablePaymentCollection, setDisableEnablePaymentCollection] =
    useState(initialValues?.initiatePayment || false);
  const [disablePaymentInitation, setDisablePaymentInitiation] = useState(
    initialValues?.includePaymentFlow || false,
  );
  const [disableLineItems, setDisableLineItems] = useState(false);
  const [accountCapabilities, setAccountCapabilities] = useState<
    Array<AccountCapabilityFragment> | undefined
  >(undefined);
  const [counterpartyEmail, setCounterpartyEmail] = useState("");

  const handleSubmit = (data: InvoiceFormValues) => {
    const duped = { ...data };
    const { virtualAccount, ledgerAccountSettlement } = duped;
    delete duped.virtualAccount;
    delete duped.ledgerAccountSettlement;
    const submitting = {
      ...duped,
      virtualAccountId: virtualAccount?.value,
      ledgerAccountSettlementId: ledgerAccountSettlement?.value,
      shippingAddress: shippingSameAsBilling
        ? duped.billingAddress
        : duped.shippingAddress,
      recipientEmail: duped.recipientEmail ? duped.recipientEmail : null,
      recipientName: duped.recipientName ? duped.recipientName : null,
      notificationEmailAddresses: duped.notificationEmailAddresses.filter(
        (email) => email !== counterpartyEmail,
      ),
    };
    onSubmit(submitting);
  };

  const showLas =
    !loading &&
    productData?.products?.nodes &&
    productData?.products?.nodes?.length > 0;

  return (
    <Formik
      onSubmit={handleSubmit}
      validationSchema={validator({ paymentFields, amount })}
      validateOnBlur
      initialValues={
        initialValues || {
          autoAdvance: false,
          originatingAccountId: null,
          receivingAccountId: null,
          includePaymentFlow: false,
          initiatePayment: false,
          paymentType: null,
          priority: "normal",
          paymentEffectiveDate: null,
          fallbackPaymentMethod: null,
          counterpartyId: null,
          currency: ISO_CODES[0],
          description: "",
          dueDate: null,
          lineItems: [],
          billingAddress: { ...defaultAddress },
          shippingAddress: { ...defaultAddress },
          invoicerAddress: { ...defaultAddress },
          recipientEmail: "",
          recipientName: "",
          issuerEmail: "",
          issuerPhone: "",
          issuerWebsite: "",
          csvAttachmentFilename: "",
          csvLink: "",
          notificationsEnabled: false,
          notificationEmailAddresses: [],
          remindAfterOverdueDays: [],
          virtualAccount: null,
          ledgerAccountSettlement: null,
        }
      }
    >
      {({
        setFieldValue,
        touched,
        errors,
        values,
      }: FormikProps<InvoiceFormValues>) => (
        <Form>
          <div className="grid max-w-[1176px] grid-cols-1 items-start gap-x-6 pt-8 mint-lg:grid-cols-2">
            <div>
              <AccountAndCounterparty
                setFieldValue={setFieldValue}
                values={values}
                counterpartyEmail={counterpartyEmail}
                setCounterpartyEmail={setCounterpartyEmail}
                setAccountCapabilities={setAccountCapabilities}
              />
              <CurrencyAndDates accountCapabilities={accountCapabilities} />
              <FieldGroup className="pb-6">
                <Label fieldConditional="Optional">Description</Label>
                <Field component={FormikInputField} name="description" />
              </FieldGroup>
              <LineItems
                setFieldValue={setFieldValue}
                values={values}
                setShowLineItemModal={setShowLineItemModal}
                setEditingLineItem={setEditingLineItem}
                setDisableLineItems={setDisableLineItems}
                setAmount={setAmount}
                showLineItemModal={showLineItemModal}
                editingLineItem={editingLineItem}
                disableLineItems={disableLineItems}
                showLas={!!showLas}
                isEditing={isEditing}
              />
              <InvoicePartyDetails
                title="Recipient Details"
                nameFieldName="recipientName"
                emailFieldName="recipientEmail"
                onEmailChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const email = e.target.value;
                  let newNotificationsEmails;
                  if (email) {
                    if (values.recipientEmail || counterpartyEmail) {
                      newNotificationsEmails = [
                        email,
                        ...values.notificationEmailAddresses.slice(1),
                      ];
                    } else {
                      newNotificationsEmails = [
                        email,
                        ...values.notificationEmailAddresses,
                      ];
                    }
                  } else if (counterpartyEmail) {
                    newNotificationsEmails = [
                      counterpartyEmail,
                      ...values.notificationEmailAddresses.slice(1),
                    ];
                  } else {
                    newNotificationsEmails =
                      values.notificationEmailAddresses.slice(1);
                  }
                  void setFieldValue(
                    "notificationEmailAddresses",
                    newNotificationsEmails,
                  );
                }}
              />
              <AddressForm
                setFieldValue={setFieldValue}
                values={values}
                setShippingSameAsBilling={setShippingSameAsBilling}
                shippingSameAsBilling={shippingSameAsBilling}
              />
              <InvoicePartyDetails
                title="Sender Details"
                phoneFieldName="issuerPhone"
                websiteFieldName="issuerWebsite"
                emailFieldName="issuerEmail"
              />
              <PaymentOptions
                setFieldValue={setFieldValue}
                values={values}
                errors={errors}
                touched={touched}
                setDisableEnablePaymentCollection={
                  setDisableEnablePaymentCollection
                }
                setDisablePaymentInitiation={setDisablePaymentInitiation}
                setShowPaymentFields={setShowPaymentFields}
                disablePaymentInitation={disablePaymentInitation}
                disableEnablePaymentCollection={disableEnablePaymentCollection}
                paymentFields={paymentFields}
                accountCapabilities={accountCapabilities}
              />
              <AdditionalOptions
                setFieldValue={setFieldValue}
                values={values}
                counterpartyEmail={counterpartyEmail}
                isEditing={isEditing}
              />
            </div>
            <InvoiceFormSummary
              currency={values.currency}
              lineItems={values.lineItems}
              includePaymentFlow={values.includePaymentFlow}
              isEdit={!!initialValues}
              autoAdvance={values.autoAdvance}
              amount={amount}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default InvoiceForm;
