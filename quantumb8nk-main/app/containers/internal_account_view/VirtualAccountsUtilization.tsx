// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { LoadingLine } from "../../../common/ui-components";
import { useVirtualAccountsUtilizationQuery } from "../../../generated/dashboard/graphqlSchema";

interface VirtualAccountsUtilizationProps {
  internalAccountId: string;
}

function VirtualAccountsUtilization({
  internalAccountId,
}: VirtualAccountsUtilizationProps) {
  const { data, loading } = useVirtualAccountsUtilizationQuery({
    variables: {
      internalAccountId,
    },
  });
  const utilization = data?.virtualAccountsUtilization;

  if (!utilization || loading) {
    return (
      <div className="flex h-6 w-auto">
        <LoadingLine noHeight />
      </div>
    );
  }

  let numAvailable: number | undefined;
  let percentUsed = "";
  if (
    utilization.numAccountsAllocated !== undefined &&
    utilization.numAccountsAllocated !== null &&
    Number(utilization.numAccountsAllocated) >=
      Number(utilization.numAccountsUsed)
  ) {
    numAvailable =
      Number(utilization.numAccountsAllocated) -
      Number(utilization.numAccountsUsed);
    percentUsed =
      Number(utilization.numAccountsUsed) > 0
        ? `(${(
            (Number(utilization.numAccountsUsed) /
              Number(utilization.numAccountsAllocated)) *
            100
          ).toFixed(2)}%)`
        : "";
  }

  return (
    <div className="flex h-6 w-auto">
      {numAvailable !== undefined &&
        utilization.numAccountsAllocated !== undefined &&
        utilization.numAccountsAllocated !== null &&
        `${numAvailable} available out of ${Number(
          utilization.numAccountsAllocated,
        )} ${percentUsed}`}
      {(utilization.numAccountsAllocated === null ||
        numAvailable === undefined) && <>{utilization?.numAccountsUsed} used</>}
    </div>
  );
}

export default VirtualAccountsUtilization;
