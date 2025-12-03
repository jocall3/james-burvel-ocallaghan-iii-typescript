// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import AddressFormSection from "~/app/components/AddressFormSection";
import { FormikInputField } from "~/common/formik";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  FieldGroup,
  FieldsRow,
  FormContainer,
  Heading,
  Label,
} from "~/common/ui-components";
import { defaultAddress } from "~/common/formik/FormikAddressForm";
import {
  CurrencyEnum,
  PaymentTypeEnum,
} from "~/generated/dashboard/graphqlSchema";
import PaymentTypeFormSection from "./PaymentTypeFormSection";
import { AccountCapabilityFormValues } from "./FormValues";
import PaymentSubtypesFormSection from "./PaymentSubtypesFormSection";
import CurrenciesFormSection from "./CurrenciesFormSection";
import AccountCapabilityFormSummary from "./AccountCapabilityFormSummary";

const DEFAULT_INITIAL_VALUES: AccountCapabilityFormValues = {
  paymentType: null,
  direction: null,
  paymentSubtypes: [],
  currencies: [],
  anyCurrency: [],
  identifier: "",
  partyName: "",
  address: { ...defaultAddress },
  connectionId: "",
};

const VALIDATION_SCHEMA = (accountCurrency: CurrencyEnum) =>
  Yup.object({
    paymentType: Yup.string().nullable().required("Payment type is required"),
    direction: Yup.string().nullable().required("Direction is required"),
    currencies: Yup.array()
      .of(Yup.string())
      .min(1, "At least one currency must be provided")
      .test(
        "includes-account-currency",
        `The account currency ${accountCurrency as string} must be included`,
        (currencies) =>
          currencies ? currencies.includes(accountCurrency) : false,
      ),
  });

interface InternalAccount {
  currency: CurrencyEnum;
  bestName: string;
}

interface AccountCapabilityFormProps {
  initialValues?: AccountCapabilityFormValues;
  onSubmit: (data: AccountCapabilityFormValues) => Promise<void>;
  internalAccount: InternalAccount;
  isEdit?: boolean;
}

export default function AccountCapabilityForm({
  initialValues = DEFAULT_INITIAL_VALUES,
  onSubmit,
  internalAccount,
  isEdit = false,
}: AccountCapabilityFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={VALIDATION_SCHEMA(internalAccount.currency)}
      onSubmit={onSubmit}
    >
      {(form) => (
        <Form className="grid grid-cols-[minmax(0,2fr),1fr] gap-4">
          <FormContainer>
            {!isEdit && (
              <PaymentTypeFormSection
                form={form}
                initialValues={initialValues}
              />
            )}
            <FieldsRow columns={2}>
              <FieldGroup>
                <Label
                  helpText="For ACH, this is the ACH Company ID."
                  fieldConditional="Optional"
                >
                  Identifier
                </Label>
                <Field name="identifier" component={FormikInputField} />
              </FieldGroup>
            </FieldsRow>
            <FieldsRow columns={2}>
              <FieldGroup>
                <Label
                  helpText="This field will override legal party names on certain outgoing rails (eg. ACH or Wires)."
                  fieldConditional="Optional"
                >
                  Party Name
                </Label>
                <Field name="partyName" component={FormikInputField} />
              </FieldGroup>
            </FieldsRow>
            <CurrenciesFormSection />
            <FieldsRow columns={1}>
              <Accordion>
                <AccordionItem>
                  <>
                    <AccordionButton className="border-b px-0">
                      <div className="text-left">
                        <Heading level="h2" size="l">
                          Additional Information
                        </Heading>
                        <p className="font-base text-xs text-gray-500">
                          These fields are reserved for uncommon modifications.
                        </p>
                      </div>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel className="relative mb-4 mt-2 overflow-hidden">
                      <PaymentSubtypesFormSection form={form} />

                      <FieldsRow columns={2}>
                        <FieldGroup>
                          <Label id="connectionId" fieldConditional="Optional">
                            Vendor Connection ID
                          </Label>
                          <p className="font-base text-xs text-gray-500">
                            This field is only used to route <b>Lob-specific</b>{" "}
                            checks to the right vendor connection.
                          </p>
                          <Field
                            name="connectionId"
                            component={FormikInputField}
                            disabled={
                              form.values.paymentType !== PaymentTypeEnum.Check
                            }
                          />
                        </FieldGroup>
                      </FieldsRow>
                      <FieldsRow columns={1}>
                        <AddressFormSection
                          id="address"
                          address={form.values.address}
                          addressType="Sender"
                          subheader="For check payments, this field determines the originating address on the check."
                          onAddressChange={(address) => {
                            void form.setFieldValue("address", address);
                          }}
                        />
                      </FieldsRow>
                    </AccordionPanel>
                  </>
                </AccordionItem>
              </Accordion>
            </FieldsRow>
          </FormContainer>

          <AccountCapabilityFormSummary
            submitDisabled={form.isSubmitting}
            isEdit={isEdit}
            previewData={{
              paymentType: form.values.paymentType,
              direction: form.values.direction,
              internalAccount,
            }}
          />
        </Form>
      )}
    </Formik>
  );
}
