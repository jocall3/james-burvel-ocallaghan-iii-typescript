// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect } from "react";
import ReconSplitViewProvider from "~/app/contexts/recon-split-view-context";
import ReconciliationContextProvider from "./ReconciliationContextProvider";
import MultiAccountReconciliationPage from "./MultiAccountReconciliationPage";
import ToastContainer from "./ToastContainer";
import { useWarmReconSuggestionsModelMutation } from "../../../generated/dashboard/graphqlSchema";

export default function MultiAccountReconciliationHome() {
  // warm up the reconciliation suggestions model
  const [warmReconSuggestionsModel] = useWarmReconSuggestionsModelMutation();
  useEffect(() => {
    void warmReconSuggestionsModel({
      variables: {
        input: {},
      },
    });
  }, [warmReconSuggestionsModel]);

  return (
    <ReconciliationContextProvider>
      <ReconSplitViewProvider>
        <MultiAccountReconciliationPage />
        <ToastContainer />
      </ReconSplitViewProvider>
    </ReconciliationContextProvider>
  );
}
