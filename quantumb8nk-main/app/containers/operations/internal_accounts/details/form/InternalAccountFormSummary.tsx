// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Button } from "~/common/ui-components";

interface InternalAccountFormSummaryProps {
  submitDisabled: boolean;
  connectionName: string;
  bankName?: string | null;
}

function InternalAccountFormSummary({
  submitDisabled,
  connectionName,
  bankName,
}: InternalAccountFormSummaryProps) {
  let summaryMsg = "Updating account";
  if (bankName) summaryMsg += ` at ${bankName}`;
  summaryMsg += ` for connection "${connectionName}"`;

  return (
    <div>
      <div className="sticky top-4 mt-4 rounded border bg-background-default mint-lg:mt-0">
        <div className="grid gap-y-2 p-6">
          <div className="mb-2 text-xs text-text-muted">
            Internal Account Summary
          </div>
          <div className="mb-2 flex items-center">{summaryMsg}</div>
        </div>
        <hr />
        <div className="flex justify-end px-6 py-4">
          <Button buttonType="primary" disabled={submitDisabled} isSubmit>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InternalAccountFormSummary;
