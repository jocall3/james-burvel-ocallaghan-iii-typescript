// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { useFormikContext } from "formik";
import { find, get } from "lodash";
import { FormValues } from "~/app/components/logical_form/LogicalTypes";
import { GroupOptionType, OptionType } from "~/common/formik/FormikSelectField";
import {
  Button,
  Heading,
  Icon,
  Modal,
  ModalActions,
  ModalContainer,
  ModalContent,
  ModalHeader,
  ModalHeading,
  ModalTitle,
} from "~/common/ui-components";
import {
  LogicalForm__MethodNameEnum,
  LogicalForm__ModelNameEnum,
  SelectSimpleOption,
} from "~/generated/dashboard/graphqlSchema";
import { formatCustomFieldLabel, formatCustomFieldValue } from "./utils";
import AutosuggestCustomIdentiferKeyField from "./AutosuggestCustomIdentifierKeyField";

const CUSTOM_FIELD_NAME_MAP: Record<string, string> = {
  [LogicalForm__MethodNameEnum.TransactionDetailsPathToKey]:
    "transaction.details",
  [LogicalForm__MethodNameEnum.TransactionIncomingPaymentDetailDataPathToKey]:
    "transaction.incoming_payment_detail.data",
  [LogicalForm__MethodNameEnum.ExpectedPaymentCustomIdentifiersKey]:
    "expected_payment.custom_identifiers",
  [LogicalForm__MethodNameEnum.TransactionCustomIdentifiersKey]:
    "transaction.custom_identifiers",
};

const CUSTOM_FIELDS_GROUP_LABEL = "Custom Fields";

export const reconcilableSchemaCustomFieldCallback = (
  modelName: LogicalForm__ModelNameEnum,
  fieldOptions: GroupOptionType[],
  currentOption: SelectSimpleOption,
  setCustomFieldName: (customFieldName: string) => void,
  setIsModalOpen: (isModalOpen: boolean) => void,
) => {
  const isCustomField =
    modelName === LogicalForm__ModelNameEnum.Reconcilable &&
    get(
      find(fieldOptions, { label: CUSTOM_FIELDS_GROUP_LABEL }),
      "options",
      [],
    ).find(
      (fieldOption: SelectSimpleOption) =>
        fieldOption.value === currentOption.value,
    );

  if (isCustomField) {
    setCustomFieldName(currentOption.value);
    setIsModalOpen(true);
  }
};

export const overrideReconcilableSchemaCustomMethodName = (
  modelName: string,
  methodName: string,
) => {
  if (modelName === LogicalForm__ModelNameEnum.Reconcilable && methodName) {
    if (
      methodName.includes("transaction.details") ||
      methodName.includes("transaction_details")
    ) {
      return LogicalForm__MethodNameEnum.TransactionDetailsPathToKey;
    }
    if (
      methodName.includes("transaction.incoming_payment_detail.data") ||
      methodName.includes("transaction_incoming_payment_detail_data")
    ) {
      return LogicalForm__MethodNameEnum.TransactionIncomingPaymentDetailDataPathToKey;
    }
    if (
      methodName.includes("transaction.custom_identifiers") ||
      methodName.includes("transaction_custom_identifiers")
    ) {
      return LogicalForm__MethodNameEnum.TransactionCustomIdentifiersKey;
    }
    if (
      methodName.includes("expected_payment.custom_identifiers") ||
      methodName.includes("expected_payment_custom_identifiers")
    )
      return LogicalForm__MethodNameEnum.ExpectedPaymentCustomIdentifiersKey;
  }

  return null;
};

interface ReconciliationRuleCustomFieldModalProps {
  customFieldName: string;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  fieldName: string;
  operatorName: string;
  operatorNegate: string;
  valuePath: string;
  options: GroupOptionType[];
  setOptions: (options: OptionType[] | GroupOptionType[]) => void;
}

function ReconciliationRuleCustomFieldModal({
  customFieldName,
  isModalOpen,
  setIsModalOpen,
  fieldName,
  operatorName,
  operatorNegate,
  valuePath,
  options,
  setOptions,
}: ReconciliationRuleCustomFieldModalProps) {
  const [disabled, setDisabled] = useState<boolean>(true);
  const { setFieldValue, values } = useFormikContext<
    FormValues & { customFieldName?: string }
  >();

  function onConfirm() {
    const formattedCustomFieldNameValue = formatCustomFieldValue(
      CUSTOM_FIELD_NAME_MAP[customFieldName],
      values.customFieldName!,
    );

    const formattedCustomFieldNameLabel = formatCustomFieldLabel(
      CUSTOM_FIELD_NAME_MAP[customFieldName],
      values.customFieldName!,
    );

    if (options.length > 0) {
      const customFields = options.find(
        (fieldOptionGroupingByLabel) =>
          fieldOptionGroupingByLabel.label === CUSTOM_FIELDS_GROUP_LABEL,
      );
      customFields?.options.push({
        label: formattedCustomFieldNameLabel,
        value: formattedCustomFieldNameValue as LogicalForm__MethodNameEnum,
      });

      setOptions([...options]);
    }

    void setFieldValue(fieldName, formattedCustomFieldNameValue);
    void setFieldValue(operatorName, null);
    void setFieldValue(operatorNegate, null);
    void setFieldValue(valuePath, null);

    void setFieldValue("customFieldName", null);
    setIsModalOpen(false);
  }

  function validateField(value: string) {
    const validField =
      /^[a-zA-Z0-9_][a-zA-Z0-9_.[\]]*$/.test(value) && value !== "";

    setDisabled(!validField);

    return !validField
      ? "Path may only contain alphanumeric characters and “_”"
      : undefined;
  }

  return (
    <Modal
      title="Define Path"
      isOpen={isModalOpen}
      onRequestClose={() => setIsModalOpen(false)}
      className="rounded-sm bg-white outline-none"
    >
      <ModalContainer className="rounded-sm border-b-0">
        <ModalHeader className=" border-none pb-0">
          <ModalHeading>
            <ModalTitle>
              <Heading level="h3" size="l">
                Define Path
              </Heading>
            </ModalTitle>
          </ModalHeading>
          <ModalActions>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                void setFieldValue(fieldName, null);
              }}
              buttonType="text"
            >
              <Icon
                iconName="clear"
                color="currentColor"
                className="text-gray-400"
              />
            </Button>
          </ModalActions>
        </ModalHeader>
        <ModalContent className="h-fit">
          <p className="mt-2 text-xs text-gray-700">
            The selected custom attribute needs to be completed before it can be
            used in part of a rule.
          </p>
          <p className="my-4 text-xs font-medium">
            {CUSTOM_FIELD_NAME_MAP[customFieldName]}.
            <span className="text-gray-500">
              {values.customFieldName ?? "path_to.key"}
            </span>
          </p>
          <AutosuggestCustomIdentiferKeyField
            fieldName="customFieldName"
            validateField={validateField}
            customIdentifierField={
              CUSTOM_FIELD_NAME_MAP[customFieldName] ===
              "expected_payment.custom_identifiers"
            }
          />
          <div className="mt-4 flex flex-row-reverse">
            <div className="ml-4 w-full">
              <Button
                fullWidth
                buttonType="primary"
                onClick={onConfirm}
                disabled={disabled}
              >
                Define Path
              </Button>
            </div>
            <div className="w-full">
              <Button
                fullWidth
                buttonType="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  void setFieldValue(fieldName, null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
}

export default ReconciliationRuleCustomFieldModal;
