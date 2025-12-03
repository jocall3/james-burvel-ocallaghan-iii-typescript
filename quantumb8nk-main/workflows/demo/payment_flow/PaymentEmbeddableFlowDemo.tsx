// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { usePaymentEmbeddableFlowDemoQuery } from "../../../generated/dashboard/graphqlSchema";
import { KeyValueTableSkeletonLoader } from "../../../common/ui-components";
import EmbeddableFlowDemo from "../EmbeddableFlowDemo";
import NotFound from "../../../errors/components/NotFound";

interface PaymentEmbeddableFlowDemoProps {
  match: {
    params: {
      id: string;
    };
  };
}

function PaymentEmbeddableFlowDemo({
  match: {
    params: { id },
  },
}: PaymentEmbeddableFlowDemoProps) {
  const { data, loading, error } = usePaymentEmbeddableFlowDemoQuery({
    variables: {
      id,
    },
  });

  if (loading && !data?.paymentFlow) {
    return (
      <div className="pt-8">
        <KeyValueTableSkeletonLoader />
      </div>
    );
  }

  if (error || !data?.paymentFlow) {
    return <NotFound message="Error Loading Payment Flow" />;
  }

  const { clientToken } = data.paymentFlow;

  return <EmbeddableFlowDemo clientToken={clientToken} />;
}

export default PaymentEmbeddableFlowDemo;
