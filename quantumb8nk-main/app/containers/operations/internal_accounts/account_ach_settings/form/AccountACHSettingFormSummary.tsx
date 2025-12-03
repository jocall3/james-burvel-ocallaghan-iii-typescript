// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Alert, Button } from "~/common/ui-components";

interface AccountACHSettingFormSummaryProps {
  isEdit: boolean;
  submitDisabled: boolean;
}

function AccountACHSettingFormSummary({
  isEdit,
  submitDisabled,
}: AccountACHSettingFormSummaryProps) {
  const summaryAlert = isEdit ? (
    <Alert alertType="warning">
      You are modifying ACH settings for an existing account. Misconfiguration
      will impact the ability to correctly originate payments.
    </Alert>
  ) : (
    <Alert alertType="info">
      Note, you may need to add Account Capabilities to enable payments methods
      that use these ACH settings.
    </Alert>
  );

  return (
    <div>
      <div className="sticky top-4 mt-4 rounded border bg-background-default mint-lg:mt-0">
        <div className="grid gap-y-2 p-6">
          <div className="mb-2 text-xs text-text-muted">{summaryAlert}</div>
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

export default AccountACHSettingFormSummary;
