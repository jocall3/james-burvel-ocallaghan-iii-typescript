// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState } from "react";
import { FieldArray, useFormikContext } from "formik";
import * as Sentry from "@sentry/browser";
import { FormValues } from "../../../constants/payment_order_form";
import {
  PaymentTypeEnum,
  useMissingAccountRequirementsModalMutation,
  MissingAccountRequirementsModalMutation,
  PaymentScenarios__EntityTypeEnum,
  ExternalAccountInput,
} from "../../../../generated/dashboard/graphqlSchema";
import { ConfirmModal } from "../../../../common/ui-components";
import DynamicField from "./DynamicField";
import DynamicFieldGroup from "./DynamicFieldGroup";
import { setCarryOverValuesToAccount } from "./MissingAccountRequirementsUtils";

interface MissingAccountRequirementsModalProps {
  externalAccountId: string;
  originatingAccountId: string;
  paymentType: PaymentTypeEnum;
  handleModalClose: () => void;
  handleModalConfirm: () => void;
  prevExternalAccountId: string | null;
  carryOverValues: ExternalAccountInput | null;
}

function MissingAccountRequirementsModal({
  externalAccountId,
  originatingAccountId,
  paymentType,
  handleModalClose,
  handleModalConfirm,
  prevExternalAccountId,
  carryOverValues,
}: MissingAccountRequirementsModalProps) {
  const { errors, touched, handleBlur, setFieldValue } =
    useFormikContext<FormValues>();

  const [missingAccountRequirementsModal] =
    useMissingAccountRequirementsModalMutation();
  const [missingRequirements, setMissingRequirements] = useState<
    MissingAccountRequirementsModalMutation | null | undefined
  >(null);

  useEffect(() => {
    missingAccountRequirementsModal({
      variables: {
        input: {
          externalAccountId,
          originatingAccountId,
          paymentType,
        },
      },
    })
      .then(({ data }) => {
        setMissingRequirements(data);
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  }, [
    missingAccountRequirementsModal,
    externalAccountId,
    originatingAccountId,
    paymentType,
    setMissingRequirements,
  ]);

  const missingAccountRequirements =
    missingRequirements?.missingAccountRequirements?.missingRequirements;

  const canUpdateExternalAccount =
    missingRequirements?.missingAccountRequirements?.externalAccount
      ?.canUpdate ?? false;

  useEffect(() => {
    setCarryOverValuesToAccount(
      carryOverValues,
      missingAccountRequirements,
      prevExternalAccountId,
      externalAccountId,
      setFieldValue,
    );
  }, [
    carryOverValues,
    missingAccountRequirements,
    prevExternalAccountId,
    externalAccountId,
    setFieldValue,
  ]);

  const isMissingRequirements =
    missingAccountRequirements &&
    missingAccountRequirements.some(
      (missingField) =>
        missingField.typename === "PaymentFieldGroup" ||
        (missingField.typename === "PaymentField" && missingField.required),
    );

  if (!(isMissingRequirements && canUpdateExternalAccount)) {
    return null;
  }

  // The flattenedIndex represents the index of all fields including the nested fields in PaymentFieldGroups
  // For Account and Routing Details we store them as separate arrays using flattenedIndex to ensure the index is unique
  // Formik automatically fills in the extra spaces in the arrays with undefined and we filter that
  let flattenedIndex = 0;
  const fieldList = missingAccountRequirements.map(
    (fieldEntity): JSX.Element => {
      switch (fieldEntity.typename) {
        case "PaymentField": {
          const entityTypeRoute =
            fieldEntity?.entityType ===
            PaymentScenarios__EntityTypeEnum.AccountDetail
              ? "accountDetails"
              : "routingDetails";
          const fieldComponent = (
            <DynamicField
              key={`${fieldEntity.field}_${
                fieldEntity.type ?? ""
              }_${paymentType}`}
              fieldName={`additionalExternalAccountFields.${entityTypeRoute}`}
              paymentField={fieldEntity}
              handleBlur={handleBlur}
              flattenedIndex={flattenedIndex}
            />
          );

          flattenedIndex += 1;
          return fieldComponent;
        }
        case "PaymentFieldGroup": {
          const fieldComponent = (
            <DynamicFieldGroup
              key={`${fieldEntity.fields[0].field}_${
                fieldEntity.fields[0].type ?? ""
              }_${paymentType}`}
              fieldName="additionalExternalAccountFields"
              paymentFieldGroup={fieldEntity}
              handleBlur={handleBlur}
              flattenedIndex={flattenedIndex}
            />
          );

          flattenedIndex += fieldEntity.fields.length;
          return fieldComponent;
        }
        default:
          throw new Error("Invalid GraphQL Type");
      }
    },
  );

  return (
    <ConfirmModal
      title="Counterparty Missing Fields"
      isOpen
      disableExitFromOutsideClick
      confirmText="Update Counterparty"
      onConfirm={handleModalConfirm}
      confirmType="confirm"
      confirmDisabled={
        touched?.additionalExternalAccountFields == null ||
        errors?.additionalExternalAccountFields != null
      }
      setIsOpen={handleModalClose}
      bodyClassName="max-h-[692px] max-w-[600px] overflow-y-auto"
    >
      <div className="flex flex-col">
        <p className="pb-4 text-sm font-normal">
          Please enter the missing counterparty information for{" "}
          <span className="text-sm font-medium">
            {
              missingRequirements?.missingAccountRequirements?.externalAccount
                ?.partyName
            }
          </span>{" "}
          to complete this payment.
        </p>
        <FieldArray
          name="additionalExternalAccountFields.routingDetails"
          render={() => fieldList}
        />
      </div>
    </ConfirmModal>
  );
}

export default MissingAccountRequirementsModal;
