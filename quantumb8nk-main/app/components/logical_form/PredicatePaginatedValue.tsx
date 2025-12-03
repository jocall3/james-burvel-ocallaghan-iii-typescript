// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Field, useFormikContext } from "formik";
import { get } from "lodash";
import {
  LogicalFormKeyEnum,
  LogicalForm__InputTypeEnum,
  LogicalForm__MethodNameEnum,
  LogicalForm__ModelNameEnum,
  usePredicatePaginatedValueLazyQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { INITIAL_PAGINATION } from "../EntityTableView";
import FormikAsyncSelectField from "../../../common/formik/FormikAsyncSelectField";
import { FormValues } from "./LogicalTypes";
import { SelectValue } from "../../../common/ui-components/AsyncSelectField/AsyncSelectField";

interface PredicatePaginatedValueProps {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  formikPath: string;
  methodName: LogicalForm__MethodNameEnum;
  inputType: LogicalForm__InputTypeEnum;
  isDisabled: boolean;
}

function PredicatePaginatedValue({
  logicalFormKey,
  modelName,
  formikPath,
  methodName,
  inputType,
  isDisabled,
}: PredicatePaginatedValueProps): JSX.Element | null {
  const { setFieldValue, values } = useFormikContext<FormValues>();

  const [options, setOptions] = useState<SelectValue[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [getPredicatePaginatedValue] = usePredicatePaginatedValueLazyQuery();

  // TODO(@lukecivantos): Add ability to search by text PAINT-1863
  const loadOptions = () =>
    new Promise((resolve, reject) => {
      getPredicatePaginatedValue({
        variables: {
          first: INITIAL_PAGINATION.perPage,
          after: nextCursor,
          logicalFormKey,
          modelName,
          methodName,
        },
      })
        .then(({ data: newData }) => {
          // Save next cursor for the following graphql query
          setNextCursor(
            newData?.logicalFormPaginatedValues?.pageInfo.endCursor ?? null,
          );

          // Return the options to react-select
          resolve({
            hasMore: newData?.logicalFormPaginatedValues?.pageInfo?.hasNextPage,
            options: newData?.logicalFormPaginatedValues?.nodes?.map(
              (paginatedValue) => ({
                value: paginatedValue?.valueName,
                label: paginatedValue?.prettyValueName,
              }),
            ),
          });
        })
        .catch((e) => reject(e));
    });

  const valuePath = `${formikPath}.value`;
  const curValue = get(values, valuePath) as
    | string
    | string[]
    | null
    | undefined;
  const curOption = () => {
    if (curValue == null) {
      return undefined;
    }

    if (Array.isArray(curValue)) {
      return curValue.map((val) => ({
        value: val,
        label: options.find((option) => option.value === val)?.label,
      }));
    }

    return {
      value: curValue,
      label: options.find((option) => option.value === curValue)?.label,
    };
  };

  return (
    <Field
      id={valuePath}
      name={valuePath}
      component={FormikAsyncSelectField}
      onChange={(field: SelectValue | SelectValue[]) => {
        if (Array.isArray(field)) {
          setOptions(field);
          void setFieldValue(
            valuePath,
            field.map((curVal) => curVal?.value),
          );
        } else {
          setOptions([field]);
          void setFieldValue(valuePath, field?.value);
        }
      }}
      selectValue={curOption() ?? null}
      loadOptions={loadOptions}
      isDisabled={isDisabled}
      isMulti={inputType === LogicalForm__InputTypeEnum.MultiSelect}
    />
  );
}

export default PredicatePaginatedValue;
