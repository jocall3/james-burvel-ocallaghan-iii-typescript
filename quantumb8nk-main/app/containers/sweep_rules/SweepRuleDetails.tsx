// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "~/common/utilities/cn";
import {
  Alert,
  DateTime,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
} from "../../../common/ui-components";
import { SweepRuleViewQuery } from "../../../generated/dashboard/graphqlSchema";
import { balanceFormatter } from "./utilities";
import {
  PRETTY_PAYMENT_TYPE_MAPPING,
  PRETTY_PAYMENT_TYPE_MAPPING_WITH_PRIORITY,
} from "../../constants";
import { formatAmount } from "../../../common/utilities/formatAmount";

export default function SweepRuleDetails({
  loading,
  sweepRule,
}: {
  loading: boolean;
  sweepRule?: SweepRuleViewQuery["sweepRule"];
}) {
  const MAPPING = {
    id: "ID",
    managedAccount: "Target Balance Account",
    supportingAccount: "Supporting Account",
    paymentType: "Payment Type",
    targetBalance: "Target Balance",
    description: "Description",
    minSweepAmount: "Min Sweep Amount",
    maxSweepAmount: "Max Sweep Amount",
    nextSweep: "Next Sweep Date",
    scheduleDescription: "Schedule",
    active: "Active",
  };

  const managedAccount = sweepRule?.managedAccount;
  const supportingAccount = sweepRule?.supportingAccount;
  const currency = managedAccount?.currency ?? "USD";
  const paymentType = sweepRule?.paymentType;
  const priority = sweepRule?.priority;
  const prettyPaymentTypeWithPriority =
    paymentType && priority
      ? PRETTY_PAYMENT_TYPE_MAPPING_WITH_PRIORITY[
          `${paymentType}_${priority}`
        ] ||
        PRETTY_PAYMENT_TYPE_MAPPING[paymentType] ||
        paymentType.toUpperCase()
      : undefined;

  const sweepRuleData = {
    id: sweepRule?.id,
    paymentType: prettyPaymentTypeWithPriority,
    managedAccount: managedAccount?.longName,
    supportingAccount: supportingAccount?.longName,
    targetBalance: formatAmount(sweepRule?.targetBalance as number, currency),
    description: sweepRule?.description,
    minSweepAmount: sweepRule?.minSweepAmount
      ? balanceFormatter(sweepRule?.minSweepAmount as number, currency)
      : undefined,
    maxSweepAmount: sweepRule?.maxSweepAmount
      ? balanceFormatter(sweepRule?.maxSweepAmount as number, currency)
      : undefined,
    nextSweep: sweepRule?.schedule?.nextOccurrence ? (
      <DateTime timestamp={sweepRule?.schedule?.nextOccurrence} />
    ) : null,
    scheduleDescription: sweepRule?.schedule?.description,
    active: sweepRule?.pausedAt ? "No" : "Yes",
  };

  const lastPaymentOrder = sweepRule?.lastPaymentOrder;
  const sweepInProgress =
    lastPaymentOrder && lastPaymentOrder?.status !== "completed";

  return (
    <div className="sticky top-4 mt-4 bg-background-default mint-lg:mt-0">
      {loading && <KeyValueTableSkeletonLoader dataMapping={MAPPING} />}

      {sweepRule !== undefined && (
        <div
          id="payment-order-details-panel"
          className={cn("grid rounded-md border border-alpha-black-100 p-6")}
        >
          {sweepInProgress && (
            <Alert alertType="info" className="mb-4">
              <div className="gap-1">
                <span>Note: There is a </span>
                <Link to={sweepRule?.lastPaymentOrder?.path as string}>
                  Payment Order
                </Link>
                <span>{` for ${lastPaymentOrder?.prettyAmount} in progress for this Sweep Rule. This rule will not create any new Payment Orders until this one completes.`}</span>
              </div>
            </Alert>
          )}
          <div className="w-full rounded-md px-2 py-5">
            <KeyValueTable data={sweepRuleData} dataMapping={MAPPING} />
          </div>
        </div>
      )}
    </div>
  );
}
