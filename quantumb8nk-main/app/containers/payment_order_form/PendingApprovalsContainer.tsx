// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { useFormikContext } from "formik";
import { debounce, isNil } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";
import {
  CreationSourceEnum,
  ExternalAccount__StatusEnum,
  PaymentOrderPendingApprovalsQuery,
  PaymentTypeEnum,
  TriggeredRule,
  usePaymentOrderPendingApprovalsLazyQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { FormValues, KeyValuePair } from "../../constants/payment_order_form";
import { sanitizeMetadata } from "./PaymentOrderCreateUtils";
import PendingApprovals from "./PendingApprovals";
import sanitizeAmount, {
  getCurrencyDecimalScale,
} from "../../../common/utilities/sanitizeAmount";

function PendingApprovalsContainer() {
  const {
    values: {
      amount,
      paymentType,
      direction,
      metadata,
      originatingAccountId,
      receivingAccountId,
      currency,
      creationSource,
    },
  } = useFormikContext<FormValues>();

  const [getPendingApprovalsInternal] =
    usePaymentOrderPendingApprovalsLazyQuery();
  // Define seperate state for rules to prevent field from flashing when new rules are fetched.
  const [triggeredRules, setTriggeredRules] =
    useState<PaymentOrderPendingApprovalsQuery["triggeredRules"]>();
  const [externalAccount, setExternalAccount] = useState<
    PaymentOrderPendingApprovalsQuery["externalAccount"] | null
  >(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getPendingApprovals = useCallback(
    debounce(
      (
        amountValue: number,
        selectedPaymentType: PaymentTypeEnum,
        directionValue: string,
        originating: string,
        receiving: string,
        currencyValue?: string,
        metadataValue?: KeyValuePair[],
        creationSourceValue?: CreationSourceEnum | null,
      ) => {
        getPendingApprovalsInternal({
          variables: {
            paymentOrder: {
              amount: sanitizeAmount(
                amountValue,
                getCurrencyDecimalScale(currencyValue),
              ),
              type: selectedPaymentType,
              direction: directionValue,
              originatingAccountId: originating,
              receivingAccountId: receiving,
              metadata: metadataValue
                ? JSON.stringify(sanitizeMetadata(metadataValue))
                : null,
              creationSource: creationSourceValue,
            },
            receivingAccountId: receiving,
          },
        }).then(
          (result) => {
            setTriggeredRules(result.data?.triggeredRules);
            setExternalAccount(result.data?.externalAccount);
          },
          () => {},
        );
      },
      1000,
    ),
    [],
  );

  useEffect(() => {
    if (
      !isNil(amount) &&
      paymentType &&
      direction &&
      originatingAccountId &&
      receivingAccountId
    ) {
      getPendingApprovals(
        amount as number,
        paymentType,
        direction,
        originatingAccountId,
        receivingAccountId,
        currency,
        metadata,
        creationSource,
      );
    }
  }, [
    getPendingApprovals,
    amount,
    paymentType,
    direction,
    metadata,
    originatingAccountId,
    receivingAccountId,
    currency,
    creationSource,
  ]);

  const eaNeedsReview =
    externalAccount?.status === ExternalAccount__StatusEnum.NeedsApproval;

  const [
    advancedApprovalsPhase2EnabledData,
    advancedApprovalsPhase2Loading,
    advancedApprovalsPhase2Error,
  ] = useLiveConfiguration({ featureName: "advanced_approvals_phase_2" });

  const advancedApprovalsPhase2Enabled =
    (!advancedApprovalsPhase2Loading &&
      !advancedApprovalsPhase2Error &&
      (advancedApprovalsPhase2EnabledData as boolean)) ??
    false;
  return (
    <div>
      {triggeredRules?.needsApproval && triggeredRules?.rules && (
        <div className="rounded border border-alpha-black-100 bg-background-default">
          <PendingApprovals
            enableSequentialRules={advancedApprovalsPhase2Enabled}
            triggeredRules={triggeredRules?.rules as TriggeredRule[]}
            blockedExternalAccountPath={
              eaNeedsReview ? externalAccount?.path : undefined
            }
          />
        </div>
      )}
    </div>
  );
}

export default PendingApprovalsContainer;
