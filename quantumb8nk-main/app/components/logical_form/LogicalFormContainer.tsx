// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  LogicalForm__ModelNameEnum,
  LogicalFormKeyEnum,
} from "../../../generated/dashboard/graphqlSchema";
import EditLogicalForm from "./EditLogicalForm";
import LogicalForm from "./LogicalForm";

interface LogicalFormContainerProps<T = object> {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  entityId?: string;
  preLogicalCustomComponent?: JSX.Element;
  postLogicalCustomComponent?: JSX.Element;
  additionalDefaultInitialValues: T;
  supportAndOfOrs?: boolean;
  supportOrOfAnds?: boolean;
  fullWidth?: boolean;
  editingSessionId?: string | null | undefined;
}

function LogicalFormContainer<T = object>({
  logicalFormKey,
  modelName,
  entityId,
  preLogicalCustomComponent,
  postLogicalCustomComponent,
  additionalDefaultInitialValues,
  supportAndOfOrs = false,
  supportOrOfAnds = true,
  fullWidth = false,
  editingSessionId = null,
}: LogicalFormContainerProps<T>): JSX.Element {
  if (entityId != null) {
    return (
      <EditLogicalForm<T>
        logicalFormKey={logicalFormKey}
        modelName={modelName}
        entityId={entityId}
        additionalDefaultInitialValues={additionalDefaultInitialValues}
        preLogicalCustomComponent={preLogicalCustomComponent}
        postLogicalCustomComponent={postLogicalCustomComponent}
        supportAndOfOrs={supportAndOfOrs}
        supportOrOfAnds={supportOrOfAnds}
        fullWidth={fullWidth}
      />
    );
  }

  return (
    <LogicalForm<T>
      logicalFormKey={logicalFormKey}
      modelName={modelName}
      preLogicalCustomComponent={preLogicalCustomComponent}
      postLogicalCustomComponent={postLogicalCustomComponent}
      additionalDefaultInitialValues={additionalDefaultInitialValues}
      entityId={entityId}
      supportAndOfOrs={supportAndOfOrs}
      supportOrOfAnds={supportOrOfAnds}
      fullWidth={fullWidth}
      editingSessionId={editingSessionId}
    />
  );
}

export default LogicalFormContainer;
