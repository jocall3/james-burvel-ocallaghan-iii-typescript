// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useEffect } from "react";
import { FieldArray, useFormikContext } from "formik";
import { get, startCase } from "lodash";
import {
  ToggleRow,
  FormContainer,
  LogicalOperatorSeparator,
} from "~/common/ui-components";
import {
  FormValues,
  Proposition,
  PropositionType,
  Statement,
} from "./LogicalTypes";
import Button from "../../../common/ui-components/Button/Button";
import Icon from "../../../common/ui-components/Icon/Icon";
import {
  LogicalFormKeyEnum,
  LogicalForm__ModelNameEnum,
  LogicalForm__OperatorEnum,
} from "../../../generated/dashboard/graphqlSchema";
import PredicateComponent from "./PredicateComponent";

interface StatementComponentProps {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  formikPath: string;
  deleteStatement?: () => void;
  level?: number;
  supportAndOfOrs: boolean;
  supportOrOfAnds: boolean;
}

export default function StatementComponent({
  logicalFormKey,
  modelName,
  formikPath,
  deleteStatement,
  level = 1,
  supportAndOfOrs,
  supportOrOfAnds,
}: StatementComponentProps): JSX.Element | null {
  const { setFieldValue } = useFormikContext<FormValues>();
  const { values } = useFormikContext<FormValues>();

  const curStatement = get(values, formikPath) as Statement;
  const operatorPath = `${formikPath}.operator`;
  const valuePath = `${formikPath}.value`;
  const outerOperator = get(values, "conditions.operator");

  // for simple logic the conditions are always supportOrOfAnds=true
  // and supportAndOfOrs=false
  function configureOperatorsForSimpleLogic() {
    if (level > 1) {
      void setFieldValue(operatorPath, LogicalForm__OperatorEnum.And);
    } else {
      void setFieldValue(operatorPath, LogicalForm__OperatorEnum.Or);
    }
  }

  function configureOperatorsForComplexLogic() {
    const operatorExists = get(values, operatorPath) as string;

    if (!operatorExists) {
      const selectOperator =
        level > 1
          ? LogicalForm__OperatorEnum.And
          : LogicalForm__OperatorEnum.Or;
      void setFieldValue(operatorPath, selectOperator);
    }
  }

  useEffect(() => {
    const complexLogicSupported = supportAndOfOrs && supportOrOfAnds;

    if (complexLogicSupported) {
      configureOperatorsForComplexLogic();
    } else {
      configureOperatorsForSimpleLogic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, setFieldValue, operatorPath]);

  useEffect(() => {
    if (curStatement.value?.length === 0 && deleteStatement) {
      deleteStatement();
    }
  }, [curStatement, deleteStatement]);

  // [@lukeciv]: I originally used PropositionComponent.tsx, but needed to do it like this to avoid the dependency cycle
  const propositionComponent = useCallback(
    (
      propositionType: PropositionType,
      newFormikPath: string,
      deleteProposition: () => void,
      index?: number,
    ) => {
      const currentLevel = level ? level + 1 : 1;
      if (propositionType === PropositionType.Predicate) {
        return (
          <PredicateComponent
            logicalFormKey={logicalFormKey}
            modelName={modelName}
            formikPath={newFormikPath}
            deletePredicate={deleteProposition}
            index={index}
            supportAndOfOrs={supportAndOfOrs}
            supportOrOfAnds={supportOrOfAnds}
          />
        );
      }

      if (propositionType === PropositionType.Statement) {
        return (
          <StatementComponent
            logicalFormKey={logicalFormKey}
            modelName={modelName}
            formikPath={newFormikPath}
            deleteStatement={deleteProposition}
            level={currentLevel}
            supportAndOfOrs={supportAndOfOrs}
            supportOrOfAnds={supportOrOfAnds}
          />
        );
      }

      throw new Error("Unrecognized proposition type");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logicalFormKey, modelName, level],
  );

  if (typeof values.conditions.value === "string") {
    return null;
  }

  const statementOperator = (
    <div className="relative mb-4 mb-6 mt-8 flex items-center">
      <div className="mr-4 flex-grow border-b border-gray-100" />
      {supportOrOfAnds && supportAndOfOrs && (
        <div className="w-fit">
          <ToggleRow
            radios={[
              {
                name: "conditions.operator",
                value: LogicalForm__OperatorEnum.And,
                selected: outerOperator === LogicalForm__OperatorEnum.And,
                children: startCase(LogicalForm__OperatorEnum.And),
                onChange: () => {
                  void setFieldValue(
                    "conditions.operator",
                    LogicalForm__OperatorEnum.And,
                  );
                },
              },
              {
                name: "conditions.operator",
                value: LogicalForm__OperatorEnum.Or,
                children: startCase(LogicalForm__OperatorEnum.Or),
                selected: outerOperator === LogicalForm__OperatorEnum.Or,
                onChange: () => {
                  void setFieldValue(
                    "conditions.operator",
                    LogicalForm__OperatorEnum.Or,
                  );
                },
              },
            ]}
          />
        </div>
      )}
      {supportOrOfAnds && !supportAndOfOrs && (
        <LogicalOperatorSeparator
          operator={outerOperator as LogicalForm__OperatorEnum}
        />
      )}
      <div className="ml-4 flex-grow border-b border-gray-100" />
    </div>
  );

  return (
    <div>
      <FieldArray
        name={valuePath}
        render={(arrayHelpers) => (
          <>
            <div>
              {curStatement.value && curStatement.value?.length > 0
                ? curStatement.value.map(
                    (proposition: Proposition, index: number): JSX.Element => {
                      const propositionType =
                        "field" in proposition
                          ? PropositionType.Predicate
                          : PropositionType.Statement;
                      const newFormikPath = `${formikPath}.value[${index}]`;
                      return (
                        <>
                          {index > 0 &&
                            propositionType === PropositionType.Statement &&
                            statementOperator}
                          <div
                            className={`rounded-sm bg-gray-50 ${
                              propositionType === PropositionType.Statement
                                ? "border border-gray-100 p-4"
                                : ""
                            }`}
                            key={newFormikPath}
                          >
                            {propositionComponent(
                              propositionType,
                              newFormikPath,
                              (): void => {
                                arrayHelpers.remove(index);
                              },
                              index,
                            )}
                          </div>
                        </>
                      );
                    },
                  )
                : null}
              {level > 1 && (
                <FormContainer className="flex max-w-full justify-center">
                  <Button
                    buttonType="secondary"
                    className="font-medium"
                    onClick={() =>
                      arrayHelpers.push({
                        field: undefined,
                        operator: undefined,
                        negate: undefined,
                        value: undefined,
                      })
                    }
                  >
                    <Icon iconName="add" color="currentColor" />
                    Add Condition
                  </Button>
                </FormContainer>
              )}
            </div>
            {level === 1 && (
              <Button
                buttonType="secondary"
                className="mx-auto my-6 self-center"
                onClick={() =>
                  arrayHelpers.push({
                    operator: undefined,
                    negate: false,
                    value: [
                      {
                        field: undefined,
                        operator: undefined,
                        negate: undefined,
                        value: undefined,
                      },
                    ],
                  })
                }
              >
                <Icon iconName="add" color="currentColor" />
                Add Condition Block
              </Button>
            )}
          </>
        )}
      />
    </div>
  );
}
