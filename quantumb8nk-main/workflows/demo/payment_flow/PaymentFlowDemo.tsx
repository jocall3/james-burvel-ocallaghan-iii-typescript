// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Route, Switch } from "react-router";
import { Heading } from "../../../common/ui-components";
import CreateOrFindPaymentFlow from "./CreateOrFindPaymentFlow";
import PaymentWorkflowDemo from "./PaymentEmbeddableFlowDemo";

function PaymentFlowDemo() {
  return (
    <div>
      <Heading level="h1">Pre-Built UIs Demo - Payment Flows</Heading>

      <Switch>
        <Route
          exact
          path="/workflows/demos/payment_flow"
          component={CreateOrFindPaymentFlow}
        />
        <Route
          exact
          path="/workflows/demos/payment_flow/:id"
          component={PaymentWorkflowDemo}
        />
      </Switch>
    </div>
  );
}

export default PaymentFlowDemo;
