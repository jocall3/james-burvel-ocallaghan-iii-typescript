// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { useFormikContext } from "formik";
import React, { useEffect, useState } from "react";
import {
  PaymentTypeEnum,
  usePaymentCutoffTimesLazyQuery,
  VendorIdEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { FormValues } from "../../constants/sweep_rule_form";

interface SweepRuleCutoffProps {
  managedAccountVendor: VendorIdEnum;
  managedAccountTimezone: string;
}

interface PaymentCutoffsFilterProps {
  vendorId: VendorIdEnum;
  paymentType: string;
  priority?: string;
}

interface CutoffTimes {
  hours: number;
  minutes: number;
}

function SweepRuleCutoff(props: SweepRuleCutoffProps) {
  const {
    values: { paymentType, priority },
  } = useFormikContext<FormValues>();

  const { setFieldValue } = useFormikContext();

  const { managedAccountVendor, managedAccountTimezone } = props;
  const [cutoffTimes, setCutoffTimes] = useState<CutoffTimes[]>([]);
  const [getPaymentCutoffTimes] = usePaymentCutoffTimesLazyQuery();

  useEffect(() => {
    const getCutoffTimes = async () => {
      if (!paymentType) {
        return;
      }

      const filters: PaymentCutoffsFilterProps = {
        vendorId: managedAccountVendor,
        paymentType,
      };

      if (paymentType === PaymentTypeEnum.Ach) {
        filters.priority = priority;
      }

      const { data } = await getPaymentCutoffTimes({ variables: filters });
      if (!data) {
        return;
      }

      const processedCutoffTimes = data.paymentCutoffTimes.cutoffTimes.map(
        (cutoffTime) => {
          const [hoursString, minutesString] = cutoffTime.split(":");
          const hours = parseInt(hoursString, 10);
          const minutes = parseInt(minutesString, 10);

          return { hours, minutes };
        },
      );

      setCutoffTimes(processedCutoffTimes);

      if (!processedCutoffTimes) {
        return;
      }

      if (
        processedCutoffTimes.length >= 0 &&
        processedCutoffTimes[0] !== undefined
      ) {
        // this is working to set the time correctly to pass to the backend
        // set the field value accordingly
        const { hours, minutes } = processedCutoffTimes[0];
        void setFieldValue("scheduledHour", hours - 1);
        void setFieldValue("scheduledMinutes", minutes);
      } else {
        void setFieldValue("scheduledHour", 9);
        void setFieldValue("scheduledMinutes", 0);
      }
    };

    void getCutoffTimes();
  }, [
    getPaymentCutoffTimes,
    managedAccountTimezone,
    managedAccountVendor,
    setCutoffTimes,
    paymentType,
    priority,
    setFieldValue,
  ]);

  const cutoff = (times: { hours: number; minutes: number }[]): string => {
    if (times.length >= 0 && times[0] !== undefined) {
      const { hours, minutes } = times[0];
      const hoursString = (hours - 1).toString().padStart(2, "0");
      const minutesString = minutes.toString().padStart(2, "0");
      return `${hoursString}:${minutesString} ${managedAccountTimezone}`;
    }
    return `09:00 ${managedAccountTimezone}`;
  };

  return (
    <div className="flex w-full flex-col justify-evenly">
      <div className="text-sm font-normal">Sweep Time </div>
      <div className="text-gray-500">{cutoff(cutoffTimes)}</div>
    </div>
  );
}

export default SweepRuleCutoff;
