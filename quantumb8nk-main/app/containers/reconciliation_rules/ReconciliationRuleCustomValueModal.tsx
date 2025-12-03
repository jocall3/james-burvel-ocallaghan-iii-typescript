// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { useFormikContext } from "formik";
import { FormValues } from "~/app/components/logical_form/LogicalTypes";
import { OptionType } from "~/common/formik/FormikSelectField";
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
import { LogicalForm__MethodNameEnum } from "~/generated/dashboard/graphqlSchema";
import {
  formatCustomFieldLabel,
  formatCustomFieldValue,
  methodNameWithoutPathToKey,
} from "./utils";
import AutosuggestCustomIdentiferKeyField from "./AutosuggestCustomIdentifierKeyField";

interface ReconciliationRuleCustomValueModalProps {
  customFieldValue: string;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  valuePath: string;
  options: OptionType[];
  setOptions: (options: OptionType[]) => void;
}

function ReconciliationRuleCustomValueModal({
  customFieldValue,
  isModalOpen,
  setIsModalOpen,
  valuePath,
  options,
  setOptions,
}: ReconciliationRuleCustomValueModalProps) {
  const [disabled, setDisabled] = useState<boolean>(true);
  const { setFieldValue, values } = useFormikContext<
    FormValues & { customFieldValue?: string }
  >();

  const customStringMatch = customFieldValue.includes("match");

  function onConfirm() {
    const customFieldValueWithoutPathToKey =
      methodNameWithoutPathToKey(customFieldValue);

    const formattedCustomFieldValue = customStringMatch
      ? values.customFieldValue!
      : formatCustomFieldValue(
          customFieldValueWithoutPathToKey,
          values.customFieldValue!,
        );
    const formattedCustomFieldValueLabel = customStringMatch
      ? `"${values.customFieldValue!}"`
      : formatCustomFieldLabel(
          customFieldValueWithoutPathToKey,
          values.customFieldValue!,
        );

    setOptions([
      ...(options || []),
      {
        label: formattedCustomFieldValueLabel,
        value: formattedCustomFieldValue as LogicalForm__MethodNameEnum,
      },
    ]);

    void setFieldValue(valuePath, formattedCustomFieldValue);

    void setFieldValue("customFieldValue", null);
    setIsModalOpen(false);
  }

  function validateField(value: string) {
    if (customStringMatch) {
      const validField = value !== "";

      setDisabled(!validField);

      return !validField
        ? "Path may only contain alphanumeric characters and “_”"
        : undefined;
    }
    const validField =
      /^[a-zA-Z0-9_][a-zA-Z0-9_.[\]]*$/.test(value) && value !== "";

    setDisabled(!validField);

    return !validField
      ? "Path may only contain alphanumeric characters and “_”"
      : undefined;
  }

  return (
    <Modal
      title={customStringMatch ? "Define Text to Match" : "Define Path"}
      isOpen={isModalOpen}
      onRequestClose={() => setIsModalOpen(false)}
      className="rounded-sm bg-white outline-none"
    >
      <ModalContainer className="rounded-sm border-b-0">
        <ModalHeader className=" border-none pb-0">
          <ModalHeading>
            <ModalTitle>
              <Heading level="h3" size="l">
                {customStringMatch ? "Define Text to Match" : "Define Path"}
              </Heading>
            </ModalTitle>
          </ModalHeading>
          <ModalActions>
            <Button onClick={() => setIsModalOpen(false)} buttonType="text">
              <Icon
                iconName="clear"
                color="currentColor"
                className="text-gray-400"
              />
            </Button>
          </ModalActions>
        </ModalHeader>
        <ModalContent>
          <p className="mt-2 text-xs text-gray-700">
            The selected custom attribute needs to be completed before it can be
            used in part of a rule.
          </p>
          <p className="my-4 text-xs font-medium">
            {!customStringMatch &&
              `${customFieldValue
                .replace(".path_to", "")
                .replace(".key", "")}.`}
            <span className="text-gray-500">
              {!customStringMatch
                ? values.customFieldValue ?? "path_to.key"
                : `"${values.customFieldValue ?? "match_text"}"`}
            </span>
          </p>
          <AutosuggestCustomIdentiferKeyField
            fieldName="customFieldValue"
            validateField={validateField}
            customIdentifierField={
              methodNameWithoutPathToKey(customFieldValue) ===
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
                {customStringMatch ? "Define Text to Match" : "Define Path"}
              </Button>
            </div>
            <div className="w-full">
              <Button
                fullWidth
                buttonType="secondary"
                onClick={() => setIsModalOpen(false)}
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

export default ReconciliationRuleCustomValueModal;
