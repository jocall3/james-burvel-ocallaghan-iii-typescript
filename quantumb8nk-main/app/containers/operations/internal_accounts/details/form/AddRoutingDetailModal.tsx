// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Formik, FormikProps } from "formik";
import { ConfirmModal } from "~/common/ui-components";
import { RoutingDetailFormValues } from "./FormValues";
import RoutingDetailForm, { defaultRoutingDetail } from "./RoutingDetailForm";

interface AddRoutingDetailModalProps {
  closeModal: () => void;
  onSubmit: (data: RoutingDetailFormValues) => void;
}

function AddRoutingDetailModal({
  closeModal,
  onSubmit,
}: AddRoutingDetailModalProps) {
  return (
    <Formik
      initialValues={defaultRoutingDetail}
      onSubmit={(data: RoutingDetailFormValues) => {
        onSubmit(data);
      }}
      validateOnMount
    >
      {({
        handleSubmit,
        isSubmitting,
        isValid,
      }: FormikProps<RoutingDetailFormValues>) => (
        <ConfirmModal
          isOpen
          title="Add Routing Detail"
          confirmText="Add"
          confirmDisabled={isSubmitting || !isValid}
          setIsOpen={closeModal}
          onConfirm={() => {
            handleSubmit();
            closeModal();
          }}
        >
          <RoutingDetailForm />
        </ConfirmModal>
      )}
    </Formik>
  );
}

export default AddRoutingDetailModal;
