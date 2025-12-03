// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Route, Switch } from "react-router";
import { Heading } from "../../../common/ui-components";
import CreateOrFindAccountCollectionFlow from "./CreateOrFindAccountCollectionFlow";
import AccountCollectionWorkflowDemo from "./AccountCollectionEmbeddableFlowDemo";

function AccountCollectionFlowDemo() {
  return (
    <div>
      <Heading level="h1">Pre-Built UIs Demo - Account Collection</Heading>

      <Switch>
        <Route
          exact
          path="/workflows/demos/account_collection_flow"
          component={CreateOrFindAccountCollectionFlow}
        />
        <Route
          exact
          path="/workflows/demos/account_collection_flow/:id"
          component={AccountCollectionWorkflowDemo}
        />
      </Switch>
    </div>
  );
}

export default AccountCollectionFlowDemo;
