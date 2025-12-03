// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { FormikHelpers } from "formik";
import {
  ExternalAccountInput,
  PaymentScenarios__FieldEnum,
  FieldEntity,
  PaymentField,
  AccountDetailInput,
  RoutingDetailInput,
} from "../../../../generated/dashboard/graphqlSchema";
import { FormValues } from "../../../constants/payment_order_form";

function findAccountNumber(
  paymentField: PaymentField,
  oldAccountDetails: AccountDetailInput[],
  curIndex: number,
  setFieldValue: FormikHelpers<FormValues>["setFieldValue"],
) {
  const oldDetail = oldAccountDetails.find(
    (detail: AccountDetailInput) =>
      detail?.accountNumberType === (paymentField.type as string),
  );
  void setFieldValue(
    `additionalExternalAccountFields.accountDetails[${curIndex}]`,
    oldDetail,
  );
}

function findRoutingNumber(
  paymentField: PaymentField,
  oldRoutingDetails: RoutingDetailInput[],
  curIndex: number,
  setFieldValue: FormikHelpers<FormValues>["setFieldValue"],
) {
  const oldDetail = oldRoutingDetails.find(
    (detail: RoutingDetailInput) =>
      detail?.routingNumberType === (paymentField.type as string),
  );
  void setFieldValue(
    `additionalExternalAccountFields.routingDetails[${curIndex}]`,
    oldDetail,
  );
}

function carryOverFieldToAccount(
  carryOverValues: ExternalAccountInput,
  missingAccountRequirement: PaymentField,
  index: number,
  setFieldValue: FormikHelpers<FormValues>["setFieldValue"],
) {
  switch (missingAccountRequirement.field) {
    case PaymentScenarios__FieldEnum.PartyAddress: {
      if (carryOverValues?.partyAddress) {
        void setFieldValue(
          "additionalExternalAccountFields.partyAddress",
          carryOverValues?.partyAddress,
        );
      }
      break;
    }
    case PaymentScenarios__FieldEnum.AccountType: {
      if (carryOverValues?.accountType) {
        void setFieldValue(
          "additionalExternalAccountFields.accountType",
          carryOverValues?.accountType,
        );
      }
      break;
    }
    case PaymentScenarios__FieldEnum.PartyType: {
      if (carryOverValues?.partyType) {
        void setFieldValue(
          "additionalExternalAccountFields.partyType",
          carryOverValues?.partyType,
        );
      }
      break;
    }
    case PaymentScenarios__FieldEnum.AccountNumber: {
      if (carryOverValues?.accountDetails) {
        findAccountNumber(
          missingAccountRequirement,
          carryOverValues?.accountDetails,
          index,
          setFieldValue,
        );
      }
      break;
    }
    case PaymentScenarios__FieldEnum.RoutingNumber: {
      if (carryOverValues?.routingDetails) {
        findRoutingNumber(
          missingAccountRequirement,
          carryOverValues?.routingDetails,
          index,
          setFieldValue,
        );
      }
      break;
    }
    default:
      break;
  }
}

export function setCarryOverValuesToAccount(
  carryOverValues: ExternalAccountInput | null,
  missingAccountRequirements: Array<FieldEntity> | null | undefined,
  prevExternalAccountId: string | null,
  externalAccountId: string | null,
  setFieldValue: FormikHelpers<FormValues>["setFieldValue"],
) {
  if (
    carryOverValues &&
    prevExternalAccountId === externalAccountId &&
    missingAccountRequirements &&
    missingAccountRequirements.length > 0
  ) {
    let index = 0;
    missingAccountRequirements.forEach(
      (missingAccountRequirement: FieldEntity): void => {
        switch (missingAccountRequirement.__typename) {
          case "PaymentField": {
            carryOverFieldToAccount(
              carryOverValues,
              missingAccountRequirement,
              index,
              setFieldValue,
            );
            index += 1;
            break;
          }
          case "PaymentFieldGroup": {
            missingAccountRequirement.fields.forEach(
              (paymentField: PaymentField): void => {
                carryOverFieldToAccount(
                  carryOverValues,
                  paymentField,
                  index,
                  setFieldValue,
                );
                index += 1;
              },
            );
            break;
          }
          default:
            throw new Error("Invalid GraphQL Type");
        }
      },
    );
  }
}
