// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Formik, FormikProps } from "formik";
import { ConfirmModal } from "~/common/ui-components";
import { AccountDetailFormValues } from "./FormValues";
import AccountDetailForm, { defaultAccountDetail } from "./AccountDetailForm";

interface AddAccountDetailModalProps {
  closeModal: () => void;
  onSubmit: (data: AccountDetailFormValues) => void;
}

function AddAccountDetailModal({
  closeModal,
  onSubmit,
}: AddAccountDetailModalProps) {
  return (
    <Formik
      initialValues={defaultAccountDetail}
      onSubmit={onSubmit}
      validateOnMount
    >
      {({
        handleSubmit,
        isSubmitting,
        isValid,
      }: FormikProps<AccountDetailFormValues>) => (
        <ConfirmModal
          isOpen
          title="Add Account Detail"
          confirmText="Add"
          confirmDisabled={isSubmitting || !isValid}
          setIsOpen={closeModal}
          onConfirm={() => {
            handleSubmit();
            closeModal();
          }}
        >
          <AccountDetailForm />
        </ConfirmModal>
      )}
    </Formik>
  );
}

export default AddAccountDetailModal;
