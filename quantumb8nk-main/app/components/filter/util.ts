// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { v4 as uuidv4 } from "uuid";
import {
  Field,
  LogicalForm__InputTypeEnum,
  FieldWithValue,
} from "../../../generated/dashboard/graphqlSchema";

export type FilterType = {
  rank: number;
  key: string;
  type: LogicalForm__InputTypeEnum;
  name: string;
  repeatable: boolean;
  default: boolean;
  hidden: boolean;
  icon: string;
  options?: Record<string, string>[];
};

export type ValueType =
  | string
  | string[]
  | Record<string, string>
  | number
  | Record<string, unknown>;

export type AppliedFilterType = FilterType & {
  id: string;
  value: ValueType;
  applying: boolean;
};

/** Amount Utility Functions  */

export function amountSearchMapper(
  minimumAmount: number,
  maximumAmount: number,
) {
  return {
    lte: maximumAmount || undefined,
    gte: minimumAmount || undefined,
  };
}

/** Date Utility Functions */

export function dateSearchMapper(
  gte: string | undefined | null,
  lte: string | undefined | null,
) {
  return {
    lte: lte || undefined,
    gte: gte || undefined,
  };
}

export function metadataValueFromURLToState(
  filterInformation: FilterType,
  metadataValues: string,
): AppliedFilterType[] {
  const parsedMetadataValues = JSON.parse(metadataValues) as Record<
    string,
    string
  >;
  const metadataFilters = Object.entries(parsedMetadataValues).map(
    ([key, value]) =>
      ({
        id: uuidv4(),
        ...filterInformation,
        value: { key, value },
        applying: false,
      }) as AppliedFilterType,
  );

  return metadataFilters;
}

export type OverrideValue = {
  [key: string]: {
    default?: boolean;
    repeatable?: boolean;
    hidden?: boolean;
    value?: ValueType;
  };
};

export function mapFieldWithValuesToAppliedFilters(
  logicalFormFields: Array<FieldWithValue>,
): Array<AppliedFilterType> {
  return logicalFormFields.map((logicalFormField, index) => {
    let value = logicalFormField.value as ValueType;
    if (
      logicalFormField.inputType === LogicalForm__InputTypeEnum.SingleSelect ||
      logicalFormField.inputType ===
        LogicalForm__InputTypeEnum.CounterpartySelect
    ) {
      value = value[0] as ValueType;
    }
    const transformedField = {
      id: "",
      rank: index,
      key: logicalFormField.camelizeMethodName,
      type: logicalFormField.inputType,
      name: logicalFormField.prettyMethodName,
      options:
        logicalFormField.enumValues?.map((enumValue) => ({
          prettyValueName: enumValue?.prettyValueName,
          valueName: enumValue?.valueName,
        })) || [],
      repeatable:
        logicalFormField.inputType === LogicalForm__InputTypeEnum.MetadataInput,
      default: true,
      hidden: false,
      icon: logicalFormField.viewOptions?.filterView?.icon || "",
      value,
      applying: false,
    };
    return transformedField;
  });
}

export function mapLogicalFieldsToFilters(
  logicalFormFields: Array<Field>,
  overrideValue: OverrideValue = {},
) {
  return logicalFormFields.map((logicalFormField, index) => ({
    rank: index,
    key: logicalFormField.camelizeMethodName,
    type: logicalFormField.inputType,
    name: logicalFormField.prettyMethodName,
    options: logicalFormField.enumValues,
    repeatable:
      logicalFormField.inputType === LogicalForm__InputTypeEnum.MetadataInput
        ? true
        : overrideValue[logicalFormField.camelizeMethodName]?.repeatable ===
          true,
    default:
      overrideValue[logicalFormField?.camelizeMethodName]?.default === true,
    hidden:
      overrideValue[logicalFormField?.camelizeMethodName]?.hidden === true,
    icon: logicalFormField.viewOptions?.filterView?.icon,
    value:
      overrideValue[logicalFormField?.camelizeMethodName]?.value || undefined,
  }));
}

export function mapFiltersToAppliedFilters(
  filters: Array<FilterType>,
  initialValues?: Record<string, ValueType>,
): AppliedFilterType[] {
  if (!initialValues) {
    return [];
  }
  return filters
    .filter((f) => f.key in initialValues)
    .map((filter) => ({
      ...filter,
      applying: false,
      id: filter.key,
      value: initialValues[filter.key],
    }));
}
