// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState } from "react";
import { Field, FormikHelpers, useFormikContext } from "formik";
import { get } from "lodash";
import ReconciliationRuleCustomValueModal from "~/app/containers/reconciliation_rules/ReconciliationRuleCustomValueModal";
import { overrideReconcilableSchemaCustomMethodName } from "~/app/containers/reconciliation_rules/ReconciliationRuleCustomFieldModal";
import AccountSelect from "~/app/containers/AccountSelect";
import { buildCustomFieldLabel } from "~/app/containers/reconciliation_rules/utils";
import { FormikDateInput } from "~/common/formik";
import {
  LogicalFormKeyEnum,
  LogicalForm__InputTypeEnum,
  LogicalForm__MethodNameEnum,
  LogicalForm__ModelNameEnum,
  LogicalForm__OperatorEnum,
  usePredicateValueQuery,
} from "../../../generated/dashboard/graphqlSchema";
import FormikSelectField, {
  OptionType,
} from "../../../common/formik/FormikSelectField";
import { FormValues, Predicate } from "./LogicalTypes";
import PredicatePaginatedValue from "./PredicatePaginatedValue";
import FormikInputField from "../../../common/formik/FormikInputField";
import FormikNumberFormatField from "../../../common/formik/FormikNumberFormatField";
import FormikMultiSelectField from "../../../common/formik/FormikMultiSelectField";
import MetadataInput, {
  LegacyMetadata,
  formatLegacyMetadata,
  parseLegacyMetadata,
} from "../MetadataInput";
import MultiAccountSelect, {
  AllAccountsSelectionBehaviorEnum,
} from "../../containers/MultiAccountSelect";
import CounterpartySelect from "../../containers/CounterpartySelect";
import { SelectAction, SelectValue } from "../../../common/ui-components";
import MultiUserSelect from "../MultiUserSelect";
import {
  EXPECTED_PAYMENT,
  PAYMENT_ORDER,
  ResourcesEnum,
  TRANSACTION,
  EXTERNAL_ACCOUNT,
  RECONCILIATION_RULE_PREVIEW_TRANSACTION,
  INVOICE,
  COUNTERPARTY,
  INTERNAL_ACCOUNT,
  PAPER_ITEM,
  VIRTUAL_ACCOUNT,
  RECONCILIATION_RULE,
} from "../../../generated/dashboard/types/resources";
import FormikSanitizedCurrencyInput from "../../../common/formik/FormikSanitizedCurrencyInput";

const computeAccountSelectValue = (
  selectField: { value: string; label: string },
  actionName: string,
  values: FormValues,
  valuePath: string,
  setFieldValue: FormikHelpers<FormValues>["setFieldValue"],
) => {
  if (!selectField) return;

  const currentValue = get(values, valuePath) as string[];
  let newValue: Array<string>;
  if (actionName === "remove-value") {
    newValue = currentValue
      ? currentValue.filter((v) => v !== selectField.value)
      : [];
  } else {
    newValue = !currentValue
      ? [selectField.value]
      : [...currentValue, selectField.value];
  }
  void setFieldValue(valuePath, newValue);
};

const CUSTOM_IDENTIFIER_GROUP_OPTION_LABEL = "Custom Identifier";
const KEYWORDS_FOR_CUSTOM_FIELD = ["key", "custom", "match"];

export const computeMultiUserSelectValue = (
  selectValues: SelectValue | SelectValue[],
  selectAction: SelectAction,
  values: object,
  valuePath: string,
  setFieldValue: FormikHelpers<object>["setFieldValue"],
) => {
  let newValue: Array<string> | undefined;
  const currentValue = get(values, valuePath) as string[];
  if (selectAction.action === "remove-value") {
    newValue = currentValue
      ? currentValue.filter(
          (v) =>
            v !==
            (
              selectAction as unknown as {
                removedValue: SelectValue;
              }
            ).removedValue.value,
        )
      : [];
  } else if (selectAction.action === "clear") {
    newValue = undefined;
  } else if (Array.isArray(selectValues)) {
    newValue = !currentValue
      ? [...new Set(selectValues.map((v) => v.value as string))]
      : [
          ...new Set([
            ...currentValue,
            ...selectValues.map((v) => v.value as string),
          ]),
        ];
  } else {
    newValue = !currentValue
      ? [selectValues.value as string]
      : [...new Set([...currentValue, selectValues.value as string])];
  }
  void setFieldValue(valuePath, newValue);
};

interface PredicateValueProps {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  formikPath: string;
  methodName: LogicalForm__MethodNameEnum;
  operatorName: LogicalForm__OperatorEnum;
}

// TODO(stephane-mt): we should be using `resources` which are used across the app
// rather than redeclaring a custom string for the model.
const modelNameToResource: Record<
  LogicalForm__ModelNameEnum,
  ResourcesEnum | undefined
