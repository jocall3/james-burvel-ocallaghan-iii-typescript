// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, useFormikContext } from "formik";
import { remove } from "lodash";
import React, { useEffect, useState } from "react";
import { FormValues } from "~/app/components/logical_form/LogicalTypes";
import {
  FormikInputField,
  FormikErrorMessage,
  FormikSelectField,
} from "~/common/formik";
import FormikMultiSelectField from "~/common/formik/FormikMultiSelectField";
import { GroupOptionType, OptionType } from "~/common/formik/FormikSelectField";
import {
  FieldsRow,
  FieldGroup,
  ModalContainer,
  Modal,
  ModalContent,
  Button,
  Heading,
  Icon,
  Input,
  ModalActions,
  ModalHeader,
  ModalHeading,
  ModalTitle,
  Label,
} from "~/common/ui-components";
import AutosuggestCustomIdentiferKeyField from "./AutosuggestCustomIdentifierKeyField";
import SuggestedRulesContainer, {
  SuggestedReconRule,
} from "./SuggestedRulesContainer";
import {
  buildCustomFieldLabel,
  formatCustomFieldLabel,
  formatCustomFieldValue,
} from "./utils";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";

export interface ReconciliationRuleFormType {
  name: string;
  description: string;
  strategyType: string;
  groupingParameters?: string[];
  amountVarianceType?: string | null;
  amountVarianceThreshold?: number | null;
  appliedSuggestionAtIndex?: number | null;
}

const CUSTOM_FIELDS_GROUP_LABEL = "Custom Fields";
const EXPECTED_PAYMENT_CUSTOM_IDENTIFIERS_LABEL =
  "expected_payment.custom_identifiers";
const EXPECTED_PAYMENT_COUNTERPARTY_ID_LABEL =
  "expected_payment.counterparty_id";

