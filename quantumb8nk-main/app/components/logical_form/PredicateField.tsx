// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState } from "react";
import { Field, useFormikContext } from "formik";
import { get, isEmpty } from "lodash";
import ReconciliationRuleCustomFieldModal, {
  reconcilableSchemaCustomFieldCallback,
  overrideReconcilableSchemaCustomMethodName,
} from "~/app/containers/reconciliation_rules/ReconciliationRuleCustomFieldModal";
import { buildCustomFieldLabel } from "~/app/containers/reconciliation_rules/utils";
import {
  LogicalFormKeyEnum,
  LogicalForm__MethodNameEnum,
  LogicalForm__ModelNameEnum,
  Operator,
  PredicateFieldQuery,
  SelectOption,
  usePredicateFieldQuery,
} from "../../../generated/dashboard/graphqlSchema";
import FormikSelectField, {
  GroupOptionType,
  OptionType,
} from "../../../common/formik/FormikSelectField";
import { FormValues } from "./LogicalTypes";

const CUSTOM_FIELDS_GROUP_LABEL = "Custom Fields";

function formatFieldOptions(
  logicalFormFields: PredicateFieldQuery["logicalFormFields"] | undefined,
) {
  const groupLabelToFieldOptions: Record<string, SelectOption[]> = {};

  const fieldOptions = logicalFormFields?.map((field) => {
    const fieldOption = {
      label: field.prettyMethodName,
      value: field.methodName,
    };
    const groupLabel = field?.viewOptions?.selectView?.groupLabel;
    if (groupLabel) {
      const updatedFieldOptions =
        groupLabel in groupLabelToFieldOptions
          ? [...groupLabelToFieldOptions[groupLabel], fieldOption]
          : [fieldOption];
      groupLabelToFieldOptions[groupLabel] = updatedFieldOptions;
    }

    return fieldOption;
  });

  if (isEmpty(groupLabelToFieldOptions)) {
    return fieldOptions;
  }
  return Object.entries(groupLabelToFieldOptions).map(([label, options]) => ({
    label,
    options,
  }));
}

interface PredicateFieldProps {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  formikPath: string;
  setOperators: (operators: Array<Operator>) => void;
}

function PredicateField({
  logicalFormKey,
  modelName,
  formikPath,
  setOperators,
}: PredicateFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<OptionType[] | GroupOptionType[]>();
  const [customFieldName, setCustomFieldName] = useState<string>("");

  const { setFieldValue, values } = useFormikContext<FormValues>();

  const { loading, data } = usePredicateFieldQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      logicalFormKey,
      modelName,
    },
  });

  const logicalFormFields = data?.logicalFormFields;

  const fieldOptions = formatFieldOptions(logicalFormFields) || [];

  const fieldName = `${formikPath}.field`;
  const operatorName = `${formikPath}.operator`;
  const operatorNegate = `${formikPath}.negate`;
  const valuePath = `${formikPath}.value`;

  const curField = get(values, fieldName) as string;
  useEffect(() => {
    if (!loading && logicalFormFields != null) {
      const overriddenMethodName = overrideReconcilableSchemaCustomMethodName(
        modelName,
        curField,
      );

      if (overriddenMethodName) {
        const customFields = (fieldOptions as GroupOptionType[]).find(
          (fieldOptionGroupingByLabel) =>
            fieldOptionGroupingByLabel.label === CUSTOM_FIELDS_GROUP_LABEL,
        );

        const curCustomFieldLabel = buildCustomFieldLabel(
          overriddenMethodName,
          curField,
        );

        customFields?.options.push({
          label: curCustomFieldLabel,
          value: curField as LogicalForm__MethodNameEnum,
        });

        setOptions([...(fieldOptions as GroupOptionType[])]);
        void setFieldValue(fieldName, curField);
      }

      setOperators(
        logicalFormFields.find(
          (field) =>
            field.methodName === curField ||
            field.methodName === overriddenMethodName,
        )?.operators ?? [],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, logicalFormFields, loading, setOperators, curField]);

  if (loading || logicalFormFields == null) {
    return null;
  }

  return (
    <>
      <ReconciliationRuleCustomFieldModal
        customFieldName={customFieldName}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        fieldName={fieldName}
        operatorName={operatorName}
        operatorNegate={operatorNegate}
        valuePath={valuePath}
        options={fieldOptions as GroupOptionType[]}
        setOptions={setOptions}
      />
      <Field
        id={fieldName}
        name={fieldName}
        component={FormikSelectField}
        options={options || fieldOptions}
        onChange={(option: OptionType): void => {
          void setFieldValue(fieldName, option.value);
          void setFieldValue(operatorName, null);
          void setFieldValue(operatorNegate, null);
          void setFieldValue(valuePath, null);

          reconcilableSchemaCustomFieldCallback(
            modelName,
            fieldOptions as GroupOptionType[],
            option,
            setCustomFieldName,
            setIsModalOpen,
          );
        }}
      />
    </>
  );
}

export default PredicateField;
