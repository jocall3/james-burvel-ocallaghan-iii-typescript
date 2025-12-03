// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PRETTY_PAYMENT_TYPE_MAPPING } from "~/app/constants";
import { Button, HorizontalRule } from "~/common/ui-components";
import {
  DirectionEnum,
  PaymentTypeEnum,
} from "~/generated/dashboard/graphqlSchema";

interface CapabilityPreview {
  paymentType: PaymentTypeEnum | null;
  direction: DirectionEnum | null;
  internalAccount: {
    bestName: string;
  };
}

interface AccountCapabilityFormSummaryProps {
  submitDisabled: boolean;
  isEdit: boolean;
  previewData: CapabilityPreview;
}

function prettifyDirection(direction: DirectionEnum | null) {
  switch (direction) {
    case DirectionEnum.Credit:
      return "Credit";
    case DirectionEnum.Debit:
      return "Debit";
    default:
      return "";
  }
}

export default function AccountCapabilityFormSummary({
  submitDisabled,
  isEdit,
  previewData: {
    paymentType,
    direction,
    internalAccount: { bestName },
  },
}: AccountCapabilityFormSummaryProps) {
  const prettyPaymentType = paymentType
    ? PRETTY_PAYMENT_TYPE_MAPPING[paymentType]
    : "";
  const prettyDirection = prettifyDirection(direction);

  let description = isEdit ? "Updating" : "Creating";
  description += ` ${prettyPaymentType} ${prettyDirection} capability for ${bestName}`;

  return (
    <div>
      <div className="sticky top-4 mt-4 rounded border bg-background-default mint-lg:mt-0">
        <div className="grid gap-y-2 p-6">
          <div className="mb-2 text-xs text-text-muted">
            Account Capability Summary
          </div>
          {description}
        </div>
        <HorizontalRule />
        <div className="flex justify-end px-6 py-4">
          <Button buttonType="primary" disabled={submitDisabled} isSubmit>
            {isEdit ? "Save Changes" : "Create Capability"}
          </Button>
        </div>
      </div>
    </div>
  );
}
