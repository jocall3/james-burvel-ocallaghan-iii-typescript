// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useAccountCollectionEmbeddableFlowDemoQuery } from "../../../generated/dashboard/graphqlSchema";
import { KeyValueTableSkeletonLoader } from "../../../common/ui-components";
import EmbeddableFlowDemo from "../EmbeddableFlowDemo";
import NotFound from "../../../errors/components/NotFound";

interface AccountCollectionEmbeddableFlowDemoProps {
  match: {
    params: {
      id: string;
    };
  };
}

function AccountCollectionEmbeddableFlowDemo({
  match: {
    params: { id },
  },
}: AccountCollectionEmbeddableFlowDemoProps) {
  const { data, loading, error } = useAccountCollectionEmbeddableFlowDemoQuery({
    variables: {
      id,
    },
  });

  if (loading && !data?.accountCollectionFlow) {
    return (
      <div className="pt-8">
        <KeyValueTableSkeletonLoader />
      </div>
    );
  }

  if (error || !data?.accountCollectionFlow) {
    return <NotFound message="Error Loading Account Collection Flow" />;
  }

  const { clientToken } = data.accountCollectionFlow;

  return <EmbeddableFlowDemo clientToken={clientToken} />;
}

export default AccountCollectionEmbeddableFlowDemo;