> = {
  PaymentOrder: PAYMENT_ORDER,
  ExpectedPayment: EXPECTED_PAYMENT,
  Transaction: TRANSACTION,
  Quote: undefined,
  Reconcilable: undefined,
  ExternalAccount: EXTERNAL_ACCOUNT,
  ReconciliationRulePreviewTransaction: RECONCILIATION_RULE_PREVIEW_TRANSACTION,
  Invoice: INVOICE,
  Counterparty: COUNTERPARTY,
  InternalAccount: INTERNAL_ACCOUNT,
  PaperItem: PAPER_ITEM,
  VirtualAccount: VIRTUAL_ACCOUNT,
  ReconciliationRule: RECONCILIATION_RULE,
};

function PredicateValue({
  logicalFormKey,
  modelName,
  formikPath,
  methodName,
  operatorName,
}: PredicateValueProps): JSX.Element | null {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<OptionType[]>();
  const [customFieldValue, setCustomFieldValue] = useState<string>("");

  const { setFieldValue, values } = useFormikContext<FormValues>();

  const curPredicate = get(values, formikPath) as Predicate;

  const overriddenMethodName = overrideReconcilableSchemaCustomMethodName(
    modelName,
    methodName,
  );

  const { loading, data } = usePredicateValueQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      logicalFormKey,
      modelName,
      methodName: overriddenMethodName || methodName,
      operatorName,
    },
  });

  const valuePath = `${formikPath}.value`;

  const isDisabled =
    curPredicate?.field == null ||
    curPredicate?.operator == null ||
    curPredicate?.negate == null;

  const logicalFormInputType = data?.logicalFormInputType;
  const inputType = logicalFormInputType?.inputType;
  const valueOptions = logicalFormInputType?.enumValues?.map((enumValue) => ({
    label: enumValue?.prettyValueName,
    value: enumValue?.valueName,
  }));

  useEffect(() => {
    const curValue = curPredicate?.value as string;

    if (
      modelName === LogicalForm__ModelNameEnum.Reconcilable &&
      (overriddenMethodName ||
        methodName ===
          LogicalForm__MethodNameEnum.TransactionVendorDescription ||
        methodName ===
          LogicalForm__MethodNameEnum.TransactionVendorCustomerId ||
        methodName === LogicalForm__MethodNameEnum.TransactionId ||
        methodName ===
          LogicalForm__MethodNameEnum.TransactionPaperItemLockboxNumber) &&
      curValue &&
      valueOptions
    ) {
      const matchCurValueToValueOptions = valueOptions.filter((valueOption) =>
        curValue.includes(
          valueOption.value.replace(".path_to", "").replace(".key", ""),
        ),
      );

      const curFieldNameLabel =
        matchCurValueToValueOptions.length === 0
          ? `"${curValue}"`
          : buildCustomFieldLabel(
              matchCurValueToValueOptions[0].value,
              curValue,
            );

      const exactMatch =
        valueOptions.filter((valueOption) => curValue === valueOption.value)
          .length === 1;

      if (!exactMatch) {
        setOptions([
          ...(valueOptions || []),
          {
            label: curFieldNameLabel,
            value: curValue as LogicalForm__MethodNameEnum,
          },
        ]);
      }

      void setFieldValue(valuePath, curValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, methodName, logicalFormInputType, curPredicate?.value]);

  if (inputType === LogicalForm__InputTypeEnum.NoInput) {
    return null;
  }

  if (inputType === LogicalForm__InputTypeEnum.MultiAccountSelect) {
    return (
      <MultiAccountSelect
        disabled={isDisabled}
        onAccountSelect={(_value, selectField, actionName) =>
          computeAccountSelectValue(
            selectField,
            actionName,
            values,
            valuePath,
            setFieldValue,
          )
        }
        accountIds={get(values, valuePath) as string[]}
        id={valuePath}
        showAllAccountsByDefault={false}
        allAccountsSelectionBehavior={
          AllAccountsSelectionBehaviorEnum.selectAccounts
        }
        className="w-full"
      />
    );
  }

  if (inputType === LogicalForm__InputTypeEnum.MultiUserSelect) {
    return (
      <MultiUserSelect
        onChange={(selectValues, selectAction) =>
          computeMultiUserSelectValue(
            selectValues,
            selectAction,
            values,
            valuePath,
            setFieldValue,
          )
        }
        selectedUserIds={get(values, valuePath) as string[]}
        disabled={isDisabled}
      />
    );
  }

  if (inputType === LogicalForm__InputTypeEnum.MetadataInput) {
    return modelNameToResource[modelName] ? (
      <MetadataInput
        onChange={(value) => {
          void setFieldValue(valuePath, formatLegacyMetadata(value));
        }}
        initialValues={parseLegacyMetadata(
          curPredicate.value as unknown as LegacyMetadata | null,
        )}
        resource={modelNameToResource[modelName] as ResourcesEnum}
        hideLabel
        multiLines
        inlineAddButton={false}
        noInitialEmptyEntry={!!curPredicate.value}
        alwaysDeleteOnRemove
        allowNoEntries={false}
      />
    ) : null;
  }

  if (inputType === LogicalForm__InputTypeEnum.FormikSanitizedCurrencyInput) {
    return (
      <Field
        id={valuePath}
        name={valuePath}
        component={FormikSanitizedCurrencyInput}
        className="h-8 flex-grow rounded-sm border border-border-default px-2 py-1 text-sm placeholder-gray-600 outline-none hover:border-gray-300 focus:border-l focus:border-blue-500 disabled:bg-gray-100"
      />
    );
  }

  if (logicalFormInputType?.paginateInput) {
    return (
      <PredicatePaginatedValue
        logicalFormKey={logicalFormKey}
        modelName={modelName}
        formikPath={formikPath}
        methodName={methodName}
        inputType={logicalFormInputType?.inputType}
        isDisabled={isDisabled}
      />
    );
  }

  if (loading || logicalFormInputType == null) {
    return (
      <Field
        id={valuePath}
        name={valuePath}
        component={FormikSelectField}
        options={[]}
        isDisabled
      />
    );
  }

  if (inputType === LogicalForm__InputTypeEnum.TextInput) {
    return (
      <Field id={valuePath} name={valuePath} component={FormikInputField} />
    );
  }

  if (inputType === LogicalForm__InputTypeEnum.NumberInput) {
    return (
      <Field
        id={valuePath}
        name={valuePath}
        component={FormikNumberFormatField}
      />
    );
  }

  if (inputType === LogicalForm__InputTypeEnum.MultiSelect) {
    return (
      <Field
        id={valuePath}
        name={valuePath}
        component={FormikMultiSelectField}
        options={valueOptions ?? []}
        isDisabled={isDisabled}
        isMulti
        showTooltipOnHover
      />
    );
  }

  if (inputType === LogicalForm__InputTypeEnum.AccountSelect) {
    return (
      <Field
        classes="w-full"
        component={AccountSelect}
        removeAllAccountsOption
        name={valuePath}
        accountId={get(values, valuePath) as string}
        onAccountSelect={(_account, accountData: OptionType) => {
          void setFieldValue(valuePath, accountData.value);
        }}
        customOptions={[
          {
            label: CUSTOM_IDENTIFIER_GROUP_OPTION_LABEL,
            options: valueOptions,
          },
        ]}
      />
    );
  }

  if (inputType === LogicalForm__InputTypeEnum.CounterpartySelect) {
    return (
      <Field
        label={null}
        name={valuePath}
        counterpartyId={get(values, valuePath) as string}
        component={CounterpartySelect}
        onChange={(counterpartyId) => {
          void setFieldValue(valuePath, counterpartyId);
        }}
        customOptions={valueOptions}
      />
    );
  }

  if (inputType === LogicalForm__InputTypeEnum.DateInput) {
    return (
      <Field
        label={null}
        name={valuePath}
        initialDate={get(values, valuePath) as string}
        component={FormikDateInput}
        className="-mt-1.5"
      />
    );
  }

  return (
    <>
      <ReconciliationRuleCustomValueModal
        customFieldValue={customFieldValue}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        valuePath={valuePath}
        options={valueOptions || []}
        setOptions={setOptions}
      />
      <Field
        id={valuePath}
        name={valuePath}
        component={FormikSelectField}
        // If options and valueOptions have the same label, options and valueOptions are in sync, so use options.
        // If options and valueOptions don't have the same label, it is because the form is not in sync when deleting
        // a predicate, so use valueOptions which is the up to date value.
        options={
          options &&
          valueOptions &&
          options[0]?.label === valueOptions[0]?.label
            ? options || valueOptions
            : valueOptions || options
        }
        onChange={(option: OptionType): void => {
          const isReconcilableSchemaCustomField =
            KEYWORDS_FOR_CUSTOM_FIELD.some((keywordInCustomField) =>
              option.value.includes(keywordInCustomField),
            );

          if (isReconcilableSchemaCustomField) {
            setCustomFieldValue(option.value);
            if (valueOptions?.map((o) => o.value).includes(option.value)) {
              setIsModalOpen(true);
            }
          } else {
            void setFieldValue(valuePath, option.value);
          }
        }}
        isDisabled={isDisabled}
      />
    </>
  );
}

export default PredicateValue;