function SystemCondition({
  field,
  operator,
  value,
  first,
}: {
  field: string;
  operator: string;
  value: string;
  first?: boolean;
}) {
  return (
    <div className={`flex rounded-sm px-4 ${first ? "pt-6" : "pt-4"}`}>
      <div className="w-14">
        <p className="mt-1 text-right font-medium text-gray-500">{`${
          first ? "When" : "And"
        }`}</p>
      </div>
      <div className="w-full">
        <div className="pl-2 pr-12">
          <div>
            <FieldsRow gap={2} columns={3} className="!mb-2 cursor-not-allowed">
              <Input
                value={field}
                className="pointer-events-none !text-gray-400"
                onChange={() => {}}
              />
              <Input
                value={operator}
                className="pointer-events-none !text-gray-400"
                onChange={() => {}}
              />
              <Input
                value={value}
                className="pointer-events-none !text-gray-400"
                onChange={() => {}}
              />
            </FieldsRow>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReconciliationRulePreLogicalFields() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSystemConditionsHidden, setSystemConditionsHidden] =
    useState<boolean>(true);
  const [groupingParameterOptions, setGroupingParameterOptions] = useState<
    GroupOptionType[]
  >([
    {
      label: "Counterparty",
      options: [
        {
          label: "Counterparty ID",
          value: EXPECTED_PAYMENT_COUNTERPARTY_ID_LABEL,
        },
      ],
    },
    {
      label: "Custom Fields",
      options: [
        {
          label: "Custom Identifiers",
          value: EXPECTED_PAYMENT_CUSTOM_IDENTIFIERS_LABEL,
        },
      ],
    },
  ]);
  const [disabled, setDisabled] = useState<boolean>(true);

  const { values, setFieldValue } = useFormikContext<
    FormValues<ReconciliationRuleFormType> & { customFieldName?: string }
  >();

  const searchParams = new URLSearchParams(window.location.search);
  const [reconRuleSuggestionsFlag] = useLiveConfiguration({
    featureName: "transfer_recon_rule_suggestions",
  });

  const showReconRuleSuggestions =
    reconRuleSuggestionsFlag || Boolean(searchParams.get("rise"));

  // NOTE(@Paul) on 2024-05-06:
  // I added extra fields to the suggestion for things like the InternalAccount name,
  // and we need to make sure that the labels are removed before applying the
  // suggested Recon Rule.
  //
  // Linear ticket:
  // https://linear.app/moderntreasury/issue/FNPAY-2239/%5Bafter-transfer%5D-clean-up-ai-reconciliation-rule-suggestions-ui
  function removeLabels(obj: {
    field_label?: string;
    value_label?: string;
    value?: Array<{ field_label?: string; value_label?: string }>;
  }) {
    const copy = { ...obj };
    if (Array.isArray(copy.value)) {
      copy.value = copy.value.map(removeLabels);
    }
    // Delete 'field_label' and 'value_label' from the object if they exist
    delete copy.field_label;
    delete copy.value_label;
    return copy;
  }

  const handleApplyRule = (
    rule: SuggestedReconRule | undefined,
    index?: number,
  ) => {
    if (!rule) {
      void setFieldValue("conditions", []);
      void setFieldValue("name", "");
      void setFieldValue("description", "");
      void setFieldValue("strategyType", "");
    } else {
      const filteredConditions = removeLabels(rule?.conditions);
      void setFieldValue("conditions", filteredConditions);
      void setFieldValue("name", rule.name);
      void setFieldValue("appliedSuggestionAtIndex", index);
      void setFieldValue("description", rule.description);
      void setFieldValue("strategyType", rule.strategy_type);
    }
  };

  useEffect(() => {
    const groupingParameters = values?.groupingParameters;
    const customGroupingParameters: OptionType[] = [];

    if (groupingParameters) {
      groupingParameters.forEach((groupingParameter) => {
        if (groupingParameter !== EXPECTED_PAYMENT_COUNTERPARTY_ID_LABEL) {
          const customgroupingParameterLabel = buildCustomFieldLabel(
            EXPECTED_PAYMENT_CUSTOM_IDENTIFIERS_LABEL,
            groupingParameter,
          );
          customGroupingParameters.push({
            label: customgroupingParameterLabel,
            value: groupingParameter,
          });
        }
      });

      const defaultCustomGroupingParameters = groupingParameterOptions.find(
        (groupingParameterOption) =>
          groupingParameterOption.label === CUSTOM_FIELDS_GROUP_LABEL,
      );
      const updatedCustomGroupingParameters = {
        label: CUSTOM_FIELDS_GROUP_LABEL,
        options: [
          ...(defaultCustomGroupingParameters?.options || []),
          ...customGroupingParameters,
        ],
      };

      remove(
        groupingParameterOptions,
        (groupingParameterOption) =>
          groupingParameterOption.label === CUSTOM_FIELDS_GROUP_LABEL,
      );

      const updatedGroupingParameters = [
        ...groupingParameterOptions,
        updatedCustomGroupingParameters,
      ];

      setGroupingParameterOptions(updatedGroupingParameters);
    }

    // (mchaudhry05): the form should prefill only on page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const required = (value: string): string | undefined => {
    if (!value) {
      return "This field is required";
    }

    return undefined;
  };

  function validateField(value: string) {
    const validField =
      /^[a-zA-Z0-9_][a-zA-Z0-9_.[\]]*$/.test(value) && value !== "";

    setDisabled(!validField);

    return !validField
      ? "Path may only contain alphanumeric characters and “_”"
      : undefined;
  }

  function onDefinePath() {
    const formattedCustomFieldNameLabel = formatCustomFieldLabel(
      EXPECTED_PAYMENT_CUSTOM_IDENTIFIERS_LABEL,
      values.customFieldName!,
    );
    const formattedCustomFieldNameValue = formatCustomFieldValue(
      EXPECTED_PAYMENT_CUSTOM_IDENTIFIERS_LABEL,
      values.customFieldName!,
    );

    const newValues: Array<string> = values.groupingParameters
      ? [...values.groupingParameters]
      : [];
    newValues.push(formattedCustomFieldNameValue);

    const customFields = groupingParameterOptions.find(
      (fieldOptionGroupingByLabel) =>
        fieldOptionGroupingByLabel.label === CUSTOM_FIELDS_GROUP_LABEL,
    );
    customFields?.options.push({
      label: formattedCustomFieldNameLabel,
      value: formattedCustomFieldNameValue,
    });

    setGroupingParameterOptions([...groupingParameterOptions]);

    void setFieldValue("groupingParameters", newValues);
    void setFieldValue("customFieldName", null);

    setIsModalOpen(false);
  }

  const getAmountPlaceHolderText = () => {
    switch (values.strategyType) {
      case "one_to_many":
        return "is equal to";
      case "many_to_one":
        return "is equal to";
      default:
        return "is within"; // Default placeholder text
    }
  };

  const getAmountValuesText = () => {
    switch (values.strategyType) {
      case "one_to_many":
        return "Expected Payments Amount Sum";
      case "many_to_one":
        return "Expected Payment Amount";
      default:
        return "Expected Payment Amount Range";
    }
  };

  return (
    <>
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
              The selected custom attribute needs to be completed before it can
              be used in part of a rule.
            </p>
            <p className="my-4 text-xs font-medium">
              expected_payment.custom_identifiers.
              <span className="text-gray-500">
                {values.customFieldName ?? "path_to.key"}
              </span>
            </p>
            <AutosuggestCustomIdentiferKeyField
              fieldName="customFieldName"
              validateField={validateField}
              customIdentifierField
            />
            <div className="mt-4 flex flex-row-reverse">
              <div className="ml-4 w-full">
                <Button
                  fullWidth
                  buttonType="primary"
                  onClick={onDefinePath}
                  disabled={disabled}
                >
                  Define Path
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

      {showReconRuleSuggestions && (
        <SuggestedRulesContainer
          onContinue={handleApplyRule}
          continueButtonText="Apply Rule"
        />
      )}

      <FieldsRow columns={1}>
        <FieldGroup>
          <Label className="font-medium">Name</Label>
          <Field
            name="name"
            component={FormikInputField}
            placeholder="Name"
            validate={required}
          />
          <FormikErrorMessage name="name" className="text-xs" />
        </FieldGroup>
        <FieldGroup>
          <Label className="font-medium">Description</Label>
          <Field
            name="description"
            component={FormikInputField}
            placeholder="Description"
            optionalLabel="Optional"
          />
          <FormikErrorMessage name="description" className="text-xs" />
        </FieldGroup>
        <FieldGroup>
          <Label className="font-medium">Strategy Type</Label>
          <Field
            name="strategyType"
            component={FormikSelectField}
            placeholder="Strategy Type"
            options={[
              {
                label: "One Transaction to One Expected Payment",
                value: "one_to_one",
              },
              {
                label: "Many Transactions to One Expected Payment",
                value: "many_to_one",
              },
              {
                label: "One Transaction to Many Expected Payments",
                value: "one_to_many",
              },
            ]}
            validate={required}
          />
          <FormikErrorMessage name="strategyType" className="text-xs" />
        </FieldGroup>
        {values.strategyType === "one_to_many" && (
          <FieldGroup>
            <Label className="font-medium">
              Expected Payment Grouping Parameters
            </Label>
            <Field
              name="groupingParameters"
              component={FormikMultiSelectField}
              placeholder="Grouping Parameters"
              options={groupingParameterOptions}
              onChange={(
                _: string,
                selectField: { value: string; label: string },
                actionName: string,
              ) => {
                if (
                  selectField.value === "expected_payment.custom_identifiers"
                ) {
                  if (actionName === "remove-value") {
                    const newValues: Array<string> = values.groupingParameters
                      ? [...values.groupingParameters]
                      : [];
                    newValues.splice(newValues.indexOf(selectField.value), 1);
                    void setFieldValue("groupingParameters", newValues);
                  } else {
                    setIsModalOpen(true);
                  }
                } else {
                  let newValues: Array<string> = values.groupingParameters
                    ? [...values.groupingParameters]
                    : [];
                  if (actionName === "select-option") {
                    newValues.push(selectField.value);
                  } else if (actionName === "clear" || newValues.length === 1) {
                    newValues = [];
                  } else {
                    newValues.splice(newValues.indexOf(selectField.value), 1);
                  }
                  void setFieldValue("groupingParameters", newValues);
                }
              }}
            />
            <FormikErrorMessage name="groupingParameters" className="text-xs" />
          </FieldGroup>
        )}
        {values.strategyType === "one_to_many" && (
          <>
            <FieldGroup>
              <Label className="font-medium">Amount Variance Type</Label>
              <Field
                name="amountVarianceType"
                component={FormikSelectField}
                placeholder="Amount Variance Type"
                options={[
                  {
                    label: "Percentage",
                    value: "percentage",
                  },
                  {
                    label: "Fixed",
                    value: "fixed",
                  },
                ]}
              />
              <FormikErrorMessage
                name="amountVarianceType"
                className="text-xs"
              />
            </FieldGroup>
            <FieldGroup>
              <Label className="font-medium">Amount Variance Threshold</Label>
              <Field
                name="amountVarianceThreshold"
                component={FormikInputField}
                placeholder="Amount Variance Threshold"
              />
              <FormikErrorMessage
                name="amountVarianceThreshold"
                className="text-xs"
              />
            </FieldGroup>
          </>
        )}
      </FieldsRow>
      <div className="mb-8 border border-gray-100 bg-gray-50 pb-4">
        <div className="flex justify-between p-4 pb-0">
          <div>
            <Heading level="h3">System Conditions</Heading>
            <p>
              These conditions are system defaults of the reconciliation engine
              and cannot be modified.
            </p>
          </div>
          <Button
            className="mt-2.5 !justify-end"
            onClick={() => {
              setSystemConditionsHidden(!isSystemConditionsHidden);
            }}
          >
            {isSystemConditionsHidden ? "Show" : "Hide"}
          </Button>
        </div>
        <div className={isSystemConditionsHidden ? "hidden" : ""}>
          <SystemCondition
            field="Transaction Internal Account ID"
            operator="is equal to"
            value="Expected Payment Internal Account ID"
            first
          />
          <SystemCondition
            field="Transaction Currency"
            operator="is equal to"
            value="Expected Payment Currency"
          />
          <SystemCondition
            field="Transaction Direction"
            operator="is equal to"
            value="Expected Payment Direction"
          />
          {values.strategyType === "many_to_one" && (
            <SystemCondition
              field="Transaction As of Date"
              operator="is within"
              value="Expected Payment Date Range"
            />
          )}
          <SystemCondition
            field="Transaction Amount"
            operator={getAmountPlaceHolderText()}
            value={getAmountValuesText()}
          />
        </div>
      </div>
    </>
  );
}

export default ReconciliationRulePreLogicalFields;
