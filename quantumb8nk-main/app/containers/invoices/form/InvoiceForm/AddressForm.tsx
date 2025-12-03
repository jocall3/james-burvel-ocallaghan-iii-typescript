// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FormikProps } from "formik";
import AddressFormSection from "../../../../components/AddressFormSection";

import { InvoiceFormValues } from "./types";

type PropTypes = {
  setFieldValue: FormikProps<InvoiceFormValues>["setFieldValue"];
  values: FormikProps<InvoiceFormValues>["values"];
  setShippingSameAsBilling: (arg: boolean) => void;
  shippingSameAsBilling: boolean;
};

export default function AddressForm({
  setFieldValue,
  values,
  setShippingSameAsBilling,
  shippingSameAsBilling,
}: PropTypes) {
  return (
    <div>
      <AddressFormSection
        id="billingAddress"
        address={values.billingAddress}
        addressType="Billing"
        onAddressChange={(address) => {
          void setFieldValue("billingAddress", address);
        }}
      />

      <AddressFormSection
        id="shippingAddress"
        address={values.shippingAddress}
        addressType="Shipping"
        onAddressChange={(address) => {
          void setFieldValue("shippingAddress", address);
        }}
        sameAsOtherAddressProps={{
          otherAddressType: "Billing",
          onSameAsOtherAddressChange: setShippingSameAsBilling,
          sameAsOtherAddress: shippingSameAsBilling,
        }}
      />

      <AddressFormSection
        id="invoicerAddress"
        address={values.invoicerAddress}
        addressType="Sender"
        onAddressChange={(address) => {
          void setFieldValue("invoicerAddress", address);
        }}
      />
    </div>
  );
}
