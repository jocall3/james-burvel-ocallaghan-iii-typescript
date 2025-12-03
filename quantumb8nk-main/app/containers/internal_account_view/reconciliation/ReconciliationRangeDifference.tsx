// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { formatAmount } from "../../../../common/utilities/formatAmount";

export default function ReconciliationRangeDifference(props: {
  min: number | bigint;
  max: number | bigint;
}): JSX.Element {
  /**
   * 0 - 1 Items have a difference up to 1
   * 1 - 1 Items have a difference of 1
   * 1 - 2 Items have a difference of 1 to 2
   */
  const { min, max } = props;

  let difference;

  if (typeof min === "bigint" && typeof max === "bigint") {
    difference = max - min;
  } else if (typeof min === "number" && typeof max === "number") {
    difference = max - min;
  }

  let content: JSX.Element | undefined;

  if (difference === 0) {
    content = (
      <span className="flex flex-row gap-1 font-normal">
        <span className="text-gray-500">Items have a difference of</span>
        <span className="font-medium">{formatAmount(min)}</span>
      </span>
    );
  } else if (min === 0) {
    content = (
      <span className="flex flex-row gap-1 font-normal">
        <span className="text-gray-500">
          Items have a potential difference up to
        </span>
        <span className="font-medium">{formatAmount(max)}</span>
      </span>
    );
  } else {
    content = (
      <span className="flex flex-row gap-1 font-normal">
        <span className="text-gray-500">Items have a difference of</span>
        <span className="font-medium">{formatAmount(min)}</span>
        <span className="font-normal">to</span>
        <span className="font-medium">{formatAmount(max)}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-row">
      {content}.&nbsp;
      <a
        href="https://docs.moderntreasury.com/platform/docs/reconciliation-overview"
        className="font-medium text-blue-500"
        target="_blank"
        rel="noreferrer"
      >
        Learn More
      </a>
    </div>
  );
}
