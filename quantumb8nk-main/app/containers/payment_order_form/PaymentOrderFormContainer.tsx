// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { FormikProps } from "formik";
import { Button } from "~/common/ui-components";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import {
  FormValues,
  ModifiedPaymentOrderInput,
} from "../../constants/payment_order_form";
import PaymentOrderForm from "./PaymentOrderForm";

interface PaymentOrderFormContainerProps {
  paymentOrderId?: string;
  paymentOrderData?: ModifiedPaymentOrderInput;
  isEditForm: boolean;
}

function PaymentOrderFormContainer({
  paymentOrderId: initialId,
  isEditForm = false,
  paymentOrderData,
}: PaymentOrderFormContainerProps) {
  const history = useHistory();

  const urlParams = new URLSearchParams(window.location.search);
  const sourcePaymentOrderId = urlParams.get("source_payment_order_id") ?? null;
  const [paymentOrderId] = useState<string | undefined>(initialId || undefined);
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [disableCreate, setDisableCreate] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const actions = (
    <div className="flex gap-2">
      <Button onClick={() => history.push("/payment_orders")}>Cancel</Button>
      {/* Button will be disabled until all fields are filled and no errors */}
      <Button
        buttonType="primary"
        buttonHeight="medium"
        disabled={disableCreate || submitting}
        onClick={() => {
          if (formikRef.current) {
            formikRef.current.handleSubmit();
          }
        }}
      >
        {isEditForm ? "Update" : "Create"}
      </Button>
    </div>
  );

  const [createQuotesFromPOFormEnabled, loading] = useLiveConfiguration({
    featureName: "enable_create_quotes_on_po_form",
  });

  return (
    <PageHeader
      crumbs={[
        {
          name: "Payments",
          path: "/payment_orders",
        },
      ]}
      title={isEditForm ? "Edit Payment Order" : "Create Payment Order"}
      right={actions}
      loading={loading as boolean}
    >
      <PaymentOrderForm
        id={paymentOrderId}
        isEditForm={isEditForm}
        sourcePaymentOrderId={sourcePaymentOrderId}
        paymentOrderData={paymentOrderData}
        formikRef={formikRef}
        setDisableCreate={setDisableCreate}
        setSubmitting={setSubmitting}
        createQuotesFromPOFormEnabled={createQuotesFromPOFormEnabled as boolean}
      />
    </PageHeader>
  );
}

export default PaymentOrderFormContainer;
