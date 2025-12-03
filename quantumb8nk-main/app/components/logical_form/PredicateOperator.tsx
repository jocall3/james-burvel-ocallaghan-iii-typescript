// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, useFormikContext } from "formik";
import { get } from "lodash";
import {
  LogicalForm__MethodNameEnum,
  LogicalForm__OperatorEnum,
  Operator,
} from "../../../generated/dashboard/graphqlSchema";
import FormikSelectField, {
  OptionType,
} from "../../../common/formik/FormikSelectField";
import { Predicate } from "./LogicalTypes";

interface PredicateOperatorProps {
  formikPath: string;
  operators: Array<Operator>;
}

const CREATED_BY_THE_API = "Created by the API";
const CREATED_BY_USER_MANUALLY = "Created by a user manually";

function PredicateOperator({ formikPath, operators }: PredicateOperatorProps) {
  const { setFieldValue, values } = useFormikContext();

  const curPredicate = get(values, formikPath) as Predicate;

  const operatorName = `${formikPath}.operator`;
  const operatorNegate = `${formikPath}.negate`;
  const valuePath = `${formikPath}.value`;

  /* (gfu): to support this deprecated rule Predicate for created by missing/present
   *   The preferred method is to use CreationSource with OR's.
   */
  const operatorLabel = (operator: Operator) => {
    if (curPredicate?.field === LogicalForm__MethodNameEnum.CreatedByUser) {
      if (
        (operator.operatorName === LogicalForm__OperatorEnum.Missing &&
          !operator.negate) ||
        (operator.operatorName === LogicalForm__OperatorEnum.Present &&
          operator.negate)
      ) {
        return CREATED_BY_THE_API;
      }

      if (
        (operator.operatorName === LogicalForm__OperatorEnum.Present &&
          !operator.negate) ||
        (operator.operatorName === LogicalForm__OperatorEnum.Missing &&
          operator.negate)
      ) {
        return CREATED_BY_USER_MANUALLY;
      }
    }
    return operator.prettyOperatorName;
  };

  const operatorOptions = operators?.map(
    (operator: Operator): OptionType => ({
      label: operatorLabel(operator),
      value: `${operator.operatorName}-${operator.negate.toString()}`,
      hidden:
        operatorLabel(operator) === CREATED_BY_THE_API ||
        operatorLabel(operator) === CREATED_BY_USER_MANUALLY,
    }),
  );

  const isDisabled = curPredicate?.field == null;

  const curPredicateNegate = curPredicate.negate;
  const curPredicateOperator = curPredicate.operator;

  const getSelectedOption = (): string | undefined => {
    if (curPredicateOperator == null || curPredicateNegate == null) {
      return undefined;
    }

    const option = operatorOptions.find(
      (operatorOption: OptionType): boolean =>
        operatorOption.value ===
        `${curPredicateOperator}-${curPredicateNegate.toString()}`,
    );

    return option?.value;
  };

  return (
    <Field
      component={FormikSelectField}
      name={operatorName}
      options={operatorOptions}
      isDisabled={isDisabled}
      onChange={(option: OptionType) => {
        const [operator, negate] = option.value.split("-");
        void setFieldValue(operatorName, operator);
        void setFieldValue(operatorNegate, negate === "true");
        void setFieldValue(valuePath, null);
      }}
      value={getSelectedOption()}
      filterOption={(option: { data: { hidden?: boolean } }) =>
        !option.data.hidden
      }
    />
  );
}

export default PredicateOperator;
