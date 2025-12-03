// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { get, startCase } from "lodash";
import { ToggleRow } from "~/common/ui-components";
import PredicateField from "./PredicateField";
import FieldsRow from "../../../common/ui-components/FieldsRow/FieldsRow";
import PredicateOperator from "./PredicateOperator";
import {
  LogicalFormKeyEnum,
  LogicalForm__ModelNameEnum,
  LogicalForm__OperatorEnum,
  Operator,
} from "../../../generated/dashboard/graphqlSchema";
import Button from "../../../common/ui-components/Button/Button";
import Icon from "../../../common/ui-components/Icon/Icon";
import PredicateValueContainer from "./PredicateValueContainer";
import { FormValues } from "./LogicalTypes";

interface PredicateComponentProps {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  formikPath: string;
  deletePredicate?: () => void;
  index?: number;
  supportAndOfOrs: boolean;
  supportOrOfAnds: boolean;
}

function PredicateComponent({
  logicalFormKey,
  modelName,
  formikPath,
  deletePredicate,
  index = 0,
  supportAndOfOrs,
  supportOrOfAnds,
}: PredicateComponentProps) {
  const [operators, setOperators] = useState<Array<Operator>>([]);
  const { values, setFieldValue } = useFormikContext<FormValues>();

  const predicateOperatorPathExtractor = (inputString: string) =>
    (inputString.match(/conditions\.value\[\d+\]/) || [""]) as string[];
  const predicateOperatorPath = `${
    predicateOperatorPathExtractor(formikPath)[0]
  }.operator`;
  const predicateOperator =
    supportAndOfOrs && supportOrOfAnds
      ? (get(values, predicateOperatorPath) as LogicalForm__OperatorEnum) ||
        LogicalForm__OperatorEnum.And
      : LogicalForm__OperatorEnum.And;

  useEffect(() => {
    if (supportAndOfOrs && supportOrOfAnds) {
      void setFieldValue(predicateOperatorPath, predicateOperator);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deletebutton = deletePredicate ? (
    <Button
      id="remove-rule-condition-btn"
      className="float-left w-8"
      buttonType="link"
      onClick={() => deletePredicate()}
    >
      <Icon
        iconName="clear"
        size="m"
        color="currentColor"
        className="text-gray-500"
      />
    </Button>
  ) : null;

  return (
    <div>
      {index === 0 && supportAndOfOrs && supportOrOfAnds && (
        <div className="mb-4 w-fit">
          <ToggleRow
            className="uppercase"
            radios={[
              {
                name: predicateOperatorPath,
                value: LogicalForm__OperatorEnum.And,
                children: startCase(LogicalForm__OperatorEnum.And),
                selected: predicateOperator === LogicalForm__OperatorEnum.And,
                onChange: () => {
                  void setFieldValue(
                    predicateOperatorPath,
                    LogicalForm__OperatorEnum.And,
                  );
                },
              },
              {
                name: predicateOperatorPath,
                value: LogicalForm__OperatorEnum.Or,
                children: startCase(LogicalForm__OperatorEnum.Or),
                selected: predicateOperator === LogicalForm__OperatorEnum.Or,
                onChange: () => {
                  void setFieldValue(
                    predicateOperatorPath,
                    LogicalForm__OperatorEnum.Or,
                  );
                },
              },
            ]}
          />
        </div>
      )}
      <div className="flex">
        <div className="w-14">
          <p className="mt-1 text-right font-medium text-gray-500">
            {index > 0 ? `${startCase(predicateOperator)}` : "When"}
          </p>
        </div>
        <div className="w-full">
          <div className="pl-2">
            <FieldsRow columns={3} gap={2}>
              <PredicateField
                logicalFormKey={logicalFormKey}
                modelName={modelName}
                formikPath={formikPath}
                setOperators={setOperators}
              />
              <PredicateOperator
                operators={operators}
                formikPath={formikPath}
              />
              <PredicateValueContainer
                logicalFormKey={logicalFormKey}
                modelName={modelName}
                formikPath={formikPath}
              />
            </FieldsRow>
          </div>
        </div>
        <div className="mx-2 mt-1.5 w-fit">{deletebutton}</div>
      </div>
    </div>
  );
}

export default PredicateComponent;
