// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  LogicalForm__ModelNameEnum,
  LogicalFormKeyEnum,
  useLogicalFormQuery,
} from "../../../generated/dashboard/graphqlSchema";
import LogicalForm from "./LogicalForm";

interface EditLogicalFormProps<T> {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  entityId: string;
  preLogicalCustomComponent?: JSX.Element;
  postLogicalCustomComponent?: JSX.Element;
  additionalDefaultInitialValues: T;
  supportAndOfOrs: boolean;
  supportOrOfAnds: boolean;
  fullWidth: boolean;
}

function EditLogicalForm<T = object>({
  logicalFormKey,
  modelName,
  entityId,
  preLogicalCustomComponent,
  postLogicalCustomComponent,
  additionalDefaultInitialValues,
  supportAndOfOrs,
  supportOrOfAnds,
  fullWidth,
}: EditLogicalFormProps<T>): JSX.Element | null {
  const { loading, data } = useLogicalFormQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      logicalFormKey,
      modelName,
      entityId,
    },
  });

  const logicalFormInitialValues = data?.logicalFormInitialValues;

  if (loading) {
    return null;
  }

  return (
    <LogicalForm<T>
      logicalFormKey={logicalFormKey}
      modelName={modelName}
      existingInitialValues={logicalFormInitialValues}
      preLogicalCustomComponent={preLogicalCustomComponent}
      postLogicalCustomComponent={postLogicalCustomComponent}
      additionalDefaultInitialValues={additionalDefaultInitialValues}
      entityId={entityId}
      supportAndOfOrs={supportAndOfOrs}
      supportOrOfAnds={supportOrOfAnds}
      fullWidth={fullWidth}
    />
  );
}

export default EditLogicalForm;
