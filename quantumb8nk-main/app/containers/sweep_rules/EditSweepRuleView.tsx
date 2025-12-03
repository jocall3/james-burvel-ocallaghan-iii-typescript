// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import SweepRuleForm from "./SweepRuleForm";
import {
  Button,
  ButtonClickEventTypes,
  PageHeader,
} from "../../../common/ui-components";
import {
  useSweepRuleViewQuery,
  SweepRule,
} from "../../../generated/dashboard/graphqlSchema";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

interface SweepRuleViewProps {
  match: { params: { sweep_rule_id: string } };
}

function EditSweepRuleView({
  match: {
    params: { sweep_rule_id: sweepRuleId },
  },
}: SweepRuleViewProps) {
  const { data, loading } = useSweepRuleViewQuery({
    variables: {
      id: sweepRuleId,
    },
  });
  const rightAction = (
    <Button
      buttonType="secondary"
      onClick={(event: ButtonClickEventTypes) =>
        handleLinkClick(`/sweeps/${sweepRuleId}`, event)
      }
    >
      Cancel
    </Button>
  );

  return (
    <PageHeader
      title="Edit Sweep Rule"
      loading={loading}
      right={rightAction}
      crumbs={[
        {
          name: "All Automated Sweeps",
          path: "/sweeps",
        },
        {
          name: "Edit Sweep Rule",
        },
      ]}
    >
      {!loading && (
        <SweepRuleForm
          isEditForm
          id={sweepRuleId}
          sweepRuleData={data?.sweepRule as SweepRule}
        />
      )}
    </PageHeader>
  );
}

export default EditSweepRuleView;
