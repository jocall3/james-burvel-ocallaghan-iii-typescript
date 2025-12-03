// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useEffect } from "react";
import { useFormikContext } from "formik";
import moment from "moment-timezone";
import { debounce } from "lodash";
import { FormValues } from "../../constants/payment_order_form";
import { Alert } from "../../../common/ui-components";
import {
  DirectionEnum,
  PaymentTypeEnum,
  usePaymentOrderEffectiveDateAndApprovalDeadlineLazyQuery,
} from "../../../generated/dashboard/graphqlSchema";
import useUserTimezone from "../../../common/utilities/useUserTimezone";
import { deadlineCalendarFormat } from "../../../common/utilities/formatDate";

function PaymentOrderEffectiveDateAndApprovalDeadline() {
  const {
    values: {
      paymentType,
      priority,
      originatingAccountId,
      receivingAccountId,
      effectiveDate: rawPaymentDate,
      processAfter,
      direction,
    },
  } = useFormikContext<FormValues>();
  const userTimezone = useUserTimezone();

  const [getPaymentOrderEffectiveDateAndApprovalDeadline, { data }] =
    usePaymentOrderEffectiveDateAndApprovalDeadlineLazyQuery();

  const effectiveDate = data?.effectiveDateAndApprovalDeadline
    ?.effectiveDate as string | null;
  const approvalDeadline = data?.effectiveDateAndApprovalDeadline
    ?.approvalDeadline as string | null;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getLastCutoffAndEffectiveDate = useCallback(
    debounce(
      (
        directionValue: string,
        paymentTypeValue: string,
        rawPaymentDateValue: string | null,
        originating: string,
        receiving: string,
        processAfterValue?: string | null,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        priority?: string,
      ) => {
        void getPaymentOrderEffectiveDateAndApprovalDeadline({
          variables: {
            paymentOrder: {
              direction: directionValue as DirectionEnum,
              type: paymentTypeValue as PaymentTypeEnum,
              effectiveDate: rawPaymentDateValue,
              originatingAccountId: originating,
              receivingAccountId: receiving,
              processAfter: processAfterValue,
              priority,
            },
          },
        });
      },
      500,
    ),
    [],
  );

  useEffect(() => {
    if (
      direction &&
      paymentType &&
      originatingAccountId &&
      receivingAccountId &&
      userTimezone
    ) {
      getLastCutoffAndEffectiveDate(
        direction,
        paymentType as string,
        rawPaymentDate,
        originatingAccountId,
        receivingAccountId,
        processAfter,
        priority as string,
      );
    }
  }, [
    getLastCutoffAndEffectiveDate,
    direction,
    paymentType,
    priority,
    originatingAccountId,
    receivingAccountId,
    rawPaymentDate,
    processAfter,
    userTimezone,
  ]);

  // All times in user timezone
  const currentTime = moment.tz(userTimezone);
  const approvalDeadlineWithZone = moment.tz(approvalDeadline, userTimezone);
  const effectiveDateWithZone = moment(effectiveDate);
  const effectiveDateFormatted = effectiveDateWithZone.format("dddd, MMMM Do");

  // Date calculations
  const closeToApprovalDeadline =
    approvalDeadlineWithZone.diff(currentTime, "hours") <= 2;
  // Calculating using vendor timezone - Or else there are discrepancies between time zones
  // e.g. 11:49 PM (PST) == 2:49 AM (EST) next day
  // If we use the user timezone, the user in EST will think they missed their 2:49 AM approvalDeadline
  const pastTodaysApprovalDeadline =
    moment(rawPaymentDate).isSame(moment(), "day") &&
    moment(approvalDeadline).isAfter(moment(), "day");

  const formatDateMessage = () => {
    if (approvalDeadline === null) {
      return `Payment expected to arrive by ${effectiveDateFormatted}`;
    }

    if (pastTodaysApprovalDeadline) {
      return `It is past the last bank cutoff window for today. Create this payment now and expect it to arrive by ${effectiveDateFormatted}`;
    }

    if (closeToApprovalDeadline) {
      const approvalDeadlineMsg = `${approvalDeadlineWithZone.calendar(
        currentTime,
        {
          sameDay: "[by] h:mm A z",
        },
      )}`;

      return `Create this payment ${approvalDeadlineMsg} and expect it to arrive by ${effectiveDateFormatted}`;
    }

    /* 
      Customize moment calendar format which allows us to customize
      sameDay, nextDay, sameWeek, sameElse
    */
    deadlineCalendarFormat();

    const approvalDeadlineMsg = `${approvalDeadlineWithZone.calendar(
      currentTime,
      {
        sameDay: "[by today] h:mm A z",
        nextDay: "[by tomorrow] h:mm A z",
        sameWeek: "[by] dddd h:mm A z",
        sameElse: "[by] dddd, MMMM Do h:mm A z",
      },
    )}`;

    return `Create this payment ${approvalDeadlineMsg} and expect it to arrive by ${effectiveDateFormatted}`;
  };

  if (!effectiveDate) return null;

  return <Alert alertType="info">{formatDateMessage()}</Alert>;
}

export default PaymentOrderEffectiveDateAndApprovalDeadline;
