// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import PredicateComponent from "./PredicateComponent";
import {
  LogicalFormKeyEnum,
  LogicalForm__ModelNameEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { PropositionType } from "./LogicalTypes";
import StatementComponent from "./StatementComponent";

interface PropositionComponentProps {
  logicalFormKey: LogicalFormKeyEnum;
  modelName: LogicalForm__ModelNameEnum;
  propositionType: PropositionType;
  formikPath: string;
  deleteProposition?: () => void;
  supportAndOfOrs: boolean;
  supportOrOfAnds: boolean;
}

function PropositionComponent({
  logicalFormKey,
  modelName,
  propositionType,
  formikPath,
  supportAndOfOrs,
  supportOrOfAnds,
  deleteProposition,
}: PropositionComponentProps) {
  if (propositionType === PropositionType.Predicate) {
    return (
      <PredicateComponent
        logicalFormKey={logicalFormKey}
        modelName={modelName}
        formikPath={formikPath}
        deletePredicate={deleteProposition}
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
        formikPath={formikPath}
        deleteStatement={deleteProposition}
        supportAndOfOrs={supportAndOfOrs}
        supportOrOfAnds={supportOrOfAnds}
      />
    );
  }

  throw new Error("Unrecognized proposition type");
}

export default PropositionComponent;
