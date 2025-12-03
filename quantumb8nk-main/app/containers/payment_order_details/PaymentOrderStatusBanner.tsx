// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import moment from "moment";
import React from "react";
import {
  PaymentOrderViewQuery,
  PaymentOrder__StatusEnum,
  usePaymentOrderEffectiveDateAndApprovalDeadlineQuery,
} from "../../../generated/dashboard/graphqlSchema";
import useUserTimezone from "../../../common/utilities/useUserTimezone";
import { Alert } from "../../../common/ui-components";
import { deadlineCalendarFormat } from "../../../common/utilities/formatDate";

interface PaymentOrderStatusBannerProps {
  paymentOrder: NonNullable<PaymentOrderViewQuery["paymentOrder"]>;
}

function PaymentOrderStatusBanner({
  paymentOrder,
}: PaymentOrderStatusBannerProps): JSX.Element | null {
  const userTimezone = useUserTimezone();
  const currentTime = moment.tz(userTimezone);

  const { data } = usePaymentOrderEffectiveDateAndApprovalDeadlineQuery({
    variables: {
      paymentOrder: {
        direction: paymentOrder.direction,
        type: paymentOrder.type,
        effectiveDate: paymentOrder?.effectiveDate,
        originatingAccountId: paymentOrder.originatingAccountId,
        receivingAccountId: paymentOrder.receivingAccountId,
        priority: paymentOrder.priority,
      },
    },
    skip: paymentOrder?.status !== PaymentOrder__StatusEnum.NeedsApproval,
  });

  const needsApproval =
    paymentOrder?.status === PaymentOrder__StatusEnum.NeedsApproval;
  const approved = paymentOrder?.status === PaymentOrder__StatusEnum.Approved;

  // Don't show banner if the PO is not in one of these statuses
  if (!needsApproval && !approved) {
    return null;
  }

  const expectedSentAt = paymentOrder?.currentPaymentOrderAttempt
    ?.expectedSentAt as string;
  const expectedCompletedAt = paymentOrder?.currentPaymentOrderAttempt
    ?.expectedCompletedAt as string;

  // Don't show banner if these fields don't exist on the POA
  if (approved && !expectedSentAt && !expectedCompletedAt) {
    return null;
  }

  /* 
    Customize moment calendar format which allows us to customize
    sameDay, nextDay, sameWeek, sameElse
  */
  deadlineCalendarFormat();

  const formatCalendarTime = (inputTime: moment.Moment) =>
    inputTime.calendar(currentTime, {
      sameDay: "[today at] h:mm A z",
      nextDay: "[tomorrow at] h:mm A z",
      sameWeek: "dddd [at] h:mm A z",
      sameElse: "dddd, MMMM Do [at] h:mm A z",
    });

  const expectedSentAtFormatted = (expectedSentAtInput?: string | null) => {
    const expectedSentAtWithZone = moment.tz(expectedSentAtInput, userTimezone);
    return formatCalendarTime(expectedSentAtWithZone);
  };

  const expectedCompletedAtFormatted = (
    expectedCompletedAtInput?: string | null,
  ) => {
    const expectedCompletedAtWithZone = moment.tz(
      expectedCompletedAtInput,
      userTimezone,
    );
    return formatCalendarTime(expectedCompletedAtWithZone);
  };

  const approvalDeadlineFormatted = (approvalDeadline?: string | null) => {
    const approvalDeadlineWithZone = moment.tz(approvalDeadline, userTimezone);
    return formatCalendarTime(approvalDeadlineWithZone);
  };

  const effectiveDateFormatted = (effectiveDate?: string | null) => {
    const effectiveDateWithZone = moment(effectiveDate);
    return effectiveDateWithZone.format("dddd, MMMM Do");
  };

  const approvalDeadline = data?.effectiveDateAndApprovalDeadline
    ?.approvalDeadline as string | null;
  const effectiveDate = data?.effectiveDateAndApprovalDeadline?.effectiveDate;

  const formatMessage = () => {
    if (needsApproval) {
      if (approvalDeadline === null) {
        return `Payment expected to arrive by ${effectiveDateFormatted(
          effectiveDate,
        )}`;
      }

      return `Approve this payment by ${approvalDeadlineFormatted(
        approvalDeadline,
      )} and
      expect it to arrive by ${effectiveDateFormatted(effectiveDate)}`;
    }

    return `This payment is expected to be sent by ${expectedSentAtFormatted(
      expectedSentAt,
    )} and expected to be completed by ${expectedCompletedAtFormatted(
      expectedCompletedAt,
    )}`;
  };

  return (
    <div className="mb-4">
      <Alert alertType="info">{formatMessage()}</Alert>
    </div>
  );
}

export default PaymentOrderStatusBanner;
