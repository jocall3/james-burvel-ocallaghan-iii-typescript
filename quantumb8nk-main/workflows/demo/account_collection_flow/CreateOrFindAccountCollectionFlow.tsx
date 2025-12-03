// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { AccountCollectionFlow } from "../../../generated/dashboard/graphqlSchema";
import CreateAccountCollectionFlowForm from "./CreateAccountCollectionFlowForm";

function CreateOrFindAccountCollectionFlow() {
  const { pathname } = useLocation();
  const history = useHistory();

  return (
    <div className="grid grid-cols-2 gap-4 pt-8">
      <CreateAccountCollectionFlowForm
        onSuccess={(accountCollectionFlow: AccountCollectionFlow) => {
          history.push(`${pathname}/${accountCollectionFlow.id}`);
        }}
      />
      <div>
        {/* TODO(jlang):  Add Ability to enter AccountCollectionFlow#ID */}
      </div>
    </div>
  );
}

export default CreateOrFindAccountCollectionFlow;
