// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useHistory } from "react-router-dom";
import SweepRuleForm from "./SweepRuleForm";
import { Button, PageHeader } from "../../../common/ui-components";

function NewSweepRuleView() {
  const history = useHistory();
  const rightAction = (
    <Button buttonType="secondary" onClick={() => history.push("/sweeps")}>
      Cancel
    </Button>
  );

  return (
    <PageHeader
      title="Create Sweep Rule"
      right={rightAction}
      crumbs={[
        {
          name: "All Automated Sweeps",
          path: "/sweeps",
        },
        {
          name: "New Sweep",
        },
      ]}
    >
      <SweepRuleForm
        isEditForm={false}
        id={undefined}
        sweepRuleData={undefined}
      />
    </PageHeader>
  );
}

export default NewSweepRuleView;
