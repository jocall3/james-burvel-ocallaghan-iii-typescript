// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { startCase } from "lodash";
import EntityTableView, {
  INITIAL_PAGINATION,
} from "../../components/EntityTableView";
import { CursorPaginationInput } from "../../types/CursorPaginationInput";
import ReversalStatusBadge from "../../components/ReversalStatusBadge";
import { useReversalsMiniViewQuery } from "../../../generated/dashboard/graphqlSchema";
import { DateTime } from "../../../common/ui-components";
import { REVERSAL } from "../../../generated/dashboard/types/resources";

export const REVERSAL_DATA_MAPPING = {
  internalAccount: "Account",
  reason: "Reason",
  reversalType: "Reversal Type",
  amount: "Amount",
  createdAt: "Created At",
  status: "Status",
};

interface ReversalsMiniViewProps {
  paymentOrderId: string;
}

function ReversalsMiniView({
  paymentOrderId,
}: ReversalsMiniViewProps): JSX.Element {
  const { loading, data, error, refetch } = useReversalsMiniViewQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      first: INITIAL_PAGINATION.perPage,
      paymentOrderId,
    },
  });

  const reversals =
    loading || !data || error
      ? []
      : data.reversals.edges.map(({ node }) => ({
          ...node,
          internalAccount: node.paymentOrder.accountName,
          createdAt: <DateTime timestamp={node.createdAt} />,
          amount: node.paymentOrderAttempt.prettyAmount,
          reason: startCase(node.reason),
          reversalType: node.reversalType.toUpperCase(),
          status: (
            <div className="flex flex-row justify-start">
              <ReversalStatusBadge status={node.status} keepCaseFormat />
            </div>
          ),
        }));

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
  }) => {
    const { cursorPaginationParams } = options;

    await refetch({
      ...cursorPaginationParams,
    });
  };

  return (
    <EntityTableView
      data={reversals}
      dataMapping={REVERSAL_DATA_MAPPING}
      loading={loading}
      onQueryArgChange={handleRefetch}
      cursorPagination={data?.reversals?.pageInfo}
      resource={REVERSAL}
    />
  );
}

export default ReversalsMiniView;
