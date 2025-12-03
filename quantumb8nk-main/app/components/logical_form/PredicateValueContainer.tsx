// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, useFormikContext } from "formik";
import { get } from "lodash";
import {
  LogicalFormKeyEnum,
  LogicalForm__ModelNameEnum,
} from "../../../generated/dashboard/graphqlSchema";
import FormikSelectField from "../../../common/formik/FormikSelectField";
import { FormValues, Predicate } from "./LogicalTypes";
import PredicateValue from "./PredicateValue";

interface PredicateValueContainerProps {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  formikPath: string;
}

function PredicateValueContainer({
  logicalFormKey,
  modelName,
  formikPath,
}: PredicateValueContainerProps): JSX.Element | null {
  const { values } = useFormikContext<FormValues>();

  const curPredicate = get(values, formikPath) as Predicate;

  const valuePath = `${formikPath}.value`;

  const curPredicateField = curPredicate.field;
  const curPredicateOperator = curPredicate.operator;
  const curPredicateNegate = curPredicate.negate;

  if (
    curPredicateField == null ||
    curPredicateOperator == null ||
    curPredicateNegate == null
  ) {
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

  return (
    <PredicateValue
      logicalFormKey={logicalFormKey}
      modelName={modelName}
      formikPath={formikPath}
      methodName={curPredicateField}
      operatorName={curPredicateOperator}
    />
  );
}

export default PredicateValueContainer;
