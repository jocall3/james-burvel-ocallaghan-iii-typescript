// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Alert, Button } from "~/common/ui-components";

interface VirtualAccountSettingFormSummaryProps {
  isEdit: boolean;
  submitDisabled: boolean;
  internalAccount: {
    bestName: string;
  };
}

function VirtualAccountSettingFormSummary({
  isEdit,
  submitDisabled,
  internalAccount,
}: VirtualAccountSettingFormSummaryProps) {
  return (
    <div>
      <div className="sticky top-4 mt-4 rounded border bg-background-default mint-lg:mt-0">
        <div className="grid gap-y-2 p-6">
          <div className="mb-2 text-xs text-text-muted">
            Virtual Account Setting Summary
          </div>
          {isEdit ? (
            <div className="flex flex-col gap-4">
              <Alert alertType="warning">
                You are modifying Virtual Account Setting for an existing
                account. Misconfiguration will impact the ability to correctly
                create virtual accounts.
              </Alert>
              <span>
                Updating Virtual Account Setting for {internalAccount.bestName}
              </span>
            </div>
          ) : (
            <span>
              Creating Virtual Account Setting for {internalAccount.bestName}
            </span>
          )}
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

export default VirtualAccountSettingFormSummary;
