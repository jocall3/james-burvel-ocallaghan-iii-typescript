// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { FormValues } from "../../../constants/payment_order_form";
import {
  AccountDetailInput,
  ExternalAccountInput,
  RoutingDetailInput,
} from "../../../../generated/dashboard/graphqlSchema";
import MissingAccountRequirementsModal from "./MissingAccountRequirementsModal";

function cleanAccountDetails(
  accountDetails: AccountDetailInput[],
): AccountDetailInput[] {
  return accountDetails.filter(
    (accountDetail: AccountDetailInput) => accountDetail?.accountNumber,
  );
}

function cleanRoutingDetails(
  routingDetails: RoutingDetailInput[],
): RoutingDetailInput[] {
  return routingDetails.filter(
    (routingDetail: RoutingDetailInput) => routingDetail?.routingNumber,
  );
}

function MissingAccountRequirementsModalContainer() {
  const [showModal, setShowModal] = useState<boolean>(false);

  const {
    setFieldValue,
    setFieldTouched,
    values: {
      paymentType,
      originatingAccountId,
      receivingAccountId,
      additionalExternalAccountFields,
    },
  } = useFormikContext<FormValues>();

  const clearMissingAccountRequirements = useCallback((): void => {
    void setFieldValue("additionalExternalAccountFields.partyAddress", {});
    void setFieldTouched("additionalExternalAccountFields.partyAddress", false);
    void setFieldValue("additionalExternalAccountFields.routingDetails", []);
    void setFieldTouched(
      "additionalExternalAccountFields.routingDetails",
      false,
    );
    void setFieldValue("additionalExternalAccountFields.accountDetails", []);
    void setFieldTouched(
      "additionalExternalAccountFields.accountDetails",
      false,
    );
    void setFieldValue("additionalExternalAccountFields.partyType", undefined);
    void setFieldTouched("additionalExternalAccountFields.partyType", false);
    void setFieldValue(
      "additionalExternalAccountFields.accountType",
      undefined,
    );
    void setFieldTouched("additionalExternalAccountFields.accountType", false);
  }, [setFieldValue, setFieldTouched]);

  const [prevExternalAccountId, setPrevExternalAccountId] = useState<
    string | null
  >(null);
  const [carryOverValues, setCarryOverValues] =
    useState<ExternalAccountInput | null>(null);

  useEffect((): void => {
    if (prevExternalAccountId !== receivingAccountId) {
      setCarryOverValues(null);
    }
  }, [prevExternalAccountId, receivingAccountId]);

  useEffect((): void => {
    if (
      paymentType != null &&
      originatingAccountId != null &&
      receivingAccountId != null
    ) {
      clearMissingAccountRequirements();
      setShowModal(true);
    }
  }, [
    clearMissingAccountRequirements,
    paymentType,
    originatingAccountId,
    receivingAccountId,
  ]);

  // We need these required fields to know if fields are missing from the Receiving Account
  if (
    !paymentType ||
    !originatingAccountId ||
    additionalExternalAccountFields == null ||
    !receivingAccountId
  ) {
    return null;
  }

  if (!showModal) {
    return null;
  }

  return (
    <MissingAccountRequirementsModal
      externalAccountId={receivingAccountId}
      originatingAccountId={originatingAccountId}
      prevExternalAccountId={prevExternalAccountId}
      carryOverValues={carryOverValues}
      paymentType={paymentType}
      handleModalClose={(): void => {
        clearMissingAccountRequirements();
        setShowModal(false);
      }}
      handleModalConfirm={(): void => {
        // For Account and Routing Details we store them as separate arrays using one flattened index with all the
        // fields in missingAccountRequirements including nested group fields.
        // Formik automatically fills in the extra spaces in the arrays with undefined and we filter those here.
        void setFieldValue(
          "additionalExternalAccountFields.routingDetails",
          cleanRoutingDetails(
            additionalExternalAccountFields?.routingDetails ?? [],
          ),
        );
        void setFieldValue(
          "additionalExternalAccountFields.accountDetails",
          cleanAccountDetails(
            additionalExternalAccountFields?.accountDetails ?? [],
          ),
        );
        setShowModal(false);
        setPrevExternalAccountId(receivingAccountId);
        setCarryOverValues(additionalExternalAccountFields);
      }}
    />
  );
}

export default MissingAccountRequirementsModalContainer;
