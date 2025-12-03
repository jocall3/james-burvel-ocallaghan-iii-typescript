// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { TriggeredRule } from "../../../generated/dashboard/graphqlSchema";
import { ApprovalBlock, RuleInterface } from "../../components/ApprovalBlock";

interface PendingApprovalsProps {
  triggeredRules: TriggeredRule[];
  blockedExternalAccountPath?: string;
  resourceText?: JSX.Element | string;
  enableSequentialRules?: boolean;
}

function PendingApprovals({
  triggeredRules,
  blockedExternalAccountPath,
  resourceText,
  enableSequentialRules = false,
}: PendingApprovalsProps) {
  function sequentialApprovalBlock() {
    const sequentialRules: RuleInterface[] = [];

    triggeredRules?.forEach((triggeredRule) => {
      const { rule, requiredReviewers } = triggeredRule;

      sequentialRules.push({
        id: rule?.id,
        activeRule: true,
        requiredReviewDescription: "Payment Review Required",
        name: rule?.name as string,
        path: rule?.path,
        requiredReviewers,
      } as RuleInterface);
    });

    return (
      sequentialRules.length > 0 && (
        <ApprovalBlock renderReviewerDetails rules={sequentialRules} />
      )
    );
  }

  function nonSequentialApprovalBlocks() {
    return triggeredRules?.map((triggeredRule) => {
      const { rule, requiredReviewers } = triggeredRule;

      return (
        <ApprovalBlock
          renderReviewerDetails
          rules={[
            {
              id: rule?.id,
              activeRule: true,
              requiredReviewDescription: "Payment Review Required",
              name: rule?.name as string,
              path: rule?.path,
              requiredReviewers,
            },
          ]}
        />
      );
    });
  }

  return (
    <div>
      <p className="text-sm">{resourceText}</p>
      {((triggeredRules?.length ?? 0) > 0 || blockedExternalAccountPath) && (
        <div className="flex flex-col gap-y-2">
          {enableSequentialRules
            ? sequentialApprovalBlock()
            : nonSequentialApprovalBlocks()}
          {blockedExternalAccountPath && (
            <ApprovalBlock
              renderReviewerDetails={false}
              rules={[
                {
                  activeRule: true,
                  requiredReviewDescription: "External Account Review Required",
                  name: "View External Account",
                  path: blockedExternalAccountPath,
                },
              ]}
            >
              The receiving entity of this payment order requires review.
            </ApprovalBlock>
          )}
        </div>
      )}
    </div>
  );
}

export default PendingApprovals;
