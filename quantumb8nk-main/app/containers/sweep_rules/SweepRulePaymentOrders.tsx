// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PaymentOrdersForAssociatedEntityDocument } from "../../../generated/dashboard/graphqlSchema";
import { PAYMENT_ORDER } from "../../../generated/dashboard/types/resources";
import ListView from "../../components/ListView";

export default function SweepRulePaymentOrders({
  sweepRuleId,
}: {
  sweepRuleId: string;
}) {
  return (
    <ListView
      graphqlDocument={PaymentOrdersForAssociatedEntityDocument}
      resource={PAYMENT_ORDER}
      constantQueryVariables={{
        sweepRuleId,
      }}
      enableExportData
      exportDataParams={{
        params: {
          sweep_rule_id: sweepRuleId,
        },
      }}
    />
  );
}
